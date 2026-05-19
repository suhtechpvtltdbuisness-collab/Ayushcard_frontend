/**
 * Back-side Aadhaar address + PIN parsing from OCR text/lines.
 */
import {
  extractAadhaarBackFields,
  extractAadhaarBackFromOcrLines,
  finalizeBackOcrResult,
} from "./ocr.js";

export { extractAadhaarBackFields, finalizeBackOcrResult };

/**
 * @param {{ text?: string, lines?: Array<{ text: string }>, confidence?: number }} ocr
 */
export function buildBackOcrResult(ocr = {}) {
  const text = String(ocr.text || "").trim();
  const lines = Array.isArray(ocr.lines) ? ocr.lines : [];

  const fromText = extractAadhaarBackFields(text);
  const fromLines = lines.length ? extractAadhaarBackFromOcrLines(lines) : { address: "", pincode: "" };

  const pincode = fromLines.pincode || fromText.pincode || "";
  let address = fromLines.address || fromText.address || "";
  if (fromLines.address && fromText.address) {
    address =
      fromLines.address.length >= fromText.address.length
        ? fromLines.address
        : fromText.address;
  }

  return finalizeBackOcrResult({
    address,
    pincode,
    ocrConfidence: ocr.confidence ?? 0,
  });
}
