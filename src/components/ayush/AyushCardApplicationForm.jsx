import React from "react";
import { X, ArrowLeft } from "lucide-react";
import { AyushCardFormContext } from "./ayushCard/AyushCardFormContext.jsx";
import { useAyushCardApplicationForm } from "./ayushCard/useAyushCardApplicationForm.jsx";
import ApplicationStepper from "./ayushCard/components/ApplicationStepper.jsx";
import ApplicationFormFooter from "./ayushCard/components/ApplicationFormFooter.jsx";
import ApplicationSuccessStep from "./ayushCard/components/ApplicationSuccessStep.jsx";
import StaffCashCameraModal from "./ayushCard/components/StaffCashCameraModal.jsx";
import Step1FamilyHead from "./ayushCard/steps/Step1FamilyHead.jsx";
import Step2Members from "./ayushCard/steps/Step2Members.jsx";
import Step3Review from "./ayushCard/steps/Step3Review.jsx";
import Step4StaffPayment from "./ayushCard/steps/Step4StaffPayment.jsx";
import Step4PublicPayment from "./ayushCard/steps/Step4PublicPayment.jsx";

/**
 * Shared Ayush card application flow (same UI as public modal).
 * @param {'modal'|'page'} variant
 * @param {boolean} skipPayment — staff flow: no Cashfree step; submit from Review
 * @param {function} onStaffSubmit — optional override `(payload) => Promise` for POST /api/cards
 * @param {function} onBack — page variant: header back (e.g. navigate(-1))
 * @param {boolean} staffPaymentFlow — admin/employee: payment step with offline (camera) + online (Cashfree, auth APIs)
 */
const AyushCardApplicationForm = (props) => {
  const form = useAyushCardApplicationForm(props);
  const {
    variant,
    isOpen,
    onClose,
    onBack,
    currentStep,
    successStep,
    skipPayment,
    staffPaymentFlow,
    aadhaarBackOcrInputRef,
    docBackInputRef,
    docBackCameraInputRef,
    headImageInputRef,
    paymentInputRef,
    memberCanvasRef,
    handleAadhaarBackScanImage,
    handleDocumentUpload,
    handleHeadImageUpload,
    handlePaymentScreenshotUpload,
  } = form;

  if (variant === "modal" && !isOpen) return null;

  return (
    <AyushCardFormContext.Provider value={form}>
      <div
        id="ayushcard-application-form-root"
        className={
          variant === "modal"
            ? "fixed inset-0 z-100 flex items-center justify-center bg-black/60 px-4 overflow-hidden"
            : "flex-1 h-full min-h-0 w-full max-w-full overflow-hidden flex flex-col bg-transparent"
        }
        style={{ fontFamily: "Quicksand, sans-serif" }}
      >
        {variant === "page" && (
          <style>{`
          @media (max-width: 640px) {
            #ayushcard-application-form-root,
            #ayushcard-application-form-root * {
              font-size: 12px !important;
            }
          }
        `}</style>
        )}
        <div
          className={
            variant === "page"
              ? "flex flex-1 flex-col min-h-0 w-full max-w-full gap-0"
              : "flex min-h-0 w-full max-h-[90vh] items-stretch justify-center"
          }
        >
          <div
            className={`bg-white w-full max-w-full flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 relative min-h-0 ${
              variant === "modal"
                ? "max-h-[90vh] h-full rounded-xl shadow-xl"
                : "flex-1 h-full min-h-0 max-h-full rounded-xl shadow-sm border border-gray-200/50"
            }`}
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            {variant === "page" && (
              <div className="flex shrink-0 flex-wrap items-center gap-1.5 px-2 pt-1.5 pb-0 sm:gap-3 sm:px-3 sm:pt-2 border-b border-gray-100">
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-1 text-[#222222] font-semibold hover:text-[#fa8112] transition-colors text-[12px] sm:text-base"
                  >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    Back
                  </button>
                )}
                <h1 className="text-sm sm:text-lg font-bold text-[#222222] tracking-tight leading-tight">
                  Create Ayush Card
                </h1>
              </div>
            )}
            <div className="flex justify-between items-center px-2 py-1 sm:px-3 sm:py-1.5 bg-[#F5F5F5] shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 w-full min-w-0">
                <div className="flex items-center justify-center shrink-0">
                  <img
                    src="/logo_whitebg.svg"
                    alt="BKBS Trust"
                    className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14"
                  />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className="text-[11px] sm:text-[13px] md:text-[14px] font-semibold text-[#222222] leading-tight">
                    {variant === "page"
                      ? "New card registration"
                      : "Apply for Ayush Card"}
                  </h3>
                </div>
                {variant === "modal" ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors text-[#222222] shrink-0 border border-[#222222]"
                  >
                    <X size={16} />
                  </button>
                ) : (
                  <div className="w-4 sm:w-6 shrink-0" aria-hidden />
                )}
              </div>
            </div>

            <input
              type="file"
              accept="image/*"
              ref={aadhaarBackOcrInputRef}
              className="hidden"
              onChange={handleAadhaarBackScanImage}
            />
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              ref={docBackInputRef}
              className="hidden"
              onChange={handleDocumentUpload}
            />
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={docBackCameraInputRef}
              className="hidden"
              onChange={handleDocumentUpload}
            />
            <input
              type="file"
              accept="image/*"
              ref={headImageInputRef}
              className="hidden"
              onChange={handleHeadImageUpload}
            />
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              ref={paymentInputRef}
              className="hidden"
              onChange={handlePaymentScreenshotUpload}
            />

            {currentStep < successStep ? (
              <>
                <ApplicationStepper />

                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 sm:px-8 pb-4 pt-2 custom-scrollbar">
                  {currentStep === 1 && <Step1FamilyHead />}
                  {currentStep === 2 && <Step2Members />}
                  {currentStep === 3 && <Step3Review />}
                  {!skipPayment && currentStep === 4 && staffPaymentFlow && (
                    <Step4StaffPayment />
                  )}
                  {!skipPayment && currentStep === 4 && !staffPaymentFlow && (
                    <Step4PublicPayment />
                  )}
                  <canvas ref={memberCanvasRef} style={{ display: "none" }} />
                </div>

                <ApplicationFormFooter />
              </>
            ) : (
              <ApplicationSuccessStep />
            )}

            <StaffCashCameraModal />
          </div>
        </div>
      </div>
    </AyushCardFormContext.Provider>
  );
};

export default AyushCardApplicationForm;
