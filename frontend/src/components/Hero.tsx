import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";

const Hero = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 text-white py-24 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-white rounded-full"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-white rounded-full"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h1
            className="text-5xl md:text-6xl font-extrabold leading-tight"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Find Your Perfect Hostel Near KNUST
          </motion.h1>
          
          <motion.p
            className="text-xl mt-6 text-blue-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Easily browse, compare, book, and pay for hostels in just a few clicks.
          </motion.p>
          
          <motion.div 
            className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            {/* Book a Hostel Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/hostels"
                className="w-full sm:w-auto bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center"
              >
                <span>Browse Hostels</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </motion.div>
            
            {/* List Your Hostel Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/register"
                className="w-full sm:w-auto bg-gray-900 text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center"
              >
                <span>List Your Hostel</span>
                <Plus className="w-5 h-5 ml-2" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;