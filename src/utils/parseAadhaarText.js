/**
 * Front-side Aadhaar field parsing — reuses validated logic from ocr.js.
 */
import {
  parseAadhaarFrontFields,
  finalizeFrontOcrResult,
  isValidAadhaarName,
} from "./ocr.js";

export { parseAadhaarFrontFields, finalizeFrontOcrResult, isValidAadhaarName };

/**
 * Build the same result shape as performOCR() for form autofill.
 * @param {string} rawText
 * @param {{ ocrConfidence?: number }} [meta]
 */
export function parseAadhaarFrontFromText(rawText, meta = {}) {
  const parsed = parseAadhaarFrontFields(rawText);
  if (meta.ocrConfidence != null) {
    parsed.ocrConfidence = meta.ocrConfidence;
  }
  return finalizeFrontOcrResult(parsed, rawText);
}

/**
 * Map OCR / QR pipeline output to familyHead field keys.
 */
export function mapOcrResultToFamilyHeadFields(result) {
  if (!result) return {};
  return {
    fullName: result.name || "",
    dob: result.dob || "",
    gender: result.gender || "",
    aadhaarNumber: (result.docNumber || "").replace(/\D/g, "").slice(0, 12),
  };
}
