import React from "react";
import { Check } from "lucide-react";

const AyushCardEligibility = () => {
  return (
    <section
      id="eligibility-section"
      className="bg-[#F2F4F3] py-20 px-6 md:px-12"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header flexes differently on mobile vs desktop, keeping it strictly aligned to left as per design */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-[#111111]">
            Eligibility & Requirements
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Who Can Apply Card */}
          <div className="flex-1 bg-white rounded-3xl p-10 shadow-sm">
            <h3 className="text-[40px] font-bold text-[#111111] mb-8">
              Who Can Apply?
            </h3>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-[#F97316] rounded-full flex items-center justify-center z-10 shadow-sm">
                  <Check size={20} strokeWidth={1} className="text-white" />
                </div>
                <span className="text-[#666666] text-[20px]">
                  Indian citizen with valid identity documents
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-[#F97316] rounded-full flex items-center justify-center z-10 shadow-sm">
                  <Check size={20} strokeWidth={1} className="text-white" />
                </div>
                <span className="text-[#666666] text-[20px]">
                  Age above 18 years
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-[#F97316] rounded-full flex items-center justify-center z-10 shadow-sm">
                  <Check size={20} strokeWidth={1} className="text-white" />
                </div>
                <span className="text-[#666666] text-[20px]">
                  Valid ID proof (Aadhaar/Passport/PAN)
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-[#F97316] rounded-full flex items-center justify-center z-10 shadow-sm">
                  <Check size={20} strokeWidth={1} className="text-white" />
                </div>
                <span className="text-[#666666] text-[20px]">
                  Permanent address in India
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-[#F97316] rounded-full flex items-center justify-center z-10 shadow-sm">
                  <Check size={20} strokeWidth={1} className="text-white" />
                </div>
                <span className="text-[#666666] text-[20px]">
                  Basic health information and medical history
                </span>
              </div>
            </div>
          </div>

          {/* Documents Needed Card */}
          <div className="flex-1 bg-white rounded-3xl p-10 shadow-sm">
            <h3 className="text-[40px] font-bold text-[#111111] mb-8">
              Documents Needed
            </h3>

            <div className="space-y-6 tracking-wider">
              <div className="flex items-center gap-4">
                <div className="bg-[#F97316] rounded-full flex items-center justify-center z-10 shadow-sm">
                  <Check size={20} strokeWidth={1} className="text-white" />
                </div>
                <span className="text-[#666666] text-[20px]">Aadhaar Card</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-[#F97316] rounded-full flex items-center justify-center z-10 shadow-sm">
                  <Check size={20} strokeWidth={1} className="text-white" />
                </div>
                <span className="text-[#666666] text-[20px]">
                  Address Proof
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-[#F97316] rounded-full flex items-center justify-center z-10 shadow-sm">
                  <Check size={20} strokeWidth={1} className="text-white" />
                </div>
                <span className="text-[#666666] text-[20px]">
                  Passport Size Photo
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-[#F97316] rounded-full flex items-center justify-center z-10 shadow-sm">
                  <Check size={20} strokeWidth={1} className="text-white" />
                </div>
                <span className="text-[#666666] text-[20px]">
                  Mobile Number
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AyushCardEligibility;
