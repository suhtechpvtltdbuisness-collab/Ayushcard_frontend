/**
 * Try Aadhaar QR first (fast path) — skips PaddleOCR when QR decodes cleanly.
 */

function parsePrintLetterBarcodeXml(xml) {
  const attrs = {};
  const re = /(\w+)="([^"]*)"/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    attrs[m[1].toLowerCase()] = m[2];
  }
  return attrs;
}

function normalizeGenderFromQr(g) {
  const t = String(g || "").trim().toUpperCase();
  if (t === "M" || t === "MALE") return "Male";
  if (t === "F" || t === "FEMALE") return "Female";
  if (t === "T" || t === "TRANSGENDER") return "Other";
  return "";
}

function dobFromQr(attrs) {
  if (attrs.dob) {
    const parts = attrs.dob.split("-");
    if (parts.length === 3) {
      const [dd, mm, yyyy] = parts;
      if (yyyy?.length === 4) return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    }
  }
  if (attrs.yob && /^\d{4}$/.test(attrs.yob)) return `${attrs.yob}-01-01`;
  return "";
}

/**
 * @param {string} raw QR payload (often XML)
 * @returns {{ fullName: string, dob: string, gender: string, aadhaarNumber: string } | null}
 */
export function parseAadhaarQrPayload(raw) {
  const text = String(raw || "").trim();
  if (!text) return null;

  const attrs = text.includes("<")
    ? parsePrintLetterBarcodeXml(text)
    : {};

  const uid = (attrs.uid || "").replace(/\D/g, "");
  const aadhaarNumber = uid.length === 12 ? uid : "";
  const fullName = attrs.name ? String(attrs.name).trim() : "";
  const gender = normalizeGenderFromQr(attrs.gender);
  const dob = dobFromQr(attrs);

  if (!aadhaarNumber || !fullName) return null;
  return { fullName, dob, gender, aadhaarNumber };
}

/**
 * @param {HTMLCanvasElement|ImageBitmap} imageSource
 * @returns {Promise<ReturnType<parseAadhaarQrPayload>>}
 */
export async function tryDecodeAadhaarQr(imageSource) {
  if (typeof BarcodeDetector === "undefined") return null;

  try {
    const detector = new BarcodeDetector({ formats: ["qr_code"] });
    const codes = await detector.detect(imageSource);
    for (const code of codes) {
      const parsed = parseAadhaarQrPayload(code.rawValue);
      if (parsed) return parsed;
    }
  } catch (err) {
    console.warn("QR scan skipped:", err?.message || err);
  }
  return null;
}
