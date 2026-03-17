import React, { useState, useRef, useEffect } from "react";
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
  Printer,
  Loader2,
  Camera,
  RefreshCw,
} from "lucide-react";
import { useToast } from "../../ui/Toast";
import apiService from "../../../api/service";
import { performOCR } from "../../../utils/ocr";
import { load } from "@cashfreepayments/cashfree-js";

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
  
  // Payment States
  const [paymentMethod, setPaymentMethod] = useState("online"); // 'online' | 'manual'
  const [onlinePaymentLoading, setOnlinePaymentLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [txnId, setTxnId] = useState("");
  const [saveError, setSaveError] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Step 2 State (Family Head)
  const [headImage, setHeadImage] = useState(null);
  const [familyHead, setFamilyHead] = useState({
    fullName: "",
    dob: "",
    gender: "",
    contactNumber: "",
    aadhaarNumber: "",
    emailAddress: "",
    relation: "",
    relatedPerson: "",
    address: "",
    pincode: "",
  });

  const [members, setMembers] = useState([]);
  const [activeMemberTab, setActiveMemberTab] = useState(0); // 0 is head, 1+ is members

  const resetForm = () => {
    setCurrentStep(1);
    setApplicationId(null);
    setActiveTab(null);
    setDocFront(null);
    setDocBack(null);
    setHeadImage(null);
    setPaymentScreenshot(null);
    setIsEditingReview(false);
    setOnlinePaymentLoading(false);
    setVerifyLoading(false);
    setOrderId(null);
    setTxnId("");
    setSaveError("");
    setPaymentMethod("online");
    setFamilyHead({
      fullName: "",
      dob: "",
      gender: "",
      contactNumber: "",
      aadhaarNumber: "",
      emailAddress: "",
      relation: "",
      relatedPerson: "",
      address: "",
      pincode: "",
    });
    setMembers([]);
    setActiveMemberTab(0);
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen || currentStep !== 1 || activeTab !== "scan") {
      stopCamera();
    }
  }, [isOpen, currentStep, activeTab]);

  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  const startCamera = async () => {
    try {
      setOcrLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      console.error("Camera error:", err);
      toastWarn("Could not access camera. Please use Gallery Upload.");
    } finally {
      setOcrLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setOcrLoading(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const base64 = canvas.toDataURL("image/jpeg", 0.8);
    stopCamera();
    
    try {
      const results = await performOCR(base64, (p) => setOcrProgress(p));
      if (results) {
        setFamilyHead(prev => ({
          ...prev,
          fullName: results.name || results.fullName || prev.fullName || "",
          gender: results.gender || prev.gender || "",
          dob: results.dob || prev.dob || "",
          pincode: results.pincode || prev.pincode || "",
          address: results.address || prev.address || "",
          aadhaarNumber: (results.type === 'aadhaar' ? results.docNumber : prev.aadhaarNumber) || prev.aadhaarNumber || ""
        }));
        setDocFront({ 
          name: "captured_id.jpg", 
          size: "Live Capture", 
          url: base64,
          base64: base64
        });
        toastWarn("Details extracted successfully!");
      }
    } catch (err) {
      console.error("Capture OCR Error:", err);
      toastWarn("Could not extract details. Please enter manually.");
      setDocFront({ 
        name: "captured_id.jpg", 
        size: "Live Capture", 
        url: base64,
        base64: base64
      });
    } finally {
      setOcrLoading(false);
      setOcrProgress(0);
    }
  };

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

  const handleScanImage = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toastWarn("Image size should be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        setOcrLoading(true);
        setOcrProgress(0);
        toastWarn("Processing image... please wait.");
        
        try {
          const results = await performOCR(base64, (p) => setOcrProgress(p));
          if (results) {
            setFamilyHead(prev => ({
              ...prev,
              fullName: results.name || results.fullName || prev.fullName || "",
              aadhaarNumber: (results.type === 'aadhaar' ? results.docNumber : prev.aadhaarNumber) || prev.aadhaarNumber || "",
              gender: results.gender || prev.gender || "",
              dob: results.dob || prev.dob || "",
              pincode: results.pincode || prev.pincode || "",
              address: results.address || prev.address || ""
            }));
            
            setDocFront({ 
              name: file.name, 
              size: (file.size / (1024 * 1024)).toFixed(2) + " MB", 
              url: URL.createObjectURL(file),
              base64: base64
            });
            
            toastWarn("Details extracted and autofilled!");
            setActiveTab("upload"); 
          } else {
            toastError("Could not extract details. Please enter manually.");
          }
        } catch (err) {
          console.error("OCR failed", err);
          toastError("Scanning failed. Please try again or enter manually.");
        } finally {
          setOcrLoading(false);
          setOcrProgress(0);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeadChange = (e) => {
    let { name, value } = e.target;

    // Validations
    if (name === "fullName" || name === "relatedPerson") value = value.replace(/[0-9]/g, "");
    if (name === "contactNumber") value = value.replace(/\D/g, "").slice(0, 10);
    if (name === "aadhaarNumber") value = value.replace(/\D/g, "").slice(0, 12);
    if (name === "pincode") value = value.replace(/\D/g, "").slice(0, 6);

    if (name === "dob") {
      const selectedDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - selectedDate.getFullYear();
      const m = today.getMonth() - selectedDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < selectedDate.getDate())) {
        age--;
      }
      if (age < 18) {
        toastWarn("Family head must be at least 18 years old.");
        return;
      }
    }

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
      if (file.size > 5 * 1024 * 1024) {
        toastWarn("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileData = {
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
          url: URL.createObjectURL(file), // Still keep for instant preview
          base64: reader.result, // Add base64 for backend
        };
        if (side === "front") setDocFront(fileData);
        else setDocBack(fileData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeadImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toastWarn("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeadImage(reader.result); // Use base64 directly
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toastWarn("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentScreenshot({
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
          url: URL.createObjectURL(file),
          base64: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const addMember = () => {
    if (members.length + 1 >= 7) return; // Max 7 including head
    setMembers([
      ...members,
      {
        fullName: "",
        relation: "",
        age: "",
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

  const submitFinalApplication = async (resolvedTxnId = null) => {
    const finalTxnId = resolvedTxnId || txnId || `MANUAL-${Date.now()}`;
    
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
      relation: familyHead.relation,
      relatedPerson: familyHead.relatedPerson,
      gender: familyHead.gender,
      dob: familyHead.dob,
      address: familyHead.address,
      pincode: familyHead.pincode,
      aadhaarNumber: familyHead.aadhaarNumber,
      cardIssueDate: today,
      cardExpiredDate: cardExpiryDate,
      verificationDate: today,
      totalMember: 1 + members.length,
      totalAmount: estimatedFee,
      documents: [
        docFront && {
          filename: docFront.name,
          originalName: docFront.name,
          path: docFront.base64 || docFront.url,
          size: 0,
          mimetype: 'image/jpeg',
          type: 'aadhaar_front',
          uploadedAt: new Date().toISOString(),
        },
        docBack && {
          filename: docBack.name,
          originalName: docBack.name,
          path: docBack.base64 || docBack.url,
          size: 0,
          mimetype: 'image/jpeg',
          type: 'aadhaar_back',
          uploadedAt: new Date().toISOString(),
        },
        headImage && {
          filename: 'family_head_photo.jpg',
          originalName: 'family_head_photo.jpg',
          path: headImage, // This is already base64 now
          size: 0,
          mimetype: 'image/jpeg',
          type: 'profile_photo',
          uploadedAt: new Date().toISOString(),
        },
        paymentScreenshot && {
          filename: paymentScreenshot.name,
          originalName: paymentScreenshot.name,
          path: paymentScreenshot.base64 || paymentScreenshot.url,
          size: 0,
          mimetype: 'image/jpeg',
          type: 'payment_screenshot',
          uploadedAt: new Date().toISOString(),
        }
      ].filter(Boolean),
      isPrint: false,
      members: members.map((m) => {
        return {
          name: m.fullName,
          relation: m.relation || 'Family Member',
          age: parseInt(m.age) || 0,
        };
      }),
      payment: {
        transactionId: finalTxnId,
        method: paymentScreenshot ? 'manual' : 'online',
        totalAmount: estimatedFee,
        date: new Date().toISOString(),
        orderId: orderId || "",
      },
    };

    try {
      setSubmitting(true);
      const res = await apiService.submitCardApplication(payload);
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
    } catch (err) {
      console.error('Card application submission error:', err);
      const errMsg = err.response?.data?.message || err.message || "";
      
      if (errMsg.toLowerCase().includes("already exists")) {
        console.log("Card already exists (public modal), proceeding to success.");
        // Try to recover appId if possible, though it's less critical here for the receipt view
        setCurrentStep(5);
        return;
      }

      toastError(
        errMsg || 'Failed to submit application. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleInitiateCashfreePayment = async () => {
    setOnlinePaymentLoading(true);
    setSaveError("");
    try {
      const amount = 120 + (members || []).length * 10;
      const payload = {
        amount,
        customerName: (familyHead.fullName || "").trim() || "Customer",
        customerEmail: (familyHead.emailAddress || "").trim() || "customer@example.com",
        customerPhone: (familyHead.contactNumber || "").trim().replace(/\D/g, "").slice(0, 10) || "9999999999",
      };

      const res = await apiService.createPublicPaymentOrder(payload);
      
      const possibleData = [res, res?.data, res?.data?.data, res?.order, res?.data?.order].filter(Boolean);
      let sessionId = null;
      let cOrderId = null;

      for (const d of possibleData) {
        sessionId = sessionId || d.payment_session_id || d.paymentSessionId || d.cf_session_id || d.sessionId;
        cOrderId = cOrderId || d.order_id || d.orderId || d.cf_order_id;
      }

      if (!sessionId) {
        throw new Error("Payment session could not be created.");
      }

      setOrderId(cOrderId);

      const cashfree = await load({ mode: "sandbox" });
      cashfree.checkout({
        paymentSessionId: sessionId,
        redirectTarget: "_modal",
      }).then(() => {
        setTimeout(() => {
          handleVerifyCashfreePayment(cOrderId);
        }, 1500);
      });
    } catch (err) {
      console.error("[Cashfree] Initiate failed:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to initiate payment.";
      setSaveError(errorMsg);
      toastError(errorMsg);
    } finally {
      setOnlinePaymentLoading(false);
    }
  };

  const handleVerifyCashfreePayment = async (forcedOrderId = null) => {
    const activeOrderId = forcedOrderId || orderId;
    if (!activeOrderId) return;

    setVerifyLoading(true);
    try {
      const verifyData = {
        amount: estimatedFee,
        customerName: familyHead.fullName,
        customerEmail: familyHead.emailAddress,
        customerPhone: familyHead.contactNumber,
      };

      const verifyRes = await apiService.verifyPublicPayment(activeOrderId, verifyData);
      
      const isSuccess =
        verifyRes?.success === true ||
        verifyRes?.data?.payment?.status === "SUCCESS" ||
        verifyRes?.data?.gatewayOrder?.order_status === "PAID" ||
        verifyRes?.payment_status === "SUCCESS" ||
        verifyRes?.status === "SUCCESS";

      if (isSuccess) {
        const resolvedTxnId =
          verifyRes?.data?.payment?.transactionId ||
          verifyRes?.data?.gatewayOrder?.cf_order_id ||
          verifyRes?.transactionId ||
          `TXN${Date.now()}`;
        
        setTxnId(resolvedTxnId);
        await submitFinalApplication(resolvedTxnId);
      } else {
        toastWarn("Payment verification pending or failed. Please check your bank or retry.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setSaveError("Verification failed.");
    } finally {
      setVerifyLoading(false);
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
      const missingFields = [];
      if (!fg.fullName) missingFields.push("Full Name");
      if (!fg.dob) missingFields.push("Date of Birth");
      if (!fg.gender) missingFields.push("Gender");
      if (!fg.contactNumber) missingFields.push("Contact Number");
      if (!fg.aadhaarNumber) missingFields.push("Aadhaar Number");
      if (!fg.emailAddress) missingFields.push("Email Address");
      if (!fg.relation) missingFields.push("Relation");
      if (!fg.relatedPerson) missingFields.push("Father/Husband Name");
      if (!fg.address) missingFields.push("Full Address");
      if (!fg.pincode) missingFields.push("Pincode");

      if (missingFields.length > 0) {
        toastWarn(`Please fill missing family head details: ${missingFields.join(", ")}`);
        return;
      }

      if (fg.contactNumber.length < 10) {
        toastWarn("Contact number must be 10 digits.");
        return;
      }
      if (fg.aadhaarNumber.length < 12) {
        toastWarn("Aadhaar number must be 12 digits.");
        return;
      }
      if (fg.pincode.length < 6) {
        toastWarn("Pincode must be 6 digits.");
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
        if (!p.fullName || !p.relation || !p.age) {
          toastWarn(`Please fill all details for Member ${i + 1}`);
          return;
        }
      }
    }

    // Step 4: handled by Cashfree flow
    if (currentStep === 4) {
      if (!txnId && !paymentScreenshot) {
        toastWarn("Please complete the payment before continuing.");
        return;
      }
      await submitFinalApplication();
      return;
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
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
            <div className="flex-1 overflow-y-auto px-8 pb-24 pt-2 custom-scrollbar">
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
                      <div className="w-full flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl border border-[#fa8112]/30 bg-[#faf3e1] min-h-[400px]">
                        {cameraActive ? (
                          <div className="w-full max-w-sm space-y-4 animate-in fade-in zoom-in-95">
                            <div className="relative aspect-[4/3] bg-black rounded-xl overflow-hidden shadow-xl border-2 border-white">
                              <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 border-2 border-white/50 border-dashed aspect-[1.6/1] rounded-lg"></div>
                              {ocrLoading && (
                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-6 transition-all animate-in fade-in">
                                  <div className="w-full max-w-[160px] h-1.5 bg-white/20 rounded-full overflow-hidden mb-3 relative">
                                    <div className="h-full bg-[#fa8112] transition-all duration-300" style={{ width: `${ocrProgress}%` }}></div>
                                  </div>
                                  <p className="text-white text-[12px] font-bold animate-pulse">Scanning... {ocrProgress}%</p>
                                  <div className="absolute left-0 right-0 h-0.5 bg-[#fa8112] shadow-[0_0_10px_#fa8112] blur-[1px] animate-[scan_2s_infinite]"></div>
                                </div>
                              )}
                            </div>
                            <style>{`
                              @keyframes scan {
                                0% { top: 20%; }
                                50% { top: 80%; }
                                100% { top: 20%; }
                              }
                            `}</style>
                            <div className="flex gap-3">
                              <button 
                                onClick={stopCamera}
                                className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 rounded-lg font-bold transition-all"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={capturePhoto}
                                disabled={ocrLoading}
                                className="flex-[2] py-3 bg-[#fa8112] text-white rounded-lg font-bold shadow-md flex items-center justify-center gap-2 active:scale-95"
                              >
                                {ocrLoading ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
                                {ocrLoading ? "Scanning..." : "Capture & Scan"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center group">
                            <div 
                              className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 cursor-pointer hover:scale-105 transition-all border border-orange-100 group-hover:border-[#fa8112]"
                              onClick={startCamera}
                            >
                              {ocrLoading ? <Loader2 className="animate-spin text-[#fa8112]" size={32} /> : <Camera size={32} className="text-[#fa8112]" />}
                            </div>
                            <h4 className="font-bold text-[#22333B] text-[16px] mb-2">Live ID Scanner</h4>
                            <p className="text-[13px] text-gray-500 max-w-[240px] text-center mb-6">Open your camera to instantly extract details from Aadhaar or PAN cards.</p>
                            <div className="flex gap-3 w-full">
                              <button 
                                onClick={startCamera}
                                className="px-6 py-2.5 bg-[#fa8112] text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#e47510] transition-all"
                              >
                                <Camera size={16} /> Open Camera
                              </button>
                              <button 
                                onClick={() => document.getElementById('ocr-input').click()}
                                className="px-6 py-2.5 bg-white border border-[#fa8112] text-[#fa8112] rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-orange-50 transition-all"
                              >
                                <UploadCloud size={16} /> From Gallery
                              </button>
                            </div>
                          </div>
                        )}
                        <canvas ref={canvasRef} className="hidden" />
                        <input id="ocr-input" type="file" accept="image/*" capture="environment" className="hidden" onChange={handleScanImage} />
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
                        placeholder="Enter 12 digit Aadhaar no."
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

                    {/* Relation and Father/Husband Name removed */}
                    
                    <div>
                      <label className="text-[14px] text-[#222222] font-medium mb-1 block font-inter">
                        Pincode
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={familyHead.pincode}
                        onChange={handleHeadChange}
                        placeholder="6-digit Pincode"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-[#FA8112] transition-colors"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[14px] text-[#222222] font-medium mb-1 block font-inter">
                        Full Address
                      </label>
                      <textarea
                        name="address"
                        value={familyHead.address}
                        onChange={handleHeadChange}
                        placeholder="Enter your complete address"
                        rows={2}
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-[#FA8112] transition-colors resize-none"
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

                      {/* Relation and Related Person fields removed for family head */}

                      <div>
                        <label className="text-[14px] text-[#222222] font-medium mb-1 block font-inter">
                          Pincode
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          value={familyHead.pincode}
                          onChange={handleHeadChange}
                          placeholder="6-digit Pincode"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-[#FA8112]"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-[14px] text-[#222222] font-medium mb-1 block font-inter">
                          Full Address
                        </label>
                        <textarea
                          name="address"
                          value={familyHead.address}
                          onChange={handleHeadChange}
                          placeholder="Enter your complete address"
                          rows={2}
                          style={{ fontFamily: "'Inter', sans-serif" }}
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-[#FA8112] transition-colors resize-none"
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
                          placeholder="Full Name"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-[#FA8112]"
                        />
                      </div>
                      <div>
                        <label className="text-[14px] text-[#222222] font-medium mb-1 block font-inter">
                          Relation
                        </label>
                        <select
                          name="relation"
                          value={members[activeMemberTab - 1].relation}
                          onChange={(e) =>
                            handleMemberChange(activeMemberTab - 1, e)
                          }
                          style={{ fontFamily: "'Inter', sans-serif" }}
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] outline-none focus:border-[#FA8112] appearance-none bg-white"
                        >
                          <option value="">Select Relation</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Son">Son</option>
                          <option value="Daughter">Daughter</option>
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Brother">Brother</option>
                          <option value="Sister">Sister</option>
                          <option value="Grandfather">Grandfather</option>
                          <option value="Grandmother">Grandmother</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[14px] text-[#222222] font-medium mb-1 block font-inter">
                          Age
                        </label>
                        <input
                          type="number"
                          name="age"
                          value={members[activeMemberTab - 1].age}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 3);
                            handleMemberChange(activeMemberTab - 1, { target: { name: 'age', value: val } });
                          }}
                          placeholder="Age"
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
                                  <div className="relative w-full h-full group">
                                    <img
                                      src={docFront.url}
                                      className="w-full h-full object-cover"
                                      alt="Front"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(docFront.url, '_blank');
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
                                  <div className="relative w-full h-full group">
                                    <img
                                      src={docBack.url}
                                      className="w-full h-full object-cover"
                                      alt="Back"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(docBack.url, '_blank');
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
                                <div className="relative w-full h-full group">
                                  <img
                                    src={headImage}
                                    alt="Head"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const win = window.open();
                                        win.document.write(`<img src="${headImage}" />`);
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
                        {/* Relation and Father/Husband Name review removed for family head */}
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
                              {familyHead.pincode || "XXXXXX"}
                            </p>
                          )}
                        </div>
                        <div className="col-span-2">
                          <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                            Full Address
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
                            <p className="text-[14px] font-semibold text-[#222222] w-full pr-2 line-clamp-2">
                              {familyHead.address || "Not provided"}
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
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                      <option value="">Select Relation</option>
                                      <option value="Spouse">Spouse</option>
                                      <option value="Son">Son</option>
                                      <option value="Daughter">Daughter</option>
                                      <option value="Father">Father</option>
                                      <option value="Mother">Mother</option>
                                      <option value="Brother">Brother</option>
                                      <option value="Sister">Sister</option>
                                      <option value="Grandfather">Grandfather</option>
                                      <option value="Grandmother">Grandmother</option>
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
                                        const val = e.target.value.replace(/\D/g, "").slice(0, 3);
                                        handleMemberChange(idx, { target: { name: 'age', value: val } });
                                      }}
                                      className="w-full border-b border-gray-300 focus:border-[#fa8112] outline-none py-1 text-[14px] font-semibold text-[#222222]"
                                    />
                                  ) : (
                                    <p className="text-[14px] font-semibold text-[#222222] truncate w-full pr-2">
                                      {member.age || "—"}
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
                      Secure Payment
                    </h3>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center py-2">
                    {/* Payment Mode Tabs */}
                    {!txnId && !paymentScreenshot && (
                      <div className="flex bg-gray-100 p-1 rounded-xl mb-6 w-full max-w-md">
                        <button
                          onClick={() => setPaymentMethod("online")}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                            paymentMethod === "online"
                              ? "bg-white text-[#fa8112] shadow-sm"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          Credit Card / UPI
                        </button>
                        <button
                          onClick={() => setPaymentMethod("manual")}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                            paymentMethod === "manual"
                              ? "bg-white text-[#fa8112] shadow-sm"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          Manual / QR
                        </button>
                      </div>
                    )}

                    <div className="bg-white border-2 border-[#fa8112] rounded-3xl p-8 flex flex-col items-center shadow-xl w-full max-w-md relative overflow-hidden">
                      {/* Decorative background for amount */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-[#fa8112]"></div>
                      
                      <div className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 font-inter">Total Payable Amount</div>
                      <h2 className="text-5xl font-extrabold text-[#222222] mb-8 font-inter">
                        <span className="text-2xl font-semibold mr-1">₹</span>{Number(estimatedFee).toFixed(2)}
                      </h2>

                      {saveError && (
                        <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4 border border-red-100 w-full text-center">
                          {saveError}
                        </div>
                      )}

                      {txnId || paymentScreenshot ? (
                        <div className="w-full flex flex-col gap-4 animate-in fade-in zoom-in duration-500">
                          <div className={`border rounded-2xl p-6 flex flex-col items-center gap-3 ${txnId ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg mb-1 ${txnId ? 'bg-green-500' : 'bg-orange-500'}`}>
                              <Check size={28} strokeWidth={3} />
                            </div>
                            <h3 className={`text-lg font-bold ${txnId ? 'text-green-700' : 'text-orange-700'}`}>
                              {txnId ? "Payment Verified!" : "Screenshot Uploaded!"}
                            </h3>
                            <p className={`text-[11px] text-center font-medium ${txnId ? 'text-green-600' : 'text-orange-600'}`}>
                              {txnId ? (
                                <>
                                  Ref: <span className="font-mono font-bold uppercase select-all tracking-wider">{txnId}</span>
                                </>
                              ) : (
                                "Manual verification in progress after submission"
                              )}
                            </p>
                            {paymentScreenshot && !txnId && (
                               <button 
                                 onClick={() => setPaymentScreenshot(null)}
                                 className="text-[10px] text-orange-400 hover:text-orange-600 underline"
                               >
                                 Remove and change method
                               </button>
                            )}
                          </div>
                          
                          <button
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
                        <>
                          {paymentMethod === "online" ? (
                            <div className="w-full space-y-4">
                              {!orderId ? (
                                <button
                                  onClick={handleInitiateCashfreePayment}
                                  disabled={onlinePaymentLoading}
                                  className="w-full bg-[#fa8112] hover:bg-[#e0720f] active:scale-95 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:active:scale-100"
                                >
                                  {onlinePaymentLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <span className="text-xl">💳</span>
                                  )}
                                  {onlinePaymentLoading ? "Preparing Gateway..." : "Pay with Cashfree"}
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
                                      onClick={() => setOrderId(null)}
                                      className="py-3 border border-gray-300 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                                    >
                                      Retry
                                    </button>
                                    <button
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
                                <img src="https://www.cashfree.com/wp-content/uploads/2022/10/cashfree-logo.png" className="h-4" alt="Cashfree" />
                                <div className="h-4 w-px bg-gray-200" />
                                <div className="flex gap-2">
                                  <span className="text-[9px] font-bold text-gray-400">UPI</span>
                                  <span className="text-[9px] font-bold text-gray-400">CARDS</span>
                                  <span className="text-[9px] font-bold text-gray-400">NETBANKING</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full flex flex-col items-center">
                               <div className="w-full aspect-square max-w-[160px] bg-white border border-gray-100 rounded-2xl shadow-sm p-3 mb-4 flex items-center justify-center relative">
                                  {/* Replace with actual static QR if available */}
                                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BKBS-TRUST-PAYMENT" alt="Static QR" className="w-full h-full opacity-80" />
                                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-xs flex-col p-2 text-center rounded-2xl">
                                     <ScanLine size={32} className="text-[#fa8112] mb-1" />
                                     <span className="text-[10px] font-bold text-gray-600">Scan & Pay via any UPI App</span>
                                  </div>
                               </div>
                               
                               <button 
                                onClick={() => paymentInputRef.current?.click()}
                                className="w-full flex flex-col items-center justify-center py-6 px-4 rounded-2xl border-2 border-dashed border-[#fa8112] bg-orange-50/50 hover:bg-orange-50 transition-all group"
                              >
                                <div className="w-10 h-10 bg-[#fa8112] rounded-full flex items-center justify-center text-white mb-2 shadow-sm group-hover:scale-110 transition-transform">
                                  <UploadCloud size={20} />
                                </div>
                                <span className="text-sm font-bold text-[#222222]">Upload Payment Screenshot</span>
                                <span className="text-[11px] text-gray-500 mt-1">PNG, JPG up to 5MB</span>
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
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
          /* STEP 5: SUCCESS / RECEIPT */
          <div className="flex-1 overflow-y-auto px-8 py-8 animate-in zoom-in-95 duration-500 bg-[#F9FAFB] custom-scrollbar">
            <div className="max-w-md mx-auto">
              {/* Receipt Header */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="bg-green-500 p-6 flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                    <Check className="text-white w-6 h-6" strokeWidth={3} />
                  </div>
                  <h2 className="text-white text-xl font-bold">Payment Successful</h2>
                  <p className="text-green-100 text-sm mt-1">Application Reference: {applicationId || 'Pending'}</p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                    <span className="text-gray-500 text-sm">Amount Paid</span>
                    <span className="text-xl font-bold text-[#222222]">₹{estimatedFee}.00</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Transaction ID</span>
                      <span className="font-semibold text-[#222222] uppercase">{txnId || "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Payment Date</span>
                      <span className="font-semibold text-[#222222]">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Family Head</span>
                      <span className="font-semibold text-[#222222]">{familyHead.fullName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Members</span>
                      <span className="font-semibold text-[#222222]">{totalMembersCount}</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-dashed border-gray-200">
                    <div className="bg-gray-50 rounded-lg p-3 flex items-start gap-3">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-blue-600 text-[10px] font-bold">i</span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed text-left">
                        Your application is under review. You will receive an SMS and Email notification once your Ayush Card is generated.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm"
                  >
                    <Printer size={18} />
                    Print Receipt
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex items-center justify-center gap-2 bg-white border border-[#fa8112] text-[#fa8112] hover:bg-orange-50 font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm"
                  >
                    <Plus size={18} />
                    Apply New
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 bg-[#FA8112] hover:bg-[#e0720f] active:scale-95 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md mt-1"
                >
                  <ArrowLeft size={18} />
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplyAyushCardModal;
