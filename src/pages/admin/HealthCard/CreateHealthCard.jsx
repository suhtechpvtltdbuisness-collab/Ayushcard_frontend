import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  ChevronDown,
  Plus,
  Loader2,
  Check,
  User,
  UploadCloud,
  ScanLine,
  FileText,
  CheckCircle2,
  CreditCard,
  Banknote,
  Download,
  Camera,
  RefreshCw,
  Info,
} from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("upload");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [cardSide, setCardSide] = useState("front"); // for preview
  const [orderId, setOrderId] = useState(null); // from create-order response
  const [paymentOrderData, setPaymentOrderData] = useState(null); // full create-order response
  const [txnId, setTxnId] = useState(""); // final transaction id after verify
  const [onlinePaymentLoading, setOnlinePaymentLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

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

  // Member scanning state
  const [memberScanningIndex, setMemberScanningIndex] = useState(null);
  const [memberScanProgress, setMemberScanProgress] = useState(0);
  const memberVideoRef = useRef(null);
  const memberCanvasRef = useRef(null);
  const memberStreamRef = useRef(null);
  const [memberCameraActive, setMemberCameraActive] = useState(false);
  const memberInputRef = useRef(null);

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
    };
  }, []);

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

  const handleScanImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use URL.createObjectURL to show preview locally
    const base64String = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

    setOcrLoading(true);
    setOcrProgress(0);
    setFormData((prev) => ({ ...prev, documentFront: base64String }));
    documentFrontFileRef.current = file;

    try {
      const details = await performOCR(base64String, (p) => setOcrProgress(p));
      if (details) {
        // Split name into first and last if needed
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
            (details.type === "aadhaar"
              ? details.docNumber
              : prev.aadhaarNumber) ||
            prev.aadhaarNumber ||
            "",
          dob: details.dob
            ? details.dob.split("-").reverse().join("-")
            : prev.dob || "",
          pincode: details.pincode || prev.pincode || "",
          address: details.address || prev.address || "",
          gender: details.gender || prev.gender || "",
        }));
        toastSuccess("Details extracted from card!");
      }
    } catch (err) {
      console.error("OCR Error:", err);
      toastWarn(
        "Could not extract details automatically. Please fill manually.",
      );
    } finally {
      setOcrLoading(false);
      setOcrProgress(0);
    }
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
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      console.error("Camera error:", err);
      toastError(
        "Could not access camera. Please check permissions or use Gallery Upload.",
      );
    } finally {
      setOcrLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setOcrLoading(true);
    setOcrProgress(0);
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
            (details.type === "aadhaar"
              ? details.docNumber
              : prev.aadhaarNumber) ||
            prev.aadhaarNumber ||
            "",
          dob: details.dob
            ? details.dob.split("-").reverse().join("-")
            : prev.dob || "",
          pincode: details.pincode || prev.pincode || "",
          address: details.address || prev.address || "",
          gender: details.gender || prev.gender || "",
          documentFront: base64,
        }));
        toastSuccess("Details extracted successfully!");
      }
    } catch (err) {
      console.error("Capture OCR Error:", err);
      toastWarn("Could not extract details. Please enter manually.");
      setFormData((prev) => ({ ...prev, documentFront: base64 }));
    } finally {
      setOcrLoading(false);
      setOcrProgress(0);
    }
  };

  // Member Scanning Functions
  const startMemberCamera = async (index) => {
    try {
      setMemberScanningIndex(index);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      memberStreamRef.current = stream;
      setMemberCameraActive(true);
    } catch (err) {
      console.error("Member camera error:", err);
      toastWarn("Could not access camera. Please use Gallery Upload.");
    }
  };

  const stopMemberCamera = () => {
    if (memberStreamRef.current) {
      memberStreamRef.current.getTracks().forEach((track) => track.stop());
      memberStreamRef.current = null;
    }
    if (memberVideoRef.current) memberVideoRef.current.srcObject = null;
    setMemberCameraActive(false);
    setMemberScanningIndex(null);
  };

  const calculateAge = (dobStr) => {
    if (!dobStr) return "";
    try {
      const [year, month, day] = dobStr.split("-");
      if (!year || !month || !day) return "";

      const today = new Date();
      const birthDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
      );
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      return age > 0 && age < 120 ? age.toString() : "";
    } catch (e) {
      return "";
    }
  };

  const captureMemberPhoto = async () => {
    if (
      !memberVideoRef.current ||
      !memberCanvasRef.current ||
      memberScanningIndex === null
    )
      return;

    const video = memberVideoRef.current;
    const canvas = memberCanvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64 = canvas.toDataURL("image/jpeg", 0.8);
    stopMemberCamera();

    try {
      const results = await performOCR(base64, (p) => setMemberScanProgress(p));
      if (results) {
        const age = calculateAge(results.dob);
        const updatedMembers = [...formData.members];
        updatedMembers[memberScanningIndex] = {
          ...updatedMembers[memberScanningIndex],
          name: results.name || "",
          age: age,
          scannedImage: base64,
        };
        setFormData((prev) => ({ ...prev, members: updatedMembers }));
        toastSuccess("Member details extracted successfully!");
      }
    } catch (err) {
      console.error("Member capture OCR Error:", err);
      toastWarn("Could not extract details. Please enter manually.");
    } finally {
      setMemberScanProgress(0);
    }
  };

  const handleMemberScanImage = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const base64String = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

    setMemberScanningIndex(index);
    setMemberScanProgress(0);

    try {
      const details = await performOCR(base64String, (p) =>
        setMemberScanProgress(p),
      );
      if (details) {
        const age = calculateAge(details.dob);
        const updatedMembers = [...formData.members];
        updatedMembers[index] = {
          ...updatedMembers[index],
          name: details.name || "",
          age: age,
          scannedImage: base64String,
        };
        setFormData((prev) => ({ ...prev, members: updatedMembers }));
        toastSuccess("Member details extracted successfully!");
      }
    } catch (err) {
      console.error("Member OCR Error:", err);
      toastWarn("Could not extract details. Please enter manually.");
    } finally {
      setMemberScanProgress(0);
      setMemberScanningIndex(null);
    }
  };

  useEffect(() => {
    if (
      memberCameraActive &&
      memberVideoRef.current &&
      memberStreamRef.current
    ) {
      memberVideoRef.current.srcObject = memberStreamRef.current;
    }
  }, [memberCameraActive]);

  useEffect(() => {
    return () => {
      if (memberStreamRef.current) {
        memberStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (
        !formData.applicantFirstName ||
        !formData.phone ||
        !formData.pincode
      ) {
        toastWarn("Head of Family details are incomplete.");
        return;
      }

      if (!formData.dob) {
        toastWarn("Date of Birth is required.");
        return;
      }
      const normalizedDob = formData.dob.replace(/\//g, "-");
      const dobParts = normalizedDob.split("-");
      if (dobParts.length === 3) {
        const [day, month, year] = dobParts;
        const dobDate = new Date(`${year}-${month}-${day}`);
        if (!isNaN(dobDate.getTime())) {
          const today = new Date();
          let age = today.getFullYear() - dobDate.getFullYear();
          const m = today.getMonth() - dobDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
            age--;
          }
          if (age < 18) {
            toastWarn("Head of Family must be at least 18 years old.");
            return;
          }
        }
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
      // Validate members if any
      for (const m of formData.members || []) {
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
        } else {
          toastWarn("Please complete online payment first.");
          return;
        }
      } else {
        setCurrentStep(5);
      }
    } else if (currentStep === 5) {
      navigate("/admin/health-card");
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
      const fullName =
        [p_firstName, p_middleName, p_lastName].filter(Boolean).join(" ") ||
        "Customer";

      const payload = {
        amount,
        customerName: fullName,
        customerEmail: (formData.email || "").trim() || "customer@example.com",
        customerPhone:
          (formData.phone || "").trim().replace(/\D/g, "").slice(0, 10) ||
          "9999999999",
      };

      const res = await apiService.createPaymentOrder(payload);
      console.log("[Cashfree] Create Order Response:", res);

      // Extract Cashfree session ID and order ID (be more robust with nested data)
      // We look in res, res.data, and res.data.data
      const possibleData = [
        res,
        res?.data,
        res?.data?.data,
        res?.order,
        res?.data?.order,
      ].filter(Boolean);

      let sessionId = null;
      let cOrderId = null;

      for (const d of possibleData) {
        sessionId =
          sessionId ||
          d.payment_session_id ||
          d.paymentSessionId ||
          d.cf_session_id ||
          d.sessionId;
        cOrderId = cOrderId || d.order_id || d.orderId || d.cf_order_id;
      }

      if (!sessionId) {
        console.error("[Cashfree] Missing session ID. Full response:", res);
        throw new Error(
          `Payment session ID not received. Server responded with: ${JSON.stringify(res)}`,
        );
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
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to initiate payment. Please try again.";
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
        verifyData,
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
            "Payment verification failed. Re-check or contact support.",
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
        err.response?.data?.message || err.message || "Payment not verified.",
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
                  name: "documentFront",
                  path: formData.documentFront,
                  type: "image",
                },
              ]
            : []),
          ...(formData.documentBack
            ? [
                {
                  name: "documentBack",
                  path: formData.documentBack,
                  type: "image",
                },
              ]
            : []),
          ...(cashPaymentImage
            ? [
                {
                  name: "cashPaymentReceipt",
                  path: cashPaymentImage,
                  type: "payment_screenshot",
                },
              ]
            : []),
          ...(headImage
            ? [
                {
                  name: "family_head_photo.jpg",
                  path: headImage,
                  type: "profile_photo",
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
      setCurrentStep(5); // Auto-advance to receipt step
    } catch (err) {
      console.error("Ayush card create error:", err);
      const errMsg = err.response?.data?.message || err.message || "";

      // If the error says the transaction already exists, it means the card was created on a previous attempt
      if (errMsg.toLowerCase().includes("already exists")) {
        console.log("Card already exists, proceeding to receipt.");
        if (finalTxnId) setTxnId(finalTxnId);
        setPaymentCompleted(true);
        setSaveError("");
        setCurrentStep(5);
        return;
      }

      setSaveError(errMsg || "Failed to create ayush card. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  // --- UI PARTIALS ---

  const renderStepper = () => {
    const steps = [
      { id: 1, name: "Add Family Head" },
      { id: 2, name: "Add Members" },
      { id: 3, name: "Review Card" },
      { id: 4, name: "Payment" },
      { id: 5, name: "Receipt" },
    ];

    return (
      <div className="px-8 py-3 flex justify-center bg-white shrink-0 mb-6 border-b border-gray-50">
        <div className="flex items-center max-w-3xl w-full justify-between relative py-2">
          {/* Step lines background */}
          <div className="absolute top-[35%] left-[5%] w-[90%] h-[2px] bg-orange-50 -z-10"></div>
          <div
            className="absolute top-[35%] left-[5%] h-[2px] bg-[#fa8112] -z-10 transition-all duration-500"
            style={{ width: `${(currentStep - 1) * 22.5}%` }}
          ></div>

          {steps.map((step) => (
            <div
              key={step.id}
              className="flex flex-col items-center bg-white relative z-10 w-[120px]"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold mb-2 transition-all duration-300 ${
                  currentStep === step.id
                    ? "bg-[#fa8112] text-white shadow-lg scale-110"
                    : currentStep > step.id
                      ? "bg-[#fa8112] text-white"
                      : "border-2 border-orange-100 bg-white text-gray-400"
                }`}
              >
                {currentStep > step.id ? (
                  <Check size={20} strokeWidth={3} />
                ) : (
                  `0${step.id}`
                )}
              </div>
              <span
                className={`text-[11px] font-bold uppercase tracking-tight text-center ${
                  currentStep >= step.id ? "text-[#fa8112]" : "text-gray-400"
                }`}
              >
                {step.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStep1ScanDetails = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-4xl mx-auto pb-10">
      <div className="bg-orange-50 rounded-2xl p-4 flex items-center gap-3 border-l-4 border-[#fa8112] mb-6 shadow-xs">
        <User size={20} className="text-[#fa8112]" />
        <h3 className="font-bold text-[16px] text-[#22333B]">
          Family Head & Document
        </h3>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-6">
        <div className="mb-6">
          <h3 className="text-[16px] font-bold text-[#22333B] mb-1 flex items-center gap-2">
            <ScanLine size={18} className="text-[#fa8112]" />
            Identity Document
          </h3>
          <p className="text-gray-500 text-[13px]">
            Select an image or use the scanner for OCR extraction.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="w-full border-2 border-[#fa8112]/30 bg-orange-50/20 p-4 sm:p-8 rounded-3xl flex flex-col items-center justify-center transition-all overflow-hidden min-h-[400px]">
            {cameraActive ? (
              <div className="w-full max-w-md space-y-4 animate-in fade-in zoom-in-95">
                <div className="relative aspect-4/3 bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 border-2 border-white/50 border-dashed aspect-[1.6/1] rounded-lg"></div>
                  {ocrLoading && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6">
                      <div className="w-full max-w-[200px] h-2 bg-white/20 rounded-full overflow-hidden mb-4 relative">
                        <div
                          className="h-full bg-white transition-all duration-300"
                          style={{ width: `${ocrProgress}%` }}
                        ></div>
                        <div className="absolute inset-0 bg-white/40 animate-pulse"></div>
                      </div>
                      <p className="text-white font-bold text-center animate-pulse">
                        Scanning Code... {ocrProgress}%
                      </p>
                      <div className="absolute left-0 right-0 h-1 bg-white/60 blur-[2px] shadow-[0_0_15px_white] animate-[scan_2s_infinite]"></div>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-20">
                      Align Card Within Frame
                    </div>
                  </div>
                </div>
                <style>{`
                    @keyframes scan {
                      0% { top: 20%; }
                      50% { top: 80%; }
                      100% { top: 20%; }
                    }
                  `}</style>
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
                    className="flex-2 py-4 bg-[#fa8112] hover:bg-[#e47510] text-white rounded-2xl font-bold shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    {ocrLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Camera size={20} />
                    )}
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
                  {ocrLoading ? (
                    <Loader2
                      className="animate-spin text-[#fa8112]"
                      size={36}
                    />
                  ) : (
                    <Camera size={36} className="text-[#fa8112]" />
                  )}
                </div>
                <h4 className="font-bold text-[#22333B] text-lg mb-2">
                  Live OCR Scanner
                </h4>
                <p className="text-[13px] text-gray-500 max-w-[280px] text-center mb-6">
                  Open your camera to instantly extract details from Aadhaar or
                  PAN cards.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={startCamera}
                    className="px-8 py-3.5 bg-[#fa8112] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-200 transition-all"
                  >
                    <Camera size={18} /> Open Camera
                  </button>
                  <button
                    onClick={() =>
                      document.getElementById("ocr-input-admin").click()
                    }
                    className="px-6 py-3.5 bg-white border-2 border-orange-100 text-[#fa8112] rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-50 transition-all"
                  >
                    <UploadCloud size={18} /> From Gallery
                  </button>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
            <input
              id="ocr-input-admin"
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleScanImage}
            />
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-gray-700 mb-2">
              Upload Identity Document (JPG/PNG)
            </p>
            <button
              type="button"
              onClick={() => fileInputFrontRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all duration-150 min-h-[120px] ${
                formData.documentFront
                  ? "border-emerald-500 bg-emerald-50/40"
                  : "border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/40"
              }`}
            >
              <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center mb-1">
                <UploadCloud className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="font-semibold text-gray-800">
                {formData.documentFront
                  ? "Document Selected"
                  : "Upload Document"}
              </span>
              <span className="text-xs text-gray-500 text-center">
                JPG, PNG up to 5MB
              </span>
              {formData.documentFront && (
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                  <CheckCircle2 className="h-3 w-3" />
                  Identity document attached
                </span>
              )}
            </button>

            <p className="mt-2 text-xs text-gray-500 flex items-center gap-1 bg-emerald-50/60 border border-emerald-100 px-3 py-2 rounded-lg">
              <Info className="h-3 w-3 text-emerald-600" />
              Accepted IDs: Aadhaar Card, PAN Card, Voter ID, Driving License
            </p>

            <input
              type="file"
              ref={fileInputFrontRef}
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "front")}
              className="hidden"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-600 ml-1">
              Application ID
            </label>
            <input
              type="text"
              value={formData.id}
              readOnly
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3.5 text-[14px] font-black text-gray-400 tracking-wider"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-600 ml-1">
              Application Date
            </label>
            <input
              type="text"
              value={formData.dateApplied}
              readOnly
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3.5 text-[14px] font-bold text-gray-400"
            />
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-[14px] font-black text-[#22333B] uppercase tracking-widest border-b border-gray-100 pb-2">
            Full Name & Identity
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-600 ml-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.applicantFirstName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    applicantFirstName: e.target.value.replace(
                      /[^a-zA-Z\s]/g,
                      "",
                    ),
                  })
                }
                placeholder="First name"
                className="w-full bg-white border-2 border-[#e2e8f0] rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:border-[#fa8112] font-bold transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-600 ml-1">
                Middle Name
              </label>
              <input
                type="text"
                value={formData.applicantMiddleName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    applicantMiddleName: e.target.value.replace(
                      /[^a-zA-Z\s]/g,
                      "",
                    ),
                  })
                }
                placeholder="Middle name"
                className="w-full bg-white border-2 border-[#e2e8f0] rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:border-[#fa8112] font-bold transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-600 ml-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.applicantLastName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    applicantLastName: e.target.value.replace(
                      /[^a-zA-Z\s]/g,
                      "",
                    ),
                  })
                }
                placeholder="Last name"
                className="w-full bg-white border-2 border-[#e2e8f0] rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:border-[#fa8112] font-bold transition-all"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-600 ml-1">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formatDateForInput(formData.dob)}
              onChange={(e) => handleDateChange(e, "dob")}
              className="w-full bg-white border-2 border-[#e2e8f0] rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:border-[#fa8112] font-bold transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-600 ml-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
              className="w-full bg-white border-2 border-[#e2e8f0] rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:border-[#fa8112] font-bold transition-all appearance-none"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-[14px] font-black text-[#22333B] uppercase tracking-widest border-b border-gray-100 pb-2">
            Contact Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-600 ml-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold border-r pr-3">
                  +91
                </span>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                    })
                  }
                  placeholder="10 digit number"
                  className="w-full bg-white border-2 border-[#e2e8f0] rounded-xl pl-16 pr-4 py-3.5 text-[14px] focus:outline-none focus:border-[#fa8112] font-bold transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-600 ml-1">
                Email (Optional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="example@mail.com"
                className="w-full bg-white border-2 border-[#e2e8f0] rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:border-[#fa8112] font-bold transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-600 ml-1">
              Aadhaar Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.aadhaarNumber || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  aadhaarNumber: e.target.value.replace(/\D/g, "").slice(0, 12),
                })
              }
              placeholder="12 digit Aadhaar number"
              className="w-full bg-white border-2 border-[#e2e8f0] rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:border-[#fa8112] font-bold transition-all"
            />
          </div>
        </div>

        {/* Relation and Father/Husband Name removed */}

        <div className="space-y-6">
          <h4 className="text-[14px] font-black text-[#22333B] uppercase tracking-widest border-b border-gray-100 pb-2">
            Address & Status
          </h4>
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-600 ml-1">
              Full Address <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Enter complete residential address"
              rows="3"
              className="w-full bg-white border-2 border-[#e2e8f0] rounded-2xl px-4 py-3.5 text-[14px] focus:outline-none focus:border-[#fa8112] font-medium transition-all resize-none shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-600 ml-1">
                Pincode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                  })
                }
                placeholder="6-digit PIN"
                maxLength={6}
                className="w-full bg-white border-2 border-[#e2e8f0] rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:border-[#fa8112] font-bold transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-600 ml-1">
                Application Status
              </label>
              <div className="w-full bg-orange-50/50 border-2 border-[#fa8112] rounded-xl px-4 py-3.5 text-[14px] font-bold text-[#fa8112] flex items-center justify-between">
                <span>Pending verification</span>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-700 mb-3">
              Family Head Photo
            </p>

            {!headImage ? (
              <button
                type="button"
                onClick={() => headImageInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all min-h-[140px]"
              >
                <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center mb-1">
                  <User className="h-6 w-6 text-emerald-600" />
                </div>
                <span className="font-semibold text-gray-800 text-sm">
                  Upload Family Head Photo
                </span>
                <span className="text-xs text-gray-500 text-center">
                  Clear front-facing photo of the family head (JPG/PNG up to
                  5MB)
                </span>
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                  <Camera className="h-3 w-3" />
                  Recommended: Use camera for best clarity
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-4 bg-emerald-50/60 border border-emerald-100 rounded-lg p-3">
                <div className="h-14 w-14 rounded-full overflow-hidden border border-emerald-200 shrink-0">
                  <img
                    src={headImage}
                    alt="Family Head"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 mb-1">
                    Family head photo attached
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">
                    This photo will be printed on the Ayush Card.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setHeadImage("")}
                  className="inline-flex items-center justify-center h-7 w-7 rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              ref={headImageInputRef}
              onChange={handleHeadImageUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2Members = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-4xl mx-auto pb-10">
      <div className="bg-[#2A3342] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-[#fa8112] rounded-xl flex items-center justify-center text-white shadow-lg">
            <Plus size={24} />
          </div>
          <div>
            <h3 className="font-bold text-[18px] text-white">Family Members</h3>
            <p className="text-gray-400 text-[13px]">
              Add up to 7 members to current card
            </p>
          </div>
        </div>
        <button
          onClick={() =>
            setFormData({
              ...formData,
              members: [
                ...formData.members,
                { name: "", relation: "", age: "" },
              ],
            })
          }
          className="px-8 py-3 bg-[#fa8112] hover:bg-[#e47510] text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 text-[14px] relative z-10"
        >
          Add New Member
        </button>
      </div>

      <div className="space-y-4">
        {formData.members.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-100 rounded-[32px] p-20 flex flex-col items-center justify-center text-center shadow-xs">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-6">
              <Plus size={40} />
            </div>
            <h4 className="font-bold text-[20px] mb-2 text-gray-300">
              No Family Members
            </h4>
            <p className="text-gray-400 text-[14px] max-w-[240px]">
              Include your family members to share ayush card benefits
              (₹10/member)
            </p>
          </div>
        ) : (
          <>
            {formData.members.map((member, index) => (
              <div
                key={index}
                className="bg-white border-2 border-gray-100 rounded-3xl p-6 relative group transition-all hover:border-[#fa8112] hover:shadow-xl animate-in zoom-in-95 duration-200"
              >
                <button
                  onClick={() => {
                    const newMembers = formData.members.filter(
                      (_, i) => i !== index,
                    );
                    setFormData({ ...formData, members: newMembers });
                  }}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                >
                  <X size={16} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Member Scanning UI */}
                  {memberScanningIndex === index && memberCameraActive && (
                    <div className="md:col-span-3 bg-orange-50 border border-[#FBD7B0] rounded-lg p-3 mb-3">
                      <video
                        ref={memberVideoRef}
                        autoPlay
                        playsInline
                        className="w-full rounded-lg border border-[#F6B579] max-h-64 mb-2"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={captureMemberPhoto}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-[#FA8112] text-white rounded-lg hover:bg-[#E47510] font-semibold text-sm"
                        >
                          <Check size={18} /> Capture
                        </button>
                        <button
                          onClick={stopMemberCamera}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold text-sm"
                        >
                          <X size={18} /> Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Member Name
                    </label>
                    <div className="flex gap-2">
                      <input
                        placeholder="Enter full name"
                        value={member.name}
                        onChange={(e) => {
                          const m = [...formData.members];
                          m[index].name = e.target.value.replace(
                            /[^a-zA-Z\s]/g,
                            "",
                          );
                          setFormData({ ...formData, members: m });
                        }}
                        className="flex-1 bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-[14px] font-bold focus:outline-none focus:border-[#fa8112] focus:bg-white transition-all"
                      />
                      {memberScanningIndex !== index && (
                        <button
                          onClick={() => startMemberCamera(index)}
                          className="px-3 py-3 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors"
                          title="Scan member ID"
                        >
                          <ScanLine size={16} className="text-[#fa8112]" />
                        </button>
                      )}
                    </div>
                    {memberScanningIndex === index &&
                      !memberCameraActive &&
                      memberScanProgress > 0 && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-[#FA8112] h-1.5 rounded-full transition-all"
                              style={{ width: `${memberScanProgress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            Scanning: {memberScanProgress}%
                          </p>
                        </div>
                      )}
                    {memberScanningIndex === index && !memberCameraActive && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => startMemberCamera(index)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-[#FA8112] text-white rounded-lg hover:bg-[#E47510] font-semibold text-xs"
                        >
                          <Camera size={14} /> Camera
                        </button>
                        <button
                          onClick={() => memberInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-[#FA8112] text-white rounded-lg hover:bg-[#E47510] font-semibold text-xs"
                        >
                          <UploadCloud size={14} /> Upload
                        </button>
                      </div>
                    )}
                    <input
                      ref={memberInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleMemberScanImage(e, index)}
                      style={{ display: "none" }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Relation
                    </label>
                    <select
                      value={member.relation}
                      onChange={(e) => {
                        const m = [...formData.members];
                        m[index].relation = e.target.value;
                        setFormData({ ...formData, members: m });
                      }}
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-[14px] font-bold focus:outline-none focus:border-[#fa8112] focus:bg-white transition-all appearance-none"
                    >
                      <option value="">Relation</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Child">Child</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Age
                    </label>
                    <input
                      placeholder="Age"
                      value={member.age}
                      onChange={(e) => {
                        const m = [...formData.members];
                        m[index].age = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 3);
                        setFormData({ ...formData, members: m });
                      }}
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-[14px] font-bold focus:outline-none focus:border-[#fa8112] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            ))}
            {formData.members.length < 7 && (
              <button
                onClick={() =>
                  setFormData({
                    ...formData,
                    members: [
                      ...formData.members,
                      { name: "", relation: "", age: "" },
                    ],
                  })
                }
                className="w-full py-5 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 font-bold hover:border-[#fa8112] hover:text-[#fa8112] hover:bg-orange-50/20 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Add Family Member
              </button>
            )}
          </>
        )}

        {/* Member scanning canvas - hidden */}
        <canvas ref={memberCanvasRef} style={{ display: "none" }} />

        <div className="mt-8 p-8 bg-orange-50 border border-orange-100 rounded-[32px] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#fa8112] shadow-md border border-orange-100">
              <FileText size={28} />
            </div>
            <div>
              <p className="text-[11px] font-black text-[#fa8112] uppercase tracking-widest mb-1">
                Pricing Overview
              </p>
              <p className="text-[16px] font-bold text-[#22333B]">
                Basic Card + {formData.members.length} Members
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">
              Total Payable
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-[18px] font-bold text-[#fa8112]">₹</span>
              <span className="text-[36px] font-black text-[#fa8112]">
                {formData.payment.totalPaid}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3Review = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-4xl mx-auto pb-10">
      <div className="bg-orange-50 rounded-2xl p-4 flex items-center gap-3 border-l-4 border-[#fa8112] mb-6 shadow-xs">
        <CheckCircle2 size={20} className="text-[#fa8112]" />
        <h3 className="font-bold text-[16px] text-[#22333B]">
          Step 3: Card Review
        </h3>
      </div>

      <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-xl mb-8 flex flex-col">
        <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
          <h4 className="font-black text-[#22333B] text-[15px] uppercase tracking-widest">
            Card Preview
          </h4>
          <div className="flex bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
            <button
              onClick={() => setCardSide("front")}
              className={`px-6 py-2 rounded-lg text-[13px] font-bold transition-all ${cardSide === "front" ? "bg-[#fa8112] text-white" : "text-gray-400 hover:text-black"}`}
            >
              Front
            </button>
            <button
              onClick={() => setCardSide("back")}
              className={`px-6 py-2 rounded-lg text-[13px] font-bold transition-all ${cardSide === "back" ? "bg-[#fa8112] text-white" : "text-gray-400 hover:text-black"}`}
            >
              Back
            </button>
          </div>
        </div>
        <div className="p-12 flex items-center justify-center bg-gray-50/20 py-16">
          <div className="w-full max-w-[540px]">
            <AyushCardPreview
              data={{
                ...formData,
                profileImage: headImage || formData.documentFront || undefined,
              }}
              side={cardSide}
              onFlip={(s) => setCardSide(s)}
            />
          </div>
        </div>
        <div className="p-8 border-t border-gray-100 bg-white grid grid-cols-2 md:grid-cols-5 gap-6">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Applicant Name
            </p>
            <p className="text-[13px] font-bold text-[#22333B] truncate">
              {formData.applicantFirstName} {formData.applicantLastName}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Aadhaar No
            </p>
            <p className="text-[13px] font-bold text-[#22333B] truncate">
              {formData.aadhaarNumber || "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Mobile
            </p>
            <p className="text-[13px] font-bold text-[#22333B]">
              +91 {formData.phone}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Members
            </p>
            <p className="text-[13px] font-bold text-[#22333B]">
              {(formData.members?.length || 0) + 1} Total
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Amount
            </p>
            <p className="text-[15px] font-black text-[#fa8112]">
              ₹{formData.payment.totalPaid}.00
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  const renderStep4Payment = () => {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto flex flex-col items-center pb-20">
        {!paymentMethod ? (
          <div className="w-full">
            <h3 className="font-black text-[24px] text-[#22333B] mb-8 text-center uppercase tracking-tight">
              Select Payment Mode
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div
                onClick={() => setPaymentMethod("online")}
                className="group border-2 border-gray-100 rounded-[32px] p-8 bg-white cursor-pointer transition-all hover:border-[#fa8112] hover:shadow-2xl flex items-center gap-8"
              >
                <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center text-[#fa8112] group-hover:bg-[#fa8112] group-hover:text-white transition-all shadow-inner">
                  <CreditCard size={40} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#22333B] text-[20px] mb-1">
                    Online Payment
                  </h4>
                  <p className="text-gray-500 text-[14px] leading-relaxed">
                    Fast & instant activation via UPI, GPay, or Cards.
                  </p>
                  <div className="flex gap-2 mt-4 opacity-70">
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-lg border border-green-100 tracking-tighter">
                      RECOMMENDED
                    </span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-100 uppercase">
                      SAFE
                    </span>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod("cash")}
                className="group border-2 border-gray-100 rounded-[32px] p-8 bg-white cursor-pointer transition-all hover:border-[#fa8112] hover:shadow-2xl flex items-center gap-8"
              >
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-400 group-hover:bg-[#fa8112] group-hover:text-white transition-all shadow-inner">
                  <Banknote size={40} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#22333B] text-[20px] mb-1">
                    Cash Payment
                  </h4>
                  <p className="text-gray-500 text-[14px] leading-relaxed">
                    Pay to agent directly. Receipt issued after manual
                    confirmation.
                  </p>
                  <div className="flex gap-2 mt-4 opacity-70">
                    <span className="px-3 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold rounded-lg border border-gray-100 tracking-tighter uppercase">
                      OFFLINE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-8">
            <button
              onClick={() => setPaymentMethod(null)}
              className="flex items-center gap-2 text-[#fa8112] font-black uppercase text-[12px] tracking-widest hover:translate-x-[-4px] transition-transform"
            >
              <span className="text-[18px]">&larr;</span> Change Payment Mode
            </button>
            <div className="bg-white border-2 border-gray-100 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#fa8112]/5 rounded-full -mr-20 -mt-20"></div>
              <h4 className="font-black text-[24px] text-[#22333B] mb-8 relative z-10">
                {paymentMethod === "online"
                  ? "Instant Activation"
                  : "Collect Cash"}
              </h4>

              <div className="bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100">
                <div className="flex justify-between items-center py-3 border-b border-gray-200/50">
                  <span className="text-gray-400 font-bold text-[13px] uppercase tracking-widest">
                    Base Card Fee
                  </span>
                  <span className="font-black text-[#22333B]">
                    ₹{Number(formData.payment.applicationFee || 120).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200/50">
                  <span className="text-gray-400 font-bold text-[13px] uppercase tracking-widest">
                    Add-on Members ({(formData.members || []).length})
                  </span>
                  <span className="font-black text-[#22333B]">
                    ₹{Number(formData.payment.memberAddOns || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-5">
                  <span className="text-[#22333B] font-black text-[16px] uppercase tracking-widest">
                    Total Payable
                  </span>
                  <span className="text-[#fa8112] font-black text-[36px] tracking-tighter">
                    ₹{Number(formData.payment.totalPaid || 120).toFixed(2)}
                  </span>
                </div>
              </div>

              {paymentMethod === "online" ? (
                <div className="space-y-4">
                  {txnId ? (
                    <div className="bg-green-50 border-2 border-green-500/30 rounded-3xl p-6 flex flex-col items-center gap-4 animate-in zoom-in-95">
                      <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg">
                        <Check size={28} />
                      </div>
                      <p className="font-black text-green-700 tracking-tight uppercase">
                        Payment Success
                      </p>
                      <p className="text-[12px] text-green-600 bg-white px-4 py-1.5 rounded-full shadow-sm font-mono">
                        {txnId}
                      </p>
                      <button
                        onClick={() => performSave("online", txnId)}
                        disabled={saveLoading}
                        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        {saveLoading ? (
                          <Loader2 className="animate-spin" size={20} />
                        ) : (
                          "Finalize Application"
                        )}
                      </button>
                    </div>
                  ) : (
                    <>
                      {!orderId ? (
                        <button
                          onClick={handleInitiateOnlinePayment}
                          disabled={onlinePaymentLoading}
                          className="w-full py-5 bg-[#fa8112] hover:bg-[#e47510] text-white rounded-2xl font-black text-[18px] shadow-xl hover:shadow-[#fa8112]/30 transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                          {onlinePaymentLoading ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <CreditCard />
                          )}{" "}
                          {onlinePaymentLoading
                            ? "Preparing Gateway..."
                            : "Pay with Cashfree"}
                        </button>
                      ) : (
                        <div className="flex flex-col gap-4">
                          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
                            <Loader2
                              className="animate-spin text-blue-500"
                              size={20}
                            />
                            <span className="text-blue-700 font-bold text-sm">
                              Waiting for transaction info...
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              onClick={() => setOrderId(null)}
                              className="py-4 border-2 border-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-50"
                            >
                              Retry
                            </button>
                            <button
                              onClick={() => handleConfirmOnlinePayment()}
                              disabled={verifyLoading}
                              className="py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-lg transition-all"
                            >
                              {verifyLoading ? "Verifying..." : "Verify Status"}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* Cash payment proof upload */}
                  <div className="space-y-3">
                    <p className="text-[13px] font-semibold text-gray-700">
                      Cash Payment Proof (optional)
                    </p>
                    <button
                      type="button"
                      onClick={() => cashPaymentInputRef.current?.click()}
                      className="w-full py-3 px-4 border-2 border-dashed border-[#fa8112] rounded-2xl bg-orange-50/40 hover:bg-orange-50 transition-all flex items-center justify-center gap-2 text-[13px] font-semibold text-[#222222]"
                    >
                      <UploadCloud size={18} className="text-[#fa8112]" />
                      {cashPaymentImage
                        ? "Change Uploaded Image"
                        : "Upload Cash Receipt Image"}
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      ref={cashPaymentInputRef}
                      className="hidden"
                      onChange={(e) => {
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
                      }}
                    />
                    {cashPaymentImage && (
                      <p className="text-[11px] text-green-600 font-medium">
                        Cash receipt image attached.
                      </p>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl border-2 border-orange-100 bg-orange-50/50 space-y-3">
                    <label className="flex items-center gap-3 font-bold text-[13px] text-orange-800">
                      <Check size={18} /> Collect Cash Payment
                    </label>
                    <label className="flex items-center gap-3 font-bold text-[13px] text-orange-800">
                      <Check size={18} /> Handover Payment Slip
                    </label>
                  </div>
                  <button
                    onClick={() => performSave("cash", null)}
                    disabled={saveLoading}
                    className="w-full py-5 bg-[#2A3342] hover:bg-[#1E2530] text-white rounded-2xl font-black text-[18px] shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                    {saveLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Check />
                    )}{" "}
                    {saveLoading ? "Processing..." : "Confirm Collection"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderThermalReceipt = () => (
    <div
      id="thermal-receipt"
      className="hidden print:block w-[3in] bg-white p-4 font-sans text-black"
    >
      <div className="text-center border-b-2 border-dashed border-gray-300 pb-3 mb-3">
        <h2 className="font-extrabold text-[18px] uppercase tracking-tighter">
          BKBS TRUST
        </h2>
        <p className="text-[10px] leading-tight font-bold opacity-60">
          Human Welfare & Social Trust
        </p>
      </div>
      <div className="flex justify-between text-[11px] mb-1 font-bold">
        <span>DATE:</span>
        <span>{new Date().toLocaleDateString()}</span>
      </div>
      <div className="flex justify-between text-[11px] mb-3 font-bold">
        <span>APP ID:</span>
        <span>{formData.id}</span>
      </div>
      <div className="border-y border-dashed border-gray-300 py-3 mb-4">
        <p className="text-[10px] font-bold text-gray-400 mb-0.5">
          APPLICANT HEAD:
        </p>
        <p className="font-extrabold text-[14px] uppercase tracking-tight leading-tight">
          {formData.applicantFirstName} {formData.applicantMiddleName}{" "}
          {formData.applicantLastName}
        </p>
        <p className="text-[11px] font-bold mt-1">PHONE: {formData.phone}</p>
      </div>
      <div className="space-y-1 mb-6">
        <div className="flex justify-between text-[12px]">
          <span>Card Fee</span>
          <span className="font-bold">
            ₹{formData.payment.applicationFee}.00
          </span>
        </div>
        {formData.members?.length > 0 && (
          <div className="flex justify-between text-[12px]">
            <span>Members ({formData.members.length})</span>
            <span className="font-bold">₹{formData.memberAddOns}.00</span>
          </div>
        )}
        <div className="flex justify-between font-extrabold border-t-2 border-black pt-2 mt-2 text-[18px]">
          <span>TOTAL</span>
          <span>₹{formData.payment.totalPaid}.00</span>
        </div>
      </div>
      <div className="text-[9px] font-bold space-y-1 opacity-80 border-t border-dashed border-gray-300 pt-3">
        <p className="uppercase">
          Transaction ID: {txnId || "CASH-" + Date.now()}
        </p>
        <p className="uppercase">
          Payment: {paymentMethod === "online" ? "UPI/Online" : "Cash Received"}
        </p>
        <p className="text-center text-[10px] mt-4 font-black tracking-widest border border-black py-1 uppercase italic">
          Paid & Verified
        </p>
      </div>
    </div>
  );

  const handleDownloadReceipt = () => window.print();

  const handleFinalSave = () => {
    navigate("/admin/health-card");
  };

  const renderStep5Receipt = () => (
    <div className="w-full flex justify-center items-start pt-2 pb-12 animate-in fade-in zoom-in-95 duration-500 max-w-lg mx-auto">
      <style>{`
        @media print {
          @page { size: 3in auto; margin: 0; }
          body * { visibility: hidden !important; }
          #thermal-receipt, #thermal-receipt * { visibility: visible !important; }
          #thermal-receipt { position: fixed !important; left: 0 !important; top: 0 !important; width: 3in !important; margin: 0 !important; padding: 12px !important; display: block !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {renderThermalReceipt()}

      <div className="w-full bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden flex flex-col no-print">
        <div className="bg-[#10B981] p-10 flex flex-col items-center relative">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 shadow-xl">
            <Check size={40} className="text-white" strokeWidth={4} />
          </div>
          <h2 className="text-white text-[24px] font-black uppercase tracking-tight mb-1">
            Registration Complete
          </h2>
          <div className="flex items-baseline gap-1 text-white">
            <span className="text-[18px] font-bold">₹</span>
            <span className="text-[44px] font-black tracking-tighter">
              {formData.payment.totalPaid}
            </span>
          </div>
        </div>
        <div className="p-10 space-y-8">
          <div className="grid grid-cols-2 gap-y-6">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                Receipt No
              </p>
              <p className="text-[15px] font-extrabold text-[#22333B] truncate">
                {formData.id}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                Date
              </p>
              <p className="text-[14px] font-bold text-[#22333B]">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-3">
            <div className="flex justify-between text-[13px] font-bold">
              <span className="text-gray-400 uppercase tracking-widest text-[10px]">
                Head of House
              </span>
              <span className="text-[#22333B] truncate ml-2">
                {formData.applicantFirstName} {formData.applicantLastName}
              </span>
            </div>
            <div className="flex justify-between text-[13px] font-bold">
              <span className="text-gray-400 uppercase tracking-widest text-[10px]">
                Family Size
              </span>
              <span className="text-[#22333B]">
                {(formData.members?.length || 0) + 1} People
              </span>
            </div>
          </div>
          <div className="space-y-4 pt-2">
            <button
              onClick={handleDownloadReceipt}
              className="w-full py-4 bg-[#fa8112] hover:bg-[#e47510] text-white rounded-2xl font-black shadow-xl transition-all flex items-center justify-center gap-3"
            >
              <Download size={20} /> Download Receipt
            </button>
            <button
              onClick={handleFinalSave}
              className="w-full py-4 bg-gray-50 border border-gray-200 text-[#22333B] rounded-2xl font-black hover:bg-gray-100 transition-all"
            >
              Close Registration
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 lg:p-10 transition-opacity"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[1070px] h-full max-h-full flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 sm:p-6 shrink-0 border-b border-gray-100 gap-4">
          <h2 className="text-base sm:text-[20px] font-bold text-[#22333B]">
            New Ayush Card Application
          </h2>
          <button
            onClick={() => {
              if (currentStep === 5) {
                handleFinalSave();
              } else {
                navigate("/admin/health-card");
              }
            }}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col pt-4 sm:pt-6 pb-4 bg-gray-50/30">
          {renderStepper()}

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col">
            {currentStep === 1 && renderStep1ScanDetails()}
            {currentStep === 2 && renderStep2Members()}
            {currentStep === 3 && renderStep3Review()}
            {currentStep === 4 && renderStep4Payment()}
            {currentStep === 5 && renderStep5Receipt()}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-white shrink-0 flex justify-end items-center px-4 sm:px-6">
          {currentStep < 5 ? (
            <div className="flex flex-col sm:flex-row justify-between sm:items-center w-full gap-3 sm:gap-0">
              <button
                onClick={handleBack}
                disabled={currentStep === 1 || saveLoading || paymentCompleted}
                className={`px-6 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  currentStep === 1 || paymentCompleted
                    ? "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
                }`}
              >
                Previous
              </button>

              {saveError && (
                <span className="text-red-500 text-sm font-medium animate-pulse">
                  {saveError}
                </span>
              )}

              <button
                onClick={handleNext}
                disabled={
                  saveLoading ||
                  (currentStep === 4 && !paymentMethod && !paymentCompleted)
                }
                className={`w-full sm:w-auto px-8 py-2 rounded-lg text-sm font-medium text-white transition-all flex items-center justify-center gap-2 ${
                  saveLoading ||
                  (currentStep === 4 && !paymentMethod && !paymentCompleted)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#2A3342] hover:bg-[#1E2530]"
                }`}
              >
                {saveLoading && <Loader2 size={16} className="animate-spin" />}
                {saveLoading
                  ? "Processing..."
                  : currentStep === 4 && !paymentCompleted
                    ? "Confirm Registration"
                    : "Next Step"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleFinalSave}
              className="px-6 py-2.5 bg-[#2A3342] hover:bg-[#1E2530] text-white rounded-lg text-sm font-medium transition-colors shadow-xs"
            >
              Back to Ayushcard List
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateHealthCard;
