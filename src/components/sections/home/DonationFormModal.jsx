import React, { useState, useEffect } from "react";
import { X, ArrowUpRight, CheckCircle2 } from "lucide-react";

const DonationFormModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    enquiryId: "",
    name: "",
    email: "",
    contactNumber: "",
    location: "",
    date: "",
    time: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const now = new Date();

      // Auto-generate Enquiry ID (Mock)
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const enqId = `ENQ-${randomId}`;

      // Format Date: DD-MM-YYYY
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      const dateStr = `${day}-${month}-${year}`;

      // Format Time: HH:MM AM/PM
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const timeStr = `${hours}:${minutes} ${ampm}`;

      setFormData((prev) => ({
        ...prev,
        enquiryId: enqId,
        date: dateStr,
        time: timeStr,
      }));
      setSubmitted(false);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Name constraint: No numbers allowed
    if (name === "name") {
      const filteredValue = value.replace(/[0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: filteredValue }));
      return;
    }

    // Contact number constraint: Exact 10 digits, no characters
    if (name === "contactNumber") {
      const filteredValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: filteredValue }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Final validation for contact number
    if (formData.contactNumber.length !== 10) {
      alert("Please enter a valid 10-digit contact number.");
      return;
    }

    console.log("Donation Enquiry Submitted:", formData);
    setSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 px-4 md:px-0 w-screen">
      <div
        className="bg-white rounded-[20px] md:rounded-3xl w-full max-w-[95%] md:max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 md:px-8 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-extrabold text-[#22333B]">
              Fill Donation Form
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Our team will contact you shortly
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 max-h-[70vh] overflow-y-auto">
          {submitted ? (
            <div className="py-6 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="text-green-600 w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Enquiry Sent Successfully!
              </h3>
              <p className="text-gray-500 max-w-md mb-8">
                Thank you for your interest. Our representative will contact you
                on your provided details within 24 hours.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Name */}
              <div className="md:col-span-1">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#F68E5F] transition-all focus:ring-4 focus:ring-[#F68E5F]/5"
                />
              </div>

              {/* Contact Number */}
              <div className="md:col-span-1">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                  maxLength={10}
                  placeholder="Enter your 10-digit number"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#F68E5F] transition-all focus:ring-4 focus:ring-[#F68E5F]/5"
                />
              </div>

              {/* Email */}
              <div className="md:col-span-1">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email address"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#F68E5F] transition-all focus:ring-4 focus:ring-[#F68E5F]/5"
                />
              </div>

              {/* Location */}
              <div className="md:col-span-1">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter your location (City, State)"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#F68E5F] transition-all focus:ring-4 focus:ring-[#F68E5F]/5"
                />
              </div>

              {/* Message */}
              <div className="md:col-span-2">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your contribution or ask a question..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#F68E5F] transition-all focus:ring-4 focus:ring-[#F68E5F]/5 resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 flex justify-end mt-4">
                <button
                  type="submit"
                  className="flex items-center gap-3 bg-[#F68E5F] hover:bg-[#e87a4a] active:scale-95 text-white text-sm font-bold pl-7 pr-1.5 py-1.5 rounded-full transition-all duration-300 shadow-lg group"
                >
                  Submit Form
                  <span className="flex items-center justify-center bg-white rounded-full w-9 h-9 group-hover:rotate-45 transition-transform duration-300">
                    <ArrowUpRight className="w-5 h-5 text-[#F68E5F]" />
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationFormModal;
