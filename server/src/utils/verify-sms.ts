import { isGsm7Compatible, calculateSmsSegments } from './smsEncoding';
import { normalizeIndianPhoneNumber, maskPhoneNumber } from './phoneNumber';
import { renderSms, interpolateTemplate, getFullTemplateCatalog } from '../services/sms/smsTemplateService';
import smsService from '../services/sms/smsService';

async function runSmsVerification() {
  console.log('\n======================================================');
  console.log('🧪 FloodRelief Multilingual SMS System Verification');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, detail = '') {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} ${detail ? `- ${detail}` : ''}`);
      failed++;
    }
  }

  // 1. Phone Number Normalization Tests
  console.log('\n--- 1. Indian Phone Number Normalization & Masking ---');
  const valid10 = normalizeIndianPhoneNumber('9864012345');
  assert('10-digit mobile normalized to E.164 (+919864012345)', valid10.isValid && valid10.normalized === '+919864012345');
  assert('Masking hides center digits (+91 ******2345)', valid10.masked === '+91 ******2345');

  const withZero = normalizeIndianPhoneNumber('09864012345');
  assert('Leading 0 prefix handled cleanly', withZero.isValid && withZero.normalized === '+919864012345');

  const withCountryCode = normalizeIndianPhoneNumber('+91 (98640) 12-345');
  assert('Formatted with spaces and dash (+91 (98640) 12-345)', withCountryCode.isValid && withCountryCode.normalized === '+919864012345');

  const invalidPrefix = normalizeIndianPhoneNumber('2864012345');
  assert('Rejects invalid prefix (must start with 6,7,8,9)', !invalidPrefix.isValid);

  const invalidLength = normalizeIndianPhoneNumber('98640');
  assert('Rejects invalid short length', !invalidLength.isValid);

  // 2. SMS Encoding & Segment Metrics Tests
  console.log('\n--- 2. SMS Encoding & Segment Calculations ---');
  const englishText = 'FloodRelief: Your report FLD-2026-10492 has been received.';
  assert('English ASCII text detected as GSM-7', isGsm7Compatible(englishText));

  const gsmMetrics = calculateSmsSegments(englishText);
  assert('Short GSM-7 fits in 1 segment', gsmMetrics.encoding === 'GSM-7' && gsmMetrics.segmentCount === 1 && !gsmMetrics.isMultipart);

  const hindiText = 'बाढ़ राहत (FloodRelief): आपकी आपात रिपोर्ट FLD-001 प्राप्त हुई।';
  assert('Hindi text detected as UCS-2 Unicode', !isGsm7Compatible(hindiText));
  const ucs2Metrics = calculateSmsSegments(hindiText);
  assert('Hindi text encoded as UCS-2', ucs2Metrics.encoding === 'UCS-2');

  const assameseText = 'বান সাহাৰ্য্য (FloodRelief): আপোনাৰ জৰুৰী প্ৰতিবেদন FLD-001 গ্ৰহণ কৰা হৈছে।';
  assert('Assamese text detected as UCS-2 Unicode', !isGsm7Compatible(assameseText));

  const bengaliText = 'বন্যা ত্রাণ (FloodRelief): আপনার জরুরি রিপোর্ট FLD-001 গৃহীত হয়েছে।';
  assert('Bengali text detected as UCS-2 Unicode', !isGsm7Compatible(bengaliText));

  const bodoText = 'दैबाना हेफाजाब (FloodRelief): नोंथांनि खौरां FLD-001 मोननाय जाबाय।';
  assert('Bodo text in Devanagari detected as UCS-2 Unicode', !isGsm7Compatible(bodoText));

  // 3. Template Rendering Across All 5 Languages
  console.log('\n--- 3. Template Localization & Fallback ---');
  const sampleId = 'FLD-2026-90421';

  const enRendered = renderSms('EMERGENCY_REPORT_RECEIVED', 'en', { requestId: sampleId });
  assert('English template rendered with {requestId}', enRendered.message.includes(sampleId) && enRendered.language === 'en');

  const asRendered = renderSms('EMERGENCY_REPORT_RECEIVED', 'as', { requestId: sampleId });
  assert('Assamese template rendered with {requestId}', asRendered.message.includes(sampleId) && asRendered.language === 'as');

  const hiRendered = renderSms('EMERGENCY_REPORT_RECEIVED', 'hi', { requestId: sampleId });
  assert('Hindi template rendered with {requestId}', hiRendered.message.includes(sampleId) && hiRendered.language === 'hi');

  const bnRendered = renderSms('EMERGENCY_REPORT_RECEIVED', 'bn', { requestId: sampleId });
  assert('Bengali template rendered with {requestId}', bnRendered.message.includes(sampleId) && bnRendered.language === 'bn');

  const brRendered = renderSms('EMERGENCY_REPORT_RECEIVED', 'br', { requestId: sampleId });
  assert('Bodo template rendered with {requestId}', brRendered.message.includes(sampleId) && brRendered.language === 'br');

  const fallbackRendered = renderSms('EMERGENCY_REPORT_RECEIVED', 'invalid' as any, { requestId: sampleId });
  assert('Fallback to English on invalid language', fallbackRendered.language === 'en' && fallbackRendered.wasFallback);

  // CRLF injection prevention
  const crlfMalicious = 'FLD-999\r\nAttack-Header: True';
  const cleanInterpolation = interpolateTemplate('ID: {requestId}', { requestId: crlfMalicious });
  assert('CRLF injection stripped from placeholders', !cleanInterpolation.includes('\r') && !cleanInterpolation.includes('\n'));

  // 4. Provider and Dispatch Simulator Test
  console.log('\n--- 4. Safe Simulation Provider ---');
  const provider = smsService.getActiveProvider();
  assert('Mock provider active by default', provider.name === 'mock');

  const dispatchResult = await smsService.dispatch({
    to: '9864012345',
    emergencyId: '507f1f77bcf86cd799439011' as any,
    requestId: 'FLD-TEST-999',
    eventType: 'EMERGENCY_REPORT_RECEIVED',
    language: 'as'
  }).catch(() => null);

  assert('SMS service handles dispatch in simulation mode (Assamese)', Boolean(dispatchResult && dispatchResult.recipientMasked === '+91 ******2345' && dispatchResult.language === 'as'));

  // 5. Template Catalog Inspection & Lifecycle Completeness
  console.log('\n--- 5. 19-Stage Template Catalog & Review Metadata ---');
  const catalog = getFullTemplateCatalog(sampleId);
  assert('Catalog covers all 19 disaster lifecycle stages', catalog.length === 19, `Got ${catalog.length}`);
  
  const allCovered = catalog.every(stage => stage.translations.length === 5);
  assert('Each stage covers all 5 languages (en, as, hi, bn, br)', allCovered);

  // Assert Review Ethics: English is approved, regional translations are flagged for native field review
  const englishApproved = catalog.every(stage => {
    const enTrans = stage.translations.find(t => t.language === 'en');
    return enTrans && enTrans.reviewStatus === 'approved' && enTrans.isReviewed === true;
  });
  assert('English templates certified as approved (isReviewed: true)', englishApproved);

  const nativeReviewTracked = catalog.every(stage => {
    const regional = stage.translations.filter(t => t.language !== 'en');
    return regional.every(t => t.reviewStatus === 'needs_review' && t.isReviewed === false);
  });
  assert('Regional templates (as, hi, bn, br) marked needs_review (isReviewed: false)', nativeReviewTracked);

  // Test new stages rendering
  const delayedRendered = renderSms('TEMPORARILY_DELAYED', 'as', { requestId: sampleId });
  assert('Stage 10 (TEMPORARILY_DELAYED) renders in Assamese', delayedRendered.message.includes(sampleId) && delayedRendered.stageNumber === 10);

  const duplicateRendered = renderSms('REPORT_MARKED_DUPLICATE', 'br', { requestId: sampleId });
  assert('Stage 14 (REPORT_MARKED_DUPLICATE) renders in Bodo Devanagari', duplicateRendered.message.includes(sampleId) && duplicateRendered.stageNumber === 14);

  console.log('\n======================================================');
  console.log(`📊 Test Summary: ${passed} passed, ${failed} failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSmsVerification().catch(err => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});

