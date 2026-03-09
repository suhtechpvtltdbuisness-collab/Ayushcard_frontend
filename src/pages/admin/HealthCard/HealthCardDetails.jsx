import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, UploadCloud, ChevronDown, X, Plus } from "lucide-react";
import { getHealthCards } from "./HealthCard";
import AyushCardPreview from "../../../components/admin/AyushCardPreview";

const HealthCardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputFrontRef = useRef(null);
  const fileInputBackRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isEditing, setIsEditing] = useState(location.state?.editMode || false);

  const healthCards = getHealthCards();
  const initialData = healthCards.find((c) => c.id === id) || healthCards[0];

  const [formData, setFormData] = useState({
    ...initialData,
    ngoLocation: initialData.ngoLocation || "Mangla Vihar Kanpur - 208015",
    ngoPhone: initialData.ngoPhone || "9927384859",
    ngoEmail:
      initialData.ngoEmail || "baijnaathkesarbaisewatrust9625@gmail.com",
    members: initialData.members || [],
  });

  const [cardSide, setCardSide] = useState("front");

  useEffect(() => {
    // Calculate total including base 120 (applicant) + (included configs up to 7) * 10
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
      setFormData((prev) => ({
        ...prev,
        [side === "front" ? "documentFront" : "documentBack"]: imageUrl,
      }));
    } else {
      alert("Please upload a valid .jpg or .png image.");
    }
  };

  const handleRemoveImage = (side) => {
    setFormData((prev) => ({
      ...prev,
      [side === "front" ? "documentFront" : "documentBack"]: "",
    }));
  };

  const handleSave = () => {
    const updatedCards = healthCards.map((c) => (c.id === id ? formData : c));
    localStorage.setItem("health_cards_data", JSON.stringify(updatedCards));
    setIsEditing(false);
    navigate(".", { replace: true, state: { editMode: false } }); // clear state
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
            className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-[#22333B]">
            Application Details
          </h2>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
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

      <div className="space-y-6">
        {/* Application Details Section */}
        <div className="border border-[#E2E8F0] rounded-xl p-6 bg-white">
          <h3 className="font-bold text-[16px] text-[#22333B] mb-5">
            Application Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Application ID
              </label>
              <input
                type="text"
                value={formData.id}
                readOnly
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none bg-[#F8FAFC]"
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Applicant's first name
              </label>
              <input
                type="text"
                value={
                  formData.applicantFirstName ||
                  formData.applicant?.split(" ")[0] ||
                  ""
                }
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
                value={
                  formData.applicantMiddleName ||
                  formData.applicant?.split(" ")[1] ||
                  ""
                }
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
                value={
                  formData.applicantLastName ||
                  formData.applicant?.split(" ").slice(2).join(" ") ||
                  ""
                }
                onChange={(e) => handleChange(e, "applicantLastName")}
                disabled={!isEditing}
                className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none ${!isEditing ? "bg-gray-50" : "bg-white"}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
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
                Total Amount Paid
              </label>
              <input
                type="text"
                value={formData.payment?.totalPaid || ""}
                readOnly
                disabled={!isEditing}
                className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none bg-gray-50`}
              />
            </div>
          </div>
        </div>

        {/* Upload & QR Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-[#E2E8F0] rounded-xl p-6 bg-white flex flex-col">
            <h3 className="font-bold text-[15px] text-[#22333B]">
              Image Upload
            </h3>
            <p className="text-[13px] text-[#6D6D6D] mb-5">
              Add your documents here, and you can upload up to 5 files max
            </p>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Front Side Upload */}
              <div className="border border-dashed border-[#1849D6] rounded-xl flex flex-col items-center justify-center p-8 bg-[#FFFFFF] relative overflow-hidden min-h-50">
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
                    className={`flex flex-col items-center justify-center w-full h-full ${isEditing ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
                    onClick={() =>
                      isEditing && fileInputFrontRef.current?.click()
                    }
                  >
                    <Plus size={32} className="text-[#1849D6] mb-3" />
                    <p className="text-[14px] text-[#0F172A] font-medium text-center">
                      Document Front Side
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept=".jpg, .jpeg, .png"
                  className="hidden"
                  ref={fileInputFrontRef}
                  disabled={!isEditing}
                  onChange={(e) => handleImageUpload(e, "front")}
                />
              </div>

              {/* Back Side Upload */}
              <div className="border border-dashed border-[#1849D6] rounded-xl flex flex-col items-center justify-center p-8 bg-[#FFFFFF] relative overflow-hidden min-h-50">
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
                    className={`flex flex-col items-center justify-center w-full h-full ${isEditing ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
                    onClick={() =>
                      isEditing && fileInputBackRef.current?.click()
                    }
                  >
                    <Plus size={32} className="text-[#1849D6] mb-3" />
                    <p className="text-[14px] text-[#0F172A] font-medium text-center">
                      Document Back Side
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept=".jpg, .jpeg, .png"
                  className="hidden"
                  ref={fileInputBackRef}
                  disabled={!isEditing}
                  onChange={(e) => handleImageUpload(e, "back")}
                />
              </div>
            </div>
            <p className="text-[12px] text-[#6D6D6D] mt-6">
              Only supports .jpg, .png files
            </p>
          </div>
          <div className="border border-[#E2E8F0] rounded-xl p-6 bg-white flex flex-col">
            <h3 className="font-bold text-[15px] text-[#22333B]">QR Code</h3>
            <p className="text-[13px] text-[#6D6D6D] mb-5">
              A Unique Qr code of your Health Card
            </p>
            <div className="flex-1 flex items-center justify-center">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=AyushCard"
                alt="QR"
                className="w-45 h-45 object-contain border-4 border-black rounded-lg p-1"
              />
            </div>
          </div>
        </div>

        {/* Members Table */}
        <div className="border border-[#E2E8F0] rounded-xl bg-white overflow-hidden">
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
                  <th className="py-4 px-6 text-[12px] font-bold text-[#64748B] uppercase tracking-wider min-w-25">
                    MEMBER NAME
                  </th>
                  <th className="py-4 px-6 text-[12px] font-bold text-[#64748B] uppercase tracking-wider min-w-25">
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
                            newMembers[i].name = e.target.value;
                            setFormData({ ...formData, members: newMembers });
                          }}
                          className="w-full rounded px-3 py-2 text-[14px]"
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
                            newMembers[i].relation = e.target.value;
                            setFormData({ ...formData, members: newMembers });
                          }}
                          className="w-full rounded px-3 py-2 text-[14px]"
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
                            newMembers[i].age = e.target.value;
                            setFormData({ ...formData, members: newMembers });
                          }}
                          className="w-full rounded px-3 py-2 text-[14px]"
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
                      className="py-8 text-center text-gray-400"
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
                className="text-[#F68E5F] font-normal text-[14px] flex items-center gap-1.5 hover:text-[#e57745] transition-colors"
              >
                Add Member{" "}
                <span className="text-lg leading-none pb-0.5">+</span>
              </button>
            </div>
          )}
        </div>

        {/* Card Preview Section */}
        <div className="border border-[#F1F5F9] rounded-xl bg-white overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-white">
            <h3 className="font-bold text-[16px] text-[#22333B]">
              Card Preview
            </h3>
            <div className="flex bg-[#F8FAFC] p-1 rounded-lg">
              <button
                onClick={() => setCardSide("front")}
                className={`px-6 py-1.5 rounded-md text-[13px] font-semibold transition-all ${cardSide === "front" ? "bg-white shadow-sm text-[#0F172A]" : "text-[#64748B] hover:text-[#0F172A]"}`}
              >
                Front
              </button>
              <button
                onClick={() => setCardSide("back")}
                className={`px-6 py-1.5 rounded-md text-[13px] font-semibold transition-all ${cardSide === "back" ? "bg-white shadow-sm text-[#0F172A]" : "text-[#64748B] hover:text-[#0F172A]"}`}
              >
                Back
              </button>
            </div>
          </div>

          <div className="bg-[#F8FAFC] p-12 flex flex-col items-center justify-center min-h-112.5">
            <AyushCardPreview
              data={formData}
              side={cardSide}
              onFlip={(side) => setCardSide(side)}
            />
            <p className="text-[13px] text-[#94A3B8] mt-10 flex items-center gap-2 font-medium">
              <img src="/admin_images/click.svg" alt="click" /> Click the card
              or use the buttons to flip • Preview reflects saved application
              data
            </p>
          </div>
        </div>
      </div>

      {/* Full Screen Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative w-[60vw] h-[60vh] max-w-4xl max-h-200 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 -right-10 text-white hover:text-gray-300 p-2"
            >
              <X size={32} />
            </button>
            <img
              src={previewImage}
              alt="Document Full Preview"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthCardDetails;
