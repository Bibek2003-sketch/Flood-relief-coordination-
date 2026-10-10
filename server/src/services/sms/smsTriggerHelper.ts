import smsService from './smsService';
import { SmsEventType } from '../../locales/sms';
import { SupportedLanguage } from '../../models/NotificationLog';

/**
 * Dispatches an event-driven SMS notification to the citizen who filed the emergency report.
 * Guaranteed non-blocking: Never throws or halts the caller transaction if SMS sending encounters an error.
 */
export async function triggerEmergencySms(
  emergency: any,
  eventType: SmsEventType,
  extraVars: Record<string, string | number | undefined> = {}
): Promise<void> {
  if (!emergency) return;

  const contactPhone = emergency.contact || emergency.phone;
  if (!contactPhone || typeof contactPhone !== 'string') {
    return;
  }

  // Do not attempt to send SMS if the contact field is an email address
  if (contactPhone.includes('@')) {
    return;
  }

  const requestId = emergency.requestID || emergency.requestId || emergency.id || String(emergency._id);
  const language = (emergency.preferredLanguage || 'en') as SupportedLanguage;

  try {
    // Non-blocking async execution
    smsService.dispatch({
      to: contactPhone,
      emergencyId: emergency._id,
      requestId,
      eventType,
      language,
      variables: {
        ...extraVars,
        requestId,
        location: emergency.location
      }
    }).catch(err => {
      console.error(`[SMS-TRIGGER] Background error dispatching ${eventType} for ${requestId}:`, err.message);
    });
  } catch (err: any) {
    console.error(`[SMS-TRIGGER] Synchronous catch dispatching ${eventType}:`, err.message);
  }
}

