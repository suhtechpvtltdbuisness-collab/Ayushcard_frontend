import React from "react";
import { ArrowRight, CheckCircle } from "lucide-react";

const Members = () => {
  return (
    <section className="w-full py-16 px-6" style={{ backgroundColor: "#ffffff" }}>
      <div className="max-w-6xl mx-auto">

        {/* TOP: Content Left + Images Right */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">

          {/* LEFT — Content */}
          <div>
            <div className="inline-block mb-5">
              <span className="px-4 py-1.5 border border-[#F68E5F] text-[#F68E5F] rounded-full text-sm font-medium">
                Become a Member
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-5">
              Join Our Team –<br />
              Inspire Learners<br />
              Today!
            </h2>

            <p className="text-gray-500 text-base leading-relaxed mb-7">
              Whether you're a volunteer, donor, or partner, being part of Baijnaath Kesar
              Bai Sewa Trust means becoming a catalyst for change.
            </p>

            {/* Checklist */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                "Make a Real Difference",
                "Be Part of a Purposeful Network",
                "Learn and Grow",
                "Create Legacy",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-700 text-sm">
                  <CheckCircle className="w-4 h-4 text-[#F68E5F] flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Join our team button */}
            <button className="flex items-center gap-2 bg-[#F68E5F] hover:bg-[#F68E5F] active:scale-95 text-white text-sm font-semibold pl-5 pr-1 py-1 rounded-full transition-all duration-200 shadow-md">
              Join our team
              <span className="flex items-center justify-center bg-white rounded-full w-8 h-8">
                <ArrowRight className="w-4 h-4 text-[#F68E5F]" />
              </span>
            </button>
          </div>

          {/* RIGHT — Single image */}
          <div className="w-[420px] h-[420px] mx-auto rounded-[80px]">
            <img
              src="/Aboutimage.svg"
              alt="about"
              className="w-full h-full"
            />
          </div>

        </div>


      </div>
    </section>
  );
};

export default Members;