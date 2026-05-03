import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import DonationFormModal from "./DonationFormModal";

const DonateSection = () => {
  const features = [
    {
      id: 1,
      icon: "/donate_img_1.svg",
      title: "100% Transparent",
      description:
        "We personally connect to discuss your contribution and its community impact.",
    },
    {
      id: 2,
      icon: "/donate_img_2.svg",
      title: "Tax Benefits (80G)",
      description: "Tax benefit 80G",
    },
    {
      id: 3,
      icon: "/donate_img_3.svg",
      title: "Direct Impact Updates",
      description:
        "Receive personalized reports with real stories of families you've helped.",
    },
    {
      id: 4,
      icon: "/donate_img_4.svg",
      title: "Personal Assistance",
      description:
        "Dedicated team guides you through the process and answers questions.",
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);

  const steps = [
    { id: 1, label: "Fill donation form" },
    { id: 2, label: "Our team contacts you" },
    { id: 3, label: "Complete payment & get receipt" },
  ];

  return (
    <section style={{ backgroundColor: "#ffffff" }} className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left Side - Donate Steps */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-8">
              Donate in 3 Easy steps
            </h2>

            {/* Impact Box */}
            <div className="bg-[#F68E5F]/10 border-l-4 border-[#F68E5F] rounded-2xl px-6 py-5 mb-10 text-left mx-auto lg:mx-0 max-w-2xl">
              <p className="text-gray-800 text-sm md:text-base leading-relaxed">
                <span className="font-semibold">Your Impact:</span> ₹1,000 can
                provide complete medical checkup and essential medicines for 2
                families for one month.
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-6 max-w-lg mx-auto lg:mx-0 text-left">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center gap-5">
                  <span className="shrink-0 w-9 h-9 rounded-full border-2 border-orange-100 shadow-lg flex items-center justify-center text-sm font-bold text-[#F68E5F] bg-white">
                    {step.id}
                  </span>
                  <span className="text-gray-800 font-semibold text-base sm:text-lg">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Transform Lives */}
          <div className="mt-10 lg:mt-0 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-block mb-5">
              <span className="px-4 py-1.5 bg-transparent border border-[#F68E5F] text-[#F68E5F] rounded-full text-sm font-medium">
                Make an Impact
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-5">
              Transform Lives Through Giving
            </h2>

            <p className="text-gray-500 text-base leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0">
              Every donation creates a ripple effect of positive change. Your
              generosity provides healthcare, education, and hope to families in
              need.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8 mb-10 text-left">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="flex flex-col items-start gap-2 p-4 bg-gray-50 rounded-2xl md:bg-transparent md:p-0"
                >
                  <div className="w-10 h-10 mb-1 flex items-center justify-center bg-white md:bg-transparent rounded-full md:rounded-none shadow-sm md:shadow-none">
                    <img
                      src={feature.icon}
                      alt={feature.title}
                      className="w-6 h-6 md:w-8 md:h-8 object-contain"
                    />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm md:text-base">
                    {feature.title}
                  </h4>
                  <p className="text-gray-500 text-xs md:text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Fill Donation Form Button */}
            <div className="flex flex-col items-center lg:items-start gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-between gap-3 bg-[#F68E5F] hover:bg-[#e87d4d] active:scale-95 text-white text-sm md:text-base font-semibold pl-6 pr-1.5 py-1.5 rounded-full transition-all duration-200 shadow-md w-full sm:w-fit"
              >
                Fill Donation Form
                <span className="flex items-center justify-center bg-white rounded-full w-9 h-9">
                  <ArrowRight className="w-4 h-4 text-[#F68E5F]" />
                </span>
              </button>
              <p className="text-gray-400 text-xs ml-1">
                Our team will contact you within 24 hours
              </p>
            </div>
          </div>
        </div>
      </div>

      <DonationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};

export default DonateSection;
