import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Shield, CheckCircle, ArrowRight } from "lucide-react";

const Features = () => {
  const features = [
    { 
      title: "Easy Booking", 
      description: "Book your preferred hostel with just a few clicks and secure your spot instantly.",
      icon: <Calendar className="w-12 h-12 text-blue-500 mb-4" />
    },
    { 
      title: "Secure Payments", 
      description: "Pay safely using mobile money, bank transfer, or card with our protected payment system.",
      icon: <Shield className="w-12 h-12 text-blue-500 mb-4" />
    },
    { 
      title: "Verified Listings", 
      description: "Only trusted and verified hostels are listed, ensuring quality and safety for all students.",
      icon: <CheckCircle className="w-12 h-12 text-blue-500 mb-4" />
    },
  ];

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="container mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose Us?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            We provide the most reliable hostel booking service for KNUST students, with verified properties and hassle-free booking.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 text-center border border-gray-100"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              whileHover={{ y: -8 }}
            >
              <div className="flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <Link to="/hostels" className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium inline-flex items-center">
            <span>Explore Available Hostels</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;