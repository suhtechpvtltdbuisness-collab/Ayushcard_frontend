import React from 'react';

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
        <p className="text-center text-gray-400 text-sm mb-8 tracking-wide">
          Certifications
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {certifications.map((cert, i) => (
            <div
              key={i}
              className="bg-white rounded-xl px-6 py-5 flex items-center justify-center text-center text-gray-800 text-sm font-medium shadow-sm hover:shadow-md transition-shadow duration-200"
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