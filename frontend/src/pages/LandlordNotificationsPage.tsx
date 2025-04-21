import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Bell,
  CheckCircle,
  Calendar,
  Filter,
  MoreVertical,
  RefreshCw,
  Trash2,
  CheckSquare,
  User,
  Building,
} from 'lucide-react';

interface Notification {
  notificationid: number;
  landlord_id: string;
  type: string;
  title: string;
  message: string;
  studentname: string;
  studentid: string;
  hostelname?: string;
  roomnumber?: string;
  createdat: Date;
  isRead: boolean;
  bookingid?: string;
}

const LandlordNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const itemsPerPage = 10;

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchNotifications(currentPage * itemsPerPage, itemsPerPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const fetchNotifications = async (offset: number, limit: number) => {
    try {
      const response = await axios.get(`${API_URL}/api/notifications?limit=${limit}&offset=${offset}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setNotifications(response.data.notifications);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        toast.error('No notifications found.');
      } else {
        console.error('Error fetching notifications:', error);
        toast.error('Failed to fetch notifications.');
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await axios.put(`${API_URL}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.notificationid === id ? { ...notification, isRead: true } : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read.');
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setNotifications((prev) => prev.filter((notification) => notification.notificationid !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification.');
    }
  };

  const getRelativeTime = (timestamp: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(timestamp).getTime()) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesTypeFilter = filter === 'all' || notification.type === filter;
    const matchesReadFilter = !showUnreadOnly || !notification.isRead;
    return matchesTypeFilter && matchesReadFilter;
  });

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'cancellation':
        return <Trash2 className="w-6 h-6 text-red-500" />;
      case 'payment':
        return <CheckSquare className="w-6 h-6 text-blue-500" />;
      case 'system':
        return <Bell className="w-6 h-6 text-yellow-500" />;
      default:
        return <Bell className="w-6 h-6 text-gray-500" />;
    }
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div className="flex items-center">
          <Bell className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Notifications</h1>
            <p className="text-gray-600">Stay updated with booking activities</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {unreadCount} Unread
          </span>
          <button
            onClick={() => {
              setNotifications((prev) =>
                prev.map((notification) => ({ ...notification, isRead: true }))
              );
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center text-sm"
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            Mark All Read
          </button>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg flex items-center text-sm"
            onClick={() => fetchNotifications(currentPage * itemsPerPage, itemsPerPage)}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="flex items-center">
              <Filter className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-gray-700">Filter by:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('booking')}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'booking'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                Bookings
              </button>
              <button
                onClick={() => setFilter('cancellation')}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'cancellation'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                Cancellations
              </button>
              <button
                onClick={() => setFilter('payment')}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'payment'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                Payments
              </button>
              <button
                onClick={() => setFilter('system')}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'system'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                System
              </button>
            </div>
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={showUnreadOnly}
                onChange={() => setShowUnreadOnly(!showUnreadOnly)}
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">Unread only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredNotifications.length > 0 ? (
        <>
          {filteredNotifications.map((notification) => (
            <div
              key={notification.notificationid}
              className={`bg-white rounded-lg shadow-md overflow-hidden transition-all ${
                !notification.isRead ? 'border-l-4 border-blue-500' : ''
              }`}
              onClick={() => markAsRead(notification.notificationid)}
            >
              <div className="p-4 md:p-6">
                <div className="flex items-start">
                  {getNotificationIcon(notification.type)}
                  <div className="ml-4 flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3
                          className={`text-lg font-semibold ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-2">
                          {getRelativeTime(notification.createdat)}
                        </span>
                        <div className="relative inline-block text-left">
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          {/* Dropdown menu would go here */}
                        </div>
                      </div>
                    </div>
                    {/* Details section */}
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 gap-2 sm:gap-6">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        <span>{notification.studentname} ({notification.studentid})</span>
                      </div>
                      {notification.hostelname && notification.roomnumber && (
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-1" />
                          <span>{notification.hostelname}, Room {notification.roomnumber}</span>
                        </div>
                      )}
                      {notification.bookingid && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>Booking ID: {notification.bookingid}</span>
                        </div>
                      )}
                    </div>
                    {/* Action buttons */}
                    <div className="mt-4 flex justify-end">
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.notificationid);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center mr-4"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.notificationid);
                        }}
                        className="text-sm text-red-600 hover:text-red-800 flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {/* Pagination Controls */}
          <div className="flex justify-between mt-4">
            <button onClick={handlePreviousPage} disabled={currentPage === 0}>
              Previous
            </button>
            <button onClick={handleNextPage}>Next</button>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700">No notifications found</h3>
          <p className="text-gray-500 mt-2">
            {filter !== 'all'
              ? `You don't have any ${filter} notifications at the moment.`
              : showUnreadOnly
              ? "You don't have any unread notifications."
              : "You don't have any notifications at the moment."}
          </p>
        </div>
      )}
    </div>
  );
};

export default LandlordNotificationsPage;