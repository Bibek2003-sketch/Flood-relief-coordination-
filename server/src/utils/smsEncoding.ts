/**
 * Standard GSM 03.38 7-bit Character Set
 * Reference: 3GPP TS 23.038 / ETSI GSM 03.38
 */
const GSM_7_BASIC = 
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ\x1bÆæßÉ !\"#¤%&'()*+,-./" +
  "0123456789:;<=>?¡" +
  "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿" +
  "abcdefghijklmnopqrstuvwxyzäöñüà";

const GSM_7_EXTENDED = "|^€{}[~]\\";

export interface SmsEncodingMetrics {
  encoding: 'GSM-7' | 'UCS-2';
  characterCount: number;
  segmentCount: number;
  charsPerSegment: number;
  charsRemainingInSegment: number;
  isMultipart: boolean;
  rawByteCount: number;
}

/**
 * Checks if a string contains only characters from the standard GSM-7 basic or extended character sets.
 * If any character is outside GSM-7 (such as Hindi, Bengali, or Bodo in Devanagari/Bengali scripts),
 * the message MUST be encoded using UCS-2 Unicode.
 */
export function isGsm7Compatible(text: string): boolean {
  if (!text) return true;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (!GSM_7_BASIC.includes(char) && !GSM_7_EXTENDED.includes(char)) {
      return false;
    }
  }
  return true;
}

/**
 * Calculates SMS character counts and segments according to telecom standards:
 * 
 * GSM-7 (English / ASCII standard):
 * - Single part: up to 160 characters (140 bytes @ 7 bits)
 * - Multipart concatenated: 153 characters per segment (7 bytes reserved for UDH header)
 * 
 * UCS-2 (Unicode: Hindi, Bengali, Bodo regional scripts):
 * - Single part: up to 70 characters (140 bytes @ 16 bits)
 * - Multipart concatenated: 67 characters per segment (6 bytes reserved for UDH header)
 */
export function calculateSmsSegments(text: string): SmsEncodingMetrics {
  const content = text || '';
  const isGsm = isGsm7Compatible(content);

  if (isGsm) {
    // Count extended GSM characters as 2 (they require an escape prefix)
    let gsmCharLength = 0;
    for (let i = 0; i < content.length; i++) {
      gsmCharLength += GSM_7_EXTENDED.includes(content[i]) ? 2 : 1;
    }

    if (gsmCharLength <= 160) {
      return {
        encoding: 'GSM-7',
        characterCount: gsmCharLength,
        segmentCount: gsmCharLength === 0 ? 0 : 1,
        charsPerSegment: 160,
        charsRemainingInSegment: 160 - gsmCharLength,
        isMultipart: false,
        rawByteCount: Math.ceil((gsmCharLength * 7) / 8)
      };
    } else {
      const segmentCount = Math.ceil(gsmCharLength / 153);
      const remainder = gsmCharLength % 153;
      const charsRemainingInSegment = remainder === 0 ? 0 : 153 - remainder;
      return {
        encoding: 'GSM-7',
        characterCount: gsmCharLength,
        segmentCount,
        charsPerSegment: 153,
        charsRemainingInSegment,
        isMultipart: true,
        rawByteCount: Math.ceil((gsmCharLength * 7) / 8) + (segmentCount * 7)
      };
    }
  } else {
    // UCS-2 encoding (Hindi, Bengali, Bodo, or mixed text)
    const charCount = Array.from(content).length; // Handle multi-byte surrogate pairs accurately

    if (charCount <= 70) {
      return {
        encoding: 'UCS-2',
        characterCount: charCount,
        segmentCount: charCount === 0 ? 0 : 1,
        charsPerSegment: 70,
        charsRemainingInSegment: 70 - charCount,
        isMultipart: false,
        rawByteCount: charCount * 2
      };
    } else {
      const segmentCount = Math.ceil(charCount / 67);
      const remainder = charCount % 67;
      const charsRemainingInSegment = remainder === 0 ? 0 : 67 - remainder;
      return {
        encoding: 'UCS-2',
        characterCount: charCount,
        segmentCount,
        charsPerSegment: 67,
        charsRemainingInSegment,
        isMultipart: true,
        rawByteCount: (charCount * 2) + (segmentCount * 6)
      };
    }
  }
}

