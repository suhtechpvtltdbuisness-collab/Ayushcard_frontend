import React from "react";
import { ArrowUpRight, Phone, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const nearbyHospitals = [
  {
    id: 1,
    name: "Care Hospital",
    type: "Hospital",
    rating: 4.2,
    phone: "0512251003",
    hours: "Open 24 x 7",
    address: "3531, Infornt Of Shiv Mandir, Awas Vikas Colony-3, Kanpur Nagar Uttar Pradesh-208019",
    image: "/Associate_hospital_img.svg",
  },
  {
    id: 2,
    name: "Iris Pathology Lab",
    type: "Pathology",
    rating: 3.8,
    phone: "0512251003",
    hours: "7:00 am - 8:00 pm",
    address: "3531, Infornt Of Shiv Mandir, Awas Vikas Colony-3, Kanpur Nagar Uttar Pradesh-208019",
    image: "/Associate_hospital_img.svg",
  },
  {
    id: 3,
    name: "Shanti Clinic",
    type: "Clinic",
    rating: 4.3,
    phone: "0512251003",
    hours: "10 am-1 pm | 4 pm-8 pm",
    address: "3531, Infornt Of Shiv Mandir, Awas Vikas Colony-3, Kanpur Nagar Uttar Pradesh-208019",
    image: "/Associate_hospital_img.svg",
  },
];

const NearbyHospitals = () => {
  const navigate = useNavigate();

  return (
    <section style={{ backgroundColor: "#fdf8f2" }} className="px-6 py-16">
      <div className="max-w-3xl mx-auto">

        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-10">
          Nearby Hospitals
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {nearbyHospitals.map((hospital) => (
            <div
              key={hospital.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {/* Image */}
              <div className="relative">
                <img
                  src={hospital.image}
                  alt={hospital.name}
                  className="w-full object-cover"
                  style={{ height: "150px" }}
                />
                {/* Category Badge */}
                <span className="absolute top-3 right-3 bg-white text-orange-500 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                  {hospital.type}
                </span>
                {/* Arrow Button */}
                <button
                  onClick={() => navigate(`/hospitals/${hospital.id}`, { state: { hospital } })}
                  className="absolute bottom-3 right-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full w-9 h-9 flex items-center justify-center shadow-md transition-colors duration-200"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              {/* Info */}
              <div className="p-4">
                {/* Name + Rating */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-gray-900 font-semibold text-xs">{hospital.name}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className="text-gray-700 text-xs font-medium">{hospital.rating}</span>
                  </div>
                </div>

                {/* Phone + Hours */}
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Phone className="w-3 h-3" />
                    <span>{hospital.phone}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{hospital.hours}</span>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-1 text-gray-400 text-xs leading-relaxed">
                  <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>{hospital.address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default NearbyHospitals;