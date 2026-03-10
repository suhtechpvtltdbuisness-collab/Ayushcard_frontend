import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  CreditCard,
  UserCog,
} from "lucide-react";

const HelpSupport = () => {
  const [openAccordion, setOpenAccordion] = useState(null);

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const categories = [
    {
      title: "Health Cards",
      description: "Manage health cards, applications.",
      icon: <CreditCard className="w-5 h-5 text-[#F68E5F]" />,
      bgClass: "bg-[#FFF7ED]",
    },
    {
      title: "Donations",
      description: "Track all donation inquiries and their details.",
      icon: (
        <img
          src="/admin_images/donation_finance.svg"
          alt="donation"
          className="w-5 h-5"
        />
      ),
      bgClass: "bg-[#D1FAE5]",
    },
    {
      title: "Partners",
      description: "Manage Partners and their details",
      icon: (
        <img
          src="/admin_images/hospital.svg"
          alt="partners"
          className="w-5 h-5"
        />
      ),
      bgClass: "bg-[#DBEAFE]",
    },
    {
      title: "HR and Payroll",
      description: "Manage Employees and their salaries.",
      icon: <UserCog className="w-5 h-5 text-[#A855F7]" />,
      bgClass: "bg-[#F3E8FF]",
    },
  ];

  const popularQuestions = [
    {
      question: "Lorem ipsum dolor sit amet consectetur.",
      answer:
        "Lorem ipsum dolor sit amet consectetur. Euismod senectus tincidunt congue commodo vel condimentum. dolor sit amet consectetur. Euismod senectus tincidunt congue commodo vel condimentum.",
    },
    {
      question: "Lorem ipsum dolor sit amet consectetur.",
      answer:
        "Lorem ipsum dolor sit amet consectetur. Euismod senectus tincidunt congue commodo vel condimentum. dolor sit amet consectetur. Euismod senectus tincidunt congue commodo vel condimentum.",
    },
    {
      question: "Lorem ipsum dolor sit amet consectetur.",
      answer:
        "Lorem ipsum dolor sit amet consectetur. Euismod senectus tincidunt congue commodo vel condimentum. dolor sit amet consectetur. Euismod senectus tincidunt congue commodo vel condimentum.",
    },
    {
      question: "Lorem ipsum dolor sit amet consectetur.",
      answer:
        "Lorem ipsum dolor sit amet consectetur. Euismod senectus tincidunt congue commodo vel condimentum. dolor sit amet consectetur. Euismod senectus tincidunt congue commodo vel condimentum.",
    },
    {
      question: "Lorem ipsum dolor sit amet consectetur.",
      answer:
        "Lorem ipsum dolor sit amet consectetur. Euismod senectus tincidunt congue commodo vel condimentum. dolor sit amet consectetur. Euismod senectus tincidunt congue commodo vel condimentum.",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 shrink-0 gap-4 sm:gap-0 px-4">
        <h2 className="text-xl font-bold text-[#22333B]">Help & Support</h2>
      </div>

      <div className="max-w-5xl mx-auto w-full mt-2 pl-6 pr-6">
        {/* Title & Search */}
        <div className="text-center mb-8">
          <h1 className="text-[36px] font-bold text-[#0F172A] mb-4 font-['Inter']">
            How can we help you?
          </h1>

          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#6B7280]" />
            </div>
            <input
              type="text"
              placeholder="Search for articles, guides, or FAQs..."
              className="w-full pl-11 pr-4 py-3 text-[#6B7280] border border-[#E2E8F0] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#F68E5F] transition-shadow text-[16px] shadow-sm"
            />
          </div>
        </div>

        {/* Main Content Split Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column (Categories & Accordion) */}
          <div className="flex-1">
            {/* Categories Grid */}
            <div className="mb-8">
              <h2 className="text-[20px] font-bold text-[#0F172A] mb-4">
                Browse by Category
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat, index) => (
                  <div
                    key={index}
                    className="border border-[#F1F5F9] rounded-2xl p-6 bg-white hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${cat.bgClass || "bg-[#7E7E7E1A]"}`}
                    >
                      {cat.icon}
                    </div>
                    <h3 className="text-[16px] font-semibold text-[#0F172A] mb-2">
                      {cat.title}
                    </h3>
                    <p className="text-[14px] text-[#64748B] leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Questions Accordion */}
            <div>
              <h2 className="text-[20px] font-bold text-[#0F172A] mb-4">
                Popular Questions
              </h2>
              <div className="border border-gray-100 rounded-2xl bg-white overflow-hidden">
                {popularQuestions.map((q, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-100 last:border-0 p-5"
                  >
                    <button
                      className="flex justify-between items-center w-full text-left"
                      onClick={() => toggleAccordion(index)}
                    >
                      <span className="text-[16px] font-medium text-[#0F172A]">
                        {q.question}
                      </span>
                      {openAccordion === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    {openAccordion === index && (
                      <div className="mt-4 text-[14px] text-[#475569] leading-relaxed max-w-2xl">
                        {q.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (Contact Card) */}
          <div className="w-full lg:w-71.25">
            <div className="bg-[#F68E5F] rounded-2xl p-7 text-white">
              <h3 className="text-[20px] font-bold mb-4 font-['Inter']">
                Still need help?
              </h3>
              <p className="text-[14px] text-gray-100 mb-8 leading-relaxed font-['Inter']">
                Our support team is available Mon to Sat 10 AM to 6 PM to help
                you with any issues or questions you might have.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <div className="text-[12px] text-gray-200 mb-0.5">
                      Email Address
                    </div>
                    <div className="text-[14px] font-semibold text-white">
                      info@suhtech.top
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <div className="text-[12px] text-gray-200 mb-0.5">
                      Phone Support
                    </div>
                    <div className="text-[14px] font-semibold text-white">
                      +1 (800) 555-0123
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
