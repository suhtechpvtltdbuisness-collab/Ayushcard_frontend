import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import apiService from "../../../../api/service";

const CreateEmployee = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    dateOfJoining: "",
    location: "",
    pincode: "",
    salary: "",
    workingHoursFrom: "10:00 AM",
    workingHoursTo: "06:00 PM",
    role: "employee",
  });

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "name") {
      value = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (name === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "pincode") {
      value = value.replace(/\D/g, "").slice(0, 6);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "09:00";
    const match = timeStr.match(/(\d+):(\d+)\s*([AP]M)/i);
    if (match) {
      let hrs = parseInt(match[1]);
      if (match[3].toUpperCase() === 'PM' && hrs < 12) hrs += 12;
      if (match[3].toUpperCase() === 'AM' && hrs === 12) hrs = 0;
      return `${hrs.toString().padStart(2, '0')}:${match[2]}`;
    }
    // If already in 24h format
    if (timeStr.includes(":")) {
      const parts = timeStr.split(":");
      if (parts[0].length === 1) parts[0] = "0" + parts[0];
      return parts.join(":").substring(0, 5);
    }
    return timeStr.substring(0, 5);
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.email || !password) {
        setError("Name, Email and Password are required.");
        return;
      }

      setLoading(true);
      setError("");

      const payload = {
        name: formData.name,
        email: formData.email,
        password: password,
        role: "employee",
        contact: formData.phone || "",
        location: formData.location || "",
        pincode: formData.pincode || "",
        salary: Number(formData.salary.replace(/\D/g, "")) || 0,
        dateOfJoining: formData.dateOfJoining || new Date().toISOString().split('T')[0],
        workStartTime: formatTime(formData.workingHoursFrom),
        workEndTime: formatTime(formData.workingHoursTo)
      };

      console.log("Creating employee with payload:", payload);
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
      className="flex flex-col h-full overflow-y-auto pb-10 min-w-0"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={() => navigate("/admin/hr/employees")}
            className="w-10 h-10 border border-[#E5E7EB] rounded-full flex items-center justify-center text-[#4B5563] bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-[#22333B] truncate">Create Employee</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center w-full lg:w-auto">
          <button
            type="button"
            onClick={() => navigate("/admin/hr/employees")}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 border border-[#E5E7EB] text-[#4B5563] bg-white rounded-lg text-[15px] font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-employee-form"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-[15px] font-medium hover:bg-[#ff7535] transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Save Employee
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Details Card */}
      <form
        id="create-employee-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="bg-white border border-[#D9D9D9] rounded-2xl p-4 sm:p-6 shadow-sm min-w-0"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-[15px] font-medium text-[#4B5563] mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter name"
              required
              className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"
            />
          </div>
          <div>
            <label className="block text-[15px] font-medium text-[#4B5563] mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
              className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"
            />
          </div>
          <div>
            <label className="block text-[15px] font-medium text-[#4B5563] mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password"
                required
                className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
          <div>
            <label className="block text-[15px] font-medium text-[#4B5563] mb-1.5">
              Pincode
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="6-digit pincode"
              maxLength={6}
              className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              Working Hours
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                type="text"
                name="workingHoursFrom"
                value={formData.workingHoursFrom}
                onChange={handleChange}
                placeholder="From (e.g. 10:00 AM)"
                className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F] text-center"
              />
              <span className="text-gray-400 font-medium self-center">to</span>
              <input
                type="text"
                name="workingHoursTo"
                value={formData.workingHoursTo}
                onChange={handleChange}
                placeholder="To (e.g. 06:00 PM)"
                className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F] text-center"
              />
            </div>
          </div>
          <div>
            <label className="block text-[15px] font-medium text-[#4B5563] mb-1.5">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEmployee;
