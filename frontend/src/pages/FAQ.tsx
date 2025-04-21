
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useState } from 'react';

const FrequentlyAskedQuestions = () => {
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  const faqData = [
    {
      category: "Booking Basics",
      questions: [
        {
          question: "How do I create an account?",
          answer: "To create an account, visit the registration page and use your email address. You'll need to verify your email and you will be provided with an ID.Please do well to keep the ID because you will need it for login. The process takes approximately 5-10 minutes."
        },
        {
          question: "What resources can I book?",
          answer: "Our platform allows booking of listed hostels."
        },
        {
          question: "Is there a booking limit?",
          answer: "Students can book for the number of hostels they like as long as they make payments for all. Priority is given to those who make payments for a room. Once you don't complete payment, you don't yet have access to the room."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          question: "What should I do if I encounter a technical issue?",
          answer: "If you experience any technical problems, first clear your browser cache and try again. If the issue persists, contact our support team at supportknustbooking@gmail.com or call our helpline at +233 (0) 598 785 053."
        },
        {
          question: "Can I access the platform on mobile devices?",
          answer: "Yes! Our platform is fully responsive and works on smartphones, tablets, and desktop computers. We recommend using the latest versions of Chrome, Firefox, or Safari for the best experience."
        },
        {
          question: "How secure is my personal information?",
          answer: "We use industry-standard encryption and follow GDPR guidelines to protect your personal information. Your data is securely stored and never shared with third parties without your explicit consent."
        }
      ]
    },
    {
      category: "Cancellation and Changes",
      questions: [
        {
          question: "How can I cancel a booking?",
          answer: "You can cancel a booking through your dashboard up to 2 hours before the scheduled time. Late cancellations may result in penalty payment.."
        },
        {
          question: "What happens if I miss my booked slot?",
          answer: "If you fail to use your booked slot the platform or hostel manager is not responsible for it. You can contact the hostel manager for any further enquires."
        }
      ]
    }
  ];

  const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
    setActiveQuestion(
      activeQuestion === `${categoryIndex}-${questionIndex}` 
        ? null 
        : `${categoryIndex}-${questionIndex}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <HelpCircle className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <h1 className="text-4xl font-bold text-gray-800">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-gray-600 max-w-xl mx-auto">
            Find answers to the most common questions about the KNUST Booking Platform
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-6">
          {faqData.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="bg-blue-50 p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  {category.category}
                </h2>
              </div>
              
              {category.questions.map((item, questionIndex) => (
                <div 
                  key={questionIndex} 
                  className="border-b last:border-b-0 border-gray-200"
                >
                  <button 
                    onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                    className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-700">
                      {item.question}
                    </span>
                    {activeQuestion === `${categoryIndex}-${questionIndex}` ? (
                      <ChevronUp className="w-5 h-5 text-blue-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  
                  {activeQuestion === `${categoryIndex}-${questionIndex}` && (
                    <div className="p-4 bg-gray-50 text-gray-600">
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-blue-100 rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Still Have Questions?
          </h3>
          <p className="text-gray-700 mb-4">
            If you couldn't find the answer you were looking for, please contact our support team.
          </p>
          <div className="flex justify-center space-x-4">
            <a 
              href="mailto:supportknustbooking@gmail.com" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Email Support
            </a>
            <a 
              href="tel:+233503168438" 
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Call Helpline
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrequentlyAskedQuestions;