import { optimizeImageForOcr } from "./imageOptimizer.js";

export const OCR_MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const ACCEPTED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export class OcrImageError extends Error {
  constructor(message, code = "invalid", cause = null) {
    super(message);
    this.name = "OcrImageError";
    this.code = code;
    this.cause = cause;
  }
}

function isAcceptedGalleryFile(file) {
  if (!(file instanceof Blob) || !file.size) return false;
  const type = String(file.type || "").toLowerCase();
  if (type && ACCEPTED_MIME.has(type)) return true;
  const name = String(file.name || "").toLowerCase();
  return /\.(jpe?g|png|webp|heic|heif)$/i.test(name);
}

/**
 * Normalize camera/gallery input to a JPEG File + preview data URL for OCR upload.
 * Same pipeline for gallery File and camera Blob.
 */
export async function prepareOcrUploadFile(
  input,
  { filename = "aadhaar_ocr.jpg", maxWidth = 1400, maxHeight = 1400, quality = 0.85 } = {},
) {
  if (!(input instanceof Blob) || !input.size) {
    throw new OcrImageError(
      "Image file is empty. Choose another photo.",
      "empty",
    );
  }

  if (input.size > OCR_MAX_UPLOAD_BYTES) {
    throw new OcrImageError(
      "Image is too large. Please use a file under 5MB.",
      "too_large",
    );
  }

  if (input instanceof File && !isAcceptedGalleryFile(input)) {
    throw new OcrImageError(
      "Invalid image format. Use JPG, PNG, or WEBP.",
      "invalid_format",
    );
  }

  let optimized;
  try {
    optimized = await optimizeImageForOcr(input, {
      maxWidth,
      maxHeight,
      quality,
    });
  } catch (err) {
    throw new OcrImageError(
      "Invalid image format or could not read file. Use JPG/PNG or try another photo.",
      "invalid_format",
      err,
    );
  }

  if (!optimized?.blob?.size) {
    throw new OcrImageError(
      "Failed to process image for OCR. Try another photo.",
      "encode_failed",
    );
  }

  const safeName = filename.replace(/\.[^.]+$/, "") + ".jpg";
  const file = new File([optimized.blob], safeName, { type: "image/jpeg" });

  return {
    file,
    blob: optimized.blob,
    dataUrl: optimized.dataUrl,
    width: optimized.width,
    height: optimized.height,
  };
}
