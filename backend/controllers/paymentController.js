
import pool from "../connections/db.cjs";
import { sendEmail } from "./emailVerificationsController.js";
import crypto from "crypto"



// Function to create a subaccount for a landlord (if not already created)
const createSubaccount = async (landlordDetails) => {
  const { account_name, account_number, bank_name } = landlordDetails;
  console.log("landlord details:", landlordDetails)

  // Validate required fields
  if (!account_name || !account_number || !bank_name) {
      throw new Error("Missing required bank details: account_name, account_number, or bank_name");
  }

  try {
      const response = await fetch("https://api.paystack.co/subaccount", {
          method: "POST",
          headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              business_name: `${account_name} - Landlord`,
              settlement_bank: bank_name,
              account_number: account_number,
              percentage_charge: 0, // Set to 0 since splits will be handled manually
          }),
      });

      if (!response.ok) {
          const errorData = await response.json();
          console.error("Error creating subaccount:", errorData);
          throw new Error("Failed to create subaccount");
      }

      const data = await response.json();
      return data.data.subaccount_code; // Return the subaccount code
  } catch (error) {
      console.error("Error creating subaccount:", error);
      throw error;
  }
};

  // Function to fetch or create a landlord's subaccount code
  const getLandlordSubaccountCode = async (booking_id) => {
    try {
        // Fetch landlord details from the database
        const result = await pool.query(
            `
            SELECT 
                ld.subaccount_code,
                ld.bank_name,
                ld.account_number,
                ld.account_name
            FROM bookings b
            JOIN hostels h ON b.hostel_id = h.id
            JOIN landlord_documents ld ON h.manager_id = ld.manager_id
            WHERE b.booking_id = $1
            `,
            [booking_id]
        );

        const landlordDetails = result.rows[0];

        if (!landlordDetails) {
            throw new Error("Landlord details not found");
        }

        // Check if subaccount already exists
        if (landlordDetails.subaccount_code) {
          console.log("landlord subaccount:", landlordDetails.subaccount_code)
            return landlordDetails.subaccount_code;
            
        }

        // Validate required bank details
        const { bank_name, account_number, account_name } = landlordDetails;
        if (!bank_name || !account_number || !account_name) {
            throw new Error("Incomplete bank details for landlord");
        }

        // Create a new subaccount
        const subaccountCode = await createSubaccount({
            account_name,
            account_number,
            bank_name,
        });

        // Update the database with the new subaccount code
        await pool.query(
            `
            UPDATE landlord_documents
            SET subaccount_code = $1
            WHERE id = $2
            `,
            [subaccountCode, landlordDetails.id]
        );

        return subaccountCode;
    } catch (error) {
        console.error("Error fetching or creating subaccount:", error);
        throw error;
    }
};

// Get all payments for a user
export const getUserPayments = async (req, res) => {
  const userId = req.user.userid;

  try {
    const result = await pool.query(
          `
            SELECT 
                p.payment_id AS payment_id,
                p.payment_status,
                p.user_id,
                p.payment_method,
                p.provider,
                p.booking_id AS booking_id,
                p.transaction_id,
                b.booking_id AS booking_id,
                b.hostel_fee,
                b.amount_paid,
                b.total_price,
                h.name
            FROM payments p
            JOIN bookings b ON b.booking_id = b.booking_id
            JOIN rooms r ON b.room_id = r.id
            JOIN hostels h ON r.hostel_id = h.id
            WHERE p.user_id = $1 
            `
        , [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments", error });
    console.error("Error fetching payments:", error)
  }
};

// Get payments for a specific booking
export const getBookingPayments = async (req, res) => {
  const { booking_id } = req.params;

  try {
    const result = await pool.query(`SELECT * FROM payments WHERE booking_id = $1 ORDER BY created_at DESC`, [booking_id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments", error });
  }
};


export const payStackInitController = async (req, res) => {
    const { booking_id, user_id, amount, user_email, payment_method, provider, phone_number } = req.body;
    console.log("request body:", req.body);
  
    try {
      if (!booking_id || !user_id || !amount || !user_email) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      const existingPayment = await pool.query(
        `SELECT * FROM payments WHERE booking_id = $1 AND payment_status = 'pending'`,
        [booking_id]
      );
      if (existingPayment.rows.length > 0) {
        return res.status(400).json({
          message: "A payment has already been initialized for this booking.",
          existing_payment: existingPayment.rows[0],
        });
      }
  
      const transactionId = `TNX_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  
      // Fetch booking details to calculate splits
      const bookingResult = await pool.query(
        `SELECT hostel_fee, platform_fee, estimated_paystack_fee FROM bookings WHERE booking_id = $1`,
        [booking_id]
      );
      const { hostel_fee, platform_fee, estimated_paystack_fee } = bookingResult.rows[0];
  
      // Fetch landlord subaccount code
      const landlord_subaccount_code = await getLandlordSubaccountCode(booking_id);
  
      // Your platform's subaccount code (hardcoded)
      const your_subaccount_code = "ACCT_kqh68eqwsj3a8wq";
  
      // Calculate percentages for splits
      const totalAmount = Number(hostel_fee) + Number(platform_fee);
      const landlordShare = (hostel_fee / totalAmount) * 100;
      const platformShare = (platform_fee / totalAmount) * 100;
  
      // Store the payment in the database with a "pending" status
      await pool.query(
        `INSERT INTO payments (booking_id, user_id, user_email, transaction_id, amount, payment_method, provider, payment_status, currency) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', 'GHS')`,
        [booking_id, user_id, user_email, transactionId, amount, payment_method, provider]
      );
  
      // Prepare data for Paystack request
      let paystackData = {
        email: user_email,
        amount: amount * 100, // Convert to pesewas
        currency: "GHS",
        metadata: { booking_id, user_id },
        reference: transactionId,
        callback_url: req.body.callback_url,
        split: {
          type: "percentage", // Or "flat" depending on your preference
          bearer_type: "subaccount", // Who bears the Paystack fee (student in this case)
          bearer_subaccount: landlord_subaccount_code,
          subaccounts: [
            {
              subaccount: landlord_subaccount_code, // Landlord's subaccount code
              share: landlordShare, // Percentage of the hostel_fee
            },
            {
              subaccount: your_subaccount_code, // Your platform's subaccount code
              share: platformShare, // Percentage of the platform_fee
            },
          ],
        },
      };
  
      console.log("paystack payload:", paystackData);
  
      if (payment_method === "mobile_money") {
        paystackData.mobile_money = {
          phone: phone_number,
          provider: provider.toLowerCase(),
        };
      }
  
      // Request checkout URL from Paystack
      try {
        const response = await fetch("https://api.paystack.co/transaction/initialize", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paystackData),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Paystack API Error:", errorData);
          return res.status(response.status).json({ message: "Error initializing payment:", error: errorData });
        }
  
        const data = await response.json();
        res.status(200).json({ checkout_url: data.data.authorization_url });
      } catch (error) {
        console.error("Error initializing payment:", error);
        res.status(500).json({ message: "Error initializing payment:", error });
      }
    } catch (error) {
      console.error("Error initializing payment:", error);
      res.status(500).json({ message: "Error initializing payment", error });
    }
  };


  export const verifyPayment = async (req, res) => {
    const { reference } = req.query;
  
    try {
      // Verify payment status using Paystack API
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Paystack API Error:", errorData);
        return res.status(response.status).json({ message: "Payment verification failed:", error: errorData });
      }
  
      const data = await response.json();
      const { status, amount, currency, customer, metadata } = data.data;
  
      if (status === "success") {
        const { booking_id, user_id } = metadata;
        const email = customer.email;
  
        // Ensure the amount is properly formatted
        const formattedAmount = parseFloat((amount / 100).toFixed(2)); // Convert from kobo to GHS
  
        // Update the existing payment record
        await pool.query(
          `UPDATE payments 
           SET payment_status = 'successfull', amount = $1, currency = $2, user_email = $3 
           WHERE transaction_id = $4`,
          [formattedAmount, currency, email, reference]
        );
  
        // Fetch total price and current amount paid
        const bookingRes = await pool.query(`SELECT total_price, amount_paid, hostel_id, room_id FROM bookings WHERE booking_id = $1`, [booking_id]);
        const { total_price, amount_paid, hostel_id, room_id } = bookingRes.rows[0];

        console.log("booking response:", bookingRes.rows[0])
        const safeAmountPaid = Number(amount_paid) || 0;
        const newTotalPaid = safeAmountPaid + formattedAmount;
        console.log("new total amount", newTotalPaid)
  
        // Update the amount paid
        await pool.query(`UPDATE bookings SET amount_paid = $1 WHERE booking_id = $2`, [newTotalPaid, booking_id]);
  
        let emailMessage;
        if (newTotalPaid >= total_price) {
          // Mark booking as confirmed when fully paid
          await pool.query(
            `UPDATE bookings SET payment_status = 'paid', booking_status = 'confirmed' WHERE booking_id = $1`,
            [booking_id]
          );
          emailMessage = `
            <h3>Your booking is now fully paid and confirmed! 🎉</h3>
            <p>Booking ID: ${booking_id}</p>
            <p>Amount Paid: GHS${newTotalPaid}</p>
            <p>Status: ✅ Confirmed</p>
            <p>Thank you for booking with us!</p>
          `;
        } else {
          // Notify student of remaining balance
          const remainingBalance = total_price - newTotalPaid;
          emailMessage = `
            <h3>Your payment has been received! ✅</h3>
            <p>Booking ID: ${booking_id}</p>
            <p>Amount Paid: GHS${formattedAmount}</p>
            <p>Total Paid So Far: GHS${newTotalPaid}</p>
            <p>Remaining Balance: <strong>GHS${remainingBalance}</strong></p>
            <p>Please complete your payment before check-in.</p>
          `;
        }
  
        // Send email notification
        await sendEmail(email, "Payment Update", emailMessage);
  
        // Notification logic for landlord
        try {
          // Fetch landlord ID
          const landlordResult = await pool.query(`SELECT manager_id FROM hostels WHERE id = $1`, [hostel_id]);
          const landlord_id = landlordResult.rows[0]?.manager_id;
          console.log("landlord id:", landlord_id)
  
          if (!landlord_id) {
            console.error(`Landlord not found for booking_id: ${booking_id}`);
            return res.status(400).json({ message: "Landlord not found" });
          }
  
          // Fetch student name
          const studentResult = await pool.query(
            `SELECT firstname || ' ' || lastname AS fullname FROM users WHERE userid = $1`,
            [user_id]
          );
          const student_name = studentResult.rows[0]?.fullname;
  
          // Fetch hostel name
          const hostelResult = await pool.query(`SELECT name FROM hostels WHERE id = $1`, [hostel_id]);
          const hostel_name = hostelResult.rows[0]?.name;
  
          // Fetch room number
          const roomResult = await pool.query(`SELECT room_number FROM rooms WHERE id = $1`, [room_id]);
          const room_number = roomResult.rows[0]?.room_number;
  
          // Insert notification for landlord
          await pool.query(
            `INSERT INTO notifications (landlord_id, type, title, message, student_name, student_id, hostel_name, room_number, is_read, booking_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              landlord_id,
              "payment",
              "Payment Received",
              `A payment of GHS ${formattedAmount} has been made by ${student_name}.`,
              student_name,
              user_id,
              hostel_name,
              room_number,
              false, // is_read
              booking_id,
            ]
          );
        } catch (error) {
          console.error("Error inserting notification:", error);
        }
  
        return res.status(200).json({ message: "Payment verified and recorded successfully" });
      } else {
        return res.status(400).json({ message: "Payment verification failed" });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ message: "Error verifying payment", error });
    }
  };

  
  
  