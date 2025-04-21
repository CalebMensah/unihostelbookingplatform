import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Calendar, Home, Edit, Save, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface StudentProfile {
  userid: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  name?: string;
  room_number?: number;
  start_date?: string;
  end_date?: string;
}

const StudentProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<StudentProfile>({
    userid: '',
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProfileDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/auth/student`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast.error('Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileDetails();
  }, [API_URL]);

  const handleEditToggle = () => {
    if (!isEditing && profile) {
      setEditedProfile({
        userid: profile.userid,
        firstname: profile.firstname || '',
        lastname: profile.lastname || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    }
    setIsEditing(!isEditing);
  };

  const validateForm = () => {
    const { firstname, lastname, email, phone } = editedProfile;
    if (!firstname || !lastname || !email || !phone) {
      toast.error('All fields are required.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) return;

    try {
      await axios.put(`${API_URL}/api/auth/student`, editedProfile, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      setProfile((prevProfile) => ({
        ...prevProfile!,
        ...editedProfile,
      }));

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setIsEditing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : profile ? (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-6 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-white p-3 rounded-full">
                    <User size={64} className="text-indigo-600" />
                  </div>
                  <div className="ml-6">
                    <h1 className="text-2xl font-bold text-white">
                      {profile?.firstname} {profile?.lastname}
                    </h1>
                    <p className="text-indigo-100">Student ID: {profile?.userid}</p>
                  </div>
                </div>
                <button
                  onClick={handleEditToggle}
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50"
                >
                  {isEditing ? (
                    <div className="flex items-center">
                      <X size={16} className="mr-2" />
                      Cancel
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Edit size={16} className="mr-2" />
                      Edit Profile
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Profile Content */}
            <div className="px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
                    <p className="mt-1 text-sm text-gray-500">Basic details about your student account.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Mail className="flex-shrink-0 h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="ml-3 w-full">
                        <div className="text-sm font-medium text-gray-900">Email</div>
                        {isEditing ? (
                          <input
                            type="email"
                            name="email"
                            value={editedProfile.email}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                          />
                        ) : (
                          <div className="text-sm text-gray-500">{profile?.email}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Phone className="flex-shrink-0 h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="ml-3 w-full">
                        <div className="text-sm font-medium text-gray-900">Phone</div>
                        {isEditing ? (
                          <input
                            type="tel"
                            name="phone"
                            value={editedProfile.phone}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                          />
                        ) : (
                          <div className="text-sm text-gray-500">{profile?.phone}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic & Hostel Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Academic & Hostel Information</h3>
                    <p className="mt-1 text-sm text-gray-500">Details about your studies and accommodation.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Home className="flex-shrink-0 h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="ml-3 w-full">
                        <div className="text-sm font-medium text-gray-900">Current Hostel</div>
                        <div className="text-sm text-gray-500">{profile?.name || 'Not assigned'}</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Home className="flex-shrink-0 h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="ml-3 w-full">
                        <div className="text-sm font-medium text-gray-900">Room Number</div>
                        <div className="text-sm text-gray-500">{profile?.room_number || 'Not assigned'}</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Calendar className="flex-shrink-0 h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="ml-3 w-full">
                        <div className="text-sm font-medium text-gray-900">Check-in Date</div>
                        <div className="text-sm text-gray-500">
                          {profile?.start_date ? new Date(profile.start_date).toLocaleDateString() : 'Not assigned'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Calendar className="flex-shrink-0 h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="ml-3 w-full">
                        <div className="text-sm font-medium text-gray-900">Check-out Date</div>
                        <div className="text-sm text-gray-500">
                          {profile?.end_date ? new Date(profile.end_date).toLocaleDateString() : 'Not assigned'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button When Editing */}
            {isEditing && (
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  onClick={handleSaveChanges}
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Please Login.</p>
          <Link to="/login" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Login Now
          </Link>
        </div>
      )}
    </div>
  );
};

export default StudentProfilePage;