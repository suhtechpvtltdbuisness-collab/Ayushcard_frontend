import React from 'react';

const teamMembers = [
  {
    id: 1,
    name: "Mateo Rossi",
    role: "CFO",
    org: "BKBS Trust",
    image: "/team1.svg",
    featured: false,
  },
  {
    id: 2,
    name: "Liam Carter",
    role: "CEO",
    org: "BKBS Trust",
    image: "/team2.svg",
    featured: true,
  },
  {
    id: 3,
    name: "Stephanie Moore",
    role: "CTO",
    org: "BKBS Trust",
    image: "/team3.svg",
    featured: false,
  },
];

const TeamSection = () => {
  return (
    <section className="py-16 md:py-24 px-6 bg-[#f0f0f0]">
      <div className="max-w-5xl mx-auto">

        {/* Badge */}
        <div className="flex justify-center mb-5">
          <span className="px-4 py-1.5 border border-[#F68E5F] text-[#F68E5F] rounded-full text-sm font-medium">
            Our Team
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 text-center leading-tight mb-4">
          Meet Our Team
        </h2>

        {/* Subtitle */}
        <p className="text-gray-500 text-center text-sm md:text-base leading-relaxed max-w-sm mx-auto mb-12 md:mb-16">
          A dedicated team of experts using tech and smart strategy to simplify shipping for all
        </p>

        {/* Team Cards */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center gap-8">

          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex flex-col items-center w-full sm:w-auto"
              style={{
                width: member.featured ? "260px" : "220px",
              }}
            >
              {/* Avatar Circle */}
              <div
                className="rounded-full overflow-hidden mb-0 flex-shrink-0"
                style={{
                  width: member.featured ? "180px" : "160px",
                  height: member.featured ? "180px" : "160px",
                  backgroundColor: member.featured ? "#F68E5F" : "#d1d5db",
                  filter: member.featured ? "none" : "grayscale(100%)",
                }}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* Name Card */}
              <div className="bg-white rounded-2xl px-6 py-4 w-full shadow-lg -mt-4 relative z-10 text-center sm:text-left">
                <p className="font-bold text-gray-900 text-base">
                  {member.name}
                </p>
                <p className="text-gray-400 text-sm mt-0.5">
                  {member.role} <span className="mx-1">•</span> {member.org}
                </p>
              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
};

export default TeamSection;