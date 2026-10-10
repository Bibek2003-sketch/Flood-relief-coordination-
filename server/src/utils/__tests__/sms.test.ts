import { isGsm7Compatible, calculateSmsSegments } from '../smsEncoding';
import { normalizeIndianPhoneNumber, maskPhoneNumber } from '../phoneNumber';
import { renderSms, interpolateTemplate } from '../../services/sms/smsTemplateService';

describe('Multilingual SMS System - Encoding, Phone & Template Tests', () => {
  describe('Indian Phone Number Normalization & Privacy', () => {
    test('normalizes standard 10-digit Indian numbers starting with 6, 7, 8, 9', () => {
      const res = normalizeIndianPhoneNumber('9864012345');
      expect(res.isValid).toBe(true);
      expect(res.normalized).toBe('+919864012345');
      expect(res.masked).toBe('+91 ******2345');
    });

    test('handles leading 0 trunk prefix', () => {
      const res = normalizeIndianPhoneNumber('09864012345');
      expect(res.isValid).toBe(true);
      expect(res.normalized).toBe('+919864012345');
    });

    test('handles international +91 prefix and formatting characters', () => {
      const res = normalizeIndianPhoneNumber('+91 (98640) 12-345');
      expect(res.isValid).toBe(true);
      expect(res.normalized).toBe('+919864012345');
    });

    test('rejects numbers not starting with 6, 7, 8, or 9', () => {
      const res = normalizeIndianPhoneNumber('1234567890');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('start with 6, 7, 8, or 9');
    });

    test('rejects invalid length numbers', () => {
      const res = normalizeIndianPhoneNumber('98640');
      expect(res.isValid).toBe(false);
    });

    test('masks phone numbers safely without exposing victim identifiers', () => {
      expect(maskPhoneNumber('+919864012345')).toBe('+91 ******2345');
    });
  });

  describe('SMS Encoding & Segment Metrics', () => {
    test('detects pure GSM-7 English text', () => {
      expect(isGsm7Compatible('FloodRelief: Your report FLD-001 has been received.')).toBe(true);
    });

    test('detects Unicode in Hindi, Bengali, and Bodo text', () => {
      expect(isGsm7Compatible('बाढ़ राहत रिपोर्ट')).toBe(false); // Hindi
      expect(isGsm7Compatible('বন্যা ত্রাণ')).toBe(false);        // Bengali
      expect(isGsm7Compatible('दैबाना हेफाजाब')).toBe(false);   // Bodo
    });

    test('calculates single-part GSM-7 limit (up to 160 characters)', () => {
      const shortText = 'FloodRelief: Your emergency report FLD-2026-10492 has been received.';
      const metrics = calculateSmsSegments(shortText);
      expect(metrics.encoding).toBe('GSM-7');
      expect(metrics.segmentCount).toBe(1);
      expect(metrics.isMultipart).toBe(false);
    });

    test('calculates single-part UCS-2 Unicode limit (up to 70 characters)', () => {
      const hindiShort = 'बाढ़ राहत: आपकी रिपोर्ट FLD-101 प्राप्त हुई। फोन पास रखें।';
      const metrics = calculateSmsSegments(hindiShort);
      expect(metrics.encoding).toBe('UCS-2');
      expect(metrics.segmentCount).toBe(1);
      expect(metrics.characterCount).toBeLessThanOrEqual(70);
    });

    test('calculates multipart UCS-2 segments correctly (67 chars/segment)', () => {
      const longHindi = 'बाढ़ राहत (FloodRelief): आपकी आपात रिपोर्ट FLD-2026-10492 प्राप्त हुई। यह केवल पावती है; बचाव की अभी पुष्टि नहीं हुई है। फोन चालू रखें।';
      const metrics = calculateSmsSegments(longHindi);
      expect(metrics.encoding).toBe('UCS-2');
      expect(metrics.isMultipart).toBe(true);
      expect(metrics.segmentCount).toBeGreaterThan(1);
    });
  });

  describe('Template Localization & Fallback', () => {
    test('interpolates {requestId} safely', () => {
      const text = interpolateTemplate('Report {requestId} received.', { requestId: 'FLD-999' });
      expect(text).toBe('Report FLD-999 received.');
    });

    test('strips CRLF from placeholder variables to prevent header injection', () => {
      const malicious = 'FLD-999\r\nSET-ADMIN: TRUE\n';
      const text = interpolateTemplate('Report {requestId} received.', { requestId: malicious });
      expect(text).not.toContain('\r');
      expect(text).not.toContain('\n');
    });

    test('falls back to English when invalid language code is passed', () => {
      const rendered = renderSms('EMERGENCY_REPORT_RECEIVED', 'xyz' as any, { requestId: 'FLD-123' });
      expect(rendered.language).toBe('en');
      expect(rendered.wasFallback).toBe(true);
      expect(rendered.message).toContain('FloodRelief');
    });

    test('renders Hindi, Bengali, and Bodo templates correctly', () => {
      const hi = renderSms('EMERGENCY_REPORT_RECEIVED', 'hi', { requestId: 'FLD-123' });
      expect(hi.language).toBe('hi');
      expect(hi.message).toContain('बाढ़ राहत');

      const bn = renderSms('EMERGENCY_REPORT_RECEIVED', 'bn', { requestId: 'FLD-123' });
      expect(bn.language).toBe('bn');
      expect(bn.message).toContain('বন্যা ত্রাণ');

      const br = renderSms('EMERGENCY_REPORT_RECEIVED', 'br', { requestId: 'FLD-123' });
      expect(br.language).toBe('br');
      expect(br.message).toContain('दैबाना हेफाजाब');
    });
  });
});

