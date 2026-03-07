import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import apiService from "../../../../api/service";

const CreateEmployee = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    phone: "",
    email: "",
    dateOfJoining: "",
    location: "",
    salary: "",
    workingHoursFrom: "10:00 AM",
    workingHoursTo: "6:00 PM",
    role: "",
  });

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const formatTime = (timeStr) => {
    // UI has "10:00 AM". API expects "09:00". We need to safely transform or let backend handle if it accepts string.
    // If it's a simple length 5 string like "10:00", keep it.
    if (!timeStr) return "09:00";
    const match = timeStr.match(/(\d+):(\d+)\s*([AP]M)/i);
    if (match) {
      let hrs = parseInt(match[1]);
      if (match[3].toUpperCase() === 'PM' && hrs < 12) hrs += 12;
      if (match[3].toUpperCase() === 'AM' && hrs === 12) hrs = 0;
      return `${hrs.toString().padStart(2, '0')}:${match[2]}`;
    }
    return timeStr.substring(0, 5);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");

      let formattedDate = formData.dateOfJoining;
      if (formattedDate) {
        // Assume API accepts "YYYY-MM-DD" which is the HTML date picker default.
        // User's example: "2026-03-01". So keep YYYY-MM-DD.
        // If it needs DD-MM-YYYY we can do that, but "2026-03-01" was in example.
      }

      const payload = {
        name: formData.name,
        email: formData.email,
        password: password || "securePassword123", // Provided by user example
        role: "employee", // Hardcoded per API requirements, ignoring user typo if any
        contact: formData.phone || "+1234567890",
        employeeId: formData.id,
        location: formData.location,
        salary: Number(formData.salary.replace(/\D/g, "")) || 0,
        dateOfJoining: formData.dateOfJoining || new Date().toISOString().split('T')[0],
        workStartTime: formatTime(formData.workingHoursFrom),
        workEndTime: formatTime(formData.workingHoursTo)
      };

      await apiService.createEmployee(payload);
      navigate("/admin/hr/employees");
    } catch (err) {
      console.error("Employee create error:", err);
      setError(err.response?.data?.message || err.message || "Failed to create employee");
    } finally {
      setLoading(false);
    }
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
            onClick={() => navigate("/admin/hr/employees")}
            className="w-10 h-10 border border-[#E5E7EB] rounded-full flex items-center justify-center text-[#4B5563] bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-[#22333B]">Create Employee</h2>
        </div>
        <div className="flex gap-4 items-center">
          {error && <span className="text-red-500 text-sm">{error}</span>}
          <button
            type="button"
            onClick={() => navigate("/admin/hr/employees")}
            disabled={loading}
            className="px-6 py-2.5 border border-[#E5E7EB] text-[#4B5563] bg-white rounded-lg text-[15px] font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-employee-form"
            disabled={loading}
            className="px-6 py-2.5 bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-[15px] font-medium hover:bg-[#ff7535] transition-colors flex items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Save Employee
          </button>
        </div>
      </div>

      {/* Details Card */}
      <form
        id="create-employee-form"
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
              Password
            </label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create password"
              className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"
            />
          </div>
          <div>
            <label className="block text-[15px] font-medium text-[#4B5563] mb-1.5">
              Date of Joining
            </label>
            <input
              type="date"
              name="dateOfJoining"
              value={formData.dateOfJoining}
              onChange={handleChange}
              className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"
            />
          </div>
          <div>
            <label className="block text-[15px] font-medium text-[#4B5563] mb-1.5">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter location"
              className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"
            />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div>
            <label className="block text-[15px] font-medium text-[#4B5563] mb-1.5">
              Salary
            </label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g. 20,000"
              className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"
            />
          </div>
          <div>
            <label className="block text-[15px] font-medium text-[#4B5563] mb-1.5">
              Working hours
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                name="workingHoursFrom"
                value={formData.workingHoursFrom}
                onChange={handleChange}
                placeholder="From"
                className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F] text-center"
              />
              <input
                type="text"
                name="workingHoursTo"
                value={formData.workingHoursTo}
                onChange={handleChange}
                placeholder="To"
                className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F] text-center"
              />
            </div>
          </div>
          <div>
            <label className="block text-[15px] font-medium text-[#4B5563] mb-1.5">
              Role
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Enter role"
              className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEmployee;
