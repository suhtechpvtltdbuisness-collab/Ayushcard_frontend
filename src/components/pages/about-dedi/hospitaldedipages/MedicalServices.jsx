import React from "react";
import { Heart, Brain, Baby, PersonStanding, Eye, FlaskConical, Scissors, Settings, User, Droplet, Leaf, Snowflake } from "lucide-react";

const specialties = [
  { label: "Cardiology", icon: Heart },
  { label: "Neurology", icon: Brain },
  { label: "Pediatrics", icon: Baby },
  { label: "Orthopedics", icon: PersonStanding },
  { label: "Ophthalmology", icon: Eye },
  { label: "Oncology", icon: FlaskConical },
  { label: "General Surgery", icon: Scissors },
  { label: "Internal Med", icon: Settings },
  { label: "Gynecology", icon: User },
  { label: "Urology", icon: Droplet },
  { label: "Dermatology", icon: Leaf },
  { label: "ICU Care", icon: Snowflake },
];

const MedicalServices = () => {
  return (
    <section style={{ backgroundColor: "#f0f0f0" }} className="py-16 px-6">
      <div className="max-w-3xl mx-auto">

        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-14">
          Medical Services & Specialties
        </h2>

        <div className="grid grid-cols-4 gap-x-6 gap-y-10">
          {specialties.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex flex-col items-center gap-3">
                {/* Circle icon */}
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Icon className="w-6 h-6 text-orange-400" />
                </div>
                {/* Label */}
                <p className="text-gray-700 text-sm text-center leading-tight">{item.label}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default MedicalServices;