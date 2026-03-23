import Tesseract from "tesseract.js";

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
]);

/** Reject a string as a bogus "name" from bad OCR */
function isLikelyGarbageName(s) {
  if (!s || typeof s !== "string") return true;
  const t = s.trim();
  if (t.length < 4 || t.length > 80) return true;
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length < 1 || words.length > 5) return true;
  if (words.some((w) => NAME_STOPWORDS.has(w.replace(/[^a-z]/gi, "").toLowerCase())))
    return true;

  const letters = t.replace(/[^A-Za-z]/g, "");
  const alphaRatio = t.length ? letters.length / t.length : 0;
  if (alphaRatio < 0.55) return true;

  // Too many very short tokens (OCR shards like "Th", "Aye")
  const shortTokens = words.filter((w) => w.length <= 2).length;
  if (words.length >= 2 && shortTokens >= words.length - 1) return true;

  if (NAME_GARBAGE_PATTERNS.test(t)) return true;

  // Real names usually have at least one word with 3+ letters
  const longWords = words.filter((w) => /^[A-Za-z]{3,}$/.test(w)).length;
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
  return "";
}

function scoreNameCandidate(s) {
  if (!s || isLikelyGarbageName(s)) return -1000;
  const words = s.trim().split(/\s+/);
  let score = 0;
  for (const w of words) {
    if (/^[A-Z][a-z]{2,14}$/.test(w)) score += 12;
    else if (/^[A-Z][a-z]+$/.test(w)) score += 6;
    else if (/^[A-Za-z]{3,}$/.test(w)) score += 4;
    else if (/\d/.test(w)) score -= 25;
    else score -= 3;
  }
  if (words.length >= 2) score += 8;
  if (NAME_GARBAGE_PATTERNS.test(s)) score -= 40;
  return score;
}

/**
 * Find all "Firstname Lastname" patterns in full text (handles OCR splitting across lines)
 */
function findTitleCaseNamePatterns(text) {
  const candidates = [];
  const re = /\b([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,}){1,3})\b/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    candidates.push(m[1].trim());
  }
  return candidates;
}

/**
 * Extracts information from Aadhaar or PAN card images using OCR.
 * @param {string} imageBase64 - The base64 string or URL of the image.
 * @param {function} onProgress - Optional callback for progress updates.
 * @returns {Promise<object>} - Extracted details.
 */
export const performOCR = async (imageBase64, onProgress = () => {}) => {
  try {
    const {
      data: { text },
    } = await Tesseract.recognize(imageBase64, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text" && onProgress) {
          onProgress(Math.floor(m.progress * 100));
        }
      },
      workerBlobURL: true,
    });

    console.log("OCR Raw Text:", text);

    const results = {
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
    const aadhaarPattern = /(\d{4}\D{0,10}\d{4}\D{0,10}\d{4})/;
    const panPattern = /[A-Z]{5}\d{4}[A-Z]/;

    const matches = text.match(aadhaarPattern);
    const upperText = String(text || "").toUpperCase();
    const vidDetected = /\bVID\b/.test(upperText);
    const uidDetected =
      /\bUID\b/.test(upperText) ||
      upperText.includes("AADHAAR") ||
      upperText.includes("UNIQUE");

    if (matches) {
      // VID often looks identical to Aadhaar (4-4-4 digits). Use labels when present.
      results.type = vidDetected && !uidDetected ? "vid" : "aadhaar";
      results.docNumber = matches[0].replace(/\s/g, "");
    } else if (text.match(panPattern)) {
      results.type = "pan";
      results.docNumber = text.match(panPattern)[0];
    } else {
      const allDigits = text.replace(/[^0-9]/g, "");
      const twelveDigitMatches = allDigits.match(/\d{12}/g);
      if (twelveDigitMatches) {
        results.type = vidDetected && !uidDetected ? "vid" : "aadhaar";
        results.docNumber =
          twelveDigitMatches[twelveDigitMatches.length - 1];
      }
    }

    // 2. Extract DOB/YOB (Custom Pattern)
    const dobPattern = /(\d{2})[/-](\d{2})[/-](\d{4})/;
    const compactDobPattern = /DOB[:\s]*(\d{2})(\d{2})(\d{4})/i;

    const matchYob = (str) => {
      const found = str.match(/(?:Birth|DOB|Year|ores|YOB)[^\d]*(\d+)/i);
      if (found && found[1].length >= 4) {
        const digits = found[1];
        return digits.substring(digits.length - 4);
      }
      return null;
    };

    if (text.match(dobPattern)) {
      const match = text.match(dobPattern);
      results.dob = `${match[3]}-${match[2]}-${match[1]}`;
    } else if (text.match(compactDobPattern)) {
      const match = text.match(compactDobPattern);
      results.dob = `${match[3]}-${match[2]}-${match[1]}`;
    } else {
      const yobValue = matchYob(text);
      if (yobValue) results.dob = `${yobValue}-01-01`;
    }

    // 3. Extract Gender
    const lowerText = text.toLowerCase();
    if (lowerText.includes("female") || lowerText.includes("/ f"))
      results.gender = "Female";
    else if (lowerText.includes("male") || lowerText.includes("/ m"))
      results.gender = "Male";

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
        if (!isLikelyGarbageName(c)) candidates.push({ s: c, score: scoreNameCandidate(c) });
      }

      // 4b Per-line extraction (digit prefix, pipes, etc.)
      for (const line of lines) {
        const extracted = extractTitleCaseNameFromLine(line);
        if (extracted && !isLikelyGarbageName(extracted)) {
          candidates.push({ s: extracted, score: scoreNameCandidate(extracted) });
        }
        const tempClean = line.replace(/[|:;\[\]'`]/g, " ").trim();
        const digitCount = (tempClean.match(/\d/g) || []).length;
        if (digitCount < 6 && tempClean.length > 4 && tempClean.length < 90) {
          const cleanName = tempClean.replace(/[^A-Za-z\s.]/g, " ").replace(/\s+/g, " ").trim();
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
        for (let j = dobIndex - 1; j > low; j--) {
          const line = lines[j];
          const extracted = extractTitleCaseNameFromLine(line);
          if (extracted && !isLikelyGarbageName(extracted)) {
            candidates.push({ s: extracted, score: scoreNameCandidate(extracted) + 5 });
          }
          const tempClean = line.replace(/[|:;\[\]]/g, "").trim();
          const digitCount = (tempClean.match(/\d/g) || []).length;
          if (digitCount < 4 && !/[&%=]{2,}/.test(tempClean) && tempClean.length > 3) {
            const cleanName = tempClean.replace(/[^A-Za-z\s.]/g, "").trim();
            const partsCount = cleanName.split(/\s+/).filter(Boolean).length;
            if (partsCount >= 1 && partsCount <= 4) {
              if (!isLikelyGarbageName(cleanName)) {
                candidates.push({
                  s: cleanName,
                  score: scoreNameCandidate(cleanName) + 2,
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
        if (proper.length > 2 && !isLikelyGarbageName(proper)) {
          bestScore = score;
          best = proper;
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
        const panName = lines[taxIndex + 1]
          .replace(/[^A-Za-z\s.]/g, "")
          .trim();
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

    return results;
  } catch (error) {
    console.error("OCR Error:", error);
    throw error;
  }
};
