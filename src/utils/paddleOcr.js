/**
 * Fast front-side Aadhaar scan: singleton Paddle, image prep, QR-first, result cache.
 */
import { optimizeImageForOcr } from "./imageOptimizer.js";
import { enhanceImageBlobForOcr } from "./aadhaarOcrImage.js";
import { tryDecodeAadhaarQr } from "./aadhaarQrDecode.js";
import {
  parseAadhaarFrontFromText,
  mapOcrResultToFamilyHeadFields,
} from "./parseAadhaarText.js";
import { buildBackOcrResult } from "./parseAadhaarBackText.js";
import {
  getPaddleOcr,
  recognizeAadhaarImage,
  preloadAadhaarOcrWorker,
} from "./paddleOcrEngine.js";
import {
  parseAadhaarFrontFields,
  finalizeFrontOcrResult,
  validateAadhaarFrontResults,
} from "./ocr.js";

/** @typedef {{ percent: number, label: string }} OcrProgressUpdate */

export const OCR_PROGRESS_LABELS = {
  PREPARING: "Preparing image…",
  LOADING_MODEL: "Loading OCR model…",
  QR_SCAN: "Scanning QR code…",
  EXTRACTING: "Extracting text…",
  PARSING: "Parsing details…",
  DONE: "Done",
};

const resultCache = new Map();
const backResultCache = new Map();
const MAX_CACHE_ENTRIES = 12;

/** @type {((update: OcrProgressUpdate) => void) | null} */
let lastProgressSink = null;

function reportProgress(onProgress, percent, label) {
  const pct = Math.min(100, Math.max(0, Math.round(percent)));
  const update = { percent: pct, label };
  lastProgressSink = onProgress;
  if (typeof onProgress === "function") {
    if (onProgress.length >= 2) {
      onProgress(pct, label);
    } else {
      onProgress(pct);
    }
  }
  return update;
}

async function blobFingerprint(blob) {
  const slice = await blob.slice(0, Math.min(blob.size, 65536)).arrayBuffer();
  const bytes = new Uint8Array(slice);
  let hash = blob.size ^ blob.type.length;
  for (let i = 0; i < bytes.length; i += 64) {
    hash = (hash * 31 + bytes[i]) | 0;
  }
  return `${blob.size}:${blob.type}:${hash}`;
}

function cacheGet(key) {
  const hit = resultCache.get(key);
  if (!hit) return null;
  resultCache.delete(key);
  resultCache.set(key, hit);
  return hit;
}

function cacheSet(key, value) {
  if (resultCache.size >= MAX_CACHE_ENTRIES) {
    const oldest = resultCache.keys().next().value;
    resultCache.delete(oldest);
  }
  resultCache.set(key, value);
}

/**
 * Warm up Paddle models when Step 1 opens (non-blocking).
 */
export function preloadPaddleOcr() {
  return preloadAadhaarOcrWorker();
}

function qrFieldsToOcrResult(qrFields) {
  const parsed = {
    type: "aadhaar",
    name: qrFields.fullName,
    dob: qrFields.dob,
    gender: qrFields.gender,
    docNumber: qrFields.aadhaarNumber,
    ocrConfidence: 99,
    source: "qr",
  };
  const rawText = [
    qrFields.fullName,
    qrFields.dob,
    qrFields.gender,
    qrFields.aadhaarNumber,
  ].join("\n");
  return finalizeFrontOcrResult(parsed, rawText);
}

/**
 * Single fast Paddle pass on a prepared canvas/blob.
 */
async function runFastPaddleOcr(imageInput, onProgress, paddleOpts = {}) {
  reportProgress(onProgress, 48, OCR_PROGRESS_LABELS.LOADING_MODEL);
  await getPaddleOcr();
  reportProgress(onProgress, 55, OCR_PROGRESS_LABELS.EXTRACTING);

  const { text, confidence } = await recognizeAadhaarImage(imageInput, {
    minWordConfidence: paddleOpts.minWordConfidence ?? 45,
    detLimitSideLen: paddleOpts.detLimitSideLen ?? 960,
    region: false,
    onProgress: (inner) => {
      reportProgress(
        onProgress,
        55 + Math.floor(inner * 0.3),
        OCR_PROGRESS_LABELS.EXTRACTING,
      );
    },
  });

  reportProgress(onProgress, 88, OCR_PROGRESS_LABELS.PARSING);
  const parsed = parseAadhaarFrontFields(text);
  parsed.ocrConfidence = confidence;
  return finalizeFrontOcrResult(parsed, text);
}

/**
 * @param {Blob|File|HTMLCanvasElement|string} imageInput
 * @param {object} [options]
 * @param {(percent: number, label?: string) => void} [options.onProgress]
 * @param {boolean} [options.preprocessed] — skip resize when already optimized
 * @param {boolean} [options.cropToScanFrame] — center crop (camera capture)
 * @param {boolean} [options.skipCache]
 * @returns {Promise<ReturnType<finalizeFrontOcrResult>>}
 */
export async function scanAadhaarFrontDocument(imageInput, options = {}) {
  const onProgress = options.onProgress || (() => {});
  reportProgress(onProgress, 2, OCR_PROGRESS_LABELS.PREPARING);

  let ocrSource = imageInput;
  let cacheBlob = null;

  if (!options.preprocessed) {
    try {
      const optimized = await optimizeImageForOcr(imageInput, {
        maxWidth: options.maxWidth ?? 1200,
        maxHeight: options.maxHeight ?? 1200,
        quality: options.quality ?? 0.82,
        cropToScanFrame: Boolean(options.cropToScanFrame),
      });
      ocrSource = optimized.canvas;
      cacheBlob = optimized.blob;
      reportProgress(onProgress, 12, OCR_PROGRESS_LABELS.PREPARING);
    } catch (prepErr) {
      console.warn("Image optimization failed, using original:", prepErr);
      if (imageInput instanceof Blob) {
        cacheBlob = imageInput;
      }
    }
  } else if (imageInput instanceof Blob) {
    cacheBlob = imageInput;
  }

  const cacheKey =
    !options.skipCache && cacheBlob
      ? await blobFingerprint(cacheBlob)
      : null;

  if (cacheKey) {
    const cached = cacheGet(cacheKey);
    if (cached) {
      reportProgress(onProgress, 100, OCR_PROGRESS_LABELS.DONE);
      return cached;
    }
  }

  // QR-first (fast, no model load when QR succeeds)
  reportProgress(onProgress, 22, OCR_PROGRESS_LABELS.QR_SCAN);
  const qrSource =
    ocrSource instanceof HTMLCanvasElement ? ocrSource : cacheBlob || imageInput;
  try {
    const qrFields = await tryDecodeAadhaarQr(qrSource);
    if (qrFields) {
      const qrResult = qrFieldsToOcrResult(qrFields);
      const validation = validateAadhaarFrontResults(qrResult);
      if (validation.canAutofill) {
        reportProgress(onProgress, 100, OCR_PROGRESS_LABELS.DONE);
        if (cacheKey) cacheSet(cacheKey, qrResult);
        return qrResult;
      }
    }
  } catch (qrErr) {
    console.warn("QR decode skipped:", qrErr?.message || qrErr);
  }

  const ocrResult = await runFastPaddleOcr(ocrSource, onProgress);
  reportProgress(onProgress, 100, OCR_PROGRESS_LABELS.DONE);

  if (cacheKey) cacheSet(cacheKey, ocrResult);
  return ocrResult;
}

/**
 * Sharpened single-pass OCR for blurry or low-confidence scans (before slow region fallback).
 */
export async function scanAadhaarFrontDocumentEnhanced(imageInput, options = {}) {
  const onProgress = options.onProgress || (() => {});
  reportProgress(onProgress, 8, "Enhancing image…");
  const enhanced = await enhanceImageBlobForOcr(imageInput);
  reportProgress(onProgress, 18, OCR_PROGRESS_LABELS.PREPARING);
  return runFastPaddleOcr(enhanced, onProgress, { minWordConfidence: 38, detLimitSideLen: 1280 });
}

export { mapOcrResultToFamilyHeadFields, parseAadhaarFrontFromText };

function backCacheGet(key) {
  const hit = backResultCache.get(key);
  if (!hit) return null;
  backResultCache.delete(key);
  backResultCache.set(key, hit);
  return hit;
}

function backCacheSet(key, value) {
  if (backResultCache.size >= MAX_CACHE_ENTRIES) {
    const oldest = backResultCache.keys().next().value;
    backResultCache.delete(oldest);
  }
  backResultCache.set(key, value);
}

function backOcrIsGoodEnough(result) {
  if (!result?.canAutofill) return false;
  const addr = String(result.address || "").trim();
  const pin = String(result.pincode || "").trim();
  return (pin.length === 6 && addr.length >= 8) || addr.length >= 12;
}

async function runFastBackPaddleOcr(imageInput, onProgress, paddleOpts = {}) {
  reportProgress(onProgress, 48, OCR_PROGRESS_LABELS.LOADING_MODEL);
  await getPaddleOcr();
  reportProgress(onProgress, 55, OCR_PROGRESS_LABELS.EXTRACTING);

  const ocr = await recognizeAadhaarImage(imageInput, {
    minWordConfidence: paddleOpts.minWordConfidence ?? 40,
    detLimitSideLen: paddleOpts.detLimitSideLen ?? 1280,
    region: false,
    onProgress: (inner) => {
      reportProgress(
        onProgress,
        55 + Math.floor(inner * 0.32),
        OCR_PROGRESS_LABELS.EXTRACTING,
      );
    },
  });

  reportProgress(onProgress, 90, OCR_PROGRESS_LABELS.PARSING);
  return buildBackOcrResult(ocr);
}

/** Sharpened single-pass back OCR before slow region fallback. */
export async function scanAadhaarBackDocumentEnhanced(imageInput, options = {}) {
  const onProgress = options.onProgress || (() => {});
  reportProgress(onProgress, 8, "Enhancing image…");
  const enhanced = await enhanceImageBlobForOcr(imageInput);
  reportProgress(onProgress, 18, OCR_PROGRESS_LABELS.PREPARING);
  return runFastBackPaddleOcr(enhanced, onProgress, { minWordConfidence: 34, detLimitSideLen: 1280 });
}

/**
 * Fast Aadhaar back scan — optimized image + full-page OCR + line-aware parsing.
 */
export async function scanAadhaarBackDocument(imageInput, options = {}) {
  const onProgress = options.onProgress || (() => {});
  reportProgress(onProgress, 2, OCR_PROGRESS_LABELS.PREPARING);

  let ocrSource = imageInput;
  let cacheBlob = null;

  if (!options.preprocessed) {
    try {
      const optimized = await optimizeImageForOcr(imageInput, {
        maxWidth: options.maxWidth ?? 1400,
        maxHeight: options.maxHeight ?? 1400,
        quality: options.quality ?? 0.85,
        cropToScanFrame: Boolean(options.cropToScanFrame),
      });
      ocrSource = optimized.canvas;
      cacheBlob = optimized.blob;
      reportProgress(onProgress, 12, OCR_PROGRESS_LABELS.PREPARING);
    } catch (prepErr) {
      console.warn("Back image optimization failed:", prepErr);
      if (imageInput instanceof Blob) cacheBlob = imageInput;
    }
  } else if (imageInput instanceof Blob) {
    cacheBlob = imageInput;
  }

  const cacheKey =
    !options.skipCache && cacheBlob
      ? `back:${await blobFingerprint(cacheBlob)}`
      : null;

  if (cacheKey) {
    const cached = backCacheGet(cacheKey);
    if (cached) {
      reportProgress(onProgress, 100, OCR_PROGRESS_LABELS.DONE);
      return cached;
    }
  }

  const result = await runFastBackPaddleOcr(ocrSource, onProgress);

  reportProgress(onProgress, 100, OCR_PROGRESS_LABELS.DONE);
  if (cacheKey) backCacheSet(cacheKey, result);
  return result;
}

export function clearAadhaarOcrCache() {
  resultCache.clear();
  backResultCache.clear();
}
