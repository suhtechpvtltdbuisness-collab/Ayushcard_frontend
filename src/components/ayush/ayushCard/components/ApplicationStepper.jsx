import { Check } from "lucide-react";
import { useAyushCardForm } from "../AyushCardFormContext.jsx";

export default function ApplicationStepper() {
  const { currentStep, stepperSteps, stepperProgressPct } = useAyushCardForm();
  return (
              <div className="px-4 sm:px-8 py-2 flex justify-center bg-white shrink-0">
                <div className="flex items-center max-w-xl w-full justify-between relative py-1">
                  {/* Step lines background */}
                  <div className="absolute top-[38%] left-[15%] w-[70%] h-[1.5px] bg-[#f7e5bc] -z-10"></div>
                  <div
                    className="absolute top-[38%] left-[15%] h-[1.5px] bg-[#fa8112] -z-10 transition-all duration-500"
                    style={{ width: `${stepperProgressPct}%` }}
                  ></div>

                  {stepperSteps.map((step) => (
                    <div
                      key={step.num}
                      className="flex flex-col items-center bg-white relative z-10 w-[72px] sm:w-[80px]"
                    >
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-[12px] font-bold mb-1 transition-colors ${
                          currentStep === step.num
                            ? "bg-[#fa8112] text-white"
                            : currentStep > step.num
                              ? "bg-[#fa8112] text-white"
                              : "border border-[#f7e5bc] text-[#222222] bg-white"
                        }`}
                      >
                        {currentStep > step.num ? (
                          <Check size={13} strokeWidth={3} />
                        ) : (
                          step.num
                        )}
                      </div>
                      <span
                        className={`text-[9px] sm:text-[10px] md:text-[11px] text-center max-w-[68px] sm:max-w-none leading-tight md:whitespace-nowrap ${
                          currentStep === step.num
                            ? "font-bold text-[#222222]"
                            : "font-semibold text-[#666666]"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
  );
}
