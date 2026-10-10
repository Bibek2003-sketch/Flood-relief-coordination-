import crypto from 'crypto';

export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string; // Standard E.164 format: +91XXXXXXXXXX
  masked: string;     // E.g. +91 ******2345
  hash: string;       // SHA-256 for privacy-preserving deduplication
  error?: string;
}

/**
 * Validates and normalizes Indian mobile phone numbers to E.164 (+91XXXXXXXXXX)
 * Telecom Regulatory Authority of India (TRAI) mobile numbers start with 6, 7, 8, or 9.
 */
export function normalizeIndianPhoneNumber(rawInput: string): PhoneValidationResult {
  if (!rawInput || typeof rawInput !== 'string') {
    return {
      isValid: false,
      normalized: '',
      masked: '',
      hash: '',
      error: 'Phone number is required.'
    };
  }

  // Remove whitespace, dashes, dots, and parentheses
  let cleaned = rawInput.replace(/[\s\-\(\)\.]/g, '').trim();

  // If starts with +, strip for inspection
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Handle leading 0 (domestic trunk prefix, e.g. 09864012345)
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.substring(1);
  }

  // Handle country code 91
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }

  // Must now be exactly 10 digits
  if (!/^\d{10}$/.test(cleaned)) {
    return {
      isValid: false,
      normalized: '',
      masked: '',
      hash: '',
      error: 'Please enter a valid 10-digit Indian mobile number.'
    };
  }

  // First digit of Indian mobile numbers must be 6, 7, 8, or 9
  const firstDigit = cleaned.charAt(0);
  if (!['6', '7', '8', '9'].includes(firstDigit)) {
    return {
      isValid: false,
      normalized: '',
      masked: '',
      hash: '',
      error: 'Indian mobile numbers must start with 6, 7, 8, or 9.'
    };
  }

  const normalized = `+91${cleaned}`;
  const masked = maskPhoneNumber(normalized);
  const hash = crypto.createHash('sha256').update(normalized).digest('hex');

  return {
    isValid: true,
    normalized,
    masked,
    hash
  };
}

/**
 * Masks a phone number for privacy display in logs and administrative dashboards.
 * Example: +919864012345 -> +91 ******2345
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || typeof phone !== 'string') return '******';
  const clean = phone.replace(/[\s\-]/g, '');
  if (clean.length >= 10) {
    const prefix = clean.startsWith('+91') ? '+91 ' : clean.substring(0, clean.length - 8) + ' ';
    const last4 = clean.slice(-4);
    return `${prefix}******${last4}`;
  }
  return clean.slice(0, 2) + '****' + clean.slice(-2);
}

