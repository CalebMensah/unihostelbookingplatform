
import { Users, Goal, Book, Award } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            About KNUST Booking Platform
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Simplifying campus hostel booking for students
          </p>
        </div>

        {/* Mission and Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white shadow-lg rounded-lg p-8 transform transition hover:scale-105">
            <Goal className="w-12 h-12 text-blue-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-600">
              To revolutionize hostel sourcing and booking by providing a seamless, 
              user-friendly platform that enables efficient booking of hostels across the KNUST campus.
            </p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-8 transform transition hover:scale-105">
            <Award className="w-12 h-12 text-green-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h2>
            <p className="text-gray-600">
              To become the leading campus booking solution that enhances 
              and simplifies hostel bookings for students.
            </p>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-white shadow-lg rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">User-Friendly Interface</h3>
              <p className="text-gray-600">
                Intuitive design that makes booking resources quick and easy
              </p>
            </div>
            <div className="text-center">
              <Book className="w-16 h-16 mx-auto text-red-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Comprehensive Booking</h3>
              <p className="text-gray-600">
                Book hostels everywhere at ease
              </p>
            </div>
            <div className="text-center">
              <Award className="w-16 h-16 mx-auto text-yellow-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-Time Availability</h3>
              <p className="text-gray-600">
                Instant updates on hostels and booking status
              </p>
            </div>
          </div>
        </div>

        {/* Team Introduction */}
        <div className="bg-blue-50 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Our Team
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Caleb Agyekum Mensah", role: "Lead Developer", color: "blue" },
              { name: "Joshua Agyekum Mensah", role: "UX/UI Designer", color: "green" },
              { name: "Eunice Agyekum Mensah", role: "Project Manager", color: "purple" }
            ].map((member, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-md p-6 text-center transform transition hover:scale-105"
              >
                <div className={`w-24 h-24 mx-auto rounded-full bg-${member.color}-100 flex items-center justify-center mb-4`}>
                  <span className={`text-3xl font-bold text-${member.color}-600`}>
                    {member.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;