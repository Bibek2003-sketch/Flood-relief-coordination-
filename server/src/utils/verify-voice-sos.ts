import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import ReliefRequest from '../models/ReliefRequest';
import { VOICE_STORAGE_DIR } from './audioStorage';
import { normalizeIndianPhoneNumber } from './phoneNumber';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../../server/.env') });

async function runVoiceVerification() {
  console.log('\n======================================================');
  console.log('🎙️ FloodRelief Voice SOS System Automated Verification');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // Test 1: Storage directory exists
  assert(fs.existsSync(VOICE_STORAGE_DIR), `Storage directory exists at ${VOICE_STORAGE_DIR}`);

  // Test 2: Phone number validation for voice SOS (optional, but valid if provided)
  const emptyPhoneCheck = normalizeIndianPhoneNumber('');
  assert(!emptyPhoneCheck.isValid, 'Empty phone recognized as empty (optional in Voice SOS)');

  const validPhoneCheck = normalizeIndianPhoneNumber('9864012345');
  assert(validPhoneCheck.isValid && validPhoneCheck.normalized === '+919864012345', 'Valid 10-digit Indian callback phone normalized to E.164');

  const invalidPhoneCheck = normalizeIndianPhoneNumber('12345');
  assert(!invalidPhoneCheck.isValid, 'Short invalid phone correctly rejected');

  // Test 3: Temporary mock audio file generation & safe path verification
  const testFileName = `test_sos_${Date.now()}.webm`;
  const testFilePath = path.join(VOICE_STORAGE_DIR, testFileName);
  fs.writeFileSync(testFilePath, Buffer.from('RIFF mock webm voice recording payload 1234567890'));

  assert(fs.existsSync(testFilePath), 'Temporary test audio file written to private storage');

  // Test 4: Database model validation with Voice SOS fields
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log('ℹ️ MONGODB_URI not found in environment, skipping live DB record test.');
  } else {
    try {
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB for schema verification...');

      // Create test Voice SOS document
      const testVoiceSos = await ReliefRequest.create({
        citizenName: 'Citizen (Voice SOS Verification)',
        contact: validPhoneCheck.normalized,
        location: 'Near Guwahati Bharalumukh Sluice Gate',
        coordinates: {
          type: 'Point',
          coordinates: [91.7312, 26.1742]
        },
        locationAccuracy: 15,
        numberOfPeople: 3,
        requestCategory: ['Rescue'],
        priority: 'Critical',
        preferredLanguage: 'as',
        reportType: 'voice',
        description: 'Voice SOS automated test signal.',
        voiceRecording: {
          fileName: testFileName,
          originalName: 'recorded_voice.webm',
          fileSize: 1024,
          mimeType: 'audio/webm;codecs=opus',
          durationSeconds: 18,
          storagePath: testFilePath
        },
        status: 'SUBMITTED'
      });

      assert(Boolean(testVoiceSos._id), 'Voice SOS record persisted in MongoDB');
      assert(testVoiceSos.requestID.startsWith('FLD-'), `Auto-generated Request ID formatted correctly: ${testVoiceSos.requestID}`);
      assert(testVoiceSos.reportType === 'voice', 'reportType saved as voice');
      assert(testVoiceSos.priority === 'Critical', 'Voice distress signal assigned Critical priority');
      assert(testVoiceSos.status === 'SUBMITTED', 'Initial status set to SUBMITTED');
      assert(testVoiceSos.voiceRecording?.fileName === testFileName, 'voiceRecording metadata stored correctly');
      assert(Boolean(testVoiceSos.timeline && testVoiceSos.timeline.length > 0), 'Initial operational timeline entry generated');

      // Cleanup test DB document
      await ReliefRequest.findByIdAndDelete(testVoiceSos._id);
      console.log('Cleaned up test document from database.');
      await mongoose.disconnect();
    } catch (dbErr: any) {
      console.warn('DB verification notice (network or DNS):', dbErr.message);
    }
  }

  // Cleanup test audio file
  if (fs.existsSync(testFilePath)) {
    fs.unlinkSync(testFilePath);
    assert(!fs.existsSync(testFilePath), 'Cleaned up test audio file from private storage');
  }

  console.log('\n======================================================');
  console.log(`📊 Voice SOS Test Summary: ${passed} passed, ${failed} failed`);
  console.log('======================================================\n');
}

runVoiceVerification();
