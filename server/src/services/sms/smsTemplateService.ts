import { SupportedLanguage } from '../../models/NotificationLog';
import { calculateSmsSegments, SmsEncodingMetrics } from '../../utils/smsEncoding';
import {
  SmsEventType,
  getTemplateItem,
  CATALOGS,
  SUPPORTED_LANGUAGES,
  LanguageInfo
} from '../../locales/sms';

export interface RenderedSms {
  message: string;
  language: SupportedLanguage;
  requestedLanguage: SupportedLanguage;
  wasFallback: boolean;
  isReviewed: boolean;
  reviewStatus: 'approved' | 'needs_review';
  templateId: string;
  version: string;
  stageNumber: number;
  metrics: SmsEncodingMetrics;
  dltTemplateId?: string;
  placeholdersUsed: Record<string, string>;
}

/**
 * Sanitizes template placeholder values to prevent CRLF injection attacks
 * or SMS header injection that could split messages unexpectedly.
 */
function sanitizePlaceholderValue(value: string | number | undefined): string {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/[\r\n\t]/g, ' ')
    .trim();
}

/**
 * Interpolates placeholders like `{requestId}` into message template text.
 */
export function interpolateTemplate(
  rawTemplate: string,
  variables: Record<string, string | number | undefined>
): string {
  return rawTemplate.replace(/\{(\w+)\}/g, (match, key) => {
    if (key in variables) {
      return sanitizePlaceholderValue(variables[key]);
    }
    return match; // Keep unresolved placeholder intact for inspection
  });
}

/**
 * Renders an SMS message for a specific event and citizen language preference.
 */
export function renderSms(
  eventType: SmsEventType,
  language: SupportedLanguage = 'en',
  variables: Record<string, string | number | undefined> = {},
  options: { strictReview?: boolean } = {}
): RenderedSms {
  // Validate language, fallback to 'en'
  const isLanguageSupported = Boolean(SUPPORTED_LANGUAGES[language]);
  const targetLanguage: SupportedLanguage = isLanguageSupported ? language : 'en';

  const { item, actualLanguage, wasFallback: catalogFallback } = getTemplateItem(
    targetLanguage,
    eventType,
    options.strictReview ?? false
  );

  const wasFallback = !isLanguageSupported || catalogFallback;

  const message = interpolateTemplate(item.template, variables);
  const metrics = calculateSmsSegments(message);

  const sanitizedVars: Record<string, string> = {};
  for (const [k, v] of Object.entries(variables)) {
    sanitizedVars[k] = sanitizePlaceholderValue(v);
  }

  return {
    message,
    language: actualLanguage,
    requestedLanguage: language,
    wasFallback,
    isReviewed: item.reviewed,
    reviewStatus: item.reviewStatus,
    templateId: item.templateId,
    version: item.version,
    stageNumber: item.stageNumber,
    metrics,
    dltTemplateId: item.dltTemplateId,
    placeholdersUsed: sanitizedVars
  };
}

/**
 * Returns complete catalog of all templates across all supported languages
 * with segment calculations and review statuses for Admin inspection.
 */
export function getFullTemplateCatalog(sampleRequestId = 'FLD-2026-10492') {
  const stages: SmsEventType[] = [
    'REPORT_RECEIVED',
    'REPORT_UNDER_REVIEW',
    'REPORT_VERIFIED',
    'PRIORITY_UPDATED',
    'RESCUE_TEAM_ASSIGNED',
    'RESCUE_TEAM_ACCEPTED',
    'RESCUE_OPERATION_STARTED',
    'RESCUE_TEAM_EN_ROUTE',
    'RESCUE_TEAM_ARRIVED',
    'TEMPORARILY_DELAYED',
    'ASSISTANCE_IN_PROGRESS',
    'REPORT_RESOLVED',
    'REPORT_REJECTED',
    'REPORT_MARKED_DUPLICATE',
    'REPORT_CANCELLED',
    'REPORT_REOPENED',
    'ADDITIONAL_INFO_REQUIRED',
    'SHELTER_UPDATE',
    'REQUEST_UPDATED'
  ];

  const languages = Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[];

  return stages.map(eventType => {
    const translations = languages.map(lang => {
      const rendered = renderSms(eventType, lang, {
        requestId: sampleRequestId,
        teamName: 'Bravo NDRF Unit',
        location: 'Guwahati Sector 3',
        contact: '1070',
        eta: '25 mins',
        helpline: '112',
        reason: 'Duplicate location entry'
      });

      return {
        language: lang,
        languageInfo: SUPPORTED_LANGUAGES[lang],
        text: rendered.message,
        isReviewed: rendered.isReviewed,
        reviewStatus: rendered.reviewStatus,
        templateId: rendered.templateId,
        version: rendered.version,
        stageNumber: rendered.stageNumber,
        metrics: rendered.metrics,
        dltTemplateId: rendered.dltTemplateId
      };
    });

    return {
      eventType,
      translations
    };
  });
}
