export type SmsLifecycleStage =
  | 'REPORT_RECEIVED'              // Stage 1: Accepted by backend
  | 'REPORT_UNDER_REVIEW'          // Stage 2: Operations reviewing request
  | 'REPORT_VERIFIED'              // Stage 3: Confirmed valid emergency
  | 'PRIORITY_UPDATED'             // Stage 4: Priority level meaningfully updated
  | 'RESCUE_TEAM_ASSIGNED'         // Stage 5: Squad confirmed and assigned
  | 'RESCUE_TEAM_ACCEPTED'         // Stage 6: Squad acknowledges mission
  | 'RESCUE_OPERATION_STARTED'     // Stage 7: Operation officially begun
  | 'RESCUE_TEAM_EN_ROUTE'         // Stage 8: Unit travelling to location
  | 'RESCUE_TEAM_ARRIVED'          // Stage 9: Unit arrived on-site
  | 'TEMPORARILY_DELAYED'          // Stage 10: Operational delay confirmed
  | 'ASSISTANCE_IN_PROGRESS'       // Stage 11: Active extraction/aid in progress
  | 'REPORT_RESOLVED'              // Stage 12: Mission completed & resolved
  | 'REPORT_REJECTED'              // Stage 13: Report could not be accepted
  | 'REPORT_MARKED_DUPLICATE'      // Stage 14: Linked to existing master report
  | 'REPORT_CANCELLED'             // Stage 15: Valid cancellation persisted
  | 'REPORT_REOPENED'              // Stage 16: Case reopened for further action
  | 'ADDITIONAL_INFO_REQUIRED'     // Stage 17: Official channel info request
  | 'SHELTER_UPDATE'               // Stage 18: Verified shelter info update
  | 'REQUEST_UPDATED';             // Stage 19: Meaningful citizen update

// Backward-compatible alias types for existing code
export type LegacySmsEventType =
  | 'EMERGENCY_REPORT_RECEIVED'
  | 'EMERGENCY_UNDER_REVIEW'
  | 'EMERGENCY_VERIFIED'
  | 'EMERGENCY_RESOLVED'
  | 'EMERGENCY_REJECTED'
  | 'EMERGENCY_MARKED_DUPLICATE';

export type SmsEventType = SmsLifecycleStage | LegacySmsEventType;

export type TranslationReviewStatus = 'approved' | 'needs_review';

export interface SmsTemplateItem {
  templateId: string;
  template: string;
  reviewStatus: TranslationReviewStatus;
  reviewed: boolean; // true only if human review has been verified
  version: string;
  stageNumber: number;
  notes?: string;
  dltTemplateId?: string; // Approved DLT Content Template ID (India TRAI)
  requiredVariables?: string[];
}

export type SmsLocaleCatalog = Record<SmsLifecycleStage, SmsTemplateItem>;
