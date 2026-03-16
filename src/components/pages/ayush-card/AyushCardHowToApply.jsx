import React from "react";

const stepsData = [
  {
    number: "01",
    title: "Fill the Application Form",
    description:
      "Complete our simple online form with your basic personal and health information. Takes just 5 minutes!",
  },
  {
    number: "02",
    title: "Submit Documents",
    description:
      "Upload required documents including Aadhaar, address proof, and photo for verification purposes.",
  },
  {
    number: "03",
    title: "Verification Process",
    description:
      "Our team will verify your documents within 24-48 hours. You'll receive updates via SMS and email.",
  },
  {
    number: "04",
    title: "Receive Ayush Card",
    description:
      "Once approved, your digital Ayush Card will be delivered. Physical card ships within 5-7 working days.",
  },
];

const AyushCardHowToApply = () => {
  return (
    <section className="bg-[#FFFCFB] py-14 md:py-20 px-4 sm:px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-[#111111] mb-4">
            How to Apply
          </h2>
          <p className="text-[#666666] text-lg leading-relaxed">
            A simple 4-step process to get your Ayush Health Card and start
            enjoying healthcare benefits
          </p>
        </div>

        {/* Stepper Timeline */}
        <div className="relative pl-2 sm:pl-4 md:pl-0">
          {/* Vertical Line */}
          <div className="absolute top-[26px] bottom-[40px] left-[22px] sm:left-[32px] md:left-[35px] w-0.5 bg-[#F68E5F] z-0"></div>

          <div className="flex flex-col gap-14">
            {stepsData.map((step, index) => (
              <div
                key={index}
                className="flex flex-row relative z-10 items-start gap-4 sm:gap-8"
              >
                {/* Step Circle */}
                <div className="w-[48px] h-[48px] sm:w-[70px] sm:h-[70px] shrink-0 bg-[#F68E5F] rounded-full flex items-center justify-center shadow-md relative mt-[-6px] sm:mt-[-10px]">
                  <span className="text-white text-lg sm:text-3xl font-bold">
                    {step.number}
                  </span>
                </div>

                {/* Step Content */}
                <div className="pt-2">
                  <h3 className="text-lg sm:text-2xl font-bold text-[#111111] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[#666666] text-sm sm:text-[18px] leading-relaxed max-w-lg">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AyushCardHowToApply;
