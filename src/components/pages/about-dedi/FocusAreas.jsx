import React from "react";

const focusAreas = [
  {
    id: 1,
    title: "Youth Empowerment",
    description: "Enhance your skills with our web design course.",
  },
  {
    id: 2,
    title: "Rural Empowerment",
    description: "Enhance your skills with our web design course.",
  },
  {
    id: 3,
    title: "Education Empowerment",
    description: "Enhance your skills with our Development course.",
  },
  {
    id: 4,
    title: "Environmental Help",
    description: "Enhance your skills with our Development course.",
  },
  {
    id: 5,
    title: "Women Empowerment",
    description: "Enhance your skills with our Development course.",
  },
  {
    id: 6,
    title: "Health Empowerment",
    description: "Enhance your skills with our Development course.",
  },
];

const FocusAreas = () => {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-14">
          <span className="px-4 py-1.5 border border-[#F68E5F] text-[#F68E5F] rounded-full text-sm font-medium inline-block mb-5">
            Initiatives
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2C3E44] mb-5">
            Our Focus Areas
          </h2>

          <p className="text-gray-500 max-w-md leading-relaxed text-sm sm:text-base">
            Lorem ipsum dolor sit amet consectetur. Eu netus sed quisque at.
            Lorem ipsum dolor sit amet consectetur. Eu netus sed quisque at.
          </p>
        </div>

        {/* GRID - Responsive Only */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Column 1 */}
          <div className="flex flex-col gap-6">

            <div className="bg-[#F68E5F] rounded-3xl p-8 h-[280px] sm:h-[300px] lg:h-[320px] flex flex-col justify-start">
              <h3 className="text-white font-bold mb-3">
                {focusAreas[0].title}
              </h3>
              <p className="text-orange-100 text-sm">
                {focusAreas[0].description}
              </p>
            </div>

            <div className="bg-gray-100 rounded-3xl p-6 h-[160px] sm:h-[170px] lg:h-[180px]">
              <h3 className="font-semibold text-[#2C3E44] mb-2">
                {focusAreas[3].title}
              </h3>
              <p className="text-gray-500 text-sm">
                {focusAreas[3].description}
              </p>
            </div>

          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-6">

            <div className="bg-gray-100 rounded-3xl p-6 h-[160px] sm:h-[170px] lg:h-[180px]">
              <h3 className="font-semibold text-[#2C3E44] mb-2">
                {focusAreas[1].title}
              </h3>
              <p className="text-gray-500 text-sm">
                {focusAreas[1].description}
              </p>
            </div>

            <div className="bg-gray-100 rounded-3xl p-8 h-[280px] sm:h-[300px] lg:h-[320px]">
              <h3 className="font-semibold text-[#2C3E44] mb-2">
                {focusAreas[4].title}
              </h3>
              <p className="text-gray-500 text-sm">
                {focusAreas[4].description}
              </p>
            </div>

          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-6">

            <div className="bg-gray-100 rounded-3xl p-8 h-[280px] sm:h-[300px] lg:h-[320px]">
              <h3 className="font-semibold text-[#2C3E44] mb-2">
                {focusAreas[2].title}
              </h3>
              <p className="text-gray-500 text-sm">
                {focusAreas[2].description}
              </p>
            </div>

            <div className="bg-gray-100 rounded-3xl p-6 h-[160px] sm:h-[170px] lg:h-[180px]">
              <h3 className="font-semibold text-[#2C3E44] mb-2">
                {focusAreas[5].title}
              </h3>
              <p className="text-gray-500 text-sm">
                {focusAreas[5].description}
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default FocusAreas;