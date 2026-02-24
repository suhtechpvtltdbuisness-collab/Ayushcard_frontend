import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">

          {/* Logo - Redirect to Home */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo.svg"
              alt="BKBS Trust Logo"
              className="w-20 h-20 object-contain rounded-full cursor-pointer"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link to="/about" className="hover:text-[#F68E5F] transition-colors duration-200">
              About Us
            </Link>
            <Link to="/associated-hospitals" className="hover:text-[#F68E5F] transition-colors duration-200">
              Associated Hospitals
            </Link>
            <Link to="/ayush-card" className="hover:text-[#F68E5F] transition-colors duration-200">
              Ayush Card
            </Link>
            <Link to="/contact" className="hover:text-[#F68E5F] transition-colors duration-200">
              Contact Us
            </Link>
          </div>

          {/* Donate Button */}
          <div className="hidden md:block">
            <button className="flex items-center gap-2 bg-[#F68E5F] active:scale-95 text-white text-sm font-semibold pl-5 pr-1 py-1 rounded-full transition-all duration-200 shadow-md">
              Donate
              <span className="flex items-center justify-center bg-white rounded-full w-7 h-7">
                <img src="/donateicon.svg" alt="Donate Icon" className="w-4 h-4" />
              </span>
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-1"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 text-gray-700 font-medium border-t border-orange-100 pt-4">
            <Link to="/about" className="block hover:text-[#F68E5F] transition-colors">
              About Us
            </Link>
            <Link to="/associated-hospitals" className="block hover:text-[#F68E5F] transition-colors">
              Associated Hospitals
            </Link>
            <Link to="/ayush-card" className="block hover:text-[#F68E5F] transition-colors">
              Ayush Card
            </Link>
            <Link to="/contact" className="block hover:text-[#F68E5F] transition-colors">
              Contact Us
            </Link>

            <button className="flex items-center justify-between bg-[#F68E5F] text-white font-semibold pl-5 pr-1 py-1 rounded-full transition-all duration-200 w-full">
              Donate
              <span className="flex items-center justify-center bg-white rounded-full w-7 h-7">
                <img src="/donateicon.svg" alt="Donate Icon" className="w-4 h-4" />
              </span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;