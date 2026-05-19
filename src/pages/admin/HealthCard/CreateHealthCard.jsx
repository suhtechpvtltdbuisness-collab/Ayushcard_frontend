import React from "react";
import { useNavigate } from "react-router-dom";
import AyushCardApplicationForm from "../../../components/ayush/AyushCardApplicationForm";
import HealthCardCreatePageShell from "../../../components/ayush/HealthCardCreatePageShell";

/**
 * Admin create Ayush card — same flow as public apply, with offline (camera) or online (Cashfree) payment.
 */
const CreateHealthCard = () => {
  const navigate = useNavigate();
  return (
    <HealthCardCreatePageShell>
      <AyushCardApplicationForm
        variant="page"
        skipPayment={false}
        staffPaymentFlow
        onBack={() => navigate("/admin/health-card")}
      />
    </HealthCardCreatePageShell>
  );
};

export default CreateHealthCard;
