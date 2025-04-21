/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const schema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup
    .string()
    .matches(/^\d+$/, "Phone must be numbers only")
    .required("Phone number is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must include an uppercase letter")
    .matches(/\d/, "Must include a number")
    .matches(/[!@#$%^&*]/, "Must include a special character")
    .required("Password is required"),
  role: yup.string().oneOf(["student", "landlord", "admin"]).default("student"),
});

const Signup = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data: any) => {
    setError("");
    setIsLoading(true);
    setShowResend(false);
    setResendSuccess(false);

    try {
      await axios.post(`${API_URL}/api/auth/register`, data, {
        headers: { "Content-Type": "application/json" },
      });
      setUserEmail(data.email);
      setShowResend(true);
    } catch (err: any) {
      if (!err.response) {
        setError("Network error. Please check your internet connection.");
      } else if (err.response.status === 400) {
        setError(err.response.data.message || "Invalid input. Please check your details.");
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    setError("");
    setResendSuccess(false);
    try {
      await axios.post(
        `${API_URL}/api/auth/request-verification-email`,
        { email: userEmail },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setResendSuccess(true);
    } catch (err: any) {
      setError("Failed to resend email. Please try again later.");
      console.error("error at signup page:", err);
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
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Sign Up</h2>
        
        {error && (
          <div className="bg-red-50 p-3 rounded-lg mb-4">
            <p className="text-red-500 text-center">{error}</p>
          </div>
        )}
        
        {resendSuccess && (
          <div className="bg-green-50 p-3 rounded-lg mb-4">
            <p className="text-green-500 text-center">Verification email sent successfully!</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              id="firstName"
              {...register("firstName")}
              placeholder="Enter your first name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <p className="text-red-500 text-sm mt-1">{errors.firstName?.message}</p>
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              id="lastName"
              {...register("lastName")}
              placeholder="Enter your last name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <p className="text-red-500 text-sm mt-1">{errors.lastName?.message}</p>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              {...register("email")}
              placeholder="Enter your email address"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <p className="text-red-500 text-sm mt-1">{errors.email?.message}</p>
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              id="phone"
              {...register("phone")}
              placeholder="Enter your phone number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <p className="text-red-500 text-sm mt-1">{errors.phone?.message}</p>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Create a secure password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <p className="text-red-500 text-sm mt-1">{errors.password?.message}</p>
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              I am a:
            </label>
            <select
              id="role"
              {...register("role")}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
            >
              <option value="student">Student</option>
              <option value="landlord">Landlord</option>
            </select>
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
                Signing Up...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>
        
        {showResend && (
          <div className="text-center mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700">Didn't receive a verification email?</p>
            <button
              onClick={resendVerificationEmail}
              className="text-blue-600 hover:text-blue-800 font-medium mt-2 hover:underline"
            >
              Resend Verification Email
            </button>
          </div>
        )}
        
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Have an account?{" "}
            <span
              className="text-blue-600 cursor-pointer hover:text-blue-800 font-medium hover:underline"
              onClick={() => navigate("/login")}
            >
              Log In
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;