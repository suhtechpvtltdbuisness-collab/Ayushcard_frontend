import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import { getSalaries } from "../../../../data/mockData";
import apiService from "../../../../api/service";
const CreateSalary = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id: "", // Note: mapping to employeeId in API
    name: "",
    phone: "",
    email: "",
    status: "Pending",
    date: "",
    amount: "",
    paymentMethod: "Bank Transfer",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [employeesList, setEmployeesList] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const res = await apiService.getEmployees();
        const rawData = res.data || res;

        let list = Array.isArray(rawData) ? rawData : [];
        if (!list.length && rawData?.data && Array.isArray(rawData.data)) list = rawData.data;
        if (!list.length && rawData?.users && Array.isArray(rawData.users)) list = rawData.users;
        if (!list.length && rawData?.employees && Array.isArray(rawData.employees)) list = rawData.employees;

        setEmployeesList(list);
      } catch (err) {
        console.error("Failed to fetch employees for dropdown", err);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleEmployeeSelect = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setFormData(prev => ({ ...prev, id: "", name: "", email: "", phone: "" }));
      return;
    }

    const employee = employeesList.find((emp) => (emp._id || emp.id) === selectedId);
    if (employee) {
      setFormData(prev => ({
        ...prev,
        id: employee._id || employee.id || "",
        name: employee.name || "",
        phone: employee.contact || employee.phone || "",
        email: employee.email || "",
      }));
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "name") {
      value = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (name === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setError("");
    setLoading(true);

    try {
      // Map form fields to API fields
      // User request body example: { employeeId, date, amount, status, method, notes }
      const apiBody = {
        employeeId: formData.id,
        date: formData.date,
        amount: parseFloat(formData.amount.replace(/,/g, "")) || 0,
        status: formData.status.toLowerCase(),
        method: formData.paymentMethod.toLowerCase().replace(/\s+/g, "_"),
        notes: formData.notes || `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()} salary payment`
      };

      await apiService.createSalary(apiBody);

      // Also update local storage mock data for compatibility if needed
      const salaries = getSalaries();
      let formattedDate = formData.date;
      if (formattedDate) {
        const [year, month, day] = formattedDate.split("-");
        formattedDate = `${day}-${month}-${year}`;
      }
      const newSalaryEntry = { ...formData, date: formattedDate };
      const updatedSalaries = [newSalaryEntry, ...salaries];
      localStorage.setItem("salary_data", JSON.stringify(updatedSalaries));

      navigate("/admin/hr/salary");
    } catch (err) {
      console.error("Error creating salary:", err);
      setError(err.response?.data?.message || err.message || "Failed to create salary entry");
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
            disabled={loading}
            className="px-6 py-2.5 bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-[15px] font-medium hover:bg-[#ff7535] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Save Entry"}
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
        {/* Employee Selection Dropdown */}
        <div className="mb-6">
          <label className="block text-[15px] font-medium text-[#4B5563] mb-1.5">
            Select Employee to Auto-fill
          </label>
          <div className="relative">
            <select
              onChange={handleEmployeeSelect}
              value={formData.id}
              disabled={loadingEmployees}
              className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F] appearance-none"
            >
              <option value="">
                {loadingEmployees ? "Loading employees..." : "-- Select an Employee --"}
              </option>
              {employeesList.map(emp => (
                <option key={emp._id || emp.id} value={emp._id || emp.id}>
                  {emp.name} {emp.email ? `(${emp.email})` : ''} 
                  {emp.employeeId ? ` - [${emp.employeeId}]` : ''}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
          </div>
        </div>

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
          <div className="md:col-span-1">
            <label className="block text-[15px] font-medium text-[#4B5563] mb-1.5">
              Notes
            </label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. March salary"
              className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] focus:ring-1 focus:ring-[#F68E5F]"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 italic">
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateSalary;
