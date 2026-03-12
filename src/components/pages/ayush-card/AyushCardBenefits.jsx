import React from "react";
import { Check } from "lucide-react";

const benefitsData = [
  {
    title: "Affordable Consultations",
    description: "Get Expert Medical Advice At 30-50% Discounted Rates",
  },
  {
    title: "Discounted Health Checkups",
    description: "Get Expert Medical Advice At 30-50% Discounted Rates",
  },
  {
    title: "Access To Partner Hospitals",
    description: "Choose From 500+ Trusted Healthcare Facilities Nationwide",
  },
  {
    title: "Financial Assistance",
    description:
      "Flexible Payment Plans And Emergency Financial Support Available",
  },
  {
    title: "Priority Healthcare Support",
    description: "Skip Queues And Get Priority Appointments With Specialists",
  },
  {
    title: "Health Awareness Programs",
    description: "Free Wellness Programs For Cardholders",
  },
];

const AyushCardBenefits = () => {
  return (
    <section className="bg-[#FFFCFB] py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-[#111111] mb-4">
            Key Benefits
          </h2>
          <p className="text-[#666666] text-3xl max-w-6xl leading-relaxed">
            Explore the comprehensive benefits that make Ayush Health Card the
            perfect choice for your family's healthcare needs
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
          {benefitsData.map((benefit, index) => (
            <div key={index} className="relative pt-6">
              {/* Icon */}
              <div className="absolute top-0 left-6 w-14 h-14 bg-[#F97316] rounded-full flex items-center justify-center z-10 shadow-sm">
                <Check size={30} strokeWidth={1} className="text-white" />
              </div>

              {/* Card Body */}
              <div className="bg-[#FAF3E1] rounded-3xl pt-10 pb-8 px-8 h-full">
                <h3 className="text-[30px] font-semibold text-[#111111] mb-3">
                  {benefit.title}
                </h3>
                <p className="text-[#000000] text-[20px] leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AyushCardBenefits;
