import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Loader2 } from "lucide-react";
import { getEmployees } from "../../../../data/mockData";
import apiService from "../../../../api/service";

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load data — try API first, fall back to mock
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Try fetching all employees and find the one matching our id
        const res = await apiService.getEmployees();
        const rawList = res?.data || res?.users || res?.employees || (Array.isArray(res) ? res : []);
        const list = Array.isArray(rawList) ? rawList : (Array.isArray(res?.data) ? res.data : []);

        const matched = list.find(
          (u) => u._id === id || u.employeeId === id
        );

        if (matched) {
          setFormData({
            _rawId: matched._id,
            id: matched.employeeId || matched._id,
            name: matched.name || "",
            phone: matched.contact || "",
            email: matched.email || "",
            dateOfJoining: matched.dateOfJoining
              ? new Date(matched.dateOfJoining).toLocaleDateString()
              : "",
            location: matched.location || "",
            pincode: matched.pincode || "",
            salary: matched.salary ? String(matched.salary) : "0",
            workingHoursFrom: matched.workStartTime || "10:00 AM",
            workingHoursTo: matched.workEndTime || "6:00 PM",
            role: matched.role || "employee",
            status: matched.status || "Verified",
          });
          return;
        }
      } catch (err) {
        console.warn("[EmployeeDetails] API fetch failed, using mock:", err?.message);
      } finally {
        setLoading(false);
      }

      // Fallback: local mock data
      const employees = getEmployees();
      const data = employees.find((e) => e.id === id) || employees[0];
      if (data) setFormData(data);
    };

    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "name") {
      value = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (name === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "pincode") {
      value = value.replace(/\D/g, "").slice(0, 6);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
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
    return timeStr.substring(0, 5);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");

      const employees = getEmployees();
      let formattedDate = formData.dateOfJoining;

      // Convert YYYY-MM-DD back to DD-MM-YYYY if it came from native date picker
      if (
        formattedDate &&
        formattedDate.includes("-") &&
        formattedDate.split("-")[0].length === 4
      ) {
        const [year, month, day] = formattedDate.split("-");
        formattedDate = `${day}-${month}-${year}`;
      }

      // Determine real ID
      const targetId = formData._rawId || formData.id;

      // Attempt API Call if it's a real MongoDB ID
      if (!targetId.startsWith("EMP-")) {
        const payload = {
          name: formData.name,
          email: formData.email,
          role: "employee",
          contact: formData.phone || "+1234567890",
          location: formData.location,
          pincode: formData.pincode || "",
          salary: Number(formData.salary.replace(/\D/g, "")) || 0,
          dateOfJoining: formData.dateOfJoining || new Date().toISOString().split('T')[0],
          workStartTime: formatTime(formData.workingHoursFrom),
          workEndTime: formatTime(formData.workingHoursTo)
        };
        await apiService.updateEmployee(targetId, payload);
      }

      // Sync local state visually
      const updatedData = employees.map((e) =>
        e.id === id ? { ...formData, dateOfJoining: formattedDate } : e,
      );

      localStorage.setItem("employees_data", JSON.stringify(updatedData));
      setFormData((prev) => ({ ...prev, dateOfJoining: formattedDate }));
      setIsEditing(false);
    } catch (err) {
      console.error("Employee update error:", err);
      setError(err.response?.data?.message || err.message || "Failed to update employee");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-[#F68E5F] border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-sm text-gray-500">Loading employee details…</p>
    </div>
  );

  if (!formData) return (
    <div className="flex flex-col items-center justify-center h-64">
      <p className="text-gray-500 text-sm">Employee not found.</p>
    </div>
  );

  // Use date value formatted for the native date input if editing
  const getDateValueForInput = () => {
    if (!formData.dateOfJoining) return "";
    if (
      formData.dateOfJoining.includes("-") &&
      formData.dateOfJoining.split("-")[0].length !== 4
    ) {
      // Assuming DD-MM-YYYY, convert to YYYY-MM-DD
      const parts = formData.dateOfJoining.split("-");
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    return formData.dateOfJoining;
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
          <h2 className="text-xl font-bold text-[#22333B]">
            {isEditing ? "Edit Employee Details" : "Employee Details"}
          </h2>
        </div>

        <div className="flex gap-4 items-center">
          {error && <span className="text-red-500 text-sm whitespace-nowrap">{error}</span>}
          {isEditing ? (
            <>
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setIsEditing(false);
                  const employees = getEmployees();
                  setFormData(
                    employees.find((e) => e.id === id) || employees[0],
                  );
                  setError("");
                }}
                className="px-4 py-2.5 border border-[#F68E5F] text-[#F68E5F] bg-white rounded-lg text-[15px] font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2.5 bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-[15px] font-medium hover:bg-[#ff7535] transition-colors flex items-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Save
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-[#E5E7EB] bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-[15px] font-medium hover:bg-[#ff7535] transition-colors flex items-center gap-2"
            >
              <Edit2 size={16} /> Edit
            </button>
          )}
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white border border-[#D9D9D9] rounded-2xl p-6">
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
              Date of Joining
            </label>
            {isEditing ? (
              <input
                type="date"
                name="dateOfJoining"
                value={getDateValueForInput()}
                onChange={handleChange}
                className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"
              />
            ) : (
              <input
                type="text"
                value={formData.dateOfJoining}
                readOnly
                className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white cursor-default focus:outline-none"
              />
            )}
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
              readOnly={!isEditing}
              className={`w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] ${!isEditing ? "bg-white cursor-default focus:outline-none" : "bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"}`}
            />
          </div>
          <div>
            <label className="block text-[15px] font-medium text-[#4B5563] mb-1.5">
              Pincode
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode || ""}
              onChange={handleChange}
              readOnly={!isEditing}
              maxLength={6}
              placeholder="6-digit pincode"
              className={`w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] ${!isEditing ? "bg-white cursor-default focus:outline-none" : "bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"}`}
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
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] ${!isEditing ? "bg-white cursor-default focus:outline-none" : "bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"}`}
            />
          </div>
          <div>
            <label className="block text-[15px] font-medium text-[#4B5563] mb-1.5">
              Working Hours
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                name="workingHoursFrom"
                value={formData.workingHoursFrom}
                onChange={handleChange}
                readOnly={!isEditing}
                className={`w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] text-center ${!isEditing ? "bg-white cursor-default focus:outline-none" : "bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"}`}
              />
              <input
                type="text"
                name="workingHoursTo"
                value={formData.workingHoursTo}
                onChange={handleChange}
                readOnly={!isEditing}
                className={`w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] text-center ${!isEditing ? "bg-white cursor-default focus:outline-none" : "bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"}`}
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
              readOnly={!isEditing}
              className={`w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] ${!isEditing ? "bg-white cursor-default focus:outline-none" : "bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
