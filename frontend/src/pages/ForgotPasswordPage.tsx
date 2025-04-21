/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Validation schema
const schema = yup.object().shape({
  email: yup.string().email("Invalid email format").required("Email is required"),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = import.meta.env.API_URL;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, data, {
        headers: { "Content-Type": "application/json" },
      });
      setMessage("A reset link has been sent to your email.");
    } catch (err: any) {
      if (!err.response) {
        setError("Network error. Please check your internet connection.");
      } else if (err.response.status === 404) {
        setError("No account found with this email.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-6">
      <motion.div
        className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full border border-gray-100"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Forgot Password</h2>
        
        {message && (
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <p className="text-green-600 text-center">{message}</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 p-4 rounded-lg mb-6">
            <p className="text-red-500 text-center">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Enter your registered email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <p className="text-red-500 text-sm mt-1">{errors.email?.message}</p>
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition transform hover:-translate-y-1 font-medium disabled:bg-gray-400 disabled:transform-none"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Remember your password?{" "}
            <span
              className="text-blue-600 cursor-pointer hover:text-blue-800 font-medium hover:underline"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;