import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DonationFormModal from "./DonationFormModal";

const HeroSection = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const totalSlides = 3;

  return (
    <section className="px-6 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Hero Card */}
        <div className="relative rounded-[20px] md:rounded-[30px] overflow-hidden min-h-[600px] md:h-[600px]">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-no-repeat bg-center bg-cover md:bg-contain opacity-80 md:opacity-100"
            style={{
              backgroundImage: "url('/hero.svg')",
            }}
          ></div>

          {/* Gradient overlay for better text readability on mobile */}
          <div className="absolute inset-0 bg-black/40 md:bg-transparent z-0"></div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center h-full px-6 py-12 md:pl-16 lg:pl-28 md:pr-12 max-w-2xl text-center md:text-left items-center md:items-start">
            <h1 className="text-white font-bold leading-tight mb-2 text-3xl sm:text-4xl md:text-3xl lg:text-5xl">
              Empowering Communities
              <br />
              Through Healthcare &
              <br />
              Support
            </h1>

            <p className="text-gray-100 md:text-gray-200 text-sm md:text-base leading-relaxed mb-8 max-w-lg">
              Lorem ipsum dolor sit amet consectetur. Eu netus sed quisque at.
              Lorem ipsum dolor sit amet consectetur. Eu netus sed quisque at.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto flex-wrap">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3 bg-[#F68E5F] hover:bg-[#e87d4d] text-white font-semibold pl-6 pr-2 py-2.5 rounded-full shadow-lg transition-all"
              >
                Donate
                <span className="flex items-center justify-center bg-white rounded-full w-8 h-8">
                  <img src="/donateicon.svg" alt="Donate" className="w-4 h-4" />
                </span>
              </button>

              <button
                onClick={() => navigate("/ayush-card")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 border border-white text-white font-medium px-8 py-3 rounded-full hover:bg-white hover:text-gray-800 transition-all text-sm md:text-base whitespace-nowrap"
              >
                Apply for Ayush Card
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* 🔥 Bottom Center Slider Dots */}
          {/* <div className="absolute bottom-4 md:-bottom-2 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-white px-6 py-3 md:px-8 md:py-4 rounded-full shadow-xl flex items-center gap-3 md:gap-4">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActive(index)}
                  className={`rounded-full transition-all duration-300 ${
                    active === index
                      ? "w-3 h-3 md:w-4 md:h-4 border-2 border-[#F68E5F] flex items-center justify-center"
                      : "w-3 h-3 md:w-4 md:h-4 bg-gray-300"
                  }`}
                >
                  {active === index && (
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#F68E5F] rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div> */}
        </div>
      </div>

      {/* Donation Form Modal */}
      <DonationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};

export default HeroSection;
