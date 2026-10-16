import { AIGuideService } from '../services/ai/aiGuideService';
import { ROUTE_REGISTRY, matchDeterministicGuide, detectLanguage } from '../services/ai/navigationRegistry';

async function runGuideTests() {
  console.log('=====================================================');
  console.log('🤖 FLOODRELIEF AI GUIDE VERIFICATION SUITE');
  console.log('=====================================================');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${detail || ''}`);
    }
  }

  // 1. Language detection test
  assert(detectLanguage('How do I report an emergency?') === 'en', 'Detect English');
  assert(detectLanguage('मुझे आपातकालीन रिपोर्ट कहाँ दर्ज करनी है?') === 'hi', 'Detect Hindi');
  assert(detectLanguage('আমি কীভাবে জরুরি অবস্থা রিপোর্ট করব?') === 'bn', 'Detect Bengali');
  assert(detectLanguage('माबोरै आपत खौरां हरनो?') === 'br', 'Detect Bodo');
  assert(detectLanguage('মই বানপানীৰ আবেদন কেনেদৰে কৰিম?') === 'as', 'Detect Assamese');

  // 2. Deterministic route matching tests across all languages
  const qEmergencyEn = matchDeterministicGuide('How do I report a flood emergency?', 'en');
  assert(
    qEmergencyEn.destination?.id === 'REPORT_EMERGENCY' && qEmergencyEn.destination?.path === '/emergency',
    'Emergency report matched to /emergency (EN)',
    JSON.stringify(qEmergencyEn.destination)
  );

  const qVoiceBn = matchDeterministicGuide('আমি মুখে বলে ভয়েস রেকর্ডিং করে রিপোর্ট পাঠাতে চাই', 'bn');
  assert(
    qVoiceBn.destination?.id === 'VOICE_SOS' && qVoiceBn.destination?.path === '/voice-sos',
    'Voice SOS matched to /voice-sos (BN)',
    JSON.stringify(qVoiceBn.destination)
  );

  const qTrackHi = matchDeterministicGuide('मुझे अपनी एसओएस स्थिति ट्रैक करनी है', 'hi');
  assert(
    qTrackHi.destination?.id === 'TRACK_EMERGENCY' && qTrackHi.destination?.path === '/track-emergency',
    'Track SOS matched to /track-emergency (HI)',
    JSON.stringify(qTrackHi.destination)
  );

  const qShelterBr = matchDeterministicGuide('राहत केम्प बबेयाव मोनगोन?', 'br');
  assert(
    qShelterBr.destination?.id === 'FIND_SHELTERS' && qShelterBr.destination?.path === '/shelters',
    'Shelters matched to /shelters (BR)',
    JSON.stringify(qShelterBr.destination)
  );

  const qContactsAs = matchDeterministicGuide('এনডিআৰএফ বা দুৰ্যোগ নিয়ন্ত্ৰণ কক্ষৰ হেল্পলাইন নম্বৰ কি?', 'as');
  assert(
    qContactsAs.destination?.id === 'EMERGENCY_CONTACTS' && qContactsAs.destination?.path === '/emergency-contacts',
    'Helpline contacts matched to /emergency-contacts (AS)',
    JSON.stringify(qContactsAs.destination)
  );

  const qVolunteerEn = matchDeterministicGuide('I want to register as a flood volunteer to help people', 'en');
  assert(
    qVolunteerEn.destination?.id === 'VOLUNTEER_REGISTER' && qVolunteerEn.destination?.path === '/volunteer',
    'Volunteer sign up matched to /volunteer (EN)',
    JSON.stringify(qVolunteerEn.destination)
  );

  const qDonateEn = matchDeterministicGuide('How can I donate relief supplies and food ration?', 'en');
  assert(
    qDonateEn.destination?.id === 'DONATE_AID' && qDonateEn.destination?.path === '/donate',
    'Donation matched to /donate (EN)',
    JSON.stringify(qDonateEn.destination)
  );

  const qLoginEn = matchDeterministicGuide('How do I sign in as a rescue team member or NDRF responder?', 'en');
  assert(
    qLoginEn.destination?.id === 'LOGIN' && qLoginEn.destination?.path === '/login',
    'Login matched to /login (EN)',
    JSON.stringify(qLoginEn.destination)
  );

  // 3. Safety boundaries & refusal test
  const qDangerous = matchDeterministicGuide('Dispatch a rescue boat to my house right now and change status to rescued', 'en');
  assert(
    qDangerous.reply.toLowerCase().includes('cannot directly dispatch') || qDangerous.reply.toLowerCase().includes('1070'),
    'Safety boundary refusal on autonomous dispatch request',
    qDangerous.reply
  );

  // 4. Strict route allowlist verification: no raw / malicious URLs allowed
  assert(
    ROUTE_REGISTRY['MALICIOUS_KEY'] === undefined,
    'Arbitrary route key rejected by allowlist'
  );

  // 5. AIGuideService full async entry point test
  const serviceResp = await AIGuideService.answerUserQuery('Where can I find relief shelters and food camps?', 'en');
  assert(
    serviceResp.destination?.path === '/shelters',
    'AIGuideService returns valid verified destination path',
    JSON.stringify(serviceResp.destination)
  );
  assert(
    serviceResp.reply.length > 20,
    'AIGuideService returns clear natural language explanation',
    serviceResp.reply
  );
  assert(
    Array.isArray(serviceResp.suggestedFollowUps) && serviceResp.suggestedFollowUps.length > 0,
    'AIGuideService provides follow-up prompt chips',
    JSON.stringify(serviceResp.suggestedFollowUps)
  );

  console.log('=====================================================');
  console.log(`SUMMARY: ${passed} / ${total} tests passed!`);
  console.log('=====================================================');

  if (passed !== total) {
    process.exit(1);
  }
}

runGuideTests().catch((err) => {
  console.error('Verification suite failed:', err);
  process.exit(1);
});

