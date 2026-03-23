import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import AyushCardPreview from "../../../components/admin/AyushCardPreview";
import apiService from "../../../api/service";

const getDocumentPath = (card, side) => {
  const docs = Array.isArray(card?.documents) ? card.documents : [];
  const sideKeywords =
    side === "front"
      ? ["documentfront", "front", "aadhaarfront", "idfront"]
      : ["documentback", "back", "aadhaarback", "idback"];

  const matched = docs.find((d) => {
    const key = String(d?.name || d?.type || d?.label || "").toLowerCase();
    return sideKeywords.some((k) => key.includes(k));
  });

  if (matched?.path || matched?.url) return matched.path || matched.url;
  if (side === "front" && docs[0]) return docs[0].path || docs[0].url || "";
  if (side === "back" && docs[1]) return docs[1].path || docs[1].url || "";
  return "";
};

// Map API response fields → form fields
const apiToForm = (card) => ({
  allDocuments: (Array.isArray(card?.documents) ? card.documents : [])
    .map((doc, index) => ({
      name: doc?.name || doc?.label || doc?.type || `Document ${index + 1}`,
      path: doc?.path || doc?.url || "",
    }))
    .filter((doc) => Boolean(doc.path)),
  // IDs
  _id: card._id || "",
  id: card.applicationId || card._id || "",
  // Application
  dateApplied: card.applicationDate || "",
  status: card.status || "pending",
  // Name (also build a combined 'applicant' for the card preview)
  applicantFirstName: card.firstName || "",
  applicantMiddleName: card.middleName || "",
  applicantLastName: card.lastName || "",
  applicant: [card.firstName, card.middleName, card.lastName]
    .filter(Boolean)
    .join(" "),
  // Contact
  phone: card.contact || "",
  altPhone: card.alternateContact || "",
  email: card.email || "",
  // Card info
  cardNumber: card.cardNo || "",
  cardNo: card.cardNo || "", // alias used by preview
  issueDate: card.cardIssueDate || "",
  expiryDate: card.cardExpiredDate || "",
  verificationDate: card.verificationDate || "",
  // Members / payment
  totalMembers: card.totalMember ?? "",
  members: Array.isArray(card.members) ? card.members : [],
  payment: {
    applicationFee: 120,
    memberAddOns: (Number(card.totalMember) || 0) * 10,
    totalPaid: card.totalAmount ?? 120,
  },
  // Misc
  address: card.address || "",
  gender: card.gender || "",
  dob: card.dob || "",
  aadhaarNumber: card.aadhaarNumber || "",
  documentFront: card.documentFront || getDocumentPath(card, "front"),
  documentBack: card.documentBack || getDocumentPath(card, "back"),
  // On employee details page, also use documents[1] as the card photo
  profileImage:
    card.profileImage ||
    (Array.isArray(card.documents) && card.documents.length > 1
      ? card.documents[1].path || card.documents[1].url
      : Array.isArray(card.documents) && card.documents.length > 0
        ? card.documents[0].path || card.documents[0].url
        : ""),
  // NGO details for preview
  ngoLocation: card.ngoLocation || "Mangla Vihar Kanpur - 208015",
  ngoPhone: card.ngoPhone || "9927384859",
  ngoEmail: card.ngoEmail || "baijnaathkesarbaisewatrust9625@gmail.com",
});

const HealthCardDetails = () => {
  const { id } = useParams(); // MongoDB _id (from HealthCard list navigation)
  const navigate = useNavigate();

  const [isEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState("");

  const resolveUrl = (path) => {
    if (!path) return "";
    if (
      path.startsWith("http") ||
      path.startsWith("data:") ||
      path.startsWith("blob:")
    )
      return path;

    let baseUrl = import.meta.env.VITE_API_BASE_URL || "";
    if (!baseUrl && window.location.hostname === "localhost") {
      baseUrl = "https://bkbs-backend.vercel.app";
    }

    const fileBase = baseUrl.replace(/\/api$/, "");
    const cleanBase = fileBase.endsWith("/") ? fileBase.slice(0, -1) : fileBase;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    return `${cleanBase}${cleanPath}`;
  };
  const [cardSide, setCardSide] = useState("front");

  // ── Fetch card + members on mount ────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setFetchErr("");
      try {
        let res;
        try {
          res = await apiService.getHealthCardById(id);
        } catch (err) {
          if (err?.response?.status === 404) {
            res = await apiService.getHealthCardByCardNo(id);
          } else {
            throw err;
          }
        }

        const rawArray = Array.isArray(res?.data?.data) ? res.data.data : [];
        const raw =
          rawArray[0] || res?.data?.card || res?.data?.data || res?.data || res;
        const mapped = apiToForm(raw);
        setFormData(mapped);

        // Fetch members
        const mongoId = raw._id || id;
        try {
          const mRes = await apiService.getCardMembers(mongoId);
          const mRaw = Array.isArray(mRes.data?.data)
            ? mRes.data.data
            : Array.isArray(mRes.data?.data?.members)
              ? mRes.data.data.members
              : Array.isArray(mRes.data)
                ? mRes.data
                : Array.isArray(mRes?.data)
                  ? mRes.data
                  : Array.isArray(mRes?.data?.members)
                    ? mRes.data.members
                    : Array.isArray(mRes)
                      ? mRes
                      : [];
          if (mRaw.length > 0) {
            setFormData((prev) => ({ ...prev, members: mRaw }));
          }
        } catch (mErr) {
          console.warn("[HealthCardDetails] members fetch failed", mErr);
        }
      } catch (err) {
        console.error("[HealthCardDetails] fetch failed:", err);
        setFetchErr("Could not load card.");
        setFormData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Payment auto-calc ────────────────────────────────────────────────────
  useEffect(() => {
    if (!formData) return;
    const n = Number(formData.totalMembers) || 0;
    setFormData((prev) => ({
      ...prev,
      payment: {
        ...prev.payment,
        memberAddOns: n * 10,
        totalPaid: 120 + n * 10,
      },
    }));
  }, [formData?.totalMembers]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ─────────────────────────────────────────────────────────────
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
    )
      value = value.replace(/[^a-zA-Z\s]/g, "");
    else if (
      [
        "phone",
        "altPhone",
        "payment.totalPaid",
        "cardNumber",
        "totalMembers",
        "aadhaarNumber",
      ].includes(field)
    )
      value = value.replace(/[^0-9.]/g, "");
    if (field === "aadhaarNumber") value = value.slice(0, 12);
    if (field === "totalMembers" && Number(value) > 7) value = "7";
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
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return dateStr;
  };

  const handleDateChange = (e, field) => {
    const val = e.target.value;
    if (!val) {
      setFormData((prev) => ({ ...prev, [field]: "" }));
      return;
    }
    const parts = val.split("-");
    setFormData((prev) => ({
      ...prev,
      [field]: parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : val,
    }));
  };

  // ── Render states ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24">
        <Loader2 size={36} className="animate-spin text-[#F68E5F] mb-3" />
        <p className="text-sm text-gray-500">Loading application…</p>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24">
        <p className="text-red-500 font-medium mb-4">
          {fetchErr || "Card not found."}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="text-[#F68E5F] underline text-sm"
        >
          Go back
        </button>
      </div>
    );
  }

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
              <input
                type="text"
                value={formData.status || "pending"}
                readOnly
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none bg-gray-50 uppercase font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                First Name
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
                Middle Name
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
                Last Name
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

          {/* Aadhaar Number */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <div>
              <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">
                Aadhaar Number
              </label>
              <input
                type="text"
                value={formData.aadhaarNumber || ""}
                onChange={(e) => handleChange(e, "aadhaarNumber")}
                disabled={!isEditing}
                placeholder="12-digit Aadhaar Number"
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
                Card Number
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
                value={formData.totalMembers ?? ""}
                onChange={(e) => handleChange(e, "totalMembers")}
                disabled={!isEditing}
                className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none ${!isEditing ? "bg-gray-50" : "bg-white"}`}
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
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#22333B] focus:outline-none bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Media & QR Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
          {/* Image Upload */}
          <div className="border border-[#E2E8F0] rounded-xl p-6 bg-white flex flex-col shadow-xs h-full">
            <h3 className="font-bold text-[15px] text-[#22333B] mb-1">
              Uploaded Documents
            </h3>
            <p className="text-[12px] text-[#6D6D6D] mb-5">
              All uploaded documents preview.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              {Array.from({ length: 4 }).map((_, index) => {
                const doc = formData.allDocuments?.[index];
                const docLabel = doc?.name || `Document ${index + 1}`;

                return (
                  <div
                    key={index}
                    className="border border-dashed border-[#1849D6]/40 rounded-xl flex flex-col items-center justify-center p-3 bg-white transition-colors relative h-44"
                  >
                    {doc?.path ? (
                      <>
                        <div className="w-full h-full rounded-lg overflow-hidden">
                          <img
                            src={resolveUrl(doc.path)}
                            className="w-full h-full object-cover"
                            alt={docLabel}
                          />
                        </div>
                        <a
                          href={resolveUrl(doc.path)}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm text-[11px] text-[#1E293B] font-semibold px-2 py-1 rounded truncate text-center"
                          title={docLabel}
                        >
                          {docLabel}
                        </a>
                      </>
                    ) : (
                      <>
                        <Plus size={24} className="text-[#1E293B] mb-2" />
                        <p className="text-[12px] text-[#1E293B] font-medium text-center px-2">
                          {docLabel} not uploaded
                        </p>
                      </>
                    )}
                  </div>
                );
              })}
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
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${window.location.origin}/verify/${formData.id}`)}`}
                  alt="QR"
                  className="w-35 h-30 object-contain border-4 border-black rounded-lg p-1"
                />
              </div>
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
                          value={m.name || ""}
                          placeholder="Name"
                          onChange={(e) => {
                            const nm = [...formData.members];
                            nm[i] = { ...nm[i], name: e.target.value };
                            setFormData({ ...formData, members: nm });
                          }}
                          className="w-full rounded px-3 py-2 text-[14px]"
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
                          value={m.relation || ""}
                          placeholder="Relation"
                          onChange={(e) => {
                            const nm = [...formData.members];
                            nm[i] = { ...nm[i], relation: e.target.value };
                            setFormData({ ...formData, members: nm });
                          }}
                          className="w-full rounded px-3 py-2 text-[14px]"
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
                          value={m.age || ""}
                          placeholder="Age"
                          onChange={(e) => {
                            const nm = [...formData.members];
                            nm[i] = { ...nm[i], age: e.target.value };
                            setFormData({ ...formData, members: nm });
                          }}
                          className="w-full rounded px-3 py-2 text-[14px]"
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
                          onClick={() =>
                            setFormData({
                              ...formData,
                              members: formData.members.filter(
                                (_, idx) => idx !== i,
                              ),
                            })
                          }
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
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    members: [
                      ...(prev.members || []),
                      { name: "", relation: "", age: "" },
                    ],
                  }))
                }
                className="text-[#F68E5F] font-normal text-[14px] flex items-center gap-1.5 hover:text-[#e57745] transition-colors"
              >
                Add Member{" "}
                <span className="text-lg leading-none pb-0.5">+</span>
              </button>
            </div>
          )}
        </div>

        {/* Card Preview */}
        <div className="border border-[#F1F5F9] rounded-xl bg-white overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-white">
            <h3 className="font-bold text-[16px] text-[#22333B]">
              Card Preview
            </h3>
            <div className="flex bg-[#F8FAFC] p-1 rounded-lg">
              {["front", "back"].map((side) => (
                <button
                  key={side}
                  onClick={() => setCardSide(side)}
                  className={`px-6 py-1.5 rounded-md text-[13px] font-semibold transition-all ${cardSide === side ? "bg-white shadow-sm text-[#0F172A]" : "text-[#64748B] hover:text-[#0F172A]"}`}
                >
                  {side.charAt(0).toUpperCase() + side.slice(1)}
                </button>
              ))}
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
    </div>
  );
};

export default HealthCardDetails;
