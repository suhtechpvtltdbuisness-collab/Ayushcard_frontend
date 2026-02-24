import React, { useState } from "react";

const HeroSection = () => {
  const [active, setActive] = useState(0);
  const totalSlides = 3;

  return (
    <section className="px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Hero Card */}
        <div className="relative rounded-[30px] overflow-hidden h-[550px]">

          {/* Background Image */}
          <div
            className="absolute inset-0 bg-no-repeat bg-center bg-contain"
            style={{ backgroundImage: "url('/hero.svg')" }}
          ></div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center h-full pl-28 pr-12 max-w-2xl">

            <h1 className="text-white font-bold leading-tight mb-6 text-4xl md:text-5xl">
              Empowering Communities
              <br />
              Through Healthcare &
              <br />
              Support
            </h1>

            <p className="text-gray-200 text-base leading-relaxed mb-8 max-w-md">
              Lorem ipsum dolor sit amet consectetur. Eu netus sed quisque at.
              Lorem ipsum dolor sit amet consectetur. Eu netus sed quisque at.
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-4 flex-wrap">

              <button className="flex items-center gap-2 bg-[#F68E5F] hover:bg-[#F68E5F] text-white font-semibold pl-6 pr-2 py-2 rounded-full shadow-lg transition">
                Donate
                <span className="flex items-center justify-center bg-white rounded-full w-8 h-8">
                  <img
                    src="/donateicon.svg"
                    alt="Donate"
                    className="w-4 h-4"
                  />
                </span>
              </button>

              <button className="flex items-center gap-2 border border-white text-white font-medium px-6 py-2 rounded-full hover:bg-white hover:text-gray-800 transition">
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
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
            <div className="bg-white px-8 py-4 rounded-full shadow-xl flex items-center gap-4">

              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActive(index)}
                  className={`rounded-full transition-all duration-300 ${
                    active === index
                      ? "w-4 h-4 border-2 border-[#F68E5F] flex items-center justify-center"
                      : "w-4 h-4 bg-gray-300"
                  }`}
                >
                  {active === index && (
                    <div className="w-2 h-2 bg-[#F68E5F] rounded-full"></div>
                  )}
                </button>
              ))}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;