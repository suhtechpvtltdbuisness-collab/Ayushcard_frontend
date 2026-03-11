import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, ChevronDown, Plus, Loader2 } from "lucide-react";
import AyushCardPreview from "../../../components/admin/AyushCardPreview";
import apiService from "../../../api/service";
import { useToast } from "../../../components/ui/Toast";

const generateId = () => `AC-${Math.floor(1000000 + Math.random() * 9000000)}`;
const formatDate = (date) =>
  date.toLocaleDateString("en-GB").replace(/\//g, "-");

const CreateHealthCard = () => {
  const navigate = useNavigate();
  const { toastWarn, toastError } = useToast();

  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState(null); // "online" | "cash"
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [cardSide, setCardSide] = useState("front"); // for preview

  // Standard form refs
  const fileInputFrontRef = useRef(null);
  const fileInputBackRef = useRef(null);

  // Store actual File objects for API upload
  const documentFrontFileRef = useRef(null);
  const documentBackFileRef = useRef(null);

  // Save/API state
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [formData, setFormData] = useState({
    id: `AC-${Math.floor(1000000 + Math.random() * 9000000)}`,
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
    cardNumber: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
    issueDate: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
    expiryDate: (() => {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      return d.toLocaleDateString("en-GB").replace(/\//g, "-");
    })(),
    verificationDate: new Date()
      .toLocaleDateString("en-GB")
      .replace(/\//g, "-"),
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
      ["phone", "altPhone", "payment.totalPaid", "cardNumber"].includes(field)
    ) {
      value = value.replace(/[^0-9.]/g, "");
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
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      if (side === "front") {
        documentFrontFileRef.current = file;
        setFormData((prev) => ({ ...prev, documentFront: imageUrl }));
      } else {
        documentBackFileRef.current = file;
        setFormData((prev) => ({ ...prev, documentBack: imageUrl }));
      }
    } else {
      toastWarn("Please upload a valid file.");
    }
  };

  const handleRemoveImage = (side) => {
    if (side === "front") {
      documentFrontFileRef.current = null;
      setFormData((prev) => ({ ...prev, documentFront: "" }));
      if (fileInputFrontRef.current) fileInputFrontRef.current.value = "";
    } else {
      documentBackFileRef.current = null;
      setFormData((prev) => ({ ...prev, documentBack: "" }));
      if (fileInputBackRef.current) fileInputBackRef.current.value = "";
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      // Validate step 1 minimums
      if (!formData.applicantFirstName?.trim() || !formData.phone?.trim()) {
        toastWarn("First name and Phone number are required to proceed.");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!paymentCompleted) {
        if (!paymentMethod) {
          toastWarn("Please select a payment method.");
          return;
        }
        await performSave();
      } else {
        setCurrentStep(4);
      }
    } else if (currentStep === 4) {
      // Done
      navigate("/admin/health-card");
    }
  };

  const performSave = async () => {
    setSaveError("");
    setSaveLoading(true);

    try {
      // Build card data payload matching API model
      const cardData = {
        firstName: formData.applicantFirstName.trim(),
        lastName: formData.applicantLastName?.trim() || "",
        middleName: formData.applicantMiddleName?.trim() || "",
        email: formData.email?.trim() || "",
        contact: formData.phone.trim(),
        alternateContact: formData.altPhone?.trim() || "",
        totalAmount: parseFloat(formData.payment?.totalPaid || "120"),
        applicationDate: formData.dateApplied || new Date().toISOString().split("T")[0],
        gender: formData.gender || "",
        dob: formData.dob || "",
        relation: formData.relation || "",
        relatedPerson: formData.relatedPerson || "",
        address: formData.address || "",
        cardNo: formData.cardNumber || "",
        cardIssueDate: formData.issueDate || "",
        cardExpiredDate: formData.expiryDate || "",
        verificationDate: formData.verificationDate || "",
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
        paymentMethod: paymentMethod,
        members: formData.members || [],
      };

      // Use the front document file if available, otherwise back document
      const documentFile = documentFrontFileRef.current || documentBackFileRef.current || null;

      await apiService.createHealthCard(cardData, documentFile);
      setPaymentCompleted(true);
    } catch (err) {
      console.error("Health card create error:", err);
      setSaveError(err.response?.data?.message || err.message || "Failed to create health card. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  // --- UI PARTIALS ---

  const renderStepper = () => {
    const steps = [
      { num: "01", label: "Fill the Details" },
      { num: "02", label: "Card Preview" },
      { num: "03", label: "Payment" },
      { num: "04", label: "Receipt" },
    ];

    return (
      <div className="flex items-center justify-center w-full max-w-2xl mx-auto mb-8 px-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep >= stepNumber;
          return (
            <React.Fragment key={step.num}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300 ${
                    isActive
                      ? "border-2 border-[#8396B2] text-[#22333B] bg-white shadow-xs"
                      : "border-2 border-gray-200 text-gray-400 bg-gray-50 bg-opacity-50"
                  }`}
                >
                  {step.num}
                </div>
                <span
                  className={`text-xs mt-2 font-medium tracking-wide whitespace-nowrap transition-colors duration-300 ${
                    isActive ? "text-[#22333B]" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 px-2 mb-6">
                  <div
                    className={`h-px w-full transition-colors duration-300 ${
                      isActive ? "bg-[#8396B2]" : "bg-gray-200"
                    }`}
                  ></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const renderStep1FillDetails = () => (
    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
      <div className="space-y-6">
        {/* Application Details */}
        <div className="rounded-xl bg-white">
          <h3 className="font-bold text-[16px] text-[#22333B] mb-4">
            Application Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Application ID
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => handleChange(e, "id")}
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none focus:border-[#F68E5F] bg-white transition-colors"
                placeholder="Auto-generated"
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
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none focus:border-[#F68E5F] bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Status
              </label>
              <div className="relative">
                <select
                  value={formData.status}
                  onChange={(e) => handleChange(e, "status")}
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none focus:border-[#F68E5F] appearance-none bg-white transition-colors"
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Applicant's first name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.applicantFirstName}
                onChange={(e) => handleChange(e, "applicantFirstName")}
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none focus:border-[#F68E5F] bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Middle name
              </label>
              <input
                type="text"
                value={formData.applicantMiddleName}
                onChange={(e) => handleChange(e, "applicantMiddleName")}
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none focus:border-[#F68E5F] bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Last name
              </label>
              <input
                type="text"
                value={formData.applicantLastName}
                onChange={(e) => handleChange(e, "applicantLastName")}
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none focus:border-[#F68E5F] bg-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Gender
              </label>
              <div className="relative">
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange(e, "gender")}
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none focus:border-[#F68E5F] appearance-none bg-white transition-colors"
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
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none focus:border-[#F68E5F] bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Relation
              </label>
              <div className="relative">
                <select
                  value={formData.relation}
                  onChange={(e) => handleChange(e, "relation")}
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none focus:border-[#F68E5F] appearance-none bg-white transition-colors"
                >
                  <option value="">Select Relation</option>
                  <option>Self</option>
                  <option>Spouse</option>
                  <option>Child</option>
                  <option>Parent</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Related person
              </label>
              <input
                type="text"
                value={formData.relatedPerson}
                onChange={(e) => handleChange(e, "relatedPerson")}
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none focus:border-[#F68E5F] bg-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => handleChange(e, "phone")}
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none focus:border-[#F68E5F] bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Alternate Number
              </label>
              <input
                type="text"
                value={formData.altPhone}
                onChange={(e) => handleChange(e, "altPhone")}
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none focus:border-[#F68E5F] bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange(e, "email")}
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none focus:border-[#F68E5F] bg-white transition-colors"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
              Address
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => handleChange(e, "address")}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none focus:border-[#F68E5F] resize-none bg-white transition-colors"
            ></textarea>
          </div>

          {/* Read Only Calculation Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6 mb-4">
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Card number
              </label>
              <input
                type="text"
                value={formData.cardNumber}
                onChange={(e) => handleChange(e, "cardNumber")}
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none focus:border-[#F68E5F] bg-white transition-colors"
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
                readOnly
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none bg-white cursor-not-allowed transition-colors"
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
                onChange={(e) => handleDateChange(e, "expiryDate")}
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none bg-white cursor-not-allowed transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Verification Date
              </label>
              <input
                type="date"
                value={formatDateForInput(formData.verificationDate)}
                onChange={(e) => handleDateChange(e, "verificationDate")}
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none focus:border-[#F68E5F] bg-white transition-colors"
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
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Total Amount Paid
              </label>
              <input
                type="text"
                value={formData.payment?.totalPaid || "120.00"}
                readOnly
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Media & Members Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
          {/* Image Upload */}
          <div className="border border-[#E2E8F0] rounded-xl p-6 bg-white flex flex-col shadow-xs h-full">
            <h3 className="font-bold text-[15px] text-[#22333B] mb-1">
              Image Upload
            </h3>
            <p className="text-[12px] text-[#6D6D6D] mb-5">
              Add your documents here.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              {/* Front */}
              <div
                className="border border-dashed border-[#1849D6]/40 rounded-xl flex flex-col items-center justify-center p-4 bg-white hover:bg-gray-50 transition-colors relative h-40 cursor-pointer"
                onClick={() =>
                  !formData.documentFront && fileInputFrontRef.current?.click()
                }
              >
                {formData.documentFront ? (
                  <div className="w-full h-full relative group rounded-lg overflow-hidden">
                    <img
                      src={formData.documentFront}
                      className="w-full h-full object-cover"
                      alt="Front"
                    />
                    <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputFrontRef.current?.click();
                        }}
                        className="px-3 py-1 bg-white rounded text-xs text-[#1E293B] font-medium"
                      >
                        Change
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage("front");
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded text-xs font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Plus size={24} className="text-[#1E293B] mb-2" />
                    <p className="text-[12px] text-[#1E293B] font-medium">
                      Document Front Side
                    </p>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputFrontRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "front")}
                />
              </div>
              {/* Back */}
              <div
                className="border border-dashed border-[#1849D6]/40 rounded-xl flex flex-col items-center justify-center p-4 bg-white hover:bg-gray-50 transition-colors relative h-40 cursor-pointer"
                onClick={() =>
                  !formData.documentBack && fileInputBackRef.current?.click()
                }
              >
                {formData.documentBack ? (
                  <div className="w-full h-full relative group rounded-lg overflow-hidden">
                    <img
                      src={formData.documentBack}
                      className="w-full h-full object-cover"
                      alt="Back"
                    />
                    <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputBackRef.current?.click();
                        }}
                        className="px-3 py-1 bg-white rounded text-xs text-[#1E293B] font-medium"
                      >
                        Change
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage("back");
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded text-xs font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Plus size={24} className="text-[#1E293B] mb-2" />
                    <p className="text-[12px] text-[#1E293B] font-medium">
                      Document Back Side
                    </p>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputBackRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "back")}
                />
              </div>
            </div>
            <p className="text-[12px] text-gray-400 mt-6 pt-2">
              Only supports .jpg, .png files
            </p>
          </div>

          {/* QR Code */}
          <div className="border border-[#E2E8F0] rounded-xl p-6 bg-white flex flex-col shadow-xs h-full">
            <h3 className="font-bold text-[15px] text-[#22333B] mb-1">
              QR Code
            </h3>
            <p className="text-[12px] text-[#6D6D6D] mb-5">
              A Unique Qr code of Health Card will appear here
            </p>
            <div className="flex-1 flex items-center justify-center border-t border-gray-100 border-dashed pt-4">
              <div className="p-3 border border-[#E2E8F0] rounded-xl bg-white shadow-xs inline-flex items-center justify-center w-[140px] h-[140px]">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${formData.id}`}
                  alt="QR"
                  className="w-35 h-30 object-contain border-4 border-black rounded-lg p-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Members Table */}
        <div className="border border-[#E2E8F0] rounded-xl bg-white flex flex-col shadow-xs overflow-hidden min-h-[180px] mb-4">
          <div className="p-4 border-b border-[#E2E8F0] bg-gray-50">
            <h3 className="font-bold text-[15px] text-[#22333B]">
              Included Members ({formData.members?.length || 0})
            </h3>
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr>
                  <th className="py-2.5 px-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                    Sr. No
                  </th>
                  <th className="py-2.5 px-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                    Member Name
                  </th>
                  <th className="py-2.5 px-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                    Relation
                  </th>
                  <th className="py-2.5 px-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider w-26">
                    Age
                  </th>
                  <th className="py-2.5 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {formData.members?.map((m, i) => (
                  <tr key={i} className="hover:bg-gray-50/30">
                    <td className="py-2 px-4 text-[13px] text-gray-500">
                      {i + 1}
                    </td>
                    <td className="py-2 px-4">
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
                        className="w-full rounded px-2 py-1.5 text-[13px] focus:border-[#F68E5F] focus:outline-none"
                        placeholder="Name"
                      />
                    </td>
                    <td className="py-2 px-4">
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
                        className="w-full rounded px-2 py-1.5 text-[13px] focus:border-[#F68E5F] focus:outline-none"
                        placeholder="Relation"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        value={m.age}
                        onChange={(e) => {
                          const newMembers = [...formData.members];
                          newMembers[i].age = e.target.value.replace(/\D/g, "");
                          setFormData({ ...formData, members: newMembers });
                        }}
                        className="w-full rounded px-2 py-1.5 text-[13px] focus:border-[#F68E5F] focus:outline-none"
                        placeholder="Age"
                      />
                    </td>
                    <td className="py-2 px-4 text-center">
                      <button
                        onClick={() => {
                          const newMembers = formData.members.filter(
                            (_, idx) => idx !== i,
                          );
                          setFormData({ ...formData, members: newMembers });
                        }}
                        className="text-red-400 hover:text-red-600 text-[18px] leading-none mb-1"
                      >
                        &times;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(formData.members?.length || 0) < 7 && (
            <div className="p-3 border-t border-[#E2E8F0] bg-white">
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
                className="text-[#F68E5F] font-medium text-[13px] flex items-center gap-1.5 hover:text-[#e57745]"
              >
                Add Member <span className="text-lg leading-none">+</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2Preview = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-2">
      <div className="w-full max-w-4xl bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[18px] text-[#22333B]">Card Preview</h3>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCardSide("front")}
              className={`px-5 py-1.5 rounded-md text-sm font-medium transition-all ${cardSide === "front" ? "bg-white text-black shadow-xs" : "text-gray-500 hover:text-black"}`}
            >
              Front
            </button>
            <button
              onClick={() => setCardSide("back")}
              className={`px-5 py-1.5 rounded-md text-sm font-medium transition-all ${cardSide === "back" ? "bg-white text-black shadow-xs" : "text-gray-500 hover:text-black"}`}
            >
              Back
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center relative min-h-2300px]">
          <div className="transform scale-[0.65] xl:scale-[0.8] origin-center mt-2">
            <AyushCardPreview
              data={formData}
              side={cardSide}
              onFlip={(side) => setCardSide(side)}
            />
          </div>
        </div>

        <p className="text-center text-[13px] text-gray-500 flex items-center justify-center gap-2 mt-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 2v6h-6"></path>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
            <path d="M3 22v-6h6"></path>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
          </svg>
          Click the card or use the buttons to flip • Preview reflects saved
          application data
        </p>
      </div>
    </div>
  );

  const renderStep3Payment = () => {
    if (paymentCompleted) {
      return (
        <div className="w-full flex justify-center items-start pt-6 pb-12 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
            {/* Printable Section */}
            <div className="w-full flex flex-col items-center bg-white/0 pt-4 pb-2 px-1">
              <div className="w-20 h-20 bg-[#ECFDF5] rounded-full flex items-center justify-center mt-4">
                <div className="w-14 h-14 bg-[#10B981] rounded-full flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>

              <h3 className="text-[28px] font-bold text-[#1E293B] mb-2 mt-4">
                Payment Successful!
              </h3>

              <p className="text-[15px] text-gray-600 mb-1">
                <b>₹{formData.payment.totalPaid}</b> received via{" "}
                {paymentMethod === "online" ? "Googlepay" : "Cash"}
              </p>

              <p className="text-[13px] text-gray-500 mb-10 text-center max-w-md">
                Health card has been activated for{" "}
                <span className="font-bold">
                  {formData.applicantFirstName || ""}
                  {formData.applicantMiddleName
                    ? ` ${formData.applicantMiddleName} `
                    : " "}
                  {formData.applicantLastName || ""}
                </span>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-[700px] mb-6">
                <div className="bg-[#F8FAFC80] border text-left border-[#F1F5F9] rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    TXN ID
                  </p>
                  <p className="font-bold text-[#1E293B] text-[16px]">
                    TXN{Math.floor(100000000 + Math.random() * 900000000)}
                  </p>
                </div>
                <div className="bg-[#F8FAFC80] border text-left border-[#F1F5F9] rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    AMOUNT
                  </p>
                  <p className="font-bold text-[#1E293B] text-[16px]">
                    ₹{formData.payment.totalPaid}
                  </p>
                </div>
                <div className="bg-[#F8FAFC80] border text-left border-[#F1F5F9] rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    MEMBERS
                  </p>
                  <p className="font-bold text-[#1E293B] text-[16px]">
                    {(formData.members?.length || 0) + 1}
                  </p>
                </div>
                <div className="bg-[#F8FAFC80] border text-left border-[#F1F5F9] rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    VALID TILL
                  </p>
                  <p className="font-bold text-[#1E293B] text-[16px]">
                    {formData.expiryDate || ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full pb-8 px-1">
              <button
                onClick={() => setCurrentStep(4)}
                className="w-full py-3.5 bg-[#0D9488] hover:bg-[#0F766E] transition-colors rounded-xl text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-xs"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                View & Download Receipt
              </button>
              <button
                onClick={() => {
                  setFormData({
                    id: generateId(),
                    dateApplied: formatDate(new Date()),
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
                    cardNumber: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
                    issueDate: formatDate(new Date()),
                    expiryDate: (() => {
                      const d = new Date();
                      d.setFullYear(d.getFullYear() + 1);
                      return formatDate(d);
                    })(),
                    verificationDate: formatDate(new Date()),
                    members: [],
                    documentFront: "",
                    documentBack: "",
                    payment: {
                      baseAmount: 120,
                      memberAddOns: 0,
                      totalPaid: "120.00",
                    },
                  });
                  setCurrentStep(1);
                  setPaymentCompleted(false);
                  setPaymentMethod(null);
                }}
                className="w-full py-3.5 bg-white border border-gray-200 hover:bg-gray-50 transition-colors rounded-xl text-gray-700 font-bold text-[14px] flex items-center justify-center gap-2 shadow-xs"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to Form
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 w-full max-w-4xl mx-auto pb-6">
        {!paymentMethod ? (
          <div className="w-full mt-4">
            <h3 className="font-bold text-[18px] text-[#22333B] mb-6">
              Select Payment Method
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                onClick={() => setPaymentMethod("online")}
                className="border-2 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xs border-gray-200 bg-white"
              >
                <div className="w-12 h-12 bg-[#E0E7FF] rounded-lg flex items-center justify-center mb-4">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="5"
                      y="2"
                      width="14"
                      height="20"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                  </svg>
                </div>
                <h4 className="font-bold text-[#1E293B] text-[16px] mb-2">
                  Online Payment
                </h4>
                <p className="text-sm text-gray-500 mb-6 line-clamp-2">
                  Pay via UPI, scan QR code — instant confirmation
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-0.5 bg-[#ECFDF5] text-[#10B981] text-[10px] font-bold rounded-md">
                    UPI
                  </span>
                  <span className="px-3 py-0.5 bg-[#ECFDF5] text-[#10B981] text-[10px] font-bold rounded-md">
                    QR
                  </span>
                  <span className="px-3 py-0.5 bg-[#ECFDF5] text-[#10B981] text-[10px] font-bold rounded-md">
                    GPAY
                  </span>
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod("cash")}
                className="border-2 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xs border-gray-200 bg-white"
              >
                <div className="w-12 h-12 bg-[#F1F5F9] rounded-lg flex items-center justify-center mb-4">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#22C55E"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                    <circle cx="12" cy="12" r="2"></circle>
                    <path d="M6 12h.01M18 12h.01"></path>
                  </svg>
                </div>
                <h4 className="font-bold text-[#1E293B] text-[16px] mb-2">
                  Cash Payment
                </h4>
                <p className="text-sm text-gray-500 mb-6 line-clamp-2">
                  Pay in person at the counter — receipt issued by agent
                </p>
                <div className="flex gap-2 mt-6">
                  <span className="px-3 py-0.5 bg-[#FFFBEB] text-[#D97706] text-[10px] font-bold border border-[#FDE68A] rounded-md uppercase tracking-wide">
                    COUNTER
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full animate-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col gap-2 mb-6 mt-2">
              <button
                onClick={() => setPaymentMethod(null)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-black self-start mb-2"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5"></path>
                  <path d="M12 19l-7-7 7-7"></path>
                </svg>
                Back to methods
              </button>
              <h3 className="font-bold text-[18px] text-[#22333B]">
                {paymentMethod === "online"
                  ? "Online payment details"
                  : "Cash payment details"}
              </h3>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-6 shadow-xs flex flex-wrap justify-between items-center gap-4 relative">
              <div className="w-full">
                <h4 className="font-bold text-[#1E293B] text-[15px] mb-4">
                  Application Details
                </h4>
              </div>
              <div className="w-full grid grid-cols-2 md:grid-cols-6 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                    Application ID
                  </p>
                  <p className="font-medium text-[#1E293B] text-[13px]">
                    {formData.id}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                    Date
                  </p>
                  <p className="font-medium text-[#1E293B] text-[13px]">
                    {formData.dateApplied}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                    Status
                  </p>
                  <p className="font-medium text-[#F68E5F] text-[13px]">
                    Pending
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                    Name
                  </p>
                  <p className="font-medium text-[#1E293B] text-[13px]">
                    {formData.applicantFirstName || ""}
                    {formData.applicantMiddleName
                      ? ` ${formData.applicantMiddleName} `
                      : " "}
                    {formData.applicantLastName || ""}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                    Phone
                  </p>
                  <p className="font-medium text-[#1E293B] text-[13px]">
                    +91 {formData.phone || ""}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                    Members
                  </p>
                  <p className="font-medium text-[#1E293B] text-[13px]">
                    {(formData.members?.length || 0) + 1} Members
                  </p>
                </div>
              </div>
              <div className="absolute top-5 right-5">
                <span className="px-3 py-1 bg-[#FFF4ED] text-[#F68E5F] text-[10px] font-bold rounded-full uppercase tracking-wider">
                  PENDING PAYMENT
                </span>
              </div>
            </div>

            {paymentMethod === "online" ? (
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-6 max-w-4xl mx-auto">
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs bg-white flex flex-col items-center pb-6">
                  <div className="w-full text-[#F68E5F] font-bold text-[11px] uppercase tracking-wider text-center py-3 bg-[#FFF8F4] mb-4">
                    Scan To Pay
                  </div>
                  <div className="p-4 flex justify-center items-center">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=bkbstrust@upi&am=150.00"
                      alt="QR Code"
                      className="w-[180px] h-[180px]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="bg-[#10B981] rounded-xl p-5 text-white shadow-xs">
                    <p className="text-[11px] font-medium uppercase opacity-90 mb-1 tracking-wider">
                      AMOUNT TO PAY
                    </p>
                    <p className="text-[32px] font-bold leading-tight flex items-baseline gap-1">
                      <span className="text-[24px] font-medium">₹</span>{" "}
                      {formData.payment.totalPaid}
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-xl bg-white shadow-xs overflow-hidden text-[13px]">
                    <div className="flex justify-between p-4 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">
                        Payee Name
                      </span>
                      <span className="font-bold text-[#1E293B]">
                        BKBS Trust
                      </span>
                    </div>
                    <div className="flex justify-between p-4 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">UPI ID</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1E293B]">
                          bkbstrust@upi
                        </span>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#F68E5F"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="9"
                            y="9"
                            width="13"
                            height="13"
                            rx="2"
                            ry="2"
                          ></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="flex justify-between p-4 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">
                        Application Number
                      </span>
                      <span className="font-bold text-[#1E293B]">
                        {formData.id}
                      </span>
                    </div>
                    <div className="flex justify-between p-4">
                      <span className="text-gray-500 font-medium">
                        Card No.
                      </span>
                      <span className="font-bold text-[#1E293B]">
                        {formData.cardNumber || ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex bg-gray-50 rounded-lg p-3 gap-3 items-start border border-gray-100 mt-1">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#94A3B8"
                      strokeWidth="2"
                      className="mt-0.5 shrink-0"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    <p className="text-[10px] text-gray-500 leading-snug">
                      Your transaction is secured with 256-bit encryption. Do
                      not close this window or refresh the page while the
                      payment is in progress.
                    </p>
                  </div>
                  <button
                    onClick={handleNext}
                    className="w-full py-3.5 bg-[#10B981] hover:bg-[#0EA5E9] transition-colors rounded-xl text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-xs mt-1"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    I've completed the payment
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-xl mx-auto flex flex-col gap-4">
                <div className="bg-[#10B981] rounded-xl p-5 text-white shadow-xs">
                  <p className="text-[11px] font-medium uppercase opacity-90 mb-1 tracking-wider">
                    AMOUNT TO PAY
                  </p>
                  <p className="text-[32px] font-bold leading-tight flex items-baseline gap-1">
                    <span className="text-[24px] font-medium">₹</span>{" "}
                    {formData.payment.totalPaid}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-xl bg-white shadow-xs overflow-hidden text-[13px]">
                  <div className="flex justify-between p-4 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">
                      Payee Name
                    </span>
                    <span className="font-bold text-[#1E293B]">BKBS Trust</span>
                  </div>
                  <div className="flex justify-between p-4">
                    <span className="text-gray-500 font-medium">
                      Application Number
                    </span>
                    <span className="font-bold text-[#1E293B]">
                      {formData.id}
                    </span>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-xl bg-white shadow-xs overflow-hidden mt-1">
                  <div className="flex items-center gap-2 p-4 border-b border-gray-100 bg-gray-50/50">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"></path>
                      <path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"></path>
                    </svg>
                    <h4 className="font-bold text-[14px] text-[#1E293B]">
                      Agent Checklist
                    </h4>
                  </div>
                  <div className="p-4 flex flex-col gap-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span className="text-[13px] text-gray-700 font-medium">
                        Collect ₹{formData.payment.totalPaid}
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span className="text-[13px] text-gray-700 font-medium">
                        Verify applicant identity (Aadhar/Voter ID)
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span className="text-[13px] text-gray-700 font-medium">
                        Confirm member details with applicant
                      </span>
                    </label>
                  </div>
                </div>
                <button
                  onClick={handleNext}
                  className="w-full py-3.5 bg-[#10B981] hover:bg-[#0EA5E9] transition-colors rounded-xl text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-xs mt-3"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Confirm Cash Received
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleDownloadReceipt = () => {
    window.print();
  };

  const handleFinalSave = () => {
    // Card was already saved via API in performSave (Step 3)
    // Just navigate back to health card list
    navigate("/admin/health-card");
  };

  const renderStep4Receipt = () => (
    <div className="w-full flex justify-center items-start pt-2 pb-12 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#E2E8F0] overflow-hidden flex flex-col mb-4 shrink-0">
        {/* Top Green Section */}
        <div className="bg-[#0D9488] p-8 flex flex-col items-center relative overflow-hidden">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-3">
            <div className="w-10 h-10 bg-[#0D9488] rounded-full border-2 border-white flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
          <h2 className="text-white text-[20px] font-bold mb-1 w-full text-center">
            Payment Successful
          </h2>
          <div className="text-white text-[32px] font-bold mb-4 flex items-baseline gap-1">
            <span className="text-[24px]">₹</span>
            {formData.payment.totalPaid}
          </div>
          <div className="bg-[#59B5AB] bg-opacity-40 text-white px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-wide flex items-center gap-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <rect x="7" y="7" width="3" height="3"></rect>
              <rect x="14" y="7" width="3" height="3"></rect>
              <rect x="7" y="14" width="3" height="3"></rect>
              <rect x="14" y="14" width="3" height="3"></rect>
            </svg>
            {paymentMethod === "online" ? "UPI / QR Payment" : "Cash"}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 bg-white flex flex-col gap-6" id="receipt-content">
          {/* Transaction Details */}
          <div>
            <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-4">
              Transaction Details
            </h4>
            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              <div>
                <p className="text-[11px] text-gray-400 mb-1 font-medium">
                  Receipt No.
                </p>
                <p className="text-[13px] font-bold text-[#1E293B]">
                  BKBS-{new Date().getFullYear()}-
                  {Math.floor(10000 + Math.random() * 90000)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-gray-400 mb-1 font-medium">
                  Transaction ID
                </p>
                <p className="text-[13px] font-bold text-[#1E293B] uppercase">
                  TXN{Math.floor(100000000 + Math.random() * 900000000)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 mb-1 font-medium">
                  Date & Time
                </p>
                <p className="text-[13px] font-bold text-[#1E293B]">
                  {new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  &bull;{" "}
                  {new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-gray-400 mb-1 font-medium">
                  Payment Method
                </p>
                <p className="text-[13px] font-bold text-[#1E293B]">
                  {paymentMethod === "online" ? "G-Pay (UPI)" : "Cash"}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-200"></div>

          {/* Card Details */}
          <div>
            <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-4">
              Card Details
            </h4>
            <div className="bg-[#F8FAFC] rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-gray-500 font-medium">
                  Applicant
                </span>
                <span className="text-[12px] font-bold text-[#1E293B] text-right">
                  {formData.applicantFirstName || ""}
                  {formData.applicantMiddleName
                    ? ` ${formData.applicantMiddleName} `
                    : " "}
                  {formData.applicantLastName || ""}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-gray-500 font-medium">
                  Application ID
                </span>
                <span className="text-[12px] font-bold text-[#1E293B] uppercase text-right">
                  {formData.id}
                </span>
              </div>
              {formData.cardNumber && (
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-gray-500 font-medium">
                    Card Number
                  </span>
                  <span className="text-[12px] font-bold text-[#1E293B] text-right">
                    **** **** **** {formData.cardNumber.slice(-4)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-gray-500 font-medium">
                  Members Covered
                </span>
                <span className="text-[12px] font-bold text-[#1E293B] text-right">
                  {(formData.members?.length || 0) + 1} Members
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-gray-500 font-medium">
                  Valid Until
                </span>
                <span className="text-[12px] font-bold text-[#1E293B] text-right">
                  {formData.expiryDate}
                </span>
              </div>
            </div>
          </div>

          {/* Amount Paid Box */}
          <div className="bg-[#F0FDFA] rounded-xl px-4 py-4 flex justify-between items-center border border-[#CCFBF1]">
            <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider flex items-center">
              Amount Paid
            </span>
            <span className="text-[18px] font-bold text-[#0F766E]">
              ₹{formData.payment.totalPaid}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mt-2">
            <button
              onClick={handleDownloadReceipt}
              className="w-full py-3.5 bg-[#EC5B13] hover:bg-[#EA580C] transition-colors rounded-xl text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-sm"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download Receipt
            </button>
            <button
              onClick={handleFinalSave}
              className="w-full py-3.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-colors rounded-xl text-[#334155] font-bold text-[14px] flex items-center justify-center shadow-sm"
            >
              Close
            </button>
          </div>

          <div className="text-center mt-2 flex items-center justify-center gap-1.5 text-gray-400">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
              BKBS Trust Digital Receipt
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 lg:p-10 transition-opacity"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[1070px] h-full max-h-full flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 shrink-0 border-b border-gray-100">
          <h2 className="text-[20px] font-bold text-[#22333B]">
            New Healthcard Application
          </h2>
          <button
            onClick={() => {
              if (currentStep === 4) {
                handleFinalSave();
              } else {
                navigate("/admin/health-card");
              }
            }}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden flex flex-col pt-6 pb-4 bg-gray-50/30">
          {/* Stepper only visible steps 1-4 */}
          {renderStepper()}

          {/* Dynamic Step Content */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col">
            {currentStep === 1 && renderStep1FillDetails()}
            {currentStep === 2 && renderStep2Preview()}
            {currentStep === 3 && renderStep3Payment()}
            {currentStep === 4 && renderStep4Receipt()}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-gray-100 bg-white shrink-0 flex justify-end items-center px-6">
          {currentStep < 4 ? (
            <div className="flex justify-between items-center w-full">
              <button
                onClick={handleBack}
                disabled={currentStep === 1 || saveLoading || paymentCompleted}
                className={`px-6 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  currentStep === 1 || paymentCompleted
                    ? "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
                }`}
              >
                Previous
              </button>

              {saveError && (
                <span className="text-red-500 text-sm font-medium animate-pulse">
                  {saveError}
                </span>
              )}

              <button
                onClick={handleNext}
                disabled={
                  saveLoading ||
                  (currentStep === 3 && !paymentMethod && !paymentCompleted)
                }
                className={`px-8 py-2 rounded-lg text-sm font-medium text-white transition-all flex items-center gap-2 ${
                  saveLoading ||
                  (currentStep === 3 && !paymentMethod && !paymentCompleted)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#2A3342] hover:bg-[#1E2530]"
                }`}
              >
                {saveLoading && <Loader2 size={16} className="animate-spin" />}
                {saveLoading ? "Processing..." : "Next"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleFinalSave}
              className="px-6 py-2.5 bg-[#2A3342] hover:bg-[#1E2530] text-white rounded-lg text-sm font-medium transition-colors shadow-xs"
            >
              Back to Healthcard List
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateHealthCard;
