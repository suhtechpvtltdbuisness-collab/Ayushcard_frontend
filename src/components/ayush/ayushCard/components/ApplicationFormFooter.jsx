import { ArrowLeft, ArrowRight } from "lucide-react";
import { useAyushCardForm } from "../AyushCardFormContext.jsx";

export default function ApplicationFormFooter() {
  const {
    currentStep, footerStepMax, handleBack, handleNext, submitting, skipPayment,
  } = useAyushCardForm();
  return (
              <div className="bg-[#F5F5F5] p-4 border-t border-gray-100 flex items-center justify-between px-8 shrink-0">
                <div className="flex-1 flex justify-start">
                  {currentStep > 1 ? (
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-2 bg-white border border-[#FA8112] text-[#FA8112] active:scale-95 font-medium px-6 py-2 rounded-full transition-all duration-300 hover:bg-[#FA8112]/5"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back
                    </button>
                  ) : (
                    <p className="text-[15px] font-medium text-[#222222]">
                      Step {currentStep} of {footerStepMax}
                    </p>
                  )}
                </div>

                <div className="flex-1 justify-center hidden md:flex">
                  {currentStep > 1 && (
                    <p className="text-[14px] text-gray-500">
                      Step {currentStep} of {footerStepMax}
                    </p>
                  )}
                </div>

                <div className="flex-1 flex justify-end">
                  <button
                    onClick={handleNext}
                    disabled={submitting}
                    className="flex items-center gap-2 bg-[#fa8112] hover:bg-[#e0720f] shadow-md active:scale-95 text-white font-medium pl-6 pr-2 py-2 rounded-full transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitting
                      ? "Submitting..."
                      : skipPayment && currentStep === 3
                        ? "Submit"
                        : currentStep === 4
                          ? "Confirm"
                          : "Continue"}
                    <span className="flex items-center justify-center bg-white rounded-full w-8 h-8 ml-2">
                      {submitting ? (
                        <div className="w-4 h-4 border-2 border-[#fa8112] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ArrowRight className="w-5 h-5 text-[#fa8112]" />
                      )}
                    </span>
                  </button>
                </div>
              </div>
  );
}
