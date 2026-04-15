import React from "react";
import { useNavigate } from "react-router-dom";
import AyushCardApplicationForm from "../../../components/ayush/AyushCardApplicationForm";
import { useAttendance } from "../../../context/AttendanceContext";
import { ClipboardCheck, MapPin } from "lucide-react";

/**
 * Employee create Ayush card — same flow as public apply, with offline (camera) or online (Cashfree) payment.
 * Blocked if today's attendance is not yet marked.
 */
const CreateHealthCard = () => {
  const navigate = useNavigate();
  const { attendanceMarked, checking, openModal } = useAttendance();

  // While verifying attendance status, show a neutral loader
  if (checking) {
    return (
      <div className="flex items-center justify-center h-full" style={{ fontFamily: "Inter, sans-serif" }}>
        <div className="w-10 h-10 border-4 border-[#F68E5F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Block card creation if attendance not marked today
  if (!attendanceMarked) {
    return (
      <div
        className="flex flex-col items-center justify-center h-[70vh] text-center px-6"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <ClipboardCheck size={44} className="text-[#F68E5F]" />
        </div>
        <h2 className="text-xl font-bold text-[#22333B] mb-2">Attendance Required</h2>
        <p className="text-sm text-[#6B7280] max-w-sm mb-6">
          You need to mark your attendance for today before you can create Ayush Cards.
          Please check in at your assigned camp first.
        </p>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-6 py-3 bg-[#F68E5F] text-white font-semibold rounded-xl hover:bg-[#ff7535] transition-colors shadow-md"
        >
          <MapPin size={18} />
          Mark Attendance Now
        </button>
        <button
          onClick={() => navigate("/employee")}
          className="mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <AyushCardApplicationForm
      variant="page"
      skipPayment={false}
      staffPaymentFlow
      onBack={() => navigate("/employee/health-card")}
    />
  );
};

export default CreateHealthCard;

