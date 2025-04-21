import React, { useState, useEffect } from 'react';
import {  Edit, Trash2, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Building, Calendar, User, Bell, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

// TypeScript interfaces
interface Hostel {
  id: number;
  name: string;
  location: string;
  amenities: string[];
  availableRooms: number;
  totalRooms: number;
  imageUrl: string;
  status: 'active' | 'maintenance' | 'pending';
}

const LandlordDashboard: React.FC = () => {
  const [hostel, setHostel] = useState<Hostel | null>(null); // Single hostel state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.API_URL;

  // Fetch hostel from the backend
  useEffect(() => {
    const fetchHostel = async () => {
      try {
        const response = await fetch(`${API_URL}/api/hostels/landlord/hostel`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }); // Replace with your backend API endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch hostel');
        }
        const data = await response.json();
        setHostel(data.data); // Assuming the backend returns data in the format { success: true, data: {} }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching hostel:', err);
        setError('An error occurred while fetching the hostel. Please try again later.');
        setLoading(false);
      }
    };
    fetchHostel();
  }, [API_URL]);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login");
      toast.success("Logged out successfully");
    };

    const handleNotificationClick = () => {
      navigate("/landlord-notifications")
    }

  if (!hostel) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-500">No hostel found for this landlord.</p>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hostel Details */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="relative">
            <img src={hostel.imageUrl} alt={hostel.name} className="w-full h-48 object-cover" />
            {hostel.status === 'maintenance' && (
              <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded">
                Under Maintenance
              </div>
            )}
            {hostel.status === 'pending' && (
              <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded">
                Pending Approval
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-gray-900">{hostel.name}</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  hostel.availableRooms > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {hostel.availableRooms > 0 ? `${hostel.availableRooms} Available` : 'Full'}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600">{hostel.location}</p>
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-900">Amenities:</h4>
              <div className="mt-1 flex flex-wrap gap-1">
                {hostel.amenities.map((amenity, index) => (
                  <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <div className="text-sm">
                <span className="font-medium">
                  {hostel.availableRooms}/{hostel.totalRooms}
                </span>{' '}
                rooms available
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
              <button className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </button>
              <div className="flex space-x-2">
                <button className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 font-medium">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </button>
                <button className="inline-flex items-center text-sm text-red-600 hover:text-red-800 font-medium">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandlordDashboard;