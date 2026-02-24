import React, { useState } from "react";
import { ArrowUpRight, Phone } from "lucide-react";

const ContactUs = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", form);
  };

  const helpItems = [
    "Need help with Health Card application?",
    "Want to renew your existing Health Card?",
    "Looking for partner hospital information?",
    "Interested in making a donation?",
    "Have questions about our services?",
    "Want to volunteer with us?",
    "Partnership or collaboration inquiry?",
    "Need assistance or have feedback?",
  ];

  return (
    <section style={{ backgroundColor: "#ffffff" }} className="min-h-screen py-16 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
            Contact us
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
            We're here to help—share your thoughts or inquiries with us, and we'll get back to you soon!
          </p>
        </div>

        {/* Two column layout */}
        <div className="grid md:grid-cols-2 gap-10 items-start">

          {/* LEFT — Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Jannie Dawson"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-orange-400 transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="hello@uiwiki.co"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-orange-400 transition-colors"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="9485768593"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-orange-400 transition-colors"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Subject
                </label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-orange-400 transition-colors bg-white"
                >
                  <option>General Inquiry</option>
                  <option>Health Card Application</option>
                  <option>Card Renewal</option>
                  <option>Donation</option>
                  <option>Partnership</option>
                  <option>Feedback</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Message
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="I'd love to learn more about your services"
                  rows={5}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-orange-400 transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-[#F68E5F] hover:bg-[#F68E5F] active:scale-95 text-white text-sm font-semibold pl-5 pr-1 py-1 rounded-full transition-all duration-200 shadow-md"
                >
                  Submit Form
                  <span className="flex items-center justify-center bg-white rounded-full w-8 h-8">
                    <ArrowUpRight className="w-4 h-4 text-[#F68E5F]" />
                  </span>
                </button>
              </div>

            </form>
          </div>

          {/* RIGHT — How can we help + Phone card */}
          <div className="flex flex-col gap-8">

            {/* How can we help */}
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-5">
                How can we help?
              </h2>
              <ol className="flex flex-col gap-2.5">
                {helpItems.map((item, i) => (
                  <li key={i} className="text-gray-500 text-sm">
                    <span className="text-gray-400 mr-1">{i + 1}.</span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>

            {/* Phone Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F68E5F] flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">Phone</p>
                <p className="text-gray-500 text-xs">Office: +91 6292226351</p>
                <p className="text-gray-500 text-xs">Support: +91 99188 02030</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;