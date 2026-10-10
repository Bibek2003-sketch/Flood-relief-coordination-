import { ISmsProvider, SmsSendPayload, SmsSendResult } from '../smsProvider';

/**
 * MSG91 Indian SMS Gateway Adapter
 * Compliant with TRAI Distributed Ledger Technology (DLT) regulations.
 * Supports Unicode messages for Hindi, Bengali, and Bodo.
 */
export class Msg91Provider implements ISmsProvider {
  readonly name = 'msg91';

  private get authKey(): string {
    return process.env.MSG91_AUTH_KEY || process.env.SMS_API_KEY || '';
  }

  private get senderId(): string {
    return process.env.MSG91_SENDER_ID || process.env.SMS_SENDER_ID || 'FLDRLF';
  }

  private get dltEntityId(): string {
    return process.env.MSG91_DLT_PE_ID || process.env.SMS_DLT_ENTITY_ID || '';
  }

  isConfigured(): boolean {
    return Boolean(this.authKey && this.authKey.length >= 8);
  }

  getPublicConfig() {
    return {
      providerName: 'MSG91 (India DLT Certified)',
      isConfigured: this.isConfigured(),
      senderId: this.senderId,
      mode: (process.env.SMS_ENABLED === 'true' && this.isConfigured()) ? 'live' as const : 'simulation' as const,
      dltEntityConfigured: Boolean(this.dltEntityId)
    };
  }

  async send(payload: SmsSendPayload): Promise<SmsSendResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        provider: this.name,
        status: 'FAILED',
        failureCode: 'CONFIG_MISSING',
        safeFailureReason: 'MSG91 authentication key is not configured in server environment.'
      };
    }

    if (process.env.SMS_ENABLED !== 'true') {
      return {
        success: true,
        provider: this.name,
        providerMessageId: `MSG91-SIM-${Date.now()}`,
        status: 'SKIPPED',
        safeFailureReason: 'SMS_ENABLED is false; MSG91 live delivery skipped.'
      };
    }

    try {
      // MSG91 Send SMS v5 endpoint
      // Clean recipient phone (+919864012345 -> 919864012345)
      const recipientDigits = payload.to.replace(/^\+/, '');

      const requestBody: any = {
        sender: this.senderId,
        route: '4', // Transactional route
        country: '91',
        sms: [
          {
            message: payload.message,
            to: [recipientDigits]
          }
        ]
      };

      if (payload.metrics.encoding === 'UCS-2') {
        requestBody.unicode = '1';
      }

      if (this.dltEntityId) {
        requestBody.DLT_TE_ID = payload.dltTemplateId;
        requestBody.DLT_PE_ID = this.dltEntityId;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const response = await fetch('https://api.msg91.com/api/v2/sendsms', {
        method: 'POST',
        headers: {
          'authkey': this.authKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseData: any = await response.json().catch(() => ({}));

      if (response.ok && (responseData.type === 'success' || responseData.status === 'success' || responseData.message_id)) {
        return {
          success: true,
          provider: this.name,
          providerMessageId: responseData.message || responseData.message_id || `MSG91-${Date.now()}`,
          status: 'SENT',
          rawResponse: responseData
        };
      }

      return {
        success: false,
        provider: this.name,
        status: 'FAILED',
        failureCode: String(response.status),
        safeFailureReason: responseData.message || 'MSG91 rejected the dispatch request.',
        rawResponse: responseData
      };
    } catch (err: any) {
      const isTimeout = err.name === 'AbortError';
      return {
        success: false,
        provider: this.name,
        status: 'FAILED',
        failureCode: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
        safeFailureReason: isTimeout ? 'SMS gateway connection timed out.' : 'Failed to reach SMS gateway.'
      };
    }
  }
}

