import  { useState } from 'react';
import { Lock, Shield, Database, UserCheck, FileText } from 'lucide-react';

const PrivacyAndPolicies = () => {
  const [activeSection, setActiveSection] = useState<number | null>(null);

  const privacyPolicies = [
    {
      title: "Data Collection",
      icon: <Database className="w-8 h-8 text-blue-600" />,
      content: [
        "We collect minimal personal information necessary for platform functionality, including:",
        "- Full name",
        "- Email address",
        "- Contact information",
        "- Booking history and preferences",
        "Data collection is strictly limited to essential service provision and user authentication."
      ]
    },
    {
      title: "Data Usage and Protection",
      icon: <Lock className="w-8 h-8 text-green-600" />,
      content: [
        "Your personal data is used solely for:",
        "- User authentication",
        "- Booking management",
        "- Communication about platform services",
        "We implement robust security measures including:",
        "- End-to-end encryption",
        "- Regular security audits",
        "- Secure data storage with restricted access",
        "We never sell or share your personal information with third parties without explicit consent."
      ]
    },
    {
      title: "User Rights",
      icon: <UserCheck className="w-8 h-8 text-purple-600" />,
      content: [
        "Users have the following rights regarding their data:",
        "- Right to access personal information",
        "- Right to request data deletion",
        "- Right to correct inaccurate information",
        "- Option to opt-out of non-essential communications",
        "Requests can be submitted through our support portal or by contacting our data protection officer."
      ]
    },
    {
      title: "Compliance and Regulations",
      icon: <Shield className="w-8 h-8 text-red-600" />,
      content: [
        "Our platform adheres to:",
        "- Ghana Data Protection Act",
        "- GDPR guidelines",
        "- KNUST data protection policies",
        "We maintain comprehensive documentation of our data handling practices.",
        "Regular compliance audits are conducted to ensure user data protection."
      ]
    },
    {
      title: "Cookies and Tracking",
      icon: <FileText className="w-8 h-8 text-yellow-600" />,
      content: [
        "We use minimal cookies for:",
        "- User session management",
        "- Performance optimization",
        "- Essential platform functionality",
        "Users can manage cookie preferences in their browser settings.",
        "We do not use cookies for advertising or third-party tracking."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Privacy and Data Policies
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Comprehensive overview of data handling, user protection, and platform commitments
          </p>
        </div>

        {/* Policies Container */}
        <div className="space-y-6">
          {privacyPolicies.map((policy, index) => (
            <div 
              key={index} 
              className="bg-white shadow-md rounded-lg overflow-hidden"
            >
              {/* Policy Header */}
              <div 
                onClick={() => setActiveSection(activeSection === index ? null : index)}
                className="flex items-center justify-between p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {policy.icon}
                  <h2 className="text-xl font-semibold text-gray-800">
                    {policy.title}
                  </h2>
                </div>
                <span className="text-gray-500">
                  {activeSection === index ? '−' : '+'}
                </span>
              </div>

              {/* Policy Content */}
              {activeSection === index && (
                <div className="p-6 bg-white text-gray-700">
                  {policy.content.map((line, lineIndex) => (
                    <p 
                      key={lineIndex} 
                      className={`${
                        line.startsWith('-') 
                          ? 'pl-4 text-gray-600' 
                          : 'font-medium mb-2'
                      }`}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact and Consent */}
        <div className="mt-12 bg-blue-100 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Questions About Your Data?
          </h3>
          <p className="text-gray-700 mb-6">
            For any privacy-related inquiries or data management requests, 
            please contact our Data Protection Officer.
          </p>
          <div className="flex justify-center space-x-4">
            <a 
              href="mailto:dpo@knustbooking.edu.gh" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Email DPO
            </a>
            <a 
              href="tel:+233302213400" 
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Call Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyAndPolicies;