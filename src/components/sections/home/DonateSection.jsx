import React from 'react';
import { ArrowRight } from 'lucide-react';

const DonateSection = () => {
  const features = [
    {
      id: 1,
      icon: "/donate_img_1.svg",
      title: "100% Transparent",
      description: "We personally connect to discuss your contribution and its community impact.",
    },
    {
      id: 2,
      icon: "/donate_img_2.svg",
      title: "Tax Benefits (80G)",
      description: "Get 50% tax deduction under 80G with official receipt.",
    },
    {
      id: 3,
      icon: "/donate_img_3.svg",
      title: "Direct Impact Updates",
      description: "Receive personalized reports with real stories of families you've helped.",
    },
    {
      id: 4,
      icon: "/donate_img_4.svg",
      title: "Personal Assistance",
      description: "Dedicated team guides you through the process and answers questions.",
    },
  ];

  const steps = [
    { id: 1, label: "Fill donation form" },
    { id: 2, label: "Our team contacts you" },
    { id: 3, label: "Complete payment & get receipt" },
  ];

  return (
    <section style={{ backgroundColor: "#ffffff" }} className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left Side - Donate Steps */}
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-8">
              Donate in 3 Easy steps
            </h2>

            {/* Impact Box */}
            <div className="bg-[#F68E5F]/10 border-l-4 border-[#F68E5F] rounded-2xl px-6 py-5 mb-10">
              <p className="text-gray-800 text-sm md:text-base leading-relaxed">
                <span className="font-semibold">Your Impact:</span> ₹1,000 can provide complete medical checkup
                and essential medicines for 2 families for one month.
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-6">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center gap-5">
                  <span className="flex-shrink-0 w-9 h-9 rounded-full border-2 border-orange-100  shadow-xl flex items-center justify-center text-sm font-bold text-gray-500">
                    {step.id}
                  </span>
                  <span className="text-gray-800 font-semibold text-base">{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Transform Lives */}
          <div>
            {/* Badge */}
            <div className="inline-block mb-5">
              <span className="px-4 py-1.5 bg-transparent border border-[#F68E5F] text-[#F68E5F] rounded-full text-sm font-medium">
                Make an Impact
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-5">
              Transform Lives Through Giving
            </h2>

            <p className="text-gray-500 text-base leading-relaxed mb-10">
              Every donation creates a ripple effect of positive change. Your generosity provides healthcare, education, and hope to families in need.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-8 mb-10">
              {features.map((feature) => (
                <div key={feature.id} className="flex flex-col gap-2">
                  <div className="w-8 h-8 mb-1">
                    <img src={feature.icon} alt={feature.title} className="w-full h-full object-contain" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">{feature.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Fill Donation Form Button */}
            <div className="flex flex-col gap-2">
              <button className="flex items-center gap-2 bg-[#F68E5F] hover:bg-[#F68E5F] active:scale-95 text-white text-sm font-semibold pl-6 pr-1 py-1 rounded-full transition-all duration-200 shadow-md w-fit">
                Fill Donation Form
                <span className="flex items-center justify-center bg-white rounded-full w-9 h-9">
                  <ArrowRight className="w-4 h-4 text-[#F68E5F]" />
                </span>
              </button>
              <p className="text-gray-400 text-xs ml-2">Our team will contact you within 24 hours</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default DonateSection;