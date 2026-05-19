import { User, UploadCloud, Check, Camera, Loader2, X as CloseIcon, Plus, ArrowLeft, ArrowRight, Banknote, CheckCircle2, ScanLine, FileText, ImageIcon, Calendar, RefreshCw } from "lucide-react";
import { useAyushCardForm } from "../AyushCardFormContext.jsx";

export default function Step4PublicPayment() {
  const form = useAyushCardForm();
  return <Step4PublicPaymentView {...form} />;
}

function Step4PublicPaymentView(form) {
  const { variant, isOpen, onClose, skipPayment, staffPaymentFlow, onStaffSubmit, onBack, currentStep, setCurrentStep, applicationId, setApplicationId, submissionReceipt, setSubmissionReceipt, toastWarn, toastError, toastSuccess, todayCampId, todayCampName, submitting, setSubmitting, docFront, setDocFront, docBack, setDocBack, docAadhaarBack, setDocAadhaarBack, ocrFileInputRef, aadhaarBackOcrInputRef, docBackInputRef, docBackCameraInputRef, headImageInputRef, headCameraVideoRef, headCameraCanvasRef, paymentInputRef, maxDobForAdult, paymentScreenshot, setPaymentScreenshot, isEditingReview, setIsEditingReview, declarationAccepted, setDeclarationAccepted, paymentMethod, setPaymentMethod, onlinePaymentLoading, setOnlinePaymentLoading, verifyLoading, setVerifyLoading, orderId, setOrderId, txnId, setTxnId, saveError, setSaveError, staffPaymentMode, setStaffPaymentMode, staffCashReceiptImage, setStaffCashReceiptImage, staffCashVideoRef, staffCashCanvasRef, staffCashCameraActive, staffCashCameraLoading, ocrLoading, ocrProgress, backOcrLoading, backOcrProgress, videoRef, canvasRef, cameraActive, aadhaarBackVideoRef, aadhaarBackCanvasRef, aadhaarBackCameraActive, docBackVideoRef, docBackCanvasRef, docBackCameraActive, docBackCameraLoading, headImage, setHeadImage, headCameraActive, headCameraPermissionDenied, familyHead, setFamilyHead, headPhoneDuplicate, headAadhaarDuplicate, headNameDuplicate, members, setMembers, activeMemberTab, setActiveMemberTab, memberScanningIndex, memberScanProgress, memberOcrLoading, memberVideoRef, memberCanvasRef, memberCameraActive, memberInputRef, addMemberScrollAnchorRef, successStep, totalMembersCount, estimatedFee, extraMembersBeyondIncluded, stepperSteps, stepperProgressPct, footerStepMax, stopStaffCashCamera, handleRawBtPrint, resetForm, handleStaffChooseOfflineCash, handleStaffChooseOnline, handleAadhaarBackScanImage, handleScanImage, handleHeadChange, handleMemberChange, handleDocumentUpload, handleHeadImageUpload, handlePaymentScreenshotUpload, handleMemberScanImage, submitFinalApplication, buildStaffHealthCardPayload, submitStaffApplication, handleInitiateCashfreePayment, handleVerifyCashfreePayment, handleNext, handleBack, cardPreviewData, renderHeadDuplicateHint, thermalPaymentLabel, thermalPaymentRef, hasPrintableReceipt, captureHeadPhoto, stopHeadCamera, startHeadCamera, startCamera, stopCamera, capturePhoto, startAadhaarBackCamera, stopAadhaarBackCamera, captureAadhaarBackPhoto, startDocBackCamera, stopDocBackCamera, captureDocBackPhoto, addMember, removeMember, startMemberCamera, stopMemberCamera, captureMemberPhoto, captureStaffCashReceipt, setHeadCameraActive, setHeadCameraPermissionDenied, setMemberScanningIndex, setMemberScanProgress, setMemberOcrLoading, setMemberCameraActive, setStaffCashCameraLoading, setOcrLoading, setOcrProgress, setBackOcrLoading, setBackOcrProgress, setCameraActive, setAadhaarBackCameraActive, setDocBackCameraLoading, setDocBackCameraActive } = form;
  return (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="text-center mb-8">
                      <h3 className="font-black text-[22px] md:text-[24px] text-[#22333B] uppercase tracking-tight mb-2">
                        Complete Online Payment
                      </h3>
                      <p className="text-[13px] text-gray-500">
                        Total Payable Amount:{" "}
                        <span className="font-bold text-[#fa8112]">
                          ₹{Number(estimatedFee).toFixed(2)}
                        </span>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 mb-8 max-w-2xl mx-auto">
                      <div className="group border-2 rounded-[32px] p-6 sm:p-8 bg-white transition-all flex flex-col sm:flex-row items-center gap-6 border-[#fa8112] shadow-2xl">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-50 rounded-3xl flex items-center justify-center text-[#fa8112] group-hover:bg-[#fa8112] group-hover:text-white transition-all shadow-inner shrink-0">
                          <span className="text-2xl">💳</span>
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <h4 className="font-bold text-[#22333B] text-[18px] sm:text-[20px] mb-1">
                            Online Payment
                          </h4>
                          <p className="text-gray-500 text-[13px] sm:text-[14px] leading-relaxed">
                            UPI, GPay, or Cards.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="max-w-xl mx-auto">
                      {saveError && (
                        <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4 border border-red-100 w-full text-center">
                          {saveError}
                        </div>
                      )}

                      {txnId ? (
                        <div className="w-full flex flex-col gap-4 animate-in fade-in zoom-in duration-500">
                          <div
                            className={`border rounded-2xl p-6 flex flex-col items-center gap-3 ${
                              txnId
                                ? "bg-green-50 border-green-200"
                                : "bg-orange-50 border-orange-200"
                            }`}
                          >
                            <div
                              className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg mb-1 ${
                                txnId ? "bg-green-500" : "bg-orange-500"
                              }`}
                            >
                              <Check size={28} strokeWidth={3} />
                            </div>
                            <h3
                              className={`text-lg font-bold ${
                                txnId ? "text-green-700" : "text-orange-700"
                              }`}
                            >
                              Payment Verified!
                            </h3>
                            <p className="text-[11px] text-center font-medium text-green-600">
                              Ref:{" "}
                              <span className="font-mono font-bold uppercase select-all tracking-wider">
                                {txnId}
                              </span>
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => submitFinalApplication(txnId)}
                            disabled={submitting}
                            className="w-full bg-[#fa8112] hover:bg-[#e0720f] active:scale-95 text-white font-bold py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:active:scale-100"
                          >
                            {submitting ? (
                              <Loader2 className="animate-spin" size={24} />
                            ) : (
                              <>
                                <CheckCircle2 size={24} />
                                Complete Registration
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="w-full space-y-4">
                          {!orderId ? (
                            <button
                              type="button"
                              onClick={handleInitiateCashfreePayment}
                              disabled={onlinePaymentLoading}
                              className="w-full bg-[#fa8112] hover:bg-[#e0720f] active:scale-95 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:active:scale-100"
                            >
                              {onlinePaymentLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <span className="text-xl">💳</span>
                              )}
                              {onlinePaymentLoading
                                ? "Preparing Gateway..."
                                : "Pay with Cashfree"}
                            </button>
                          ) : (
                            <div className="w-full space-y-4">
                              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2 text-[#fa8112] font-bold text-sm">
                                  <span className="w-2 h-2 rounded-full bg-[#fa8112] animate-pulse"></span>
                                  Awaiting Payment...
                                </div>
                                <p className="text-[10px] text-gray-500 text-center font-mono">
                                  OrderId: {orderId}
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  type="button"
                                  onClick={() => setOrderId(null)}
                                  className="py-3 border border-gray-300 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                                >
                                  Retry
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleVerifyCashfreePayment()}
                                  disabled={verifyLoading}
                                  className="py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                                >
                                  {verifyLoading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    "Verify"
                                  )}
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="pt-6 border-t border-gray-50 flex items-center justify-center gap-6 grayscale opacity-40">
                            <img
                              src="https://www.cashfree.com/wp-content/uploads/2022/10/cashfree-logo.png"
                              className="h-4"
                              alt="Cashfree"
                            />
                            <div className="h-4 w-px bg-gray-200" />
                            <div className="flex gap-2">
                              <span className="text-[9px] font-bold text-gray-400">
                                UPI
                              </span>
                              <span className="text-[9px] font-bold text-gray-400">
                                CARDS
                              </span>
                              <span className="text-[9px] font-bold text-gray-400">
                                NETBANKING
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
  );
}
