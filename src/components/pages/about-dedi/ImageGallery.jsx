import React from "react";

const ImageGallery = () => {
  return (
    <section className="bg-[#ffffff] py-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col items-center mb-16">
          <span className="px-4 py-1 border border-[#F68E5F] text-[#F68E5F] rounded-full text-sm font-medium mb-6 bg-white">
            Image Gallery
          </span>

          <h2 className="text-5xl font-bold text-gray-700 text-center">
            Glimpse of Special Moments
          </h2>
        </div>

        {/* PERFECT GRID */}
        <div className="grid grid-cols-4 auto-rows-[220px] gap-6">

          {/* Top Row */}
          <div className="rounded-3xl overflow-hidden">
            <img src="/gallery1.svg" alt="" className="w-full h-full " />
          </div>

          <div className="rounded-3xl overflow-hidden">
            <img src="/gallery2.svg" alt="" className="w-full h-full" />
          </div>

          <div className="rounded-3xl overflow-hidden">
            <img src="/gallery3.svg" alt="" className="w-full h-full" />
          </div>

          {/* Right Tall */}
          <div className="row-span-2 rounded-3xl overflow-hidden">
            <img src="/gallery4.svg" alt="" className="w-full h-full" />
          </div>

          {/* Left Tall */}
          <div className="row-span-2 rounded-3xl overflow-hidden">
            <img src="/gallery5.svg" alt="" className="w-full h-full" />
          </div>

          {/* Big Center */}
          <div className="col-span-2 row-span-2 rounded-3xl overflow-hidden">
            <img src="/gallery6.svg" alt="" className="w-full h-full" />
          </div>

          {/* Bottom Right Small */}
          <div className="rounded-3xl overflow-hidden">
            <img src="/gallery7.svg" alt="" className="w-full h-full" />
          </div>

        </div>
      </div>
    </section>
  );
};

export default ImageGallery;