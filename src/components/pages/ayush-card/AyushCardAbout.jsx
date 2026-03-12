import React from "react";
import { Check } from "lucide-react";

const AyushCardAbout = () => {
  return (
    <section className="bg-[#FFFCFB] py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16">
        {/* Left Side: Text Content */}
        <div className="w-full md:w-[45%]">
          <h2 className="text-4xl md:text-6xl font-bold text-[#111111] leading-tight mb-6">
            What Is Ayush
            <br />
            Health Card?
          </h2>
          <p className="text-[#777777] text-base leading-relaxed">
            Ayush Health Card is a comprehensive healthcare initiative designed
            to make quality medical services accessible and affordable for
            everyone. We partner with leading hospitals, clinics, and healthcare
            providers to offer discounted rates and premium care.
          </p>
        </div>

        {/* Right Side: Features List */}
        <div className="w-full md:w-[45%] flex flex-col gap-10">
          {/* Feature 1 */}
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-[#F68E5F] flex items-center justify-center shrink-0 mt-1">
              <Check size={20} strokeWidth={2} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#222222] mb-2">
                Trusted Network
              </h3>
              <p className="text-[#777777] text-[18px]">
                Access to 500+ partner hospitals and clinics nationwide
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-[#F68E5F] flex items-center justify-center shrink-0 mt-1">
              <Check size={20} strokeWidth={2} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#222222] mb-2">
                Affordable Care
              </h3>
              <p className="text-[#777777] text-[18px]">
                Discounts up to 50% on consultations and treatments
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-[#F68E5F] flex items-center justify-center shrink-0 mt-1">
              <Check size={20} strokeWidth={2} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#222222] mb-2">
                24/7 Support
              </h3>
              <p className="text-[#777777] text-[18px]">
                Round-the-clock customer support and assistance
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AyushCardAbout;
