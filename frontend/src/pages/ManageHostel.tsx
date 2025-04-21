/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Menu, X, Home, PlusCircle, Edit, LogOut, ChevronDown, Eye, ChevronRight, User, Mail, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

type Hostel = {
  id: number;
  name: string;
  description: string;
  location: string;
  floors: number;
  images: string[];
  amenities: string[];
};

type Room = {
  id: number;
  room_number: string;
  price: number;
  floor: number;
  capacity: number;
  status: string;
  images: string[];
};

const ManageHostel = () => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const hostelId = searchParams.get('hostel');

  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('hostel');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newHostel, setNewHostel] = useState({
    name: "",
    location: "",
    description: "",
    floors: "1",
    amenities: [] as string[]
  });
  const [newRoom, setNewRoom] = useState({
    room_number: "",
    price: "",
    floor: "",
    capacity: "",
    status: 'available'
  });
  const [hostelImages, setHostelImages] = useState<FileList | null>(null);
  const [roomImages, setRoomImages] = useState<FileList | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Set initial active tab based on URL parameter
    if (tabParam === 'rooms') {
      setActiveTab('rooms');
    }
  }, [tabParam]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [verificationResponse, hostelResponse] = await Promise.all([
          axios.get('/api/verification-status', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          hostelId 
            ? axios.get(`/api/hostels/${hostelId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
              })
            : axios.get('/api/hostels/manager', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
              })
        ]);
        setIsEmailVerified(verificationResponse.data.isVerified);

        if (hostelId) {
          // If hostelId is provided, use the direct response
          setHostel(hostelResponse.data);
          setRooms(hostelResponse.data?.rooms || []);
        } else if (hostelResponse.data && Array.isArray(hostelResponse.data)) {
          // If response is an array of hostels, take the first one
          setHostel(hostelResponse.data[0]);
          setRooms(hostelResponse.data[0]?.rooms || []);
        } else {
          // If response is a single hostel object
          setHostel(hostelResponse.data);
          setRooms(hostelResponse.data?.rooms || []);
        }
      } catch (error:any) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          navigate('/login');
          return;
        }
        if (error.response?.status === 403) {
          toast.error("Only landlords can access this page");
        } else {
          setError(error.response?.data?.message || 'Failed to load hostel data');
          toast.error(error.response?.data?.message || 'Failed to load hostel data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, hostelId]);

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

  const handleAddHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    
    // Add basic hostel details
    formData.append('name', newHostel.name);
    formData.append('location', newHostel.location);
    formData.append('description', newHostel.description);
    formData.append('floors', String(newHostel.floors));

    // Handle amenities properly
    if (Array.isArray(newHostel.amenities)) {
        formData.append('amenities', JSON.stringify(newHostel.amenities));
    }
    
    // Handle images properly
    if (hostelImages && hostelImages.length > 0) {
        Array.from(hostelImages).forEach(file => {
            formData.append('images', file);
        });
    }

    try {
        const response = await axios.post('/api/hostels', formData, {
            headers: { 
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        
        console.log('Hostel creation response:', response.data);
        setSuccessMessage('Hostel added successfully!');
        setTimeout(() => window.location.reload(), 2000);
    } catch (error: any) {
        console.error('Error adding hostel:', error.response || error);
        setError(error.response?.data?.message || 'Failed to add hostel');
        setTimeout(() => setError(""), 5000);
    }
  };

  const handleUpdateHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostel) return;

    const formData = new FormData();
    
    Object.entries(newHostel).forEach(([key, value]: [string, string | string[] | number]) => {
      if (key === 'amenities' && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'floors' && typeof value === 'string') {
        formData.append(key, String(parseInt(value) || 1));
      } else {
        formData.append(key, String(value));
      }
    });
    
    if (hostelImages) {
      Array.from(hostelImages).forEach(file => formData.append('images', file));
    }

    try {
      await axios.put(`/api/hostels/${hostel.id}`, formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccessMessage('Hostel updated successfully!');
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      setError('Failed to update hostel');
      setTimeout(() => setError(""), 5000);
      console.error(error)
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostel) return;

    const formData = new FormData();
    formData.append('hostel_id', String(hostel.id));
    
    Object.entries(newRoom).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    
    if (roomImages) {
      Array.from(roomImages).forEach(file => formData.append('images', file));
    }

    try {
      await axios.post('/api/rooms', formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccessMessage('Room added successfully!');
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      setError('Failed to add room');
      setTimeout(() => setError(""), 5000);
      console.error(error)
    }
  };

  const handleDeleteRoom = async (roomId: number) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    
    try {
      await axios.delete(`/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccessMessage('Room deleted successfully!');
      setRooms(rooms.filter(room => room.id !== roomId));
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      setError('Failed to delete room');
      setTimeout(() => setError(""), 5000);
      console.error(error)
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Home className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-800">UniHostels</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => navigate('/manager-dashboard')}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Back to Dashboard
                </div>
              </button>
              <button 
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'hostel' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('hostel')}
              >
                Manage Hostel
              </button>
              <button 
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'rooms' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('rooms')}
              >
                Manage Rooms
              </button>
              <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Profile
                </div>
              </button>
              <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                <div className="flex items-center">
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </div>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
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
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <button
                onClick={() => {
                  navigate('/manager-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <div className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab('hostel');
                  setMobileMenuOpen(false);
                }}
                className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${activeTab === 'hostel' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Manage Hostel
              </button>
              <button
                onClick={() => {
                  setActiveTab('rooms');
                  setMobileMenuOpen(false);
                }}
                className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${activeTab === 'rooms' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Manage Rooms
              </button>
              <button className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 w-full text-left">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </div>
              </button>
              <button className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 w-full text-left">
                <div className="flex items-center">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </div>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Email Verification Alert */}
        {!isEmailVerified && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-sm">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-yellow-800">Please verify your email to access all features.</span>
              <button 
                onClick={sendVerificationEmail} 
                className="ml-4 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Send className="h-4 w-4 mr-1" />
                Send Verification Email
              </button>
            </div>
          </div>
        )}

        {/* Success and Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded shadow-sm">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded shadow-sm">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Hostel Management Tab */}
        {activeTab === 'hostel' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {hostel ? "Update Your Hostel" : "Add a New Hostel"}
            </h2>

            <form onSubmit={hostel ? handleUpdateHostel : handleAddHostel} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hostel Name</label>
                  <input
                    type="text"
                    placeholder="Enter hostel name"
                    value={newHostel.name}
                    onChange={(e) => setNewHostel({ ...newHostel, name: e.target.value })}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="City, area, street, etc."
                    value={newHostel.location}
                    onChange={(e) => setNewHostel({ ...newHostel, location: e.target.value })}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Describe your hostel, its features, surroundings, etc."
                  value={newHostel.description}
                  onChange={(e) => setNewHostel({ ...newHostel, description: e.target.value })}
                  rows={4}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Floors</label>
                  <input
                    type="number"
                    placeholder="Enter number of floors"
                    value={newHostel.floors}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only update if the value is a valid number or empty
                      if (value === '' || (!isNaN(parseInt(value)) && parseInt(value) > 0)) {
                        setNewHostel({ 
                          ...newHostel, 
                          floors: value
                        });
                      }
                    }}
                    min={1}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
                  <input
                    type="text"
                    placeholder="WiFi, Laundry, Kitchen, etc. (comma separated)"
                    value={newHostel.amenities.join(", ")}
                    onChange={(e) => setNewHostel({ 
                      ...newHostel, 
                      amenities: e.target.value.split(',').map(a => a.trim()).filter(a => a) 
                    })}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hostel Images</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="hostel-images" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload images</span>
                        <input
                          id="hostel-images"
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={(e) => setHostelImages(e.target.files)}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {hostel ? (
                    <>
                      <Edit className="h-5 w-5 mr-2" />
                      Update Hostel
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-5 w-5 mr-2" />
                      Add Hostel
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Rooms Management Tab */}
        {activeTab === 'rooms' && (
          <div>
            {!hostel ? (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="text-center py-12">
                  <Eye className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No Hostel Found</h3>
                  <p className="mt-1 text-sm text-gray-500">Please add a hostel first to manage rooms.</p>
                  <div className="mt-6">
                    <button
                      onClick={() => setActiveTab('hostel')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PlusCircle className="h-5 w-5 mr-2" />
                      Add Hostel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Room</h2>
                  <form onSubmit={handleAddRoom} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                        <input
                          type="text"
                          placeholder="e.g. 203A"
                          value={newRoom.room_number}
                          onChange={(e) => setNewRoom({ ...newRoom, room_number: e.target.value })}
                          required
                          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price per Night</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={newRoom.price}
                            onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
                            required
                            min="1"
                            className="w-full pl-7 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                        <input
                          type="number"
                          placeholder="Enter floor number"
                          value={newRoom.floor}
                          onChange={(e) => setNewRoom({ ...newRoom, floor: e.target.value })}
                          required
                          min="1"
                          max={hostel.floors}
                          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                        <input
                          type="number"
                          placeholder="Max occupants"
                          value={newRoom.capacity}
                          onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                          required
                          min="1"
                          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={newRoom.status}
                        onChange={(e) => setNewRoom({ ...newRoom, status: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="available">Available</option>
                        <option value="occupied">Occupied</option>
                        <option value="maintenance">Under Maintenance</option>
                        <option value="reserved">Reserved</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Room Images</label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label htmlFor="room-images" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                              <span>Upload images</span>
                              <input
                                id="room-images"
                                type="file"
                                multiple
                                className="sr-only"
                                onChange={(e) => setRoomImages(e.target.files)}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setNewRoom({
                            room_number: "",
                            price: "",
                            floor: "",
                            capacity: "",
                            status: "available"
                          });
                        }}
                        className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Clear Form
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <PlusCircle className="h-5 w-5 mr-2" />
                        Add Room
                      </button>
                    </div>
                  </form>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Rooms List</h2>
                  <div className="space-y-4">
                    {rooms.map(room => (
                      <div key={room.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{room.room_number}</h3>
                            <p className="text-sm text-gray-500">${room.price} per night</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setNewRoom({
                                  ...newRoom,
                                  room_number: room.room_number,
                                  price: String(room.price),
                                  floor: String(room.floor),
                                  capacity: String(room.capacity),
                                  status: room.status
                                });
                                setActiveTab('rooms');
                              }}
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteRoom(room.id)}
                              className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <ChevronRight className="h-4 w-4 mr-1" />
                          <span>Floor {room.floor} | Capacity {room.capacity}</span>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <ChevronDown className="h-4 w-4 mr-1" />
                          <span>Status: {room.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-500 text-center">&copy; {new Date().getFullYear()} UniHostels. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ManageHostel;



{/* 

    const handleRoomUpdate = async (roomId: number, e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    
    Object.entries(newRoom).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    
    if (roomImages) {
      Array.from(roomImages).forEach(file => formData.append('images', file));
    }

    try {
      await axios.put(`/api/rooms/${roomId}`, formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccessMessage('Room updated successfully!');
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      setError('Failed to update room');
      setTimeout(() => setError(""), 5000);
      console.error(error)
    }
  };
  
*/}