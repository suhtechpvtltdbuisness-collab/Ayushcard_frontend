import { ArrowLeft, ArrowRight } from "lucide-react";
import { useAyushCardForm } from "../AyushCardFormContext.jsx";

export default function ApplicationFormFooter() {
  const {
    currentStep,
    footerStepMax,
    handleBack,
    handleNext,
    submitting,
    skipPayment,
    registrationCheckInProgress,
    registrationBlocked,
  } = useAyushCardForm();

  const continueDisabled =
    submitting ||
    registrationCheckInProgress ||
    (registrationBlocked && (currentStep === 1 || currentStep === 3 || currentStep === 4));
  return (
              <div className="bg-[#F5F5F5] py-2 px-3 sm:py-2 sm:px-6 md:py-2 md:px-6 border-t border-gray-100 flex items-center justify-between shrink-0 z-10">
                <div className="flex-1 flex justify-start min-w-0">
                  {currentStep > 1 ? (
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-1 sm:gap-1.5 bg-white border border-[#FA8112] text-[#FA8112] active:scale-95 font-medium text-[13px] sm:text-[14px] px-3 py-1.5 sm:px-4 sm:py-1.5 md:px-5 rounded-full transition-all duration-300 hover:bg-[#FA8112]/5"
                    >
                      <ArrowLeft className="w-4 h-4 shrink-0" />
                      Back
                    </button>
                  ) : (
                    <p className="text-[12px] sm:text-[13px] md:text-[14px] font-medium text-[#222222]">
                      Step {currentStep} of {footerStepMax}
                    </p>
                  )}
                </div>

                <div className="flex-1 justify-center hidden md:flex">
                  {currentStep > 1 && (
                    <p className="text-[13px] text-gray-500">
                      Step {currentStep} of {footerStepMax}
                    </p>
                  )}
                </div>

                <div className="flex-1 flex justify-end">
                  <button
                    onClick={handleNext}
                    disabled={continueDisabled}
                    className="flex items-center gap-1 sm:gap-1.5 bg-[#fa8112] hover:bg-[#e0720f] shadow-md active:scale-95 text-white font-medium text-[13px] sm:text-[14px] pl-3 pr-1 sm:pl-4 sm:pr-1.5 md:pl-5 py-1.5 rounded-full transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {registrationCheckInProgress
                      ? "Checking..."
                      : submitting
                      ? "Submitting..."
                      : skipPayment && currentStep === 3
                        ? "Submit"
                        : currentStep === 4
                          ? "Confirm"
                          : "Continue"}
                    <span className="flex items-center justify-center bg-white rounded-full w-7 h-7 ml-1 sm:ml-1.5 shrink-0">
                      {submitting ? (
                        <div className="w-3.5 h-3.5 border-2 border-[#fa8112] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-[#fa8112]" />
                      )}
                    </span>
                  </button>
                </div>
              </div>
  );
}
