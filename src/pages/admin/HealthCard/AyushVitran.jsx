import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search, Printer, FileText, X, Calendar, RefreshCw,
  CreditCard, Copy, ChevronRight, ChevronLeft, Check,
  Wifi, Banknote, AlertCircle, Clock, Loader2,
  Users, Receipt, ClipboardList, Eye
} from "lucide-react";
import apiService from "../../../api/service";
import { useToast } from "../../../components/ui/Toast";
import Pagination from "../../../components/ui/Pagination";
import { LOGO_BASE64 } from "../../../utils/logoBase64";
import {
  normalizeHealthCard,
  parseHealthCardsResponse,
  formatCardCreatedAt,
  getCardCreatedAt,
} from "../../../utils/healthCardUtils";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const getFormattedCurrentDate = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const getDateTime = () => {
  const d = new Date();
  return d.toLocaleString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const generateDupReceiptNo = () => {
  const d = new Date();
  const datePart = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `DUP-${datePart}-${rand}`;
};

const PENALTY_AMOUNT = 50;

// ─── SETTLEMENT CALCULATION ENGINE ───────────────────────────────────────────
const calculateSettlement = (totalCards) => {
  const count = Number(totalCards) || 0;
  const offlineCount = Math.max(0, Math.round(count * 0.9));
  const onlineCount = Math.max(0, count - offlineCount);
  const off160 = Math.max(0, Math.round(offlineCount * 0.4));
  const off200 = Math.max(0, Math.round(offlineCount * 0.35));
  const off240 = Math.max(0, Math.round(offlineCount * 0.15));
  const off280 = Math.max(0, offlineCount - (off160 + off200 + off240));
  const amt160 = off160 * 160; const amt200 = off200 * 200;
  const amt240 = off240 * 240; const amt280 = off280 * 280;
  const offlineBaseTotal = amt160 + amt200 + amt240 + amt280;
  const on160 = Math.max(0, Math.round(onlineCount * 0.4));
  const on200 = Math.max(0, Math.round(onlineCount * 0.3));
  const on240 = Math.max(0, Math.round(onlineCount * 0.3));
  const on280 = Math.max(0, onlineCount - (on160 + on200 + on240));
  const onAmt160 = on160 * 160; const onAmt200 = on200 * 200;
  const onAmt240 = on240 * 240; const onAmt280 = on280 * 280;
  const onlineBaseTotal = onAmt160 + onAmt200 + onAmt240 + onAmt280;
  const penaltyCount = Math.max(0, Math.round(offlineCount * 0.05));
  const penaltyAmount = penaltyCount * 25;
  const onPenaltyCount = Math.max(0, Math.round(onlineCount * 0.28));
  const onPenaltyAmount = onPenaltyCount * 50;
  const offlineTotalWithPenalty = offlineBaseTotal + penaltyAmount;
  const onlineTotalWithPenalty = onlineBaseTotal + onPenaltyAmount;
  const grandTotal = offlineBaseTotal + onlineBaseTotal + penaltyAmount + onPenaltyAmount;
  return {
    offlineCount, off160, off200, off240, off280, amt160, amt200, amt240, amt280, offlineBaseTotal,
    onlineCount, on160, on200, on240, on280, onAmt160, onAmt200, onAmt240, onAmt280, onlineBaseTotal,
    penaltyCount, penaltyAmount, onPenaltyCount, onPenaltyAmount,
    offlineTotalWithPenalty, onlineTotalWithPenalty, grandTotal
  };
};

// ─── HELPER: map a normalized health card to the shape used by the duplicate receipt flow ─
const toDupCardShape = (card, createdByMap = {}) => {
  const empRaw = card.createdBy;
  const empId = typeof empRaw === "object" ? (empRaw?._id || empRaw?.employeeId || "") : (empRaw || "");
  const empName = typeof empRaw === "object"
    ? (empRaw?.name || [empRaw?.firstName, empRaw?.lastName].filter(Boolean).join(" ") || empRaw?.email || empRaw?.employeeId || "")
    : (createdByMap[empRaw] || empRaw || "");

  return {
    id: card.id || card.applicationId || card._id || "",
    clientName: card.applicant || "",
    mobile: card.phone || "",
    mukhiyaName: card.applicant || "",
    area: card.location || card.ngoLocation || "Mangla Vihar",
    district: "Kanpur Nagar",
    pincode: card.pincode || "208015",
    totalMember: card.totalMembers || 1,
    amount: Number(card.payment?.totalPaid || 0),
    cardType: (card.totalMembers || 1) > 1 ? "Family" : "Individual",
    exportDate: formatCardCreatedAt(getCardCreatedAt(card)),
    employeeId: empId,
    employeeName: empName,
    receiptNo: card.applicationId || card.id || card._id || "",
    address: card.address || "",
    _rawCard: card,
  };
};

// ─── SETTLEMENT SLIP PREVIEW (for employee tab) ───────────────────────────────
const SettlementSlipPreview = ({ employee, date }) => {
  const calc = useMemo(() => calculateSettlement(employee.totalCards), [employee.totalCards]);
  return (
    <div className="bg-white text-black p-6 border border-gray-300 rounded-sm shadow-md mx-auto font-mono"
      style={{ width: "80mm", maxWidth: "100%", minHeight: "170mm", boxSizing: "border-box", fontSize: "11px", lineHeight: "1.4" }}>
      <div className="flex flex-col items-center mb-4">
        <div className="w-20 h-20 rounded-full border border-black flex items-center justify-center p-2 mb-2 bg-white">
          <img src={LOGO_BASE64} alt="BKBS Logo" className="h-12 w-auto object-contain" />
        </div>
        <h2 className="text-base font-extrabold tracking-widest uppercase text-center font-sans mt-1">Settlement</h2>
      </div>
      <div className="text-center font-sans mb-4 border-b border-dashed border-black pb-2">
        <h3 className="text-xs font-black uppercase leading-tight">Baijnaath Kesar Bai Sewa Trust</h3>
        <p className="text-[10px] font-bold mt-0.5">1-A Mangla Vihar New PAC Line</p>
        <p className="text-[10px] font-bold">Kanpur Nagar – 208015</p>
      </div>
      <div className="space-y-1 font-bold mb-4">
        <div>Date :- <span className="font-mono font-medium">{date}</span></div>
        <div>Camp Area :- <span className="font-sans font-medium">{employee.location || "Mangla Vihar"}</span></div>
        <div>Ayush Mitra Name :- <span className="font-sans font-medium">{employee.name}</span></div>
        <div>Ayoush Mitra ID No :- <span className="font-mono font-medium">{employee.id}</span></div>
        <div className="flex justify-between">
          <span>District :- <span className="font-sans font-medium">Kanpur Nagar</span></span>
          <span>Pin Code :- <span className="font-mono font-medium">{employee.pincode || "208015"}</span></span>
        </div>
        <div className="border-t border-dashed border-black pt-1 mt-1">
          Total Apply Ayoush Card - <span className="font-mono font-black text-sm">{employee.totalCards}</span>
        </div>
      </div>
      <div className="text-center my-3 bg-gray-50 py-0.5 border border-dashed border-black">
        <span className="text-xs font-extrabold tracking-wide uppercase font-sans">Apply Ayoush Card</span>
      </div>
      <table className="w-full text-left border-collapse text-[10px] font-bold mb-4">
        <thead>
          <tr className="border-b border-black font-sans uppercase">
            <th className="py-1">Card Detail - Amount</th>
            <th className="py-1 text-right">Online - Amount</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          <tr className="border-b border-dashed border-gray-100"><td className="py-1.5">160 x {calc.off160} = {Number(calc.amt160).toFixed(2)}</td><td className="py-1.5 text-right">{calc.on160} = {Number(calc.onAmt160).toFixed(0)}</td></tr>
          <tr className="border-b border-dashed border-gray-100"><td className="py-1.5">200 x {calc.off200} = {Number(calc.amt200).toFixed(2)}</td><td className="py-1.5 text-right">{calc.on200} = {Number(calc.onAmt200).toFixed(0)}</td></tr>
          <tr className="border-b border-dashed border-gray-100"><td className="py-1.5">240 x {calc.off240} = {Number(calc.amt240).toFixed(2)}</td><td className="py-1.5 text-right">{calc.on240} = {Number(calc.onAmt240).toFixed(0)}</td></tr>
          <tr className="border-b border-dashed border-gray-100"><td className="py-1.5">280 x {calc.off280} = {Number(calc.amt280).toFixed(2)}</td><td className="py-1.5 text-right">{calc.on280} = {Number(calc.onAmt280).toFixed(0)}</td></tr>
          <tr className="border-b border-dashed border-gray-100"><td className="py-1.5">Penelty x {calc.penaltyCount} = {Number(calc.penaltyAmount).toFixed(2)}</td><td className="py-1.5 text-right">{calc.onPenaltyCount} = {Number(calc.onPenaltyAmount).toFixed(0)}</td></tr>
          <tr className="border-t border-black font-extrabold text-[10.5px]">
            <td className="py-2">Total = {calc.offlineCount} = {Number(calc.offlineTotalWithPenalty).toFixed(2)}</td>
            <td className="py-2 text-right">{calc.onlineCount} = {Number(calc.onlineTotalWithPenalty).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <div className="bg-gray-50 border border-black p-2 text-center rounded-sm font-sans mb-6">
        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Calculated Revenue Equation</div>
        <div className="text-[10.5px] font-black mt-0.5 leading-tight">
          Grand Total = {calc.offlineBaseTotal} + {calc.onlineTotalWithPenalty} + {calc.penaltyAmount} = <span className="text-[#F68E5F] font-mono font-black text-sm">₹{calc.grandTotal}</span>
        </div>
      </div>
      <div className="space-y-4 font-bold my-4 border-t border-dashed border-black pt-3">
        <div>Cash Receiver Name : __________________</div>
        <div>Cash Receiver ID No :- __________________</div>
      </div>
      <div className="mt-8 mb-2">
        <div className="border border-black rounded-sm h-14 w-full flex items-center justify-center bg-gray-50/20">
          <span className="font-sans text-gray-400 font-bold text-xs uppercase tracking-widest">Signature</span>
        </div>
      </div>
    </div>
  );
};

// ─── PENALTY RECEIPT PREVIEW (reference design) ───────────────────────────────
const PenaltyReceiptPreview = ({ card, receiptRecord }) => {
  const date = receiptRecord?.issuedAt || getFormattedCurrentDate();
  return (
    <div className="bg-white text-black border border-gray-400 mx-auto font-sans"
      style={{ width: "80mm", maxWidth: "100%", boxSizing: "border-box", fontSize: "11px", lineHeight: "1.5", padding: "16px 14px" }}>
      {/* Logo */}
      <div className="flex flex-col items-center mb-3">
        <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center p-1.5 mb-2 bg-white">
          <img src={LOGO_BASE64} alt="BKBS Logo" className="h-10 w-auto object-contain" />
        </div>
        <h2 className="text-sm font-extrabold underline text-center" style={{ fontFamily: "serif" }}>
          Penelty Recept
        </h2>
      </div>

      {/* Trust Header */}
      <div className="text-center mb-4 border-b border-black pb-3">
        <div className="font-black text-sm leading-tight" style={{ fontFamily: "serif" }}>Baijnaath Kesar Bai Sewa Trust</div>
        <div className="text-[10px] font-bold mt-0.5">1-A Mangla Vihar New PAC Line</div>
        <div className="text-[10px] font-bold">Kanpur Nagar – 208015</div>
      </div>

      {/* Card Details */}
      <div className="space-y-1.5 font-bold text-[10.5px] mb-3">
        <div><span className="font-black">Date :-</span> {date}</div>
        <div><span className="font-black">Card ID No :-</span> {card?.id || card?.receiptNo || "—"}</div>
        <div><span className="font-black">Camp Area :-</span> {card?.area || "Mangla Vihar"}</div>
        <div><span className="font-black">Mukhiya Name :-</span> {card?.mukhiyaName || card?.clientName || "—"}</div>
        <div><span className="font-black">Full Address :-</span> {card?.address || "—"}</div>
        <div className="flex justify-between">
          <span><span className="font-black">District :-</span> {card?.district || "Kanpur Nagar"}</span>
        </div>
        <div className="flex justify-between">
          <span><span className="font-black">Pin Code :-</span> {card?.pincode || "208015"}</span>
          <span><span className="font-black">Total Member :-</span> {card?.totalMember || "1"}</span>
        </div>
      </div>

      {/* Penalty Box */}
      <div className="text-center font-black text-[11px] my-3 border-t border-b border-black py-2">
        Penelty Amount :- Rs. {PENALTY_AMOUNT}.00
      </div>

      {/* Payment Method if present */}
      {receiptRecord && (
        <div className="text-[10px] font-bold border border-dashed border-gray-400 p-1.5 mb-3 rounded-sm">
          <div>Receipt No :- {receiptRecord.receiptNo}</div>
          <div>Payment Method :- {receiptRecord.paymentMethod === "online" ? "Online (UPI/Net Banking)" : "Offline (Cash)"}</div>
          {receiptRecord.paymentRef && <div>Ref :- {receiptRecord.paymentRef}</div>}
          <div>Status :- {receiptRecord.paymentStatus === "paid" ? "✓ Paid" : "⏳ Pending"}</div>
        </div>
      )}

      {/* Hindi important info */}
      <div className="mb-3">
        <div className="text-center font-black text-[10.5px] mb-1.5 underline">महत्वपूर्ण जानकारी</div>
        <div className="text-[9.5px] leading-relaxed space-y-2" style={{ fontFamily: "sans-serif" }}>
          <p>कार्ड का उपयोग करने से पूर्व, कृपया कार्ड के साथ दिए किए गए लेटर को ध्यानपूर्वक अवश्य पढ़ें।</p>
          <p>किसी भी प्रकार की समस्या या सहायता हेतु, कृपया कार्ड के साथ दिए गए हेल्पलाइन नंबर 8303902030 पर संपर्क करें।</p>
          <p>आपके द्वारा जमा की गई राशि का उपयोग जरूरतमंद लोगों की सहायता एवं सामाजिक कल्याण के कार्यों में लगाया जाता है।</p>
        </div>
      </div>

      {/* Ayush Mitra */}
      <div className="space-y-1 font-bold text-[10.5px] mb-4 border-t border-dashed border-black pt-2">
        <div><span className="font-black">Ayoush Mitra Name :-</span> {card?.employeeName || "—"}</div>
        <div><span className="font-black">Ayoush Mitra ID No :-</span> {card?.employeeId || "—"}</div>
      </div>

      {/* Signature */}
      <div className="mt-6">
        <div className="border border-black h-14 w-full flex items-center justify-center rounded-sm bg-gray-50">
          <span className="text-gray-300 font-bold text-xs uppercase tracking-widest">Signature</span>
        </div>
      </div>
    </div>
  );
};

// ─── STAT TILE ────────────────────────────────────────────────────────────────
const StatTile = ({ icon: Icon, label, value, color, bg }) => (
  <div className={`rounded-xl border ${bg} p-4 flex items-center gap-3 shadow-sm flex-1 shrink-0 min-w-[170px] sm:min-w-0`}>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
      <Icon size={18} />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-semibold">{label}</p>
      <p className="text-xl font-black text-[#22333B]">{value}</p>
    </div>
  </div>
);

// ─── DUPLICATE RECEIPT MODAL ──────────────────────────────────────────────────
const DuplicateReceiptModal = ({ card, onClose, onIssued }) => {
  const { toastSuccess, toastError, toastWarn } = useToast();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("offline");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [generatedRecord, setGeneratedRecord] = useState(null);
  const [isPrinted, setIsPrinted] = useState(false);

  const handleGenerate = () => {
    if (paymentMethod === "online" && !paymentRef.trim()) {
      toastError("Please enter a payment reference for online payment.");
      return;
    }
    const record = {
      receiptNo: generateDupReceiptNo(),
      cardId: card.id,
      originalReceiptNo: card.receiptNo,
      clientName: card.clientName,
      mobile: card.mobile,
      employeeId: card.employeeId,
      employeeName: card.employeeName,
      penaltyAmount: PENALTY_AMOUNT,
      paymentMethod,
      paymentRef: paymentRef.trim(),
      paymentStatus,
      issuedAt: getFormattedCurrentDate(),
      issuedDateTime: getDateTime(),
      card,
    };
    setGeneratedRecord(record);
    setStep(3);
    toastSuccess("Duplicate receipt generated!");
  };

  const handlePrint = () => {
    if (!generatedRecord) return;
    const c = generatedRecord.card;
    const pw = window.open("", "_blank", "width=400,height=820,status=no,toolbar=no,menubar=no");
    if (!pw) { toastError("Pop-up blocked! Allow pop-ups to print."); return; }
    pw.document.open();
    pw.document.write(`
<!DOCTYPE html><html><head><title>Penalty Receipt - ${generatedRecord.receiptNo}</title>
<style>
  @page { margin: 0; }
  body { font-family: sans-serif; color: black; background: white; padding: 18px 14px; margin: 0; font-size: 11px; line-height: 1.5; }
  .container { width: 80mm; max-width: 100%; margin: 0 auto; box-sizing: border-box; }
  .logo-circle { width: 64px; height: 64px; border-radius: 50%; border: 2px solid black; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px auto; background: white; padding: 5px; box-sizing: border-box; }
  .logo-circle img { height: 42px; width: auto; object-fit: contain; }
  .title { font-size: 13px; font-weight: 900; text-align: center; text-decoration: underline; font-family: serif; margin-bottom: 10px; }
  .trust-header { text-align: center; border-bottom: 1px solid black; padding-bottom: 10px; margin-bottom: 12px; }
  .trust-name { font-size: 12px; font-weight: 900; font-family: serif; }
  .address-line { font-size: 9.5px; font-weight: bold; margin-top: 2px; }
  .field-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-weight: bold; font-size: 10.5px; }
  .field-row span.label { font-weight: 900; }
  .penalty-box { text-align: center; font-weight: 900; font-size: 11.5px; border-top: 1px solid black; border-bottom: 1px solid black; padding: 7px 0; margin: 10px 0; }
  .dup-info { font-size: 9.5px; font-weight: bold; border: 1px dashed #888; padding: 5px 6px; border-radius: 3px; margin-bottom: 10px; line-height: 1.6; }
  .hindi-heading { text-align: center; font-weight: 900; font-size: 10.5px; text-decoration: underline; margin-bottom: 6px; }
  .hindi-para { font-size: 9.5px; line-height: 1.6; margin-bottom: 6px; }
  .mitra-section { border-top: 1px dashed black; padding-top: 8px; margin-top: 8px; font-weight: bold; font-size: 10.5px; line-height: 1.8; }
  .sig-box { border: 1px solid black; height: 52px; display: flex; align-items: center; justify-content: center; margin-top: 24px; border-radius: 2px; }
  .sig-text { color: #ccc; font-weight: bold; text-transform: uppercase; font-size: 10px; letter-spacing: 2px; }
</style></head><body>
<div class="container">
  <div class="logo-circle"><img src="${LOGO_BASE64}" alt="Logo"/></div>
  <div class="title">Penelty Recept</div>
  <div class="trust-header">
    <div class="trust-name">Baijnaath Kesar Bai Sewa Trust</div>
    <div class="address-line">1-A Mangla Vihar New PAC Line</div>
    <div class="address-line">Kanpur Nagar – 208015</div>
  </div>
  <div style="margin-bottom:10px; font-size:10.5px;">
    <div class="field-row"><span><span class="label">Date :-</span> ${generatedRecord.issuedAt}</span></div>
    <div class="field-row"><span><span class="label">Card ID No :-</span> ${c.id}</span></div>
    <div class="field-row"><span><span class="label">Camp Area :-</span> ${c.area || "Mangla Vihar"}</span></div>
    <div class="field-row"><span><span class="label">Mukhiya Name :-</span> ${c.mukhiyaName || c.clientName}</span></div>
    <div class="field-row"><span><span class="label">Full Address :-</span> ${c.address || "—"}</span></div>
    <div class="field-row">
      <span><span class="label">District :-</span> ${c.district || "Kanpur Nagar"}</span>
    </div>
    <div class="field-row">
      <span><span class="label">Pin Code :-</span> ${c.pincode || "208015"}</span>
      <span><span class="label">Total Member :-</span> ${c.totalMember || 1}</span>
    </div>
  </div>
  <div class="penalty-box">Penelty Amount :- Rs. ${PENALTY_AMOUNT}.00</div>
  <div class="dup-info">
    Receipt No :- ${generatedRecord.receiptNo}<br/>
    Payment Method :- ${generatedRecord.paymentMethod === "online" ? "Online (UPI/Net Banking)" : "Offline (Cash)"}<br/>
    ${generatedRecord.paymentRef ? `Ref :- ${generatedRecord.paymentRef}<br/>` : ""}
    Status :- ${generatedRecord.paymentStatus === "paid" ? "✓ Paid" : "⏳ Pending"}
  </div>
  <div class="hindi-heading">महत्वपूर्ण जानकारी</div>
  <p class="hindi-para">कार्ड का उपयोग करने से पूर्व, कृपया कार्ड के साथ दिए किए गए लेटर को ध्यानपूर्वक अवश्य पढ़ें।</p>
  <p class="hindi-para">किसी भी प्रकार की समस्या या सहायता हेतु, कृपया कार्ड के साथ दिए गए हेल्पलाइन नंबर 8303902030 पर संपर्क करें।</p>
  <p class="hindi-para">आपके द्वारा जमा की गई राशि का उपयोग जरूरतमंद लोगों की सहायता एवं सामाजिक कल्याण के कार्यों में लगाया जाता है।</p>
  <div class="mitra-section">
    <div>Ayoush Mitra Name :- ${c.employeeName || "—"}</div>
    <div>Ayoush Mitra ID No :- ${c.employeeId || "—"}</div>
  </div>
  <div class="sig-box"><span class="sig-text">Signature</span></div>
</div>
<script>window.onload=function(){window.focus();window.print();setTimeout(function(){window.close();},500);};</script>
</body></html>`);
    pw.document.close();
    setIsPrinted(true);
    toastSuccess("Penalty receipt sent to printer!");
  };

  const handleRawBtPrint = () => {
    if (!generatedRecord) return;
    const c = generatedRecord.card;
    const date = generatedRecord.issuedAt || getFormattedCurrentDate();
    const htmlContent = `
<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  body { font-family: sans-serif; color: black; background: white; margin: 0; padding: 0; }
  .container { width: 58mm; box-sizing: border-box; padding: 2mm; font-size: 8px; line-height: 1.3; }
  .logo-circle { width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid black; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px auto; background: white; padding: 3px; box-sizing: border-box; }
  .logo-circle img { height: 30px; width: auto; object-fit: contain; }
  .title { font-size: 10px; font-weight: 900; text-align: center; text-decoration: underline; font-family: serif; margin-bottom: 6px; text-transform: uppercase; }
  .trust-header { text-align: center; border-bottom: 1px solid black; padding-bottom: 6px; margin-bottom: 8px; }
  .trust-name { font-size: 9px; font-weight: 900; font-family: serif; }
  .address-line { font-size: 7.5px; font-weight: bold; margin-top: 1px; }
  .field-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-weight: bold; font-size: 8px; }
  .field-row span.label { font-weight: 900; }
  .penalty-box { text-align: center; font-weight: 900; font-size: 9px; border-top: 1px solid black; border-bottom: 1px solid black; padding: 5px 0; margin: 8px 0; }
  .dup-info { font-size: 7.5px; font-weight: bold; border: 1px dashed #888; padding: 4px; border-radius: 2px; margin-bottom: 8px; line-height: 1.4; }
  .hindi-heading { text-align: center; font-weight: 900; font-size: 8px; text-decoration: underline; margin-bottom: 4px; }
  .hindi-para { font-size: 7px; line-height: 1.4; margin-bottom: 4px; }
  .mitra-section { border-top: 1px dashed black; padding-top: 6px; margin-top: 6px; font-weight: bold; font-size: 8px; line-height: 1.5; }
  .sig-box { border: 1px solid black; height: 36px; display: flex; align-items: center; justify-content: center; margin-top: 18px; border-radius: 2px; }
  .sig-text { color: #ccc; font-weight: bold; text-transform: uppercase; font-size: 8px; letter-spacing: 1px; }
</style></head><body>
<div class="container">
  <div class="logo-circle"><img src="${LOGO_BASE64}" alt="Logo"/></div>
  <div class="title">Penalty Receipt</div>
  <div class="trust-header">
    <div class="trust-name">Baijnaath Kesar Bai Sewa Trust</div>
    <div class="address-line">1-A Mangla Vihar New PAC Line</div>
    <div class="address-line">Kanpur Nagar – 208015</div>
  </div>
  <div style="margin-bottom:8px;">
    <div class="field-row"><span><span class="label">Date :-</span> ${date}</span></div>
    <div class="field-row"><span><span class="label">Card ID No :-</span> ${c.id}</span></div>
    <div class="field-row"><span><span class="label">Camp Area :-</span> ${c.area || "Mangla Vihar"}</span></div>
    <div class="field-row"><span><span class="label">Mukhiya Name :-</span> ${c.mukhiyaName || c.clientName}</span></div>
    <div class="field-row"><span><span class="label">Full Address :-</span> ${c.address || "—"}</span></div>
    <div class="field-row"><span><span class="label">District :-</span> ${c.district || "Kanpur Nagar"}</span></div>
    <div class="field-row">
      <span><span class="label">Pin Code :-</span> ${c.pincode || "208015"}</span>
      <span><span class="label">Total Member :-</span> ${c.totalMember || 1}</span>
    </div>
  </div>
  <div class="penalty-box">Penalty Amount :- Rs. ${PENALTY_AMOUNT}.00</div>
  <div class="dup-info">
    Receipt No :- ${generatedRecord.receiptNo}<br/>
    Payment Method :- ${generatedRecord.paymentMethod === "online" ? "Online" : "Offline (Cash)"}<br/>
    ${generatedRecord.paymentRef ? `Ref :- ${generatedRecord.paymentRef}<br/>` : ""}
    Status :- Paid
  </div>
  <div class="hindi-heading">महत्वपूर्ण जानकारी</div>
  <p class="hindi-para">कार्ड का उपयोग करने से पूर्व, कृपया कार्ड के साथ दिए किए गए लेटर को ध्यानपूर्वक अवश्य पढ़ें।</p>
  <p class="hindi-para">किसी भी प्रकार की समस्या या सहायता हेतु, कृपया कार्ड के साथ दिए गए हेल्पलाइन नंबर 8303902030 पर संपर्क करें।</p>
  <div class="mitra-section">
    <div>Ayoush Mitra Name :- ${c.employeeName || "—"}</div>
    <div>Ayoush Mitra ID No :- ${c.employeeId || "—"}</div>
  </div>
  <div class="sig-box"><span class="sig-text">Signature</span></div>
</div>
</body></html>`;

    const b64 = btoa(unescape(encodeURIComponent(htmlContent)));
    const playStoreUrl = "https://play.google.com/store/apps/details?id=ru.a402d.rawbtprinter";
    const rawbtIntent = `intent:#Intent;action=ru.a402d.rawbtprinter.action.PRINT;category=android.intent.category.DEFAULT;type=text/html;S.text=${b64};S.ru.a402d.rawbtprinter.EXTRA_B64=true;S.browser_fallback_url=${encodeURIComponent(playStoreUrl)};end;`;

    const userAgent = navigator.userAgent || "";
    const isAndroid = /Android/i.test(userAgent);
    if (!isAndroid) {
      toastWarn("RawBT printing works on Android phones. Use normal Print on desktop.");
      return;
    }
    window.location.href = rawbtIntent;
    setIsPrinted(true);
  };

  const handleSaveAndClose = () => {
    if (generatedRecord) onIssued(generatedRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[95vh]" style={{ fontFamily: "Inter, sans-serif" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-sm font-black text-[#22333B]">Issue Duplicate Receipt</h3>
            <p className="text-xs text-gray-400 mt-0.5">Card: <span className="font-mono font-bold">{card.id}</span> · {card.clientName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center px-5 py-3 bg-gray-50 border-b border-gray-100 shrink-0 gap-2">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${step >= s ? "text-[#F68E5F]" : "text-gray-400"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-colors
                  ${step > s ? "bg-[#F68E5F] border-[#F68E5F] text-white" : step === s ? "border-[#F68E5F] text-[#F68E5F]" : "border-gray-200 text-gray-400"}`}>
                  {step > s ? <Check size={10} /> : s}
                </div>
                {s === 1 ? "Review" : s === 2 ? "Payment" : "Receipt"}
              </div>
              {s < 3 && <ChevronRight size={12} className="text-gray-300 shrink-0" />}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Step 1: Card Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-2">Original Card Details</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  {[
                    ["Card ID", card.id],
                    ["Receipt No.", card.receiptNo],
                    ["Client Name", card.clientName],
                    ["Mobile", card.mobile],
                    ["Camp Area", card.area],
                    ["District", card.district],
                    ["Pin Code", card.pincode],
                    ["Total Members", card.totalMember],
                    ["Amount Paid", `₹${card.amount}`],
                    ["Card Type", card.cardType],
                    ["Export Date", card.exportDate],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-gray-400 font-semibold">{label}</p>
                      <p className="font-bold text-[#22333B]">{val || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Ayush Mitra (Issuing Employee)</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-100 text-[#F68E5F] flex items-center justify-center font-black text-sm">
                    {card.employeeName?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#22333B]">{card.employeeName}</p>
                    <p className="text-xs text-gray-400 font-mono">{card.employeeId}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <p>A penalty fee of <strong>₹{PENALTY_AMOUNT}</strong> will be charged for issuing a duplicate receipt. Please confirm with the client before proceeding.</p>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-700 mb-2">Penalty Amount</p>
                <div className="bg-[#22333B] text-white rounded-xl p-4 text-center">
                  <p className="text-xs font-semibold opacity-70 mb-1">Amount to Collect</p>
                  <p className="text-3xl font-black">₹{PENALTY_AMOUNT}.00</p>
                  <p className="text-[10px] opacity-60 mt-1">Duplicate / Reissue Fee</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-700 mb-2">Payment Method</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: "offline", label: "Offline (Cash)", Icon: Banknote },
                    { val: "online", label: "Online (UPI/Net)", Icon: Wifi },
                  ].map(({ val, label, Icon: Ic }) => (
                    <button key={val} onClick={() => setPaymentMethod(val)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-bold transition-all
                        ${paymentMethod === val ? "border-[#F68E5F] bg-orange-50 text-[#F68E5F]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                      <Ic size={16} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === "online" && (
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">Payment Reference / Transaction ID <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. UPI ref: 123456789"
                    value={paymentRef}
                    onChange={e => setPaymentRef(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F68E5F]/30 focus:border-[#F68E5F]"
                  />
                </div>
              )}

              <div>
                <p className="text-xs font-bold text-gray-700 mb-2">Payment Status</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: "paid", label: "Paid", Icon: Check, color: "green" },
                    { val: "pending", label: "Pending", Icon: Clock, color: "amber" },
                  ].map(({ val, label, Icon: Ic, color }) => (
                    <button key={val} onClick={() => setPaymentStatus(val)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-bold transition-all
                        ${paymentStatus === val
                          ? color === "green" ? "border-green-500 bg-green-50 text-green-600" : "border-amber-400 bg-amber-50 text-amber-600"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                      <Ic size={16} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Receipt Preview */}
          {step === 3 && generatedRecord && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-100 rounded-xl p-3">
                <Check size={14} className="shrink-0" />
                <p>Receipt <strong>{generatedRecord.receiptNo}</strong> generated. Print or save below.</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 flex items-start justify-center overflow-y-auto" style={{ maxHeight: "400px" }}>
                <PenaltyReceiptPreview card={generatedRecord.card} receiptRecord={generatedRecord} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
          {step === 1 && (
            <>
              <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => setStep(2)} className="flex-1 py-2 bg-[#F68E5F] text-white rounded-xl text-xs font-black hover:bg-[#ff7637] transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap">
                Proceed to Payment <ChevronRight size={13} />
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <button onClick={() => setStep(1)} className="flex items-center gap-1 py-2 px-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 transition-colors whitespace-nowrap">
                <ChevronLeft size={13} /> Back
              </button>
              <button onClick={handleGenerate} className="flex-1 py-2 bg-[#F68E5F] text-white rounded-xl text-xs font-black hover:bg-[#ff7637] transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap">
                Generate Receipt <ChevronRight size={13} />
              </button>
            </>
          )}
          {step === 3 && (
            <div className="flex flex-col sm:flex-row w-full gap-2">
              <button onClick={handleSaveAndClose} className="w-full sm:w-auto py-2 px-4 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 transition-colors text-center whitespace-nowrap">
                {isPrinted ? "Close" : "Save & Close"}
              </button>
              <div className="flex flex-1 gap-2 w-full">
                <button onClick={handlePrint} className="flex-1 py-2 bg-[#22333B] text-white rounded-xl text-xs font-black hover:bg-[#1a2830] transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap">
                  <Printer size={13} /> Print
                </button>
                <button onClick={handleRawBtPrint} className="flex-1 py-2 bg-[#F68E5F] text-white rounded-xl text-xs font-black hover:bg-[#ff7637] transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap">
                  RawBT Print
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── VIEW PENALTY RECEIPT MODAL (for history tab) ─────────────────────────────
const ViewPenaltyModal = ({ record, onClose }) => {
  const { toastSuccess, toastError, toastWarn } = useToast();

  const handlePrint = () => {
    const c = record.card;
    const pw = window.open("", "_blank", "width=400,height=820,status=no,toolbar=no,menubar=no");
    if (!pw) { toastError("Pop-up blocked!"); return; }
    pw.document.open();
    pw.document.write(`
<!DOCTYPE html><html><head><title>Penalty Receipt - ${record.receiptNo}</title>
<style>
  @page { margin: 0; }
  body { font-family: sans-serif; color: black; background: white; padding: 18px 14px; margin: 0; font-size: 11px; line-height: 1.5; }
  .container { width: 80mm; max-width: 100%; margin: 0 auto; box-sizing: border-box; }
  .logo-circle { width: 64px; height: 64px; border-radius: 50%; border: 2px solid black; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px auto; background: white; padding: 5px; box-sizing: border-box; }
  .logo-circle img { height: 42px; width: auto; object-fit: contain; }
  .title { font-size: 13px; font-weight: 900; text-align: center; text-decoration: underline; font-family: serif; margin-bottom: 10px; }
  .trust-header { text-align: center; border-bottom: 1px solid black; padding-bottom: 10px; margin-bottom: 12px; }
  .trust-name { font-size: 12px; font-weight: 900; font-family: serif; }
  .address-line { font-size: 9.5px; font-weight: bold; margin-top: 2px; }
  .field-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-weight: bold; font-size: 10.5px; }
  .penalty-box { text-align: center; font-weight: 900; font-size: 11.5px; border-top: 1px solid black; border-bottom: 1px solid black; padding: 7px 0; margin: 10px 0; }
  .dup-info { font-size: 9.5px; font-weight: bold; border: 1px dashed #888; padding: 5px 6px; border-radius: 3px; margin-bottom: 10px; line-height: 1.6; }
  .hindi-heading { text-align: center; font-weight: 900; font-size: 10.5px; text-decoration: underline; margin-bottom: 6px; }
  .hindi-para { font-size: 9.5px; line-height: 1.6; margin-bottom: 6px; }
  .mitra-section { border-top: 1px dashed black; padding-top: 8px; margin-top: 8px; font-weight: bold; font-size: 10.5px; line-height: 1.8; }
  .sig-box { border: 1px solid black; height: 52px; display: flex; align-items: center; justify-content: center; margin-top: 24px; border-radius: 2px; }
  .sig-text { color: #ccc; font-weight: bold; text-transform: uppercase; font-size: 10px; letter-spacing: 2px; }
</style></head><body>
<div class="container">
  <div class="logo-circle"><img src="${LOGO_BASE64}" alt="Logo"/></div>
  <div class="title">Penelty Recept</div>
  <div class="trust-header">
    <div class="trust-name">Baijnaath Kesar Bai Sewa Trust</div>
    <div class="address-line">1-A Mangla Vihar New PAC Line</div>
    <div class="address-line">Kanpur Nagar – 208015</div>
  </div>
  <div style="margin-bottom:10px; font-size:10.5px;">
    <div class="field-row"><span><b>Date :-</b> ${record.issuedAt}</span></div>
    <div class="field-row"><span><b>Card ID No :-</b> ${c?.id || "—"}</span></div>
    <div class="field-row"><span><b>Camp Area :-</b> ${c?.area || "Mangla Vihar"}</span></div>
    <div class="field-row"><span><b>Mukhiya Name :-</b> ${c?.mukhiyaName || c?.clientName || "—"}</span></div>
    <div class="field-row"><span><b>Full Address :-</b> ${c?.address || "—"}</span></div>
    <div class="field-row"><span><b>District :-</b> ${c?.district || "Kanpur Nagar"}</span></div>
    <div class="field-row"><span><b>Pin Code :-</b> ${c?.pincode || "208015"}</span><span><b>Total Member :-</b> ${c?.totalMember || 1}</span></div>
  </div>
  <div class="penalty-box">Penelty Amount :- Rs. ${PENALTY_AMOUNT}.00</div>
  <div class="dup-info">
    Receipt No :- ${record.receiptNo}<br/>
    Payment Method :- ${record.paymentMethod === "online" ? "Online (UPI/Net Banking)" : "Offline (Cash)"}<br/>
    ${record.paymentRef ? `Ref :- ${record.paymentRef}<br/>` : ""}
    Status :- ${record.paymentStatus === "paid" ? "✓ Paid" : "⏳ Pending"}
  </div>
  <div class="hindi-heading">महत्वपूर्ण जानकारी</div>
  <p class="hindi-para">कार्ड का उपयोग करने से पूर्व, कृपया कार्ड के साथ दिए किए गए लेटर को ध्यानपूर्वक अवश्य पढ़ें।</p>
  <p class="hindi-para">किसी भी प्रकार की समस्या या सहायता हेतु, कृपया कार्ड के साथ दिए गए हेल्पलाइन नंबर 8303902030 पर संपर्क करें।</p>
  <p class="hindi-para">आपके द्वारा जमा की गई राशि का उपयोग जरूरतमंद लोगों की सहायता एवं सामाजिक कल्याण के कार्यों में लगाया जाता है।</p>
  <div class="mitra-section">
    <div>Ayoush Mitra Name :- ${c?.employeeName || "—"}</div>
    <div>Ayoush Mitra ID No :- ${c?.employeeId || "—"}</div>
  </div>
  <div class="sig-box"><span class="sig-text">Signature</span></div>
</div>
<script>window.onload=function(){window.focus();window.print();setTimeout(function(){window.close();},500);};</script>
</body></html>`);
    pw.document.close();
    toastSuccess("Sent penalty receipt to printer!");
  };

  const handleRawBtPrint = () => {
    const c = record.card;
    const htmlContent = `
<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  body { font-family: sans-serif; color: black; background: white; margin: 0; padding: 0; }
  .container { width: 58mm; box-sizing: border-box; padding: 2mm; font-size: 8px; line-height: 1.3; }
  .logo-circle { width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid black; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px auto; background: white; padding: 3px; box-sizing: border-box; }
  .logo-circle img { height: 30px; width: auto; object-fit: contain; }
  .title { font-size: 10px; font-weight: 900; text-align: center; text-decoration: underline; font-family: serif; margin-bottom: 6px; text-transform: uppercase; }
  .trust-header { text-align: center; border-bottom: 1px solid black; padding-bottom: 6px; margin-bottom: 8px; }
  .trust-name { font-size: 9px; font-weight: 900; font-family: serif; }
  .address-line { font-size: 7.5px; font-weight: bold; margin-top: 1px; }
  .field-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-weight: bold; font-size: 8px; }
  .field-row span.label { font-weight: 900; }
  .penalty-box { text-align: center; font-weight: 900; font-size: 9px; border-top: 1px solid black; border-bottom: 1px solid black; padding: 5px 0; margin: 8px 0; }
  .dup-info { font-size: 7.5px; font-weight: bold; border: 1px dashed #888; padding: 4px; border-radius: 2px; margin-bottom: 8px; line-height: 1.4; }
  .hindi-heading { text-align: center; font-weight: 900; font-size: 8px; text-decoration: underline; margin-bottom: 4px; }
  .hindi-para { font-size: 7px; line-height: 1.4; margin-bottom: 4px; }
  .mitra-section { border-top: 1px dashed black; padding-top: 6px; margin-top: 6px; font-weight: bold; font-size: 8px; line-height: 1.5; }
  .sig-box { border: 1px solid black; height: 36px; display: flex; align-items: center; justify-content: center; margin-top: 18px; border-radius: 2px; }
  .sig-text { color: #ccc; font-weight: bold; text-transform: uppercase; font-size: 8px; letter-spacing: 1px; }
</style></head><body>
<div class="container">
  <div class="logo-circle"><img src="${LOGO_BASE64}" alt="Logo"/></div>
  <div class="title">Penalty Receipt</div>
  <div class="trust-header">
    <div class="trust-name">Baijnaath Kesar Bai Sewa Trust</div>
    <div class="address-line">1-A Mangla Vihar New PAC Line</div>
    <div class="address-line">Kanpur Nagar – 208015</div>
  </div>
  <div style="margin-bottom:8px;">
    <div class="field-row"><span><span class="label">Date :-</span> ${record.issuedAt}</span></div>
    <div class="field-row"><span><span class="label">Card ID No :-</span> ${c?.id || "—"}</span></div>
    <div class="field-row"><span><span class="label">Camp Area :-</span> ${c?.area || "Mangla Vihar"}</span></div>
    <div class="field-row"><span><span class="label">Mukhiya Name :-</span> ${c?.mukhiyaName || c?.clientName || "—"}</span></div>
    <div class="field-row"><span><span class="label">Full Address :-</span> ${c?.address || "—"}</span></div>
    <div class="field-row"><span><span class="label">District :-</span> ${c?.district || "Kanpur Nagar"}</span></div>
    <div class="field-row">
      <span><span class="label">Pin Code :-</span> ${c?.pincode || "208015"}</span>
      <span><span class="label">Total Member :-</span> ${c?.totalMember || 1}</span>
    </div>
  </div>
  <div class="penalty-box">Penalty Amount :- Rs. ${PENALTY_AMOUNT}.00</div>
  <div class="dup-info">
    Receipt No :- ${record.receiptNo}<br/>
    Payment Method :- ${record.paymentMethod === "online" ? "Online" : "Offline (Cash)"}<br/>
    ${record.paymentRef ? `Ref :- ${record.paymentRef}<br/>` : ""}
    Status :- Paid
  </div>
  <div class="hindi-heading">महत्वपूर्ण जानकारी</div>
  <p class="hindi-para">कार्ड का उपयोग करने से पूर्व, कृपया कार्ड के साथ दिए किए गए लेटर को ध्यानपूर्वक अवश्य पढ़ें।</p>
  <p class="hindi-para">किसी भी प्रकार की समस्या या सहायता हेतु, कृपया कार्ड के साथ दिए गए हेल्पलाइन नंबर 8303902030 पर संपर्क करें।</p>
  <div class="mitra-section">
    <div>Ayoush Mitra Name :- ${c?.employeeName || "—"}</div>
    <div>Ayoush Mitra ID No :- ${c?.employeeId || "—"}</div>
  </div>
  <div class="sig-box"><span class="sig-text">Signature</span></div>
</div>
</body></html>`;

    const b64 = btoa(unescape(encodeURIComponent(htmlContent)));
    const playStoreUrl = "https://play.google.com/store/apps/details?id=ru.a402d.rawbtprinter";
    const rawbtIntent = `intent:#Intent;action=ru.a402d.rawbtprinter.action.PRINT;category=android.intent.category.DEFAULT;type=text/html;S.text=${b64};S.ru.a402d.rawbtprinter.EXTRA_B64=true;S.browser_fallback_url=${encodeURIComponent(playStoreUrl)};end;`;

    const userAgent = navigator.userAgent || "";
    const isAndroid = /Android/i.test(userAgent);
    if (!isAndroid) {
      toastWarn("RawBT printing works on Android phones. Use normal Print on desktop.");
      return;
    }
    window.location.href = rawbtIntent;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-sm font-black text-[#22333B]">Penalty Receipt</h3>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{record.receiptNo}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-50 p-5 flex justify-center">
          <PenaltyReceiptPreview card={record.card} receiptRecord={record} />
        </div>
        <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-2 shrink-0 w-full">
          <button onClick={onClose} className="w-full sm:w-auto py-2 px-4 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 text-center whitespace-nowrap">Close</button>
          <div className="flex flex-1 gap-2 w-full">
            <button onClick={handlePrint} className="flex-1 py-2 bg-[#22333B] text-white rounded-xl text-xs font-black hover:bg-[#1a2830] flex items-center justify-center gap-1.5 whitespace-nowrap">
              <Printer size={13} /> Print
            </button>
            <button onClick={handleRawBtPrint} className="flex-1 py-2 bg-[#F68E5F] text-white rounded-xl text-xs font-black hover:bg-[#ff7637] flex items-center justify-center gap-1.5 whitespace-nowrap">
              RawBT Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const AyushVitran = () => {
  const { toastSuccess, toastError, toastWarn } = useToast();
  const [activeTab, setActiveTab] = useState("employees");

  // Auth
  const [userRole, setUserRole] = useState("Admin");
  const [currentUser, setCurrentUser] = useState({ name: "Officer", email: "officer@bkbs.org", id: "EMP-1000" });

  // Employee tab state
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [empSearch, setEmpSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Exported Cards tab state — fetched from API
  const [exportedCards, setExportedCards] = useState([]);
  const [exportedLoading, setExportedLoading] = useState(false);
  const [exportedPage, setExportedPage] = useState(1);
  const [exportedItemsPerPage] = useState(25);
  const [exportedTotalItems, setExportedTotalItems] = useState(0);
  const [exportedTotalPages, setExportedTotalPages] = useState(1);
  const [cardSearch, setCardSearch] = useState("");
  const [cardFilterEmployee, setCardFilterEmployee] = useState("");
  const [selectedCardForDup, setSelectedCardForDup] = useState(null);
  // Map of employeeId -> name for display
  const [createdByMap, setCreatedByMap] = useState({});

  // Duplicate receipts state
  const [dupReceipts, setDupReceipts] = useState([]);
  const [dupFilterStatus, setDupFilterStatus] = useState("");
  const [dupFilterMethod, setDupFilterMethod] = useState("");
  const [viewingReceipt, setViewingReceipt] = useState(null);

  // Fetch exported (printed) cards from API
  const fetchExportedCards = useCallback(async () => {
    setExportedLoading(true);
    try {
      const params = { page: exportedPage, limit: exportedItemsPerPage, sort: "-createdAt" };
      if (cardSearch.trim()) params.search = cardSearch.trim();
      const res = await apiService.getPrintedCards(params);
      const { raw, total, pages } = parseHealthCardsResponse(res);
      const normalized = raw.map(normalizeHealthCard);
      setExportedCards(normalized);
      setExportedTotalItems(Number(total));
      setExportedTotalPages(Number((pages ?? Math.ceil(total / exportedItemsPerPage)) || 1));

      // Resolve employee names for createdBy IDs
      const ids = [...new Set(normalized.map(c => {
        const raw = c.createdBy;
        return typeof raw === "string" ? raw : (raw?._id || raw?.employeeId || "");
      }).filter(Boolean))];
      const missing = ids.filter(id => !createdByMap[id]);
      if (missing.length > 0) {
        const results = await Promise.all(missing.map(async id => {
          try {
            const empRes = await apiService.getEmployeeById(String(id));
            const u = empRes?.data?.user || empRes?.user || empRes?.data?.data || empRes?.data || empRes;
            const name = u?.name || [u?.firstName, u?.lastName].filter(Boolean).join(" ") || u?.email || String(id);
            return [id, name];
          } catch { return [id, String(id)]; }
        }));
        setCreatedByMap(prev => { const next = { ...prev }; results.forEach(([id, n]) => { next[id] = n; }); return next; });
      }
    } catch (err) {
      console.warn("[AyushVitran] Failed to fetch exported cards:", err.message);
    } finally {
      setExportedLoading(false);
    }
  }, [exportedPage, exportedItemsPerPage]);

  useEffect(() => {
    if (activeTab === "exported" && userRole !== "Employee") fetchExportedCards();
  }, [activeTab, exportedPage, userRole]);

  // Load auth
  useEffect(() => {
    const userRaw = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userRaw) {
      try {
        const u = JSON.parse(userRaw);
        setCurrentUser({ name: u.name || "Employee", email: u.email || "N/A", id: u.employeeId || u._id || "EMP-1000", location: u.location || "Mangla Vihar" });
      } catch {}
    }
    setUserRole(localStorage.getItem("userRole") || "Admin");
  }, []);

  // Load duplicate receipts from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("ayush_dup_receipts") || "[]");
      setDupReceipts(stored);
    } catch {
      setDupReceipts([]);
    }
  }, []);

  // Save duplicate receipts to localStorage
  const saveDupReceipt = useCallback((record) => {
    setDupReceipts(prev => {
      const updated = [record, ...prev];
      try { localStorage.setItem("ayush_dup_receipts", JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  // Fallback employees
  const fallbackEmployees = useMemo(() => {
    const todayStr = getFormattedCurrentDate();
    return [
      { id: "EMP-2038", name: "Amit Sharma", email: "amit.sharma@bkbs.org", date: todayStr, location: "Mangla Vihar", totalCards: 67, pincode: "208015" },
      { id: "EMP-2039", name: "Priya Patel", email: "priya.patel@bkbs.org", date: todayStr, location: "PAC Line", totalCards: 77, pincode: "208015" },
      { id: "EMP-2040", name: "Rajesh Verma", email: "rajesh.verma@bkbs.org", date: todayStr, location: "Kanpur Nagar", totalCards: 48, pincode: "208012" },
      { id: "EMP-2041", name: "Sneha Reddy", email: "sneha.reddy@bkbs.org", date: todayStr, location: "Kalyanpur", totalCards: 85, pincode: "208016" },
      { id: "EMP-2042", name: "Vikram Malhotra", email: "vikram.malhotra@bkbs.org", date: todayStr, location: "Kidwai Nagar", totalCards: 36, pincode: "208011" },
      { id: "EMP-2043", name: "Suresh Gupta", email: "suresh.gupta@bkbs.org", date: todayStr, location: "Awas Vikas", totalCards: 54, pincode: "208015" },
    ];
  }, []);

  const fetchEmployeesList = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch employees list
      const res = await apiService.getEmployees({ page: currentPage, limit: itemsPerPage });
      const rawData = res.data || res;
      let list = Array.isArray(rawData) ? rawData : [];
      if (!list.length && rawData?.data && Array.isArray(rawData.data)) list = rawData.data;
      if (!list.length && rawData?.users && Array.isArray(rawData.users)) list = rawData.users;
      if (!list.length && rawData?.employees && Array.isArray(rawData.employees)) list = rawData.employees;
      
      // 2. Fetch employee performance for actual card counts
      let performanceMap = {};
      try {
        const perfRes = await apiService.getReportsEmployeePerformance();
        const perfData = perfRes?.data || perfRes || [];
        if (Array.isArray(perfData)) {
          perfData.forEach(p => {
            const count = Number(p.cardsIssued || p.count || p.totalCards || 0);
            if (p.employeeId) {
              performanceMap[p.employeeId.toString().toLowerCase()] = count;
            }
            if (p.name) {
              performanceMap[p.name.toString().toLowerCase()] = count;
            }
            if (p._id) {
              performanceMap[p._id.toString().toLowerCase()] = count;
            }
          });
        }
      } catch (perfErr) {
        console.warn("[AyushVitran] Failed to fetch employee performance for card counts:", perfErr);
      }

      const todayStr = getFormattedCurrentDate();
      if (list && list.length > 0) {
        const mapped = list.map((u, i) => {
          const rawId = u._id ? u._id.toString().toLowerCase() : "";
          const empId = u.employeeId ? u.employeeId.toString().toLowerCase() : "";
          const userName = u.name ? u.name.toString().toLowerCase() : "";

          // Fetch correct count from API mapping or fallback
          const totalCards = performanceMap[rawId] 
            || performanceMap[empId] 
            || performanceMap[userName] 
            || Number(u.totalCards || u.cardsCount || u.cardsIssued || 0);

          return {
            id: u.employeeId || u._id || `EMP-${2000 + i}`,
            name: u.name || "Unknown Staff",
            email: u.email || "N/A",
            date: todayStr,
            location: u.location || "Mangla Vihar",
            totalCards,
            pincode: u.pincode || "208015",
            _rawId: u._id,
          };
        });
        setEmployees(mapped);
        setTotalItems(mapped.length);
        setTotalPages(Math.ceil(mapped.length / itemsPerPage) || 1);
      } else {
        setEmployees(fallbackEmployees);
        setTotalItems(fallbackEmployees.length);
        setTotalPages(Math.ceil(fallbackEmployees.length / itemsPerPage) || 1);
      }
    } catch {
      setEmployees(fallbackEmployees);
      setTotalItems(fallbackEmployees.length);
      setTotalPages(Math.ceil(fallbackEmployees.length / itemsPerPage) || 1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, fallbackEmployees]);

  useEffect(() => {
    if (userRole !== "Employee") fetchEmployeesList();
  }, [currentPage, itemsPerPage, userRole]);

  // PWT Settlement Print
  const handlePrintSlip = (employee) => {
    if (!employee) return;
    const calc = calculateSettlement(employee.totalCards);
    const dateStr = getFormattedCurrentDate();
    const pw = window.open("", "_blank", "width=380,height=750,status=no,toolbar=no,menubar=no");
    if (!pw) { toastError("Pop-up blocked! Allow pop-ups for this site."); return; }
    pw.document.open();
    pw.document.write(`
<html><head><title>Settlement - ${employee.name}</title>
<style>
  @page{margin:0}body{font-family:monospace;color:black;background:white;padding:20px;margin:0;font-size:11px;line-height:1.4}
  .container{width:80mm;max-width:100%;margin:0 auto;box-sizing:border-box}
  .logo-circle{width:80px;height:80px;border-radius:50%;border:1px solid black;display:flex;align-items:center;justify-content:center;margin:0 auto 10px auto;background:white;padding:5px;box-sizing:border-box}
  .logo-circle img{height:50px;width:auto;object-fit:contain}
  .title{font-size:14px;font-weight:bold;text-align:center;text-transform:uppercase;margin-top:5px;font-family:sans-serif;letter-spacing:2px}
  .header-address{font-family:sans-serif;text-align:center;margin-bottom:15px;border-bottom:1px dashed black;padding-bottom:8px}
  .trust-name{font-size:11px;font-weight:bold;text-transform:uppercase;margin:0}
  .address-line{font-size:9px;font-weight:bold;margin:2px 0 0 0}
  .metadata{margin-bottom:15px;font-weight:bold}
  .metadata-row{display:flex;justify-content:space-between;margin-bottom:3.5px}
  .metadata-double{display:flex;justify-content:space-between;margin-top:3.5px}
  .dashed-border-top-bottom{border-top:1px dashed black;border-bottom:1px dashed black;padding:5px 0;margin:12px 0;text-align:center;font-size:11.5px;font-weight:bold;font-family:sans-serif}
  .dashed-divider{border-top:1px dashed black;margin:5px 0}
  .table-heading{display:flex;justify-content:space-between;font-family:sans-serif;text-transform:uppercase;font-weight:bold;border-bottom:1px solid black;padding-bottom:3px;margin-bottom:6px;font-size:9.5px}
  .table-row{display:flex;justify-content:space-between;margin-bottom:4px}
  .table-total{display:flex;justify-content:space-between;font-weight:bold;border-top:1px solid black;padding-top:5px;margin-top:6px;font-size:10.5px}
  .grand-total-box{background:#f9f9f9;border:1px solid black;padding:6px;text-align:center;font-family:sans-serif;margin:15px 0}
  .grand-total-title{font-size:8.5px;color:#555;text-transform:uppercase;font-weight:bold;letter-spacing:0.5px}
  .grand-total-value{font-size:10px;font-weight:bold;margin-top:2px}
  .grand-total-highlight{font-size:13px;font-weight:900}
  .signatures{margin-top:25px;font-weight:bold}
  .signatures div{margin-bottom:12px}
  .sig-box-container{margin-top:30px;margin-bottom:10px}
  .sig-box{border:1px solid black;border-radius:2px;height:50px;display:flex;align-items:center;justify-content:center}
  .sig-text{font-family:sans-serif;color:#ccc;font-weight:bold;text-transform:uppercase;font-size:10px;letter-spacing:2px}
</style></head><body>
<div class="container">
  <div class="logo-circle"><img src="${LOGO_BASE64}" alt="Logo"/></div>
  <div class="title">Settlement</div>
  <div class="header-address">
    <div class="trust-name">Baijnaath Kesar Bai Sewa Trust</div>
    <div class="address-line">1-A Mangla Vihar New PAC Line</div>
    <div class="address-line">Kanpur Nagar – 208015</div>
  </div>
  <div class="metadata">
    <div class="metadata-row"><span>Date :-</span><span>${dateStr}</span></div>
    <div class="metadata-row"><span>Camp Area :-</span><span>${employee.location || "Mangla Vihar"}</span></div>
    <div class="metadata-row"><span>Ayush Mitra Name :-</span><span>${employee.name}</span></div>
    <div class="metadata-row"><span>Ayoush Mitra ID No :-</span><span>${employee.id}</span></div>
    <div class="metadata-double"><span>District :- Kanpur Nagar</span><span>Pin Code :- ${employee.pincode || "208015"}</span></div>
    <div class="dashed-divider" style="margin-top:6px"></div>
    <div style="margin-top:5px">Total Apply Ayoush Card - ${employee.totalCards}</div>
  </div>
  <div class="dashed-border-top-bottom uppercase">Apply Ayoush Card</div>
  <div class="table-heading"><span>Card Detail - Amount</span><span>Online - Amount</span></div>
  <div class="table-row"><span>160 x ${calc.off160} = ${Number(calc.amt160).toFixed(2)}</span><span>${calc.on160} = ${Number(calc.onAmt160).toFixed(0)}</span></div>
  <div class="table-row"><span>200 x ${calc.off200} = ${Number(calc.amt200).toFixed(2)}</span><span>${calc.on200} = ${Number(calc.onAmt200).toFixed(0)}</span></div>
  <div class="table-row"><span>240 x ${calc.off240} = ${Number(calc.amt240).toFixed(2)}</span><span>${calc.on240} = ${Number(calc.onAmt240).toFixed(0)}</span></div>
  <div class="table-row"><span>280 x ${calc.off280} = ${Number(calc.amt280).toFixed(2)}</span><span>${calc.on280} = ${Number(calc.onAmt280).toFixed(0)}</span></div>
  <div class="table-row"><span>Penelty x ${calc.penaltyCount} = ${Number(calc.penaltyAmount).toFixed(2)}</span><span>${calc.onPenaltyCount} = ${Number(calc.onPenaltyAmount).toFixed(0)}</span></div>
  <div class="table-total"><span>Total = ${calc.offlineCount} = ${Number(calc.offlineTotalWithPenalty).toFixed(2)}</span><span>${calc.onlineCount} = ${Number(calc.onlineTotalWithPenalty).toFixed(2)}</span></div>
  <div class="grand-total-box">
    <div class="grand-total-title">Calculated Revenue Equation</div>
    <div class="grand-total-value">Grand Total = ${calc.offlineBaseTotal} + ${calc.onlineTotalWithPenalty} + ${calc.penaltyAmount} = <span class="grand-total-highlight">₹${calc.grandTotal}</span></div>
  </div>
  <div class="signatures"><div>Cash Receiver Name : __________________</div><div>Cash Receiver ID No :- __________________</div></div>
  <div class="sig-box-container"><div class="sig-box"><span class="sig-text">Signature</span></div></div>
</div>
<script>window.onload=function(){window.focus();window.print();setTimeout(function(){window.close();},500);};</script>
</body></html>`);
    pw.document.close();
    toastSuccess("Settlement slip sent to printer!");
  };

  const handleRawBtPrintSlip = (employee) => {
    if (!employee) return;
    const calc = calculateSettlement(employee.totalCards);
    const dateStr = getFormattedCurrentDate();
    const htmlContent = `
<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  body { font-family: monospace; color: black; background: white; margin: 0; padding: 0; }
  .container { width: 58mm; box-sizing: border-box; padding: 2mm; font-size: 8px; line-height: 1.3; }
  .logo-circle { width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid black; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px auto; background: white; padding: 3px; box-sizing: border-box; }
  .logo-circle img { height: 30px; width: auto; object-fit: contain; }
  .title { font-size: 10px; font-weight: bold; text-align: center; text-transform: uppercase; margin-top: 4px; font-family: sans-serif; letter-spacing: 1px; }
  .header-address { font-family: sans-serif; text-align: center; margin-bottom: 8px; border-bottom: 1px dashed black; padding-bottom: 4px; }
  .trust-name { font-size: 8px; font-weight: bold; text-transform: uppercase; margin: 0; }
  .address-line { font-size: 7px; font-weight: bold; margin: 1px 0 0 0; }
  .metadata { margin-bottom: 8px; font-weight: bold; }
  .metadata-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
  .metadata-double { display: flex; justify-content: space-between; margin-top: 2px; }
  .dashed-border-top-bottom { border-top: 1px dashed black; border-bottom: 1px dashed black; padding: 4px 0; margin: 8px 0; text-align: center; font-size: 8.5px; font-weight: bold; font-family: sans-serif; }
  .dashed-divider { border-top: 1px dashed black; margin: 4px 0; }
  .table-heading { display: flex; justify-content: space-between; font-family: sans-serif; text-transform: uppercase; font-weight: bold; border-bottom: 1px solid black; padding-bottom: 2px; margin-bottom: 4px; font-size: 7.5px; }
  .table-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
  .table-total { display: flex; justify-content: space-between; font-weight: bold; border-top: 1px solid black; padding-top: 4px; margin-top: 4px; font-size: 8px; }
  .grand-total-box { background: #f9f9f9; border: 1px solid black; padding: 4px; text-align: center; font-family: sans-serif; margin: 8px 0; }
  .grand-total-title { font-size: 6.5px; color: #555; text-transform: uppercase; font-weight: bold; }
  .grand-total-value { font-size: 7.5px; font-weight: bold; margin-top: 1px; }
  .grand-total-highlight { font-size: 9px; font-weight: 900; }
  .signatures { margin-top: 16px; font-weight: bold; }
  .signatures div { margin-bottom: 8px; }
  .sig-box-container { margin-top: 18px; margin-bottom: 6px; }
  .sig-box { border: 1px solid black; border-radius: 2px; height: 36px; display: flex; align-items: center; justify-content: center; }
  .sig-text { font-family: sans-serif; color: #ccc; font-weight: bold; text-transform: uppercase; font-size: 8px; letter-spacing: 1px; }
</style></head><body>
<div class="container">
  <div class="logo-circle"><img src="${LOGO_BASE64}" alt="Logo"/></div>
  <div class="title">Settlement</div>
  <div class="header-address">
    <div class="trust-name">Baijnaath Kesar Bai Sewa Trust</div>
    <div class="address-line">1-A Mangla Vihar New PAC Line</div>
    <div class="address-line">Kanpur Nagar – 208015</div>
  </div>
  <div class="metadata">
    <div class="metadata-row"><span>Date :-</span><span>${dateStr}</span></div>
    <div class="metadata-row"><span>Camp Area :-</span><span>${employee.location || "Mangla Vihar"}</span></div>
    <div class="metadata-row"><span>Mitra Name :-</span><span>${employee.name}</span></div>
    <div class="metadata-row"><span>Mitra ID No :-</span><span>${employee.id}</span></div>
    <div class="metadata-double"><span>District :- Kanpur</span><span>Pin Code :- ${employee.pincode || "208015"}</span></div>
    <div class="dashed-divider" style="margin-top:4px"></div>
    <div style="margin-top:3px">Total Apply Ayoush Card - ${employee.totalCards}</div>
  </div>
  <div class="dashed-border-top-bottom uppercase">Apply Ayoush Card</div>
  <div class="table-heading"><span>Card Detail - Amount</span><span>Online - Amount</span></div>
  <div class="table-row"><span>160 x ${calc.off160} = ${Number(calc.amt160).toFixed(0)}</span><span>${calc.on160} = ${Number(calc.onAmt160).toFixed(0)}</span></div>
  <div class="table-row"><span>200 x ${calc.off200} = ${Number(calc.amt200).toFixed(0)}</span><span>${calc.on200} = ${Number(calc.onAmt200).toFixed(0)}</span></div>
  <div class="table-row"><span>240 x ${calc.off240} = ${Number(calc.amt240).toFixed(0)}</span><span>${calc.on240} = ${Number(calc.onAmt240).toFixed(0)}</span></div>
  <div class="table-row"><span>280 x ${calc.off280} = ${Number(calc.amt280).toFixed(0)}</span><span>${calc.on280} = ${Number(calc.onAmt280).toFixed(0)}</span></div>
  <div class="table-row"><span>Penelty x ${calc.penaltyCount} = ${Number(calc.penaltyAmount).toFixed(0)}</span><span>${calc.onPenaltyCount} = ${Number(calc.onPenaltyAmount).toFixed(0)}</span></div>
  <div class="table-total"><span>Total = ${calc.offlineCount} = ${Number(calc.offlineTotalWithPenalty).toFixed(0)}</span><span>${calc.onlineCount} = ${Number(calc.onlineTotalWithPenalty).toFixed(0)}</span></div>
  <div class="grand-total-box">
    <div class="grand-total-title">Calculated Revenue Equation</div>
    <div class="grand-total-value">Grand Total = ${calc.offlineBaseTotal} + ${calc.onlineTotalWithPenalty} + ${calc.penaltyAmount} = <span class="grand-total-highlight">₹${calc.grandTotal}</span></div>
  </div>
  <div class="signatures"><div>Cash Receiver Name : __________________</div><div>Cash Receiver ID No :- __________________</div></div>
  <div class="sig-box-container"><div class="sig-box"><span class="sig-text">Signature</span></div></div>
</div>
</body></html>`;

    const b64 = btoa(unescape(encodeURIComponent(htmlContent)));
    const playStoreUrl = "https://play.google.com/store/apps/details?id=ru.a402d.rawbtprinter";
    const rawbtIntent = `intent:#Intent;action=ru.a402d.rawbtprinter.action.PRINT;category=android.intent.category.DEFAULT;type=text/html;S.text=${b64};S.ru.a402d.rawbtprinter.EXTRA_B64=true;S.browser_fallback_url=${encodeURIComponent(playStoreUrl)};end;`;

    const userAgent = navigator.userAgent || "";
    const isAndroid = /Android/i.test(userAgent);
    if (!isAndroid) {
      toastWarn("RawBT printing works on Android phones. Use normal Print on desktop.");
      return;
    }
    window.location.href = rawbtIntent;
  };

  // Filtered data
  const filteredEmployees = useMemo(() =>
    employees.filter(e =>
      e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
      e.id.toLowerCase().includes(empSearch.toLowerCase()) ||
      e.email.toLowerCase().includes(empSearch.toLowerCase())
    ), [employees, empSearch]);

  // Map exported cards to the dup-receipt shape for display & modal
  const mappedExportedCards = useMemo(() =>
    exportedCards.map(c => toDupCardShape(c, createdByMap)),
    [exportedCards, createdByMap]);

  // Unique employee options for filter dropdown (from API data)
  const uniqueEmployeesForFilter = useMemo(() => {
    const seen = new Map();
    mappedExportedCards.forEach(c => {
      if (c.employeeId && !seen.has(c.employeeId)) seen.set(c.employeeId, c.employeeName);
    });
    return [...seen.entries()].map(([id, name]) => ({ id, name }));
  }, [mappedExportedCards]);

  const filteredCards = useMemo(() => {
    const q = cardSearch.toLowerCase().trim();
    return mappedExportedCards.filter(c => {
      const matchSearch = !q ||
        c.id.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        c.employeeName.toLowerCase().includes(q) ||
        c.receiptNo.toLowerCase().includes(q);
      const matchEmp = !cardFilterEmployee || c.employeeId === cardFilterEmployee;
      return matchSearch && matchEmp;
    });
  }, [mappedExportedCards, cardSearch, cardFilterEmployee]);

  const filteredDups = useMemo(() => {
    return dupReceipts.filter(r => {
      const matchStatus = !dupFilterStatus || r.paymentStatus === dupFilterStatus;
      const matchMethod = !dupFilterMethod || r.paymentMethod === dupFilterMethod;
      return matchStatus && matchMethod;
    });
  }, [dupReceipts, dupFilterStatus, dupFilterMethod]);

  // Stats
  const paidCount = dupReceipts.filter(r => r.paymentStatus === "paid").length;
  const pendingCount = dupReceipts.filter(r => r.paymentStatus === "pending").length;

  const selfEmployee = useMemo(() => {
    if (userRole === "Employee" && currentUser) {
      return { id: currentUser.id, name: currentUser.name, email: currentUser.email, location: currentUser.location || "Mangla Vihar", totalCards: 67, pincode: "208015" };
    }
    return null;
  }, [userRole, currentUser]);

  const TABS = [
    { id: "employees", label: "Employee List", Icon: Users },
    { id: "exported", label: "Exported Cards", Icon: CreditCard },
    { id: "duplicates", label: "Duplicate Receipts", Icon: Receipt },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-170px)] print:h-auto" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 shrink-0 gap-3 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#22333B] tracking-tight">Ayush Vitran</h2>
          <p className="text-xs text-gray-500 mt-0.5">Receipt management, card tracking & duplicate receipt issuance</p>
        </div>
        {userRole !== "Employee" && activeTab === "employees" && (
          <button onClick={fetchEmployeesList}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
            <RefreshCw size={14} className={loading ? "animate-spin text-[#F68E5F]" : ""} />
            Sync Data
          </button>
        )}
      </div>

      {/* Tabs */}
      {userRole !== "Employee" && (
        <div className="flex items-center gap-1 mb-4 bg-gray-100 p-1 rounded-xl shrink-0 no-print w-full sm:w-fit overflow-x-auto scrollbar-none flex-nowrap">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0
                ${activeTab === id ? "bg-white text-[#22333B] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ═══ TAB 1: EMPLOYEE LIST ═══ */}
      {(userRole === "Employee" || activeTab === "employees") && userRole !== "Employee" && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0 no-print">
            <div className="relative w-full sm:w-80">
              <input type="text" placeholder="Search by name, email, or ID..." value={empSearch} onChange={e => setEmpSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-full placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#F68E5F] focus:border-[#F68E5F]" />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="text-xs text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-lg font-semibold shadow-sm flex items-center gap-1.5 w-fit">
              <Calendar size={13} className="text-[#F68E5F]" />
              {getFormattedCurrentDate()}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col flex-1 min-h-0 shadow-sm no-print">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-500">
                <div className="w-8 h-8 border-4 border-[#F68E5F] border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm font-semibold">Loading staff roster...</p>
              </div>
            ) : filteredEmployees.length > 0 ? (
              <div className="overflow-y-auto overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
                    <tr className="text-gray-500 text-[11px] font-bold uppercase tracking-wide">
                      <th className="py-3 px-5 text-center w-14">#</th>
                      <th className="py-3 px-4">Employee ID</th>
                      <th className="py-3 px-4">Ayush Mitra Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4 text-center">Date</th>
                      <th className="py-3 px-4 text-center">Total Cards</th>
                      <th className="py-3 px-5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredEmployees.map((row, i) => (
                      <tr key={row.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-3 px-5 text-center text-sm font-normal text-[#22333B]">{String(i + 1).padStart(2, "0")}</td>
                        <td className="py-3 px-4 font-mono text-sm font-normal text-[#22333B] whitespace-nowrap">{row.id}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-orange-100 text-[#F68E5F] flex items-center justify-center font-black text-xs uppercase">{row.name.charAt(0)}</div>
                            <span className="text-sm font-normal text-[#22333B]">{row.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">{row.email}</td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100 text-xs font-normal text-[#22333B]">{row.date}</span>
                        </td>
                        <td className="py-3 px-4 text-center text-sm font-normal text-[#22333B] whitespace-nowrap">{row.totalCards}</td>
                        <td className="py-3 px-5 text-center">
                          <button onClick={() => setSelectedEmployee(row)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-50 text-[#F68E5F] border border-orange-100 hover:bg-[#F68E5F] hover:text-white transition-all shadow-sm">
                            <FileText size={12} /> Settlement
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-500">
                <p className="text-base font-bold text-[#22333B]">No staff found</p>
                <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
              </div>
            )}
          </div>

          <div className="mt-4 shrink-0 no-print">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage} onItemsPerPageChange={val => { setItemsPerPage(val); setCurrentPage(1); }} totalItems={totalItems} />
          </div>
        </>
      )}

      {/* Employee self-view */}
      {userRole === "Employee" && selfEmployee && (
        <div className="flex-1 overflow-y-auto no-print flex items-start justify-center py-4">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm max-w-md w-full flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-[#F68E5F] flex items-center justify-center font-black text-lg mb-2">{selfEmployee.name.charAt(0)}</div>
            <h3 className="text-base font-black text-[#22333B]">{selfEmployee.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{selfEmployee.id} · {selfEmployee.email}</p>
            <div className="w-full border-t border-gray-100 my-5"></div>
            <SettlementSlipPreview employee={selfEmployee} date={getFormattedCurrentDate()} />
            <div className="w-full border-t border-gray-100 my-5"></div>
            <div className="w-full flex gap-3 mt-3">
              <button onClick={() => handlePrintSlip(selfEmployee)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#22333B] text-white font-black text-xs rounded-xl hover:bg-[#1a2830] transition-all shadow-sm">
                <Printer size={15} /> Print Slip
              </button>
              <button onClick={() => handleRawBtPrintSlip(selfEmployee)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#F68E5F] text-white font-black text-xs rounded-xl hover:bg-[#ff7637] transition-all shadow-sm">
                RawBT Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB 2: EXPORTED CARDS ═══ */}
      {activeTab === "exported" && userRole !== "Employee" && (
        <div className="flex flex-col flex-1 min-h-0 no-print">
          {/* Stat tiles */}
          <div className="flex overflow-x-auto scrollbar-none flex-nowrap sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 pb-1 shrink-0 w-full">
            <StatTile icon={CreditCard} label="Total Exported" value={exportedTotalItems || exportedCards.length} color="bg-blue-100 text-blue-600" bg="bg-blue-50 border-blue-100" />
            <StatTile icon={Receipt} label="Dup. Receipts Issued" value={dupReceipts.length} color="bg-orange-100 text-[#F68E5F]" bg="bg-orange-50 border-orange-100" />
            <StatTile icon={Check} label="Payments Collected" value={`₹${paidCount * PENALTY_AMOUNT}`} color="bg-green-100 text-green-600" bg="bg-green-50 border-green-100" />
            <StatTile icon={Clock} label="Pending Payments" value={pendingCount} color="bg-amber-100 text-amber-600" bg="bg-amber-50 border-amber-100" />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4 shrink-0">
            <div className="relative w-full sm:flex-1 sm:min-w-[180px]">
              <input type="text" placeholder="Search by card no., name, mobile, employee..."
                value={cardSearch} onChange={e => setCardSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#F68E5F] focus:border-[#F68E5F]" />
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select value={cardFilterEmployee} onChange={e => setCardFilterEmployee(e.target.value)}
                className="flex-1 sm:flex-initial text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#F68E5F] text-gray-600 bg-white">
                <option value="">All Employees</option>
                {uniqueEmployeesForFilter.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
              <button onClick={fetchExportedCards} disabled={exportedLoading}
                className="shrink-0 flex items-center gap-1 text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                <RefreshCw size={12} className={exportedLoading ? "animate-spin text-[#F68E5F]" : ""} /> Refresh
              </button>
              {(cardSearch || cardFilterEmployee) && (
                <button onClick={() => { setCardSearch(""); setCardFilterEmployee(""); }}
                  className="shrink-0 text-xs text-gray-400 hover:text-gray-600 px-2 py-2 border border-gray-200 rounded-xl bg-white flex items-center gap-1">
                  <X size={12} /> Clear
                </button>
              )}
            </div>
            <span className="text-xs text-gray-400 font-semibold sm:ml-auto w-full sm:w-auto text-right">{exportedTotalItems > 0 ? `${exportedTotalItems} total` : `${filteredCards.length} cards`}</span>
          </div>

          {/* Exported Cards Table */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col flex-1 min-h-0 shadow-sm" style={{ minHeight: 0 }}>
            {exportedLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-gray-400">
                <Loader2 size={28} className="animate-spin text-[#F68E5F] mb-3" />
                <p className="text-sm font-semibold">Loading exported cards...</p>
              </div>
            ) : (
            <div className="overflow-y-auto overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
                  <tr className="text-gray-500 text-[11px] font-bold uppercase tracking-wide">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Card ID</th>
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Mobile</th>
                    <th className="py-3 px-4">Ayush Mitra</th>
                    <th className="py-3 px-4 text-center">Amount</th>
                    <th className="py-3 px-4 text-center">Export Date</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCards.map((card, i) => (
                    <tr key={card.id || i} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B]">{i + 1}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">{card.id}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">{card.clientName}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">{card.mobile}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">{card.employeeName || "—"}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] text-right whitespace-nowrap">₹{Number(card.amount || 0).toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">{card.exportDate}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedCardForDup(card)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                        >
                          <Copy size={11} /> Duplicate
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredCards.length === 0 && !exportedLoading && (
                    <tr><td colSpan={8} className="py-16 text-center text-gray-400 text-sm font-medium">No exported cards found. Cards appear here once they are printed/exported.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            )}
          </div>

          {/* Pagination for exported cards */}
          {exportedTotalPages > 1 && (
            <div className="mt-3 shrink-0">
              <Pagination
                currentPage={exportedPage}
                totalPages={exportedTotalPages}
                onPageChange={setExportedPage}
                itemsPerPage={exportedItemsPerPage}
                onItemsPerPageChange={() => {}}
                totalItems={exportedTotalItems}
                pageSizeOptions={[25, 50, 100]}
              />
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB 3: DUPLICATE RECEIPTS ═══ */}
      {activeTab === "duplicates" && userRole !== "Employee" && (
        <div className="flex flex-col flex-1 min-h-0 no-print">
          {/* Mini stats */}
          <div className="flex overflow-x-auto scrollbar-none flex-nowrap sm:grid sm:grid-cols-3 gap-3 mb-4 pb-1 shrink-0 w-full">
            <StatTile icon={ClipboardList} label="Total Issued" value={dupReceipts.length} color="bg-purple-100 text-purple-600" bg="bg-purple-50 border-purple-100" />
            <StatTile icon={Check} label="Paid" value={paidCount} color="bg-green-100 text-green-600" bg="bg-green-50 border-green-100" />
            <StatTile icon={Clock} label="Pending" value={pendingCount} color="bg-amber-100 text-amber-600" bg="bg-amber-50 border-amber-100" />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4 shrink-0">
            <select value={dupFilterStatus} onChange={e => setDupFilterStatus(e.target.value)}
              className="flex-1 sm:flex-initial text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#F68E5F] text-gray-600 bg-white">
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
            <select value={dupFilterMethod} onChange={e => setDupFilterMethod(e.target.value)}
              className="flex-1 sm:flex-initial text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#F68E5F] text-gray-600 bg-white">
              <option value="">All Methods</option>
              <option value="online">Online</option>
              <option value="offline">Offline (Cash)</option>
            </select>
            {(dupFilterStatus || dupFilterMethod) && (
              <button onClick={() => { setDupFilterStatus(""); setDupFilterMethod(""); }}
                className="shrink-0 text-xs text-gray-400 hover:text-gray-600 px-2 py-2 border border-gray-200 rounded-xl bg-white flex items-center gap-1">
                <X size={12} /> Clear
              </button>
            )}
          </div>

          {/* Duplicate Receipts Table */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col flex-1 min-h-0 shadow-sm">
            {filteredDups.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-gray-400">
                <Receipt size={32} className="text-gray-200 mb-3" />
                <p className="text-sm font-bold text-gray-500">No duplicate receipts yet</p>
                <p className="text-xs text-gray-400 mt-1">Go to "Exported Cards" tab and click "Duplicate" to issue one</p>
              </div>
            ) : (
              <div className="overflow-y-auto overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
                    <tr className="text-gray-500 text-[11px] font-bold uppercase tracking-wide">
                      <th className="py-3 px-4">Receipt No.</th>
                      <th className="py-3 px-4">Card ID</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Ayush Mitra</th>
                      <th className="py-3 px-4 text-center">Penalty</th>
                      <th className="py-3 px-4 text-center">Method</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Date</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredDups.map((rec) => (
                      <tr key={rec.receiptNo} className="border-b border-gray-50 hover:bg-purple-50/20 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs font-bold text-purple-600">{rec.receiptNo}</td>
                        <td className="py-3 px-4 font-mono text-xs text-gray-500">{rec.cardId}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-[#22333B] text-sm">{rec.clientName}</p>
                          <p className="text-[10px] text-gray-400">Orig: {rec.originalReceiptNo}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-xs font-bold text-[#22333B]">{rec.employeeName}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{rec.employeeId}</p>
                        </td>
                        <td className="py-3 px-4 text-center font-black text-sm text-[#22333B]">₹{rec.penaltyAmount}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border
                            ${rec.paymentMethod === "online" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-gray-50 text-gray-600 border-gray-100"}`}>
                            {rec.paymentMethod === "online" ? <><Wifi size={9} /> Online</> : <><Banknote size={9} /> Cash</>}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border
                            ${rec.paymentStatus === "paid" ? "bg-green-50 text-green-600 border-green-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}>
                            {rec.paymentStatus === "paid" ? <><Check size={9} /> Paid</> : <><Clock size={9} /> Pending</>}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-[10px] text-gray-400 font-medium">{rec.issuedAt}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button onClick={() => setViewingReceipt(rec)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-purple-50 text-purple-600 border border-purple-100 hover:bg-purple-500 hover:text-white transition-all shadow-sm">
                            <Eye size={11} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ SETTLEMENT MODAL (Tab 1) ═══ */}
      {selectedEmployee && userRole !== "Employee" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl w-full max-w-md flex flex-col h-[92vh] shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50 rounded-t-2xl shrink-0">
              <div>
                <h3 className="text-xs font-black uppercase text-gray-700 tracking-wider">Settlement Receipt</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">80mm Thermal · {selectedEmployee.name}</p>
              </div>
              <button onClick={() => setSelectedEmployee(null)} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-100/50 p-6 flex items-start justify-center">
              <SettlementSlipPreview employee={selectedEmployee} date={getFormattedCurrentDate()} />
            </div>
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex flex-col sm:flex-row items-center gap-2 shrink-0 w-full">
              <button onClick={() => setSelectedEmployee(null)} className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors text-center whitespace-nowrap">Close</button>
              <div className="flex flex-1 gap-2 w-full">
                <button onClick={() => handlePrintSlip(selectedEmployee)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#22333B] text-white text-xs font-black rounded-lg hover:bg-[#1a2830] transition-all shadow-sm whitespace-nowrap">
                  <Printer size={14} /> Print
                </button>
                <button onClick={() => handleRawBtPrintSlip(selectedEmployee)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#F68E5F] text-white text-xs font-black rounded-lg hover:bg-[#ff7637] transition-all shadow-sm whitespace-nowrap">
                  RawBT Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DUPLICATE RECEIPT WIZARD MODAL ═══ */}
      {selectedCardForDup && (
        <DuplicateReceiptModal
          card={selectedCardForDup}
          onClose={() => setSelectedCardForDup(null)}
          onIssued={(record) => {
            saveDupReceipt(record);
            setSelectedCardForDup(null);
          }}
        />
      )}

      {/* ═══ VIEW PENALTY RECEIPT MODAL ═══ */}
      {viewingReceipt && (
        <ViewPenaltyModal record={viewingReceipt} onClose={() => setViewingReceipt(null)} />
      )}
    </div>
  );
};

export default AyushVitran;
