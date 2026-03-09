import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getDonations } from "../../../data/mockData";

const DonationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Load data
  const donations = getDonations();
  const initialData = donations.find((d) => d.id === id) || donations[0]; // fallback to first item

  const [formData, setFormData] = useState(initialData);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e, field) => {
    let value = e.target.value;

    if (field === "name") {
      value = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (field === "contact") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    if (dateStr.includes("-") && dateStr.split("-")[0].length === 4)
      return dateStr;
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const handleDateChange = (e, field) => {
    const val = e.target.value;
    if (!val) {
      setFormData((prev) => ({ ...prev, [field]: "" }));
      return;
    }
    const parts = val.split("-");
    if (parts.length === 3) {
      setFormData((prev) => ({
        ...prev,
        [field]: `${parts[2]}-${parts[1]}-${parts[0]}`,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: val }));
    }
  };

  const handleSave = () => {
    const updatedDonations = donations.map((d) => (d.id === id ? formData : d));
    localStorage.setItem("donations_data", JSON.stringify(updatedDonations));
    setIsEditing(false);
  };

  return (
    <div
      className="flex flex-col h-full overflow-y-auto pb-10"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/donations")}
            className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center text-[#4B5563] bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-[#22333B]">Enquiry Details</h2>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setFormData(initialData);
                  setIsEditing(false);
                }}
                className="px-4 py-1.5 border border-gray-200 rounded-lg text-[15px] font-medium text-[#374151] hover:bg-gray-50 bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1.5 bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-[15px] font-medium hover:bg-[#ff702d] transition-colors"
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-1.5 bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-[15px] font-medium hover:bg-[#ff6e2b] flex items-center gap-2 transition-colors"
            >
              Edit
              <img
                src="/admin_images/Edit 3.svg"
                alt=""
                className="w-3.5 h-3.5"
              />
            </button>
          )}
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div>
            <label className="block text-[16px] text-[#374151] mb-1.5">
              Enquiry ID
            </label>
            <input
              type="text"
              value={formData.id || ""}
              readOnly
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[16px] text-[#22333B] bg-[#F9FAFB] cursor-default focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[16px] text-[#374151] mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) => handleChange(e, "name")}
              readOnly={!isEditing}
              className={`w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[16px] text-[#22333B] focus:outline-none ${!isEditing ? "bg-[#F9FAFB] cursor-default" : "bg-white"}`}
            />
          </div>
          <div>
            <label className="block text-[16px] text-[#374151] mb-1.5">
              Contact Number
            </label>
            <input
              type="text"
              value={formData.contact || ""}
              onChange={(e) => handleChange(e, "contact")}
              readOnly={!isEditing}
              className={`w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[16px] text-[#22333B] focus:outline-none ${!isEditing ? "bg-[#F9FAFB] cursor-default" : "bg-white"}`}
            />
          </div>
          <div>
            <label className="block text-[16px] text-[#374151] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={formData.email || ""}
              onChange={(e) => handleChange(e, "email")}
              readOnly={!isEditing}
              className={`w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[16px] text-[#22333B] focus:outline-none ${!isEditing ? "bg-[#F9FAFB] cursor-default" : "bg-white"}`}
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="md:col-span-2">
            <label className="block text-[16px] text-[#374151] mb-1.5">
              Location
            </label>
            <input
              type="text"
              value={formData.location || ""}
              onChange={(e) => handleChange(e, "location")}
              readOnly={!isEditing}
              className={`w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[16px] text-[#22333B] focus:outline-none ${!isEditing ? "bg-[#F9FAFB] cursor-default" : "bg-white"}`}
            />
          </div>
          <div>
            <label className="block text-[16px] text-[#374151] mb-1.5">
              Date
            </label>
            <input
              type={isEditing ? "date" : "text"}
              value={
                isEditing
                  ? formatDateForInput(formData.date)
                  : formData.date || ""
              }
              onChange={(e) => handleDateChange(e, "date")}
              readOnly={!isEditing}
              className={`w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[16px] text-[#22333B] focus:outline-none ${!isEditing ? "bg-[#F9FAFB] cursor-default" : "bg-white"}`}
            />
          </div>
          <div>
            <label className="block text-[16px] text-[#374151] mb-1.5">
              Time
            </label>
            <input
              type={isEditing ? "time" : "text"}
              value={formData.time || ""}
              onChange={(e) => handleChange(e, "time")}
              readOnly={!isEditing}
              className={`w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[16px] text-[#22333B] focus:outline-none ${!isEditing ? "bg-[#F9FAFB] cursor-default" : "bg-white"}`}
            />
          </div>
        </div>

        {/* Row 3 - Message */}
        <div>
          <label className="block text-[16px] text-[#374151] mb-1.5">
            Message
          </label>
          <textarea
            value={formData.message || ""}
            onChange={(e) => handleChange(e, "message")}
            readOnly={!isEditing}
            rows={4}
            className={`w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[16px] leading-relaxed text-[#22333B] focus:outline-none resize-none ${!isEditing ? "bg-[#F9FAFB] cursor-default" : "bg-white"}`}
          />
        </div>
      </div>
    </div>
  );
};

export default DonationDetails;
