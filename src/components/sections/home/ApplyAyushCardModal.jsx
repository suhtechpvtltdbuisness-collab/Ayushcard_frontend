import React from "react";
import AyushCardApplicationForm from "../../ayush/AyushCardApplicationForm";

/**
 * Public “Apply for Ayush Card” modal — same flow as staff create, with online payment.
 */
const ApplyAyushCardModal = ({ isOpen, onClose }) => (
  <AyushCardApplicationForm
    variant="modal"
    isOpen={isOpen}
    onClose={onClose}
    skipPayment={false}
  />
);

export default ApplyAyushCardModal;
