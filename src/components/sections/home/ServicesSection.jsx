import React from 'react';
import { ArrowRight } from 'lucide-react';

const ServicesSection = () => {
  const services = [
    {
      id: 1,
      icon: "/service_img_1.svg",
      title: "New Card Application",
      description: "Apply in under 10 minutes with complete document support and guidance.",
    },
    {
      id: 2,
      icon: "/service_img_2.svg",
      title: "Quick Card Renewal",
      description: "Hassle-free renewal with automated reminders. Never miss a deadline.",
    },
    {
      id: 3,
      icon: "/service_img_3.svg",
      title: "Eligibility Check & Support",
      description: "Free eligibility check and expert assistance at every step.",
    },
    {
      id: 4,
      icon: "/service_img_4.svg",
      title: "Healthcare Access",
      description: "Access cashless treatment at 100+ empanelled hospitals statewide.",
    }
  ];

  const stats = [
    {
      id: 1,
      value: "20K+",
      label: "Cards Processed",
      bgColor: "bg-white",
      textColor: "text-[#F68E5F]"
    },
    {
      id: 2,
      value: "48h",
      label: "Avg Processing Time",
      bgColor: "bg-gray-800",
      textColor: "text-white"
    },
    {
      id: 3,
      value: "98%",
      label: "Success Rate",
      bgColor: "bg-gray-800",
      textColor: "text-white"
    },
    {
      id: 4,
      value: "4.9",
      label: "User Rating",
      bgColor: "bg-gray-800",
      textColor: "text-white"
    },
    {
      id: 5,
      value: "10K+",
      label: "Happy Families",
      bgColor: "bg-[#F68E5F]",
      textColor: "text-white",
      fullWidth: true
    }
  ];

  return (
    <section className="bg-gray-100 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left Side - Content */}
          <div className="order-2 lg:order-1">
            {/* Badge */}
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-white text-[#F68E5F] rounded-full text-sm font-medium border border-[#F68E5F]">
                Our Services
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Health Card Creation Made Simple
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8">
              Get access to affordable healthcare through government-approved Ayush schemes. We handle the paperwork, you focus on your health.
            </p>

            {/* Services Grid - 2x2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {services.map((service) => (
                <div key={service.id} className="flex gap-4 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 p-2.5">
                    <img
                      src={service.icon}
                      alt={service.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-base mb-2">{service.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Apply Now with lucide ArrowRight */}
              <button className="flex items-center gap-2 bg-[#F68E5F] hover:bg-[#F68E5F] active:scale-95 text-white text-sm font-semibold pl-5 pr-1 py-1 rounded-full transition-all duration-200 shadow-md">
                Apply Now
                <span className="flex items-center justify-center bg-white rounded-full w-8 h-8">
                  <ArrowRight className="w-4 h-4 text-[#F68E5F]" />
                </span>
              </button>

              {/* Learn More */}
              <button className="flex items-center gap-2 bg-white text-[#F68E5F] text-sm font-semibold pl-5 pr-1 py-1 rounded-full border border-[#F68E5F] hover:border-gray-400 hover:shadow-md transition-all duration-200">
                Learn More
                <span className="flex items-center justify-center bg-[#F68E5F] border border-[#F68E5F] rounded-full w-8 h-8">
                  <ArrowRight className="w-4 h-4 text-white" />
                </span>
              </button>
            </div>
          </div>

          {/* Right Side - Stats Cards */}
          <div className="grid grid-cols-2 gap-4 order-1 lg:order-2">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className={`
                  ${stat.fullWidth ? 'col-span-2' : 'col-span-1'}
                  ${stat.bgColor}
                  ${stat.textColor}
                  rounded-2xl p-6 md:p-8
                  flex flex-col items-center justify-center
                  shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105
                  min-h-[160px]
                `}
              >
                <div className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2">
                  {stat.value}
                </div>
                <div className={`text-sm md:text-base ${stat.bgColor === 'bg-white' ? 'text-gray-600' : 'opacity-80'}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default ServicesSection;