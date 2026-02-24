import React from "react";

const AboutHero = () => {
  return (
    <section className="bg-[#ffffff] py-20 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="px-4 py-1 border border-[#F68E5F] text-[#F68E5F] rounded-full text-sm font-medium bg-white">
            About us
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 text-center mb-4">
          Driven by Bold Vision
        </h1>

        {/* Description */}
        <p className="text-gray-500 text-center max-w-xl mx-auto text-sm md:text-base mb-12">
          Lorem ipsum dolor sit amet consectetur. Diam tempus elementum
          condimentum quis diam. Ultrices tellus aliquam sit consectetur
          sed ornare semper non pharetra.
        </p>

        {/* Hero Image - Bigger */}
        <div className="rounded-3xl overflow-hidden mb-16">
          <img
            src="/About_img.svg"
            alt="Team"
            className="w-full h-[500px] md:h-[560px] object-cover"
          />
        </div>

        {/* Vision & Mission Cards - Smaller */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">

          {/* Vision */}
          <div className="bg-gray-200 rounded-2xl p-6 md:p-7">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Our Vision
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet consectetur. Ac quis donec velit
              proin ullamcorper neque luctus sagittis. Ut id et arcu quam eu eu.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-orange-400 rounded-2xl p-6 md:p-7">
            <h3 className="text-lg font-semibold text-white mb-3">
              Our Mission
            </h3>
            <p className="text-orange-100 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet consectetur. Euismod faucibus
              scelerisque nec eget diam suspendisse dictum. Eget ligula
              vitae in lacus id in enim.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};
export default AboutHero;