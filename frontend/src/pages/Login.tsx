/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const schema = yup.object().shape({
  specialId: yup.string().required("Special ID is required"),
  password: yup.string().required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data: any) => {
    setError("");
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, data, {
        headers: { "Content-Type": "application/json" },
      });
      
      const { token, user } = response.data;
      console.log("response data",response.data)
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userid", user.userid)
      localStorage.setItem("email", user.email)
      
      // Navigate based on user role
      if (user.role === "student") {
        navigate("/");
      } else if (user.role === "landlord") {
        navigate("/manager-dashboard");
      } else if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setError("Invalid credentials. Please check your ID and password.");
      console.error("error logging in:", error);
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
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Welcome Back</h2>
        
        {error && (
          <div className="bg-red-50 p-3 rounded-lg mb-6">
            <p className="text-red-500 text-center">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="specialId" className="block text-sm font-medium text-gray-700 mb-1">
              Special ID
            </label>
            <input
              id="specialId"
              {...register("specialId")}
              placeholder="Enter your Special ID"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <p className="text-red-500 text-sm mt-1">{errors.specialId?.message}</p>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Enter your password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <p className="text-red-500 text-sm mt-1">{errors.password?.message}</p>
          </div>
          
          <div className="flex justify-end">
            <button 
              type="button" 
              onClick={() => navigate("/forgot-password")}
              className="text-blue-600 text-sm hover:text-blue-800 hover:underline"
            >
              Forgot Password?
            </button>
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
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <span
              className="text-blue-600 cursor-pointer hover:text-blue-800 font-medium hover:underline"
              onClick={() => navigate("/register")}
            >
              Sign Up
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;