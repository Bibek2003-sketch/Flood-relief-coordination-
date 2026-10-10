import { SupportedLanguage } from '../../models/NotificationLog';
import { SmsEventType } from '../../locales/sms';
import { SmsEncodingMetrics } from '../../utils/smsEncoding';

export interface SmsSendPayload {
  to: string; // E.164 normalized: +91XXXXXXXXXX
  message: string;
  language: SupportedLanguage;
  eventType: SmsEventType;
  requestId: string;
  idempotencyKey: string;
  metrics: SmsEncodingMetrics;
  dltTemplateId?: string;
}

export interface SmsSendResult {
  success: boolean;
  provider: string;
  providerMessageId?: string;
  status: 'SENT' | 'FAILED' | 'SKIPPED';
  safeFailureReason?: string;
  failureCode?: string;
  rawResponse?: any;
}

export interface ISmsProvider {
  readonly name: string;
  send(payload: SmsSendPayload): Promise<SmsSendResult>;
  isConfigured(): boolean;
  getPublicConfig(): {
    providerName: string;
    isConfigured: boolean;
    senderId?: string;
    mode: 'live' | 'simulation';
    dltEntityConfigured: boolean;
  };
}

