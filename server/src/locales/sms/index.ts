import { SupportedLanguage } from '../../models/NotificationLog';
import { SmsEventType, SmsLifecycleStage, SmsLocaleCatalog, SmsTemplateItem } from './types';
import { enTemplates } from './en';
import { hiTemplates } from './hi';
import { bnTemplates } from './bn';
import { brTemplates } from './br';
import { asTemplates } from './as';

export * from './types';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  script: string;
  encodingType: 'GSM-7' | 'UCS-2';
  isOfficialAssamSchedule: boolean;
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageInfo> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    script: 'Latin',
    encodingType: 'GSM-7',
    isOfficialAssamSchedule: true
  },
  as: {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    script: 'Assamese (Eastern Nagari)',
    encodingType: 'UCS-2',
    isOfficialAssamSchedule: true
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    script: 'Devanagari',
    encodingType: 'UCS-2',
    isOfficialAssamSchedule: true
  },
  bn: {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    script: 'Bengali-Assamese',
    encodingType: 'UCS-2',
    isOfficialAssamSchedule: true
  },
  br: {
    code: 'br',
    name: 'Bodo',
    nativeName: 'बड़ो / Bodo',
    script: 'Devanagari',
    encodingType: 'UCS-2',
    isOfficialAssamSchedule: true
  }
};

export const CATALOGS: Record<SupportedLanguage, SmsLocaleCatalog> = {
  en: enTemplates,
  as: asTemplates,
  hi: hiTemplates,
  bn: bnTemplates,
  br: brTemplates
};

const LEGACY_EVENT_MAP: Record<string, SmsLifecycleStage> = {
  EMERGENCY_REPORT_RECEIVED: 'REPORT_RECEIVED',
  EMERGENCY_UNDER_REVIEW: 'REPORT_UNDER_REVIEW',
  EMERGENCY_VERIFIED: 'REPORT_VERIFIED',
  EMERGENCY_RESOLVED: 'REPORT_RESOLVED',
  EMERGENCY_REJECTED: 'REPORT_REJECTED',
  EMERGENCY_MARKED_DUPLICATE: 'REPORT_MARKED_DUPLICATE'
};

export function normalizeEventType(eventType: SmsEventType): SmsLifecycleStage {
  if (eventType in LEGACY_EVENT_MAP) {
    return LEGACY_EVENT_MAP[eventType];
  }
  return eventType as SmsLifecycleStage;
}

export function getTemplateItem(
  language: SupportedLanguage,
  eventType: SmsEventType,
  strictReview: boolean = false
): { item: SmsTemplateItem; actualLanguage: SupportedLanguage; wasFallback: boolean } {
  const chosenLang = (SUPPORTED_LANGUAGES[language] ? language : 'en') as SupportedLanguage;
  const canonicalEvent = normalizeEventType(eventType);
  const catalog = CATALOGS[chosenLang] || CATALOGS.en;
  let item = catalog[canonicalEvent];

  if (!item) {
    item = CATALOGS.en[canonicalEvent] || CATALOGS.en.REPORT_RECEIVED;
    return {
      item,
      actualLanguage: 'en',
      wasFallback: true
    };
  }

  // If strict review is enabled and translation is not yet reviewed, fallback to English
  if (strictReview && !item.reviewed && chosenLang !== 'en') {
    return {
      item: CATALOGS.en[canonicalEvent],
      actualLanguage: 'en',
      wasFallback: true
    };
  }

  return {
    item,
    actualLanguage: chosenLang,
    wasFallback: chosenLang !== language
  };
}

