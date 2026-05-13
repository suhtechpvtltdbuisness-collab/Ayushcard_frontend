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
                    href="tel:+918303902030"
                    className="hover:text-orange-400 transition-colors"
                  >
                    +91 8303902030
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-gray-400 shrink-0" />
                  <a
                    href="https://wa.me/918303902030"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-orange-400 transition-colors"
                  >
                    +91 8303902030
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <a
                    href="mailto:mishravivek5789@gmail.com"
                    className="hover:text-orange-400 transition-colors"
                  >
                   bkbsewatrust@gmail.com
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

      <a
        href="https://wa.me/918303902030"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-2 ring-white/80 transition hover:scale-105 hover:bg-[#20BD5A] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 md:bottom-8 md:right-8"
        aria-label="Chat on WhatsApp"
        title="WhatsApp +91 8303902030"
      >
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>
    </footer>
  );
};

export default Footer;
