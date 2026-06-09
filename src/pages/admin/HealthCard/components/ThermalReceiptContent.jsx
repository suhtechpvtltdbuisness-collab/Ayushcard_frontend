import QRCode from "react-qr-code";
import {
  AYUSH_CARD_BASE_PACKAGE_RUPEES,
  AYUSH_CARD_EXTRA_MEMBER_RUPEES,
} from "../../../../components/ayush/ayushCard/constants.js";
import { thermalMemberDocId, thermalMemberLabel } from "../../../../components/ayush/ayushCard/utils.js";

/** Same layout as post-create ThermalReceipt — used in Vitran preview & print */
export default function ThermalReceiptContent({
  displayAppId,
  cardNo = "",
  displayName,
  displayPhone,
  displayAadhaarRaw,
  displayAddress,
  displayPin,
  listMembers = [],
  extraMembersBeyondIncluded = 0,
  receiptTotal,
  receiptDate,
  paymentLabel,
  paymentRef,
  createdByLabel = "",
  campName = "",
  contentId,
}) {
  const addressLine = displayAddress
    ? `${displayAddress.slice(0, 80)}${displayAddress.length > 80 ? "…" : ""}`
    : "—";

  return (
    <div
      id={contentId}
      className="public-thermal-receipt w-[2in] min-w-[2in] max-w-[2in] box-border bg-white p-2 font-sans text-black leading-tight"
    >
      <div className="text-center border-b border-dashed border-black pb-2 mb-2">
        <img
          src="/logo1.svg"
          alt="logo"
          className="w-10 h-10 mx-auto mb-2 object-contain"
          style={{ display: "block", margin: "0 auto 8px", width: "40px", height: "40px" }}
        />
        <h1 className="font-black text-[12px] uppercase tracking-tight leading-none">BKBS</h1>
        <p className="text-[7px] font-semibold mt-1 uppercase tracking-wide">Ayush Card · Receipt</p>
      </div>

      <div className="text-[8px] space-y-0.5 mb-2 border-b border-dashed border-gray-400 pb-2">
        <Row label="App ID" value={displayAppId} mono />
        {cardNo ? <Row label="Card No" value={cardNo} mono tiny /> : null}
        <Row
          label="Date"
          value={receiptDate.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        />
        <Row
          label="Time"
          value={receiptDate.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        />
        {campName ? <Row label="Camp" value={campName} wrap /> : null}
        {createdByLabel && createdByLabel !== "—" ? (
          <Row label="Created By" value={createdByLabel} wrap />
        ) : null}
      </div>

      <div className="text-[8px] mb-2 border-b border-dashed border-gray-400 pb-2">
        <p className="font-bold uppercase mb-1">Family head</p>
        <p className="font-bold text-[6px] uppercase break-words">{displayName}</p>
        <p className="mt-0.5">Ph: {displayPhone || "—"}</p>
        <p className="break-all">
          Aadhaar:{" "}
          {displayAadhaarRaw.length >= 4 ? `****${displayAadhaarRaw.slice(-4)}` : "—"}
        </p>
        <p className="break-words mt-0.5">{addressLine}</p>
        <p>Pin: {displayPin || "—"}</p>
      </div>

      <div className="text-[8px] mb-2 border-b border-dashed border-gray-400 pb-2">
        <p className="font-bold uppercase mb-1">Members ({listMembers.length})</p>
        {listMembers.length === 0 ? (
          <p className="text-gray-600">None</p>
        ) : (
          <ul className="space-y-1 list-none p-0 m-0">
            {listMembers.map((m, idx) => (
              <li key={idx} className="border-b border-dotted border-gray-300 pb-1 last:border-0">
                <span className="font-bold">{idx + 1}.</span>{" "}
                <span className="font-semibold uppercase">{thermalMemberLabel(m)}</span>
                <br />
                <span className="text-[7px]">
                  {m.relation || "—"} · Age {m.age ?? "—"}
                </span>
                <br />
                <span className="font-mono text-[7px] break-all">
                  Doc:{" "}
                  {thermalMemberDocId(m).length >= 4
                    ? `****${thermalMemberDocId(m).slice(-4)}`
                    : "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="text-[8px] space-y-0.5 mb-2">
        {extraMembersBeyondIncluded === 0 ? (
          <div className="flex justify-between">
            <span>Up to 4 members</span>
            <span className="font-semibold">₹{AYUSH_CARD_BASE_PACKAGE_RUPEES}.00</span>
          </div>
        ) : (
          <>
            <div className="flex justify-between">
              <span>Base (up to 4)</span>
              <span>₹{AYUSH_CARD_BASE_PACKAGE_RUPEES}.00</span>
            </div>
            <div className="flex justify-between">
              <span>
                Extra {extraMembersBeyondIncluded}×₹{AYUSH_CARD_EXTRA_MEMBER_RUPEES}
              </span>
              <span>₹{extraMembersBeyondIncluded * AYUSH_CARD_EXTRA_MEMBER_RUPEES}.00</span>
            </div>
          </>
        )}
        <div className="flex justify-between font-black text-[6px] border-t-2 border-black pt-1 mt-1">
          <span>TOTAL</span>
          <span>₹{Number(receiptTotal)}.00</span>
        </div>
      </div>

      <div className="text-[7px] font-semibold space-y-0.5 border-t border-dashed border-gray-400 pt-2 uppercase">
        <p>Pay: {paymentLabel}</p>
        <p className="break-all normal-case">Ref: {paymentRef}</p>
        <p className="text-center mt-2 font-black normal-case tracking-wide border border-black py-0.5">
          Submitted
        </p>
      </div>

      <div className="flex justify-center py-2 border-t border-dashed border-gray-400">
        <div className="bg-white p-1">
          <QRCode value={String(displayAppId)} size={64} level="M" />
        </div>
      </div>

      <div className="text-[7px] mt-3 pt-2 border-t border-dashed border-gray-400 space-y-1">
        <p className="font-bold text-center text-[6px] mb-1">महत्वपूर्ण सूचना</p>
        <p className="text-[6px] leading-tight">
          1- रसीद सुरक्षित रखें; बिना रसीद आयुष कार्ड नहीं दिया जाएगा।
        </p>
        <p className="text-[6px] leading-tight">
          2- रसीद गुम होने पर ₹50 शुल्क (पेनल्टी) देकर ही कार्ड जारी होगा।
        </p>
        <p className="text-[6px] leading-tight">
          3- शुल्क (पेनल्टी) देने के साथ कार्ड केवल मुखिया/नामित सदस्य को, आधार सत्यापन के बाद मिलेगा।
        </p>
        <p className="text-[6px] leading-tight">
          4- संस्था को दिए गए नंबर पर किसी भी कारण संपर्क न होने पर आप स्वयं जिम्मेदार होंगे.
        </p>
        <p className="text-[6px] leading-tight">5- किसी भी विवाद में अंतिम निर्णय संस्था का होगा।</p>
        <p className="text-[6px] leading-tight">6- फोन नंबर: 8303902030</p>
      </div>

      <div className="flex justify-center pt-2 pb-1">
        <div
          className="w-full border border-black rounded-md h-10 flex items-center justify-center"
          style={{ minHeight: 34 }}
        >
          <span className="text-[9px] font-semibold text-gray-400">Signature</span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono = false, tiny = false, wrap = false }) {
  return (
    <div
      className={`flex justify-between gap-1${tiny ? " border-t border-dotted border-gray-300 pt-0.5 mt-0.5" : ""}`}
    >
      <span className="font-bold shrink-0">{label}</span>
      <span
        className={`text-right ${mono ? "font-mono break-all" : ""} ${wrap ? "break-words" : ""} ${tiny ? "text-[7px]" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
