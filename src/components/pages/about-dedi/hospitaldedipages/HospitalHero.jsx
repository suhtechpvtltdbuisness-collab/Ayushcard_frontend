import React from "react";
import { MapPin, Star, Calendar, CheckCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const HospitalHero = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hospital = location.state?.hospital;

  const data = hospital || {
    name: "Care Hospital",
    type: "Hospital",
    subtitle: "Multi-Specialty Hospital | 24/7 Emergency Services",
    rating: 4.5,
    reviews: 850,
    address: "Kanpur Nagar, Uttar Pradesh",
    since: "Partner Since 2020",
  };

  return (
    <section style={{ backgroundColor: "#ffffff" }} className="min-h-screen py-10 px-6 pb-0">
      <div className="max-w-5xl mx-auto">

        {/* Back button */}
        {/* <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm text-gray-500 hover:text-orange-500 flex items-center gap-1 transition-colors"
        >
          ← Back to Hospitals
        </button> */}

        {/* Orange Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden px-10 py-10" style={{ backgroundColor: "#f97316" }}>

          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 opacity-20 pointer-events-none">
            <svg width="200" height="160" viewBox="0 0 200 160" fill="none">
              <polygon points="100,0 200,160 0,160" fill="white" />
              <polygon points="150,0 200,80 100,80" fill="white" />
            </svg>
          </div>

          {/* Verified Badge */}
          <div className="absolute top-4 right-4">
            <span className="flex items-center gap-1.5 bg-white bg-opacity-20 border border-white border-opacity-30 text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full">
              <CheckCircle className="w-3 h-3" />
              Verified Partner Hospital
            </span>
          </div>

          {/* Name */}
          <h1 className="text-white font-extrabold text-3xl md:text-4xl mb-3 relative z-10">
            {data.name}
          </h1>

          {/* Subtitle */}
          <p className="text-orange-100 text-base md:text-lg font-medium mb-10 relative z-10">
            {data.subtitle || `${data.type} | 24/7 Emergency Services`}
          </p>

          {/* 3 Info Items */}
          <div className="flex flex-col sm:flex-row gap-6 relative z-10">

            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-xs font-semibold mb-0.5">Location</p>
                <p className="text-orange-100 text-xs">{data.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Star className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-xs font-semibold mb-0.5">Rating</p>
                <p className="text-orange-100 text-xs">{data.rating}/5 ({data.reviews || 850}+ reviews)</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-xs font-semibold mb-0.5">Since</p>
                <p className="text-orange-100 text-xs">{data.since || "Partner Since 2020"}</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default HospitalHero;