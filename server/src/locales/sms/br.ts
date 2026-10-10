import { SmsLocaleCatalog } from './types';

export const brTemplates: SmsLocaleCatalog = {
  // STAGE 1: REPORT RECEIVED
  REPORT_RECEIVED: {
    templateId: 'BR_STAGE_01_REPORT_RECEIVED',
    template: 'दैबाना हेफाजाब (FloodRelief): नोंथांनि खौरां {requestId} मोननाय जाबाय आरो नायबिजिरनायनि थाखाय दं। नोँनि फोनखौ अनलाइन लाखि। स्लायनाय दोलो थिसनाया एबाबो थि जायाखै। गोख्रों खैफोदाव जायगानि थाखाय आपात्कालिन अनजिमाजों फोनांजाब खालाम।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 1,
    notes: 'Bodo Devanagari intake acknowledgment (Native field review required)',
    dltTemplateId: 'DLT_TE_BR_ACK_01'
  },

  // STAGE 2: REPORT UNDER REVIEW
  REPORT_UNDER_REVIEW: {
    templateId: 'BR_STAGE_02_REPORT_UNDER_REVIEW',
    template: 'दैबाना हेफाजाब: नोंथांनि खौरां {requestId} खौ नायबिजिरगासिनो दं। फोनखौ सामलायना लाखि। स्लायनाय दोलो थिसनाय जायाखै।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 2,
    notes: 'Bodo Devanagari review status (Native field review required)',
    dltTemplateId: 'DLT_TE_BR_REV_02'
  },

  // STAGE 3: REPORT VERIFIED
  REPORT_VERIFIED: {
    templateId: 'BR_STAGE_03_REPORT_VERIFIED',
    template: 'दैबाना हेफाजाब: नोंथांनि खौरां {requestId} खौ थि खालामनाय जाबाय। दा नोंथांनि दाबिआ उननि राहा लानो थाखाय थि जाबाय। फोनखौ खाथियाव लाखि।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 3,
    notes: 'Bodo Devanagari verified notice (Native field review required)',
    dltTemplateId: 'DLT_TE_BR_VER_03'
  },

  // STAGE 4: PRIORITY UPDATED
  PRIORITY_UPDATED: {
    templateId: 'BR_STAGE_04_PRIORITY_UPDATED',
    template: 'दैबाना हेफाजाब: खौरां {requestId} नि गोनांथार थाखोआ सोलायनाय जाबाय। उननि बिथोनफोरनि थाखाय फोनखौ साखा-फाखा लाखि।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 4,
    notes: 'Bodo Devanagari priority updated (Native field review required)',
    dltTemplateId: 'DLT_TE_BR_PRI_04'
  },

  // STAGE 5: RESCUE TEAM ASSIGNED
  RESCUE_TEAM_ASSIGNED: {
    templateId: 'BR_STAGE_05_RESCUE_TEAM_ASSIGNED',
    template: 'दैबाना हेफाजाब: खौरां {requestId} नि थाखाय स्लायनाय दोलो थिसनाय जाबाय। फोनखौ साखा-फाखा लाखि आरो दैदेनगिरिनि बिथोनफोरखौ मानिना सोल’। थिसनाया लोगो लोगोनो सौहैनायनि थि खालामा।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 5,
    notes: 'Bodo Devanagari squad assigned (Native field review required)',
    dltTemplateId: 'DLT_TE_BR_ASG_05'
  },

  // STAGE 6: RESCUE TEAM ACCEPTED THE TASK
  RESCUE_TEAM_ACCEPTED: {
    templateId: 'BR_STAGE_06_RESCUE_TEAM_ACCEPTED',
    template: 'दैबाना हेफाजाब: थिसनाय दोलोआ खौरां {requestId} खौ हमथानानै लाबाय। उननि खौरांनि थाखाय फोनखौ साखा-फाखा लाखि।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 6,
    notes: 'Bodo Devanagari squad accepted task (Native field review required)',
    dltTemplateId: 'DLT_TE_BR_ACC_06'
  },

  // STAGE 7: RESCUE OPERATION STARTED
  RESCUE_OPERATION_STARTED: {
    templateId: 'BR_STAGE_07_RESCUE_OPERATION_STARTED',
    template: 'दैबाना हेफाजाब: खौरां {requestId} नि थाखाय स्लायनाय खामानिया जागायबाय। फोनखौ खाथियाव लाखि आरो रैखाथि बिथोनफोरखौ मानि।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 7,
    notes: 'Bodo Devanagari rescue operation started (Native field review required)',
    dltTemplateId: 'DLT_TE_BR_OPS_07'
  },

  // STAGE 8: RESCUE TEAM EN ROUTE
  RESCUE_TEAM_EN_ROUTE: {
    templateId: 'BR_STAGE_08_RESCUE_TEAM_EN_ROUTE',
    template: 'दैबाना हेफाजाब: खौरां {requestId} नि थाखाय दोलोआ लामायाव दं। फोनखौ साखा-फाखा लाखि आरो रैखाथिनि बिथोन मानि।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 8,
    notes: 'Bodo Devanagari team en route (Native field review required)',
    dltTemplateId: 'DLT_TE_BR_ROU_08'
  },

  // STAGE 9: RESCUE TEAM ARRIVED
  RESCUE_TEAM_ARRIVED: {
    templateId: 'BR_STAGE_09_RESCUE_TEAM_ARRIVED',
    template: 'दैबाना हेफाजाब: थिसनाय दोलोआ खौरां {requestId} नि जायगायाव सौफैबाय। रैखाथिनि बिथोनफोरखौ मानिना सोल’।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 9,
    notes: 'Bodo Devanagari team arrived (Native field review required)',
    dltTemplateId: 'DLT_TE_BR_ARR_09'
  },

  // STAGE 10: TEMPORARILY DELAYED
  TEMPORARILY_DELAYED: {
    templateId: 'BR_STAGE_10_TEMPORARILY_DELAYED',
    template: 'दैबाना हेफाजाब: खौरां {requestId} नि हेफाजाबाव थोजासे उजिनाय जादों। फोनखौ साखा-फाखा लाखि आरो गोख्रों खैफोदाव जायगानि थाखाय आपात्कालिनजों फोनांजाब खालाम।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 10,
    notes: 'Bodo Devanagari delay notice (Native field review required)',
    dltTemplateId: 'DLT_TE_BR_DEL_10'
  },

  // STAGE 11: RESCUE OR ASSISTANCE IN PROGRESS
  ASSISTANCE_IN_PROGRESS: {
    templateId: 'BR_STAGE_11_ASSISTANCE_IN_PROGRESS',
    template: 'दैबाना हेफाजाब: खौरां {requestId} नि थाखाय हेफाजाब होनाय खामानिया जागायबाय। बिथोनफोरखौ मानिना सोल’।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 11,
    notes: 'Bodo Devanagari assistance in progress (Native field review required)',
    dltTemplateId: 'DLT_TE_BR_PRG_11'
  },

  // STAGE 12: RESCUE COMPLETED / REPORT RESOLVED
  REPORT_RESOLVED: {
    templateId: 'BR_STAGE_12_REPORT_RESOLVED',
    template: 'दैबाना हेफाजाब: खौरां {requestId} खौ फोजोबनाय जाबाय। हेफाजाब नांगौबा स्लायनाय दोलो एबा जायगानि बिबुंथिगिरिजों फोनांजाब खालाम।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 12,
    notes: 'Bodo Devanagari report resolved (Native field review required)',
    dltTemplateId: 'DLT_TE_BR_RES_12'
  },

  // STAGE 13: REPORT REJECTED
  REPORT_REJECTED: {
    templateId: 'BR_STAGE_13_REPORT_REJECTED',
    template: 'दैबाना हेफाजाब: खौरां {requestId} खौ गनायना लानो हायाखै। गोख्रों खैफोदाव आपात्कालिनजों फोनांजाब खालाम। थि खौरांखौ अफिसियेल राहाजों दैथायहर।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 13,
    notes: 'Bodo Devanagari report rejected (Native field review required)',
    dltTemplateId: 'DLT_TE_BR_REJ_13'
  },

  // STAGE 14: REPORT MARKED AS DUPLICATE
  REPORT_MARKED_DUPLICATE: {
    templateId: 'BR_STAGE_14_REPORT_MARKED_DUPLICATE',
    template: 'दैबाना हेफाजाब: खौरां {requestId} खौ सिगांनि खौरांनि रोखोम बादि थि खालामनाय जाबाय। खैफोदा फोजोबाखैब्ला जायगानि बिबुंथिगिरिजों फोनांजाब खालाम।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 14,
    notes: 'Bodo Devanagari duplicate marked (Native field review required)',
    dltTemplateId: 'DLT_TE_BR_DUP_14'
  },

  // STAGE 15: REPORT CANCELLED
  REPORT_CANCELLED: {
    templateId: 'BR_STAGE_15_REPORT_CANCELLED',
    template: 'दैबाना हेफाजाब: खौरां {requestId} खौ बातिल खालामनाय जाबाय। हेफाजाब नांगौबा जायगानि आपात्कालिन सेन्टरजों फोनांजाब खालाम।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 15,
    notes: 'Bodo Devanagari report cancelled (Native field review required)',
    dltTemplateId: 'DLT_TE_BR_CAN_15'
  },

  // STAGE 16: REPORT REOPENED
  REPORT_REOPENED: {
    templateId: 'BR_STAGE_16_REPORT_REOPENED',
    template: 'दैबाना हेफाजाब: खौरां {requestId} खौ फिन नायफिननो थाखाय खुलिनाय जाबाय। उननि खौरांनि थाखाय फोनखौ साखा-फाखा लाखि।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 16,
    notes: 'Bodo Devanagari report reopened (Native field review required)',
    dltTemplateId: 'DLT_TE_BR_REO_16'
  },

  // STAGE 17: ADDITIONAL INFORMATION REQUIRED
  ADDITIONAL_INFO_REQUIRED: {
    templateId: 'BR_STAGE_17_ADDITIONAL_INFO_REQUIRED',
    template: 'दैबाना हेफाजाब: खौरां {requestId} नि थाखाय आरोबाव मिथिनो नांगौ जादों। अननानै अफिसियेल FloodRelief राहाजों रोखायै खौरां हरफिन।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 17,
    notes: 'Bodo Devanagari additional info needed (Native field review required)',
    dltTemplateId: 'DLT_TE_BR_INF_17'
  },

  // STAGE 18: RELIEF CAMP OR SHELTER UPDATE
  SHELTER_UPDATE: {
    templateId: 'BR_STAGE_18_SHELTER_UPDATE',
    template: 'दैबाना हेफाजाब: नोंथांनि खाथियाव थानाय आश्रय सेन्टरनि खौरांखौ फोसावनाय जाबाय। थि खौरांनि थाखाय अफिसियेल राहाजों फोनांजाब खालाम।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 18,
    notes: 'Bodo Devanagari shelter update (Native field review required)',
    dltTemplateId: 'DLT_TE_BR_SHL_18'
  },

  // STAGE 19: NOTIFICATION OR REQUEST UPDATE
  REQUEST_UPDATED: {
    templateId: 'BR_STAGE_19_REQUEST_UPDATED',
    template: 'दैबाना हेफाजाब: खौरां {requestId} नि थाखाय गोदान खौरां फोसावनाय जादों। उननि बिथोननि थाखाय फोनखौ साखा-फाखा लाखि।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 19,
    notes: 'Bodo Devanagari general update (Native field review required)',
    dltTemplateId: 'DLT_TE_BR_UPD_19'
  }
};
