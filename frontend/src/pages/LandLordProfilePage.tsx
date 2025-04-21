import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Building, FileText, Edit, Save, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  totalRooms: number;
  availableRooms: number;
  pricePerMonth: number;
  distanceFromCampus: string;
  amenities: string[];
}

interface LandlordProfile {
  userId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  businessName?: string;
  registrationNumber?: string;
  accountCreated: string;
  totalProperties: number;
  totalRooms: number;
  properties: Property[];
}

const LandlordProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<LandlordProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<LandlordProfile | null>(null);
  const [expandedPropertyId, setExpandedPropertyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.API_URL;

  useEffect(() => {
    const fetchProfileDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/auth/landlord`, {
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
        ...profile,
        businessName: profile.businessName || '',
        registrationNumber: profile.registrationNumber || '',
      });
    }
    setIsEditing(!isEditing);
  };

  const validateForm = () => {
    const { businessName, registrationNumber, email, phone, address } = editedProfile || {};
    if (!businessName || !registrationNumber || !email || !phone || !address) {
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
      await axios.put(`${API_URL}/api/auth/landlord`, editedProfile, {
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
      ...prev!,
      [name]: value,
    }));
  };

  const togglePropertyExpand = (propertyId: string) => {
    if (expandedPropertyId === propertyId) {
      setExpandedPropertyId(null);
    } else {
      setExpandedPropertyId(propertyId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : profile ? (
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-6 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-white p-3 rounded-full">
                    <User size={64} className="text-teal-600" />
                  </div>
                  <div className="ml-6">
                    <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
                    <p className="text-teal-100">Landlord ID: {profile.userId}</p>
                    <p className="text-teal-100">{profile.businessName || 'Private Landlord'}</p>
                  </div>
                </div>
                <button
                  onClick={handleEditToggle}
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-teal-600 shadow-sm hover:bg-teal-50"
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
                {/* Personal/Business Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Business Information</h3>
                    <p className="mt-1 text-sm text-gray-500">Details about your account and contact information.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Building className="flex-shrink-0 h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="ml-3 w-full">
                        <div className="text-sm font-medium text-gray-900">Business Name</div>
                        {isEditing ? (
                          <input
                            type="text"
                            name="businessName"
                            value={editedProfile?.businessName || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
                          />
                        ) : (
                          <div className="text-sm text-gray-500">{profile.businessName || 'Not specified'}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FileText className="flex-shrink-0 h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="ml-3 w-full">
                        <div className="text-sm font-medium text-gray-900">Registration Number</div>
                        {isEditing ? (
                          <input
                            type="text"
                            name="registrationNumber"
                            value={editedProfile?.registrationNumber || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
                          />
                        ) : (
                          <div className="text-sm text-gray-500">{profile.registrationNumber || 'Not specified'}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Mail className="flex-shrink-0 h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="ml-3 w-full">
                        <div className="text-sm font-medium text-gray-900">Email</div>
                        {isEditing ? (
                          <input
                            type="email"
                            name="email"
                            value={editedProfile?.email || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
                          />
                        ) : (
                          <div className="text-sm text-gray-500">{profile.email}</div>
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
                            value={editedProfile?.phone || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
                          />
                        ) : (
                          <div className="text-sm text-gray-500">{profile.phone}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="flex-shrink-0 h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="ml-3 w-full">
                        <div className="text-sm font-medium text-gray-900">Business Address</div>
                        {isEditing ? (
                          <input
                            type="text"
                            name="address"
                            value={editedProfile?.address || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
                          />
                        ) : (
                          <div className="text-sm text-gray-500">{profile.address}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900">Account Summary</h4>
                    <dl className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Account Created</dt>
                        <dd className="text-sm text-gray-900">{new Date(profile.accountCreated).toLocaleDateString()}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Total Properties</dt>
                        <dd className="text-sm text-gray-900">{profile.totalProperties}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Total Rooms</dt>
                        <dd className="text-sm text-gray-900">{profile.totalRooms}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Available Rooms</dt>
                        <dd className="text-sm text-gray-900">
                          {profile.properties.reduce((sum, property) => sum + property.availableRooms, 0)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
                {/* Properties Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Your Properties</h3>
                    <p className="mt-1 text-sm text-gray-500">Manage your listed accommodations</p>
                  </div>
                  <div className="space-y-4">
                    {profile.properties.map((property) => (
                      <div key={property.id} className="border border-gray-200 rounded-md overflow-hidden">
                        <div
                          className="flex justify-between items-center p-4 cursor-pointer bg-gray-50"
                          onClick={() => togglePropertyExpand(property.id)}
                        >
                          <div>
                            <h4 className="font-medium text-gray-900">{property.name}</h4>
                            <p className="text-sm text-gray-500">{property.address}</p>
                          </div>
                          <div className="flex items-center">
                            <div className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">
                              {property.availableRooms} / {property.totalRooms} rooms available
                            </div>
                          </div>
                        </div>
                        {expandedPropertyId === property.id && (
                          <div className="p-4 border-t border-gray-200">
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                              <div>
                                <dt className="text-gray-500">Property Type</dt>
                                <dd className="font-medium text-gray-900">{property.type}</dd>
                              </div>
                              <div>
                                <dt className="text-gray-500">Price per Month</dt>
                                <dd className="font-medium text-gray-900">${property.pricePerMonth}</dd>
                              </div>
                              <div>
                                <dt className="text-gray-500">Distance from Campus</dt>
                                <dd className="font-medium text-gray-900">{property.distanceFromCampus}</dd>
                              </div>
                              <div>
                                <dt className="text-gray-500">Total Rooms</dt>
                                <dd className="font-medium text-gray-900">{property.totalRooms}</dd>
                              </div>
                              <div className="col-span-2">
                                <dt className="text-gray-500">Amenities</dt>
                                <dd className="font-medium text-gray-900">
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {property.amenities.map((amenity, index) => (
                                      <span key={index} className="bg-gray-100 px-2 py-1 text-xs rounded-full">
                                        {amenity}
                                      </span>
                                    ))}
                                  </div>
                                </dd>
                              </div>
                            </dl>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Save Button When Editing */}
            {isEditing && (
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  onClick={handleSaveChanges}
                  className="inline-flex justify-center rounded-md border border-transparent bg-teal-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
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
          <a href="/login" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Login Now
          </a>
        </div>
      )}
    </div>
  );
};

export default LandlordProfilePage;