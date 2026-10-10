import { SmsLocaleCatalog } from './types';

export const enTemplates: SmsLocaleCatalog = {
  // STAGE 1: REPORT RECEIVED
  REPORT_RECEIVED: {
    templateId: 'EN_STAGE_01_REPORT_RECEIVED',
    template: 'FloodRelief: Report {requestId} received successfully and is awaiting review. Keep your phone available for updates. Rescue dispatch is not yet confirmed. If in immediate danger, contact local emergency services.',
    reviewStatus: 'approved',
    reviewed: true,
    version: '1.0',
    stageNumber: 1,
    notes: 'Official citizen intake acknowledgment',
    dltTemplateId: 'DLT_TE_EN_ACK_01'
  },

  // STAGE 2: REPORT UNDER REVIEW
  REPORT_UNDER_REVIEW: {
    templateId: 'EN_STAGE_02_REPORT_UNDER_REVIEW',
    template: 'FloodRelief: Report {requestId} is being reviewed by the response team. Keep your phone available for further updates. Rescue assignment is not yet confirmed.',
    reviewStatus: 'approved',
    reviewed: true,
    version: '1.0',
    stageNumber: 2,
    notes: 'Triage assessment notice',
    dltTemplateId: 'DLT_TE_EN_REV_02'
  },

  // STAGE 3: REPORT VERIFIED
  REPORT_VERIFIED: {
    templateId: 'EN_STAGE_03_REPORT_VERIFIED',
    template: 'FloodRelief: Report {requestId} has been verified. Your request is now eligible for the next response-planning step. Keep your phone available.',
    reviewStatus: 'approved',
    reviewed: true,
    version: '1.0',
    stageNumber: 3,
    notes: 'Incident authenticity confirmed',
    dltTemplateId: 'DLT_TE_EN_VER_03'
  },

  // STAGE 4: PRIORITY UPDATED
  PRIORITY_UPDATED: {
    templateId: 'EN_STAGE_04_PRIORITY_UPDATED',
    template: 'FloodRelief: The response priority for report {requestId} has been updated. Keep your phone available for further instructions.',
    reviewStatus: 'approved',
    reviewed: true,
    version: '1.0',
    stageNumber: 4,
    notes: 'Operational escalation or adjustment',
    dltTemplateId: 'DLT_TE_EN_PRI_04'
  },

  // STAGE 5: RESCUE TEAM ASSIGNED
  RESCUE_TEAM_ASSIGNED: {
    templateId: 'EN_STAGE_05_RESCUE_TEAM_ASSIGNED',
    template: 'FloodRelief: A rescue team has been assigned to report {requestId}. Keep your phone available and follow instructions from authorized responders. Assignment does not guarantee an arrival time.',
    reviewStatus: 'approved',
    reviewed: true,
    version: '1.0',
    stageNumber: 5,
    notes: 'Rescue squad confirmed and assigned',
    dltTemplateId: 'DLT_TE_EN_ASG_05'
  },

  // STAGE 6: RESCUE TEAM ACCEPTED THE TASK
  RESCUE_TEAM_ACCEPTED: {
    templateId: 'EN_STAGE_06_RESCUE_TEAM_ACCEPTED',
    template: 'FloodRelief: The assigned rescue team has acknowledged report {requestId}. Keep your phone available for further updates.',
    reviewStatus: 'approved',
    reviewed: true,
    version: '1.0',
    stageNumber: 6,
    notes: 'Squad accepted and acknowledged mission',
    dltTemplateId: 'DLT_TE_EN_ACC_06'
  },

  // STAGE 7: RESCUE OPERATION STARTED
  RESCUE_OPERATION_STARTED: {
    templateId: 'EN_STAGE_07_RESCUE_OPERATION_STARTED',
    template: 'FloodRelief: Response operations for report {requestId} have been marked as started. Keep your phone available and follow authorized responders\' instructions.',
    reviewStatus: 'approved',
    reviewed: true,
    version: '1.0',
    stageNumber: 7,
    notes: 'Field operation started',
    dltTemplateId: 'DLT_TE_EN_OPS_07'
  },

  // STAGE 8: RESCUE TEAM EN ROUTE
  RESCUE_TEAM_EN_ROUTE: {
    templateId: 'EN_STAGE_08_RESCUE_TEAM_EN_ROUTE',
    template: 'FloodRelief: The assigned team for report {requestId} is marked as en route. Keep your phone available and follow official safety instructions.',
    reviewStatus: 'approved',
    reviewed: true,
    version: '1.0',
    stageNumber: 8,
    notes: 'Squad travelling to target coordinates',
    dltTemplateId: 'DLT_TE_EN_ROU_08'
  },

  // STAGE 9: RESCUE TEAM ARRIVED
  RESCUE_TEAM_ARRIVED: {
    templateId: 'EN_STAGE_09_RESCUE_TEAM_ARRIVED',
    template: 'FloodRelief: The assigned team has reported arrival for request {requestId}. Follow instructions from authorized responders.',
    reviewStatus: 'approved',
    reviewed: true,
    version: '1.0',
    stageNumber: 9,
    notes: 'On-scene arrival confirmed',
    dltTemplateId: 'DLT_TE_EN_ARR_09'
  },

  // STAGE 10: TEMPORARILY DELAYED
  TEMPORARILY_DELAYED: {
    templateId: 'EN_STAGE_10_TEMPORARILY_DELAYED',
    template: 'FloodRelief: There is a delay in the response for report {requestId}. Keep your phone available and contact local emergency services if you remain in immediate danger.',
    reviewStatus: 'approved',
    reviewed: true,
    version: '1.0',
    stageNumber: 10,
    notes: 'Severe weather/road block delay notice',
    dltTemplateId: 'DLT_TE_EN_DEL_10'
  },

  // STAGE 11: RESCUE OR ASSISTANCE IN PROGRESS
  ASSISTANCE_IN_PROGRESS: {
    templateId: 'EN_STAGE_11_ASSISTANCE_IN_PROGRESS',
    template: 'FloodRelief: Assistance for report {requestId} is currently marked as in progress. Follow instructions from authorized responders.',
    reviewStatus: 'approved',
    reviewed: true,
    version: '1.0',
    stageNumber: 11,
    notes: 'Active evacuation or extraction underway',
    dltTemplateId: 'DLT_TE_EN_PRG_11'
  },

  // STAGE 12: RESCUE COMPLETED / REPORT RESOLVED
  REPORT_RESOLVED: {
    templateId: 'EN_STAGE_12_REPORT_RESOLVED',
    template: 'FloodRelief: Report {requestId} has been marked as resolved. If you still need assistance, contact the response team or local emergency authority.',
    reviewStatus: 'approved',
    reviewed: true,
    version: '1.0',
    stageNumber: 12,
    notes: 'Mission completed and emergency closed',
    dltTemplateId: 'DLT_TE_EN_RES_12'
  },

  // STAGE 13: REPORT REJECTED
  REPORT_REJECTED: {
    templateId: 'EN_STAGE_13_REPORT_REJECTED',
    template: 'FloodRelief: Report {requestId} could not be accepted. If you still need urgent assistance, contact local emergency services. Use the official reporting channel to submit corrected information if appropriate.',
    reviewStatus: 'approved',
    reviewed: true,
    version: '1.0',
    stageNumber: 13,
    notes: 'Report declined with safe escalation steps',
    dltTemplateId: 'DLT_TE_EN_REJ_13'
  },

  // STAGE 14: REPORT MARKED AS DUPLICATE
  REPORT_MARKED_DUPLICATE: {
    templateId: 'EN_STAGE_14_REPORT_MARKED_DUPLICATE',
    template: 'FloodRelief: Report {requestId} was marked as a duplicate of an existing request. If your emergency is unresolved, contact the response team or local emergency authority.',
    reviewStatus: 'approved',
    reviewed: true,
    version: '1.0',
    stageNumber: 14,
    notes: 'Merged with master incident record',
    dltTemplateId: 'DLT_TE_EN_DUP_14'
  },

  // STAGE 15: REPORT CANCELLED
  REPORT_CANCELLED: {
    templateId: 'EN_STAGE_15_REPORT_CANCELLED',
    template: 'FloodRelief: Report {requestId} has been cancelled. If you still need urgent assistance, contact local emergency services.',
    reviewStatus: 'approved',
    reviewed: true,
    version: '1.0',
    stageNumber: 15,
    notes: 'Citizen or coordinator cancelled ticket',
    dltTemplateId: 'DLT_TE_EN_CAN_15'
  },

  // STAGE 16: REPORT REOPENED
  REPORT_REOPENED: {
    templateId: 'EN_STAGE_16_REPORT_REOPENED',
    template: 'FloodRelief: Report {requestId} has been reopened for further attention. Keep your phone available for updates.',
    reviewStatus: 'approved',
    reviewed: true,
    version: '1.0',
    stageNumber: 16,
    notes: 'Incident reopened after reassessment',
    dltTemplateId: 'DLT_TE_EN_REO_16'
  },

  // STAGE 17: ADDITIONAL INFORMATION REQUIRED
  ADDITIONAL_INFO_REQUIRED: {
    templateId: 'EN_STAGE_17_ADDITIONAL_INFO_REQUIRED',
    template: 'FloodRelief: More information is needed for report {requestId}. Please use the official FloodRelief contact or reporting channel to provide the requested details.',
    reviewStatus: 'approved',
    reviewed: true,
    version: '1.0',
    stageNumber: 17,
    notes: 'Request for clarification via official channel',
    dltTemplateId: 'DLT_TE_EN_INF_17'
  },

  // STAGE 18: RELIEF CAMP OR SHELTER UPDATE
  SHELTER_UPDATE: {
    templateId: 'EN_STAGE_18_SHELTER_UPDATE',
    template: 'FloodRelief: An update is available about relief facilities relevant to your request. Check the official FloodRelief channel or contact your local response authority for verified information.',
    reviewStatus: 'approved',
    reviewed: true,
    version: '1.0',
    stageNumber: 18,
    notes: 'Shelter or relief facility update',
    dltTemplateId: 'DLT_TE_EN_SHL_18'
  },

  // STAGE 19: NOTIFICATION OR REQUEST UPDATE
  REQUEST_UPDATED: {
    templateId: 'EN_STAGE_19_REQUEST_UPDATED',
    template: 'FloodRelief: An operational update has been posted for report {requestId}. Keep your phone available for further instructions.',
    reviewStatus: 'approved',
    reviewed: true,
    version: '1.0',
    stageNumber: 19,
    notes: 'General meaningful citizen notification',
    dltTemplateId: 'DLT_TE_EN_UPD_19'
  }
};
