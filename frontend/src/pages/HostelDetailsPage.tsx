import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { ReviewsSummarySection } from "../components/ReviewsSummarySection";

interface HostelProps {
  id: number;
  name: string;
  description: string;
  location: string;
  amenities: string[];
  images: string[];
  rooms: Room[];
}

interface Room {
  id: number;
  floor: number;
  room_number: number;
  price: number;
  capacity: number;
  status: string;
  images: string[];
  current_occupancy?: number;
}

const HostelDetailsPage = () => {
  const user = localStorage.getItem("userId");
  const userid = localStorage.getItem("userid");
  const { id } = useParams();
  const [hostel, setHostel] = useState<HostelProps | null>(null);
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [roomDetails, setRoomDetails] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeRoomImageIndex, setActiveRoomImageIndex] = useState(0);
  const [showRoomImages, setShowRoomImages] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.API_URL;


  useEffect(() => {
    const fetchHostel = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/hostels/${id}`);
        if (!res.data) {
          throw new Error('No hostel data received');
        }

        if (!res.data.rooms) {
          console.warn('Hostel data received but rooms array is missing:', res.data);
          // Initialize empty rooms array if missing
          res.data.rooms = [];
        }

        if (!Array.isArray(res.data.rooms)) {
          console.warn('Rooms data is not an array:', res.data.rooms);
          res.data.rooms = [];
        }

        setHostel(res.data);
      } catch (error) {
        console.error('Error fetching hostel:', error);
        if (axios.isAxiosError(error)) {
          console.error('Axios error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
          });
        }
        toast.error("Failed to load hostel details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
    fetchHostel();
    }
  }, [API_URL, id]);

  // Add debug log for rooms data when rendering floors
  const availableFloors = hostel?.rooms ? Array.from(new Set(hostel.rooms.map(room => room.floor))) : [];
  console.log('Available floors:', availableFloors);

  const handleFloorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFloor(event.target.value);
    setSelectedRoom('');
    setRoomDetails(null);
  };

  const handleRoomChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const roomNumber = event.target.value;
    setSelectedRoom(roomNumber);
    
    if (roomNumber && selectedFloor && hostel?.rooms) {
      const floorNumber = parseInt(selectedFloor);
      
      // Log all rooms on the selected floor
      const roomsOnFloor = hostel.rooms.filter(r => r.floor === floorNumber);
      
      // Compare room numbers as strings to handle alphanumeric values
      const selectedRoomDetails = roomsOnFloor.find(
        room => String(room.room_number) === roomNumber
      );
      setRoomDetails(selectedRoomDetails ?? null);
    } else {
      setRoomDetails(null);
    }
  };

  const handleContinueBookingClick = async () => {
    if (!user) {
      toast.error('Please log in to book a room', {
        duration: 3000,
        position: 'top-center',
      });
      return;
    }

    if (!roomDetails || roomDetails.status !== 'available') {
      toast.error('Selected room is not available', {
        duration: 3000,
        position: 'top-center',
      });
      return;
    }

    navigate("/booking", {
      state: {
        user_id: userid,
        room_id: roomDetails.id,
        room_price: roomDetails.price,
        hostel_id: hostel?.id
      }
    });
  };

  // Add new function to handle image gallery toggle
  const toggleImageGallery = () => {
    setShowRoomImages(!showRoomImages);
    setActiveImageIndex(0);
    setActiveRoomImageIndex(0);
  };

  // Add new function for navigation buttons
  const handleImageNavigation = (direction: 'prev' | 'next', type: 'hostel' | 'room') => {
    if (type === 'hostel' && hostel?.images) {
      setActiveImageIndex(prev => 
        direction === 'prev'
          ? prev === 0 ? hostel.images.length - 1 : prev - 1
          : prev === hostel.images.length - 1 ? 0 : prev + 1
      );
    } else if (type === 'room' && roomDetails?.images) {
      setActiveRoomImageIndex(prev =>
        direction === 'prev'
          ? prev === 0 ? roomDetails.images.length - 1 : prev - 1
          : prev === roomDetails.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!hostel) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">Hostel not found or failed to load.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Image Gallery Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="relative">
          {/* Toggle Button */}
          {roomDetails && roomDetails.images && roomDetails.images.length > 0 && (
            <button
              onClick={toggleImageGallery}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              {showRoomImages ? 'Show Hostel Images' : 'Show Room Images'}
            </button>
          )}

          {/* Main Image Display */}
          <div className="relative h-64 md:h-96 bg-gray-200">
            {showRoomImages && roomDetails?.images && roomDetails.images.length > 0 ? (
              <>
                <img 
                  src={roomDetails.images[activeRoomImageIndex]} 
                  alt={`Room ${roomDetails.room_number} view ${activeRoomImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {roomDetails.images.length > 1 && (
                  <>
                    <div className="absolute inset-0 flex items-center justify-between p-4">
                      <button 
                        onClick={() => handleImageNavigation('prev', 'room')}
                        className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all"
                        aria-label="Previous image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleImageNavigation('next', 'room')}
                        className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all"
                        aria-label="Next image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                      {activeRoomImageIndex + 1} / {roomDetails.images.length}
                    </div>
                  </>
                )}
              </>
            ) : hostel?.images && hostel.images.length > 0 ? (
              <>
                <img 
                  src={hostel.images[activeImageIndex]} 
                  alt={`${hostel.name} view ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {hostel.images.length > 1 && (
                  <>
                  <div className="absolute inset-0 flex items-center justify-between p-4">
                    <button 
                        onClick={() => handleImageNavigation('prev', 'hostel')}
                      className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all"
                      aria-label="Previous image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button 
                        onClick={() => handleImageNavigation('next', 'hostel')}
                      className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all"
                      aria-label="Next image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                  {activeImageIndex + 1} / {hostel.images.length}
                </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No images available</p>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
            <div className="flex overflow-x-auto py-2 px-4 bg-gray-100 scrollbar-hide">
            {showRoomImages && roomDetails?.images && roomDetails.images.length > 0 ? (
              roomDetails.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Room ${roomDetails.room_number} thumbnail ${index + 1}`}
                  className={`h-16 w-24 object-cover rounded mr-2 cursor-pointer transition-all ${
                    index === activeRoomImageIndex ? 'border-2 border-blue-500' : 'opacity-70 hover:opacity-100'
                  }`}
                  onClick={() => setActiveRoomImageIndex(index)}
                />
              ))
            ) : hostel?.images && hostel.images.length > 1 && (
              hostel.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${hostel.name} thumbnail ${index + 1}`}
                  className={`h-16 w-24 object-cover rounded mr-2 cursor-pointer transition-all ${
                    index === activeImageIndex ? 'border-2 border-blue-500' : 'opacity-70 hover:opacity-100'
                  }`}
                  onClick={() => setActiveImageIndex(index)}
                />
              ))
            )}
            </div>
        </div>
        </div>

      {/* Hostel Header */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">{hostel?.name}</h1>
            <div className="flex items-center mt-2 md:mt-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-gray-600">{hostel?.location}</span>
            </div>
          </div>
          
          {hostel?.description && (
            <div className="mb-6">
              <p className="text-gray-700">{hostel.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Amenities Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Amenities
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {hostel.amenities && hostel.amenities.length > 0 ? (
            hostel.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                </div>
                <span className="text-gray-700 text-sm font-medium break-words">{amenity}</span>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4M12 20V4" />
              </svg>
              <p>No amenities listed for this hostel</p>
            </div>
          )}
        </div>
      </div>

      {/* Room Booking Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Select Room
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-2">
              Floor
            </label>
            <select
              id="floor"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedFloor}
              onChange={handleFloorChange}
            >
              <option value="">Select Floor</option>
              {hostel?.rooms && Array.isArray(hostel.rooms) && hostel.rooms.length > 0 ? (
                Array.from(new Set(hostel.rooms.map(room => {
                  console.log('Room floor:', room.floor);
                  return room.floor;
                })))
                  .sort((a, b) => a - b)
                  .map(floor => (
                <option value={floor} key={floor}>
                  Floor {floor}
                </option>
                  ))
              ) : (
                <option value="" disabled>No floors available</option>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-2">
              Room
            </label>
            <select
              id="room"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedRoom}
              onChange={handleRoomChange}
              disabled={!selectedFloor}
            >
              <option value="">Select Room</option>
              {selectedFloor && hostel.rooms ? 
                hostel.rooms
                  .filter(room => room.floor === parseInt(selectedFloor))
                  .sort((a, b) => a.room_number - b.room_number)
                  .map(room => (
                  <option value={room.room_number} key={room.room_number}>
                    Room {room.room_number}
                  </option>
                  ))
                : null
              }
            </select>
          </div>
        </div>

        {roomDetails ? (
          <div className="bg-gray-50 rounded-lg p-6 transition-all duration-300 ease-in-out">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Room Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-500 mb-1">Price</div>
                <div className="text-xl font-bold text-blue-600">${roomDetails.price}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-500 mb-1">Capacity</div>
                <div className="text-xl font-bold">{roomDetails.capacity} person{roomDetails.capacity !== 1 ? 's' : ''}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-500 mb-1">Occupancy</div>
                <div className="flex flex-col">
                  <div className="text-xl font-bold text-green-600">
                    {roomDetails.current_occupancy !== undefined ? 
                      `${roomDetails.capacity - roomDetails.current_occupancy} available` :
                      'Space available'
                    }
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {roomDetails.current_occupancy !== undefined ? 
                      `${roomDetails.current_occupancy} of ${roomDetails.capacity} occupied` :
                      `Total capacity: ${roomDetails.capacity}`
                    }
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                      className={`h-2.5 rounded-full ${
                        roomDetails.current_occupancy !== undefined ?
                          roomDetails.current_occupancy >= roomDetails.capacity ? 'bg-red-600' :
                          roomDetails.current_occupancy >= roomDetails.capacity * 0.8 ? 'bg-yellow-400' :
                          'bg-green-600' : 'bg-green-600'
                      }`}
                      style={{ 
                        width: `${roomDetails.current_occupancy !== undefined ? 
                          (roomDetails.current_occupancy / roomDetails.capacity) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-500 mb-1">Status</div>
                <div className={`text-xl font-bold ${
                  roomDetails.status === 'available' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {roomDetails.status.charAt(0).toUpperCase() + roomDetails.status.slice(1)}
                </div>
              </div>
            </div>
            <button
              className={`w-full md:w-auto px-6 py-3 rounded-lg font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                roomDetails.status === 'available' && (!roomDetails.current_occupancy || roomDetails.current_occupancy < roomDetails.capacity)
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              onClick={handleContinueBookingClick}
              disabled={roomDetails.status !== 'available' || (roomDetails.current_occupancy !== undefined && roomDetails.current_occupancy >= roomDetails.capacity)}
            >
              {roomDetails.status !== 'available' 
                ? 'Room Not Available' 
                : roomDetails.current_occupancy !== undefined && roomDetails.current_occupancy >= roomDetails.capacity
                ? 'Room Full'
                : 'Continue Booking'
              }
            </button>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center h-48">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
            <p className="text-gray-500">Select a floor and room to view details</p>
          </div>
        )}
      </div>

      <ReviewsSummarySection hostelId={hostel.id} />
    </div>
  );
};

export default HostelDetailsPage;