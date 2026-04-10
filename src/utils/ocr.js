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
  "nit",
  "tet",
  "gears",
  "scanning",
  "authentication",
  "qr",
  "code",
  "ith",
  "birth",
  "identity",
  "tie",
  "urs",
  "ort",
  "vdeeeqa",
  "ars"
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

  const letters = t.replace(/[^A-Za-z]/g, ""); // English letters only
  const alphaRatio = t.length ? letters.length / t.length : 0;
  if (alphaRatio < 0.5) return true;

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
  // Strip common Aadhaar prefix like "To," or "S/O"
  s = s.replace(/^(To|S\/O|D\/O|W\/O|C\/O|NAME|Name)[:\s,]+/i, "");

  // Prefer: Capitalized words before | or junk
  const pipe = s.split(/[|§]/)[0];
  const m = pipe.match(
    /([A-Z][a-z]{1,}(?:\s+[A-Z][a-z]{1,}){0,3})(?=\s*$|\s*\d|\s*[-–—]|["'.|\]])/,
  );
  if (m) return m[1].trim();
  const m2 = pipe.match(/([A-Z][a-z]{1,}(?:\s+[A-Z][a-z]{1,}){1,3})/);
  if (m2) return m2[1].trim();
  return "";
}

function scoreNameCandidate(s) {
  if (!s || isLikelyGarbageName(s)) return -1000;
  const words = s.trim().split(/\s+/);
  let score = 0;
  for (const w of words) {
    // English Title Case
    if (/^[A-Z][a-z]{3,14}$/.test(w)) score += 20; // 4+ letter proper words (like Mohd, Saif) get high score
    else if (/^[A-Z][a-z]{1,2}$/.test(w)) score += 5; // Very short title case (like Ali, Ra) get lower but positive score
    else if (/^[A-Z][a-z]+$/.test(w)) score += 10;
    else if (/^[A-Za-z]{3,}$/.test(w)) score += 8;
    else if (/\d/.test(w)) score -= 25;
    else score -= 5;
  }
  if (words.length >= 2) score += 10;
  // Penalty for very short names with short tokens
  if (s.length < 8 && words.every(w => w.length <= 3)) score -= 30;
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
 * @param {string|Blob|File} imageInput - The binary Blob/File or URL of the image.
 * @param {function} onProgress - Optional callback for progress updates.
 * @returns {Promise<object>} - Extracted details.
 */
export const performOCR = async (imageInput, onProgress = () => {}) => {
  try {
    const {
      data: { text },
    } = await Tesseract.recognize(imageInput, "eng", {
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
    const aadhaarPattern = /[2-9]{1}\d{3}\s?\d{4}\s?\d{4}/; // Standard Aadhaar pattern (12 digits, optional spaces)
    const relaxedAadhaarPatternText = /([0-9A-Za-z]{4}[\s\-]+[0-9A-Za-z4]{4}[\s\-]+[0-9A-Za-z]{4})/;
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

    // Helper to check if a string is likely a document ID (mostly digits)
    const isLikelyDocId = (s) => {
      if (!s) return false;
      const digits = s.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 12 && (digits.length / s.length > 0.6);
    };

    let aadhaarMatch = text.match(aadhaarPattern);
    if (!aadhaarMatch || !isLikelyDocId(aadhaarMatch[0])) {
      const allMatches = text.match(/[0-9A-Za-z]{4}[\s\-]+[0-9A-Za-z]{4}[\s\-]+[0-9A-Za-z]{4}/g);
      if (allMatches && allMatches.length > 0) {
        // Pick the last one (usually at the bottom of the card)
        const lastCandidate = allMatches[allMatches.length - 1];
        if (isLikelyDocId(lastCandidate)) {
          aadhaarMatch = [lastCandidate];
        }
      }
    }

    if (aadhaarMatch) {
      results.type = (vidDetected && !uidDetected) ? "vid" : "aadhaar";
      results.docNumber = aadhaarMatch[0].trim();
    } else if (text.match(panPattern)) {
      results.type = "pan";
      results.docNumber = text.match(panPattern)[0];
    } else {
      // 1.5 Relaxed Pattern to catch common OCR symbol typos (l -> 1, O -> 0, S -> 5)
      // Expecting roughly three 4-character blocks
      const relaxedAadhaarPattern = /([0-9A-Za-z]{3,4}[\s\-]+[0-9A-Za-z]{3,4}[\s\-]+[0-9A-Za-z]{3,4})/;
      const relaxedMatches = text.match(relaxedAadhaarPattern);

      let extractedRelaxed = null;
      if (relaxedMatches) {
        let potentialAadhaar = relaxedMatches[0]
          .replace(/[OoQ]/g, "0")
          .replace(/[Il!|]/g, "1")
          .replace(/[zZ]/g, "2")
          .replace(/[S]/g, "5")
          .replace(/[B]/g, "8")
          .replace(/\D/g, "");
        if (potentialAadhaar.length === 12) {
          extractedRelaxed = potentialAadhaar;
        }
      }

      if (extractedRelaxed) {
        results.type = (vidDetected && !uidDetected) ? "vid" : "aadhaar";
        results.docNumber = extractedRelaxed;
      } else {
        // Final fallback: Look for any single line that has 10-12 digits
        for (const line of lines) {
          const cleanedLine = line.replace(/\D/g, "");
          if (cleanedLine.length >= 10 && cleanedLine.length <= 12 && !line.includes("/")) {
            results.type = (vidDetected && !uidDetected) ? "vid" : "aadhaar";
            results.docNumber = line.trim(); // Keep original formatting
            break;
          }
        }
      }
    }

    // 2. Extract DOB/YOB (Custom Pattern)
    // Relaxed to handle noise like spaces in year: "02/04/201 9"
    const dobPattern = /(\d{2})[/\-\s](\d{2})[/\-\s](\d{2,4}(?:\s?\d{1,2})?)/;
    const compactDobPattern = /DOB[:\s]*(\d{2})(\d{2})(\d{4})/i;

    const matchYob = (str) => {
      const found = str.match(/(?:Birth|DOB|Year|ores|YOB)[^\d]*(\d+[\s\d]*)/i);
      if (found && found[1].replace(/\s/g, "").length >= 4) {
        const cleaned = found[1].replace(/\s/g, "");
        const digits = cleaned.match(/\d{4}/);
        if (digits) {
          const yearNum = parseInt(digits[0]);
          const currentYear = new Date().getFullYear();
          if (yearNum >= 1920 && yearNum <= currentYear) {
            return digits[0];
          }
        }
      }
      return null;
    };

    const dobMatch = text.match(dobPattern);
    if (dobMatch) {
      const day = dobMatch[1];
      const month = dobMatch[2];
      const year = dobMatch[3].replace(/\s/g, "");
      if (year.length === 4) {
        const yearNum = parseInt(year);
        const currentYear = new Date().getFullYear();
        if (yearNum >= 1920 && yearNum <= currentYear) {
          results.dob = `${year}-${month}-${day}`;
        }
      } else if (year.length === 2) {
        // Simple heuristic for 2-digit years
        const currentYear = new Date().getFullYear();
        const fullYear = parseInt(year) + (parseInt(year) > (currentYear % 100) ? 1900 : 2000);
        if (fullYear >= 1920 && fullYear <= currentYear) {
          results.dob = `${fullYear}-${month}-${day}`;
        }
      }
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

    // 4. Name extraction
    if (results.type === "aadhaar" || results.type === "vid" || results.type === "unknown") {
      let govtIndex = -1;
      let dobIndex = -1;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toUpperCase();
        if (line.includes("GOVERNMENT") || line.includes("INDIA") || line.includes("UIDAI"))
          govtIndex = i;
        if (
          line.includes("DOB") ||
          line.includes("BIRTH") ||
          line.includes("YOB") ||
          /(\d{2})[/\-\s](\d{2})[/\-\s](\d{2,4})/.test(lines[i])
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
            const cleanName = tempClean.replace(/[^A-Za-z\s.]/g, "").trim();
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
            return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
          })
          .join(" ");
        if (proper.length > 2 && !isLikelyGarbageName(proper)) {
          bestScore = score;
          best = proper;
        }
      }

      if (best) {
        // Strip common trailing/leading Aadhaar OCR glitches from finalized name
        best = best
          .replace(/\b(El|Ei|Enr|Rfy|Dob|Yob|Vld|Vid|Male|Female|Faf|Srf|Ssrn|Oob|Th)\b/gi, "")
          .replace(/\s{2,}/g, " ")
          .trim();
        results.name = best;
      }
    } else if (results.type === "pan") {
      const taxPatterns = ["INCOME TAX DEPARTMENT", "GOVT. OF INDIA", "GOVERNMENT OF INDIA", "TAX"];
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
    // Look for "Address"
    const addressMatch = text.match(/(?:Address)[:\s,]+([\s\S]+?)(?=\d{6}|Card|UIDAI|Unique|$)/i);
    if (addressMatch) {
       results.address = addressMatch[1].replace(/\n/g, " ").replace(/\s+/g, " ").trim();
    }

    // 6. Pincode and others
    const pincodeMatch = text.match(/\b\d{6}\b/);
    if (pincodeMatch) results.pincode = pincodeMatch[0];

    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) results.email = emailMatch[0].toLowerCase();

    if (results.name === results.docNumber) results.name = "";

    console.log("DEBUG: OCR Potential Results before return:", JSON.stringify(results, null, 2));
    return results;
  } catch (error) {
    console.error("OCR Error:", error);
    throw error;
  }
};
