import React from "react";

const About = () => {
  return (
    <section className="w-full py-16 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        
        {/* LEFT IMAGE CARD */}
        <div className="w-[420px] h-[420px] mx-auto rounded-[80px] ">
          <img
            src="/Aboutimage.svg"
            alt="about"
            className="w-full h-full"
          />
        </div>

        {/* RIGHT CONTENT */}
        <div>
          <button className="px-4 py-1 border border-[#F68E5F] text-[#F68E5F] rounded-full text-sm mb-6">
            About us
          </button>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight mb-6">
            Lorem ipsum dolor sit amet consectetur.
          </h2>

          <p className="text-gray-500 text-lg">
            Lorem ipsum dolor sit amet consectetur. Eu netus sed quisque at.
            Lorem ipsum dolor sit amet consectetur. Eu netus sed quisque at.
          </p>
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="max-w-6xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
        
        <div>
          <h4 className="text-gray-800 font-semibold mb-3">Education</h4>
          <h2 className="text-5xl font-bold text-[#F68E5F] mb-3">30+</h2>
          <p className="text-gray-500 text-sm">
            Lorem ipsum dolor sit amet consectetur.
            Neque tincidunt facilisi elit tempor laoreet
          </p>
        </div>

        <div>
          <h4 className="text-gray-800 font-semibold mb-3">Healthcare</h4>
          <h2 className="text-5xl font-bold text-[#F68E5F] mb-3">500+</h2>
          <p className="text-gray-500 text-sm">
            Lorem ipsum dolor sit amet consectetur.
            Neque tincidunt facilisi elit tempor laoreet
          </p>
        </div>

        <div>
          <h4 className="text-gray-800 font-semibold mb-3">Economic development</h4>
          <h2 className="text-5xl font-bold text-[#F68E5F] mb-3">200K+</h2>
          <p className="text-gray-500 text-sm">
            Lorem ipsum dolor sit amet consectetur.
            Neque tincidunt facilisi elit tempor laoreet
          </p>
        </div>

        <div>
          <h4 className="text-gray-800 font-semibold mb-3">Environmental initiatives</h4>
          <h2 className="text-5xl font-bold text-[#F68E5F] mb-3">180K+</h2>
          <p className="text-gray-500 text-sm">
            Lorem ipsum dolor sit amet consectetur.
            Neque tincidunt facilisi elit tempor laoreet
          </p>
        </div>

      </div>
    </section>
  );
};

export default About;