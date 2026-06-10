import { User, UploadCloud, Check, Camera, Loader2, X as CloseIcon, Plus, ArrowLeft, ArrowRight, Banknote, CheckCircle2, ScanLine, FileText, ImageIcon, Calendar, RefreshCw } from "lucide-react";
import AyushCardPreview from "../../../admin/AyushCardPreview";
import { useAyushCardForm } from "../AyushCardFormContext.jsx";

export default function Step3Review() {
  const form = useAyushCardForm();
  return <Step3ReviewView {...form} />;
}

function Step3ReviewView(form) {
  const { variant, isOpen, onClose, skipPayment, staffPaymentFlow, onStaffSubmit, onBack, currentStep, setCurrentStep, applicationId, setApplicationId, submissionReceipt, setSubmissionReceipt, toastWarn, toastError, toastSuccess, todayCampId, todayCampName, submitting, setSubmitting, docFront, setDocFront, docBack, setDocBack, docAadhaarBack, setDocAadhaarBack, ocrFileInputRef, aadhaarBackOcrInputRef, docBackInputRef, docBackCameraInputRef, headImageInputRef, headCameraVideoRef, headCameraCanvasRef, paymentInputRef, maxDobForAdult, paymentScreenshot, setPaymentScreenshot, isEditingReview, setIsEditingReview, declarationAccepted, setDeclarationAccepted, paymentMethod, setPaymentMethod, onlinePaymentLoading, setOnlinePaymentLoading, verifyLoading, setVerifyLoading, orderId, setOrderId, txnId, setTxnId, saveError, setSaveError, staffPaymentMode, setStaffPaymentMode, staffCashReceiptImage, setStaffCashReceiptImage, staffCashVideoRef, staffCashCanvasRef, staffCashCameraActive, staffCashCameraLoading, ocrLoading, ocrProgress, backOcrLoading, backOcrProgress, videoRef, canvasRef, cameraActive, aadhaarBackVideoRef, aadhaarBackCanvasRef, aadhaarBackCameraActive, docBackVideoRef, docBackCanvasRef, docBackCameraActive, docBackCameraLoading, headImage, setHeadImage, headCameraActive, headCameraPermissionDenied, familyHead, setFamilyHead, headPhoneDuplicate, headAadhaarDuplicate, headNameDuplicate, members, setMembers, activeMemberTab, setActiveMemberTab, memberScanningIndex, memberScanProgress, memberOcrLoading, memberVideoRef, memberCanvasRef, memberCameraActive, memberInputRef, addMemberScrollAnchorRef, successStep, totalMembersCount, estimatedFee, extraMembersBeyondIncluded, stepperSteps, stepperProgressPct, footerStepMax, stopStaffCashCamera, handleRawBtPrint, resetForm, handleStaffChooseOfflineCash, handleStaffChooseOnline, handleAadhaarBackScanImage, handleScanImage, handleHeadChange, handleMemberChange, handleDocumentUpload, handleHeadImageUpload, handlePaymentScreenshotUpload, handleMemberScanImage, submitFinalApplication, buildStaffHealthCardPayload, submitStaffApplication, handleInitiateCashfreePayment, handleVerifyCashfreePayment, handleNext, handleBack, cardPreviewData, renderHeadDuplicateHint, thermalPaymentLabel, thermalPaymentRef, hasPrintableReceipt, captureHeadPhoto, stopHeadCamera, startHeadCamera, startCamera, stopCamera, capturePhoto, startAadhaarBackCamera, stopAadhaarBackCamera, captureAadhaarBackPhoto, startDocBackCamera, stopDocBackCamera, captureDocBackPhoto, addMember, removeMember, startMemberCamera, stopMemberCamera, captureMemberPhoto, captureStaffCashReceipt, setHeadCameraActive, setHeadCameraPermissionDenied, setMemberScanningIndex, setMemberScanProgress, setMemberOcrLoading, setMemberCameraActive, setStaffCashCameraLoading, setOcrLoading, setOcrProgress, setBackOcrLoading, setBackOcrProgress, setCameraActive, setAadhaarBackCameraActive, setDocBackCameraLoading, setDocBackCameraActive } = form;
  return (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    {/* Card Preview Section */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
                      <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200">
                        <h4 className="font-bold text-[#222222] text-[15px]">
                          Card Preview
                        </h4>
                      </div>
                      <div className="p-4 sm:p-6 flex items-center justify-center bg-[#fcfcfc]">
                        <div className="w-full max-w-[480px]">
                          <AyushCardPreview
                            data={cardPreviewData}
                            side="front"
                            dummyQr
                          />
                        </div>
                      </div>
                      <div className="p-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-5 gap-4 bg-white">
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase">
                            Head Name
                          </p>
                          <p className="text-[14px] font-bold text-[#222222] truncate">
                            {familyHead.fullName || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase">
                            Aadhaar No
                          </p>
                          <p className="text-[14px] font-bold text-[#222222] truncate">
                            {familyHead.aadhaarNumber || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase">
                            Contact
                          </p>
                          <p className="text-[14px] font-bold text-[#222222] truncate">
                            {familyHead.contactNumber || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase">
                            Members
                          </p>
                          <p className="text-[14px] font-bold text-[#222222]">
                            {totalMembersCount}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-bold text-gray-400 uppercase">
                            Amount
                          </p>
                          <p className="text-[14px] font-bold text-[#fa8112]">
                            ₹{estimatedFee}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#FAF3E1] rounded-lg p-3 px-4 flex items-center gap-3 border-l-4 border-[#FA8112] mb-2">
                      <User size={20} className="text-[#222222]" />
                      <h3 className="font-semibold text-[#222222]">
                        Review Your Application
                      </h3>
                    </div>
                    <p className="text-[14px] text-gray-500 mb-6">
                      Please verify all details before final submission
                    </p>

                    <div className="space-y-4">
                      {/* Head Review Card */}
                      <div className="bg-white p-5 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3">
                            <User size={20} className="text-[#222222]" />
                            <h4 className="text-[16px] font-bold text-[#222222]">
                              Family Head Details
                            </h4>
                          </div>
                          <button
                            onClick={() => setIsEditingReview(!isEditingReview)}
                            className={`text-[14px] font-semibold underline underline-offset-2 transition-colors ${isEditingReview ? "text-green-600 decoration-green-600" : "text-[#222222] decoration-[#222222] hover:text-[#FA8112] hover:decoration-[#FA8112]"}`}
                          >
                            {isEditingReview ? "Done" : "Edit"}
                          </button>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 mb-6 md:overflow-x-auto md:pb-2 md:custom-scrollbar">
                          {/* 1. Family head photo */}
                          <div className="shrink-0 flex flex-col gap-2">
                            <div className="w-full md:w-[240px] h-[150px] bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden group">
                              {headImage ? (
                                <>
                                  <div className="relative w-full h-full group">
                                    <img
                                      src={headImage}
                                      alt="Head"
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const win = window.open();
                                          win.document.write(
                                            `<img src="${headImage}" />`,
                                          );
                                        }}
                                        className="bg-white/90 hover:bg-white text-[#222222] p-1.5 rounded-full shadow-lg transition-all"
                                        title="View Photo"
                                      >
                                        <ScanLine size={16} />
                                      </button>
                                    </div>
                                  </div>
                                  {isEditingReview && (
                                    <button
                                      type="button"
                                      onClick={() => setHeadImage(null)}
                                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                    >
                                      <CloseIcon size={14} />
                                    </button>
                                  )}
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    headImageInputRef.current?.click()
                                  }
                                  className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
                                >
                                  <UploadCloud size={24} className="mb-2" />
                                  <span className="text-xs">Upload Photo</span>
                                </button>
                              )}
                            </div>
                            <div>
                              <p className="text-[14px] font-semibold text-[#222222]">
                                Family Head Photo
                              </p>
                              <p className="text-[12px] text-gray-500">
                                &nbsp;
                              </p>
                            </div>
                          </div>

                          {/* 2. First document (OCR) */}
                          <div className="shrink-0 flex flex-col gap-2">
                            <div className="w-full md:w-[240px] h-[150px] bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden group">
                              {docFront ? (
                                <>
                                  {docFront.url ? (
                                    <div className="relative w-full h-full group">
                                      <img
                                        src={docFront.url}
                                        className="w-full h-full object-cover"
                                        alt="Document"
                                      />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(docFront.url, "_blank");
                                          }}
                                          className="bg-white/90 hover:bg-white text-[#222222] p-1.5 rounded-full shadow-lg transition-all"
                                          title="View Document"
                                        >
                                          <ScanLine size={16} />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-gray-500 flex flex-col items-center">
                                      <FileText size={32} className="mb-2" />
                                      <span className="text-xs truncate w-[140px] text-center">
                                        {docFront.name}
                                      </span>
                                    </div>
                                  )}
                                  {isEditingReview && (
                                    <button
                                      type="button"
                                      onClick={() => setDocFront(null)}
                                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                    >
                                      <CloseIcon size={14} />
                                    </button>
                                  )}
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    ocrFileInputRef.current?.click()
                                  }
                                  className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
                                >
                                  <UploadCloud size={24} className="mb-2" />
                                  <span className="text-xs">Upload document</span>
                                </button>
                              )}
                            </div>
                            <div>
                              <p className="text-[14px] font-semibold text-[#222222]">
                                1st identity document
                              </p>
                              <p className="text-[12px] text-gray-500">
                                Upload with OCR auto-fill
                              </p>
                            </div>
                          </div>

                          {/* 3. Aadhaar back (OCR) */}
                          <div className="shrink-0 flex flex-col gap-2">
                            <div className="w-full md:w-[240px] h-[150px] bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden group">
                              {docAadhaarBack ? (
                                <>
                                  {docAadhaarBack.url ? (
                                    <div className="relative w-full h-full group">
                                      <img
                                        src={docAadhaarBack.url}
                                        className="w-full h-full object-cover"
                                        alt="Aadhaar back"
                                      />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(docAadhaarBack.url, "_blank");
                                          }}
                                          className="bg-white/90 hover:bg-white text-[#222222] p-1.5 rounded-full shadow-lg transition-all"
                                          title="View Document"
                                        >
                                          <ScanLine size={16} />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-gray-500 flex flex-col items-center">
                                      <FileText size={32} className="mb-2" />
                                      <span className="text-xs truncate w-[140px] text-center">
                                        {docAadhaarBack.name}
                                      </span>
                                    </div>
                                  )}
                                  {isEditingReview && (
                                    <button
                                      type="button"
                                      onClick={() => setDocAadhaarBack(null)}
                                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                    >
                                      <CloseIcon size={14} />
                                    </button>
                                  )}
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => aadhaarBackOcrInputRef.current?.click()}
                                  className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
                                >
                                  <UploadCloud size={24} className="mb-2" />
                                  <span className="text-xs">Scan Aadhaar back</span>
                                </button>
                              )}
                            </div>
                            <div>
                              <p className="text-[14px] font-semibold text-[#222222]">
                                Aadhaar back
                              </p>
                              <p className="text-[12px] text-gray-500">
                                Address &amp; pincode OCR
                              </p>
                            </div>
                          </div>

                          {/* 4. Second document (upload) */}
                          <div className="shrink-0 flex flex-col gap-2">
                            <div className="w-full md:w-[240px] h-[150px] bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden group">
                              {docBack ? (
                                <>
                                  {docBack.url ? (
                                    <div className="relative w-full h-full group">
                                      <img
                                        src={docBack.url}
                                        className="w-full h-full object-cover"
                                        alt="Second document"
                                      />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(docBack.url, "_blank");
                                          }}
                                          className="bg-white/90 hover:bg-white text-[#222222] p-1.5 rounded-full shadow-lg transition-all"
                                          title="View Document"
                                        >
                                          <ScanLine size={16} />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-gray-500 flex flex-col items-center">
                                      <FileText size={32} className="mb-2" />
                                      <span className="text-xs truncate w-[140px] text-center">
                                        {docBack.name}
                                      </span>
                                    </div>
                                  )}
                                  {isEditingReview && (
                                    <button
                                      type="button"
                                      onClick={() => setDocBack(null)}
                                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                    >
                                      <CloseIcon size={14} />
                                    </button>
                                  )}
                                </>
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => docBackCameraInputRef.current?.click()}
                                    className="px-3 py-1.5 bg-[#fa8112] text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 shadow-sm hover:bg-[#e47510] transition-all text-xs w-24"
                                  >
                                    <Camera size={12} /> Camera
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => docBackInputRef.current?.click()}
                                    className="px-3 py-1.5 bg-white border border-gray-300 text-gray-600 rounded-lg font-semibold flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-all text-xs w-24"
                                  >
                                    <UploadCloud size={12} /> Gallery
                                  </button>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-[14px] font-semibold text-[#222222]">
                                2nd identity document
                              </p>
                              <p className="text-[12px] text-gray-500">
                                Separate supporting document
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                          <div>
                            <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                              Full Name
                            </p>
                            {isEditingReview ? (
                              <input
                                type="text"
                                name="fullName"
                                value={familyHead.fullName}
                                onChange={handleHeadChange}
                                className="w-full border-b border-gray-300 focus:border-[#fa8112] outline-none py-1 text-[14px] font-semibold text-[#222222]"
                              />
                            ) : (
                              <p className="text-[14px] font-semibold text-[#222222] truncate w-full pr-2">
                                {familyHead.fullName || "—"}
                              </p>
                            )}
                            {renderHeadDuplicateHint(headNameDuplicate, "name")}
                          </div>
                          <div>
                            <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                              Date of Birth
                            </p>
                            {isEditingReview ? (
                              <input
                                type="date"
                                name="dob"
                                value={familyHead.dob}
                                max={maxDobForAdult}
                                onChange={handleHeadChange}
                                className="w-full border-b border-gray-300 focus:border-[#fa8112] outline-none py-1 text-[14px] font-semibold text-[#222222]"
                              />
                            ) : (
                              <p className="text-[14px] font-semibold text-[#222222] truncate w-full pr-2">
                                {familyHead.dob || "YYYY-MM-DD"}
                              </p>
                            )}
                          </div>
                          <div className="sm:col-span-2">
                            <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                              Gender
                            </p>
                            {isEditingReview ? (
                              <select
                                name="gender"
                                value={familyHead.gender}
                                onChange={handleHeadChange}
                                className="w-full border-b border-gray-300 focus:border-[#fa8112] outline-none py-1 text-[14px] font-semibold text-[#222222]"
                              >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            ) : (
                              <p className="text-[14px] font-semibold text-[#222222] truncate w-full pr-2">
                                {familyHead.gender || "—"}
                              </p>
                            )}
                          </div>
                          <div className="sm:col-span-2">
                            <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                              Address
                            </p>
                            {isEditingReview ? (
                              <textarea
                                name="address"
                                value={familyHead.address}
                                onChange={handleHeadChange}
                                rows={2}
                                className="w-full border-b border-gray-300 focus:border-[#fa8112] outline-none py-1 text-[14px] font-semibold text-[#222222] resize-none"
                              />
                            ) : (
                              <p className="text-[14px] font-semibold text-[#222222] w-full pr-2 line-clamp-3">
                                {familyHead.address || "—"}
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                              Pincode
                            </p>
                            {isEditingReview ? (
                              <input
                                type="text"
                                name="pincode"
                                value={familyHead.pincode}
                                onChange={handleHeadChange}
                                className="w-full border-b border-gray-300 focus:border-[#fa8112] outline-none py-1 text-[14px] font-semibold text-[#222222]"
                              />
                            ) : (
                              <p className="text-[14px] font-semibold text-[#222222] truncate w-full pr-2">
                                {familyHead.pincode || "—"}
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                              Contact
                            </p>
                            {isEditingReview ? (
                              <input
                                type="tel"
                                name="contactNumber"
                                value={familyHead.contactNumber}
                                onChange={handleHeadChange}
                                className="w-full border-b border-gray-300 focus:border-[#fa8112] outline-none py-1 text-[14px] font-semibold text-[#222222]"
                              />
                            ) : (
                              <p className="text-[14px] font-semibold text-[#222222] truncate w-full pr-2">
                                {familyHead.contactNumber || "—"}
                              </p>
                            )}
                            {renderHeadDuplicateHint(
                              headPhoneDuplicate,
                              "phone number",
                            )}
                          </div>
                          <div>
                            <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                              Aadhaar Number
                            </p>
                            {isEditingReview ? (
                              <input
                                type="text"
                                name="aadhaarNumber"
                                value={familyHead.aadhaarNumber}
                                onChange={handleHeadChange}
                                className="w-full border-b border-gray-300 focus:border-[#fa8112] outline-none py-1 text-[14px] font-semibold text-[#222222]"
                              />
                            ) : (
                              <p className="text-[14px] font-semibold text-[#222222] truncate w-full pr-2">
                                {familyHead.aadhaarNumber || "—"}
                              </p>
                            )}
                            {renderHeadDuplicateHint(
                              headAadhaarDuplicate,
                              "Aadhaar number",
                            )}
                          </div>
                          <div className="sm:col-span-2">
                            <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                              Email
                            </p>
                            {isEditingReview ? (
                              <input
                                type="email"
                                name="emailAddress"
                                value={familyHead.emailAddress}
                                onChange={handleHeadChange}
                                className="w-full border-b border-gray-300 focus:border-[#fa8112] outline-none py-1 text-[14px] font-semibold text-[#222222]"
                              />
                            ) : (
                              <p className="text-[14px] font-semibold text-[#222222] truncate w-full pr-2">
                                {familyHead.emailAddress || "—"}
                              </p>
                            )}
                          </div>
                        </div>

                        {isEditingReview && (
                          <div className="mt-8 flex justify-center">
                            <button
                              onClick={() => setIsEditingReview(false)}
                              className="bg-[#fa8112] text-white px-8 py-2 rounded-lg font-bold hover:bg-[#e0700d] transition-colors shadow-md"
                            >
                              Save Changes
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Add Member details in Review */}
                      {members.length > 0 && (
                        <div className="bg-white p-5 rounded-xl border border-gray-100 mt-6">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                              <User size={20} className="text-[#222222]" />
                              <h4 className="text-[16px] font-bold text-[#222222]">
                                Members ({members.length})
                              </h4>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {members.map((member, idx) => (
                              <div
                                key={idx}
                                className="bg-white p-4 rounded-xl border border-gray-200"
                              >
                                <h4 className="font-bold text-[#222222] mb-4 pb-2 border-b border-gray-100 uppercase tracking-wider text-[11px]">
                                  Member {idx + 1}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                  <div>
                                    <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                                      Member Name
                                    </p>
                                    {isEditingReview ? (
                                      <input
                                        type="text"
                                        name="fullName"
                                        value={member.fullName}
                                        onChange={(e) =>
                                          handleMemberChange(idx, e)
                                        }
                                        className="w-full border-b border-gray-300 focus:border-[#fa8112] outline-none py-1 text-[14px] font-semibold text-[#222222]"
                                      />
                                    ) : (
                                      <p className="text-[14px] font-semibold text-[#222222] truncate w-full pr-2">
                                        {member.fullName || "—"}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                                      Relation
                                    </p>
                                    {isEditingReview ? (
                                      <select
                                        name="relation"
                                        value={member.relation}
                                        onChange={(e) =>
                                          handleMemberChange(idx, e)
                                        }
                                        className="w-full border-b border-gray-300 focus:border-[#fa8112] outline-none py-1 text-[14px] font-semibold text-[#222222] bg-white"
                                      >
                                        <option value="">
                                          Select Relation
                                        </option>
                                        <option value="Spouse">Spouse</option>
                                        <option value="Son">Son</option>
                                        <option value="Daughter">
                                          Daughter
                                        </option>
                                        <option value="Father">Father</option>
                                        <option value="Mother">Mother</option>
                                        <option value="Brother">Brother</option>
                                        <option value="Sister">Sister</option>
                                        <option value="Other">Other</option>
                                      </select>
                                    ) : (
                                      <p className="text-[14px] font-semibold text-[#222222] truncate w-full pr-2">
                                        {member.relation || "—"}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                                      Age
                                    </p>
                                    {isEditingReview ? (
                                      <input
                                        type="number"
                                        name="age"
                                        value={member.age}
                                        onChange={(e) => {
                                          const val = e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 3);
                                          handleMemberChange(idx, {
                                            target: { name: "age", value: val },
                                          });
                                        }}
                                        className="w-full border-b border-gray-300 focus:border-[#fa8112] outline-none py-1 text-[14px] font-semibold text-[#222222]"
                                      />
                                    ) : (
                                      <p className="text-[14px] font-semibold text-[#222222] truncate w-full pr-2">
                                        {member.age || "—"}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                                      {member.documentType || "Aadhaar"} ID
                                    </p>
                                    {isEditingReview ? (
                                      <input
                                        type="text"
                                        name="documentId"
                                        inputMode={
                                          !member.documentType ||
                                          member.documentType === "Aadhaar"
                                            ? "numeric"
                                            : "text"
                                        }
                                        maxLength={
                                          !member.documentType ||
                                          member.documentType === "Aadhaar"
                                            ? 12
                                            : 20
                                        }
                                        value={member.documentId ?? ""}
                                        onChange={(e) =>
                                          handleMemberChange(idx, e)
                                        }
                                        className="w-full border-b border-gray-300 focus:border-[#fa8112] outline-none py-1 text-[14px] font-semibold text-[#222222]"
                                      />
                                    ) : (
                                      <p className="text-[14px] font-semibold text-[#222222] truncate w-full pr-2">
                                        {!member.documentType ||
                                        member.documentType === "Aadhaar"
                                          ? member.documentId?.replace(
                                              /(\d{4})(?=\d)/g,
                                              "$1 ",
                                            ) || "—"
                                          : member.documentId || "—"}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="mt-6 p-5 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id="declaration-checkbox"
                            className="w-5 h-5 mt-0.5 cursor-pointer accent-[#fa8112]"
                            checked={declarationAccepted}
                            onChange={(e) =>
                              setDeclarationAccepted(e.target.checked)
                            }
                            required
                          />
                          <label
                            htmlFor="declaration-checkbox"
                            className="cursor-pointer flex-1"
                          >
                            <p className="text-[13px] text-blue-800 leading-relaxed">
                              I Declare That all the Information and Documents
                              Provided by Me to the Organization Regarding Me
                              and My Family are True and Correct. If Any Error,
                              Inaccuracy or Misleading Element is Found in this
                              Information in Future, Then it's Full Legal
                              Responsibility Will Be My Personal Responsibility.
                            </p>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
  );
}
