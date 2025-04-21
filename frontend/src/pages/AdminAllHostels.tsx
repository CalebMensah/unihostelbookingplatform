import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, MapPin, Phone, Home, Check, X } from 'lucide-react';

// TypeScript interfaces
interface Hostel {
  id: number;
  name: string;
  landlordName: string;
  location: string;
  amenities: string[];
  availableRooms: number;
  totalRooms: number;
  imageUrl: string;
  contactNumber: string;
}

const AllHostelsPage: React.FC = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [pagination, setPagination]= useState({
    currentPage: 1,
    totalPages: 1,
    totalHostels: 0,
    limit: 10
  })

  // Fetch hostels from the backend
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await fetch(`/api/admin/hostels?page=${pagination.currentPage}&limit=${pagination.limit}`); // Replace with your backend API endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch hostels');
        }
        const data = await response.json();
        setHostels(data.data); // Assuming the backend returns data in the format { success: true, data: [] }
        setPagination((prev) => ({
          ...prev,
          totalPages: data.pagination.totalPages,
          totalHostels: data.pagination.totalHostels
        }))
        setLoading(false);
      } catch (err) {
        console.error('Error fetching hostels:', err);
        setError('An error occurred while fetching hostels. Please try again later.');
        setLoading(false);
      }
    };

    fetchHostels();
  }, [pagination.currentPage, pagination.limit]);

  const handlePaginationChange =(newPage: number) => {
    if(newPage >= 1 && newPage <= pagination.totalHostels) {
      setPagination((prev) => ({ ...prev, currentPage: newPage}))
    }
  }

  // Filter hostels based on search term and availability filter
  const filteredHostels = hostels.filter((hostel) => {
    const matchesSearch =
      hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hostel.landlordName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hostel.location.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'available') {
      return matchesSearch && hostel.availableRooms > 0;
    } else if (filterStatus === 'full') {
      return matchesSearch && hostel.availableRooms === 0;
    }
    return matchesSearch;
  });

  // Function to handle refresh - refetch data from the backend
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    fetch('/api/hostels') // Replace with your backend API endpoint
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch hostels');
        }
        return response.json();
      })
      .then((data) => {
        setHostels(data.data); // Assuming the backend returns data in the format { success: true, data: [] }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error refreshing hostels:', err);
        setError('An error occurred while refreshing hostels. Please try again later.');
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <h1 className="text-2xl font-bold text-gray-900">All Hostels</h1>
            <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-3">
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2 lg:w-2/3 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Search hostels by name, landlord, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-1/2 lg:w-1/3 flex gap-2">
            <div className="w-full relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Hostels</option>
                <option value="available">Available Rooms</option>
                <option value="full">Full Hostels</option>
              </select>
            </div>
          </div>
        </div>
        {/* Hostels Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredHostels.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">No hostels found matching your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHostels.map((hostel) => (
              <div
                key={hostel.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <img src={hostel.imageUrl} alt={hostel.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-semibold text-gray-900">{hostel.name}</h2>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        hostel.availableRooms > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {hostel.availableRooms > 0 ? 'Available' : 'Full'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    <span className="font-medium">Landlord:</span> {hostel.landlordName}
                  </p>
                  <div className="mt-3 flex items-start">
                    <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{hostel.location}</p>
                  </div>
                  <div className="mt-2 flex items-center">
                    <Phone className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{hostel.contactNumber}</p>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-medium text-gray-900">Amenities:</h3>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {hostel.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <Home className="h-5 w-5 text-gray-500 mr-2" />
                    <div className="text-sm">
                      <span className="font-medium">
                        {hostel.availableRooms}/{hostel.totalRooms}
                      </span>{' '}
                      rooms available
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                    <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Summary Stats */}
        {!loading && !error && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                <div className="flex items-center">
                  <Home className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-blue-600">Total Hostels</p>
                    <p className="text-xl font-bold text-blue-800">{filteredHostels.length}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                <div className="flex items-center">
                  <Check className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-green-600">Hostels with Availability</p>
                    <p className="text-xl font-bold text-green-800">
                      {filteredHostels.filter((h) => h.availableRooms > 0).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                <div className="flex items-center">
                  <X className="h-8 w-8 text-red-600 mr-3" />
                  <div>
                    <p className="text-sm text-red-600">Full Hostels</p>
                    <p className="text-xl font-bold text-red-800">
                      {filteredHostels.filter((h) => h.availableRooms === 0).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center item-center gap-4">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded disabled:bg-gray-400"
            onClick={() => handlePaginationChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            >
              Previous
            </button>
            <span className='text-gray-700'>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded disabled:bg-gray-400"
            onClick={() => handlePaginationChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AllHostelsPage;