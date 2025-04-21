/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Menu, X, Home, Building, Calendar, User, Settings, Bell, ChevronDown } from 'lucide-react';

type Hostel = {
  id: number;
  name: string;
  description: string;
  images: string[];
};

type Booking = {
  id: number;
  full_name: string;
  room_number: string;
  floor: number;
  created_at: string;
  payment_status: string;
};

const ManagerDashboard = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First check verification status
        const verificationResponse = await axios.get('/api/verification-status', {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setIsEmailVerified(verificationResponse.data.isVerified);

        // Then fetch hostels and bookings separately to handle errors individually
        try {
          const hostelResponse = await axios.get('/api/hostels/manager', {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          setHostels(hostelResponse.data);
        } catch (error) {
          console.error('Error fetching hostels:', error);
          setHostels([]);
          toast.error("Failed to load hostels");
        }

        try {
          const bookingResponse = await axios.get('/api/bookings/manager?limit=10', {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          setBookings(bookingResponse.data);
          console.log(" booking response:", bookingResponse.data)
        } catch (error: any) {
          console.error('Error fetching bookings:', error);
          setBookings([]);
          if (error.response?.status === 403) {
            toast.error("Only landlords can access this dashboard");
          } else {
            toast.error("Failed to load bookings");
          }
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
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const sendVerificationEmail = async () => {
    try {
      await axios.post('/api/request-verification-email', {}, {
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

  const handleNotificationClick = () => {
    navigate("/landlord-notifications")
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/dashboard" className="font-bold text-xl text-blue-600">HostelManager</Link>
              </div>
              {/* Desktop Navigation */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/dashboard" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  <Home className="h-4 w-4 mr-1" />
                  Dashboard
                </Link>
                <Link to="/landlord-hostels" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  <Building className="h-4 w-4 mr-1" />
                  My Hostels
                </Link>
                <Link to="/landlord-bookings" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 mr-1" />
                  Bookings
                </Link>
                <Link to="/students" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 mr-1" />
                  Students
                </Link>
                <Link to="/document-upload" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 mr-1" />
                  Upload
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {/* Notifications */}
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 relative" onClick={handleNotificationClick}>
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
                    <span className="ml-2 text-gray-700">Manager</span>
                    <ChevronDown className="h-4 w-4 ml-1 text-gray-500 cursor-pointer" />
                  </button>
                </div>
                {dropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <Link to="/manager-profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</Link>
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
              <Link to="/dashboard" className="bg-blue-50 border-blue-500 text-blue-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                <div className="flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Dashboard
                </div>
              </Link>
              <Link to="/landlord-hostels" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  My Hostels
                </div>
              </Link>
              <Link to="/landlord-bookings" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Bookings
                </div>
              </Link>
              <Link to="/students" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Students
                </div>
              </Link>
              <Link to="/landlord-notifications" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications
                </div>
              </Link>

              <Link to="/document-upload" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Upload
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
                  <div className="text-base font-medium text-gray-800">Hostel Manager</div>
                  <div className="text-sm font-medium text-gray-500">manager@example.com</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link to="/manager-profile" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">Your Profile</Link>
                
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <div className="bg-white shadow rounded-lg mb-6 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Dashboard Overview</h1>
              <p className="mt-1 text-sm text-gray-500">Welcome back! Here's an overview of your hostels and bookings.</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                to="/manage-hostel"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Building className="mr-2 h-4 w-4" />
                Add New Hostel
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3 text-white">
                  <Building className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-600">Total Hostels</h2>
                  <p className="text-2xl font-semibold text-gray-900">{hostels.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3 text-white">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-600">Total Bookings</h2>
                  <p className="text-2xl font-semibold text-gray-900">{bookings.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3 text-white">
                  <Settings className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-600">Occupancy Rate</h2>
                  <p className="text-2xl font-semibold text-gray-900">
                    {bookings.length > 0 ? 
                      `${Math.round((bookings.filter(b => b.payment_status === "paid").length / bookings.length) * 100)}%` : 
                      "0%"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hostels Section */}
        <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">My Hostels</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage your properties and rooms</p>
          </div>
          
          {hostels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {Array.isArray(hostels) && hostels.map((hostel) => (
                <div key={hostel.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {hostel.images.length > 0 && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={hostel.images[0]} 
                        alt={hostel.name} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{hostel.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{hostel.description}</p>
                    <div className="flex space-x-2">
                      <Link 
                        to={`/edit-hostel/${hostel.id}`} 
                        className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                      >
                        Edit Details
                      </Link>
                      <Link 
                        to={`/manage-hostel?tab=rooms&hostel=${hostel.id}`} 
                        className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Manage Rooms
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hostels found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new hostel.</p>
              <div className="mt-6">
                <Link
                  to="/add-hostel"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add New Hostel
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Recent Bookings Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Bookings</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Latest bookings across all your properties</p>
            </div>
            <Link 
              to="/landlord-bookings" 
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all
            </Link>
          </div>
          
          {bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booker</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Booked</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(bookings) && bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.full_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.room_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.floor}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(booking.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.payment_status === "paid" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {booking.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings yet</h3>
              <p className="mt-1 text-sm text-gray-500">Bookings will appear here when students reserve rooms.</p>
              </div>
          )};
          </div>
          </div>
          </div>
  );
};

export default  ManagerDashboard