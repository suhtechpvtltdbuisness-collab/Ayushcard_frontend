import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, ChevronDown } from "lucide-react";
import { getSalaries } from "./Salary";

const SalaryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);

  // Load data
  useEffect(() => {
    const salaries = getSalaries();
    const data = salaries.find((s) => s.id === id) || salaries[0];
    if (data && !formData) {
      setFormData(data);
    }
  }, [id, formData]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "name") {
      value = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (name === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const salaries = getSalaries();
    let formattedDate = formData.date;

    // Convert YYYY-MM-DD back to DD-MM-YYYY if it came from native date picker
    if (
      formattedDate &&
      formattedDate.includes("-") &&
      formattedDate.split("-")[0].length === 4
    ) {
      const [year, month, day] = formattedDate.split("-");
      formattedDate = `${day}-${month}-${year}`;
    }

    const updatedData = salaries.map((s) =>
      s.id === id ? { ...formData, date: formattedDate } : s,
    );

    localStorage.setItem("salary_data", JSON.stringify(updatedData));

    // Update local form state with formatted date to match display
    setFormData((prev) => ({ ...prev, date: formattedDate }));
    setIsEditing(false);
  };

  if (!formData) return null;

  // Use date value formatted for the native date input if editing
  const getDateValueForInput = () => {
    if (!formData.date) return "";
    if (
      formData.date.includes("-") &&
      formData.date.split("-")[0].length !== 4
    ) {
      // Assuming DD-MM-YYYY, convert to YYYY-MM-DD
      const parts = formData.date.split("-");
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    return formData.date;
  };

  return (
    <div
      className="flex flex-col h-full overflow-y-auto pb-10"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/hr/salary")}
            className="w-10 h-10 border border-[#E5E7EB] rounded-full flex items-center justify-center text-[#4B5563] bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-[#22333B]">
            {isEditing ? "Edit Salary Details" : "Salary Details"}
          </h2>
        </div>

        <div className="flex gap-4">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  const salaries = getSalaries();
                  setFormData(salaries.find((s) => s.id === id) || salaries[0]);
                }}
                className="px-4 py-2.5 border border-[#F68E5F] text-[#F68E5F] bg-white rounded-lg text-[15px] font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2.5 bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-[15px] font-medium hover:bg-[#ff7535] transition-colors"
              >
                Save
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-[#F68E5F] bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-[15px] font-medium hover:bg-[#ff7535] hover:text-white transition-colors flex items-center gap-2"
            >
              Edit
              <Edit2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white border border-[#D9D9D9] rounded-2xl p-4">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div>
            <label className="block text-[15px] font-medium text-[#4B5563] mb-1.5">
              Employee ID
            </label>
            <input
              type="text"
              name="id"
              value={formData.id}
              readOnly
              className={`w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#9CA3AF] bg-[#F9FAFB] cursor-not-allowed focus:outline-none`}
            />
          </div>
          <div>
            <label className="block text-[15px] font-medium text-[#4B5563] mb-1.5">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] ${!isEditing ? "bg-white cursor-default focus:outline-none" : "bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"}`}
            />
          </div>
          <div>
            <label className="block text-[15px] font-medium text-[#4B5563] mb-1.5">
              Contact Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] ${!isEditing ? "bg-white cursor-default focus:outline-none" : "bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"}`}
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div>
            <label className="block text-[15px] font-medium text-[#4B5563] mb-1.5">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email || "N/A"}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] ${!isEditing ? "bg-white cursor-default focus:outline-none" : "bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"}`}
            />
          </div>
          <div>
            <label className="block text-[15px] font-medium text-[#4B5563] mb-1.5">
              Status
            </label>
            {isEditing ? (
              <div className="relative">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F] appearance-none"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
                />
              </div>
            ) : (
              <input
                type="text"
                value={formData.status}
                readOnly
                className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white cursor-default focus:outline-none"
              />
            )}
          </div>
          <div>
            <label className="block text-[15px] font-medium text-[#4B5563] mb-1.5">
              Date
            </label>
            {isEditing ? (
              <input
                type="date"
                name="date"
                value={getDateValueForInput()}
                onChange={handleChange}
                className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"
              />
            ) : (
              <input
                type="text"
                value={formData.date}
                readOnly
                className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white cursor-default focus:outline-none"
              />
            )}
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-[15px] font-medium text-[#4B5563] mb-1.5">
              Salary
            </label>
            <input
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] ${!isEditing ? "bg-white cursor-default focus:outline-none" : "bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"}`}
            />
          </div>
          <div>
            <label className="block text-[15px] font-medium text-[#4B5563] mb-1.5">
              Payment method
            </label>
            {isEditing ? (
              <div className="relative">
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F] appearance-none"
                >
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
                />
              </div>
            ) : (
              <input
                type="text"
                value={formData.paymentMethod}
                readOnly
                className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white cursor-default text-left focus:outline-none"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryDetails;
