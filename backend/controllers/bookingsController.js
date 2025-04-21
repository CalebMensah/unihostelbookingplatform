import pool from "../connections/db.cjs";

export const createBooking = async (req, res) => {
    const { room_id, start_date, end_date, amount_paid, hostel_fee, user_id, payment_status, booking_status, hostel_id } = req.body;
    console.log("request body:", req.body);
    const platform_fee = 15.00;
    const estimated_paystack_fee = (hostel_fee + platform_fee) * 0.0195 + 2.50;
    const total_price = hostel_fee + platform_fee + estimated_paystack_fee;

    if (!user_id || !room_id || !start_date || !end_date || !total_price || amount_paid === undefined) {
        return res.status(400).json({
            message: "Missing required fields",
            received: { user_id, room_id, start_date, end_date, total_price, platform_fee, estimated_paystack_fee, amount_paid, hostel_id, payment_status, booking_status }
        });
    }

    try {
        await pool.query("BEGIN");

        // Check if room is already booked
        const existingBooking = await pool.query(
            `SELECT * FROM bookings WHERE room_id = $1 AND booking_status = 'confirmed' 
             AND (start_date <= $2 AND end_date >= $3)`,
            [room_id, start_date, end_date]
        );
        if (existingBooking.rows.length > 0) {
            await pool.query("ROLLBACK");
            return res.status(400).json({ message: "Room already booked for this period" });
        }

        // Insert booking
        const result = await pool.query(
            `INSERT INTO bookings (room_id, start_date, end_date, hostel_fee, amount_paid, payment_status, booking_status, platform_fee, estimated_paystack_fee, total_price, user_id, hostel_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,$12) RETURNING *`,
            [room_id, start_date, end_date, hostel_fee, amount_paid, payment_status, booking_status, platform_fee, estimated_paystack_fee, total_price, user_id, hostel_id]
        );

        await pool.query("COMMIT");
        console.log("Booking created successfully:", result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        await pool.query("ROLLBACK");
        console.error("Error creating booking:", error);
        res.status(500).json({
            message: "Error creating booking",
            error: error.message
        });
    }
};


export const updateBooking = async (req, res) => {
    const { id } = req.params;
    const { start_date, end_date, total_price, booking_status, payment_status } = req.body;

    try {
        // Update booking
        const result = await pool.query(
            `UPDATE bookings SET 
            start_date = $1, 
            end_date = $2, 
            total_price = $3, 
            booking_status = $4,
            payment_status = $5
            WHERE id = $6 
            RETURNING *`,
            [start_date, end_date, total_price, booking_status, payment_status, id]
        );

        const booking = result.rows[0];

        // Fetch landlord ID
        const landlordResult = await pool.query(`SELECT manager_id FROM hostels WHERE id = $1`, [hostel_id]);
        const landlord_id = landlordResult.rows[0]?.manager_id;

        // Fetch student name
        const studentResult = await pool.query(`SELECT firstname || " " || lastname AS fullname FROM users WHERE id = $1`, [user_id]);
        const student_name = studentResult.rows[0]?.fullname;

        // Fetch hostel name
        const hostelResult = await pool.query(`SELECT name FROM hostels WHERE id = $1`, [booking.hostel_id]);
        const hostel_name = hostelResult.rows[0]?.name;

        // Fetch room number
        const roomResult = await pool.query(`SELECT room_number FROM rooms WHERE id = $1`, [booking.room_id]);
        const room_number = roomResult.rows[0]?.room_number;

        if (landlord_id) {
            // Insert notification for landlord
            await pool.query(
                `INSERT INTO notifications (user_id, type, title, message, timestamp, student_name, student_id, hostel_name, room_number, amount, booking_id)
                 VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, $8, $9, $10)`,
                [
                    landlord_id,
                    "Booking Updated",
                    "Booking Updated Notification",
                    `Booking ${id} has been updated for room ${room_number} by ${student_name}.`,
                    student_name,
                    booking.user_id,
                    hostel_name,
                    room_number,
                    total_price,
                    id
                ]
            );
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Error updating booking", error });
    }
};

export const deleteBooking = async (req, res) => {
    const id = req.params.id;
    console.log("id from params:", id);

    if (!id) {
        return res.status(400).json({ message: "Booking ID is required" });
    }

    try {
        // Check if the booking exists
        const result = await pool.query('SELECT * FROM bookings WHERE booking_id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Delete the booking
        await pool.query('DELETE FROM bookings WHERE booking_id = $1', [id]);

        res.json({ message: "Booking deleted successfully" });
    } catch (error) {
        console.error("Error deleting booking:", error);
        res.status(500).json({ message: "Error deleting booking", error });
    }
};

export const getBookingById = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            `SELECT * FROM bookings WHERE id = $1`,
            [id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Error fetching booking", error });
    }
};

export const getManagerBookings = async (req, res) => {
    const manager_id = req.user.id;
    const { limit = 10 } = req.query;

    try {
        console.log('Fetching bookings for manager:', manager_id);
        
        const result = await pool.query(`
            SELECT 
                b.booking_id AS booking_id,
                u.firstName || ' ' || u.lastName AS full_name,
                u.userId,
                u.phone,
                r.room_number,
                r.floor,
                r.capacity AS occupants,
                r.status AS room_status,
                b.start_date,
                b.end_date,
                b.total_price,
                b.booking_status,
                b.payment_status,
                b.amount_paid,
                b.created_at
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            JOIN hostels h ON r.hostel_id = h.id
            JOIN users u ON b.user_id = u.userid
            WHERE h.manager_id = $1
            LIMIT $2;
        `, [manager_id, limit]);

        console.log(`Found ${result.rows.length} bookings for manager ${manager_id}`);
        res.json(result.rows);
    } catch (error) {
        console.error('Error in getManagerBookings:', error);
        res.status(500).json({ 
            message: "Error fetching bookings", 
            error: error.message,
            details: "Please ensure you have the correct permissions and try again."
        });
    }
};

export const getStudentBookings = async (req, res) => {
    const studentId = req.user.userid;
    console.log("user id:", studentId)

    try {

        const result = await pool.query(
            `
            SELECT 
                b.booking_id AS booking_id,
                u.userId,
                b.user_id,
                u.email,
                r.room_number,
                r.floor,
                r.status AS room_status,
                b.start_date,
                b.end_date,
                b.hostel_fee,
                b.booking_status,
                b.payment_status,
                b.amount_paid,
                b.platform_fee,
                b.estimated_paystack_fee,
                b.total_price,
                h.name
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            JOIN hostels h ON r.hostel_id = h.id
            JOIN users u ON b.user_id = u.userid
            WHERE b.user_id = $1 
            `, [studentId]
        )
        res.json(result.rows)
    } catch (error) {
        console.error('Error in getStudentBookings:', error);
        res.status(500).json({ 
            message: "Error fetching student bookings", 
            error: error.message,
            details: "Please ensure you have the correct permissions and try again."
        });
    }
}

export const getStudentBooking = async (req, res) => {
    const userId = req.user.userid; // Assuming user ID is extracted from JWT token
  
    try {
      const query = `
        SELECT 
          b.booking_id AS id,
          h.name AS hostelName,
          r.room_number AS roomNumber,
          r.floor AS floor,
          TO_CHAR(b.start_date AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS checkInDate,
          TO_CHAR(b.end_date AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS checkOutDate,
          b.booking_status AS status,
          b.amount_paid AS amount,
          b.payment_status AS paymentStatus,
          TO_CHAR(b.start_date AT TIME ZONE 'UTC', 'YYYY-MM-DD')  AS bookingDate
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        JOIN hostels h ON b.hostel_id = h.id
        WHERE b.user_id = $1
        ORDER BY b.start_date DESC
      `;
      const result = await pool.query(query, [userId]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "No bookings found." });
      }
  
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching student bookings:", error);
      res.status(500).json({ message: "Server error.", error: error.message });
    }
  };

  export const getLandlordBookings = async (req, res) => {
    const manager_id = req.user.id; // Assuming user ID is extracted from JWT token
  
    try {
      const query = `
        SELECT 
          b.booking_id AS id,
          u.firstname || ' ' || u.lastname AS studentName,
          u.userid AS studentId,
          h.name AS hostelName,
          r.room_number AS roomNumber,
          TO_CHAR(b.start_date AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS checkInDate,
          TO_CHAR(b.end_date AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS checkOutDate,
          b.payment_status AS paymentStatus,
          b.booking_status AS bookingStatus
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        JOIN hostels h ON r.hostel_id = h.id
        JOIN users u ON b.user_id = u.userid
        WHERE h.manager_id = $1
        ORDER BY b.start_date DESC
      `;
      const result = await pool.query(query, [manager_id]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "No bookings found." });
      }
  
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching landlord bookings:", error);
      res.status(500).json({ message: "Server error.", error: error.message });
    }
  };



// Cancel Booking Endpoint
export const cancelBooking = async (req, res) => {
    const { bookingId } = req.body;
  
    try {
      // Fetch booking details
      const bookingResult = await pool.query(
        `SELECT user_id, hostel_id, room_id, booking_id FROM bookings WHERE booking_id = $1`,
        [bookingId]
      );
  
      if (bookingResult.rowCount === 0) {
        return res.status(404).json({ message: "Booking not found" });
      }
  
      const { user_id, hostel_id, room_id, booking_id } = bookingResult.rows[0];
  
      // Fetch landlord ID
      const landlordResult = await pool.query(`SELECT manager_id FROM hostels WHERE id = $1`, [hostel_id]);
      const landlord_id = landlordResult.rows[0]?.manager_id;
  
      if (!landlord_id) {
        console.error(`Landlord not found for hostel_id: ${hostel_id}`);
        return res.status(400).json({ message: "Landlord not found" });
      }
  
      // Update the booking status to 'cancelled'
      const result = await pool.query(
        `UPDATE bookings
         SET booking_status = 'cancelled'
         WHERE booking_id = $1 AND booking_status IN ('pending', 'confirmed')
         RETURNING *;`,
        [bookingId]
      );
  
      if (result.rowCount === 0) {
        // No rows were updated (invalid bookingId or ineligible status)
        return res.status(400).json({ message: "Booking cannot be canceled" });
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
      try {
        await pool.query(
          `INSERT INTO notifications (landlord_id, type, title, message, student_name, student_id, hostel_name, room_number, is_read, booking_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            landlord_id,
            "booking_cancelled",
            "Booking Cancelled",
            `Booking for room ${room_number} by ${student_name} has been cancelled.`,
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
  
      // Return the updated booking
      res.status(200).json({ message: "Booking canceled successfully", booking: result.rows[0] });
    } catch (error) {
      console.error("Error canceling booking:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };






/*  

        // Send email to user
        await sendEmail(
            email,
            "Booking Confirmation",
            `<h3>Your booking has been received!</h3>
            <p>Room ID: ${room_id}</p>
            <p>Start Date: ${start_date}</p>
            <p>End Date: ${end_date}</p>
            <p>Total Price: $${total_price}</p>
            <p>Status: Pending</p>`
        );

*/