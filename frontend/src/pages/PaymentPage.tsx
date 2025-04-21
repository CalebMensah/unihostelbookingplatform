import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate()
  const { booking } = location.state || {};

  const booking_id = booking?.booking_id;
  const total_price = booking?.total_price;
  const user_id = booking?.user_id;
  const user_email = localStorage.getItem("email")
  const platform_fee = booking?.platform_fee;
  const estimated_paystack_fee = booking?.estimated_paystack_fee;
  const hostel_fee =booking?.hostel_fee;


  const [paymentMethod, setPaymentMethod] = useState("card");
  const [provider, setProvider] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
  if(!booking || !booking_id || !total_price || !user_id ) {
  console.error("Invalid or missing booking data");
  toast.error("Invalid data")
  navigate("/student-dashboard")
  }
  })

  // Function to initiate payment
  const handlePayment = async () => {
    if (paymentMethod === "mobile_money" && (!provider || !phoneNumber)) {
      toast.error("Select a provider and enter your phone number");
      return;
    }

    try {
      setIsProcessing(true);
      const response = await axios.post("/api/payments/initialize", {
        booking_id,
        user_id,
        amount: total_price,
        user_email: user_email, // Replace with actual user email
        payment_method: paymentMethod,
        provider,
        phone_number: phoneNumber,
        callback_url: `${window.location.origin}/payment-success`
      });

      if(response.data.existing_payment) {
        toast.error("You have already initialized payment for this booking.")
        return
      }

      // Redirect to Paystack checkout
      window.location.href = response.data.checkout_url;
    } catch (error) {
      console.error("Payment request failed:", error);
      toast.error("Payment failed. Try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-6">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-800 text-center">Make a Payment</h2>
        
        {/* Booking Summary */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">Booking Summary</h3>
          <p className="text-gray-700 text-sm">Booking ID: {booking_id}</p>
           <p className="text-gray-700">Hostel Fee: ${hostel_fee}</p>
            <p className="text-gray-700">Processing Fees: ${estimated_paystack_fee}</p>
             <p className="text-gray-700">Platform Fee: ${platform_fee}</p>
              <p className="text-gray-700">Total Amount: ${total_price}</p>
        </div>
        
        {/* Payment Method Selection */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Payment Method:</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          >
            <option value="card">Credit/Debit Card</option>
            <option value="bank">Bank Transfer</option>
            <option value="mobile_money">Mobile Money</option>
          </select>
        </div>

        {/* Mobile Money Provider Selection */}
        {paymentMethod === "mobile_money" && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Select Mobile Money Provider:</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              >
                <option value="">Select Provider</option>
                <option value="MTN">MTN Mobile Money</option>
                <option value="AirtelTigo">AirtelTigo Cash</option>
                <option value="Vodafone">Vodafone Cash</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Enter Phone Number:</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="Enter your mobile money number"
              />
            </div>
          </div>
        )}

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          className={`w-full mt-6 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ${
            isProcessing
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          }`}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing Payment..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;