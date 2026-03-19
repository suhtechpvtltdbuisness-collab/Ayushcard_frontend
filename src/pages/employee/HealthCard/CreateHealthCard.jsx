import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, ChevronDown, Plus, Loader2, Check, User, UploadCloud, ScanLine, FileText, CheckCircle2, Camera, RefreshCw, CreditCard, Banknote, Download } from "lucide-react";
import AyushCardPreview from "../../../components/admin/AyushCardPreview";
import apiService from "../../../api/service";
import { useToast } from "../../../components/ui/Toast";
import { performOCR } from "../../../utils/ocr";
import { load } from "@cashfreepayments/cashfree-js";

const generateId = () => `AC-${Math.floor(1000000 + Math.random() * 9000000)}`;
const formatDate = (date) =>
  date.toLocaleDateString("en-GB").replace(/\//g, "-");

const CreateHealthCard = () => {
  const navigate = useNavigate();
  const { toastWarn, toastError, toastSuccess } = useToast();

  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState(null); // "online" | "cash"
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [cardSide, setCardSide] = useState("front"); // for preview
  const [orderId, setOrderId] = useState(null); // from create-order response
  const [paymentOrderData, setPaymentOrderData] = useState(null); // full create-order response
  const [txnId, setTxnId] = useState(""); // final transaction id after verify
  const [onlinePaymentLoading, setOnlinePaymentLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);

  // Cash receipt camera refs/state
  const cashCameraVideoRef = useRef(null);
  const cashCameraCanvasRef = useRef(null);
  const cashCameraStreamRef = useRef(null);
  const [cashCameraActive, setCashCameraActive] = useState(false);
  const [cashCameraLoading, setCashCameraLoading] = useState(false);

  // Standard form refs
  const fileInputFrontRef = useRef(null);
  const fileInputBackRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const cashPaymentInputRef = useRef(null);

  // Family head photo
  const headImageInputRef = useRef(null);
  const [headImage, setHeadImage] = useState("");

  // Store actual File objects for API upload
  const documentFrontFileRef = useRef(null);
  const documentBackFileRef = useRef(null);

  // Save/API state
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [cashPaymentImage, setCashPaymentImage] = useState("");

  const [formData, setFormData] = useState({
    id: `AC-${Math.floor(1000000 + Math.random() * 9000000)}`,
    dateApplied: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
    status: "Pending verification",
    applicantFirstName: "",
    applicantMiddleName: "",
    applicantLastName: "",
    gender: "",
    dob: "",
    relation: "",
    relatedPerson: "",
    phone: "",
    altPhone: "",
    email: "",
    address: "",
    pincode: "",
    cardNumber: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
    issueDate: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
    expiryDate: (() => {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      return d.toLocaleDateString("en-GB").replace(/\//g, "-");
    })(),
    verificationDate: new Date()
      .toLocaleDateString("en-GB")
      .replace(/\//g, "-"),
    members: [],
    documentFront: "",
    documentBack: "",
    payment: {
      applicationFee: 120,
      memberAddOns: 0,
      totalPaid: "120.00",
    },
  });

  useEffect(() => {
    // Up to 7 included members allowed
    const includedMembersCount = Math.min(formData.members?.length || 0, 7);
    const calculatedTotal = 120 + includedMembersCount * 10;

    setFormData((prev) => ({
      ...prev,
      payment: {
        ...prev.payment,
        memberAddOns: includedMembersCount * 10,
        totalPaid: calculatedTotal.toFixed(2),
      },
    }));
  }, [formData.members]);

  // Camera cleanup on unmount or step change
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (cashCameraStreamRef.current) {
        cashCameraStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (currentStep !== 1) {
      stopCamera();
    }
  }, [currentStep]);

  const startCashCamera = async () => {
    try {
      setCashCameraLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      cashCameraStreamRef.current = stream;
      if (cashCameraVideoRef.current) {
        cashCameraVideoRef.current.srcObject = stream;
      }
      setCashCameraActive(true);
    } catch (err) {
      console.error("Cash camera error:", err);
      toastError("Could not access camera. Please use Upload instead.");
    } finally {
      setCashCameraLoading(false);
    }
  };

  const stopCashCamera = () => {
    if (cashCameraStreamRef.current) {
      cashCameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cashCameraStreamRef.current = null;
    }
    if (cashCameraVideoRef.current) cashCameraVideoRef.current.srcObject = null;
    setCashCameraActive(false);
  };

  const captureCashReceipt = () => {
    if (!cashCameraVideoRef.current || !cashCameraCanvasRef.current) return;

    setCashCameraLoading(true);
    const video = cashCameraVideoRef.current;
    const canvas = cashCameraCanvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64 = canvas.toDataURL("image/jpeg", 0.8);
    stopCashCamera();
    setCashPaymentImage(base64);
    toastSuccess("Cash receipt captured from camera.");
    setCashCameraLoading(false);
  };

  const handleHeadImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toastWarn("Image size should be less than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setHeadImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

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
      toastError("Could not access camera. Please use Gallery Upload.");
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
      const details = await performOCR(base64, (p) => setOcrProgress(p));
      if (details) {
        let fName = "";
        let lName = "";
        if (details.name) {
          const parts = details.name.trim().split(/\s+/);
          if (parts.length > 1) {
            fName = parts[0];
            lName = parts.slice(1).join(" ");
          } else {
            fName = parts[0];
          }
        }

        setFormData((prev) => ({
          ...prev,
          applicantFirstName: fName || prev.applicantFirstName || "",
          applicantLastName: lName || prev.applicantLastName || "",
          aadhaarNumber:
            (details.type === "aadhaar" ? details.docNumber : prev.aadhaarNumber) ||
            prev.aadhaarNumber ||
            "",
          dob: details.dob ? details.dob.split("-").reverse().join("-") : prev.dob || "",
          pincode: details.pincode || prev.pincode || "",
          address: details.address || prev.address || "",
          gender: details.gender || prev.gender || "",
        }));
        toastSuccess("Details extracted successfully!");
      }
    } catch (err) {
      console.error("Capture OCR Error:", err);
      toastWarn("Could not extract details. Please enter manually.");
    } finally {
      setOcrLoading(false);
      setOcrProgress(0);
    }
  };

  const handleChange = (e, field) => {
    let value = e.target.value;

    if (
      [
        "applicantFirstName",
        "applicantMiddleName",
        "applicantLastName",
        "applicant",
        "relatedPerson",
      ].includes(field)
    ) {
      value = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (["phone", "altPhone"].includes(field)) {
      value = value.replace(/\D/g, "").slice(0, 10);
    } else if (["pincode"].includes(field)) {
      value = value.replace(/\D/g, "").slice(0, 6);
    } else if (
      ["phone", "altPhone", "payment.totalPaid", "cardNumber"].includes(field)
    ) {
      value = value.replace(/[^0-9.]/g, "");
    }

    if (field.startsWith("payment.")) {
      setFormData((prev) => ({
        ...prev,
        payment: { ...prev.payment, [field.split(".")[1]]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    if (dateStr.includes("-") && dateStr.split("-")[0].length === 4)
      return dateStr;
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const handleDateChange = (e, field) => {
    const val = e.target.value;
    if (!val) {
      setFormData((prev) => ({
        ...prev,
        [field]: "",
        ...(field === "issueDate" ? { expiryDate: "" } : {}),
      }));
      return;
    }
    const parts = val.split("-");
    let formattedDate = val;
    if (parts.length === 3) {
      formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    let additionalUpdates = {};
    if (field === "issueDate") {
      const issueD = new Date(val);
      if (!isNaN(issueD.getTime())) {
        issueD.setFullYear(issueD.getFullYear() + 1);
        const expDay = String(issueD.getDate()).padStart(2, "0");
        const expMonth = String(issueD.getMonth() + 1).padStart(2, "0");
        const expYear = issueD.getFullYear();
        additionalUpdates.expiryDate = `${expDay}-${expMonth}-${expYear}`;
      }
    }

    if (field === "dob" && val) {
      const selectedDate = new Date(val);
      const today = new Date();
      let age = today.getFullYear() - selectedDate.getFullYear();
      const m = today.getMonth() - selectedDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < selectedDate.getDate())) {
        age--;
      }
      if (age < 18) {
        toastWarn("Head of Family must be at least 18 years old.");
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [field]: formattedDate,
      ...additionalUpdates,
    }));
  };

  const handleImageUpload = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toastWarn("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        if (side === "front") {
          documentFrontFileRef.current = file;
          setFormData((prev) => ({ ...prev, documentFront: base64String }));
        } else {
          documentBackFileRef.current = file;
          setFormData((prev) => ({ ...prev, documentBack: base64String }));
        }
      };
      reader.readAsDataURL(file);
    } else {
      toastWarn("Please upload a valid file.");
    }
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
        toastWarn("Processing document... please wait.");
        
        try {
          const details = await performOCR(base64, (p) => setOcrProgress(p));
          if (details) {
            let fName = "";
            let lName = "";
            if (details.name) {
              const parts = details.name.trim().split(/\s+/);
              if (parts.length > 1) {
                fName = parts[0];
                lName = parts.slice(1).join(" ");
              } else {
                fName = parts[0];
              }
            }

            setFormData((prev) => ({
              ...prev,
              applicantFirstName: fName || prev.applicantFirstName || "",
              applicantLastName: lName || prev.applicantLastName || "",
              aadhaarNumber:
                (details.type === "aadhaar" ? details.docNumber : prev.aadhaarNumber) ||
                prev.aadhaarNumber ||
                "",
              dob: details.dob ? details.dob.split("-").reverse().join("-") : prev.dob || "",
              pincode: details.pincode || prev.pincode || "",
              address: details.address || prev.address || "",
              gender: details.gender || prev.gender || "",
            }));
            toastSuccess("Details extracted and autofilled!");
          } else {
            toastError("Could not extract details. Please enter manually.");
          }
        } catch (err) {
          console.error("OCR failed", err);
          toastError("Scanning failed. Please enter manually.");
        } finally {
          setOcrLoading(false);
          setOcrProgress(0);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (side) => {
    if (side === "front") {
      documentFrontFileRef.current = null;
      setFormData((prev) => ({ ...prev, documentFront: "" }));
      if (fileInputFrontRef.current) fileInputFrontRef.current.value = "";
    } else {
      documentBackFileRef.current = null;
      setFormData((prev) => ({ ...prev, documentBack: "" }));
      if (fileInputBackRef.current) fileInputBackRef.current.value = "";
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!formData.applicantFirstName?.trim() || !formData.phone?.trim()) {
        toastWarn("First name and Phone number are required.");
        return;
      }
      if (!formData.pincode?.trim() || formData.pincode.length < 6) {
        toastWarn("A valid 6-digit Pincode is required.");
        return;
      }
      if (!formData.documentFront) {
        toastWarn("Please upload an identity document or scan Aadhaar.");
        return;
      }
      if (!headImage) {
        toastWarn("Please upload the family head photo.");
        return;
      }

      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate members if any?
      for (const m of (formData.members || [])) {
        if (!m.name || !m.relation || !m.age) {
          toastWarn("Please fill all details for the added members.");
          return;
        }
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
        if (!paymentCompleted) {
        if (!paymentMethod) {
          toastWarn("Please select a payment method.");
          return;
        }
        if (paymentMethod === "cash") {
          await performSave("cash", null);
        }
      } else {
        setCurrentStep(5);
      }
    } else if (currentStep === 5) {
      navigate("/employee/health-card");
    }
  };

  // Step 1: Create payment order (Cashfree)
  const handleInitiateOnlinePayment = async () => {
    setOnlinePaymentLoading(true);
    setSaveError("");
    try {
      const amountVal = parseFloat(formData.payment?.totalPaid || "120");
      const amount = isNaN(amountVal) ? 120 : Math.round(amountVal);
      
      const p_firstName = (formData.applicantFirstName || "").trim();
      const p_middleName = (formData.applicantMiddleName || "").trim();
      const p_lastName = (formData.applicantLastName || "").trim();
      const fullName = [p_firstName, p_middleName, p_lastName].filter(Boolean).join(" ") || "Customer";
      
      const payload = {
        amount,
        customerName: fullName,
        customerEmail: (formData.email || "").trim() || "customer@example.com",
        customerPhone: (formData.phone || "").trim().replace(/\D/g, "").slice(0, 10) || "9999999999",
      };

      const res = await apiService.createPaymentOrder(payload);
      console.log("[Cashfree] Create Order Response:", res);

      // Extract Cashfree session ID and order ID (be more robust with nested data)
      // We look in res, res.data, and res.data.data
      const possibleData = [res, res?.data, res?.data?.data, res?.order, res?.data?.order].filter(Boolean);
      
      let sessionId = null;
      let cOrderId = null;

      for (const d of possibleData) {
        sessionId = sessionId || d.payment_session_id || d.paymentSessionId || d.cf_session_id || d.sessionId;
        cOrderId = cOrderId || d.order_id || d.orderId || d.cf_order_id;
      }

      if (!sessionId) {
        console.error("[Cashfree] Missing session ID. Full response:", res);
        throw new Error(`Payment session ID not received. Server responded with: ${JSON.stringify(res)}`);
      }

      setOrderId(cOrderId);
      setPaymentOrderData(res?.data || res);

      // Initialize Cashfree SDK
      const cashfree = await load({
        mode: "sandbox", // TODO: Switch to "production" when live
      });

      // Open Cashfree Checkout Modal
      cashfree
        .checkout({
          paymentSessionId: sessionId,
          redirectTarget: "_modal",
        })
        .then(() => {
          console.log("[Cashfree] Checkout modal closed - Auto verifying...");
          // Wait a brief moment then auto-verify
          setTimeout(() => {
            handleConfirmOnlinePayment(cOrderId);
          }, 1000);
        });
    } catch (err) {
      console.error("[Cashfree] Initiate failed:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to initiate payment. Please try again.";
      setSaveError(errorMsg);
      toastError(errorMsg);
    } finally {
      setOnlinePaymentLoading(false);
    }
  };

  // Step 2: Verify Cashfree payment then save card
  const handleConfirmOnlinePayment = async (forcedOrderId = null) => {
    const activeOrderId = forcedOrderId || orderId;
    if (!activeOrderId) {
      toastWarn("No active payment order found.");
      return;
    }
    setVerifyLoading(true);
    setSaveError("");
    try {
      // Data model for verify request
      const verifyData = {
        amount: Math.round(parseFloat(formData.payment?.totalPaid || "120")),
        customerName: [
          formData.applicantFirstName,
          formData.applicantMiddleName,
          formData.applicantLastName,
        ]
          .filter(Boolean)
          .join(" "),
        customerEmail: formData.email?.trim() || "",
        customerPhone: formData.phone?.trim() || "",
      };

      const verifyRes = await apiService.verifyPayment(
        activeOrderId,
        verifyData
      );

      // Backend returns verify status in res.data or res
      const isSuccess =
        verifyRes?.success === true ||
        verifyRes?.data?.payment?.status === "SUCCESS" ||
        verifyRes?.data?.gatewayOrder?.order_status === "PAID" ||
        verifyRes?.data?.payment_status === "SUCCESS" ||
        verifyRes?.payment_status === "SUCCESS" ||
        verifyRes?.data?.status === "SUCCESS" ||
        verifyRes?.status === "SUCCESS";

      if (!isSuccess) {
        throw new Error(
          verifyRes?.data?.message ||
            verifyRes?.message ||
            "Payment verification failed. Re-check or contact support."
        );
      }

      toastSuccess("Payment verified successfully!");

      const resolvedTxnId =
        verifyRes?.data?.payment?.transactionId ||
        verifyRes?.data?.gatewayOrder?.cf_order_id ||
        verifyRes?.data?.transactionId ||
        verifyRes?.data?.cf_payment_id ||
        verifyRes?.transactionId ||
        verifyRes?.cf_payment_id ||
        `TXN${Date.now()}`;

      setTxnId(resolvedTxnId);
      await performSave("online", resolvedTxnId);
    } catch (err) {
      console.error("[Cashfree] verify failed:", err);
      setSaveError(
        err.response?.data?.message || err.message || "Payment not verified."
      );
    } finally {
      setVerifyLoading(false);
    }
  };

  const performSave = async (method, resolvedTxnId) => {
    setSaveError("");
    setSaveLoading(true);
    const finalTxnId =
      resolvedTxnId ||
      txnId ||
      `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    try {

      const customerName = [
        formData.applicantFirstName,
        formData.applicantMiddleName,
        formData.applicantLastName,
      ]
        .filter(Boolean)
        .join(" ");

      // Build card data payload matching API model
      const cardData = {
        applicationId: formData.id,
        firstName: formData.applicantFirstName.trim(),
        lastName: formData.applicantLastName?.trim() || "",
        middleName: formData.applicantMiddleName?.trim() || "",
        email: formData.email?.trim() || "",
        contact: formData.phone.trim(),
        alternateContact: formData.altPhone?.trim() || "",
        totalAmount: parseFloat(formData.payment?.totalPaid || "120"),
        applicationDate:
          formData.dateApplied || new Date().toISOString().split("T")[0],
        gender: formData.gender || "",
        dob: formData.dob || "",
        relation: formData.relation || "",
        relatedPerson: formData.relatedPerson || "",
        address: formData.address || "",
        pincode: formData.pincode || "",
        aadhaarNumber: formData.aadhaarNumber || "",
        cardNo: formData.cardNumber || "",
        cardIssueDate: formData.issueDate || "",
        cardExpiredDate: formData.expiryDate || "",
        verificationDate: formData.verificationDate || "",
        status: "pending",
        totalMember: (formData.members?.length || 0) + 1,
        members: formData.members || [],
        documents: [
          ...(formData.documentFront
            ? [
                {
                  filename: "documentFront.jpg",
                  originalName: "documentFront.jpg",
                  path: formData.documentFront,
                  type: "image",
                  mimetype: "image/jpeg",
                  uploadedAt: new Date().toISOString(),
                },
              ]
            : []),
          ...(headImage
            ? [
                {
                  filename: "family_head_photo.jpg",
                  originalName: "family_head_photo.jpg",
                  path: headImage,
                  type: "profile_photo",
                  mimetype: "image/jpeg",
                  uploadedAt: new Date().toISOString(),
                },
              ]
            : []),
          ...(formData.documentBack
            ? [
                {
                  filename: "documentBack.jpg",
                  originalName: "documentBack.jpg",
                  path: formData.documentBack,
                  type: "image",
                  mimetype: "image/jpeg",
                  uploadedAt: new Date().toISOString(),
                },
              ]
            : []),
          ...(cashPaymentImage
            ? [
                {
                  filename: "cashPaymentReceipt.jpg",
                  originalName: "cashPaymentReceipt.jpg",
                  path: cashPaymentImage,
                  type: "payment_screenshot",
                  mimetype: "image/jpeg",
                  uploadedAt: new Date().toISOString(),
                },
              ]
            : []),
        ],
        payment: {
          method: method || "cash",
          transactionId: finalTxnId,
          orderId: orderId || "",
          amount: parseFloat(formData.payment?.totalPaid || "120"),
          totalAmount: parseFloat(formData.payment?.totalPaid || "120"),
          customerName: customerName,
          customerEmail: formData.email?.trim() || "",
          customerPhone: formData.phone?.trim() || "",
          date: new Date().toISOString(),
        },
      };

      await apiService.createHealthCard(cardData);
      if (finalTxnId) setTxnId(finalTxnId);
      setPaymentCompleted(true);
      setSaveError(""); // Clear any previous errors on success
      setCurrentStep(4); // Auto-advance to receipt step
    } catch (err) {
      console.error("Health card create error:", err);
      const errMsg = err.response?.data?.message || err.message || "";
      
      // If the error says the transaction already exists, it means the card was created on a previous attempt
      if (errMsg.toLowerCase().includes("already exists")) {
        console.log("Card already exists, proceeding to receipt.");
        if (finalTxnId) setTxnId(finalTxnId);
        setPaymentCompleted(true);
        setSaveError(""); 
        setCurrentStep(4);
        return;
      }

      setSaveError(
        errMsg || "Failed to create health card. Please try again."
      );
    } finally {
      setSaveLoading(false);
    }
  };

  // --- UI PARTIALS ---

  const renderStepper = () => {
    const steps = [
      { num: 1, label: "Add Family Head" },
      { num: 2, label: "Add Members" },
      { num: 3, label: "Review" },
      { num: 4, label: "Payment" },
      { num: 5, label: "Receipt" },
    ];

    return (
      <div className="px-8 py-3 flex justify-center bg-white shrink-0 mb-6">
        <div className="flex items-center max-w-2xl w-full justify-between relative py-2">
          {/* Step lines background */}
          <div className="absolute top-[35%] left-[10%] w-[80%] h-[2px] bg-[#f7e5bc] -z-10"></div>
          <div
            className="absolute top-[35%] left-[10%] h-[2px] bg-[#fa8112] -z-10 transition-all duration-500"
            style={{ width: `${(currentStep - 1) * 25}%` }}
          ></div>

          {steps.map((step) => (
            <div
              key={step.num}
              className="flex flex-col items-center bg-white relative z-10 w-[100px]"
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
                className={`text-[12px] text-center max-w-[90px] leading-tight mt-1 ${
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
  };

  const renderStep1FillDetails = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-4xl mx-auto">
      <div className="bg-[#FAF3E1] rounded-lg p-3 px-4 flex items-center gap-3 border-l-4 border-[#FA8112] mb-5">
        <User size={20} className="text-[#222222]" />
        <h3 className="font-bold text-[16px] text-[#222222]">
          Family Head Details
        </h3>
      </div>

      <div className="mb-4">
        <h3 className="text-[16px] font-bold text-[#222222] mb-1">
          Upload Identity Document
        </h3>
        <p className="text-[#666666] text-[15px]">
          Please upload or scan an identity document of the family head (Aadhaar, PAN, etc.)
        </p>
      </div>

      <div className="flex flex-col gap-4 mb-8 relative w-full items-center justify-center">
        {/* Scanner Section */}
        <div className="w-full border-2 border-[#fa8112]/30 bg-orange-50/20 p-4 sm:p-8 rounded-3xl flex flex-col items-center justify-center transition-all overflow-hidden min-h-[400px]">
            {cameraActive ? (
              <div className="w-full max-w-md space-y-4 animate-in fade-in zoom-in-95">
                <div className="relative aspect-[4/3] bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
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
                      <p className="text-white text-[12px] font-bold animate-pulse">Scanning Code... {ocrProgress}%</p>
                      <div className="absolute left-0 right-0 h-0.5 bg-[#fa8112] shadow-[0_0_10px_#fa8112] blur-[1px] animate-[scan_2s_infinite]"></div>
                    </div>
                  )}
                  <style>{`
                    @keyframes scan {
                      0% { top: 20%; }
                      50% { top: 80%; }
                      100% { top: 20%; }
                    }
                  `}</style>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-20">Align Card Within Frame</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={stopCamera}
                    className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={capturePhoto}
                    disabled={ocrLoading}
                    className="flex-[2] py-4 bg-[#fa8112] hover:bg-[#e47510] text-white rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    {ocrLoading ? <Loader2 className="animate-spin" /> : <Camera size={20} />}
                    {ocrLoading ? "Scanning..." : "Capture & Scan"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center group">
                <div 
                  className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6 cursor-pointer hover:scale-105 transition-all border border-orange-100 group-hover:border-[#fa8112]/50"
                  onClick={startCamera}
                >
                  {ocrLoading ? <Loader2 className="animate-spin text-[#fa8112]" size={36} /> : <Camera size={36} className="text-[#fa8112]" />}
                </div>
                <h4 className="font-bold text-[#22333B] text-lg mb-2">Live OCR Scanner</h4>
                <p className="text-[13px] text-gray-500 max-w-[280px] text-center mb-6">Open your camera to instantly extract details from Aadhaar or PAN cards.</p>
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button 
                      onClick={startCamera}
                      className="px-8 py-3.5 bg-[#fa8112] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-200 transition-all"
                    >
                      <Camera size={18} /> Open Camera
                    </button>
                    <button 
                      onClick={() => document.getElementById('ocr-input-create').click()}
                      className="px-6 py-3.5 bg-white border-2 border-orange-100 text-[#fa8112] rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-50 transition-all"
                    >
                      <UploadCloud size={18} /> From Gallery
                    </button>
                  </div>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
              <input id="ocr-input-create" type="file" accept="image/*" capture="environment" className="hidden" onChange={handleScanImage} />
            </div>

            {/* Upload Section */}
            <div className="w-full border-2 border-[#fa8112]/30 bg-orange-50/40 p-6 rounded-[32px]">
              <h4 className="text-[15px] font-bold text-[#222222] mb-1 text-center">
                Upload Identity Document (JPG/PNG)
              </h4>
              <p className="text-[12px] text-gray-600 text-center mb-4">
                Step 1: Scan to auto-fill details (optional). Step 2: Upload a clear photo of the same document.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => fileInputFrontRef.current?.click()}
                  className={`w-full sm:w-auto flex flex-col items-center justify-center py-6 px-6 rounded-3xl transition-all shadow-sm ${
                    formData.documentFront
                      ? "bg-white border-2 border-green-500"
                      : "bg-white border-2 border-transparent hover:border-[#fa8112]"
                  }`}
                >
                  <div className={`w-12 h-12 ${
                    formData.documentFront ? "bg-green-500" : "bg-[#fa8112]"
                  } rounded-2xl flex items-center justify-center text-white mb-3 shadow-inner`}>
                    {formData.documentFront ? <Check size={24} /> : <UploadCloud size={24} />}
                  </div>
                  <span className="text-[15px] font-bold text-[#222222]">
                    {formData.documentFront ? "Document Selected" : "Upload Document"}
                  </span>
                </button>
              </div>
            </div>

          <div className="flex flex-col items-center justify-center mt-6 mb-8 w-full max-w-md mx-auto">
            {!headImage ? (
              <div
                className="border border-dashed border-gray-300 bg-white rounded-xl py-6 px-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors w-[200px]"
                onClick={() => headImageInputRef.current?.click()}
              >
                <UploadCloud className="text-[#a4a4a4] mb-2" size={24} />
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
                  onClick={() => setHeadImage("")}
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              ref={headImageInputRef}
              className="hidden"
              onChange={handleHeadImageUpload}
            />
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div>
          <label className="block text-[14px] font-bold text-[#222222] mb-1.5">
            Application ID
          </label>
          <input
            type="text"
            value={formData.id}
            onChange={(e) => handleChange(e, "id")}
            className="w-full border-2 border-[#E2E8F0] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[#fa8112] bg-white transition-all font-medium"
          />
        </div>
        <div>
          <label className="block text-[14px] font-bold text-[#222222] mb-1.5">
            Application Date
          </label>
          <input
            type="date"
            value={formatDateForInput(formData.dateApplied)}
            onChange={(e) => handleDateChange(e, "dateApplied")}
            className="w-full border-2 border-[#E2E8F0] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[#fa8112] bg-white transition-all font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        <div>
          <label className="block text-[14px] font-bold text-[#222222] mb-1.5">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.applicantFirstName}
            onChange={(e) => handleChange(e, "applicantFirstName")}
            className="w-full border-2 border-[#E2E8F0] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[#fa8112] bg-white transition-all font-medium"
            placeholder="Enter first name"
          />
        </div>
        <div>
          <label className="block text-[14px] font-bold text-[#222222] mb-1.5">
            Middle Name
          </label>
          <input
            type="text"
            value={formData.applicantMiddleName}
            onChange={(e) => handleChange(e, "applicantMiddleName")}
            className="w-full border-2 border-[#E2E8F0] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[#fa8112] bg-white transition-all font-medium"
            placeholder="Enter middle name"
          />
        </div>
        <div>
          <label className="block text-[14px] font-bold text-[#222222] mb-1.5">
            Last Name
          </label>
          <input
            type="text"
            value={formData.applicantLastName}
            onChange={(e) => handleChange(e, "applicantLastName")}
            className="w-full border-2 border-[#E2E8F0] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[#fa8112] bg-white transition-all font-medium"
            placeholder="Enter last name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div>
          <label className="block text-[14px] font-bold text-[#222222] mb-1.5">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={formatDateForInput(formData.dob)}
              onChange={(e) => handleDateChange(e, "dob")}
              className="w-full border-2 border-[#E2E8F0] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[#fa8112] bg-white transition-all font-medium"
            />
          </div>
        </div>
        <div>
          <label className="block text-[14px] font-bold text-[#222222] mb-1.5">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.gender}
            onChange={(e) => handleChange(e, "gender")}
            className="w-full border-2 border-[#E2E8F0] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[#fa8112] bg-white appearance-none transition-all font-medium"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div>
          <label className="block text-[14px] font-bold text-[#222222] mb-1.5">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => handleChange(e, "phone")}
            className="w-full border-2 border-[#E2E8F0] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[#fa8112] bg-white transition-all font-medium"
            placeholder="10-digit mobile number"
            maxLength={10}
          />
        </div>
        <div>
          <label className="block text-[14px] font-bold text-[#222222] mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange(e, "email")}
            className="w-full border-2 border-[#E2E8F0] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[#fa8112] bg-white transition-all font-medium"
            placeholder="email@example.com"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-[14px] font-bold text-[#222222] mb-1.5">
          Aadhaar Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.aadhaarNumber || ""}
          onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value.replace(/\D/g, "").slice(0, 12) })}
          placeholder="Enter 12-digit Aadhaar number"
          className="w-full border-2 border-[#E2E8F0] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[#fa8112] bg-white transition-all font-medium"
        />
      </div>

      {/* Relation and Father/Husband Name removed */}

      <div className="mb-4">
        <label className="block text-[14px] font-bold text-[#222222] mb-1.5">
          Full Address <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={3}
          value={formData.address}
          onChange={(e) => handleChange(e, "address")}
          className="w-full border-2 border-[#E2E8F0] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[#fa8112] bg-white resize-none transition-all font-medium"
          placeholder="Complete residential address"
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-[14px] font-bold text-[#222222] mb-1.5">
            Pincode <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.pincode}
            onChange={(e) => handleChange(e, "pincode")}
            className="w-full border-2 border-[#E2E8F0] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[#fa8112] bg-white transition-all font-medium"
            placeholder="6-digit pincode"
            maxLength={6}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2Members = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-4xl mx-auto">
      <div className="bg-[#FAF3E1] rounded-lg p-3 px-4 flex items-center justify-between border-l-4 border-[#FA8112] mb-5">
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-[#222222]" />
          <h3 className="font-bold text-[16px] text-[#222222]">
            Add Family Members
          </h3>
        </div>
        <span className="bg-white px-3 py-1 rounded-full text-[12px] font-bold text-[#fa8112] border border-[#fa8112]">
          {(formData.members || []).length} Members Added
        </span>
      </div>

      <div className="mb-6">
        <p className="text-[#666666] text-[15px] mb-4">
          You can add up to 7 family members to your Ayush Card application.
        </p>
        
        <div className="space-y-4">
          {(formData.members || []).map((member, index) => (
             <div key={index} className="bg-white border-2 border-[#E2E8F0] rounded-xl p-5 relative">
                <button 
                  onClick={() => {
                    const newMembers = formData.members.filter((_, idx) => idx !== index);
                    setFormData({ ...formData, members: newMembers });
                  }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[13px] font-bold text-[#222222] mb-1">Name</label>
                    <input 
                      type="text"
                      value={member.name}
                      onChange={(e) => {
                        const newMembers = [...formData.members];
                        newMembers[index].name = e.target.value.replace(/[0-9]/g, "");
                        setFormData({ ...formData, members: newMembers });
                      }}
                      className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-[#fa8112]"
                      placeholder="Member Name"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-[#222222] mb-1">Relation</label>
                    <input 
                      type="text"
                      value={member.relation}
                      onChange={(e) => {
                        const newMembers = [...formData.members];
                        newMembers[index].relation = e.target.value;
                        setFormData({ ...formData, members: newMembers });
                      }}
                      className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-[#fa8112]"
                      placeholder="e.g. Son, Daughter"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-[#222222] mb-1">Age</label>
                    <input 
                      type="text"
                      value={member.age}
                      onChange={(e) => {
                        const newMembers = [...formData.members];
                        newMembers[index].age = e.target.value.replace(/\D/g, "");
                        setFormData({ ...formData, members: newMembers });
                      }}
                      className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-[#fa8112]"
                      placeholder="Age"
                      maxLength={3}
                    />
                  </div>
                </div>
             </div>
          ))}
        </div>

        {(formData.members || []).length < 7 && (
          <button 
            onClick={() => {
              setFormData({
                ...formData,
                members: [...(formData.members || []), { name: "", relation: "", age: "" }]
              });
            }}
            className="w-full mt-4 py-4 border-2 border-dashed border-[#fa8112] rounded-xl flex items-center justify-center gap-2 text-[#fa8112] font-bold hover:bg-orange-50 transition-all"
          >
            <Plus size={20} />
            Add Another Family Member
          </button>
        )}
      </div>
    </div>
  );

  const renderStep3Review = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-4xl mx-auto">
      <div className="bg-[#FAF3E1] rounded-lg p-3 px-4 flex items-center gap-3 border-l-4 border-[#FA8112] mb-5">
        <CheckCircle2 size={20} className="text-[#222222]" />
        <h3 className="font-bold text-[16px] text-[#222222]">
          Review Your Application
        </h3>
      </div>

      <div className="bg-white border-2 border-[#E2E8F0] rounded-xl overflow-hidden mb-6">
        <div className="flex justify-between items-center p-4 bg-gray-50 border-b-2 border-[#E2E8F0]">
            <h4 className="font-bold text-[#222222]">Card Preview</h4>
            <div className="flex bg-white rounded-lg p-1 border border-gray-200">
              <button 
                onClick={() => setCardSide("front")}
                className={`px-4 py-1.5 rounded-md text-[13px] font-bold transition-all ${cardSide === "front" ? "bg-[#fa8112] text-white shadow-md" : "text-gray-500"}`}
              >Front Side</button>
              <button 
                onClick={() => setCardSide("back")}
                className={`px-4 py-1.5 rounded-md text-[13px] font-bold transition-all ${cardSide === "back" ? "bg-[#fa8112] text-white shadow-md" : "text-gray-500"}`}
              >Back Side</button>
            </div>
        </div>
        <div className="p-8 flex items-center justify-center bg-[#fcfcfc]">
           <div className="w-full max-w-[500px]">
             <AyushCardPreview data={formData} side={cardSide} />
           </div>
        </div>
        <div className="p-5 border-t border-gray-100 grid grid-cols-2 md:grid-cols-5 gap-4 bg-white">
           <div>
             <p className="text-[11px] font-bold text-gray-400 uppercase">Head Name</p>
             <p className="text-[14px] font-bold text-[#222222] truncate">{formData.applicantFirstName} {formData.applicantLastName}</p>
           </div>
           <div>
             <p className="text-[11px] font-bold text-gray-400 uppercase">Aadhaar No</p>
             <p className="text-[14px] font-bold text-[#222222] truncate">{formData.aadhaarNumber || "—"}</p>
           </div>
           <div>
             <p className="text-[11px] font-bold text-gray-400 uppercase">Contact</p>
             <p className="text-[14px] font-bold text-[#222222]">{formData.phone}</p>
           </div>
           <div>
             <p className="text-[11px] font-bold text-gray-400 uppercase">Members</p>
             <p className="text-[14px] font-bold text-[#222222]">{(formData.members?.length || 0) + 1}</p>
           </div>
           <div className="text-right">
             <p className="text-[11px] font-bold text-gray-400 uppercase">Amount</p>
             <p className="text-[14px] font-bold text-[#fa8112]">₹{formData.payment.totalPaid}</p>
           </div>
        </div>
      </div>
    </div>
  );

  const renderStep4Payment = () => {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-4xl mx-auto py-2 flex flex-col items-center">
        {!paymentMethod ? (
          <div className="w-full">
            <h3 className="font-bold text-[18px] text-[#222222] mb-6 text-center">
              Select Your Payment Method
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Online Payment */}
              <div
                onClick={() => setPaymentMethod("online")}
                className="border-2 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-lg border-[#E2E8F0] bg-white group hover:border-[#fa8112]"
              >
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#fa8112] transition-colors">
                   <UploadCloud size={28} className="text-[#fa8112] group-hover:text-white" />
                </div>
                <h4 className="font-bold text-[#222222] text-[18px] mb-2">Online Payment</h4>
                <p className="text-sm text-gray-500 mb-6">
                  Secure checkout via UPI, Cards, or Netbanking. Fast and instant confirmation.
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-md border border-green-100 uppercase">FAST</span>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md border border-blue-100 uppercase">SECURE</span>
                </div>
              </div>

              {/* Cash Payment */}
              <div
                onClick={() => setPaymentMethod("cash")}
                className="border-2 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-lg border-[#E2E8F0] bg-white group hover:border-[#fa8112]"
              >
                 <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#fa8112] transition-colors">
                   <FileText size={28} className="text-[#fa8112] group-hover:text-white" />
                </div>
                <h4 className="font-bold text-[#222222] text-[18px] mb-2">Cash Payment</h4>
                <p className="text-sm text-gray-500 mb-6">
                  Hand over cash to the agent. Receipt will be generated after agent confirmation.
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-gray-50 text-gray-700 text-[10px] font-bold rounded-md border border-gray-100 uppercase">AGENT</span>
                  <span className="px-3 py-1 bg-orange-50 text-[#fa8112] text-[10px] font-bold rounded-md border border-orange-100 uppercase">OFFLINE</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="flex flex-col gap-2 mb-6">
              <button
                onClick={() => setPaymentMethod(null)}
                className="flex items-center gap-2 text-sm text-[#fa8112] font-bold hover:underline self-start mb-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5"></path>
                  <path d="M12 19l-7-7 7-7"></path>
                </svg>
                Change Payment Method
              </button>
              <h3 className="font-bold text-[22px] text-[#222222]">
                {paymentMethod === "online" ? "Complete Online Payment" : "Cash Collection"}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white border-2 border-[#E2E8F0] rounded-2xl p-6 shadow-sm h-fit">
                  <h4 className="font-bold text-[#222222] mb-4 text-[16px]">Summary</h4>
                  <div className="space-y-3">
                     <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500 text-[14px]">Application Fee</span>
                        <span className="font-bold text-[#222222]">₹{Number(formData.payment.applicationFee || 120).toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500 text-[14px]">Member Add-ons ({(formData.members || []).length})</span>
                        <span className="font-bold text-[#222222]">₹{Number(formData.payment.memberAddOns || 0).toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between items-center py-4">
                        <span className="font-bold text-[#222222] text-[16px]">Total Payable</span>
                        <span className="font-bold text-[#fa8112] text-[24px]">₹{Number(formData.payment.totalPaid || 120).toFixed(2)}</span>
                     </div>
                  </div>
               </div>

               <div className="flex flex-col gap-4">
                  {paymentMethod === "online" ? (
                    <div className="bg-[#fa8112]/5 border-2 border-[#fa8112] rounded-2xl p-6 flex flex-col items-center text-center">
                       <div className="w-16 h-16 bg-[#fa8112] rounded-full flex items-center justify-center text-white mb-4 shadow-lg">
                          <UploadCloud size={32} />
                       </div>
                       <h5 className="font-bold text-[18px] text-[#222222] mb-2">Instant Activation</h5>
                       <p className="text-sm text-gray-500 mb-6">Payment is processed securely via Cashfree. Your Ayush Card will be activated instantly upon success.</p>
                       
                       {txnId ? (
                         <div className="w-full bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col gap-3">
                           <div className="flex items-center justify-center gap-2 text-green-700 font-bold">
                             <CheckCircle2 size={20} /> Payment Success
                           </div>
                           <button onClick={() => performSave("online", txnId)} disabled={saveLoading} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2">
                             {saveLoading ? <Loader2 className="animate-spin" size={18} /> : "Record & Proceed"}
                           </button>
                         </div>
                       ) : (
                         <>
                           {!orderId ? (
                             <button onClick={handleInitiateOnlinePayment} disabled={onlinePaymentLoading} className="w-full py-4 bg-[#fa8112] hover:bg-[#e47510] text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 text-[16px]">
                               {onlinePaymentLoading ? <Loader2 className="animate-spin" size={20} /> : "Pay ₹"+formData.payment.totalPaid}
                             </button>
                           ) : (
                             <div className="w-full space-y-3">
                                <div className="p-3 bg-blue-50 text-blue-700 rounded-xl text-[12px] font-medium border border-blue-100">
                                  Waiting for payment... Click verify after completing.
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <button onClick={() => setOrderId(null)} className="py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all">Retry</button>
                                  <button onClick={() => handleConfirmOnlinePayment()} disabled={verifyLoading} className="py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 flex items-center justify-center gap-2 transition-all">
                                    {verifyLoading ? <Loader2 size={16} className="animate-spin" /> : "Verify Payment"}
                                  </button>
                                </div>
                             </div>
                           )}
                         </>
                       )}
                    </div>
                  ) : (
                    <div className="bg-[#FAF3E1] border-2 border-[#fa8112] rounded-2xl p-6 flex flex-col gap-4">
                       <h5 className="font-bold text-[18px] text-[#222222]">Agent Checklist</h5>

                       {/* Cash payment proof upload (camera + gallery) */}
                       <div className="space-y-3">
                         <p className="text-[13px] font-semibold text-gray-700">Cash Payment Proof (optional)</p>

                         {cashCameraActive ? (
                           <div className="border-2 border-dashed border-[#fa8112]/60 rounded-2xl p-4 bg-white flex flex-col gap-3">
                             <div className="relative aspect-[4/3] bg-black rounded-xl overflow-hidden">
                               <video
                                 ref={cashCameraVideoRef}
                                 autoPlay
                                 playsInline
                                 className="w-full h-full object-contain"
                               />
                             </div>
                             <div className="flex gap-3">
                               <button
                                 type="button"
                                 onClick={stopCashCamera}
                                 className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-semibold"
                               >
                                 Cancel
                               </button>
                               <button
                                 type="button"
                                 disabled={cashCameraLoading}
                                 onClick={captureCashReceipt}
                                 className="flex-1 py-2.5 rounded-xl bg-[#fa8112] hover:bg-[#e47510] text-white text-[13px] font-semibold flex items-center justify-center gap-2"
                               >
                                 {cashCameraLoading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                                 {cashCameraLoading ? "Capturing..." : "Capture & Attach"}
                               </button>
                             </div>
                             <canvas ref={cashCameraCanvasRef} className="hidden" />
                           </div>
                         ) : (
                           <div className="flex flex-col sm:flex-row gap-3">
                             <button
                               type="button"
                               onClick={startCashCamera}
                               className="flex-1 py-3 px-4 rounded-xl bg-[#fa8112] hover:bg-[#e47510] text-white text-[13px] font-semibold flex items-center justify-center gap-2 shadow-sm"
                             >
                               <Camera size={18} />
                               {cashPaymentImage ? "Retake with Camera" : "Use Camera"}
                             </button>
                             <button
                               type="button"
                               onClick={() => cashPaymentInputRef.current?.click()}
                               className="flex-1 py-3 px-4 rounded-xl border-2 border-dashed border-[#fa8112] bg-orange-50/40 hover:bg-orange-50 text-[13px] font-semibold text-[#222222] flex items-center justify-center gap-2"
                             >
                               <UploadCloud size={18} className="text-[#fa8112]" />
                               {cashPaymentImage ? "Change Image" : "Upload from Gallery"}
                             </button>
                             <input
                               type="file"
                               accept="image/*"
                               capture="environment"
                               ref={cashPaymentInputRef}
                               className="hidden"
                               onChange={handleCashPaymentScreenshotUpload}
                             />
                           </div>
                         )}

                         {cashPaymentImage && !cashCameraActive && (
                           <p className="text-[11px] text-green-600 font-medium">Cash receipt image attached.</p>
                         )}
                       </div>

                       <div className="space-y-4 mt-2">
                          <label className="flex items-start gap-3 cursor-pointer group">
                             <div className="mt-0.5 w-5 h-5 rounded border-2 border-[#fa8112] flex items-center justify-center group-hover:bg-orange-50">
                               <Check size={14} className="text-[#fa8112]" />
                             </div>
                             <span className="text-[13px] font-medium text-gray-700">Collect exactly ₹{formData.payment.totalPaid}.00 from patient</span>
                          </label>
                          <label className="flex items-start gap-3 cursor-pointer group">
                             <div className="mt-0.5 w-5 h-5 rounded border-2 border-[#fa8112] flex items-center justify-center group-hover:bg-orange-50">
                               <Check size={14} className="text-[#fa8112]" />
                             </div>
                             <span className="text-[13px] font-medium text-gray-700">Verify original Aadhaar/PAN Card document</span>
                          </label>
                          <label className="flex items-start gap-3 cursor-pointer group">
                             <div className="mt-0.5 w-5 h-5 rounded border-2 border-[#fa8112] flex items-center justifycenter group-hover:bg-orange-50">
                               <Check size={14} className="text-[#fa8112]" />
                             </div>
                             <span className="text-[13px] font-medium text-gray-700">Ensure all family members are accurately listed</span>
                          </label>
                       </div>
                       <button 
                         onClick={() => performSave("cash", null)} 
                         disabled={saveLoading}
                         className="w-full mt-2 py-4 bg-[#fa8112] hover:bg-[#e47510] text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          {saveLoading ? <Loader2 className="animate-spin" size={20} /> : "Confirm & Save (Cash Received)"}
                       </button>
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderThermalReceipt = () => (
    <div id="thermal-receipt" className="hidden print:block w-[3in] bg-white p-4 font-sans text-black">
      <div className="text-center border-b-2 border-dashed border-gray-300 pb-3 mb-3">
        <h2 className="font-bold text-[16px] uppercase tracking-tight">BKBS TRUST</h2>
        <p className="text-[10px] leading-none opacity-80">Ayushman Sewa Sansthan</p>
      </div>
      
      <div className="flex justify-between text-[11px] mb-1">
        <span className="font-semibold uppercase opacity-60">Date:</span>
        <span className="font-bold">{new Date().toLocaleDateString()}</span>
      </div>
      <div className="flex justify-between text-[11px] mb-3">
        <span className="font-semibold uppercase opacity-60">Receipt:</span>
        <span className="font-bold">{formData.id}</span>
      </div>
      
      <div className="border-y border-dashed border-gray-300 py-2 mb-3">
        <div className="flex flex-col mb-1 text-[11px]">
          <span className="uppercase opacity-60 font-semibold mb-0.5">Applicant:</span>
          <span className="font-bold text-[13px] uppercase break-words">
            {[formData.applicantFirstName, formData.applicantMiddleName, formData.applicantLastName].filter(Boolean).join(" ")}
          </span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="font-semibold uppercase opacity-60">Phone:</span>
          <span className="font-bold">{formData.phone}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between font-bold text-[10px] uppercase opacity-60 mb-2">
          <span>Item Description</span>
          <span>Amount</span>
        </div>
        <div className="flex justify-between text-[12px] mb-1">
          <span>Card Generation Fee</span>
          <span className="font-bold">₹{formData.payment.applicationFee}</span>
        </div>
        {(formData.members || []).length > 0 && (
          <div className="flex justify-between text-[12px] mb-1">
            <span>Members Add-on ({(formData.members || []).length})</span>
            <span className="font-bold">₹{formData.payment.memberAddOns}</span>
          </div>
        )}
        <div className="flex justify-between font-bold border-t-2 border-black pt-2 mt-2 text-[16px]">
          <span>TOTAL PAID</span>
          <span>₹{formData.payment.totalPaid}</span>
        </div>
      </div>

      <div className="text-[9px] mt-6 border-t border-dashed border-gray-300 pt-3 text-left space-y-1">
        <div className="flex gap-1">
          <span className="font-bold uppercase opacity-60 shrink-0 italic">TXN ID:</span>
          <span className="font-bold break-all">{txnId}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold uppercase opacity-60 italic">Mode:</span>
          <span className="font-bold">{paymentMethod?.toUpperCase()}</span>
        </div>
        <p className="text-center font-bold text-[11px] mt-4 uppercase tracking-wider border border-black py-1">Verified & Secure</p>
        <p className="text-center opacity-70 text-[8px] mt-2 italic">* This is a computer generated receipt</p>
      </div>
    </div>
  );

  const handleDownloadReceipt = () => {
    window.print();
  };

  const handleFinalSave = () => {
    // Card was already saved via API in performSave (Step 3)
    // Just navigate back to health card list
    navigate("/employee/health-card");
  };

  const renderStep5Receipt = () => (
    <div className="w-full flex justify-center items-start pt-2 pb-12 animate-in fade-in zoom-in-95 duration-500">
      <style>{`
        @media print {
          @page {
            size: 3in auto;
            margin: 0;
          }
          body * {
            visibility: hidden !important;
          }
          #thermal-receipt, #thermal-receipt * {
            visibility: visible !important;
          }
          #thermal-receipt {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 3in !important;
            margin: 0 !important;
            padding: 12px !important;
            display: block !important;
          }
        }
      `}</style>
      
      {/* Hidden Thermal Receipt for Printing */}
      {renderThermalReceipt()}

      <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-xl border-2 border-[#E2E8F0] overflow-hidden flex flex-col mb-4 no-print">
        {/* Top Header Card */}
        <div className="bg-[#fa8112] p-8 flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#fa8112]">
                <Check size={28} strokeWidth={3} />
             </div>
          </div>
          <h2 className="text-white text-[22px] font-bold mb-1">Application Submitted!</h2>
          <div className="text-white/90 text-[14px] font-medium">Ayush Card Status: <span className="text-white font-bold">ACTIVE</span></div>
        </div>

        {/* Receipt Details */}
        <div className="p-6 space-y-6">
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Application ID</p>
                 <p className="text-[14px] font-bold text-[#222222]">{formData.id}</p>
              </div>
              <div className="text-right">
                 <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Date</p>
                 <p className="text-[14px] font-bold text-[#222222]">{new Date().toLocaleDateString()}</p>
              </div>
           </div>

           <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0] space-y-3">
              <div className="flex justify-between text-[13px]">
                 <span className="text-gray-500">Applicant Name</span>
                 <span className="font-bold text-[#222222] uppercase">{formData.applicantFirstName} {formData.applicantLastName}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                 <span className="text-gray-500">Total Amount</span>
                 <span className="font-bold text-[#222222]">₹{formData.payment.totalPaid}.00</span>
              </div>
              <div className="flex justify-between text-[13px]">
                 <span className="text-gray-500">Payment Mode</span>
                 <span className="font-bold text-[#fa8112] uppercase tracking-wide">{paymentMethod}</span>
              </div>
           </div>

           <div className="flex flex-col gap-3">
              <button 
                onClick={handleDownloadReceipt}
                className="w-full py-4 bg-[#222222] hover:bg-black text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <UploadCloud size={20} />
                Download Print Receipt
              </button>
              <button 
                onClick={() => navigate("/employee/health-card")}
                className="w-full py-4 bg-white border-2 border-[#E2E8F0] text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                Go to Healthcard List
              </button>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-all">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[1000px] h-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-[22px] font-bold text-[#222222]">Ayush Card Application</h2>
            <p className="text-[12px] text-gray-500 font-medium">BKBS Human Welfare & Social Trust</p>
          </div>
          <button
            onClick={() => navigate("/employee/health-card")}
            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Stepper */}
        {renderStepper()}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          {currentStep === 1 && renderStep1FillDetails()}
          {currentStep === 2 && renderStep2Members()}
          {currentStep === 3 && renderStep3Review()}
          {currentStep === 4 && renderStep4Payment()}
          {currentStep === 5 && renderStep5Receipt()}
        </div>

        {/* Footer */}
        {currentStep < 5 && (
          <div className="px-8 py-5 border-t border-gray-100 flex justify-between items-center shrink-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            <button
              onClick={handleBack}
              disabled={currentStep === 1 || saveLoading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-[14px] transition-all ${
                currentStep === 1 || saveLoading
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:text-[#fa8112] hover:bg-orange-50"
              }`}
            >
              Back
            </button>

            <div className="flex items-center gap-4">
               {saveError && <p className="text-red-500 text-sm font-bold animate-shake">{saveError}</p>}
               <button
                  onClick={handleNext}
                  disabled={saveLoading || (currentStep === 4 && !paymentMethod && !paymentCompleted)}
                  className={`flex items-center gap-2 px-10 py-3 bg-[#fa8112] hover:bg-[#e47510] text-white rounded-xl font-bold text-[15px] transition-all shadow-md disabled:bg-gray-300 disabled:shadow-none min-w-[140px] justify-center`}
                >
                  {saveLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    currentStep === 4 ? (paymentCompleted ? "Finish" : "Next") : "Continue"
                  )}
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
  const handleCashPaymentScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toastWarn("Image size should be less than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setCashPaymentImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

export default CreateHealthCard;
