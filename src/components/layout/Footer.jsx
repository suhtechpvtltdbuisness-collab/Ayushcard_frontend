import React from 'react';
import { Phone, MessageCircle, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: "#1e2a35" }} className="text-gray-400">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex flex-col md:flex-row gap-12 md:gap-8">

          {/* Logo + Description */}
          <div className="md:w-64 flex-shrink-0">
            <img
              src="/logo.svg"
              alt="BKBS Trust"
              className="w-14 h-14 rounded-full object-contain mb-4"
            />
            <p className="text-gray-400 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet consectetur.<br />
              Dolor sit mattis leo malesuada.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-1 flex-wrap gap-10">

            {/* About Us */}
            <div className="min-w-[120px]">
              <h4 className="text-white font-semibold text-sm mb-4">About us</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Our Misssion</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Our Team</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Partnerships</a></li>
              </ul>
            </div>

            {/* Services */}
            <div className="min-w-[140px]">
              <h4 className="text-white font-semibold text-sm mb-4">Services</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Make a Donation</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Apply for Ayush Card</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Renew Ayush Card</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Volunteer with Us</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="min-w-[120px]">
              <h4 className="text-white font-semibold text-sm mb-4">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-orange-400 transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Success stories</a></li>
              </ul>
            </div>

            {/* Contact Us */}
            <div className="min-w-[200px]">
              <h4 className="text-white font-semibold text-sm mb-4">Contact Us</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <a href="tel:+919918802030" className="hover:text-orange-400 transition-colors">+91 99188 02030</a>
                </li>
                <li className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <a href="https://wa.me/919918802030" className="hover:text-orange-400 transition-colors">+91 99188 02030</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <a href="mailto:mishravivek5789@gmail.com" className="hover:text-orange-400 transition-colors">mishravivek5789@gmail.com</a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>1A New PAC Line Mangla<br />Vihar Kanpur-208018</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-600 mt-12 pt-6 text-center text-sm text-gray-500">
          Copyrights © 2025 II Rights Reserved by  Baijnaath Kesar Bai Sewa Trust
        </div>
      </div>
    </footer>
  );
};

export default Footer;