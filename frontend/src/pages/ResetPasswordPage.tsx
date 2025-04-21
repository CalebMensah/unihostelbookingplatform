/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

// Validation schema for password
const schema = yup.object().shape({
  newPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must include an uppercase letter")
    .matches(/\d/, "Must include a number")
    .matches(/[!@#$%^&*]/, "Must include a special character")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], "Passwords must match")
    .required("Please confirm your password"),
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    // Check if token exists
    if (!token) {
      setError("Missing reset token");
      setTokenValid(false);
    }
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data: any) => {
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      await axios.post(`/api/auth/reset-password/${token}`, 
        { newPassword: data.newPassword },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setMessage("Password successfully reset! Redirecting...");
      
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      if (!err.response) {
        setError("Network error. Please check your connection.");
      } else if (err.response.status === 400 || err.response.status === 401) {
        setError(err.response.data.message || "Invalid or expired reset token.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-6">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full border border-gray-100 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-6">The password reset link is invalid or has expired.</p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-6">
      <motion.div 
        className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full border border-gray-100"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Reset Password</h2>
        
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
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              {...register("newPassword")}
              placeholder="Create a strong password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <p className="text-red-500 text-sm mt-1">{errors.newPassword?.message}</p>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              placeholder="Confirm your password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword?.message}</p>
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
                Resetting...
              </span>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;