import Tesseract from "tesseract.js";

/** Words / fragments that are almost never real name parts on Aadhaar OCR noise */
const NAME_GARBAGE_PATTERNS =
  /\b(eae|aye|iii|ith|teer|seer|las|rer|ore|ps|ry|oe|wm|aw|amer|uidai|unique|identification|authority|mla|mp|goverment|india|enrollment|enrolment|address|year|birth|gender|male|female|dob|yob|vid|help|www|proof|citizenship|verification)\b/i;

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
  "uidai",
  "ministry",
  "personal",
  "information",
]);

/** Reject a string as a bogus "name" from bad OCR */
function isLikelyGarbageName(s) {
  if (!s || typeof s !== "string") return true;
  const t = s.trim();
  if (t.length < 3 || t.length > 80) return true;
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length < 1 || words.length > 5) return true;
  if (words.some((w) => NAME_STOPWORDS.has(w.replace(/[^a-z]/gi, "").toLowerCase())))
    return true;

  const letters = t.replace(/[^A-Za-z\u0900-\u097F]/g, ""); // Allow Hindi chars too
  const alphaRatio = t.length ? letters.length / t.length : 0;
  if (alphaRatio < 0.5) return true;

  // Too many very short tokens (OCR shards like "Th", "Aye")
  const shortTokens = words.filter((w) => w.length <= 2).length;
  if (words.length >= 2 && shortTokens >= words.length - 1) return true;

  if (NAME_GARBAGE_PATTERNS.test(t)) return true;

  // Real names usually have at least one word with 3+ letters
  const longWords = words.filter((w) => /^[A-Za-z\u0900-\u097F]{3,}$/.test(w)).length;
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
  // Strip common Aadhaar prefix like "To," or "S/O"
  s = s.replace(/^(To|S\/O|D\/O|W\/O|C\/O|NAME|Name)[:\s,]+/i, "");

  // Prefer: Capitalized words before | or junk
  const pipe = s.split(/[|§]/)[0];
  const m = pipe.match(
    /([A-Z\u0900-\u097F][a-z\u0900-\u097F]{1,}(?:\s+[A-Z\u0900-\u097F][a-z\u0900-\u097F]{1,}){0,3})(?=\s*$|\s*\d|\s*[-–—])/,
  );
  if (m) return m[1].trim();
  const m2 = pipe.match(/([A-Z\u0900-\u097F][a-z\u0900-\u097F]{1,}(?:\s+[A-Z\u0900-\u097F][a-z\u0900-\u097F]{1,}){1,3})/);
  if (m2) return m2[1].trim();
  return "";
}

function scoreNameCandidate(s) {
  if (!s || isLikelyGarbageName(s)) return -1000;
  const words = s.trim().split(/\s+/);
  let score = 0;
  for (const w of words) {
    // English Title Case
    if (/^[A-Z][a-z]{2,14}$/.test(w)) score += 12;
    else if (/^[A-Z][a-z]+$/.test(w)) score += 6;
    // Hindi characters
    else if (/^[\u0900-\u097F]+$/.test(w)) score += 10;
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
  // Updated to include possible Hindi characters if needed, but Tesseract often returns English for names
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
    } = await Tesseract.recognize(imageBase64, "eng+hin", {
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
    const aadhaarPattern = /(\d{4}\D{0,10}\d{4}\D{0,10}\d{4})/;
    const panPattern = /[A-Z]{5}\d{4}[A-Z]/;

    const matches = text.match(aadhaarPattern);
    const upperText = String(text || "").toUpperCase();
    const vidDetected = /\bVID\b/.test(upperText);
    const uidDetected =
      /\bUID\b/.test(upperText) ||
      upperText.includes("AADHAAR") ||
      upperText.includes("UNIQUE") ||
      upperText.includes("UIDAI") ||
      upperText.includes("GOVERNMENT OF INDIA");

    if (matches) {
      results.type = (vidDetected && !uidDetected) ? "vid" : "aadhaar";
      results.docNumber = matches[0].replace(/\D/g, ""); // Keep only digits
      if (results.docNumber.length > 12) results.docNumber = results.docNumber.substring(0, 12);
    } else if (text.match(panPattern)) {
      results.type = "pan";
      results.docNumber = text.match(panPattern)[0];
    } else {
      const allDigits = text.replace(/\D/g, "");
      const twelveDigitMatches = allDigits.match(/\d{12}/g);
      if (twelveDigitMatches) {
        results.type = (vidDetected && !uidDetected) ? "vid" : "aadhaar";
        results.docNumber = twelveDigitMatches[twelveDigitMatches.length - 1];
      }
    }

    // 2. Extract DOB/YOB (Custom Pattern)
    const dobPattern = /(\d{2})[/-](\d{2})[/-](\d{4})/;
    const compactDobPattern = /DOB[:\s]*(\d{2})(\d{2})(\d{4})/i;

    const matchYob = (str) => {
      const found = str.match(/(?:Birth|DOB|Year|ores|YOB|जन्म|तिथि)[^\d]*(\d+)/i);
      if (found && found[1].length >= 4) {
        const digits = found[1].match(/\d{4}/);
        return digits ? digits[0] : null;
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
    if (lowerText.includes("female") || lowerText.includes("/ f") || lowerText.includes("महिला"))
      results.gender = "Female";
    else if (lowerText.includes("male") || lowerText.includes("/ m") || lowerText.includes("पुरुष"))
      results.gender = "Male";

    // 4. Name extraction
    if (results.type === "aadhaar" || results.type === "vid" || results.type === "unknown") {
      let govtIndex = -1;
      let dobIndex = -1;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toUpperCase();
        if (line.includes("GOVERNMENT") || line.includes("INDIA") || line.includes("UIDAI") || line.includes("भारत"))
          govtIndex = i;
        if (
          line.includes("DOB") ||
          line.includes("BIRTH") ||
          line.includes("YOB") ||
          line.includes("जन्म") ||
          dobPattern.test(lines[i])
        ) {
          if (dobIndex === -1) dobIndex = i;
        }
      }

      const candidates = [];

      // 4a Title-case patterns across full text
      for (const c of findTitleCaseNamePatterns(text)) {
        if (!isLikelyGarbageName(c)) candidates.push({ s: c, score: scoreNameCandidate(c) });
      }

      // 4b Per-line extraction
      for (const line of lines) {
        const extracted = extractTitleCaseNameFromLine(line);
        if (extracted && !isLikelyGarbageName(extracted)) {
          candidates.push({ s: extracted, score: scoreNameCandidate(extracted) });
        }
        
        const tempClean = line.replace(/[|:;[\]'`]/g, " ").trim();
        const digitCount = (tempClean.match(/\d/g) || []).length;
        if (digitCount < 6 && tempClean.length > 4 && tempClean.length < 90) {
          const cleanName = tempClean.replace(/[^A-Za-z\u0900-\u097F\s.]/g, " ").replace(/\s+/g, " ").trim();
          const parts = cleanName.split(/\s+/).filter(Boolean);
          if (parts.length >= 1 && parts.length <= 5) {
            const joined = parts.join(" ");
            if (!isLikelyGarbageName(joined)) {
              candidates.push({ s: joined, score: scoreNameCandidate(joined) });
            }
          }
        }
      }

      // 4c Lines above DOB
      if (dobIndex !== -1) {
        const low = Math.max(govtIndex, 0);
        for (let j = dobIndex - 1; j > low; j--) {
          const line = lines[j];
          const extracted = extractTitleCaseNameFromLine(line);
          if (extracted && !isLikelyGarbageName(extracted)) {
            candidates.push({ s: extracted, score: scoreNameCandidate(extracted) + 10 });
          }
          const tempClean = line.replace(/[|:;[\]]/g, "").trim();
          const digitCount = (tempClean.match(/\d/g) || []).length;
          if (digitCount < 4 && !/[&%=]{2,}/.test(tempClean) && tempClean.length > 3) {
            const cleanName = tempClean.replace(/[^A-Za-z\u0900-\u097F\s.]/g, "").trim();
            const partsCount = cleanName.split(/\s+/).filter(Boolean).length;
            if (partsCount >= 1 && partsCount <= 4) {
              if (!isLikelyGarbageName(cleanName)) {
                candidates.push({
                  s: cleanName,
                  score: scoreNameCandidate(cleanName) + 5,
                });
              }
            }
          }
        }
      }

      // Deduplicate and pick best
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
          .map((w) => {
            if (/^[\u0900-\u097F]+$/.test(w)) return w; // Keep Hindi as is
            return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
          })
          .join(" ");
        if (proper.length > 2 && !isLikelyGarbageName(proper)) {
          bestScore = score;
          best = proper;
        }
      }

      if (best) {
        results.name = best;
      }
    } else if (results.type === "pan") {
      const taxPatterns = ["INCOME TAX DEPARTMENT", "ভারত", "GOVT. OF INDIA", "GOVERNMENT OF INDIA", "TAX"];
      const taxIndex = lines.findIndex(l => taxPatterns.some(p => l.toUpperCase().includes(p)));
      
      if (taxIndex !== -1) {
        // PAN Name usually follows "INCOME TAX DEPARTMENT" maybe with some noise
        for (let i = taxIndex + 1; i < taxIndex + 4 && i < lines.length; i++) {
          const line = lines[i].replace(/[^A-Za-z\s.]/g, "").trim();
          if (line.length > 3 && !isLikelyGarbageName(line) && !line.includes("FATHERS NAME")) {
            results.name = line;
            break;
          }
        }
      }
    }

    // 5. Address extraction attempt
    // Look for "Address" or "पता"
    const addressMatch = text.match(/(?:Address|पता)[:\s,]+([\s\S]+?)(?=\d{6}|Card|UIDAI|Unique|$)/i);
    if (addressMatch) {
       results.address = addressMatch[1].replace(/\n/g, " ").replace(/\s+/g, " ").trim();
    }

    // 6. Pincode and others
    const pincodeMatch = text.match(/\b\d{6}\b/);
    if (pincodeMatch) results.pincode = pincodeMatch[0];

    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) results.email = emailMatch[0].toLowerCase();

    if (results.name === results.docNumber) results.name = "";

    return results;
  } catch (error) {
    console.error("OCR Error:", error);
    throw error;
  }
};
