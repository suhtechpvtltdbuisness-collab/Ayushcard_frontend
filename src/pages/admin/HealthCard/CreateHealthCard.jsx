import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ArrowLeft, Loader2, Plus, X } from "lucide-react";
import apiService from "../../../api/service";


// ─── Component ────────────────────────────────────────────────────────────────

const CreateHealthCard = () => {
  const navigate = useNavigate();
  const fileInputFrontRef = useRef(null);
  const fileInputBackRef = useRef(null);

  // Save/API state
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [pendingFileFront, setPendingFileFront] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

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
    cardNumber: "",
    issueDate: "",
    expiryDate: "",
    verificationDate: "",
    members: [],
    documentFront: "",
    documentBack: "",
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
    } else if (["phone", "altPhone"].includes(field)) {
      value = value.replace(/\D/g, "").slice(0, 10);
    } else if (
      [
        "phone",
        "altPhone",
        "payment.totalPaid",
        "cardNumber",
        "totalMembers",
      ].includes(field)
    ) {
      value = value.replace(/[^0-9.]/g, "");
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
      setFormData((prev) => ({
        ...prev,
        [field]: "",
        ...(field === "issueDate" ? { expiryDate: "" } : {}),
      }));
      return;
    }
    const parts = val.split("-");
    let formattedDate = val;
    if (parts.length === 3) {
      formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    let additionalUpdates = {};
    if (field === "issueDate") {
      const issueD = new Date(val);
      if (!isNaN(issueD.getTime())) {
        issueD.setFullYear(issueD.getFullYear() + 1);
        const expDay = String(issueD.getDate()).padStart(2, "0");
        const expMonth = String(issueD.getMonth() + 1).padStart(2, "0");
        const expYear = issueD.getFullYear();
        additionalUpdates.expiryDate = `${expDay}-${expMonth}-${expYear}`;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [field]: formattedDate,
      ...additionalUpdates,
    }));
  };

  const handleImageUpload = (e, side) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const imageUrl = URL.createObjectURL(file);
      if (side === "front") {
        setFormData((prev) => ({ ...prev, documentFront: imageUrl }));
        setPendingFileFront(file);
      } else {
        setFormData((prev) => ({ ...prev, documentBack: imageUrl }));
        // Back side currently preview-only as API supports single document
      }
    } else {
      alert("Please upload a valid .jpg or .png image.");
    }
  };

  const handleRemoveImage = (side) => {
    if (side === "front") {
      setFormData((prev) => ({ ...prev, documentFront: "" }));
      setPendingFileFront(null);
      if (fileInputFrontRef.current) fileInputFrontRef.current.value = "";
    } else {
      setFormData((prev) => ({ ...prev, documentBack: "" }));
      if (fileInputBackRef.current) fileInputBackRef.current.value = "";
    }
  };

  // ── Save / Create Handler ──────────────────────────────────────────────────
  const handleSave = async () => {
    setSaveError("");

    // ── Client-side validation for backend required fields
    if (!formData.applicantFirstName?.trim()) {
      setSaveError("First name is required.");
      return;
    }
    if (!formData.phone?.trim()) {
      setSaveError("Phone number (Contact) is required.");
      return;
    }

    // Map form fields → API payload
    const payload = {
      applicationDate: formData.dateApplied || "",
      status: (() => {
        const s = (formData.status || "").toLowerCase();
        if (s.includes("not verified")) return "pending";
        if (s.includes("pending")) return "pending";
        if (s.includes("approved") || s.includes("verified")) return "approved";
        if (s.includes("reject")) return "rejected";
        if (s.includes("active")) return "active";
        if (s.includes("expire")) return "expired";
        return "pending";
      })(),
      firstName: formData.applicantFirstName.trim(),
      middleName: formData.applicantMiddleName?.trim() || "",
      lastName: formData.applicantLastName?.trim() || "",
      contact: formData.phone.trim(),
      alternateContact: formData.altPhone?.trim() || "",
      email: formData.email?.trim() || "",
      cardIssueDate: formData.issueDate || "",
      cardExpiredDate: formData.expiryDate || "",
      verificationDate: formData.verificationDate || "",
      totalMember: formData.members?.length || 0,
      totalAmount: parseFloat(formData.payment?.totalPaid || "0"),
      members: formData.members || [],
      address: formData.address || "",
      gender: formData.gender || "",
      dob: formData.dob || "",
      relation: formData.relation || "",
      relatedPerson: formData.relatedPerson || "",
    };

    const cardNoVal = formData.cardNumber?.trim();
    if (cardNoVal) payload.cardNo = cardNoVal;

    console.log("[CreateHealthCard] Sending payload to POST /api/cards:", payload);

    setSaveLoading(true);
    try {
      // Create with front document primarily if available, or just as JSON
      const result = await apiService.createHealthCard(payload, pendingFileFront);
      console.log("[CreateHealthCard] API success:", result);
      
      // If we have a back document, we might need a separate update if the API doesn't support multiple ones in create
      // For now, let's assume it supports the 'documents' field as an array or handles it
      
      navigate("/admin/health-card");
    } catch (err) {
      const status = err?.response?.status;
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Unknown error";
      console.error("[CreateHealthCard] API error:", {
        status, serverMsg, responseData: err?.response?.data, payload,
      });
      setSaveError(`API Error ${status ? `(${status})` : ""}: ${serverMsg}`);
    } finally {
      setSaveLoading(false);
    }
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
            className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
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
            disabled={saveLoading}
            className="px-4 py-1.5 bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-[15px] font-medium hover:bg-[#ff702d] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saveLoading && <Loader2 size={14} className="animate-spin" />}
            {saveLoading ? "Creating…" : "Create"}
          </button>
        </div>
      </div>

      {/* API Error Banner */}
      {saveError && (
        <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-[13px]">
          <span className="font-semibold shrink-0">Error:</span>
          <span>{saveError}</span>
          <button
            onClick={() => setSaveError("")}
            className="ml-auto text-red-400 hover:text-red-600 shrink-0 text-[16px] leading-none"
          >✕</button>
        </div>
      )}

      <div className="space-y-6">
        {/* Application Details Section */}
        <div className="border border-[#E2E8F0] rounded-xl p-6 bg-white shadow-sm">
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
                Applicant's first name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.applicantFirstName || ""}
                onChange={(e) => handleChange(e, "applicantFirstName")}
                disabled={!isEditing}
                required
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
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.phone || ""}
                onChange={(e) => handleChange(e, "phone")}
                disabled={!isEditing}
                required
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
                readOnly
                disabled
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none bg-gray-50 cursor-not-allowed"
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
                Total Amount Paid (₹)
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
        <div className="border border-[#E2E8F0] rounded-xl p-6 bg-white flex flex-col shadow-sm">
          <h3 className="font-bold text-[15px] text-[#22333B]">Image Upload</h3>
          <p className="text-[13px] text-[#6D6D6D] mb-5">
            Add your documents here (Aadhar front/back or other ID)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Front Side Upload */}
            <div className="border border-dashed border-[#1849D6] rounded-xl flex flex-col items-center justify-center p-8 bg-[#FFFFFF] relative overflow-hidden min-h-[200px]">
              {formData.documentFront ? (
                <div className="w-full h-full absolute inset-0 group">
                  <img
                    src={formData.documentFront}
                    alt="Document Front preview"
                    className="w-full h-full object-contain p-2 cursor-pointer"
                    onClick={() => setPreviewImage(formData.documentFront)}
                  />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center gap-4 transition-all z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputFrontRef.current?.click();
                        }}
                        className="px-4 py-2 bg-white text-[#1849D6] rounded-lg text-sm font-medium hover:bg-gray-50"
                      >
                        Change
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage("front");
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center cursor-pointer w-full h-full"
                  onClick={() => fileInputFrontRef.current?.click()}
                >
                  <Plus size={32} className="text-[#1849D6] mb-3" />
                  <p className="text-[14px] text-[#0F172A] font-medium">
                    Document Front Side
                  </p>
                </div>
              )}
              <input
                type="file"
                accept=".jpg, .jpeg, .png"
                className="hidden"
                ref={fileInputFrontRef}
                onChange={(e) => handleImageUpload(e, "front")}
              />
            </div>

            {/* Back Side Upload */}
            <div className="border border-dashed border-[#1849D6] rounded-xl flex flex-col items-center justify-center p-8 bg-[#FFFFFF] relative overflow-hidden min-h-[200px]">
              {formData.documentBack ? (
                <div className="w-full h-full absolute inset-0 group">
                  <img
                    src={formData.documentBack}
                    alt="Document Back preview"
                    className="w-full h-full object-contain p-2 cursor-pointer"
                    onClick={() => setPreviewImage(formData.documentBack)}
                  />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center gap-4 transition-all z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputBackRef.current?.click();
                        }}
                        className="px-4 py-2 bg-white text-[#1849D6] rounded-lg text-sm font-medium hover:bg-gray-50"
                      >
                        Change
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage("back");
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center cursor-pointer w-full h-full"
                  onClick={() => fileInputBackRef.current?.click()}
                >
                  <Plus size={32} className="text-[#1849D6] mb-3" />
                  <p className="text-[14px] text-[#0F172A] font-medium">
                    Document Back Side
                  </p>
                </div>
              )}
              <input
                type="file"
                accept=".jpg, .jpeg, .png"
                className="hidden"
                ref={fileInputBackRef}
                onChange={(e) => handleImageUpload(e, "back")}
              />
            </div>
          </div>

          <p className="text-[12px] text-[#6D6D6D] mt-6">
            Only supports .jpg, .png files
          </p>

        </div>

        {/* Members Table */}
        <div className="border border-[#E2E8F0] rounded-xl bg-white overflow-hidden mb-5 shadow-sm">
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
                    <td className="py-2 px-6">
                      {isEditing ? (
                        <input
                          type="text"
                          value={m.name}
                          onChange={(e) => {
                            const newMembers = [...formData.members];
                            newMembers[i].name = e.target.value.replace(
                              /[^a-zA-Z\s]/g,
                              ""
                            );
                            setFormData({ ...formData, members: newMembers });
                          }}
                          className="w-full border border-gray-200 rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[#F68E5F]"
                          placeholder="Name"
                        />
                      ) : (
                        <span className="text-[14px] font-semibold text-[#1E293B]">
                          {m.name}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-6">
                      {isEditing ? (
                        <input
                          type="text"
                          value={m.relation}
                          onChange={(e) => {
                            const newMembers = [...formData.members];
                            newMembers[i].relation = e.target.value.replace(
                              /[^a-zA-Z\s]/g,
                              ""
                            );
                            setFormData({ ...formData, members: newMembers });
                          }}
                          className="w-full border border-gray-200 rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[#F68E5F]"
                          placeholder="Relation"
                        />
                      ) : (
                        <span className="text-[14px] text-[#475569]">
                          {m.relation}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-6">
                      {isEditing ? (
                        <input
                          type="text"
                          value={m.age}
                          onChange={(e) => {
                            const newMembers = [...formData.members];
                            newMembers[i].age = e.target.value.replace(
                              /\D/g,
                              ""
                            );
                            setFormData({ ...formData, members: newMembers });
                          }}
                          className="w-full border border-gray-200 rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[#F68E5F]"
                          placeholder="Age"
                        />
                      ) : (
                        <span className="text-[14px] text-[#475569]">
                          {m.age}
                        </span>
                      )}
                    </td>
                    {isEditing && (
                      <td className="py-2 px-6">
                        <button
                          onClick={() => {
                            const newMembers = formData.members.filter(
                              (_, idx) => idx !== i
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
                      className="py-10 text-center text-gray-400 text-sm italic"
                    >
                      No members added yet. Add family members to include them in the health card.
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

      {/* Full Screen Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative w-[80vw] h-[80vh] max-w-5xl max-h-[800px] flex items-center justify-center p-4 bg-white rounded-lg border-2 border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 -right-12 text-white hover:text-gray-300 p-2 transition-colors"
            >
              <X size={40} />
            </button>
            <img
              src={previewImage}
              alt="Document Full Preview"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateHealthCard;
