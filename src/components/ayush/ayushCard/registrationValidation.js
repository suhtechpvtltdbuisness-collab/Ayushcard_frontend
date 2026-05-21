import apiService from "../../../api/service";
import { splitFamilyHeadNameParts } from "./utils.js";
import { HEAD_DUPLICATE_INITIAL } from "./constants.js";

function toDuplicateState(parsed, errorMessage) {
  if (parsed == null) {
    return {
      loading: false,
      exists: null,
      cardId: null,
      error: errorMessage,
    };
  }
  return {
    loading: false,
    exists: parsed.exists,
    cardId: parsed.cardId,
    error: null,
  };
}

/**
 * Fresh server checks before payment / final submit.
 * Returns updated inline-check state for phone, Aadhaar, and name.
 */
export async function runRegistrationDuplicateChecks(familyHead) {
  const phoneDigits = String(familyHead.contactNumber || "").replace(/\D/g, "");
  const aadhaarDigits = String(familyHead.aadhaarNumber || "").replace(/\D/g, "");
  const { firstName, middleName, lastName } = splitFamilyHeadNameParts(
    familyHead.fullName || "",
  );

  const errors = [];

  if (phoneDigits.length !== 10) {
    errors.push("Enter a valid 10-digit phone number.");
  }
  if (aadhaarDigits.length < 8) {
    errors.push("Enter a valid Aadhaar number (8–12 digits).");
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      phoneCheck: HEAD_DUPLICATE_INITIAL,
      aadhaarCheck: HEAD_DUPLICATE_INITIAL,
      nameCheck: HEAD_DUPLICATE_INITIAL,
    };
  }

  const [phoneParsed, aadhaarParsed, nameParsed] = await Promise.all([
    apiService.checkCardPhoneExists(phoneDigits).catch(() => null),
    apiService.checkCardAadhaarExists(aadhaarDigits).catch(() => null),
    firstName.trim()
      ? apiService
          .checkCardNameExists({ firstName, middleName, lastName })
          .catch(() => null)
      : Promise.resolve({ exists: false, cardId: null }),
  ]);

  const phoneCheck = toDuplicateState(
    phoneParsed,
    "Could not verify phone number. Please try again.",
  );
  const aadhaarCheck = toDuplicateState(
    aadhaarParsed,
    "Could not verify Aadhaar number. Please try again.",
  );
  const nameCheck = toDuplicateState(
    nameParsed,
    "Could not verify name. Please try again.",
  );

  if (phoneParsed == null || aadhaarParsed == null) {
    errors.push("Registration check failed. Please try again.");
  }
  if (phoneParsed?.exists) {
    errors.push("Phone number already exists.");
  }
  if (aadhaarParsed?.exists) {
    errors.push("Aadhaar number already registered.");
  }
  if (nameParsed?.exists) {
    errors.push("An Ayush Card is already registered with this name.");
  }

  return {
    valid: errors.length === 0,
    errors,
    phoneCheck,
    aadhaarCheck,
    nameCheck,
  };
}

export function hasBlockingDuplicateFromState(phoneCheck, aadhaarCheck) {
  return phoneCheck.exists === true || aadhaarCheck.exists === true;
}
