const ORT_WASM_BASE =
  "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";

/** @type {import("@paddleocr/paddleocr-js").PaddleOCR | null} */
let ocrInstance = null;
let initPromise = null;

function baseCreateOptions(lang) {
  return {
    lang,
    ocrVersion: "PP-OCRv5",
    worker: false,
    textRecScoreThresh: 0.4,
    textDetBoxThresh: 0.45,
    textDetUnclipRatio: 1.6,
    ortOptions: {
      backend: "wasm",
      wasmPaths: ORT_WASM_BASE,
      numThreads: 1,
      simd: false,
    },
  };
}

/**
 * Lazy-load PaddleOCR (separate chunk). Main-thread only — reliable in Vite, smaller/faster builds.
 */
export async function getPaddleOcr() {
  if (ocrInstance) return ocrInstance;
  if (!initPromise) {
    initPromise = (async () => {
      const { PaddleOCR } = await import("@paddleocr/paddleocr-js");

      for (const lang of ["en", "ch"]) {
        try {
          ocrInstance = await PaddleOCR.create(baseCreateOptions(lang));
          return ocrInstance;
        } catch (err) {
          console.warn(`PaddleOCR (${lang}) init failed:`, err?.message || err);
        }
      }
      throw new Error("PaddleOCR could not be initialized.");
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

export function preloadAadhaarOcrWorker() {
  return getPaddleOcr();
}

function polyCentroid(poly) {
  if (!poly?.length) return { x: 0, y: 0 };
  let sx = 0;
  let sy = 0;
  for (const p of poly) {
    sx += p.x;
    sy += p.y;
  }
  return { x: sx / poly.length, y: sy / poly.length };
}

export async function recognizeAadhaarImage(
  imageInput,
  {
    minWordConfidence = 48,
    onProgress = () => {},
    detLimitSideLen = 960,
    region = false,
  } = {},
) {
  const ocr = await getPaddleOcr();
  const minScore = minWordConfidence / 100;
  const sideLen = region ? Math.min(detLimitSideLen, 720) : detLimitSideLen;

  onProgress(10);
  const [result] = await ocr.predict(imageInput, {
    textRecScoreThresh: minScore,
    textDetLimitSideLen: sideLen,
    textDetLimitType: "max",
  });
  onProgress(95);

  const items = (result?.items || [])
    .filter((it) => (it.score ?? 0) >= minScore && String(it.text || "").trim())
    .sort((a, b) => {
      const ca = polyCentroid(a.poly);
      const cb = polyCentroid(b.poly);
      return ca.y - cb.y || ca.x - cb.x;
    });

  const text = items.map((it) => String(it.text).trim()).join("\n");
  const confidence = items.length
    ? Math.round(
        (items.reduce((sum, it) => sum + (it.score || 0), 0) / items.length) * 100,
      )
    : 0;

  return {
    text,
    confidence,
    rawText: text,
    lines: items.map((it) => ({
      text: String(it.text).trim(),
      confidence: Math.round((it.score || 0) * 100),
      poly: it.poly,
    })),
  };
}

export function majorityPick(values, normalize = (v) => v) {
  const counts = new Map();
  for (const raw of values) {
    const v = normalize(raw);
    if (!v) continue;
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  let best = "";
  let bestCount = 0;
  for (const [v, c] of counts) {
    if (c > bestCount) {
      bestCount = c;
      best = v;
    }
  }
  return best;
}

export async function disposePaddleOcr() {
  if (ocrInstance?.dispose) {
    try {
      await ocrInstance.dispose();
    } catch {
      /* ignore */
    }
  }
  ocrInstance = null;
  initPromise = null;
}
