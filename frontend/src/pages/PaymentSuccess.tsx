import axios from "axios";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"


const PaymentSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const reference = queryParams.get("reference");

        if(reference) {
            axios.get(`${API_URL}/api/payments/verify?reference=${reference}`)
            .then((response) => {
                console.log("Payment verified:", response.data)
            })
            .catch((error) => {
                console.error("Verification error:", error)
            })
        }

        setTimeout(() => {
            navigate("/student-dashboard");
        }, 3000)
    }, [navigate, location, API_URL])
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-6">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-bold mb-4">Payment Successful!</h2>
            <p className="text-gray-700">You will be redirected to your dashboard shortly...</p>
        </div>
    </div>
  )
}

export default PaymentSuccess