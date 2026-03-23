import Tesseract from "tesseract.js";

function isValidIsoDob(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split("-").map(Number);
  const nowY = new Date().getFullYear();
  if (y < 1900 || y > nowY) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  return true;
}

function isValidAadhaarDigits(digits) {
  const clean = String(digits || "").replace(/\D/g, "");
  if (clean.length !== 12) return false;
  if (/^(\d)\1{11}$/.test(clean)) return false;
  return true;
}

function isPossibleAadhaarDigits(digits) {
  const clean = String(digits || "").replace(/\D/g, "");
  if (clean.length < 8 || clean.length > 12) return false;
  if (/^(\d)\1+$/.test(clean)) return false;
  return true;
}

function rankBestDocCandidate(values) {
  const clean = values
    .map((v) => String(v || "").replace(/\D/g, ""))
    .filter((v) => isPossibleAadhaarDigits(v));
  if (clean.length === 0) return "";

  const counts = new Map();
  for (const v of clean) counts.set(v, (counts.get(v) || 0) + 1);

  return [...counts.keys()].sort((a, b) => {
    const a12 = isValidAadhaarDigits(a) ? 1 : 0;
    const b12 = isValidAadhaarDigits(b) ? 1 : 0;
    if (b12 !== a12) return b12 - a12;
    if (b.length !== a.length) return b.length - a.length;
    return (counts.get(b) || 0) - (counts.get(a) || 0);
  })[0];
}

function isVidContext(text, index) {
  const src = String(text || "");
  const start = Math.max(0, index - 20);
  const end = Math.min(src.length, index + 8);
  const context = src.slice(start, end).toUpperCase();
  return /\bT?VID\b/.test(context);
}

function extractDocCandidatesFromText(text) {
  const src = String(text || "");
  const re = /\d{4}[\s\-|]{0,2}\d{4}[\s\-|]{0,2}\d{1,4}/g;
  const aadhaar = [];
  const vid = [];
  let m;

  while ((m = re.exec(src)) !== null) {
    const digits = m[0].replace(/\D/g, "");
    if (!isPossibleAadhaarDigits(digits)) continue;
    if (isVidContext(src, m.index)) vid.push(digits);
    else aadhaar.push(digits);
  }

  return { aadhaar, vid };
}

async function normalizeImageForOCR(
  base64Src,
  minWidth = 900,
  minHeight = 500,
) {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        try {
          const srcW = Math.max(1, Number(img.width) || 1);
          const srcH = Math.max(1, Number(img.height) || 1);

          const scale = Math.max(minWidth / srcW, minHeight / srcH, 1);
          const width = Math.round(srcW * scale);
          const height = Math.round(srcH * scale);

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) {
            resolve(base64Src);
            return;
          }

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.92));
        } catch (e) {
          resolve(base64Src);
        }
      };
      img.onerror = () => resolve(base64Src);
      img.src = base64Src;
    } catch (e) {
      resolve(base64Src);
    }
  });
}

async function createEnhancedOCRImage(base64Src) {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        try {
          const scale = 1.6;
          const width = Math.max(1, Math.round(img.width * scale));
          const height = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) {
            resolve(base64Src);
            return;
          }

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const imageData = ctx.getImageData(0, 0, width, height);
          const data = imageData.data;

          // Grayscale + contrast boost + light thresholding to improve OCR on glare/noise.
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            let gray = 0.299 * r + 0.587 * g + 0.114 * b;
            gray = (gray - 128) * 1.35 + 128;
            gray = Math.max(0, Math.min(255, gray));
            const bw = gray > 150 ? 255 : gray;
            data[i] = bw;
            data[i + 1] = bw;
            data[i + 2] = bw;
          }

          ctx.putImageData(imageData, 0, 0);
          resolve(canvas.toDataURL("image/jpeg", 0.92));
        } catch (e) {
          resolve(base64Src);
        }
      };
      img.onerror = () => resolve(base64Src);
      img.src = base64Src;
    } catch (e) {
      resolve(base64Src);
    }
  });
}

/** Words / fragments that are almost never real name parts on Aadhaar OCR noise */
const NAME_GARBAGE_PATTERNS =
  /\b(eae|aye|iii|ith|teer|seer|las|rer|ore|ps|ry|oe|wm|aw|amer)\b/i;

/** OCR often reads card headers as title-case; reject as full name */
const NAME_STOPWORDS = new Set([
  "government",
  "india",
  "identification",
  "authority",
  "unique",
  "aadhaar",
  "address",
  "male",
  "female",
  "department",
  "income",
  "tax",
  "enrolment",
  "enrollment",
  "vid",
  "help",
  "www",
  "proof",
  "citizenship",
  "verification",
  "bharat",
  "sarkar",
]);

const NAME_PREFIX_NOISE = new Set([
  "fra",
  "fra.",
  "fr",
  "frr",
  "ing",
  "smt",
  "mr",
  "mrs",
  "ms",
  "dr",
  "shri",
  "sri",
  "w/o",
  "s/o",
  "d/o",
  "wo",
  "so",
  "do",
  "sov",
  "gov",
  "govt",
  "govemment",
  "ire",
  "ps",
  "p5",
  "ss",
  "haw",
  "taq",
  "tet",
  "ing.",
  "cl",
  "es",
  "ey",
]);

const NAME_TOKEN_NOISE = new Set([
  "sre",
  "ttt",
  "hig",
  "rfydob",
  "frydob",
  "gear",
  "adr",
]);

const NAME_SUFFIX_NOISE = new Set([
  "cl",
  "es",
  "ey",
  "fi",
  "fr",
  "fra",
  "ps",
  "ss",
  "ii",
  "ll",
]);

const DEVANAGARI_RANGE = "\\u0900-\\u097F";
const LATIN_OR_DEVANAGARI_RE = new RegExp(`[A-Za-z${DEVANAGARI_RANGE}]`, "g");
const STRONG_NAME_TOKEN_RE = new RegExp(`^[A-Za-z${DEVANAGARI_RANGE}]{3,}$`);
const MIXED_NAME_RE = new RegExp(
  `\\b([A-Za-z${DEVANAGARI_RANGE}][A-Za-z${DEVANAGARI_RANGE}.]{2,}(?:\\s+[A-Za-z${DEVANAGARI_RANGE}][A-Za-z${DEVANAGARI_RANGE}.]{2,}){0,4})\\b`,
  "g",
);

/** Reject a string as a bogus "name" from bad OCR */
function isLikelyGarbageName(s) {
  if (!s || typeof s !== "string") return true;
  const t = s.trim();
  if (t.length < 4 || t.length > 80) return true;
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length < 1 || words.length > 5) return true;
  if (
    words.some((w) =>
      NAME_STOPWORDS.has(w.replace(/[^a-z]/gi, "").toLowerCase()),
    )
  )
    return true;

  const letters = (t.match(LATIN_OR_DEVANAGARI_RE) || []).join("");
  const alphaRatio = t.length ? letters.length / t.length : 0;
  if (alphaRatio < 0.55) return true;

  // Too many very short tokens (OCR shards like "Th", "Aye")
  const shortTokens = words.filter((w) => w.length <= 2).length;
  if (words.length >= 2 && shortTokens >= words.length - 1) return true;

  if (NAME_GARBAGE_PATTERNS.test(t)) return true;

  // Real names usually have at least one word with 3+ letters
  const longWords = words.filter((w) => STRONG_NAME_TOKEN_RE.test(w)).length;
  if (longWords === 0) return true;

  return false;
}

/**
 * Pull "Firstname Lastname" from a noisy line, e.g. "5 Gautam Kumar | § f¥er- 84722"
 */
function extractTitleCaseNameFromLine(line) {
  if (!line) return "";
  // Strip leading digit + spaces (row numbers on card)
  let s = line.replace(/^\s*\d+\s+/, " ");
  // Prefer: Capitalized words before | or junk
  const pipe = s.split(/[|§]/)[0];
  const m = pipe.match(
    /([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,}){0,3})(?=\s*$|\s*\d|\s*[-–—])/,
  );
  if (m) return m[1].trim();
  const m2 = pipe.match(/([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,}){1,3})/);
  if (m2) return m2[1].trim();

  const mixed = pipe.match(
    new RegExp(
      `([A-Za-z${DEVANAGARI_RANGE}][A-Za-z${DEVANAGARI_RANGE}.]{2,}(?:\\s+[A-Za-z${DEVANAGARI_RANGE}][A-Za-z${DEVANAGARI_RANGE}.]{2,}){0,3})`,
    ),
  );
  if (mixed) return mixed[1].trim();

  return "";
}

function scoreNameCandidate(s) {
  if (!s || isLikelyGarbageName(s)) return -1000;
  const words = s.trim().split(/\s+/);
  let score = 0;
  const firstLower = words[0]?.toLowerCase?.() || "";
  if (NAME_PREFIX_NOISE.has(firstLower)) score -= 25;
  for (const w of words) {
    const lowerAlpha = String(w)
      .toLowerCase()
      .replace(/[^a-z]/g, "");
    if (/^[A-Z][a-z]{2,14}$/.test(w)) score += 12;
    else if (/^[A-Z][a-z]+$/.test(w)) score += 6;
    else if (STRONG_NAME_TOKEN_RE.test(w)) score += 4;
    else if (/\d/.test(w)) score -= 25;
    else score -= 3;

    if (NAME_TOKEN_NOISE.has(lowerAlpha)) score -= 30;
    if (/^([a-z])\1{2,}$/.test(lowerAlpha)) score -= 35;
    if (/^[bcdfghjklmnpqrstvwxyz]{3,}$/i.test(lowerAlpha)) score -= 14;
  }
  if (words.length >= 2) score += 8;
  if (NAME_GARBAGE_PATTERNS.test(s)) score -= 40;
  return score;
}

function sanitizeExtractedName(name) {
  if (!name) return "";

  let tokens = String(name)
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((t) => t.replace(new RegExp(`[^A-Za-z${DEVANAGARI_RANGE}]`, "g"), ""))
    .filter(Boolean);

  const looksStrongNameToken = (t) => STRONG_NAME_TOKEN_RE.test(t || "");
  const isNoiseLead = (t) => {
    const k = String(t || "").toLowerCase();
    if (!k) return true;
    if (NAME_PREFIX_NOISE.has(k) || NAME_STOPWORDS.has(k)) return true;
    if (k.length <= 2) return true;
    return false;
  };
  const isNoiseTail = (t) => {
    const k = String(t || "").toLowerCase();
    if (!k) return true;
    if (NAME_SUFFIX_NOISE.has(k) || NAME_STOPWORDS.has(k)) return true;
    if (k.length <= 2) return true;
    return false;
  };

  // If first token is weak/noisy but next two look like names, drop first token.
  if (
    tokens.length >= 3 &&
    isNoiseLead(tokens[0]) &&
    looksStrongNameToken(tokens[1]) &&
    looksStrongNameToken(tokens[2])
  ) {
    tokens = tokens.slice(1);
  }

  while (tokens.length > 2) {
    const first = tokens[0].toLowerCase();
    if (!isNoiseLead(first)) break;
    tokens = tokens.slice(1);
  }

  while (tokens.length > 1) {
    const last = tokens[tokens.length - 1].toLowerCase();
    if (!isNoiseTail(last)) break;
    tokens = tokens.slice(0, -1);
  }

  const joined = tokens.join(" ").trim();
  return isLikelyGarbageName(joined) ? "" : joined;
}

function pickMostFrequent(values) {
  const list = values.filter(Boolean);
  if (list.length === 0) return "";
  const counts = new Map();
  for (const v of list) counts.set(v, (counts.get(v) || 0) + 1);
  let best = "";
  let bestCount = -1;
  for (const [k, c] of counts.entries()) {
    if (c > bestCount) {
      best = k;
      bestCount = c;
    }
  }
  return best;
}

/**
 * Find all "Firstname Lastname" patterns in full text (handles OCR splitting across lines)
 */
function findTitleCaseNamePatterns(text) {
  const candidates = [];
  const lineWiseText = String(text || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lineWiseText) {
    const re = /\b([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,}){1,3})\b/g;
    let m;
    while ((m = re.exec(line)) !== null) {
      candidates.push(m[1].trim());
    }

    // Mixed-script patterns (Hindi + English), line-wise only.
    while ((m = MIXED_NAME_RE.exec(line)) !== null) {
      candidates.push(m[1].trim());
    }
  }

  return candidates;
}

/**
 * Extracts information from Aadhaar or PAN card images using OCR.
 * @param {string} imageBase64 - The base64 string or URL of the image.
 * @param {function} onProgress - Optional callback for progress updates.
 * @returns {Promise<object>} - Extracted details.
 */
export const performOCR = async (
  imageBase64,
  onProgress = () => {},
  isRetryPass = false,
) => {
  try {
    const normalizedImage = await normalizeImageForOCR(imageBase64);

    const {
      data: { text },
    } = await Tesseract.recognize(normalizedImage, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text" && onProgress) {
          onProgress(Math.floor(m.progress * 100));
        }
      },
      workerBlobURL: true,
      tessedit_pageseg_mode: "11",
      preserve_interword_spaces: "1",
    });

    console.log("OCR Raw Text:", text);

    let results = {
      name: "",
      dob: "",
      gender: "",
      pincode: "",
      address: "",
      docNumber: "",
      email: "",
      phone: "",
      type: "unknown",
    };

    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 1);

    // 1. Identify Document Type & Extract Number
    // Aadhaar/UID digits are often split by OCR noise: allow non-digits between the 4-4-4 groups.
    // Example matches:
    // - 9178 4240 7307
    // - 9178-4240-7307
    // - 9178 4240 ; 7307
    const panPattern = /[A-Z]{5}\d{4}[A-Z]/;
    const upperText = String(text || "").toUpperCase();

    const { aadhaar: aadhaarCandidates, vid: vidCandidates } =
      extractDocCandidatesFromText(text);
    const bestAadhaar = rankBestDocCandidate(aadhaarCandidates);
    const bestVid = rankBestDocCandidate(vidCandidates);

    if (bestAadhaar) {
      results.type = "aadhaar";
      results.docNumber = bestAadhaar;
    } else if (bestVid) {
      results.type = "vid";
      results.docNumber = bestVid;
    } else if (text.match(panPattern)) {
      results.type = "pan";
      results.docNumber = text.match(panPattern)[0];
    } else {
      const vidDetected = /\bT?VID\b/.test(upperText);
      const uidDetected =
        /\bUID\b/.test(upperText) ||
        upperText.includes("AADHAAR") ||
        upperText.includes("UNIQUE");
      const allDigits = text.replace(/[^0-9]/g, "");
      const twelveDigitMatches = allDigits.match(/\d{12}/g);
      if (twelveDigitMatches) {
        results.type = vidDetected && !uidDetected ? "vid" : "aadhaar";
        results.docNumber = twelveDigitMatches[twelveDigitMatches.length - 1];
      }
    }

    // 2. Extract DOB/YOB (Custom Pattern)
    const dobPattern = /(\d{2})[/-](\d{2})[/-](\d{4})/;
    const compactDobPattern =
      /(?:DOB|D0B|जन्म\s*तिथि)[:\s-]*(\d{2})(\d{2})(\d{4})/i;

    const matchYob = (str) => {
      const found = str.match(
        /(?:Birth|DOB|D0B|Year|YOB|जन्म\s*तिथि|जन्म\s*वर्ष)[^\d]*(\d{4})/i,
      );
      if (found && found[1].length >= 4) {
        const digits = found[1];
        return digits.substring(digits.length - 4);
      }
      return null;
    };

    const tolerantDobPattern =
      /(?:DOB|D0B|जन्म\s*तिथि)?[^\d]{0,8}(\d{2})\D{0,3}(\d{2})\D{0,3}(\d{4})/i;

    if (text.match(dobPattern)) {
      const match = text.match(dobPattern);
      results.dob = `${match[3]}-${match[2]}-${match[1]}`;
    } else if (text.match(compactDobPattern)) {
      const match = text.match(compactDobPattern);
      results.dob = `${match[3]}-${match[2]}-${match[1]}`;
    } else if (text.match(tolerantDobPattern)) {
      const match = text.match(tolerantDobPattern);
      results.dob = `${match[3]}-${match[2]}-${match[1]}`;
    } else {
      const yobValue = matchYob(text);
      if (yobValue) results.dob = `${yobValue}-01-01`;
    }

    if (results.dob && !isValidIsoDob(results.dob)) {
      results.dob = "";
    }

    // 3. Extract Gender
    const lowerText = text.toLowerCase();
    if (lowerText.includes("female") || lowerText.includes("/ f"))
      results.gender = "Female";
    else if (lowerText.includes("male") || lowerText.includes("/ m"))
      results.gender = "Male";
    else if (text.includes("महिला")) results.gender = "Female";
    else if (text.includes("पुरुष")) results.gender = "Male";

    // 4. Name extraction — Aadhaar/VID (robust against noisy OCR)
    if (results.type === "aadhaar" || results.type === "vid") {
      let govtIndex = -1;
      let dobIndex = -1;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toUpperCase();
        if (line.includes("GOVERNMENT") || line.includes("INDIA"))
          govtIndex = i;
        if (
          line.includes("DOB") ||
          line.includes("BIRTH") ||
          line.includes("YOB") ||
          dobPattern.test(lines[i])
        ) {
          if (dobIndex === -1) dobIndex = i;
        }
      }

      const candidates = [];

      // 4a Title-case patterns across full text (often catches "Gautam Kumar")
      for (const c of findTitleCaseNamePatterns(text)) {
        if (!isLikelyGarbageName(c))
          candidates.push({ s: c, score: scoreNameCandidate(c) });
      }

      // 4b Per-line extraction (digit prefix, pipes, etc.)
      for (const line of lines) {
        const extracted = extractTitleCaseNameFromLine(line);
        if (extracted && !isLikelyGarbageName(extracted)) {
          candidates.push({
            s: extracted,
            score: scoreNameCandidate(extracted),
          });
        }
        const tempClean = line.replace(/[|:;[\]'`]/g, " ").trim();
        const digitCount = (tempClean.match(/\d/g) || []).length;
        if (digitCount < 6 && tempClean.length > 4 && tempClean.length < 90) {
          const cleanName = tempClean
            .replace(new RegExp(`[^A-Za-z${DEVANAGARI_RANGE}\\s.]`, "g"), " ")
            .replace(/\s+/g, " ")
            .trim();
          const parts = cleanName.split(/\s+/).filter(Boolean);
          if (parts.length >= 1 && parts.length <= 5) {
            const joined = parts.join(" ");
            if (!isLikelyGarbageName(joined)) {
              candidates.push({ s: joined, score: scoreNameCandidate(joined) });
            }
          }
        }
      }

      // 4c Lines above DOB: score each, pick best (not first match)
      if (dobIndex !== -1) {
        const low = Math.max(govtIndex, 0);
        const minJ = Math.max(low + 1, dobIndex - 3);
        for (let j = dobIndex - 1; j >= minJ; j--) {
          const line = lines[j];
          const distance = Math.max(0, dobIndex - j);
          const proximityBonus = distance === 1 ? 18 : distance === 2 ? 10 : 6;
          const extracted = extractTitleCaseNameFromLine(line);
          if (extracted && !isLikelyGarbageName(extracted)) {
            candidates.push({
              s: extracted,
              score: scoreNameCandidate(extracted) + proximityBonus,
            });
          }
          const tempClean = line.replace(/[|:;[\]]/g, "").trim();
          const digitCount = (tempClean.match(/\d/g) || []).length;
          if (
            digitCount < 4 &&
            !/[&%=]{2,}/.test(tempClean) &&
            tempClean.length > 3
          ) {
            const cleanName = tempClean
              .replace(new RegExp(`[^A-Za-z${DEVANAGARI_RANGE}\\s.]`, "g"), "")
              .trim();
            const partsCount = cleanName.split(/\s+/).filter(Boolean).length;
            if (partsCount >= 1 && partsCount <= 4) {
              if (!isLikelyGarbageName(cleanName)) {
                candidates.push({
                  s: cleanName,
                  score:
                    scoreNameCandidate(cleanName) +
                    Math.max(2, proximityBonus - 4),
                });
              }
            }
          }
        }
      }

      // Deduplicate by normalized string, keep max score + original text
      const bestByName = new Map();
      for (const { s, score } of candidates) {
        const key = s.toLowerCase().replace(/\s+/g, " ");
        const prev = bestByName.get(key);
        if (!prev || prev.score < score) {
          bestByName.set(key, { s, score });
        }
      }

      let best = "";
      let bestScore = -Infinity;
      for (const { s, score } of bestByName.values()) {
        if (score <= bestScore) continue;
        const proper = s
          .split(/\s+/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ");

        const cleanedProper = sanitizeExtractedName(proper);
        if (cleanedProper.length > 2 && !isLikelyGarbageName(cleanedProper)) {
          bestScore = score;
          best = cleanedProper;
        }
      }

      // Prefer multi-word names with good score
      if (best && bestScore >= 8) {
        results.name = best;
      } else if (best) {
        results.name = best;
      }
    } else if (results.type === "pan") {
      const taxIndex = lines.findIndex(
        (l) =>
          l.toUpperCase().includes("TAX") || l.toUpperCase().includes("DEPT"),
      );
      if (taxIndex !== -1 && lines[taxIndex + 1]) {
        const panName = lines[taxIndex + 1].replace(/[^A-Za-z\s.]/g, "").trim();
        if (!isLikelyGarbageName(panName)) results.name = panName;
      }
    }

    // 5. Fallback for Common Fields
    const pincodeMatch = text.match(/\b\d{6}\b/);
    if (pincodeMatch) results.pincode = pincodeMatch[0];

    const emailMatch = text.match(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
    );
    if (emailMatch) results.email = emailMatch[0].toLowerCase();

    if (results.name === results.docNumber) results.name = "";

    const hasCoreFields =
      Boolean(results.name) &&
      Boolean(results.gender) &&
      Boolean(results.dob) &&
      isValidAadhaarDigits(results.docNumber);

    // Run 2 extraction passes (base + enhanced) and evaluate best values.
    if (!isRetryPass) {
      const enhancedImage = await createEnhancedOCRImage(normalizedImage);

      const passImages = [enhancedImage];
      const passResults = [results];

      for (const img of passImages) {
        const r = await performOCR(img, () => {}, true).catch(() => null);
        if (r) passResults.push(r);
      }

      const secondPass = passResults[1] || null;
      const secondName = sanitizeExtractedName(secondPass?.name || "");
      const secondGender =
        secondPass?.gender === "Male" ||
        secondPass?.gender === "Female" ||
        secondPass?.gender === "Other"
          ? secondPass.gender
          : "";
      const secondDob = isValidIsoDob(secondPass?.dob || "")
        ? secondPass.dob
        : "";
      const secondDoc = isPossibleAadhaarDigits(secondPass?.docNumber || "")
        ? String(secondPass.docNumber).replace(/\D/g, "")
        : "";
      const secondType = secondPass?.type || "";

      const nameCandidates = passResults
        .map((r) => sanitizeExtractedName(r?.name || ""))
        .filter(Boolean)
        .map((name) => ({
          name,
          score:
            scoreNameCandidate(name) +
            (name.split(/\s+/).length >= 2 ? 5 : 0) +
            (name.length >= 8 ? 2 : 0),
        }))
        .sort((a, b) => b.score - a.score);

      const bestName = nameCandidates[0]?.name || "";

      const genderCandidates = passResults
        .map((r) => r?.gender)
        .filter((g) => g === "Male" || g === "Female" || g === "Other");
      const bestGender = pickMostFrequent(genderCandidates);

      const dobCandidates = passResults
        .map((r) => r?.dob || "")
        .filter((d) => isValidIsoDob(d));
      const exactDobCandidates = dobCandidates.filter(
        (d) => !String(d).endsWith("-01-01"),
      );
      const bestDob =
        pickMostFrequent(exactDobCandidates) || pickMostFrequent(dobCandidates);

      const aadhaarDocCandidates = passResults
        .filter((r) => r?.type === "aadhaar")
        .map((r) => String(r?.docNumber || "").replace(/\D/g, ""))
        .filter((d) => isPossibleAadhaarDigits(d));

      const vidDocCandidates = passResults
        .filter((r) => r?.type === "vid")
        .map((r) => String(r?.docNumber || "").replace(/\D/g, ""))
        .filter((d) => isPossibleAadhaarDigits(d));

      const bestDoc =
        rankBestDocCandidate(aadhaarDocCandidates) ||
        rankBestDocCandidate(vidDocCandidates);

      results = {
        ...results,
        name: secondName || bestName || results.name,
        gender: secondGender || bestGender || results.gender,
        dob: secondDob || bestDob || results.dob,
        docNumber: secondDoc || bestDoc || results.docNumber,
      };

      if (secondDoc && (secondType === "aadhaar" || secondType === "vid")) {
        results.type = secondType;
      }

      if (bestDoc && !secondDoc) {
        if (aadhaarDocCandidates.includes(bestDoc)) results.type = "aadhaar";
        else if (vidDocCandidates.includes(bestDoc)) results.type = "vid";
      }

      // Last fallback: digits-only OCR for Aadhaar when still missing.
      if (!isPossibleAadhaarDigits(results.docNumber) || !hasCoreFields) {
        try {
          const {
            data: { text: digitsText },
          } = await Tesseract.recognize(enhancedImage, "eng", {
            logger: () => {},
            workerBlobURL: true,
            tessedit_pageseg_mode: "6",
            tessedit_char_whitelist: "0123456789 -|",
            preserve_interword_spaces: "1",
          });

          const { aadhaar: digitAadhaarCandidates } =
            extractDocCandidatesFromText(digitsText);
          const normalized = rankBestDocCandidate(digitAadhaarCandidates);
          if (normalized) {
            if (isPossibleAadhaarDigits(normalized)) {
              if (
                !results.docNumber ||
                normalized.length >= String(results.docNumber).length
              ) {
                results.docNumber = normalized;
              }
              results.type = "aadhaar";
            }
          }
        } catch (e) {
          // keep current results
        }
      }
    }

    return results;
  } catch (error) {
    console.error("OCR Error:", error);
    throw error;
  }
};
