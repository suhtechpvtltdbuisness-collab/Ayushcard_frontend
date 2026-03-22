import React from "react";
import { useNavigate } from "react-router-dom";
import AyushCardApplicationForm from "../../../components/ayush/AyushCardApplicationForm";

/**
 * Employee create Ayush card — same flow as public apply, with offline (camera) or online (Cashfree) payment.
 */
const CreateHealthCard = () => {
  const navigate = useNavigate();
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
