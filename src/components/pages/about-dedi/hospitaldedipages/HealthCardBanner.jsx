import React from "react";
import { ArrowRight } from "lucide-react";

const HealthCardBanner = () => {
  return (
    <section style={{ backgroundColor: "#fdf8f2" }} className="px-6 py-10">
      <div className="max-w-3xl mx-auto">

        <div
          className="relative rounded-2xl overflow-hidden px-10 py-12"
          style={{ backgroundColor: "#1e2a35" }}
        >
          {/* Decorative geometric shapes - right side */}
          <div className="absolute top-0 right-0 bottom-0 w-1/2 pointer-events-none overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" preserveAspectRatio="xMidYMid slice">
              {/* Large triangles */}
              <rect x="200" y="0" width="100" height="100" fill="#2a3a47" />
              <rect x="300" y="0" width="100" height="100" fill="#243340" />
              <rect x="200" y="100" width="100" height="100" fill="#243340" />
              <rect x="300" y="100" width="100" height="100" fill="#2a3a47" />
              {/* Triangle cutouts */}
              <polygon points="200,0 300,0 200,100" fill="#1e2a35" />
              <polygon points="300,0 400,0 400,100" fill="#1e2a35" />
              <polygon points="200,100 300,200 200,200" fill="#1e2a35" />
              <polygon points="300,100 400,100 400,200" fill="#1e2a35" />
              <polygon points="300,0 300,100 400,100" fill="#243340" opacity="0.5" />
              <polygon points="200,100 300,100 300,200" fill="#243340" opacity="0.5" />
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-xs">
            <h2 className="text-white font-extrabold text-3xl md:text-4xl leading-tight mb-4">
              Don't Have a Health Card?
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Get your Health Card today and avail exclusive benefits at this hospital
            </p>

            <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-sm font-semibold pl-5 pr-1 py-1 rounded-full transition-all duration-200 shadow-md">
              Apply for Health Card
              <span className="flex items-center justify-center bg-white rounded-full w-8 h-8">
                <ArrowRight className="w-4 h-4 text-orange-500" />
              </span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HealthCardBanner;