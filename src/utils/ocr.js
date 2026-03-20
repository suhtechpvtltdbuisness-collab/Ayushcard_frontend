import Tesseract from 'tesseract.js';

/**
 * Extracts information from Aadhaar or PAN card images using OCR.
 * @param {string} imageBase64 - The base64 string or URL of the image.
 * @param {function} onProgress - Optional callback for progress updates.
 * @returns {Promise<object>} - Extracted details.
 */
export const performOCR = async (imageBase64, onProgress = () => {}) => {
  try {
    const { data: { text } } = await Tesseract.recognize(
      imageBase64,
      'eng',
      { 
        logger: m => {
          if (m.status === 'recognizing text' && onProgress) {
            onProgress(Math.floor(m.progress * 100));
          }
          console.log(m);
        },
        workerBlobURL: true 
      }
    );

    console.log("OCR Raw Text:", text);
    
    const results = {
      name: '',
      dob: '',
      gender: '',
      pincode: '',
      address: '',
      docNumber: '',
      email: '',
      phone: '',
      type: 'unknown'
    };

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
    
    // 1. Identify Document Type & Extract Number
    const aadhaarPattern = /(\d{4}\s?\d{4}\s?\d{4})/;
    const panPattern = /[A-Z]{5}\d{4}[A-Z]/;
    
    const matches = text.match(aadhaarPattern);
    if (matches) {
        results.type = 'aadhaar';
        results.docNumber = matches[0].replace(/\s/g, '');
    } else if (text.match(panPattern)) {
        results.type = 'pan';
        results.docNumber = text.match(panPattern)[0];
    } else {
        // Find 12 digits, but ignore those that are likely part of a DOB (e.g. starting with 19 or 20)
        // Usually Aadhaar is at the bottom, so we search from the end
        const allDigits = text.replace(/[^0-9]/g, '');
        const twelveDigitMatches = allDigits.match(/\d{12}/g);
        if (twelveDigitMatches) {
            // Take the last one as it's most likely the Aadhaar number
            results.type = 'aadhaar';
            results.docNumber = twelveDigitMatches[twelveDigitMatches.length - 1];
        }
    }

    // 2. Extract DOB/YOB (Custom Pattern)
    const dobPattern = /(\d{2})[/-](\d{2})[/-](\d{4})/;
    const yobPattern = /(?:Birth|DOB|Year|ores|YOB)[:\d\s]*(\d{4})/i;
    const compactDobPattern = /DOB[:\s]*(\d{2})(\d{2})(\d{4})/i;
    
    // Attempt to match the last 4 digits specifically for YOB from a long numeric string
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
    if (lowerText.includes('female') || lowerText.includes('/ f')) results.gender = 'Female';
    else if (lowerText.includes('male') || lowerText.includes('/ m')) results.gender = 'Male';

    // 4. Customized Name Extraction (Anchor Based)
    if (results.type === 'aadhaar') {
        let govtIndex = -1;
        let dobIndex = -1;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].toUpperCase();
            if (line.includes('GOVERNMENT') || line.includes('INDIA')) govtIndex = i;
            if (line.includes('DOB') || line.includes('BIRTH') || line.match(dobPattern)) {
                if (dobIndex === -1) dobIndex = i;
            }
        }

                // Name is usually 1 or 2 lines above DOB and below Government of India
        if (dobIndex !== -1) {
            // Search upwards from DOB for the first valid English name line
            for (let j = dobIndex - 1; j > Math.max(govtIndex, -1); j--) {
                const line = lines[j];
                // Clean the line first to remove common noise
                const tempClean = line.replace(/[|:;\[\]]/g, '').trim();
                
                // Name should not have many digits (some noise is okay at start/end)
                const digitCount = (tempClean.match(/\d/g) || []).length;
                if (digitCount < 3 && !/[&%=]/.test(tempClean) && tempClean.length > 3) {
                    const cleanName = tempClean.replace(/[^A-Za-z\s.]/g, '').trim();
                                        const partsCount = cleanName.split(/\s+/).filter(Boolean).length;
                                        // Accept even single-word names like "Anita" (Aadhaar YOB format)
                                        if (partsCount >= 1 && partsCount <= 4) {
                        results.name = cleanName;
                        break;
                    }
                }
            }
        }
    } else if (results.type === 'pan') {
        const taxIndex = lines.findIndex(l => l.toUpperCase().includes('TAX') || l.toUpperCase().includes('DEPT'));
        if (taxIndex !== -1 && lines[taxIndex + 1]) {
            results.name = lines[taxIndex + 1].replace(/[^A-Za-z\s.]/g, '').trim();
        }
    }

    // 5. Fallback for Common Fields
    const pincodeMatch = text.match(/\b\d{6}\b/);
    if (pincodeMatch) results.pincode = pincodeMatch[0];
    
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) results.email = emailMatch[0].toLowerCase();

    // Final Cleaning
    if (results.name === results.docNumber) results.name = '';

    return results;
  } catch (error) {
    console.error("OCR Error:", error);
    throw error;
  }
};
