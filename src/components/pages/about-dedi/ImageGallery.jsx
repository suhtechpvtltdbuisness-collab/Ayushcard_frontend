import React from "react";

const ImageGallery = () => {
  return (
    <section className="bg-[#ffffff] py-14 md:py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col items-center mb-10 md:mb-16">
          <span className="px-4 py-1 border border-[#F68E5F] text-[#F68E5F] rounded-full text-sm font-medium mb-6 bg-white">
            Image Gallery
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-700 text-center">
            Glimpse of Special Moments
          </h2>
        </div>

        {/* PERFECT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[220px] gap-4 md:gap-6">

          {/* Top Row */}
          <div className="rounded-3xl overflow-hidden">
            <img src="/gallery1.svg" alt="" className="w-full h-full object-cover" />
          </div>

          <div className="rounded-3xl overflow-hidden">
            <img src="/gallery2.svg" alt="" className="w-full h-full object-cover" />
          </div>

          <div className="rounded-3xl overflow-hidden">
            <img src="/gallery3.svg" alt="" className="w-full h-full object-cover" />
          </div>

          {/* Right Tall */}
          <div className="lg:row-span-2 rounded-3xl overflow-hidden">
            <img src="/gallery4.svg" alt="" className="w-full h-full object-cover" />
          </div>

          {/* Left Tall */}
          <div className="lg:row-span-2 rounded-3xl overflow-hidden">
            <img src="/gallery5.svg" alt="" className="w-full h-full object-cover" />
          </div>

          {/* Big Center */}
          <div className="sm:col-span-2 lg:row-span-2 rounded-3xl overflow-hidden">
            <img src="/gallery6.svg" alt="" className="w-full h-full object-cover" />
          </div>

          {/* Bottom Right Small */}
          <div className="rounded-3xl overflow-hidden">
            <img src="/gallery7.svg" alt="" className="w-full h-full object-cover" />
          </div>

        </div>
      </div>
    </section>
  );
};

export default ImageGallery;