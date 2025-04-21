import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Home, Building, Info, Phone, LogIn, UserPlus, LayoutDashboardIcon } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = localStorage.getItem('userId');
  const role = localStorage.getItem("role");

  const getDashBoardLink = () => {
    if(!user) {
      return "/login"
    } else if (role === 'student'){
      return '/student-dashboard'
    } else if (role === 'landlord') {
      return 'manager-dashboard'
    }
    return '/'
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-gray-800 flex items-center">
            <Home className="text-blue-600 mr-2" size={24} />
            <span className="text-blue-600 mr-2">KNUST</span> Hostel Booking
          </Link>
           
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-800 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Desktop Menu */}
          <div className="hidden md:hidden lg:flex space-x-6">
            <Link to="/hostels" className="text-gray-800 hover:text-blue-500 transition-colors duration-300 flex items-center">
              <Building size={18} className="mr-1" />
              Hostels
            </Link>
            <Link to="/about" className="text-gray-800 hover:text-blue-500 transition-colors duration-300 flex items-center">
              <Info size={18} className="mr-1" />
              About
            </Link>
            <Link to="/contact" className="text-gray-800 hover:text-blue-500 transition-colors duration-300 flex items-center">
              <Phone size={18} className="mr-1" />
              Contact
            </Link>
            <Link to="/login" className="text-gray-800 hover:text-blue-500 transition-colors duration-300 flex items-center">
              <LogIn size={18} className="mr-1" />
              Login
            </Link>
            <Link to="/register" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all duration-300 flex items-center">
              <UserPlus size={18} className="mr-1" />
              Sign Up
            </Link>
            <Link to={getDashBoardLink()}  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all duration-300 flex items-center">
              <LayoutDashboardIcon size={18} className="mr-1" />
              Dashboard
            </Link>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden md:block mt-4 bg-white rounded-lg shadow-lg p-4 absolute left-6 right-6 z-50">
            <Link
              to="/hostels"
              className=" py-3 text-gray-800 hover:text-blue-500 border-b border-gray-100 flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <Building size={18} className="mr-2" />
              Hostels
            </Link>
            <Link
              to="/about"
              className="py-3 text-gray-800 hover:text-blue-500 border-b border-gray-100 flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <Info size={18} className="mr-2" />
              About
            </Link>
            <Link
              to="/contact"
              className=" py-3 text-gray-800 hover:text-blue-500 border-b border-gray-100 flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <Phone size={18} className="mr-2" />
              Contact
            </Link>
            <Link
              to="/login"
              className=" py-3 text-gray-800 hover:text-blue-500 border-b border-gray-100 flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <LogIn size={18} className="mr-2" />
              Login
            </Link>
            <Link
              to="/register"
              className=" py-3 text-center bg-blue-500 text-white rounded-md mt-3 hover:bg-blue-600 transition-all flex items-center justify-center"
              onClick={() => setIsOpen(false)}
            >
              <UserPlus size={18} className="mr-2" />
              Sign Up
            </Link>
            <Link to={getDashBoardLink()} className="bg-blue-500 text-white px-4 py-3 rounded-md hover:bg-blue-600 transition-all duration-300 flex items-center justify-center mt-2">
              <LayoutDashboardIcon size={18} className="mr-1" />
              Dashboard
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;