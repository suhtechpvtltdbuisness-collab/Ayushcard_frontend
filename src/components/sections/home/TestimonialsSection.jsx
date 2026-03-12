import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const testimonials = [
  {
    id: 1,
    text: "Lorem ipsum dolor sit amet consectetur. Mauris ut massa cursus hendrerit convallis orci. Nunc integer dui adipiscing viverra ac sit.",
    name: "Marie Jane",
    role: "CFO at Movix",
    avatar: "/girl1.svg",
  },
  {
    id: 2,
    text: "vallis orci. Nunc integer dui adipisci.....................",
    name: "Marie Jane",
    role: "CFO at Movix",
    avatar: "/girl1.svg",
  },
  {
    id: 3,
    text: "vallis orci. Nunc integer dui adipisci vallis orci. ...",
    name: "Marie Jane",
    role: "CFO at Movix",
    avatar: "/girl1.svg",
  },
];

const TestimonialsSection = () => {
  const handlePrev = () => {
    // Logic removed as it was unused
  };

  const handleNext = () => {
    // Logic removed as it was unused
  };

  return (
    <section style={{ backgroundColor: "#ffffff" }} className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-10 md:mb-14 gap-6">
          <div className="text-center md:text-left">
            <span className="px-4 py-1.5 border border-[#F68E5F] text-[#F68E5F] rounded-full text-sm font-medium inline-block mb-5">
              Testimonials
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Stories of Impact
            </h2>

            <p className="text-gray-500 text-sm md:text-base">
              Hear from the people whose lives have been transformed
            </p>
          </div>

          <button className="flex items-center justify-center md:justify-start gap-3 border border-[#F68E5F] text-[#F68E5F] text-sm font-semibold pl-6 pr-2 py-2 rounded-full hover:bg-[#F68E5F]/10 transition-all w-full md:w-auto">
            View all
            <span className="flex items-center justify-center bg-[#F68E5F] rounded-full w-8 h-8">
              <ArrowRight className="w-4 h-4 text-white" />
            </span>
          </button>
        </div>

        {/* All Cards */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-10 md:mb-14">
          {/* CARD 1 (Large) */}
          <div className="relative bg-white rounded-2xl border border-[#F68E5F] p-6 md:p-8 flex flex-col justify-between w-full md:w-[45%] min-h-[280px] shadow-sm">
            <p className="text-gray-800 font-semibold leading-relaxed text-base relative z-10">
              {testimonials[0].text}
            </p>

            <div className="flex items-end justify-between mt-8 relative z-10">
              {/* Profile */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonials[0].avatar}
                  alt=""
                  className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover border border-gray-100"
                />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {testimonials[0].name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {testimonials[0].role}
                  </p>
                </div>
              </div>

              {/* Quote */}
              <div className="relative flex items-end">
                <img
                  src="/quote.svg"
                  alt=""
                  className="w-20 md:w-24 opacity-80"
                />
              </div>
            </div>

            {/* Background Grid - Adjusted for better mobile look */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              <img
                src="/grid_img.svg"
                alt=""
                className="absolute -right-20 -bottom-10 w-[240px] md:w-[480px] opacity-10"
              />
            </div>
          </div>

          {/* CARD 2 */}
          <div className="relative bg-white rounded-2xl border border-[#F68E5F] p-6 flex flex-col justify-between w-full md:w-[27.5%] min-h-[260px] shadow-sm">
            <div className="flex justify-between items-start gap-4">
              <p className="text-gray-800 font-semibold leading-relaxed text-sm md:text-base">
                {testimonials[1].text}
              </p>
              <img
                src="/quote_sm(1).svg"
                alt=""
                className="w-6 md:w-8 shrink-0"
              />
            </div>

            <div className="flex items-end justify-between mt-8">
              <div className="flex items-center gap-3">
                <img
                  src={testimonials[1].avatar}
                  alt=""
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border border-gray-100"
                />
                <div>
                  <p className="font-semibold text-gray-900 text-xs md:text-sm">
                    {testimonials[1].name}
                  </p>
                  <p className="text-gray-400 text-[10px] md:text-xs">
                    {testimonials[1].role}
                  </p>
                </div>
              </div>
              <img
                src="/grid_img.svg"
                alt=""
                className="w-12 md:w-20 opacity-20"
              />
            </div>
          </div>

          {/* CARD 3 */}
          <div className="relative bg-white rounded-2xl border border-[#F68E5F] p-6 flex flex-col justify-between w-full md:w-[27.5%] min-h-[260px] shadow-sm">
            <div className="flex justify-between items-start gap-4">
              <p className="text-gray-800 font-semibold leading-relaxed text-sm md:text-base">
                {testimonials[2].text}
              </p>
              <img
                src="/quote_sm(1).svg"
                alt=""
                className="w-6 md:w-8 shrink-0"
              />
            </div>

            <div className="flex items-end justify-between mt-8">
              <div className="flex items-center gap-3">
                <img
                  src={testimonials[2].avatar}
                  alt=""
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border border-gray-100"
                />
                <div>
                  <p className="font-semibold text-gray-900 text-xs md:text-sm">
                    {testimonials[2].name}
                  </p>
                  <p className="text-gray-400 text-[10px] md:text-xs">
                    {testimonials[2].role}
                  </p>
                </div>
              </div>
              <img
                src="/grid_img.svg"
                alt=""
                className="w-12 md:w-20 opacity-20"
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={handlePrev}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:border-[#F68E5F] hover:text-[#F68E5F] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleNext}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:border-[#F68E5F] hover:text-[#F68E5F] transition-all"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
