/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user_id, room_id, room_price, hostel_id } = location.state || {};

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const platform_fee = 15.00;
  const estimated_paystack_fee = (room_price + platform_fee) * 0.0195 + 2.50;
  const total_price = room_price + platform_fee + estimated_paystack_fee

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    if (!user_id || !room_id || !room_price) {
      toast.error("Missing booking information. Please try again.");
      console.error("Missing booking info:", { user_id, room_id, room_price });
      return;
    }

    try {
      const bookingData = {
        room_id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        hostel_fee: room_price,
        amount_paid: 0,
        payment_status: "pending",
        booking_status: "pending",
        platform_fee,
        estimated_paystack_fee,
        total_price,
        user_id,
        hostel_id
      };

      console.log("Submitting booking data:", bookingData);

      const response = await axios.post("/api/bookings", bookingData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.data) {
        navigate("/payment", { state: { booking: response.data } });
      }
    } catch (error: any) {
      console.error("Error creating booking:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Failed to create booking. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-6">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">Confirm Your Booking</h2>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <label className="text-gray-700 mb-1 sm:mb-0 sm:w-1/3">Start Date:</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              minDate={new Date()}
              className="w-full p-2 border rounded-lg"
              placeholderText="Select start date"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center">
            <label className="text-gray-700 mb-1 sm:mb-0 sm:w-1/3">End Date:</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              minDate={startDate || new Date()}
              className="w-full p-2 border rounded-lg"
              placeholderText="Select end date"
              disabled={!startDate}
            />
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={handleBooking}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;