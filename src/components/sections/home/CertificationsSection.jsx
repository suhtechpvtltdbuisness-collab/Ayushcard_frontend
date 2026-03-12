import React from "react";

const certifications = [
  "Registration Certificate",
  "80G",
  "12A",
  "Pan Card",
  "NGO Darpan",
  "TAN",
];

const CertificationsSection = () => {
  return (
    <section
      className="py-12 px-6 relative overflow-hidden"
      style={{ backgroundColor: "#1e2a35" }}
    >
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-gray-400 text-xs md:text-sm mb-6 md:mb-8 tracking-widest uppercase">
          Certifications
        </p>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4 md:gap-5 max-w-3xl mx-auto">
          {certifications.map((cert, i) => (
            <div
              key={i}
              className="bg-white/5 md:bg-white rounded-xl px-6 py-4 md:py-6 flex items-center justify-center text-center text-white md:text-gray-800 text-sm font-semibold shadow-sm hover:translate-y-[-2px] transition-all duration-300 border border-white/10 md:border-transparent"
            >
              {cert}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CertificationsSection;
