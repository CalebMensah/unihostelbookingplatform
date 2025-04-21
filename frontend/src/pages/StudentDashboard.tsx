/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { Menu, X, Home, Book, User, LogOut, Calendar, Bell } from 'lucide-react';
import Footer from '../components/Footer';

interface Booking {
  booking_id: number;
  room_number: string;
  floor: number;
  start_date: string;
  end_date: string;
  payment_status: string;
  total_price: number;
  platform_fee: number;
  estimated_platform_fee: number;
  hostel_fee: number;
  name: string
  email: string;
}

interface Payments {
  payment_id: number;
  transaction_id: number;
  amount: number;
  payment_method: string;
  payment_status: string;
  provider: string;
  booking_id: number;
  name: string;
  hostel_fee: number;
  total_price: number;
}

interface ErrorResponse {
  message: string;
  status: number;
}

const StudentDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payments[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const user = localStorage.getItem("userId");
  const navigate = useNavigate();
  const API_URL = import.meta.env.API_URL;


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check verification status first
        const verificationResponse = await axios.get(`${API_URL}/api/verification-status`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setIsEmailVerified(verificationResponse.data.isVerified);
        console.log('Email verification status:', verificationResponse.data.isVerified);

        // Fetch bookings
        const response = await axios.get(`${API_URL}/api/bookings/student`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setBookings(response.data);

        // fetch payments
        const res = await axios.get(`${API_URL}/api/payments/user`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setPayments(res.data);
      } catch (error: unknown) {
        console.error("Error:", error);
        if (error instanceof AxiosError && error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          handleLogout();
          return;
        }
        setIsEmailVerified(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const sendVerificationEmail = async () => {
    try {
      await axios.post(`${API_URL}/api/request-verification-email`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Verification email sent! Please check your inbox.");
      navigate('/email-verification-success');
    } catch (error: unknown) {
      console.error("Error sending verification email:", error);
      const axiosError = error as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || "Failed to send verification email.");
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMakePaymentClick = (booking: Booking) => {
    navigate('/payment', { state: {booking }})
  }
  
  const handleDeleteBooking = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) {
      return; // Exit if the user cancels the confirmation dialog
    }
  
    try {
      console.log("Deleting booking with id:", id);
      await axios.delete(`${API_URL}/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Booking deleted successfully");
  
      // Update the bookings state directly
      setBookings((prevBookings) => prevBookings.filter((booking) => booking.booking_id !== id));
    } catch (error) {
      console.error("Error deleting booking:", error);
  
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          toast.error("Booking not found.");
        } else if (error.response?.status === 401) {
          toast.error("Unauthorized. Please log in again.");
          handleLogout();
        } else {
          toast.error("Failed to delete booking. Please try again.");
        }
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-blue-600 text-xl font-bold">UniHostel</span>
              </div>
              {/* Desktop Navigation */}
              <nav className="hidden md:ml-10 md:flex md:space-x-8">
                <Link to="/dashboard" className="text-blue-600 font-medium px-3 py-2 rounded-md">Dashboard</Link>
                <Link to="/bookings" className="text-gray-600 hover:text-blue-600 font-medium px-3 py-2 rounded-md">My Bookings</Link>
                <Link to="/hostels" className="text-gray-600 hover:text-blue-600 font-medium px-3 py-2 rounded-md">View Hostels</Link>
                <Link to="/profile" className="text-gray-600 hover:text-blue-600 font-medium px-3 py-2 rounded-md">Profile</Link>
              </nav>
            </div>
            
            {/* User Profile and Mobile Menu Button */}
            <div className="flex items-center">
              <div className="hidden md:flex items-center space-x-4">
                <button className="text-gray-600 hover:text-blue-600">
                  <LogOut size={20} />
                </button>
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <span className="text-sm font-medium">SU</span>
                </div>
              </div>
              
              {/* Mobile menu button */}
              <button
                type="button"
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600"
                onClick={toggleMobileMenu}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg p-4 absolute top-16 right-0 left-0 z-50">
          <nav className="flex flex-col space-y-4">
            <Link to="/dashboard" className="flex items-center text-blue-600 font-medium px-3 py-2">
              <Home size={20} className="mr-2" /> Dashboard
            </Link>
            <Link to="/bookings" className="flex items-center text-gray-600 hover:text-blue-600 font-medium px-3 py-2">
              <Calendar size={20} className="mr-2" /> My Bookings
            </Link>
            <Link to="/hostels" className="flex items-center text-gray-600 hover:text-blue-600 font-medium px-3 py-2">
              <Book size={20} className="mr-2" /> View Hostels
            </Link>
            <Link to="/profile" className="flex items-center text-gray-600 hover:text-blue-600 font-medium px-3 py-2">
              <User size={20} className="mr-2" /> Profile
            </Link>
            <button className="flex items-center text-gray-600 hover:text-blue-600 font-medium px-3 py-2">
              <LogOut size={20} className="mr-2" /> Logout
            </button>
          </nav>
        </div>
      )}

      {/* Email Verification Alert */}
      {!isEmailVerified && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Bell className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please verify your email address to access all features.
                <button 
                  onClick={sendVerificationEmail} 
                  className="ml-2 font-medium underline text-yellow-700 hover:text-yellow-600"
                >
                  Send verification email
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
          <p className="text-gray-600 mt-2">Manage your hostel bookings and preferences from one place.</p>
        </div>

        {/* Quick Actions Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link to="/hostels" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Book size={24} />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Book a Room</h3>
            <p className="text-gray-600">Find and book available rooms in hostels.</p>
          </Link>

          <Link to="/bookings" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg text-green-600">
                <Calendar size={24} />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">View Bookings</h3>
            <p className="text-gray-600">Check your current and past bookings.</p>
          </Link>

          <Link to="/profile" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <User size={24} />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Update Profile</h3>
            <p className="text-gray-600">Manage your personal information.</p>
          </Link>
        </div>

        {/* Current Bookings */}
{/* Current Bookings */}
<div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
  <h2 className="text-2xl font-bold mb-6">Current Bookings</h2>
  {loading ? (
    <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  ) : bookings.length > 0 ? (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {bookings.map((booking) => (
        <div key={booking.booking_id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-200 transition-colors">
          <div className="flex justify-between mb-2">
            <h3 className="text-lg font-semibold">{booking.name}</h3>
            <h3 className="text-lg">Room {booking.room_number}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              booking.payment_status === 'Successful' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {booking.payment_status}
            </span>
          </div>
          <p className="text-gray-600">Floor: {booking.floor}</p>
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Check-in</span>
              <span className="font-medium">{new Date(booking.start_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">Check-out</span>
              <span className="font-medium">{new Date(booking.end_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">Price</span>
              <span className="font-medium">{booking.total_price}</span>
            </div>
          </div>
          <div className='flex gap-3'>
            {/* Conditional Rendering of Buttons */}
            {booking.payment_status === 'Successful' ? (
              <button 
                className='text-center bg-red-500 w-full mt-4 py-2 px-2 rounded-md text-white hover:bg-red-700' 
                onClick={() => {
                  if (window.confirm("Are you sure you want to cancel this booking?")) {
                    handleDeleteBooking(booking.booking_id);
                  }
                }}
              >
                Cancel Booking
              </button>
            ) : (
              <button 
                className='text-center bg-blue-500 w-full mt-4 py-2 px-2 rounded-md text-white hover:bg-blue-700' 
                onClick={() => handleMakePaymentClick(booking)}
              >
                Make Payment
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-8">
      <p className="text-gray-600 mb-4">No current bookings found.</p>
      <Link to="/hostels" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
        Book a Room
      </Link>
    </div>
  )}
</div>

         {/* Current Payments */}
         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-2xl font-bold mb-6">Your Payment</h2>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : payments.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {payments.map((payment) => (
                <div key={payment.payment_id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-200 transition-colors">
                  <div className="flex justify-between mb-2">
                    <h3 className="text-lg font-semibold">{payment.name}</h3>
                    <h3 className="text-lg">Payment ID {payment.payment_id}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      payment.payment_status === 'Paid' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {payment.payment_status}
                    </span>
                  </div>
                  <p className="text-gray-600">Transaction ID: {payment.transaction_id}</p>
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Payment Method</span>
                      <span className="font-medium">{payment.payment_method}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">Network Provider</span>
                      <span className="font-medium">{payment.provider}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">Hostel Fee</span>
                      <span className="font-medium">{payment.hostel_fee}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">Total Amount Paid</span>
                      <span className="font-medium">{payment.total_price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You haven't made any payments yet. Book a room and make a payment.</p>
              <Link to="/hostels" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Book a Room
              </Link>
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default StudentDashboard;