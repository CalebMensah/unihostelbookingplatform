
import { CheckCircle, AlertTriangle, Shield } from 'lucide-react';
import { useState } from 'react';

const TermsAndConditions = () => {
  const [isAccepted, setIsAccepted] = useState(false);

  const termsSection = [
    {
      title: "1. Platform Usage",
      content: "By accessing and using the KNUST Booking Platform, users agree to utilize the service responsibly and in accordance with the our guidelines. The platform is exclusively for KNUST students.",
      icon: <CheckCircle className="w-8 h-8 text-green-600 mr-4" />
    },
    {
      title: "2. User Responsibilities",
      content: "Users are responsible for maintaining the confidentiality of their account credentials. Any actions performed under a user's account are the sole responsibility of that user. Sharing of login information is strictly prohibited.",
      icon: <Shield className="w-8 h-8 text-blue-600 mr-4" />
    },
    {
      title: "3. Booking Policies",
      content: "Bookings are subject to availability and must be made within the designated timeframes. Users must adhere to the booked time slots and are responsible for leaving the resources in the same condition they were found.",
      icon: <AlertTriangle className="w-8 h-8 text-yellow-600 mr-4" />
    },
    {
      title: "4. Cancellation and Modifications",
      content: "Users can cancel or modify bookings up to 2 hours before the scheduled time. Late cancellations may result in penalty payment. Priority is given to academic and research-related bookings.",
      icon: <CheckCircle className="w-8 h-8 text-purple-600 mr-4" />
    },
    {
      title: "5. Resource Damage and Misuse",
      content: "Any deliberate damage to booked resources will result in disciplinary action. Users may be held financially responsible for repairs or replacement of damaged equipment or spaces.",
      icon: <AlertTriangle className="w-8 h-8 text-red-600 mr-4" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 text-center">
          <h1 className="text-3xl font-bold">KNUST Booking Platform</h1>
          <p className="mt-2 text-blue-100">Terms and Conditions</p>
        </div>

        {/* Terms Content */}
        <div className="p-8">
          <div className="space-y-6 mb-8">
            {termsSection.map((section, index) => (
              <div 
                key={index} 
                className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0">{section.icon}</div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {section.title}
                  </h2>
                  <p className="text-gray-600">{section.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Acceptance Checkbox */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="accept-terms" 
                checked={isAccepted}
                onChange={() => setIsAccepted(!isAccepted)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
              />
              <label 
                htmlFor="accept-terms" 
                className="text-sm text-gray-700"
              >
                I have read and agree to the Terms and Conditions
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between space-x-4">
            <button 
              className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              onClick={() => window.history.back()}
            >
              Decline
            </button>
            <button 
              className={`w-full py-3 rounded-lg transition-colors ${
                isAccepted 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
              disabled={!isAccepted}
            >
              Accept
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-4 text-center text-sm text-gray-600">
          Last Updated: March 2025 | © KNUST Booking Platform
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;