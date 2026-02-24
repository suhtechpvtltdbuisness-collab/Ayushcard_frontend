import React from "react";
import { useLocation } from "react-router-dom";
import { CreditCard, Building2, FlaskConical, Clock, Pill } from "lucide-react";

const benefits = [
  { icon: CreditCard, text: "20-40% discount on all OPD consultations" },
  { icon: Building2, text: "Special rates on hospitalization and room charges" },
  { icon: FlaskConical, text: "Reduced pricing on diagnostic tests and lab services" },
  { icon: Clock, text: "Priority registration and reduced waiting time" },
  { icon: Pill, text: "Discounts on pharmacy medicines (at in-house pharmacy)" },
];

const HospitalAbout = () => {
  const location = useLocation();
  const hospital = location.state?.hospital;

  const name = hospital?.name || "Care Hospital";
  const image = hospital?.image || "/Associate_hospital_img.svg";

  return (
    <section style={{ backgroundColor: "#ffffff" }} className="px-6 pt-1">
      <div className="max-w-3xl mx-auto">

        {/* Hospital Image */}
        <div className="rounded-2xl overflow-hidden mb-10" style={{ height: "280px" }}>
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* About Section */}
        <div className="mb-14">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            About {name}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">
            {name} is a leading multi-specialty healthcare facility in Kanpur, committed to providing
            world-class medical services with compassion and expertise. With state-of-the-art
            infrastructure and a team of highly qualified doctors, we ensure the best possible care
            for all our patients.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed">
            As a proud partner of Baijnaath Kesar Bai Sewa Trust, we offer special benefits and
            discounted services to Health Card holders, making quality healthcare accessible to
            economically weaker families.
          </p>
        </div>

        {/* Health Card Benefits */}
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
            Health Card Benefits at {name}
          </h2>

          <div className="flex flex-col gap-4">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="text-gray-700 text-sm">{benefit.text}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default HospitalAbout;