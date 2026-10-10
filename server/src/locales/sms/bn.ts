import { SmsLocaleCatalog } from './types';

export const bnTemplates: SmsLocaleCatalog = {
  // STAGE 1: REPORT RECEIVED
  REPORT_RECEIVED: {
    templateId: 'BN_STAGE_01_REPORT_RECEIVED',
    template: 'বন্যা ত্রাণ (FloodRelief): আপনার জরুরি রিপোর্ট {requestId} সফলভাবে গৃহীত হয়েছে এবং পর্যালোচনার অপেক্ষায় রয়েছে। আপডেটের জন্য ফোন চালু রাখুন। উদ্ধার এখনো নিশ্চিত নয়। তাৎক্ষণিক বিপদে স্থানীয় জরুরি সেবায় যোগাযোগ করুন।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 1,
    notes: 'Bengali intake acknowledgment (Human review required)',
    dltTemplateId: 'DLT_TE_BN_ACK_01'
  },

  // STAGE 2: REPORT UNDER REVIEW
  REPORT_UNDER_REVIEW: {
    templateId: 'BN_STAGE_02_REPORT_UNDER_REVIEW',
    template: 'বন্যা ত্রাণ: আপনার রিপোর্ট {requestId} উদ্ধারকারী দল দ্বারা পর্যালোচনা করা হচ্ছে। আপডেটের জন্য ফোন সচল রাখুন। উদ্ধার দল পাঠানো এখনো নিশ্চিত নয়।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 2,
    notes: 'Bengali review status (Human review required)',
    dltTemplateId: 'DLT_TE_BN_REV_02'
  },

  // STAGE 3: REPORT VERIFIED
  REPORT_VERIFIED: {
    templateId: 'BN_STAGE_03_REPORT_VERIFIED',
    template: 'বন্যা ত্রাণ: রিপোর্ট {requestId} যাচাই করা হয়েছে। আপনার অনুরোধটি পরবর্তী সাড়াদান প্রক্রিয়ার জন্য বিবেচিত হয়েছে। ফোন কাছে রাখুন।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 3,
    notes: 'Bengali verification notice (Human review required)',
    dltTemplateId: 'DLT_TE_BN_VER_03'
  },

  // STAGE 4: PRIORITY UPDATED
  PRIORITY_UPDATED: {
    templateId: 'BN_STAGE_04_PRIORITY_UPDATED',
    template: 'বন্যা ত্রাণ: রিপোর্ট {requestId}-এর অগ্রাধিকারের মাত্রা হালনাগাদ করা হয়েছে। পরবর্তী নির্দেশাবলীর জন্য ফোন সচল রাখুন।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 4,
    notes: 'Bengali priority updated (Human review required)',
    dltTemplateId: 'DLT_TE_BN_PRI_04'
  },

  // STAGE 5: RESCUE TEAM ASSIGNED
  RESCUE_TEAM_ASSIGNED: {
    templateId: 'BN_STAGE_05_RESCUE_TEAM_ASSIGNED',
    template: 'বন্যা ত্রাণ: রিপোর্ট {requestId}-এর জন্য উদ্ধারকারী দল নিযুক্ত করা হয়েছে। ফোন কাছে রাখুন এবং উদ্ধারকারীদের নির্দেশাবলী মেনে চলুন। নিয়োগ অবিলম্বে পৌঁছানোর নিশ্চয়তা দেয় না।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 5,
    notes: 'Bengali team assigned notice (Human review required)',
    dltTemplateId: 'DLT_TE_BN_ASG_05'
  },

  // STAGE 6: RESCUE TEAM ACCEPTED THE TASK
  RESCUE_TEAM_ACCEPTED: {
    templateId: 'BN_STAGE_06_RESCUE_TEAM_ACCEPTED',
    template: 'বন্যা ত্রাণ: নিযুক্ত উদ্ধারকারী দল রিপোর্ট {requestId} স্বীকার করেছে। পরবর্তী আপডেটের জন্য ফোন কাছে রাখুন।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 6,
    notes: 'Bengali team accepted task (Human review required)',
    dltTemplateId: 'DLT_TE_BN_ACC_06'
  },

  // STAGE 7: RESCUE OPERATION STARTED
  RESCUE_OPERATION_STARTED: {
    templateId: 'BN_STAGE_07_RESCUE_OPERATION_STARTED',
    template: 'বন্যা ত্রাণ: রিপোর্ট {requestId}-এর জন্য উদ্ধার কাজ শুরু হয়েছে। ফোন সচল রাখুন এবং দায়িত্বপ্রাপ্ত উদ্ধারকারীদের নির্দেশ অনুসরণ করুন।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 7,
    notes: 'Bengali rescue operation started (Human review required)',
    dltTemplateId: 'DLT_TE_BN_OPS_07'
  },

  // STAGE 8: RESCUE TEAM EN ROUTE
  RESCUE_TEAM_EN_ROUTE: {
    templateId: 'BN_STAGE_08_RESCUE_TEAM_EN_ROUTE',
    template: 'বন্যা ত্রাণ: রিপোর্ট {requestId}-এর জন্য নিযুক্ত দল পথে রয়েছে। ফোন কাছে রাখুন এবং সরকারি নিরাপত্তা নির্দেশাবলী মেনে চলুন।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 8,
    notes: 'Bengali team en route (Human review required)',
    dltTemplateId: 'DLT_TE_BN_ROU_08'
  },

  // STAGE 9: RESCUE TEAM ARRIVED
  RESCUE_TEAM_ARRIVED: {
    templateId: 'BN_STAGE_09_RESCUE_TEAM_ARRIVED',
    template: 'বন্যা ত্রাণ: নিযুক্ত দল রিপোর্ট {requestId}-এর ঘটনাস্থলে পৌঁছেছে। উদ্ধারকারীদের নির্দেশাবলী মেনে চলুন।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 9,
    notes: 'Bengali team arrived on-site (Human review required)',
    dltTemplateId: 'DLT_TE_BN_ARR_09'
  },

  // STAGE 10: TEMPORARILY DELAYED
  TEMPORARILY_DELAYED: {
    templateId: 'BN_STAGE_10_TEMPORARILY_DELAYED',
    template: 'বন্যা ত্রাণ: রিপোর্ট {requestId}-এর সহায়তায় সাময়িক বিলম্ব হচ্ছে। ফোন সচল রাখুন এবং চরম বিপদে থাকলে স্থানীয় জরুরি সেবায় যোগাযোগ করুন।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 10,
    notes: 'Bengali delay notice (Human review required)',
    dltTemplateId: 'DLT_TE_BN_DEL_10'
  },

  // STAGE 11: RESCUE OR ASSISTANCE IN PROGRESS
  ASSISTANCE_IN_PROGRESS: {
    templateId: 'BN_STAGE_11_ASSISTANCE_IN_PROGRESS',
    template: 'বন্যা ত্রাণ: রিপোর্ট {requestId}-এর জন্য সহায়তা কার্যক্রম চলমান রয়েছে। উদ্ধারকারীদের নির্দেশাবলী মেনে চলুন।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 11,
    notes: 'Bengali assistance in progress (Human review required)',
    dltTemplateId: 'DLT_TE_BN_PRG_11'
  },

  // STAGE 12: RESCUE COMPLETED / REPORT RESOLVED
  REPORT_RESOLVED: {
    templateId: 'BN_STAGE_12_REPORT_RESOLVED',
    template: 'বন্যা ত্রাণ: রিপোর্ট {requestId} সম্পন্ন হিসেবে চিহ্নিত করা হয়েছে। এখনো সহায়তার প্রয়োজন হলে সাড়াদান দল বা স্থানীয় জরুরি কর্তৃপক্ষের সাথে যোগাযোগ করুন।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 12,
    notes: 'Bengali report resolved (Human review required)',
    dltTemplateId: 'DLT_TE_BN_RES_12'
  },

  // STAGE 13: REPORT REJECTED
  REPORT_REJECTED: {
    templateId: 'BN_STAGE_13_REPORT_REJECTED',
    template: 'বন্যা ত্রাণ: রিপোর্ট {requestId} গ্রহণ করা সম্ভব হয়নি। জরুরি সাহায্যের প্রয়োজন হলে স্থানীয় জরুরি সেবায় যোগাযোগ করুন। সংশোধিত তথ্যের জন্য অফিসিয়াল চ্যানেল ব্যবহার করুন।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 13,
    notes: 'Bengali report rejected (Human review required)',
    dltTemplateId: 'DLT_TE_BN_REJ_13'
  },

  // STAGE 14: REPORT MARKED AS DUPLICATE
  REPORT_MARKED_DUPLICATE: {
    templateId: 'BN_STAGE_14_REPORT_MARKED_DUPLICATE',
    template: 'বন্যা ত্রাণ: রিপোর্ট {requestId} পূর্বের একটি অনুরোধের প্রতিলিপি হিসেবে চিহ্নিত করা হয়েছে। যদি আপনার জরুরি অবস্থা অনিষ্পন্ন থাকে, তবে জরুরি কর্তৃপক্ষের সাথে যোগাযোগ করুন।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 14,
    notes: 'Bengali duplicate marked (Human review required)',
    dltTemplateId: 'DLT_TE_BN_DUP_14'
  },

  // STAGE 15: REPORT CANCELLED
  REPORT_CANCELLED: {
    templateId: 'BN_STAGE_15_REPORT_CANCELLED',
    template: 'বন্যা ত্রাণ: রিপোর্ট {requestId} বাতিল করা হয়েছে। আপনার এখনো জরুরি সাহায্যের প্রয়োজন হলে স্থানীয় জরুরি সেবায় যোগাযোগ করুন।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 15,
    notes: 'Bengali report cancelled (Human review required)',
    dltTemplateId: 'DLT_TE_BN_CAN_15'
  },

  // STAGE 16: REPORT REOPENED
  REPORT_REOPENED: {
    templateId: 'BN_STAGE_16_REPORT_REOPENED',
    template: 'বন্যা ত্রাণ: রিপোর্ট {requestId} পুনরায় বিবেচনার জন্য খোলা হয়েছে। আপডেটের জন্য ফোন সচল রাখুন।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 16,
    notes: 'Bengali report reopened (Human review required)',
    dltTemplateId: 'DLT_TE_BN_REO_16'
  },

  // STAGE 17: ADDITIONAL INFORMATION REQUIRED
  ADDITIONAL_INFO_REQUIRED: {
    templateId: 'BN_STAGE_17_ADDITIONAL_INFO_REQUIRED',
    template: 'বন্যা ত্রাণ: রিপোর্ট {requestId}-এর জন্য অতিরিক্ত তথ্যের প্রয়োজন। অনুরোধকৃত বিবরণ দিতে FloodRelief-এর অফিসিয়াল যোগাযোগ বা রিপোর্ট চ্যানেল ব্যবহার করুন।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 17,
    notes: 'Bengali additional info required (Human review required)',
    dltTemplateId: 'DLT_TE_BN_INF_17'
  },

  // STAGE 18: RELIEF CAMP OR SHELTER UPDATE
  SHELTER_UPDATE: {
    templateId: 'BN_STAGE_18_SHELTER_UPDATE',
    template: 'বন্যা ত্রাণ: আপনার অনুরোধের প্রাসঙ্গিক ত্রাণ শিবির সম্পর্কিত আপডেট উপলব্ধ। যাচাইকৃত তথ্যের জন্য অফিসিয়াল চ্যানেল বা স্থানীয় কর্তৃপক্ষের সাথে যোগাযোগ করুন।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 18,
    notes: 'Bengali shelter update (Human review required)',
    dltTemplateId: 'DLT_TE_BN_SHL_18'
  },

  // STAGE 19: NOTIFICATION OR REQUEST UPDATE
  REQUEST_UPDATED: {
    templateId: 'BN_STAGE_19_REQUEST_UPDATED',
    template: 'বন্যা ত্রাণ: রিপোর্ট {requestId}-এর জন্য একটি অপারেশনাল আপডেট দেওয়া হয়েছে। পরবর্তী নির্দেশাবলীর জন্য ফোন সচল রাখুন।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 19,
    notes: 'Bengali general request updated (Human review required)',
    dltTemplateId: 'DLT_TE_BN_UPD_19'
  }
};
