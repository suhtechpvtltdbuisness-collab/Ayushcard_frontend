import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { getSalaries } from "./Salary";

const CreateSalary = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    phone: "",
    email: "",
    status: "Paid",
    date: "",
    amount: "",
    paymentMethod: "UPI",
  });

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "name") {
      value = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (name === "phone") {
      value = value.replace(/\D/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    const salaries = getSalaries();

    let formattedDate = formData.date;
    if (formattedDate) {
      const [year, month, day] = formattedDate.split("-");
      formattedDate = `${day}-${month}-${year}`;
    }

    const newSalaryEntry = {
      ...formData,
      date: formattedDate,
    };

    const updatedSalaries = [newSalaryEntry, ...salaries];
    localStorage.setItem("salary_data", JSON.stringify(updatedSalaries));

    navigate("/admin/hr/salary");
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
            onClick={() => navigate("/admin/hr/salary")}
            className="w-10 h-10 border border-[#E5E7EB] rounded-full flex items-center justify-center text-[#4B5563] bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-[#22333B]">
            Create Salary Entry
          </h2>
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/hr/salary")}
            className="px-6 py-2.5 border border-[#E5E7EB] text-[#4B5563] bg-white rounded-lg text-[15px] font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-salary-form"
            className="px-6 py-2.5 bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-[15px] font-medium hover:bg-[#ff7535] transition-colors"
          >
            Save Entry
          </button>
        </div>
      </div>

      {/* Details Card */}
      <form
        id="create-salary-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="bg-white border border-[#D9D9D9] rounded-2xl p-6 shadow-sm"
      >
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
              onChange={handleChange}
              placeholder="Enter Employee ID"
              className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"
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
              placeholder="Enter name"
              className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"
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
              placeholder="Enter phone number"
              className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"
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
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"
            />
          </div>
          <div>
            <label className="block text-[15px] font-medium text-[#4B5563] mb-1.5">
              Status
            </label>
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
          </div>
          <div>
            <label className="block text-[15px] font-medium text-[#4B5563] mb-1.5">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"
            />
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
              placeholder="e.g. 20,000"
              className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"
            />
          </div>
          <div>
            <label className="block text-[15px] font-medium text-[#4B5563] mb-1.5">
              Payment method
            </label>
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
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateSalary;
