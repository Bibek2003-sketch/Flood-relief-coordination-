import mongoose from 'mongoose';
import NotificationLog, { SupportedLanguage, NotificationStatus } from '../../models/NotificationLog';
import { normalizeIndianPhoneNumber, maskPhoneNumber } from '../../utils/phoneNumber';
import { renderSms } from './smsTemplateService';
import { ISmsProvider, SmsSendResult } from './smsProvider';
import { MockSmsProvider } from './providers/mockProvider';
import { Msg91Provider } from './providers/msg91Provider';
import { ExotelProvider } from './providers/exotelProvider';
import { TwilioProvider } from './providers/twilioProvider';
import { SmsEventType } from '../../locales/sms';

export interface DispatchSmsOptions {
  to: string; // Citizen phone number
  emergencyId: any;
  requestId: string;
  eventType: SmsEventType;
  language?: SupportedLanguage;
  variables?: Record<string, string | number | undefined>;
  idempotencySuffix?: string;
}

export interface DispatchSmsResult {
  sent: boolean;
  status: NotificationStatus;
  logId?: string;
  requestId: string;
  recipientMasked: string;
  language: SupportedLanguage;
  characterCount: number;
  segmentCount: number;
  encoding: 'GSM-7' | 'UCS-2';
  provider: string;
  providerMessageId?: string;
  skippedReason?: string;
  error?: string;
}

class SmsService {
  private providers: Map<string, ISmsProvider> = new Map();

  constructor() {
    this.registerProvider(new MockSmsProvider());
    this.registerProvider(new Msg91Provider());
    this.registerProvider(new ExotelProvider());
    this.registerProvider(new TwilioProvider());
  }

  public registerProvider(provider: ISmsProvider): void {
    this.providers.set(provider.name.toLowerCase(), provider);
  }

  public getActiveProvider(): ISmsProvider {
    const configuredName = (process.env.SMS_PROVIDER || 'mock').toLowerCase();
    const provider = this.providers.get(configuredName);
    if (provider) return provider;
    return this.providers.get('mock')!;
  }

  /**
   * Dispatches an SMS notification to a citizen for an emergency lifecycle event.
   * Ensures idempotency, template localization, phone normalization, and audit logging.
   */
  public async dispatch(options: DispatchSmsOptions): Promise<DispatchSmsResult> {
    const {
      to,
      emergencyId,
      requestId,
      eventType,
      language = 'en',
      variables = {},
      idempotencySuffix = ''
    } = options;

    // 1. Validate and normalize recipient phone number
    const phoneValidation = normalizeIndianPhoneNumber(to);
    if (!phoneValidation.isValid) {
      console.warn(`[SMS] Skipped dispatch for ${requestId} (${eventType}): Invalid phone number "${to}".`);
      return {
        sent: false,
        status: 'FAILED',
        requestId,
        recipientMasked: maskPhoneNumber(to),
        language,
        characterCount: 0,
        segmentCount: 0,
        encoding: 'GSM-7',
        provider: this.getActiveProvider().name,
        error: phoneValidation.error || 'Invalid phone number'
      };
    }

    // 2. Generate canonical idempotency key
    const idempotencyKey = `${requestId}_${eventType}${idempotencySuffix ? `_${idempotencySuffix}` : ''}`;

    // 3. Render localized message template
    const templateVars = {
      requestId,
      ...variables
    };
    const rendered = renderSms(eventType, language, templateVars);

    // 4. Check for existing notification with this idempotency key (if database is connected)
    const isDbConnected = mongoose.connection.readyState === 1;
    let logDoc: any = null;

    if (isDbConnected) {
      logDoc = await NotificationLog.findOne({ idempotencyKey });
      if (logDoc && ['SENT', 'DELIVERED', 'PROCESSING'].includes(logDoc.status)) {
        console.log(`[SMS] Idempotency match: ${idempotencyKey} already ${logDoc.status}. Skipping duplicate dispatch.`);
        return {
          sent: logDoc.status === 'SENT' || logDoc.status === 'DELIVERED',
          status: logDoc.status,
          logId: String(logDoc._id),
          requestId,
          recipientMasked: logDoc.recipientMasked,
          language: logDoc.preferredLanguage,
          characterCount: logDoc.characterCount,
          segmentCount: logDoc.segmentCount,
          encoding: logDoc.encoding,
          provider: logDoc.provider,
          providerMessageId: logDoc.providerMessageId,
          skippedReason: 'Duplicate dispatch prevented by idempotency guard.'
        };
      }
    }

    const provider = this.getActiveProvider();

    // 5. Create or update PENDING audit log entry
    if (isDbConnected) {
      if (!logDoc) {
        logDoc = await NotificationLog.create({
          emergencyId,
          requestId,
          eventType,
          channel: 'SMS',
          preferredLanguage: rendered.language,
          recipientMasked: phoneValidation.masked,
          recipientPhoneHash: phoneValidation.hash,
          provider: provider.name,
          templateId: rendered.templateId,
          templateVersion: rendered.version,
          reviewStatus: rendered.reviewStatus,
          idempotencyKey,
          status: 'PROCESSING',
          encoding: rendered.metrics.encoding,
          characterCount: rendered.metrics.characterCount,
          segmentCount: rendered.metrics.segmentCount,
          messagePreview: rendered.message,
          attemptCount: 1,
          lastAttemptAt: new Date()
        });
      } else {
        logDoc.status = 'PROCESSING';
        logDoc.templateId = rendered.templateId;
        logDoc.templateVersion = rendered.version;
        logDoc.reviewStatus = rendered.reviewStatus;
        logDoc.attemptCount += 1;
        logDoc.lastAttemptAt = new Date();
        await logDoc.save();
      }
    }

    // 6. Invoke active SMS provider adapter
    let sendResult: SmsSendResult;
    try {
      sendResult = await provider.send({
        to: phoneValidation.normalized,
        message: rendered.message,
        language: rendered.language,
        eventType,
        requestId,
        idempotencyKey,
        metrics: rendered.metrics,
        dltTemplateId: rendered.dltTemplateId
      });
    } catch (sendErr: any) {
      sendResult = {
        success: false,
        provider: provider.name,
        status: 'FAILED',
        failureCode: 'UNHANDLED_EXCEPTION',
        safeFailureReason: sendErr.message || 'SMS provider execution failed.'
      };
    }

    // 7. Update NotificationLog with provider outcome (if DB is active)
    if (logDoc) {
      logDoc.status = sendResult.status;
      logDoc.providerMessageId = sendResult.providerMessageId;
      logDoc.failureCode = sendResult.failureCode;
      logDoc.safeFailureReason = sendResult.safeFailureReason;
      logDoc.rawResponse = sendResult.rawResponse;
      if (sendResult.status === 'SENT') {
        logDoc.sentAt = new Date();
      }
      await logDoc.save();
    }

    return {
      sent: sendResult.status === 'SENT',
      status: sendResult.status,
      logId: logDoc ? String(logDoc._id) : undefined,
      requestId,
      recipientMasked: phoneValidation.masked,
      language: rendered.language,
      characterCount: rendered.metrics.characterCount,
      segmentCount: rendered.metrics.segmentCount,
      encoding: rendered.metrics.encoding,
      provider: provider.name,
      providerMessageId: sendResult.providerMessageId,
      skippedReason: sendResult.status === 'SKIPPED' ? sendResult.safeFailureReason : undefined,
      error: sendResult.status === 'FAILED' ? sendResult.safeFailureReason : undefined
    };
  }

  /**
   * Retrieves active provider status and public configuration.
   */
  public getStatusInfo() {
    const active = this.getActiveProvider();
    return {
      enabled: process.env.SMS_ENABLED === 'true',
      activeProvider: active.name,
      ...active.getPublicConfig()
    };
  }
}

export const smsService = new SmsService();
export default smsService;
