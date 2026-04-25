import React from "react";

const teamMembers = [
  {
    id: 1,
    name: "Abhishek Shukla",
    role: "General Secretary",
    org: "BKBS Trust",
    image: "/assets/team/team2.jpg",
    featured: false,
  },
  {
    id: 2,
    name: "Vivek Mishra",
    role: "president trusty",
    org: "BKBS Trust",
    image: "/assets/team/team1.jpg",
    featured: true,
  },
  {
    id: 3,
    name: "Pushpa Devi",
    role: "Director General",
    org: "BKBS Trust",
    image: "/assets/team/team3.jpg",
    featured: false,
  },
];

const TeamSection = () => {
  return (
    <section id="team-section" className="py-14 md:py-24 px-4 sm:px-6 bg-[#f0f0f0]">
      <div className="max-w-5xl mx-auto">
        {/* Badge */}
        <div className="flex justify-center mb-5">
          <span className="px-4 py-1.5 border border-[#F68E5F] text-[#F68E5F] rounded-full text-sm font-medium">
            Our Team
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 text-center leading-tight mb-4">
          Meet Our Team
        </h2>

        {/* Subtitle */}
        <p className="text-gray-500 text-center text-sm md:text-base leading-relaxed max-w-sm mx-auto mb-12 md:mb-16">
          A dedicated team of experts using tech and smart strategy to simplify
          shipping for all
        </p>

        {/* Team Cards */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center gap-8">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex flex-col items-center w-full sm:w-auto"
              style={{
                width: member.featured ? "min(280px, 100%)" : "min(240px, 100%)",
              }}
            >
              {/* Avatar Circle */}
              <div
                className="rounded-full overflow-hidden mb-0 flex-shrink-0 border-4 border-white shadow-md"
                style={{
                  width: member.featured ? "200px" : "180px",
                  height: member.featured ? "200px" : "180px",
                  backgroundColor: member.featured ? "#F68E5F" : "#d1d5db",
                  filter: "none",
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
