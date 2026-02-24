import React from "react";
import { Check } from "lucide-react";

const facilities = [
  "24/7 Emergency Services",
  "ICU & NICU Units",
  "In-house Pharmacy",
  "Ambulance Services",
  "Blood Bank",
  "Cafeteria",
  "Parking Facility",
  "Wheelchair Accessibility",
];

const HospitalFacilities = () => {
  return (
    <section style={{ backgroundColor: "#fdf8f2" }} className="py-16 px-6">
      <div className="max-w-3xl mx-auto">

        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-12">
          Hospital Facilities
        </h2>

        {/* 2-column grid of facility pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {facilities.map((facility, i) => (
            <div
              key={i}
              className="flex items-center gap-4 bg-gray-100 rounded-2xl px-6 py-4"
            >
              <div className="flex-shrink-0">
                <Check className="w-5 h-5 text-orange-400" strokeWidth={2.5} />
              </div>
              <span className="text-gray-800 text-sm font-medium">{facility}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HospitalFacilities;