/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Menu, X, Home, Building, Calendar, User, Bell, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Document {
    id: number;
    documentType: string;
    idNumber: string;
    proofOfProperty: string;
    utilityBills: string;
    businessRegistration: string | null;
    verificationStatus: string;
}

const AdminDashboard: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
      const fetchData = async () => {
        try {
          // First check verification status
          const verificationResponse = await axios.get(`${API_URL}/api/verification-status`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          setIsEmailVerified(verificationResponse.data.isVerified);
          try {
            const response = await axios.get(`${API_URL}/api/admin/documents`);
            setDocuments(response.data);
        } catch (error) {
            console.error(error);
            alert("Failed to fetch documents");
        }

  
        } catch (error: any) {
          console.error("Error fetching verification status:", error);
          if (error.response?.status === 401) {
            toast.error("Session expired. Please login again.");
            handleLogout();
            return;
          }
          setIsEmailVerified(false);
        } finally {
          setLoading(false);  // Always set loading to false
        }
      };
  
      fetchData();
    }, [ navigate]);


    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-blue-600 border-gray-200 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-lg text-gray-700">Loading dashboard...</p>
          </div>
        </div>
      );
    }

    // Handle document verification
    const handleVerification = async (documentId: number, status: string) => {
        try {
            await axios.post(`${API_URL}/api/admin/verify-document`, { documentId, status });
            setDocuments((prev) =>
                prev.map((doc) => (doc.id === documentId ? { ...doc, verificationStatus: status } : doc))
            );
            toast.success(`Document ${status} successfully`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update verification status");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
        toast.success("Logged out successfully");
      };

      const sendVerificationEmail = async () => {
        try {
          await axios.post(`${API_URL}/api/request-verification-email`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          toast.success("Verification email sent! Please check your inbox.");
          // Navigate to success page
          navigate('/email-verification-success');
        } catch (error: any) {
          console.error("Error sending verification email:", error);
          toast.error(error.response?.data?.message || "Failed to send verification email.");
        }
      };

    return (
        <div className="min-h-screen bg-gray-100">

      {/* Top Navigation Bar */}
        <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/dashboard" className="font-bold text-xl text-blue-600">ADMIN</Link>
              </div>
              {/* Desktop Navigation */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/login" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  <Home className="h-4 w-4 mr-1" />
                  Login
                </Link>
                <Link to="/admin-hostels" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  <Building className="h-4 w-4 mr-1" />
                  Hostels
                </Link>
                <Link to="/bookings" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 mr-1" />
                  Bookings
                </Link>
                <Link to="/admin-users" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  <User className="h-4 w-4 mr-1" />
                  Users
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {/* Notifications */}
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>

              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 items-center"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      <User className="h-5 w-5" />
                    </div>
                    <span className="ml-2 text-gray-700">Admin</span>
                    <ChevronDown className="h-4 w-4 ml-1 text-gray-500 cursor-pointer" />
                  </button>
                </div>
                {dropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</Link>
                    <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</Link>
                    <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {mobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link to="/login" className="bg-blue-50 border-blue-500 text-blue-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                <div className="flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Login
                </div>
              </Link>
              <Link to="/admin-hostels" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Hostels
                </div>
              </Link>
              <Link to="/bookings" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Bookings
                </div>
              </Link>
              <Link to="/admin-users" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Users
                </div>
              </Link>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <User className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">Admin</div>
                  <div className="text-sm font-medium text-gray-500">manager@example.com</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link to="/profile" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">Your Profile</Link>
                <Link to="/settings" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">Settings</Link>
                <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">Sign out</button>
              </div>
            </div>
          </div>
        )}
      </nav>

            {/* Email Verification Alert */}
              {!isEmailVerified && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Bell className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please verify your email address to access all features.
                <button onClick={sendVerificationEmail} className="ml-2 font-medium underline text-yellow-700 hover:text-yellow-600">
                  Send verification email
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            <div className="space-y-4">
                {documents.length > 0 ? (
                    documents.map((doc) => (
                        <div key={doc.id} className="bg-white p-4 rounded-lg shadow-md">
                            <p><strong>Document Type:</strong> {doc.documentType}</p>
                            <p><strong>ID Number:</strong> {doc.idNumber}</p>
                            <p><strong>Status:</strong> {doc.verificationStatus}</p>
                            <div className="mt-4 flex gap-4">
                                <button
                                    onClick={() => handleVerification(doc.id, "approved")}
                                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleVerification(doc.id, "rejected")}
                                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No documents to verify</p>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;