import React, { useState } from "react";
import { Phone, MessageCircle, Mail, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import DonationFormModal from "../sections/home/DonationFormModal";
import { useApplyAyushCardModal } from "../../context/ApplyAyushCardModalContext";

const Footer = () => {
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const navigate = useNavigate();
  const { openApplyAyushModal } = useApplyAyushCardModal();

  return (
    <footer style={{ backgroundColor: "#1e2a35" }} className="text-gray-400">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex flex-col md:flex-row gap-12 md:gap-8">
          {/* Logo + Description */}
          <div className="md:w-64 shrink-0">
            <Link to="/">
              <img
                src="/logo_whitebg.svg"
                alt="BKBS Trust"
                className="w-14 h-14 rounded-full object-contain mb-4 cursor-pointer"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Serving humanity with compassion and dedication. Providing
              affordable healthcare and support to those in need.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-1 flex-wrap gap-10">
            {/* About Us */}
            <div className="min-w-[120px]">
              <h4 className="text-white font-semibold text-sm mb-4">
                About us
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    to="/about"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Our Mission
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about#team-section"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Our Team
                  </Link>
                </li>
                <li>
                  <Link
                    to="/associated-hospitals"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Partnerships
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div className="min-w-[140px]">
              <h4 className="text-white font-semibold text-sm mb-4">
                Services
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <button
                    onClick={() => setIsDonationModalOpen(true)}
                    className="hover:text-orange-400 transition-colors text-left"
                  >
                    Make a Donation
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openApplyAyushModal()}
                    className="hover:text-orange-400 transition-colors text-left w-full"
                  >
                    Apply for Ayush Card
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/ayush-card")}
                    className="hover:text-orange-400 transition-colors text-left"
                  >
                    Renew Ayush Card
                  </button>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Volunteer with Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="min-w-[120px]">
              <h4 className="text-white font-semibold text-sm mb-4">
                Resources
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    to="/#faq-section"
                    className="hover:text-orange-400 transition-colors"
                  >
                    FAQs
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Success stories
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Us */}
            <div className="min-w-[200px]">
              <h4 className="text-white font-semibold text-sm mb-4">
                Contact Us
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <a
                    href="tel:+919918802030"
                    className="hover:text-orange-400 transition-colors"
                  >
                    +91 99188 02030
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-gray-400 shrink-0" />
                  <a
                    href="https://wa.me/919918802030"
                    className="hover:text-orange-400 transition-colors"
                  >
                    +91 99188 02030
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <a
                    href="mailto:mishravivek5789@gmail.com"
                    className="hover:text-orange-400 transition-colors"
                  >
                    mishravivek5789@gmail.com
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                  <a
                    href="https://maps.app.goo.gl/DutMSCjRNbtq8V8Q8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-orange-400 transition-colors leading-relaxed"
                  >
                    1A New PAC Line Mangla
                    <br />
                    Vihar Kanpur-208018
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-600 mt-12 pt-6 text-center text-sm text-gray-500">
          Copyrights © 2025 II Rights Reserved by Baijnaath Kesar Bai Sewa Trust
        </div>
      </div>

      <DonationFormModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
      />
    </footer>
  );
};

export default Footer;
