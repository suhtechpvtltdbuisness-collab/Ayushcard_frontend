import React from "react";

const About = () => {
  return (
    <section className="w-full py-16 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-12 items-center">
        {/* LEFT IMAGE CARD */}
        <div className="w-full max-w-[420px] aspect-square mx-auto rounded-[40px] md:rounded-[80px] overflow-hidden">
          <img
            src="/Aboutimage.svg"
            alt="about"
            className="w-full h-full object-cover"
          />
        </div>

        {/* RIGHT CONTENT */}
        <div className="text-center md:text-left">
          <button className="px-5 py-1.5 border border-[#F68E5F] text-[#F68E5F] rounded-full text-sm mb-6 font-medium">
            About us
          </button>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 leading-tight mb-6">
            Lorem ipsum dolor sit amet consectetur.
          </h2>

          <p className="text-gray-500 text-base md:text-lg leading-relaxed">
            Lorem ipsum dolor sit amet consectetur. Eu netus sed quisque at.
            Lorem ipsum dolor sit amet consectetur. Eu netus sed quisque at.
          </p>
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="max-w-6xl mx-auto mt-16 md:mt-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 text-center">
        <div className="p-4 rounded-2xl md:p-0">
          <h4 className="text-gray-800 font-semibold mb-2">Education</h4>
          <h2 className="text-4xl md:text-5xl font-bold text-[#F68E5F] mb-3">
            30+
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Lorem ipsum dolor sit amet consectetur. Neque tincidunt facilisi
            elit tempor laoreet
          </p>
        </div>

        <div className="p-4 rounded-2xl md:p-0">
          <h4 className="text-gray-800 font-semibold mb-2">Healthcare</h4>
          <h2 className="text-4xl md:text-5xl font-bold text-[#F68E5F] mb-3">
            500+
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Lorem ipsum dolor sit amet consectetur. Neque tincidunt facilisi
            elit tempor laoreet
          </p>
        </div>

        <div className="p-4 rounded-2xl md:p-0">
          <h4 className="text-gray-800 font-semibold mb-2 text-balance px-4 md:px-0 mx-auto">
            Economic development
          </h4>
          <h2 className="text-4xl md:text-5xl font-bold text-[#F68E5F] mb-3">
            200K+
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Lorem ipsum dolor sit amet consectetur. Neque tincidunt facilisi
            elit tempor laoreet
          </p>
        </div>

        <div className="p-4 rounded-2xl md:p-0">
          <h4 className="text-gray-800 font-semibold mb-2 text-balance px-4 md:px-0 mx-auto">
            Environmental initiatives
          </h4>
          <h2 className="text-4xl md:text-5xl font-bold text-[#F68E5F] mb-3">
            180K+
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Lorem ipsum dolor sit amet consectetur. Neque tincidunt facilisi
            elit tempor laoreet
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
