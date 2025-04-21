import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Building, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, Filter, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface Booking {
  id: string;
  hostelname: string;
  roomnumber: string;
  floor: string;
  checkindate: string;
  checkoutdate: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  amount: number;
  paymentstatus: 'paid' | 'pending' | 'unpaid';
  bookingdate: string;
}

const StudentBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('/api/bookings/student-booking', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setBookings(response.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const toggleBookingExpand = (bookingId: string) => {
    if (expandedBookingId === bookingId) {
      setExpandedBookingId(null);
    } else {
      setExpandedBookingId(bookingId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-600" />;
      case 'completed':
        return <CheckCircle size={16} className="text-blue-600" />;
      default:
        return <AlertCircle size={16} className="text-gray-600" />;
    }
  };


  const filteredBookings = bookings.filter((booking) => {
    // Apply status filter
    if (filterStatus !== 'all' && booking.status !== filterStatus) {
      return false;
    }
    // Apply search filter (case insensitive)
    if (
      searchTerm &&
      !booking.hostelname.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !booking.roomnumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !booking.id.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleCancelBooking = async (bookingId: string) => {
    try {
      // Call the API to cancel the booking
      await axios.post(
        `/api/bookings/cancel-booking`,
        { bookingId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
  
      // Update the local state to reflect the cancellation
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
        )
      );
  
      // Show success notification
      toast.success('Booking canceled successfully');
    } catch (error) {
      console.error('Error canceling booking:', error);
  
      // Show error notification
      toast.error('Failed to cancel booking. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">My Bookings</h1>
              <p className="mt-1 text-sm text-gray-500">View and manage all your hostel bookings</p>
            </div>
          </div>
          {/* Search and Filter Tools */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="sm:flex sm:justify-between sm:items-center">
              <div className="mb-4 sm:mb-0 relative rounded-md w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by hostel or room"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-md sm:text-sm border-gray-300"
                />
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-2 flex items-center">
                  <Filter size={16} className="mr-1 text-gray-500" />
                  Filter by:
                </span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-md border-gray-300 py-1 pl-2 pr-8 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Bookings</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
          {/* Bookings List */}
          <div className="space-y-4">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div
                    className="px-4 py-4 sm:px-6 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleBookingExpand(booking.id)}
                  >
                    <div className="flex items-start sm:items-center flex-col sm:flex-row">
                      <div className="bg-indigo-100 p-3 rounded-lg mr-4 hidden sm:block">
                        <Building size={24} className="text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{booking.hostelname}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 mt-1">
                          <span className="mr-4">Room: {booking.roomnumber} (Floor {booking.floor})</span>
                          <span className="flex items-center mt-1 sm:mt-0">
                            <Calendar size={14} className="mr-1" />
                            {(booking.checkindate)} - {(booking.checkoutdate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`rounded-full px-2.5 py-0.5 text-xs font-medium flex items-center ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1 capitalize">{booking.status}</span>
                      </div>
                      <span className="text-sm text-gray-500 mt-1">Booking ID: {booking.id}</span>
                      <span className="text-sm text-gray-500 flex items-center mt-1">
                        {expandedBookingId === booking.id ? (
                          <ChevronUp size={16} className="ml-1" />
                        ) : (
                          <ChevronDown size={16} className="ml-1" />
                        )}
                      </span>
                    </div>
                  </div>
                  {expandedBookingId === booking.id && (
                    <div className="border-t border-gray-200 px-4 py-5 sm:p-6 bg-gray-50">
                      <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Booking Date</dt>
                          <dd className="mt-1 text-sm text-gray-900">{(booking.bookingdate)}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Check-in Date</dt>
                          <dd className="mt-1 text-sm text-gray-900">{(booking.checkindate)}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Check-out Date</dt>
                          <dd className="mt-1 text-sm text-gray-900">{(booking.checkoutdate)}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Floor</dt>
                          <dd className="mt-1 text-sm text-gray-900">{booking.floor}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Booking Amount</dt>
                          <dd className="mt-1 text-sm text-gray-900">${booking.amount.toLocaleString()}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(booking.paymentstatus)}`}>
                              {booking.paymentstatus}
                            </span>
                          </dd>
                        </div>
                      </dl>
                      <div className="mt-6 flex justify-end space-x-3">
                      {['pending', 'confirmed'].includes(booking.status) && (
        <button
          onClick={() => handleCancelBooking(booking.id)}
          className="inline-flex items-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
        >
          Cancel Booking
        </button>
      )}
                        {(booking.status === 'confirmed' || booking.status === 'pending') && (
                          <button className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
                            View Details
                          </button>
                        )}
                        {booking.status === 'completed' && (
                          <button className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
                            Book Again
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
                  <Calendar size={32} className="text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
                <p className="text-gray-500">
                  {searchTerm || filterStatus !== 'all'
                    ? 'Try changing your search or filter criteria'
                    : "You haven't made any hostel bookings yet"}
                </p>
                <div className="mt-6">
                  <button className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
                    Find Accommodation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentBookingsPage;