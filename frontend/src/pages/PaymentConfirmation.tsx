import { useLocation, useNavigate } from "react-router-dom";

const PaymentConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { payment } = location.state || {};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-6">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Payment Confirmation</h2>
          <p className="text-gray-600 mt-1">{payment?.status === "success" ? "Your payment was successful!" : "Payment processing"}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Payment ID:</span>
              <span className="font-medium">{payment?.id || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-medium">{payment?.transaction_id || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-medium">${payment?.amount || "0.00"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${payment?.status === "success" ? "text-green-600" : "text-yellow-600"}`}>
                {payment?.status === "success" ? "Successful" : "Processing"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg flex-1 font-medium transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
          <button
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-lg flex-1 font-medium transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
            onClick={() => navigate("/bookings")}
          >
            View Bookings
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;