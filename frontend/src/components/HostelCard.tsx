import { useNavigate } from "react-router-dom";

interface HostelProps {
    id: number;
    name: string;
    description: string;
    location: string;
    amenities: string[];
    images: string[];
}

interface Props {
    hostel: HostelProps;
}

const HostelCard = ({ hostel }: Props) => {
    const navigate = useNavigate();

    const handleBookNow = () => {
        navigate(`/hostels/${hostel.id}`);
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                <img 
                    src={hostel.images[0] || '/placeholder-hostel.jpg'} 
                    alt={hostel.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{hostel.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{hostel.description}</p>
                
                {/* Location */}
                <div className="flex items-center text-gray-500 text-sm mb-4">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {hostel.location}
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {hostel.amenities.map((amenity, index) => (
                        <span 
                            key={index}
                            className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                        >
                            {amenity}
                        </span>
                    ))}
                </div>

                {/* Book Now Button */}
                <button
                    onClick={handleBookNow}
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors duration-300 cursor-pointer"
                >
                    View Details & Book
                </button>
            </div>
        </div>
    );
};

export default HostelCard;