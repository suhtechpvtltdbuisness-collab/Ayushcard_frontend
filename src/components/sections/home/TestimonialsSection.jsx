import React, { useState } from "react";
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
  const [startIndex, setStartIndex] = useState(0);

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setStartIndex((prev) =>
      Math.min(prev + 1, testimonials.length - 1)
    );
  };

  return (
    <section style={{ backgroundColor: "#ffffff" }} className="py-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-14">
          <div>
            <span className="px-4 py-1.5 border border-[#F68E5F] text-[#F68E5F] rounded-full text-sm font-medium inline-block mb-5">
              Testimonials
            </span>

            <h2 className="text-5xl font-extrabold text-gray-900 mb-4">
              Stories of Impact
            </h2>

            <p className="text-gray-500">
              Hear from the people whose lives have been transformed
            </p>
          </div>

          <button className="flex items-center gap-3 border border-[#F68E5F] text-[#F68E5F] text-sm font-semibold pl-6 pr-2 py-2 rounded-full hover:bg-[#F68E5F]/10 transition-all">
            View all
            <span className="flex items-center justify-center bg-[#F68E5F] rounded-full w-8 h-8">
              <ArrowRight className="w-4 h-4 text-white" />
            </span>
          </button>
        </div>

        {/* All Cards in SAME ROW */}
        <div className="flex gap-8 mb-14">

          {/* CARD 1 (Large) */}
          <div className="relative bg-white rounded-2xl border border-[#F68E5F] p-8 flex flex-col justify-between w-[45%] min-h-[280px]">

            <p className="text-gray-800  font-semibold leading-relaxed text-base">
              {testimonials[0].text}
            </p>

            <div className="flex items-end justify-between mt-8">
              {/* Profile */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonials[0].avatar}
                  alt=""
                  className="w-11 h-11 rounded-full object-cover"
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

              {/* Grid + Quote */}
              <div className="relative">
                <img
                  src="/grid_img.svg"
                  alt=""
                  className="absolute -left-40 -bottom-8 w-[480px]"
                />
                <img
                  src="/quote.svg"
                  alt=""
                  className="w-28"
                />
              </div>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="relative bg-white rounded-2xl border border-[#F68E5F] p-6 flex flex-col justify-between w-[27.5%] min-h-[280px]">

            <div className="flex justify-between items-start">
              <p className="text-gray-800 font-semibold leading-relaxed pr-3">
                {testimonials[1].text}
              </p>
              <img
                src="/quote_sm(1).svg"
                alt=""
                className="w-8"
              />
            </div>

            <div className="flex items-end justify-between mt-8">
              <div className="flex items-center gap-3">
                <img
                  src={testimonials[1].avatar}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {testimonials[1].name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {testimonials[1].role}
                  </p>
                </div>
              </div>

              <img
                src="/grid_img.svg"
                alt=""
                className="w-30  bottom-8"
              />
            </div>
          </div>

          {/* CARD 3 */}
          <div className="relative bg-white rounded-2xl border border-[#F68E5F] p-6 flex flex-col justify-between w-[27.5%] min-h-[280px]">

            <div className="flex justify-between items-start">
              <p className="text-gray-800 font-semibold leading-relaxed pr-3">
                {testimonials[2].text}
              </p>
              <img
                src="/quote_sm(1).svg"
                alt=""
                className="w-8"
              />
            </div>

            <div className="flex items-end justify-between mt-8">
              <div className="flex items-center gap-3">
                <img
                  src={testimonials[2].avatar}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {testimonials[2].name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {testimonials[2].role}
                  </p>
                </div>
              </div>

              <img
                src="/grid_img.svg"
                alt=""
                className="w-30 "
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