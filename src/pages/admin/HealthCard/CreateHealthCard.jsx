import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ArrowLeft } from "lucide-react";
import { getHealthCards } from "./HealthCard";

const CreateHealthCard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    id: "",
    dateApplied: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
    status: "Pending verification",
    applicantFirstName: "",
    applicantMiddleName: "",
    applicantLastName: "",
    gender: "",
    dob: "",
    relation: "",
    relatedPerson: "",
    phone: "",
    altPhone: "",
    email: "",
    address: "",
    issueDate: "",
    expiryDate: "",
    verificationDate: "",
    members: [],
    profileImage: "",
    payment: {
      applicationFee: 120,
      memberAddOns: 0,
      totalPaid: "120.00",
    },
  });

  useEffect(() => {
    // Up to 7 included members allowed
    const includedMembersCount = Math.min(formData.members?.length || 0, 7);
    const calculatedTotal = 120 + includedMembersCount * 10;
    
    setFormData((prev) => ({
      ...prev,
      payment: {
        ...prev.payment,
        memberAddOns: includedMembersCount * 10,
        totalPaid: calculatedTotal.toFixed(2),
      },
    }));
  }, [formData.members]);

  const isEditing = true;

  const handleChange = (e, field) => {
    let value = e.target.value;

    if (
      [
        "applicantFirstName",
        "applicantMiddleName",
        "applicantLastName",
        "applicant",
        "relatedPerson",
      ].includes(field)
    ) {
      value = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (
      [
        "phone",
        "altPhone",
        "payment.totalPaid",
        "cardNumber",
        "totalMembers",
      ].includes(field)
    ) {
      value = value.replace(/[^0-9.]/g, ""); // allow numbers and dot for payment
    }

    if (field === "totalMembers" && Number(value) > 7) {
      value = "7";
    }

    if (field.startsWith("payment.")) {
      setFormData((prev) => ({
        ...prev,
        payment: { ...prev.payment, [field.split(".")[1]]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, profileImage: imageUrl }));
    } else {
      alert("Please upload a valid .jpg or .png image.");
    }
  };

  const handleSave = () => {
    const cards = getHealthCards();

    const newCard = {
      ...formData,
      id: `AC-${Math.floor(1000000 + Math.random() * 9000000)}`,
      applicant:
        `${formData.applicantFirstName || ""} ${formData.applicantMiddleName || ""} ${formData.applicantLastName || ""}`
          .trim()
          .replace(/\s+/g, " "),
    };

    cards.unshift(newCard); // Add to the top of the list
    localStorage.setItem("health_cards_data", JSON.stringify(cards));

    navigate("/admin/health-card");
  };

  return (
    <div
      className="flex flex-col h-full bg-[#FFFFFF] pb-10"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-[20px] font-bold text-[#0F172A]">
              Create Application
            </h2>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/admin/health-card")}
            className="px-4 py-1.5 border border-gray-200 rounded-lg text-[15px] font-medium text-[#374151] hover:bg-gray-50 bg-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-[15px] font-medium hover:bg-[#ff702d] transition-colors"
          >
            Create
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Application Details Section */}
        <div className="border border-[#E2E8F0] rounded-xl p-6 bg-white">
          <h3 className="font-bold text-[16px] text-[#22333B] mb-3">
            Application Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3">
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Application ID
              </label>
              <input
                type="text"
                value={formData.id || ""}
                onChange={(e) => handleChange(e, "id")}
                placeholder="Auto-generated if empty"
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none bg-white"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Application Date
              </label>
              <input
                type="date"
                value={formatDateForInput(formData.dateApplied)}
                onChange={(e) => handleDateChange(e, "dateApplied")}
                disabled={!isEditing}
                className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none ${!isEditing ? "bg-gray-50" : "bg-white"}`}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Status
              </label>
              <div className="relative">
                <select
                  value={formData.status || ""}
                  onChange={(e) => handleChange(e, "status")}
                  disabled={!isEditing}
                  className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none appearance-none ${!isEditing ? "bg-gray-50" : "bg-white"}`}
                >
                  <option>Pending verification</option>
                  <option>Not verified</option>
                  <option>Verified</option>
                  <option>Expired</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3">
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Applicant's first name
              </label>
              <input
                type="text"
                value={formData.applicantFirstName || ""}
                onChange={(e) => handleChange(e, "applicantFirstName")}
                disabled={!isEditing}
                className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none ${!isEditing ? "bg-gray-50" : "bg-white"}`}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Middle name
              </label>
              <input
                type="text"
                value={formData.applicantMiddleName || ""}
                onChange={(e) => handleChange(e, "applicantMiddleName")}
                disabled={!isEditing}
                className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none ${!isEditing ? "bg-gray-50" : "bg-white"}`}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Last name
              </label>
              <input
                type="text"
                value={formData.applicantLastName || ""}
                onChange={(e) => handleChange(e, "applicantLastName")}
                disabled={!isEditing}
                className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none ${!isEditing ? "bg-gray-50" : "bg-white"}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3">
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Gender
              </label>
              <div className="relative">
                <select
                  value={formData.gender || ""}
                  onChange={(e) => handleChange(e, "gender")}
                  disabled={!isEditing}
                  className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none appearance-none ${!isEditing ? "bg-gray-50" : "bg-white"}`}
                >
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Date of birth
              </label>
              <input
                type="date"
                value={formatDateForInput(formData.dob)}
                onChange={(e) => handleDateChange(e, "dob")}
                disabled={!isEditing}
                className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none ${!isEditing ? "bg-gray-50" : "bg-white"}`}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Relation
              </label>
              <div className="relative">
                <select
                  value={formData.relation || ""}
                  onChange={(e) => handleChange(e, "relation")}
                  disabled={!isEditing}
                  className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none appearance-none ${!isEditing ? "bg-gray-50" : "bg-white"}`}
                >
                  <option value="">Select Relation</option>
                  <option>Self</option>
                  <option>Spouse</option>
                  <option>Child</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3">
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Related person
              </label>
              <input
                type="text"
                value={formData.relatedPerson || ""}
                onChange={(e) => handleChange(e, "relatedPerson")}
                disabled={!isEditing}
                className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none ${!isEditing ? "bg-gray-50" : "bg-white"}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3">
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone || ""}
                onChange={(e) => handleChange(e, "phone")}
                disabled={!isEditing}
                className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none ${!isEditing ? "bg-gray-50" : "bg-white"}`}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Alternate Number
              </label>
              <input
                type="text"
                value={formData.altPhone || ""}
                onChange={(e) => handleChange(e, "altPhone")}
                disabled={!isEditing}
                className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none ${!isEditing ? "bg-gray-50" : "bg-white"}`}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleChange(e, "email")}
                disabled={!isEditing}
                className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none ${!isEditing ? "bg-gray-50" : "bg-white"}`}
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
              Address
            </label>
            <textarea
              rows={2}
              value={formData.address || ""}
              onChange={(e) => handleChange(e, "address")}
              disabled={!isEditing}
              className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none resize-none ${!isEditing ? "bg-gray-50" : "bg-white"}`}
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3">
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Card number
              </label>
              <input
                type="text"
                value={formData.cardNumber || ""}
                onChange={(e) => handleChange(e, "cardNumber")}
                disabled={!isEditing}
                className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none ${!isEditing ? "bg-gray-50" : "bg-white"}`}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Card Issue Date
              </label>
              <input
                type="date"
                value={formatDateForInput(formData.issueDate)}
                onChange={(e) => handleDateChange(e, "issueDate")}
                disabled={!isEditing}
                className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none ${!isEditing ? "bg-gray-50" : "bg-white"}`}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Card Expiry Date
              </label>
              <input
                type="date"
                value={formatDateForInput(formData.expiryDate)}
                onChange={(e) => handleDateChange(e, "expiryDate")}
                disabled={!isEditing}
                className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none ${!isEditing ? "bg-gray-50" : "bg-white"}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Verification Date
              </label>
              <input
                type="date"
                value={formatDateForInput(formData.verificationDate)}
                onChange={(e) => handleDateChange(e, "verificationDate")}
                disabled={!isEditing}
                className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none ${!isEditing ? "bg-gray-50" : "bg-white"}`}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Total Members
              </label>
              <input
                type="text"
                value={(formData.members?.length || 0) + 1}
                readOnly
                className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none bg-gray-50`}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Total Amount Paid
              </label>
              <input
                type="text"
                value={formData.payment?.totalPaid || ""}
                readOnly
                className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none bg-gray-50`}
              />
            </div>
          </div>
        </div>

        {/* Upload Layout */}
        <div className="border border-[#E2E8F0] rounded-xl p-6 bg-white flex flex-col">
          <h3 className="font-bold text-[15px] text-[#22333B]">Image Upload</h3>
          <p className="text-[13px] text-[#6D6D6D] mb-3">
            Upload you profile photo here
          </p>
          <div className="border border-dashed border-[#1849D6] rounded-xl flex flex-col items-center justify-center p-8 bg-[#FFFFFF] relative overflow-hidden">
            {formData.profileImage ? (
              <div className="w-30 h-30 rounded-lg overflow-hidden border border-gray-200 mb-4 z-10 relative group">
                <img
                  src={formData.profileImage}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-white text-[12px] font-medium hover:underline"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-12 h-12 bg-[#FFFFFF] text-[#1849D6] rounded-xl flex items-center justify-center mb-4 z-10">
                <img src="/admin_images/upload.svg" alt="" />
              </div>
            )}

            {!formData.profileImage && (
              <p className="text-[14px] text-[#0F172A] font-medium mb-1 relative z-10">
                Drag your file to start uploading
              </p>
            )}

            <div className="flex items-center w-full max-w-50 my-3 z-10">
              <div className="flex-1 h-px bg-[#E2E8F0]"></div>
              <span className="px-2 text-[12px] text-[#94A3B8] font-medium">
                OR
              </span>
              <div className="flex-1 h-px bg-[#E2E8F0]"></div>
            </div>

            <input
              type="file"
              accept=".jpg, .jpeg, .png"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 border border-[#1849D6] text-[#1849D6] rounded-xl text-[13px] font-medium bg-white hover:bg-[#1849D6] hover:text-white transition-colors z-10"
            >
              Browse files
            </button>
          </div>
          <p className="text-[12px] text-[#6D6D6D] mt-3">
            Only supports .jpg, .png files
          </p>
        </div>

        {/* Members Table */}
        <div className="border border-[#E2E8F0] rounded-xl bg-white overflow-hidden mb-5">
          <div className="p-4 border border-[#E2E8F0]">
            <h3 className="font-bold text-[15px] text-[#22333B]">
              Included Members ({formData.members?.length || 0})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <th className="py-4 px-6 text-[12px] font-bold text-[#64748B] uppercase tracking-wider w-25">
                    SR. NO
                  </th>
                  <th className="py-4 px-6 text-[12px] font-bold text-[#64748B] uppercase tracking-wider min-w-50">
                    MEMBER NAME
                  </th>
                  <th className="py-4 px-6 text-[12px] font-bold text-[#64748B] uppercase tracking-wider min-w-37.5">
                    RELATION
                  </th>
                  <th className="py-4 px-6 text-[12px] font-bold text-[#64748B] uppercase tracking-wider min-w-25">
                    AGE
                  </th>
                  {isEditing && (
                    <th className="py-4 px-6 text-[12px] font-bold text-[#64748B] uppercase tracking-wider w-24">
                      ACTIONS
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {formData.members?.map((m, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="py-4 px-6 text-[14px] text-[#475569]">
                      {i + 1}
                    </td>
                    <td className="py-4 px-6">
                      {isEditing ? (
                        <input
                          type="text"
                          value={m.name}
                          onChange={(e) => {
                            const newMembers = [...formData.members];
                            newMembers[i].name = e.target.value.replace(
                              /[^a-zA-Z\s]/g,
                              "",
                            );
                            setFormData({ ...formData, members: newMembers });
                          }}
                          className="w-full border border-[#E2E8F0] rounded px-3 py-2 text-[14px]"
                          placeholder="Name"
                        />
                      ) : (
                        <span className="text-[14px] font-semibold text-[#1E293B]">
                          {m.name}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {isEditing ? (
                        <input
                          type="text"
                          value={m.relation}
                          onChange={(e) => {
                            const newMembers = [...formData.members];
                            newMembers[i].relation = e.target.value.replace(
                              /[^a-zA-Z\s]/g,
                              "",
                            );
                            setFormData({ ...formData, members: newMembers });
                          }}
                          className="w-full border border-[#E2E8F0] rounded px-3 py-2 text-[14px]"
                          placeholder="Relation"
                        />
                      ) : (
                        <span className="text-[14px] text-[#475569]">
                          {m.relation}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {isEditing ? (
                        <input
                          type="text"
                          value={m.age}
                          onChange={(e) => {
                            const newMembers = [...formData.members];
                            newMembers[i].age = e.target.value.replace(
                              /\D/g,
                              "",
                            );
                            setFormData({ ...formData, members: newMembers });
                          }}
                          className="w-full border border-[#E2E8F0] rounded px-3 py-2 text-[14px]"
                          placeholder="Age"
                        />
                      ) : (
                        <span className="text-[14px] text-[#475569]">
                          {m.age}
                        </span>
                      )}
                    </td>
                    {isEditing && (
                      <td className="py-4 px-6">
                        <button
                          onClick={() => {
                            const newMembers = formData.members.filter(
                              (_, idx) => idx !== i,
                            );
                            setFormData({ ...formData, members: newMembers });
                          }}
                          className="text-red-500 hover:text-red-700 text-[14px] font-medium"
                        >
                          Remove
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {(!formData.members || formData.members.length === 0) && (
                  <tr>
                    <td
                      colSpan={isEditing ? 5 : 4}
                      className="py-4 text-center text-gray-400"
                    >
                      No members added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {isEditing && (formData.members?.length || 0) < 7 && (
            <div className="p-4 border-t border-[#E2E8F0]">
              <button
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    members: [
                      ...(prev.members || []),
                      { name: "", relation: "", age: "" },
                    ],
                  }));
                }}
                className="text-[#F68E5F] font-medium text-[14px] flex items-center gap-1.5 hover:text-[#e57745] transition-colors"
              >
                Add Member{" "}
                <span className="text-lg leading-none pb-0.5">+</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateHealthCard;
