import { ISmsProvider, SmsSendPayload, SmsSendResult } from '../smsProvider';

/**
 * Exotel Indian SMS Gateway Adapter
 * Uses Exotel's transactional SMS REST API.
 */
export class ExotelProvider implements ISmsProvider {
  readonly name = 'exotel';

  private get accountSid(): string {
    return process.env.EXOTEL_ACCOUNT_SID || '';
  }

  private get apiKey(): string {
    return process.env.EXOTEL_API_KEY || process.env.SMS_API_KEY || '';
  }

  private get apiToken(): string {
    return process.env.EXOTEL_API_TOKEN || '';
  }

  private get senderId(): string {
    return process.env.EXOTEL_SENDER_ID || process.env.SMS_SENDER_ID || 'FLDRLF';
  }

  isConfigured(): boolean {
    return Boolean(this.accountSid && this.apiKey && this.apiToken);
  }

  getPublicConfig() {
    return {
      providerName: 'Exotel Communications (India)',
      isConfigured: this.isConfigured(),
      senderId: this.senderId,
      mode: (process.env.SMS_ENABLED === 'true' && this.isConfigured()) ? 'live' as const : 'simulation' as const,
      dltEntityConfigured: Boolean(process.env.SMS_DLT_ENTITY_ID)
    };
  }

  async send(payload: SmsSendPayload): Promise<SmsSendResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        provider: this.name,
        status: 'FAILED',
        failureCode: 'CONFIG_MISSING',
        safeFailureReason: 'Exotel API credentials are not configured in environment.'
      };
    }

    if (process.env.SMS_ENABLED !== 'true') {
      return {
        success: true,
        provider: this.name,
        providerMessageId: `EXOTEL-SIM-${Date.now()}`,
        status: 'SKIPPED',
        safeFailureReason: 'SMS_ENABLED is false; Exotel live delivery skipped.'
      };
    }

    try {
      const recipientDigits = payload.to.replace(/^\+/, '');
      const authHeader = 'Basic ' + Buffer.from(`${this.apiKey}:${this.apiToken}`).toString('base64');

      const params = new URLSearchParams();
      params.append('From', this.senderId);
      params.append('To', recipientDigits);
      params.append('Body', payload.message);
      if (payload.dltTemplateId) {
        params.append('DltTemplateId', payload.dltTemplateId);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(
        `https://api.exotel.com/v1/Accounts/${this.accountSid}/Sms/send.json`,
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

      if (response.ok && (data.SMSMessage || data.Sid)) {
        const msgId = data.SMSMessage?.Sid || data.Sid || `EXOTEL-${Date.now()}`;
        return {
          success: true,
          provider: this.name,
          providerMessageId: msgId,
          status: 'SENT',
          rawResponse: data
        };
      }

      return {
        success: false,
        provider: this.name,
        status: 'FAILED',
        failureCode: String(response.status),
        safeFailureReason: data.RestException?.Message || 'Exotel rejected dispatch request.',
        rawResponse: data
      };
    } catch (err: any) {
      const isTimeout = err.name === 'AbortError';
      return {
        success: false,
        provider: this.name,
        status: 'FAILED',
        failureCode: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
        safeFailureReason: isTimeout ? 'Exotel gateway connection timed out.' : 'Failed to reach Exotel SMS service.'
      };
    }
  }
}

