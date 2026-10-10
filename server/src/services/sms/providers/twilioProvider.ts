import { ISmsProvider, SmsSendPayload, SmsSendResult } from '../smsProvider';

/**
 * Twilio Global SMS Gateway Adapter
 * Uses Twilio REST API via native fetch (zero external library overhead).
 */
export class TwilioProvider implements ISmsProvider {
  readonly name = 'twilio';

  private get accountSid(): string {
    return process.env.TWILIO_ACCOUNT_SID || '';
  }

  private get authToken(): string {
    return process.env.TWILIO_AUTH_TOKEN || '';
  }

  private get fromPhoneNumber(): string {
    return process.env.TWILIO_PHONE_NUMBER || process.env.SMS_SENDER_ID || '';
  }

  isConfigured(): boolean {
    return Boolean(this.accountSid && this.authToken && this.fromPhoneNumber);
  }

  getPublicConfig() {
    return {
      providerName: 'Twilio Cloud Communications (Global)',
      isConfigured: this.isConfigured(),
      senderId: this.fromPhoneNumber || 'Not Set',
      mode: (process.env.SMS_ENABLED === 'true' && this.isConfigured()) ? 'live' as const : 'simulation' as const,
      dltEntityConfigured: true // Twilio handles international telecom routing
    };
  }

  async send(payload: SmsSendPayload): Promise<SmsSendResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        provider: this.name,
        status: 'FAILED',
        failureCode: 'CONFIG_MISSING',
        safeFailureReason: 'Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER) are missing in server/.env.'
      };
    }

    if (process.env.SMS_ENABLED !== 'true') {
      return {
        success: true,
        provider: this.name,
        providerMessageId: `TWILIO-SIM-${Date.now()}`,
        status: 'SKIPPED',
        safeFailureReason: 'SMS_ENABLED is false; Twilio live delivery skipped in simulation mode.'
      };
    }

    try {
      const authHeader = 'Basic ' + Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');

      const params = new URLSearchParams();
      params.append('To', payload.to); // E.164 (+91XXXXXXXXXX)
      params.append('From', this.fromPhoneNumber);
      params.append('Body', payload.message);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString(),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);
      const data: any = await response.json().catch(() => ({}));

      if (response.ok && data.sid) {
        return {
          success: true,
          provider: this.name,
          providerMessageId: data.sid,
          status: 'SENT',
          rawResponse: {
            sid: data.sid,
            status: data.status,
            to: data.to,
            dateCreated: data.date_created
          }
        };
      }

      return {
        success: false,
        provider: this.name,
        status: 'FAILED',
        failureCode: String(data.code || response.status),
        safeFailureReason: data.message || `Twilio error HTTP ${response.status}`,
        rawResponse: data
      };
    } catch (err: any) {
      const isTimeout = err.name === 'AbortError';
      return {
        success: false,
        provider: this.name,
        status: 'FAILED',
        failureCode: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
        safeFailureReason: isTimeout ? 'Twilio gateway connection timed out.' : (err.message || 'Failed to reach Twilio SMS gateway.')
      };
    }
  }
}

