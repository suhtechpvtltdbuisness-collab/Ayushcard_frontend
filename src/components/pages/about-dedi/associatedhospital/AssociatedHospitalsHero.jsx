import React, { useState } from "react";
import { Search, ArrowUpRight, Phone, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const hospitals = [
  { id: 1, name: "Care Hospital", type: "Hospital", rating: 4.2, phone: "0512251003", hours: "Open 24 x 7", address: "3531, Infornt Of Shiv Mandir, Awas Vikas Colony-3, Kanpur Nagar Uttar Pradesh-208019", image: "/Associate_hospital_img.svg" },
  { id: 2, name: "Iris Pathology Lab", type: "Pathology", rating: 3.8, phone: "0512251003", hours: "7:00 am - 8:00 pm", address: "3531, Infornt Of Shiv Mandir, Awas Vikas Colony-3, Kanpur Nagar Uttar Pradesh-208019", image: "/Associate_hospital_img.svg" },
  { id: 3, name: "Shanti Clinic", type: "Clinic", rating: 4.3, phone: "0512251003", hours: "10 am-1 pm | 4 pm-8 pm", address: "3531, Infornt Of Shiv Mandir, Awas Vikas Colony-3, Kanpur Nagar Uttar Pradesh-208019", image: "/Associate_hospital_img.svg" },
  { id: 4, name: "N.B Nursing Home", type: "Nursing Home", rating: 3.9, phone: "0512251003", hours: "Open 24 x 7", address: "3531, Infornt Of Shiv Mandir, Awas Vikas Colony-3, Kanpur Nagar Uttar Pradesh-208019", image: "/Associate_hospital_img.svg" },
  { id: 5, name: "Care Hospital", type: "Hospital", rating: 4.2, phone: "0512251003", hours: "Open 24 x 7", address: "3531, Infornt Of Shiv Mandir, Awas Vikas Colony-3, Kanpur Nagar Uttar Pradesh-208019", image: "/Associate_hospital_img.svg" },
  { id: 6, name: "Wellness Pharmacy", type: "Pharmacy", rating: 3.9, phone: "0512251003", hours: "Open 24 x 7", address: "3531, Infornt Of Shiv Mandir, Awas Vikas Colony-3, Kanpur Nagar Uttar Pradesh-208019", image: "/Associate_hospital_img.svg" },
  { id: 7, name: "City Clinic", type: "Clinic", rating: 4.0, phone: "0512251003", hours: "9:00 am - 6:00 pm", address: "3531, Infornt Of Shiv Mandir, Awas Vikas Colony-3, Kanpur Nagar Uttar Pradesh-208019", image: "/Associate_hospital_img.svg" },
  { id: 8, name: "Green Nursing Home", type: "Nursing Home", rating: 4.1, phone: "0512251003", hours: "Open 24 x 7", address: "3531, Infornt Of Shiv Mandir, Awas Vikas Colony-3, Kanpur Nagar Uttar Pradesh-208019", image: "/Associate_hospital_img.svg" },
  { id: 9, name: "MedPlus Pharmacy", type: "Pharmacy", rating: 4.5, phone: "0512251003", hours: "8:00 am - 10:00 pm", address: "3531, Infornt Of Shiv Mandir, Awas Vikas Colony-3, Kanpur Nagar Uttar Pradesh-208019", image: "/Associate_hospital_img.svg" },
];

const categories = ["All Organization Types", "Pathology", "Pharmacy", "Hospital", "Nursing Home", "Clinic"];

const AssociatedHospitals = () => {
  const [activeCategory, setActiveCategory] = useState("All Organization Types");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = hospitals.filter((h) => {
    const matchesCategory = activeCategory === "All Organization Types" || h.type === activeCategory;
    const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase()) || h.type.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section style={{ backgroundColor: "#fdf8f2" }} className="min-h-screen py-10 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Search Bar */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-full px-5 py-3 shadow-sm mb-8 max-w-lg mx-auto">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search for Hospital"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-400"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-500"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((hospital) => (
            <div key={hospital.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
              {/* Image */}
              <div className="relative">
                <img src={hospital.image} alt={hospital.name} className="w-full object-cover" style={{ height: "170px" }} />
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
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-gray-900 font-semibold text-sm">{hospital.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="text-gray-700 text-xs font-medium">{hospital.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Phone className="w-3 h-3" />
                    <span>{hospital.phone}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{hospital.hours}</span>
                  </div>
                </div>
                <div className="flex items-start gap-1 text-gray-400 text-xs leading-relaxed">
                  <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>{hospital.address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center text-gray-400 py-20 text-sm">No results found for "{search}"</div>
        )}

      </div>
    </section>
  );
};

export default AssociatedHospitals;