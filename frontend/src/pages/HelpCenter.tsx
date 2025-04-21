import  { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  Video, 
  MessageCircle, 
  Clock, 
  Book, 
  Mail 
} from 'lucide-react';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const helpResources = [
    {
      category: "Getting Started",
      items: [
        {
          title: "Quick Start Guide",
          description: "Learn how to create an account and make your first booking",
          icon: <BookOpen className="w-6 h-6 text-blue-600" />
        },
        {
          title: "Video Tutorials",
          description: "Step-by-step video guides for platform navigation",
          icon: <Video className="w-6 h-6 text-green-600" />
        }
      ]
    },
    {
      category: "Support Channels",
      items: [
        {
          title: "Live Chat Support",
          description: "Instant assistance during working hours",
          icon: <MessageCircle className="w-6 h-6 text-purple-600" />
        },
        {
          title: "Support Hours",
          description: "Monday-Friday, 8:00 AM - 5:00 PM GMT",
          icon: <Clock className="w-6 h-6 text-yellow-600" />
        }
      ]
    }
  ];

  const supportTopics = [
    {
      title: "Account Management",
      description: "Resetting passwords, updating profile, and account security",
      icon: <Book className="w-8 h-8 text-blue-600" />
    },
    {
      title: "Booking Troubleshooting",
      description: "Resolving booking conflicts and technical issues",
      icon: <HelpCircle className="w-8 h-8 text-green-600" />
    },
    {
      title: "Contact Support",
      description: "Reach out via email for complex inquiries",
      icon: <Mail className="w-8 h-8 text-red-600" />
    }
  ];

  const contactMethods = [
    {
      method: "Email Support",
      contact: "support@knustbooking.edu.gh",
      icon: <Mail className="w-6 h-6 text-blue-600 mr-3" />
    },
    {
      method: "Phone Support",
      contact: "+233 (0) 302 213 400",
      icon: <MessageCircle className="w-6 h-6 text-green-600 mr-3" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <HelpCircle className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            KNUST Booking Platform Help Center
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Get the support you need to make the most of our booking platform
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search help topics, guides, and support"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Help Resources */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {helpResources.map((section, index) => (
            <div 
              key={index} 
              className="bg-white shadow-md rounded-lg p-6"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                {section.category}
              </h2>
              <div className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <div 
                    key={itemIndex} 
                    className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {item.icon}
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-800">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Support Topics */}
        <div className="bg-white shadow-md rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Support Topics
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {supportTopics.map((topic, index) => (
              <div 
                key={index} 
                className="text-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-center mb-4">
                  {topic.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  {topic.title}
                </h3>
                <p className="text-gray-600">
                  {topic.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-blue-100 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            Need Immediate Assistance?
          </h3>
          <div className="flex justify-center space-x-6">
            {contactMethods.map((contact, index) => (
              <div 
                key={index} 
                className="flex items-center bg-white p-4 rounded-lg shadow-md"
              >
                {contact.icon}
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {contact.method}
                  </h4>
                  <p className="text-gray-600">
                    {contact.contact}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;