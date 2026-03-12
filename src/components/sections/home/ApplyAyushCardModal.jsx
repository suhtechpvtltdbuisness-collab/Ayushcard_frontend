import React, { useState, useRef } from "react";
import {
  X,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  CheckCircle2,
  User,
  Plus,
  X as CloseIcon,
  Calendar,
  Image as ImageIcon,
  FileText,
  Check,
  ScanLine,
} from "lucide-react";
import { useToast } from "../../ui/Toast";
import apiService from "../../../api/service";
import { Scanner } from '@yudiel/react-qr-scanner';

const ApplyAyushCardModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { toastWarn, toastError } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  // Step 1 State
  const [activeTab, setActiveTab] = useState(null); // 'scan' | 'upload'
  const [docFront, setDocFront] = useState(null);
  const [docBack, setDocBack] = useState(null);
  const docFrontInputRef = useRef(null);
  const docBackInputRef = useRef(null);
  const headImageInputRef = useRef(null);
  const paymentInputRef = useRef(null);

  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [isEditingReview, setIsEditingReview] = useState(false);

  // Step 2 State (Family Head)
  const [headImage, setHeadImage] = useState(null);
  const [familyHead, setFamilyHead] = useState({
    fullName: "",
    dob: "",
    gender: "",
    contactNumber: "",
    aadhaarNumber: "",
    emailAddress: "",
  });

  // Step 3 State (Members)
  const [members, setMembers] = useState([]);
  const [activeMemberTab, setActiveMemberTab] = useState(0); // 0 is head, 1+ is members

  const parseAadhaarQR = (text) => {
    try {
      const isXML = text.includes("<?xml") || text.includes("PrintLetterBarcodeData");
      if (isXML) {
        const uidMatch = text.match(/uid="([^"]+)"/i);
        const nameMatch = text.match(/name="([^"]+)"/i);
        const genderMatch = text.match(/gender="([^"]+)"/i);
        const dobMatch = text.match(/dob="([^"]+)"/i);
        const yobMatch = text.match(/yob="([^"]+)"/i);
        
        let dobStr = dobMatch ? dobMatch[1] : (yobMatch ? `01/01/${yobMatch[1]}` : "");
        if (dobStr && dobStr.includes("/")) {
          const parts = dobStr.split("/");
          if (parts.length === 3) dobStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
        } else if (dobStr && dobStr.includes("-") && dobStr.split("-")[0].length !== 4) {
          const parts = dobStr.split("-");
          if (parts.length === 3) dobStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        
        return {
          uid: uidMatch ? uidMatch[1] : "",
          name: nameMatch ? nameMatch[1] : "",
          gender: genderMatch ? (genderMatch[1] === 'M' ? 'Male' : genderMatch[1] === 'F' ? 'Female' : 'Other') : "",
          dob: dobStr,
        };
      }
    } catch (e) { console.error("Aadhaar parse error", e); }
    return null;
  };

  const handleScan = (result) => {
    if (result && result.length > 0) {
      const raw = result[0].rawValue;
      const parsed = parseAadhaarQR(raw);
      if (parsed) {
        setFamilyHead(prev => ({
          ...prev,
          fullName: parsed.name || prev.fullName,
          aadhaarNumber: parsed.uid || prev.aadhaarNumber,
          gender: parsed.gender || prev.gender,
          dob: parsed.dob || prev.dob
        }));
        
        // Use a generic Aadhaar placeholder if actual image isn't available from QR
        const placeholderUrl = "https://th.bing.com/th/id/OIP.XGvUf3m_7B-E-5_y_XW1OAHaEK?rs=1&pid=ImgDetMain"; 
        
        setDocFront({ 
          name: "Scanned Aadhaar Front.jpg", 
          size: "QR Scanned", 
          url: placeholderUrl 
        });
        setDocBack({ 
          name: "Scanned Aadhaar Back.jpg", 
          size: "QR Scanned", 
          url: placeholderUrl 
        });
        
        toastWarn("Aadhaar details scanned and autofilled!");
        setActiveTab("upload"); // Shift to upload so user sees the checkmarks
      } else {
        toastError("Unsupported QR or Not Aadhaar. Please input manually.");
        setActiveTab("upload");
      }
    }
  };

  const handleHeadChange = (e) => {
    let { name, value } = e.target;

    // Validations
    if (name === "fullName") value = value.replace(/[0-9]/g, "");
    if (name === "contactNumber") value = value.replace(/\D/g, "").slice(0, 10);
    if (name === "aadhaarNumber") value = value.replace(/\D/g, "").slice(0, 12);

    setFamilyHead((prev) => ({ ...prev, [name]: value }));
  };

  const handleMemberChange = (index, e) => {
    let { name, value } = e.target;

    // Validations
    if (name === "fullName") value = value.replace(/[0-9]/g, "");
    if (name === "contactNumber") value = value.replace(/\D/g, "").slice(0, 10);
    if (name === "aadhaarNumber") value = value.replace(/\D/g, "").slice(0, 12);

    const updatedMembers = [...members];
    updatedMembers[index][name] = value;
    setMembers(updatedMembers);
  };

  const handleDocumentUpload = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      const fileData = {
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        url: URL.createObjectURL(file), // Store URL for preview
      };
      if (side === "front") setDocFront(fileData);
      else setDocBack(fileData);
    }
  };

  const handleHeadImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setHeadImage(imageUrl);
    }
  };

  const handlePaymentScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentScreenshot({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        url: URL.createObjectURL(file),
      });
    }
  };

  const addMember = () => {
    if (members.length + 1 >= 7) return; // Max 7 including head
    setMembers([
      ...members,
      {
        fullName: "",
        dob: "",
        gender: "",
        contactNumber: "",
        aadhaarNumber: "",
        emailAddress: "",
      },
    ]);
    setActiveMemberTab(members.length + 1); // Switch to newly created member
  };

  const removeMember = (indexToRemove) => {
    // If we remove a member, we need to adjust the active tab
    const updatedMembers = members.filter((_, i) => i !== indexToRemove);
    setMembers(updatedMembers);

    // If we closed the currently active member tab, switch back to head
    if (activeMemberTab === indexToRemove + 1) {
      setActiveMemberTab(0);
    } else if (activeMemberTab > indexToRemove + 1) {
      // Shift active tab left if we removed a tab before it
      setActiveMemberTab(activeMemberTab - 1);
    }
  };

  const handleNext = async () => {
    // Step 1 validation: Must have uploaded a document AND filled basic details
    if (currentStep === 1) {
      if (!docFront || !docBack) {
        toastWarn("Please upload both front and back sides of the identity document.");
        return;
      }
      if (!headImage) {
        toastWarn("Please upload the family head photo.");
        return;
      }
      const fg = familyHead;
      if (
        !fg.fullName ||
        !fg.dob ||
        !fg.gender ||
        !fg.contactNumber ||
        !fg.aadhaarNumber ||
        !fg.emailAddress
      ) {
        toastWarn("Please fill all the family head details.");
        return;
      }
      if (fg.contactNumber.length < 10) {
        toastWarn("Please enter a valid 10 digit contact number.");
        return;
      }
      if (fg.aadhaarNumber.length < 12) {
        toastWarn("Please enter a valid 12 digit aadhaar number.");
        return;
      }

      // Logic to auto redirect to Member 1 on Step 3 if we add a member
      if (members.length > 0) {
        setActiveMemberTab(1);
      } else {
        setActiveMemberTab(0);
      }
    }

    // Step 2 validation: All members details if added
    if (currentStep === 2) {
      for (let i = 0; i < members.length; i++) {
        const p = members[i];
        if (
          !p.fullName ||
          !p.dob ||
          !p.gender ||
          !p.contactNumber ||
          !p.aadhaarNumber ||
          !p.emailAddress
        ) {
          toastWarn(`Please fill all details for Member ${i + 1}`);
          return;
        }
        if (p.contactNumber.length < 10) {
          toastWarn(`Please enter a valid 10 digit contact number for Member ${i + 1}`);
          return;
        }
        if (p.aadhaarNumber.length < 12) {
          toastWarn(`Please enter a valid 12 digit aadhaar number for Member ${i + 1}`);
          return;
        }
      }
    }

    // Step 4: validate + submit to API
    if (currentStep === 4) {
      if (!paymentScreenshot) {
        toastWarn("Please upload the payment screenshot before continuing.");
        return;
      }

      // Build the API payload
      const today = new Date().toISOString().split('T')[0];
      const cardExpiry = new Date();
      cardExpiry.setFullYear(cardExpiry.getFullYear() + 1);
      const cardExpiryDate = cardExpiry.toISOString().split('T')[0];

      // Split fullName into firstName / middleName / lastName
      const nameParts = familyHead.fullName.trim().split(' ').filter(Boolean);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
      const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

      const payload = {
        applicationDate: today,
        status: 'pending',
        firstName,
        middleName,
        lastName,
        contact: familyHead.contactNumber,
        alternateContact: '',
        email: familyHead.emailAddress,
        relation: 'Self',
        relatedPerson: familyHead.fullName,
        cardIssueDate: today,
        cardExpiredDate: cardExpiryDate,
        verificationDate: today,
        totalMember: 1 + members.length,
        totalAmount: estimatedFee,
        documents: [
          docFront && {
            filename: docFront.name,
            originalName: docFront.name,
            path: docFront.url || `/uploads/${docFront.name}`,
            size: 0,
            mimetype: 'image/jpeg',
            type: 'aadhaar_front',
            uploadedAt: new Date().toISOString(),
          },
          docBack && {
            filename: docBack.name,
            originalName: docBack.name,
            path: docBack.url || `/uploads/${docBack.name}`,
            size: 0,
            mimetype: 'image/jpeg',
            type: 'aadhaar_back',
            uploadedAt: new Date().toISOString(),
          },
          headImage && {
            filename: 'family_head_photo.jpg',
            originalName: 'family_head_photo.jpg',
            path: headImage, // This is the base64/blob URL
            size: 0,
            mimetype: 'image/jpeg',
            type: 'profile_photo',
            uploadedAt: new Date().toISOString(),
          }
        ].filter(Boolean),
        isPrint: false,
        members: members.map((m) => {
          const mParts = m.fullName.trim().split(' ').filter(Boolean);
          return {
            name: m.fullName,
            relation: 'Family Member',
            age: m.dob
              ? Math.floor((Date.now() - new Date(m.dob).getTime()) / (1000 * 60 * 60 * 24 * 365))
              : 0,
          };
        }),
        payment: {
          transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`,
          method: 'online',
          totalAmount: estimatedFee,
          date: new Date().toISOString(),
        },
      };

      try {
        setSubmitting(true);
        const res = await apiService.submitCardApplication(payload);
        // Try to extract the applicationId from various response shapes
        const appId =
          res?.applicationId ||
          res?.data?.applicationId ||
          res?.cardUser?.applicationId ||
          res?.data?.cardUser?.applicationId ||
          res?._id ||
          res?.data?._id ||
          null;
        setApplicationId(appId);
        setCurrentStep(5);
        document.querySelector('.custom-scrollbar')?.scrollTo(0, 0);
      } catch (err) {
        console.error('Card application submission error:', err);
        toastError(
          err.response?.data?.message ||
          err.message ||
          'Failed to submit application. Please try again.'
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      // Scroll to top of modal manually if needed
      document.querySelector(".custom-scrollbar")?.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (!isOpen) return null;

  const totalMembersCount = 1 + members.length;
  const estimatedFee = 120 + members.length * 10; // dummy calculation

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 px-4"
      style={{ fontFamily: "Quicksand, sans-serif" }}
    >
      <div
        className="bg-white w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 relative rounded-xl"
        style={{ fontFamily: "'Quicksand', sans-serif" }}
      >
        {/* Header Section */}
        <div className="flex justify-between items-center px-3 py-2 bg-[#F5F5F5] shrink-0">
          <div className="flex items-center gap-4 w-full">
            <div className="flex items-center justify-center shrink-0">
              <img
                src="/logo_whitebg.svg"
                alt="BKBS Trust"
                className="h-20 w-20"
              />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-[20px] font-semibold text-[#222222]">
                Apply for Ayush Card
              </h3>
              <h2 className="text-[16px] font-medium text-[#757575] tracking-wide mt-0.5">
                Health Card for You & Your Family — INR 100 to INR 500 per
                family
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors text-[#222222] shrink-0 border border-[#222222]"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Hidden File Inputs */}
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          ref={docFrontInputRef}
          className="hidden"
          onChange={(e) => handleDocumentUpload(e, "front")}
        />
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          ref={docBackInputRef}
          className="hidden"
          onChange={(e) => handleDocumentUpload(e, "back")}
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

        {currentStep < 5 ? (
          <>
            {/* <div className="text-center py-4 relative bg-white shrink-0">
              <h2 className="text-2xl font-semibold text-[#222222] inline-block relative pb-2">
                New Card Registration
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#fa8112] rounded-full"></span>
              </h2>
            </div> */}

            {/* Stepper */}
            <div className="px-8 py-3 flex justify-center bg-white shrink-0">
              <div className="flex items-center max-w-xl w-full justify-between relative py-2">
                {/* Step lines background */}
                <div className="absolute top-[35%] left-[15%] w-[70%] h-[2px] bg-[#f7e5bc] -z-10"></div>
                <div
                  className="absolute top-[35%] left-[15%] h-[2px] bg-[#fa8112] -z-10 transition-all duration-500"
                  style={{ width: `${(currentStep - 1) * 33.33}%` }}
                ></div>

                {[
                  { num: 1, label: "Add Family Head" },
                  { num: 2, label: "Add Members" },
                  { num: 3, label: "Review" },
                  { num: 4, label: "Payment" },
                ].map((step) => (
                  <div
                    key={step.num}
                    className="flex flex-col items-center bg-white relative z-10 w-[85px]"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold mb-2 transition-colors ${
                        currentStep === step.num
                          ? "bg-[#fa8112] text-white"
                          : currentStep > step.num
                            ? "bg-[#fa8112] text-white"
                            : "border-2 border-[#f7e5bc] text-[#222222] bg-white"
                      }`}
                    >
                      {currentStep > step.num ? (
                        <Check size={20} strokeWidth={3} />
                      ) : (
                        `0${step.num}`
                      )}
                    </div>
                    <span
                      className={`text-[11px] md:text-[13px] text-center max-w-[70px] md:max-w-none leading-tight md:whitespace-nowrap mt-1 md:mt-0 ${
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

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto px-8 pb-8 pt-2 custom-scrollbar">
              {/* STEP 1: ADD FAMILY HEAD */}
              {currentStep === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-[#FAF3E1] rounded-lg p-3 px-4 flex items-center gap-3 border-l-4 border-[#FA8112] mb-5">
                    <User size={20} className="text-[#222222]" />
                    <h3 className="font-medium text-[#222222]">
                      Family Head Details
                    </h3>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-[16px] font-bold text-[#222222] mb-1">
                      Upload Identity Document
                    </h3>
                    <p className="text-[#666666] text-[15px]">
                      Please upload or scan an identity document of the family
                      head(Aadhar, PAN,etc.)
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 mb-6 relative w-full items-center justify-center">
                    {activeTab === "scan" ? (
                      <div className="w-full flex flex-col items-center justify-center p-6 rounded-xl border border-[#fa8112] bg-[#faf3e1]">
                        <h4 className="font-semibold text-[16px] text-[#222222] mb-4 text-center">
                          Scan Aadhaar QR Code
                        </h4>
                        <div className="w-full max-w-sm rounded-[14px] overflow-hidden border-4 border-white shadow-sm bg-black mb-4 aspect-square flex items-center justify-center relative">
                          <Scanner 
                             onScan={handleScan}
                             formats={['qr_code']}
                          />
                        </div>
                        <p className="text-[12px] text-gray-500 text-center mb-4">
                          Point your camera at the QR code on the back of your Aadhaar card.
                        </p>
                        <button
                          onClick={() => setActiveTab(null)}
                          className="px-6 py-2 border border-[#FA8112] text-[#FA8112] font-semibold rounded-lg bg-white hover:bg-orange-50 transition-colors"
                        >
                          Cancel Scanning
                        </button>
                      </div>
                    ) : activeTab === "upload" ? (
                      <div className="w-full border-2 border-[#fa8112] bg-[#faf3e1] p-6 rounded-xl">
                        <h4 className="font-semibold text-[16px] text-[#222222] mb-4 text-center">
                           Upload Document (JPG/PNG)
                        </h4>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              docFrontInputRef.current?.click();
                            }}
                            className={`flex-1 flex flex-col items-center justify-center py-6 px-4 rounded-xl transition-all shadow-sm ${
                              docFront
                                ? "bg-white border-2 border-green-500"
                                : "bg-white border hover:border-[#fa8112]"
                            }`}
                          >
                            <div className={`w-10 h-10 ${docFront ? "bg-green-500" : "bg-[#fa8112]"} rounded-full flex items-center justify-center text-white mb-3`}>
                              {docFront ? <Check size={20} className="text-white" /> : <UploadCloud size={20} />}
                            </div>
                            <span className="text-[14px] font-semibold text-[#222222]">Front Side</span>
                            <span className="text-[12px] text-gray-500 truncate w-full px-1 text-center max-w-[150px] mt-1">
                              {docFront ? docFront.name : "Choose File"}
                            </span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              docBackInputRef.current?.click();
                            }}
                            className={`flex-1 flex flex-col items-center justify-center py-6 px-4 rounded-xl transition-all shadow-sm ${
                              docBack
                                ? "bg-white border-2 border-green-500"
                                : "bg-white border hover:border-[#fa8112]"
                            }`}
                          >
                            <div className={`w-10 h-10 ${docBack ? "bg-green-500" : "bg-[#fa8112]"} rounded-full flex items-center justify-center text-white mb-3`}>
                              {docBack ? <Check size={20} className="text-white" /> : <UploadCloud size={20} />}
                            </div>
                            <span className="text-[14px] font-semibold text-[#222222]">Back Side</span>
                            <span className="text-[12px] text-gray-500 truncate w-full px-1 text-center max-w-[150px] mt-1">
                              {docBack ? docBack.name : "Choose File"}
                            </span>
                          </button>
                        </div>
                        <div className="flex justify-center mt-6">
                           <button onClick={() => setActiveTab(null)} className="text-sm text-gray-500 hover:text-black font-semibold underline">Go Back</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row w-full gap-4 relative justify-center items-stretch">
                        <button
                          onClick={() => setActiveTab("scan")}
                          className="flex-1 flex flex-col items-center justify-center py-8 px-6 rounded-xl border-gray-200 border bg-white hover:border-[#fa8112] hover:bg-orange-50 cursor-pointer shadow-sm transition-all"
                        >
                          <div className="w-[50px] h-[50px] bg-[#fa8112] rounded-[16px] flex items-center justify-center text-white mb-4 shadow text-center">
                            <ScanLine size={24} strokeWidth={2.5} />
                          </div>
                          <h4 className="font-bold text-[16px] text-[#222222] mb-1">
                            Scan Aadhaar QR
                          </h4>
                          <p className="text-[13px] text-gray-500 text-center">
                            Scan using camera to auto-fill details <br/>(Replaces manual upload)
                          </p>
                        </button>

                        <div className="flex items-center justify-center font-bold text-gray-400 text-sm py-2 sm:py-0">
                          OR
                        </div>

                        <button
                          onClick={() => setActiveTab("upload")}
                          className="flex-1 flex flex-col items-center justify-center py-8 px-6 rounded-xl border-gray-200 border bg-white hover:border-[#fa8112] hover:bg-orange-50 cursor-pointer shadow-sm transition-all"
                        >
                          <div className="w-[50px] h-[50px] bg-[#fa8112] rounded-[16px] flex items-center justify-center text-white mb-4 shadow text-center">
                            <UploadCloud size={24} strokeWidth={2.5} />
                          </div>
                          <h4 className="font-bold text-[16px] text-[#222222] mb-1">
                            Upload Manually
                          </h4>
                          <p className="text-[13px] text-gray-500 text-center">
                            Upload PNG/JPG of Identity Proof
                          </p>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center mt-6 mb-8 w-full max-w-md mx-auto">
                    {!headImage ? (
                      <div
                        className="border border-dashed border-gray-300 bg-white rounded-xl py-6 px-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors w-[200px]"
                        onClick={() => headImageInputRef.current?.click()}
                      >
                        <UploadCloud
                          className="text-[#a4a4a4] mb-2"
                          size={24}
                        />
                        <p className="text-[13px] text-[#666666] leading-tight font-medium">
                          Upload family
                          <br />
                          head image
                        </p>
                        <p className="text-[10px] text-[#A3A3A3] mt-2">
                          Drag & Drop Or
                          <br />
                          Click To Browse
                        </p>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={headImage}
                          alt="Head"
                          className="w-24 h-24 rounded-full object-cover border-4 border-[#faf3e1]"
                        />
                        <button
                          className="absolute -top-2 -right-2 bg-white border border-gray-200 text-gray-600 rounded-full p-1 shadow-sm hover:bg-gray-100"
                          onClick={() => setHeadImage(null)}
                        >
                          <CloseIcon size={14} />
                        </button>
                      </div>
                    )}
                    <p className="text-[13px] font-medium text-[#222222] mt-2">
                      Family Head Photo
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <label className="text-[14px] text-[#222222] font-medium mb-1 block font-inter">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={familyHead.fullName}
                        onChange={handleHeadChange}
                        placeholder="As per identity document"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-[#FA8112] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[14px] text-[#222222] font-medium mb-1 block font-inter">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          name="dob"
                          value={familyHead.dob}
                          onChange={handleHeadChange}
                          style={{ fontFamily: "'Inter', sans-serif" }}
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-[#FA8112] transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[14px] text-[#222222] font-medium mb-1 block font-inter">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={familyHead.gender}
                        onChange={handleHeadChange}
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-[#FA8112] transition-colors appearance-none bg-white"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[14px] text-[#222222] font-medium mb-1 block font-inter">
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        name="contactNumber"
                        value={familyHead.contactNumber}
                        onChange={handleHeadChange}
                        placeholder="Enter contact no."
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-[#FA8112] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[14px] text-[#222222] font-medium mb-1 block font-inter">
                        Aadhaar Number
                      </label>
                      <input
                        type="text"
                        name="aadhaarNumber"
                        value={familyHead.aadhaarNumber}
                        onChange={handleHeadChange}
                        placeholder="Select aadhaar no."
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-[#FA8112] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[14px] text-[#222222] font-medium mb-1 block font-inter">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="emailAddress"
                        value={familyHead.emailAddress}
                        onChange={handleHeadChange}
                        placeholder="Enter email"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-[#FA8112] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: MEMBERS */}
              {currentStep === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <p className="text-[14px] text-gray-500 mb-4">
                    Family Head + Additional Members{" "}
                    <span className="font-bold text-[#222222]">
                      {totalMembersCount}/7
                    </span>{" "}
                    (Max 7 including family head)
                  </p>

                  {/* Tabs */}
                  <div className="flex flex-wrap gap-3 mb-5">
                    <button
                      onClick={() => setActiveMemberTab(0)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all text-[15px] font-medium ${
                        activeMemberTab === 0
                          ? "border-gray-300 text-gray-800 bg-gray-50"
                          : "border-gray-200 text-[#666666] hover:bg-gray-50 bg-white"
                      }`}
                    >
                      Family Head
                    </button>

                    {members.map((member, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveMemberTab(idx + 1)}
                        className={`group flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all text-[15px] font-medium relative ${
                          activeMemberTab === idx + 1
                            ? "border-[#FA8112] text-[#FA8112] bg-[#FA8112]/5"
                            : "border-gray-200 text-[#FA8112] hover:bg-[#FA8112]/5"
                        }`}
                      >
                        <User size={18} />
                        {member.fullName || `Member ${idx + 1}`}

                        {/* Cut Icon always visible as per design */}
                        <div
                          className={`ml-1 flex items-center justify-center rounded-full p-0.5 transition-colors ${
                            activeMemberTab === idx + 1
                              ? "bg-red-50 text-red-500 border border-red-200 hover:bg-red-100"
                              : "text-[#A0AAB4] hover:text-red-500"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMember(idx);
                          }}
                        >
                          <CloseIcon size={14} strokeWidth={2.5} />
                        </div>
                      </button>
                    ))}

                    {totalMembersCount < 8 && (
                      <button
                        onClick={addMember}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-dashed border-[#A0AAB4] text-[#666666] hover:text-[#FA8112] hover:border-[#FA8112] hover:bg-[#FA8112]/5 transition-all text-[15px] font-medium"
                      >
                        <Plus size={18} />
                        Add Member
                      </button>
                    )}
                  </div>

                  {/* Form Content Based on Tab */}
                  <div className="bg-[#FAF3E1] rounded-lg p-3 px-4 flex items-center gap-3 border-l-4 border-[#FA8112] mb-5">
                    <User size={20} className="text-[#222222]" />
                    <h3 className="font-semibold text-[#222222]">
                      {activeMemberTab === 0
                        ? "Family Head Details"
                        : `Member ${activeMemberTab} Details`}
                    </h3>
                  </div>

                  {activeMemberTab === 0 ? (
                    /* Display Head Details inside Step 3 (Editable or just reflecting) */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 opacity-90">
                      <div>
                        <label className="text-[14px] text-[#222222] font-medium mb-1 block font-inter">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={familyHead.fullName}
                          onChange={handleHeadChange}
                          placeholder="As per identity document"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-[#FA8112]"
                        />
                      </div>
                      <div>
                        <label className="text-[14px] text-[#222222] font-medium mb-1 block font-inter">
                          Date of Birth
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            name="dob"
                            value={familyHead.dob}
                            onChange={handleHeadChange}
                            style={{ fontFamily: "'Inter', sans-serif" }}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-[#FA8112]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[14px] text-[#222222] font-medium mb-1 block font-inter">
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={familyHead.gender}
                          onChange={handleHeadChange}
                          style={{ fontFamily: "'Inter', sans-serif" }}
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-[#FA8112] appearance-none bg-white"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[14px] text-[#222222] font-medium mb-1 block font-inter">
                          Contact Number
                        </label>
                        <input
                          type="tel"
                          name="contactNumber"
                          value={familyHead.contactNumber}
                          onChange={handleHeadChange}
                          placeholder="Enter contact no."
                          style={{ fontFamily: "'Inter', sans-serif" }}
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-[#FA8112]"
                        />
                      </div>
                      <div>
                        <label className="text-[14px] text-[#222222] font-medium mb-1 block font-inter">
                          Aadhaar Number
                        </label>
                        <input
                          type="text"
                          name="aadhaarNumber"
                          value={familyHead.aadhaarNumber}
                          onChange={handleHeadChange}
                          placeholder="Select aadhaar no."
                          style={{ fontFamily: "'Inter', sans-serif" }}
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-[#FA8112]"
                        />
                      </div>
                      <div>
                        <label className="text-[14px] text-[#222222] font-medium mb-1 block font-inter">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="emailAddress"
                          value={familyHead.emailAddress}
                          onChange={handleHeadChange}
                          placeholder="Enter email"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-[#FA8112]"
                        />
                      </div>
                    </div>
                  ) : (
                    /* Display Active Member Fields */
                    <div
                      className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3"
                      key={`member-${activeMemberTab}`}
                    >
                      <div>
                        <label className="text-[14px] text-[#222222] font-medium mb-1 block font-inter">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={members[activeMemberTab - 1].fullName}
                          onChange={(e) =>
                            handleMemberChange(activeMemberTab - 1, e)
                          }
                          placeholder="As per identity document"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-[#FA8112]"
                        />
                      </div>
                      <div>
                        <label className="text-[14px] text-[#222222] font-medium mb-1 block font-inter">
                          Date of Birth
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            name="dob"
                            value={members[activeMemberTab - 1]?.dob || ""}
                            onChange={(e) =>
                              handleMemberChange(activeMemberTab - 1, e)
                            }
                            style={{ fontFamily: "'Inter', sans-serif" }}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-[#FA8112]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[14px] text-[#222222] font-medium mb-1 block font-inter">
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={members[activeMemberTab - 1].gender}
                          onChange={(e) =>
                            handleMemberChange(activeMemberTab - 1, e)
                          }
                          style={{ fontFamily: "'Inter', sans-serif" }}
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-[#FA8112] appearance-none bg-white"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[14px] text-[#222222] font-medium mb-1 block font-inter">
                          Contact Number
                        </label>
                        <input
                          type="tel"
                          name="contactNumber"
                          value={members[activeMemberTab - 1].contactNumber}
                          onChange={(e) =>
                            handleMemberChange(activeMemberTab - 1, e)
                          }
                          placeholder="Enter contact no."
                          style={{ fontFamily: "'Inter', sans-serif" }}
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-[#FA8112]"
                        />
                      </div>
                      <div>
                        <label className="text-[14px] text-[#222222] font-medium mb-1 block font-inter">
                          Aadhaar Number
                        </label>
                        <input
                          type="text"
                          name="aadhaarNumber"
                          value={members[activeMemberTab - 1].aadhaarNumber}
                          onChange={(e) =>
                            handleMemberChange(activeMemberTab - 1, e)
                          }
                          placeholder="Select aadhaar no."
                          style={{ fontFamily: "'Inter', sans-serif" }}
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-[#FA8112]"
                        />
                      </div>
                      <div>
                        <label className="text-[14px] text-[#222222] font-medium mb-1 block font-inter">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="emailAddress"
                          value={members[activeMemberTab - 1].emailAddress}
                          onChange={(e) =>
                            handleMemberChange(activeMemberTab - 1, e)
                          }
                          placeholder="Enter email"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-[#FA8112]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: REVIEW */}
              {currentStep === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
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
                        <div className="shrink-0 flex flex-col gap-2">
                          <div className="w-full md:w-[240px] h-[150px] bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden group">
                            {docFront ? (
                              <>
                                {docFront.url ? (
                                  <img
                                    src={docFront.url}
                                    className="w-full h-full object-cover"
                                    alt="Front"
                                  />
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
                                    onClick={() => setDocFront(null)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                  >
                                    <CloseIcon size={14} />
                                  </button>
                                )}
                              </>
                            ) : (
                              <button
                                onClick={() =>
                                  docFrontInputRef.current?.click()
                                }
                                className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
                              >
                                <UploadCloud size={24} className="mb-2" />
                                <span className="text-xs">
                                  Upload Front Side
                                </span>
                              </button>
                            )}
                          </div>
                          <div>
                            <p className="text-[14px] font-semibold text-[#222222]">
                              Document
                            </p>
                            <p className="text-[12px] text-gray-500">
                              Aadhar Card Front side
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 flex flex-col gap-2">
                          <div className="w-full md:w-[240px] h-[150px] bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden group">
                            {docBack ? (
                              <>
                                {docBack.url ? (
                                  <img
                                    src={docBack.url}
                                    className="w-full h-full object-cover"
                                    alt="Back"
                                  />
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
                                    onClick={() => setDocBack(null)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                  >
                                    <CloseIcon size={14} />
                                  </button>
                                )}
                              </>
                            ) : (
                              <button
                                onClick={() => docBackInputRef.current?.click()}
                                className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
                              >
                                <UploadCloud size={24} className="mb-2" />
                                <span className="text-xs">
                                  Upload Back Side
                                </span>
                              </button>
                            )}
                          </div>
                          <div>
                            <p className="text-[14px] font-semibold text-[#222222]">
                              Document
                            </p>
                            <p className="text-[12px] text-gray-500">
                              Aadhar Card Back side
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 flex flex-col gap-2">
                          <div className="w-full md:w-[240px] h-[150px] bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden group">
                            {headImage ? (
                              <>
                                <img
                                  src={headImage}
                                  alt="Head"
                                  className="w-full h-full object-cover"
                                />
                                {isEditingReview && (
                                  <button
                                    onClick={() => setHeadImage(null)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                  >
                                    <CloseIcon size={14} />
                                  </button>
                                )}
                              </>
                            ) : (
                              <button
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
                            <p className="text-[12px] text-gray-500">&nbsp;</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-6">
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
                              onChange={handleHeadChange}
                              className="w-full border-b border-gray-300 focus:border-[#fa8112] outline-none py-1 text-[14px] font-semibold text-[#222222]"
                            />
                          ) : (
                            <p className="text-[14px] font-semibold text-[#222222] truncate w-full pr-2">
                              {familyHead.dob || "YYYY-MM-DD"}
                            </p>
                          )}
                        </div>
                        <div>
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
                              {familyHead.gender || "Not specified"}
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
                              {familyHead.contactNumber || "Not provided"}
                            </p>
                          )}
                        </div>
                        <div>
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
                              {familyHead.emailAddress || "Not provided"}
                            </p>
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
                              {familyHead.aadhaarNumber || "XXXX XXXX XXXX"}
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
                              <div className="grid grid-cols-2 gap-y-6">
                                <div>
                                  <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                                    Full Name
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
                                    Date of Birth
                                  </p>
                                  {isEditingReview ? (
                                    <input
                                      type="date"
                                      name="dob"
                                      value={member.dob}
                                      onChange={(e) =>
                                        handleMemberChange(idx, e)
                                      }
                                      className="w-full border-b border-gray-300 focus:border-[#fa8112] outline-none py-1 text-[14px] font-semibold text-[#222222]"
                                    />
                                  ) : (
                                    <p className="text-[14px] font-semibold text-[#222222] truncate w-full pr-2">
                                      {member.dob || "—"}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                                    Gender
                                  </p>
                                  {isEditingReview ? (
                                    <select
                                      name="gender"
                                      value={member.gender}
                                      onChange={(e) =>
                                        handleMemberChange(idx, e)
                                      }
                                      className="w-full border-b border-gray-300 focus:border-[#fa8112] outline-none py-1 text-[14px] font-semibold text-[#222222]"
                                    >
                                      <option value="">Select Gender</option>
                                      <option value="Male">Male</option>
                                      <option value="Female">Female</option>
                                      <option value="Other">Other</option>
                                    </select>
                                  ) : (
                                    <p className="text-[14px] font-semibold text-[#222222] truncate w-full pr-2">
                                      {member.gender || "—"}
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
                                      value={member.contactNumber}
                                      onChange={(e) =>
                                        handleMemberChange(idx, e)
                                      }
                                      className="w-full border-b border-gray-300 focus:border-[#fa8112] outline-none py-1 text-[14px] font-semibold text-[#222222]"
                                    />
                                  ) : (
                                    <p className="text-[14px] font-semibold text-[#222222] truncate w-full pr-2">
                                      {member.contactNumber || "—"}
                                    </p>
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
                                      value={member.aadhaarNumber}
                                      onChange={(e) =>
                                        handleMemberChange(idx, e)
                                      }
                                      className="w-full border-b border-gray-300 focus:border-[#fa8112] outline-none py-1 text-[14px] font-semibold text-[#222222]"
                                    />
                                  ) : (
                                    <p className="text-[14px] font-semibold text-[#222222] truncate w-full pr-2">
                                      {member.aadhaarNumber || "—"}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center text-gray-500 text-xs">
                          i
                        </div>
                        <h4 className="text-[15px] font-semibold text-[#222222]">
                          Note
                        </h4>
                      </div>
                      <p className="text-[12px] text-gray-500">
                        Health card fees : 120 for Family Head and 10/- for each
                        other family member added
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {/* STEP 4: PAYMENT */}
              {currentStep === 4 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-[#FAF3E1] rounded-lg p-3 px-4 flex items-center gap-3 border-l-4 border-[#FA8112] mb-6">
                    <User size={20} className="text-[#222222]" />
                    <h3 className="font-semibold text-[#222222]">
                      Make Payment
                    </h3>
                  </div>
                  <p className="text-[14px] text-gray-500 mb-8">
                    Please pay the amount to submit your application
                  </p>

                  <div className="flex flex-col items-center justify-center">
                    <div className="w-[300px] h-fit bg-gray-200 rounded-xl mb-6 overflow-hidden">
                      <img
                        src="/Payment_QR.png"
                        alt="QR Code placeholder"
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    </div>

                    <h2 className="text-4xl font-semibold text-[#222222] mb-6">
                      Pay ₹{estimatedFee}.00
                    </h2>

                    <h3 className="text-[20px] font-bold text-[#222222] mb-2">
                      Scan this QR Code for payment
                    </h3>
                    <p className="text-[14px] text-gray-500 mb-6">
                      Once done upload the screenshot of the payment below.
                    </p>

                    {!paymentScreenshot ? (
                      <button
                        onClick={() => paymentInputRef.current?.click()}
                        className="w-full max-w-xl flex flex-col items-center justify-center py-6 px-4 rounded-xl transition-all duration-300 border border-[#fa8112] hover:bg-[#faf3e1] bg-white cursor-pointer mb-8"
                      >
                        <div className="w-[45px] h-[45px] bg-[#fa8112] rounded-[14px] flex items-center justify-center text-white mb-3 shadow-sm">
                          <UploadCloud size={24} strokeWidth={2.5} />
                        </div>
                        <h4 className="font-semibold text-[16px] text-[#222222] mb-1">
                          Upload Image
                        </h4>
                        <p className="text-[12px] text-gray-500 text-center">
                          JPG,PNG formats supported upto 5 MB
                        </p>
                      </button>
                    ) : (
                      <div className="w-full max-w-xl border border-[#F8F1F1] bg-[#FFFCFB] rounded-xl p-4 flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={paymentScreenshot.url}
                              alt="Payment Receipt"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-[#222222] text-[15px] mb-[2px] truncate w-[150px]">
                              {paymentScreenshot.name}
                            </p>
                            <p className="text-[13px] text-gray-500">
                              {paymentScreenshot.size}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setPaymentScreenshot(null)}
                          className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                        >
                          <CloseIcon size={20} strokeWidth={2} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
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
                    Step {currentStep} of 4
                  </p>
                )}
              </div>

              <div className="flex-1 justify-center hidden md:flex">
                {currentStep > 1 && (
                  <p className="text-[14px] text-gray-500">
                    Step {currentStep} of 4
                  </p>
                )}
              </div>

              <div className="flex-1 flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={submitting}
                  className="flex items-center gap-2 bg-[#fa8112] hover:bg-[#e0720f] shadow-md active:scale-95 text-white font-medium pl-6 pr-2 py-2 rounded-full transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Continue'}
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
          </>
        ) : (
          /* STEP 5: SUCCESS */
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-8 animate-in zoom-in-95 duration-500 bg-white">
            <div className="mb-6">
              <img
                src="/laptop.png"
                alt="Application Submitted"
                className="w-48 h-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/green_double_circle_check.svg";
                }}
              />
            </div>
            <h2 className="text-[32px] font-semibold text-[#222222] mb-3 md">
              Application Submitted!
            </h2>
            <p className="text-center text-gray-500 max-w-sm mb-8 text-[14px] tracking-wide">
              Your Ayush Card application has been received. You will be
              notified via SMS and email once it is processed.
            </p>

            <div className="text-center mb-8">
              <p className="text-[15px] text-[#fa8112] mb-2 font-medium">
                Application Reference Number
              </p>
              <p className="text-[20px] font-bold text-[#fa8112] tracking-wider">
                {applicationId || 'BKBST-' + Date.now().toString().slice(-8)}
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex items-center gap-2 bg-[#FA8112] hover:bg-[#e0720f] active:scale-95 transition-all text-white font-semibold py-3 px-8 rounded-full shadow-md"
            >
              <ArrowLeft size={18} />
              Return To Website
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplyAyushCardModal;
