import React from "react";
import { useApplyAyushCardModal } from "../../../context/ApplyAyushCardModalContext";

const AyushCardHero = () => {
  const { openApplyAyushModal } = useApplyAyushCardModal();

  return (
    <section className="bg-[#FFFCFB] py-14 md:py-24 px-4 sm:px-6 md:px-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-20">
        {/* Left Side: Images Grid */}
        <div className="w-full md:w-1/2 relative flex justify-center">
          <div className="relative w-full max-w-[500px] aspect-square">
            <img
              src="/Aboutimage.svg"
              alt="Ayush Card"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Right Side: Content */}
        <div className="w-full md:w-1/2 flex flex-col items-start text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#111111] leading-tight mb-6">
            Ayush Card
          </h1>
          <p className="text-[#666666] text-base sm:text-lg font-medium mb-4">
            Affordable Healthcare for Everyone
          </p>
          <p className="text-[#666666] text-base leading-relaxed mb-10 max-w-lg">
            We believe that quality healthcare should be a basic right—not a
            privilege. With this vision, we have launched the Ayush Card
            Project to support economically weaker families in accessing
            affordable medical care.
          </p>

          <div className="flex flex-wrap items-center gap-4 w-full">
            <button
              type="button"
              onClick={() => openApplyAyushModal()}
              className="w-full sm:w-auto bg-[#F68E5F] hover:bg-[#E57A4B] text-white px-8 py-3.5 rounded-full font-semibold text-[16px] transition-all duration-200 shadow-md whitespace-nowrap"
            >
              Apply for Ayush Card <span className="ml-1">›</span>
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("eligibility-section");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="w-full sm:w-auto border-2 border-[#F68E5F] text-[#F68E5F] hover:bg-[#FFF5F1] px-8 py-3.5 rounded-full font-semibold text-[16px] transition-all duration-200 whitespace-nowrap"
            >
              Check Eligibility
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AyushCardHero;
