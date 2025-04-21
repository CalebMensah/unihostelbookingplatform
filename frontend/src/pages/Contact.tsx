import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  User,
  MessageSquare,
  Send,
} from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const response = await fetch('/api/admin/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      alert(data.message);

      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('Submission failed:', error);
      setSubmissionError('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactDetails = [
    {
      id: 'address',
      icon: <MapPin className="w-6 h-6 text-blue-600" />,
      title: 'Address',
      description: 'KNUST Main Campus, Kumasi, Ghana',
    },
    {
      id: 'phone',
      icon: <Phone className="w-6 h-6 text-green-600" />,
      title: 'Phone',
      description: '+233 (0) 598 785 053',
    },
    {
      id: 'email',
      icon: <Mail className="w-6 h-6 text-red-600" />,
      title: 'Email',
      description: 'supportknustbooking@gmail.com',
    },
    {
      id: 'hours',
      icon: <Clock className="w-6 h-6 text-yellow-600" />,
      title: 'Support Hours',
      description: 'Available 24 hours all day',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Contact KNUST Booking Platform
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            We're here to help! Reach out to us with any questions, feedback, or support needs.
          </p>
        </div>

        {/* Contact Information */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {contactDetails.map((detail) => (
            <div
              key={detail.id}
              className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-center mb-4">{detail.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-2">{detail.title}</h3>
              <p className="text-gray-600">{detail.description}</p>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Form Section */}
          <div className="bg-white shadow-md rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Send Us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center border-b border-gray-200 pb-3">
                <User className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  aria-label="Your Name"
                  className="w-full focus:outline-none"
                />
              </div>
              <div className="flex items-center border-b border-gray-200 pb-3">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  aria-label="Your Email"
                  className="w-full focus:outline-none"
                />
              </div>
              <div className="flex items-center border-b border-gray-200 pb-3">
                <MessageSquare className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  aria-label="Subject"
                  className="w-full focus:outline-none"
                />
              </div>
              <div>
                <textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  aria-label="Your Message"
                  className="w-full border-b border-gray-200 focus:outline-none resize-none"
                />
              </div>
              {submissionError && (
                <p className="text-red-600 text-sm">{submissionError}</p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Map and Additional Information */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="h-64 bg-gray-200 flex items-center justify-center">
              <img
                src="https://via.placeholder.com/600x400"
                alt="KNUST Campus Location"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Find Us on Campus
              </h3>
              <p className="text-gray-600 mb-4">
                Call our representative on campus on 050 960 3983 / 050 935 4082.
              </p>
              <div className="flex items-center text-gray-700">
                <MapPin className="w-5 h-5 mr-2 text-red-500" />
                <span>Kotei</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;