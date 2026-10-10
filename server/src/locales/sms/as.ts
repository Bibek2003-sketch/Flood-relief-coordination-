import { SmsLocaleCatalog } from './types';

export const asTemplates: SmsLocaleCatalog = {
  // STAGE 1: REPORT RECEIVED
  REPORT_RECEIVED: {
    templateId: 'AS_STAGE_01_REPORT_RECEIVED',
    template: 'বান সাহাৰ্য্য (FloodRelief): আপোনাৰ জৰুৰী প্ৰতিবেদন {requestId} গ্ৰহণ কৰা হৈছে আৰু পৰ্যালোচনাৰ অপেক্ষাত আছে। ফোনটো খোলা ৰাখক। উদ্ধাৰ এতিয়াও নিশ্চিত হোৱা নাই। চৰম বিপদত ১১২ নম্বৰত কল কৰক।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 1,
    notes: 'Assamese intake acknowledgment (Human review required)',
    dltTemplateId: 'DLT_TE_AS_ACK_01'
  },

  // STAGE 2: REPORT UNDER REVIEW
  REPORT_UNDER_REVIEW: {
    templateId: 'AS_STAGE_02_REPORT_UNDER_REVIEW',
    template: 'বান সাহাৰ্য্য: আপোনাৰ প্ৰতিবেদন {requestId} উদ্ধাৰ নিয়ন্ত্ৰণ কোঠাই পৰ্যালোচনা কৰি আছে। ফোন সক্ৰিয় ৰাখক। উদ্ধাৰকাৰী দলৰ নিশ্চিতকৰণ এতিয়াও হোৱা নাই।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 2,
    notes: 'Assamese review status (Human review required)',
    dltTemplateId: 'DLT_TE_AS_REV_02'
  },

  // STAGE 3: REPORT VERIFIED
  REPORT_VERIFIED: {
    templateId: 'AS_STAGE_03_REPORT_VERIFIED',
    template: 'বান সাহাৰ্য্য: আপোনাৰ প্ৰতিবেদন {requestId} নিশ্চিত কৰা হৈছে। পৰৱৰ্তী পদক্ষেপৰ বাবে আপোনাৰ অনুৰোধ অন্তৰ্ভুক্ত কৰা হৈছে। ফোন কাষতে ৰাখক।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 3,
    notes: 'Assamese verified notice (Human review required)',
    dltTemplateId: 'DLT_TE_AS_VER_03'
  },

  // STAGE 4: PRIORITY UPDATED
  PRIORITY_UPDATED: {
    templateId: 'AS_STAGE_04_PRIORITY_UPDATED',
    template: 'বান সাহাৰ্য্য: অনুৰোধ {requestId}ৰ অগ্ৰাধিকাৰ পৰ্যায় সলনি কৰা হৈছে। পৰৱৰ্তী নিৰ্দেশনাৰ বাবে ফোন সক্ৰিয় ৰাখক।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 4,
    notes: 'Assamese priority updated (Human review required)',
    dltTemplateId: 'DLT_TE_AS_PRI_04'
  },

  // STAGE 5: RESCUE TEAM ASSIGNED
  RESCUE_TEAM_ASSIGNED: {
    templateId: 'AS_STAGE_05_RESCUE_TEAM_ASSIGNED',
    template: 'বান সাহাৰ্য্য: অনুৰোধ {requestId}ৰ বাবে এটা উদ্ধাৰকাৰী দল নিয়োগ কৰা হৈছে। ফোন খোলা ৰাখক আৰু কৰ্তব্যৰত কৰ্মীৰ নিৰ্দেশ মানি চলক। নিয়োগে উপস্থিত হোৱাৰ সময় নিশ্চিত নকৰে।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 5,
    notes: 'Assamese team assigned (Human review required)',
    dltTemplateId: 'DLT_TE_AS_ASG_05'
  },

  // STAGE 6: RESCUE TEAM ACCEPTED THE TASK
  RESCUE_TEAM_ACCEPTED: {
    templateId: 'AS_STAGE_06_RESCUE_TEAM_ACCEPTED',
    template: 'বান সাহাৰ্য্য: নিযুক্ত উদ্ধাৰকাৰী দলে অনুৰোধ {requestId} গ্ৰহণ কৰিছে। পৰৱৰ্তী খবৰৰ বাবে ফোন উপলব্ধ ৰাখক।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 6,
    notes: 'Assamese team accepted task (Human review required)',
    dltTemplateId: 'DLT_TE_AS_ACC_06'
  },

  // STAGE 7: RESCUE OPERATION STARTED
  RESCUE_OPERATION_STARTED: {
    templateId: 'AS_STAGE_07_RESCUE_OPERATION_STARTED',
    template: 'বান সাহাৰ্য্য: অনুৰোধ {requestId}ৰ উদ্ধাৰ কাৰ্য আৰম্ভ হৈছে। ফোন সক্ৰিয় ৰাখক আৰু সুৰক্ষা নিৰ্দেশনা মানি চলক।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 7,
    notes: 'Assamese rescue operation started (Human review required)',
    dltTemplateId: 'DLT_TE_AS_OPS_07'
  },

  // STAGE 8: RESCUE TEAM EN ROUTE
  RESCUE_TEAM_EN_ROUTE: {
    templateId: 'AS_STAGE_08_RESCUE_TEAM_EN_ROUTE',
    template: 'বান সাহাৰ্য্য: অনুৰোধ {requestId}ৰ বাবে নিযুক্ত দল যাত্ৰাপথত আছে। ফোন কাষতে ৰাখক আৰু সুৰক্ষা নিৰ্দেশনা পালন কৰক।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 8,
    notes: 'Assamese team en route (Human review required)',
    dltTemplateId: 'DLT_TE_AS_ROU_08'
  },

  // STAGE 9: RESCUE TEAM ARRIVED
  RESCUE_TEAM_ARRIVED: {
    templateId: 'AS_STAGE_09_RESCUE_TEAM_ARRIVED',
    template: 'বান সাহাৰ্য্য: নিযুক্ত দল অনুৰোধ {requestId}ৰ নিৰ্দিষ্ট স্থানত উপস্থিত হৈছে। উদ্ধাৰকৰ্মীৰ নিৰ্দেশনা অনুসৰণ কৰক।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 9,
    notes: 'Assamese team arrived on-site (Human review required)',
    dltTemplateId: 'DLT_TE_AS_ARR_09'
  },

  // STAGE 10: TEMPORARILY DELAYED
  TEMPORARILY_DELAYED: {
    templateId: 'AS_STAGE_10_TEMPORARILY_DELAYED',
    template: 'বান সাহাৰ্য্য: অনুৰোধ {requestId}ৰ উদ্ধাৰ কাৰ্যত কিছু পলম ঘটিছে। ফোন খোলা ৰাখক আৰু চৰম বিপদত ১১২ নম্বৰত কল কৰক।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 10,
    notes: 'Assamese delay notice (Human review required)',
    dltTemplateId: 'DLT_TE_AS_DEL_10'
  },

  // STAGE 11: RESCUE OR ASSISTANCE IN PROGRESS
  ASSISTANCE_IN_PROGRESS: {
    templateId: 'AS_STAGE_11_ASSISTANCE_IN_PROGRESS',
    template: 'বান সাহাৰ্য্য: অনুৰোধ {requestId}ৰ সাহায্য অভিযান চলি আছে। উদ্ধাৰকৰ্মীৰ নিৰ্দেশনা মানি চলক।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 11,
    notes: 'Assamese assistance in progress (Human review required)',
    dltTemplateId: 'DLT_TE_AS_PRG_11'
  },

  // STAGE 12: RESCUE COMPLETED / REPORT RESOLVED
  REPORT_RESOLVED: {
    templateId: 'AS_STAGE_12_REPORT_RESOLVED',
    template: 'বান সাহাৰ্য্য: অনুৰোধ {requestId} সম্পন্ন / সুৰক্ষিত বুলি চিহ্নিত কৰা হৈছে। সহায়ৰ প্ৰয়োজন থাকিলে নিয়ন্ত্ৰণ কোঠাত যোগাযোগ কৰক।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 12,
    notes: 'Assamese report resolved (Human review required)',
    dltTemplateId: 'DLT_TE_AS_RES_12'
  },

  // STAGE 13: REPORT REJECTED
  REPORT_REJECTED: {
    templateId: 'AS_STAGE_13_REPORT_REJECTED',
    template: 'বান সাহাৰ্য্য: অনুৰোধ {requestId} গ্ৰহণ কৰিব পৰা নগল। তাৎক্ষণিক বিপদত ১১২ নম্বৰত যোগাযোগ কৰক। শুদ্ধ তথ্যৰ বাবে চৰকাৰী পৰ্টেল ব্যৱহাৰ কৰক।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 13,
    notes: 'Assamese report rejected (Human review required)',
    dltTemplateId: 'DLT_TE_AS_REJ_13'
  },

  // STAGE 14: REPORT MARKED AS DUPLICATE
  REPORT_MARKED_DUPLICATE: {
    templateId: 'AS_STAGE_14_REPORT_MARKED_DUPLICATE',
    template: 'বান সাহাৰ্য্য: অনুৰোধ {requestId} পূৰ্বৰ এটা ৰেকৰ্ডৰ প্ৰতিলিপি হিচাপে চিনাক্ত কৰা হৈছে। জৰুৰী সহায়ৰ প্ৰয়োজন থাকিলে সহায়ক দলৰ লগত যোগাযোগ কৰক।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 14,
    notes: 'Assamese duplicate marked (Human review required)',
    dltTemplateId: 'DLT_TE_AS_DUP_14'
  },

  // STAGE 15: REPORT CANCELLED
  REPORT_CANCELLED: {
    templateId: 'AS_STAGE_15_REPORT_CANCELLED',
    template: 'বান সাহাৰ্য্য: অনুৰোধ {requestId} বাতিল কৰা হৈছে। জৰুৰী বিপদত স্থানীয় উদ্ধাৰ সেৱাৰ লগত যোগাযোগ কৰক।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 15,
    notes: 'Assamese report cancelled (Human review required)',
    dltTemplateId: 'DLT_TE_AS_CAN_15'
  },

  // STAGE 16: REPORT REOPENED
  REPORT_REOPENED: {
    templateId: 'AS_STAGE_16_REPORT_REOPENED',
    template: 'বান সাহাৰ্য্য: অনুৰোধ {requestId} পুনৰ পৰ্যালোচনাৰ বাবে খোলা হৈছে। পৰৱৰ্তী খবৰৰ বাবে ফোন সক্ৰিয় ৰাখক।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 16,
    notes: 'Assamese report reopened (Human review required)',
    dltTemplateId: 'DLT_TE_AS_REO_16'
  },

  // STAGE 17: ADDITIONAL INFORMATION REQUIRED
  ADDITIONAL_INFO_REQUIRED: {
    templateId: 'AS_STAGE_17_ADDITIONAL_INFO_REQUIRED',
    template: 'বান সাহাৰ্য্য: অনুৰোধ {requestId}ৰ বাবে অতিৰিক্ত তথ্যৰ প্ৰয়োজন। অনুগ্ৰহ কৰি চৰকাৰী FloodRelief পৰ্টেল যোগে সবিশেষ জনাব।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 17,
    notes: 'Assamese more info required (Human review required)',
    dltTemplateId: 'DLT_TE_AS_INF_17'
  },

  // STAGE 18: RELIEF CAMP OR SHELTER UPDATE
  SHELTER_UPDATE: {
    templateId: 'AS_STAGE_18_SHELTER_UPDATE',
    template: 'বান সাহাৰ্য্য: আপোনাৰ স্থানৰ সমীপৱৰ্তী সাহায্য শিবিৰৰ তথ্য উপলব্ধ। সবিশেষ জানিবলৈ স্থানীয় প্ৰশাসনৰ লগত যোগাযোগ কৰক।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 18,
    notes: 'Assamese shelter update (Human review required)',
    dltTemplateId: 'DLT_TE_AS_SHL_18'
  },

  // STAGE 19: NOTIFICATION OR REQUEST UPDATE
  REQUEST_UPDATED: {
    templateId: 'AS_STAGE_19_REQUEST_UPDATED',
    template: 'বান সাহাৰ্য্য: অনুৰোধ {requestId}ৰ বাবে এটা নতুন তথ্য প্ৰকাশ কৰা হৈছে। পৰৱৰ্তী নিৰ্দেশনাৰ বাবে ফোন সক্ৰিয় ৰাখক।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 19,
    notes: 'Assamese general request updated (Human review required)',
    dltTemplateId: 'DLT_TE_AS_UPD_19'
  }
};
