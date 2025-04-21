/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { useEffect, useState } from 'react';
import HostelCard from '../components/HostelCard';

export interface FilterOptions {
  location: string;
  minPrice: number;
  maxPrice: number;
  amenities: string[];
}

export interface HostelProps {
  id: number;
  name: string;
  description: string;
  location: string;
  amenities: string[];
  images: string[];
}

const HostelsPage = () => {
  const [hostels, setHostels] = useState<HostelProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    location: '',
    minPrice: 0,
    maxPrice: 0,
    amenities: []
  });

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (filters.location) params.append('location', filters.location);
        if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
        if (filters.amenities.length > 0) params.append('amenities', filters.amenities.join(','));

        const res = await axios.get(`${API_URL}/api/hostels?${params.toString()}`);
        setHostels(res.data);
        setLoading(false);
      } catch (error: any) {
        setError(error.message);
        setLoading(false);
        console.error("Error fetching hostels:", error);
      }
    };

    fetchHostels();
  }, [searchQuery, filters, API_URL]);

  const handleAmenitiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amenitiesArray = e.target.value ? e.target.value.split(',').map(item => item.trim()) : [];
    setFilters({...filters, amenities: amenitiesArray});
  };

  if (loading) return (
    <div className='flex justify-center items-center min-h-screen'>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className='container mx-auto p-4 text-center'>
      <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
        <p><strong>Error:</strong> {error}</p>
      </div>
    </div>
  );

  return (
    <div className='container mx-auto px-4 py-8 max-w-7xl'>
      <h1 className='text-3xl font-bold mb-6 text-center text-gray-800'>Find Your Perfect Hostel</h1>
      
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search hostels by name, location or amenities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              placeholder="Any location"
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Min Price</label>
            <input
              type="number"
              placeholder="0"
              value={filters.minPrice || ''}
              onChange={(e) => setFilters({...filters, minPrice: Number(e.target.value)})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Max Price</label>
            <input
              type="number"
              placeholder="No limit"
              value={filters.maxPrice || ''}
              onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value)})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Amenities</label>
            <input
              type="text"
              placeholder="WiFi, AC, Kitchen, etc."
              value={filters.amenities.join(', ')}
              onChange={handleAmenitiesChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {hostels && hostels.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {Array.isArray(hostels) && hostels.map((hostel) => (
            <HostelCard
              key={hostel.id}
              hostel={hostel}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className='text-xl text-gray-600 font-medium'>No hostels found.</p>
          <p className='text-gray-500 mt-2'>Try adjusting your filters or search query.</p>
        </div>
      )}
    </div>
  );
};

export default HostelsPage;