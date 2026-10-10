import { ISmsProvider, SmsSendPayload, SmsSendResult } from '../smsProvider';
import { maskPhoneNumber } from '../../../utils/phoneNumber';

export class MockSmsProvider implements ISmsProvider {
  readonly name = 'mock';

  async send(payload: SmsSendPayload): Promise<SmsSendResult> {
    const isSmsEnabled = process.env.SMS_ENABLED === 'true';
    const masked = maskPhoneNumber(payload.to);
    const mockId = `MOCK-SMS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const logLine = `[SMS-SIMULATOR] Event: ${payload.eventType} | To: ${masked} | Lang: ${payload.language.toUpperCase()} | Encod: ${payload.metrics.encoding} (${payload.metrics.segmentCount} seg) | Request: ${payload.requestId}`;
    
    console.log(logLine);
    console.log(`[SMS-TEXT] "${payload.message}"`);

    if (!isSmsEnabled) {
      return {
        success: true,
        provider: 'mock',
        providerMessageId: mockId,
        status: 'SKIPPED',
        safeFailureReason: 'SMS_ENABLED is false; dispatch simulated in safe development mode.',
        rawResponse: { simulated: true, enabled: false }
      };
    }

    return {
      success: true,
      provider: 'mock',
      providerMessageId: mockId,
      status: 'SENT',
      rawResponse: { simulated: true, enabled: true, timestamp: new Date().toISOString() }
    };
  }

  isConfigured(): boolean {
    return true;
  }

  getPublicConfig() {
    return {
      providerName: 'Mock SMS Simulator (Development)',
      isConfigured: true,
      senderId: 'SIM_FLDRLF',
      mode: 'simulation' as const,
      dltEntityConfigured: false
    };
  }
}

