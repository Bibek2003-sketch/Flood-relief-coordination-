import { SmsLocaleCatalog } from './types';

export const hiTemplates: SmsLocaleCatalog = {
  // STAGE 1: REPORT RECEIVED
  REPORT_RECEIVED: {
    templateId: 'HI_STAGE_01_REPORT_RECEIVED',
    template: 'बाढ़ राहत (FloodRelief): आपकी आपात रिपोर्ट {requestId} प्राप्त हो गई है और समीक्षाधीन है। अपडेट के लिए फोन चालू रखें। बचाव दल भेजना अभी सुनिश्चित नहीं हुआ है। यदि तत्काल खतरा है, तो स्थानीय आपातकालीन सेवाओं से संपर्क करें।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 1,
    notes: 'Hindi citizen intake acknowledgement (Human review required)',
    dltTemplateId: 'DLT_TE_HI_ACK_01'
  },

  // STAGE 2: REPORT UNDER REVIEW
  REPORT_UNDER_REVIEW: {
    templateId: 'HI_STAGE_02_REPORT_UNDER_REVIEW',
    template: 'बाढ़ राहत: रिपोर्ट {requestId} की समीक्षा राहत टीम द्वारा की जा रही है। अपडेट के लिए फोन उपलब्ध रखें। बचाव दल का आवंटन अभी सुनिश्चित नहीं है।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 2,
    notes: 'Hindi triage assessment notice (Human review required)',
    dltTemplateId: 'DLT_TE_HI_REV_02'
  },

  // STAGE 3: REPORT VERIFIED
  REPORT_VERIFIED: {
    templateId: 'HI_STAGE_03_REPORT_VERIFIED',
    template: 'बाढ़ राहत: रिपोर्ट {requestId} को सत्यापित कर लिया गया है। आपका अनुरोध अब प्रतिक्रिया योजना के अगले चरण के लिए योग्य है। फोन चालू रखें।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 3,
    notes: 'Hindi verified notice (Human review required)',
    dltTemplateId: 'DLT_TE_HI_VER_03'
  },

  // STAGE 4: PRIORITY UPDATED
  PRIORITY_UPDATED: {
    templateId: 'HI_STAGE_04_PRIORITY_UPDATED',
    template: 'बाढ़ राहत: रिपोर्ट {requestId} के लिए राहत प्राथमिकता को अपडेट किया गया है। आगामी निर्देशों के लिए फोन पास रखें।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 4,
    notes: 'Hindi priority updated (Human review required)',
    dltTemplateId: 'DLT_TE_HI_PRI_04'
  },

  // STAGE 5: RESCUE TEAM ASSIGNED
  RESCUE_TEAM_ASSIGNED: {
    templateId: 'HI_STAGE_05_RESCUE_TEAM_ASSIGNED',
    template: 'बाढ़ राहत: रिपोर्ट {requestId} के लिए एक बचाव दल को आवंटित कर दिया गया है। फोन चालू रखें और अधिकृत कर्मियों के निर्देशों का पालन करें। आवंटन आगमन समय की गारंटी नहीं देता है।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 5,
    notes: 'Hindi squad assigned (Human review required)',
    dltTemplateId: 'DLT_TE_HI_ASG_05'
  },

  // STAGE 6: RESCUE TEAM ACCEPTED THE TASK
  RESCUE_TEAM_ACCEPTED: {
    templateId: 'HI_STAGE_06_RESCUE_TEAM_ACCEPTED',
    template: 'बाढ़ राहत: आवंटित बचाव दल ने रिपोर्ट {requestId} को स्वीकार कर लिया है। आगामी अपडेट के लिए फोन उपलब्ध रखें।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 6,
    notes: 'Hindi squad accepted task (Human review required)',
    dltTemplateId: 'DLT_TE_HI_ACC_06'
  },

  // STAGE 7: RESCUE OPERATION STARTED
  RESCUE_OPERATION_STARTED: {
    templateId: 'HI_STAGE_07_RESCUE_OPERATION_STARTED',
    template: 'बाढ़ राहत: रिपोर्ट {requestId} के लिए राहत अभियान शुरू कर दिया गया है। फोन उपलब्ध रखें और अधिकृत कर्मियों के सुरक्षा निर्देशों का पालन करें।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 7,
    notes: 'Hindi rescue operation started (Human review required)',
    dltTemplateId: 'DLT_TE_HI_OPS_07'
  },

  // STAGE 8: RESCUE TEAM EN ROUTE
  RESCUE_TEAM_EN_ROUTE: {
    templateId: 'HI_STAGE_08_RESCUE_TEAM_EN_ROUTE',
    template: 'बाढ़ राहत: रिपोर्ट {requestId} के लिए आवंटित दल रास्ते में है। फोन उपलब्ध रखें और आधिकारिक सुरक्षा निर्देशों का पालन करें।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 8,
    notes: 'Hindi team en route (Human review required)',
    dltTemplateId: 'DLT_TE_HI_ROU_08'
  },

  // STAGE 9: RESCUE TEAM ARRIVED
  RESCUE_TEAM_ARRIVED: {
    templateId: 'HI_STAGE_09_RESCUE_TEAM_ARRIVED',
    template: 'बाढ़ राहत: आवंटित दल ने रिपोर्ट {requestId} के स्थल पर पहुंचने की सूचना दी है। अधिकृत कर्मियों के निर्देशों का पालन करें।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 9,
    notes: 'Hindi team arrived on-site (Human review required)',
    dltTemplateId: 'DLT_TE_HI_ARR_09'
  },

  // STAGE 10: TEMPORARILY DELAYED
  TEMPORARILY_DELAYED: {
    templateId: 'HI_STAGE_10_TEMPORARILY_DELAYED',
    template: 'बाढ़ राहत: रिपोर्ट {requestId} की सहायता प्रक्रिया में विलंब हो रहा है। फोन चालू रखें और यदि आप तत्काल खतरे में हैं तो स्थानीय आपातकालीन सेवाओं से संपर्क करें।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 10,
    notes: 'Hindi delay notice (Human review required)',
    dltTemplateId: 'DLT_TE_HI_DEL_10'
  },

  // STAGE 11: RESCUE OR ASSISTANCE IN PROGRESS
  ASSISTANCE_IN_PROGRESS: {
    templateId: 'HI_STAGE_11_ASSISTANCE_IN_PROGRESS',
    template: 'बाढ़ राहत: रिपोर्ट {requestId} के लिए सहायता कार्य प्रगति पर है। अधिकृत कर्मियों के निर्देशों का पालन करें।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 11,
    notes: 'Hindi assistance in progress (Human review required)',
    dltTemplateId: 'DLT_TE_HI_PRG_11'
  },

  // STAGE 12: RESCUE COMPLETED / REPORT RESOLVED
  REPORT_RESOLVED: {
    templateId: 'HI_STAGE_12_REPORT_RESOLVED',
    template: 'बाढ़ राहत: रिपोर्ट {requestId} को पूर्ण / सुरक्षित के रूप में चिह्नित किया गया है। यदि आपको अभी भी सहायता चाहिए, तो राहत टीम या स्थानीय आपातकालीन अधिकारियों से संपर्क करें।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 12,
    notes: 'Hindi report resolved (Human review required)',
    dltTemplateId: 'DLT_TE_HI_RES_12'
  },

  // STAGE 13: REPORT REJECTED
  REPORT_REJECTED: {
    templateId: 'HI_STAGE_13_REPORT_REJECTED',
    template: 'बाढ़ राहत: रिपोर्ट {requestId} स्वीकार नहीं की जा सकी। यदि तत्काल सहायता चाहिए, तो स्थानीय आपातकालीन सेवाओं से संपर्क करें। सुधार के लिए आधिकारिक रिपोर्टिंग माध्यम का उपयोग करें।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 13,
    notes: 'Hindi report rejected (Human review required)',
    dltTemplateId: 'DLT_TE_HI_REJ_13'
  },

  // STAGE 14: REPORT MARKED AS DUPLICATE
  REPORT_MARKED_DUPLICATE: {
    templateId: 'HI_STAGE_14_REPORT_MARKED_DUPLICATE',
    template: 'बाढ़ राहत: रिपोर्ट {requestId} को पूर्व अनुरोध की प्रतिलिपि के रूप में चिह्नित किया गया है। यदि आपकी आपात स्थिति अनिर्णीत है, तो राहत टीम या स्थानीय आपातकालीन अधिकारियों से संपर्क करें।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 14,
    notes: 'Hindi duplicate marked (Human review required)',
    dltTemplateId: 'DLT_TE_HI_DUP_14'
  },

  // STAGE 15: REPORT CANCELLED
  REPORT_CANCELLED: {
    templateId: 'HI_STAGE_15_REPORT_CANCELLED',
    template: 'बाढ़ राहत: रिपोर्ट {requestId} रद्द कर दी गई है। यदि आपको अभी भी तत्काल सहायता चाहिए, तो स्थानीय आपातकालीन सेवाओं से संपर्क करें।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 15,
    notes: 'Hindi report cancelled (Human review required)',
    dltTemplateId: 'DLT_TE_HI_CAN_15'
  },

  // STAGE 16: REPORT REOPENED
  REPORT_REOPENED: {
    templateId: 'HI_STAGE_16_REPORT_REOPENED',
    template: 'बाढ़ राहत: रिपोर्ट {requestId} को आगे की समीक्षा के लिए पुनः खोल दिया गया है। अपडेट के लिए फोन उपलब्ध रखें।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 16,
    notes: 'Hindi report reopened (Human review required)',
    dltTemplateId: 'DLT_TE_HI_REO_16'
  },

  // STAGE 17: ADDITIONAL INFORMATION REQUIRED
  ADDITIONAL_INFO_REQUIRED: {
    templateId: 'HI_STAGE_17_ADDITIONAL_INFO_REQUIRED',
    template: 'बाढ़ राहत: रिपोर्ट {requestId} के लिए अतिरिक्त जानकारी की आवश्यकता है। कृपया आवश्यक विवरण देने के लिए आधिकारिक FloodRelief संपर्क या रिपोर्टिंग माध्यम का उपयोग करें।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 17,
    notes: 'Hindi more info needed (Human review required)',
    dltTemplateId: 'DLT_TE_HI_INF_17'
  },

  // STAGE 18: RELIEF CAMP OR SHELTER UPDATE
  SHELTER_UPDATE: {
    templateId: 'HI_STAGE_18_SHELTER_UPDATE',
    template: 'बाढ़ राहत: आपके अनुरोध से संबंधित राहत शिविरों का अद्यतन विवरण उपलब्ध है। सत्यापित जानकारी के लिए आधिकारिक माध्यम या स्थानीय आपातकालीन अधिकारियों से संपर्क करें।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 18,
    notes: 'Hindi shelter update (Human review required)',
    dltTemplateId: 'DLT_TE_HI_SHL_18'
  },

  // STAGE 19: NOTIFICATION OR REQUEST UPDATE
  REQUEST_UPDATED: {
    templateId: 'HI_STAGE_19_REQUEST_UPDATED',
    template: 'बाढ़ राहत: रिपोर्ट {requestId} के लिए एक नया परिचालन अपडेट जारी किया गया है। आगामी निर्देशों के लिए फोन पास रखें।',
    reviewStatus: 'needs_review',
    reviewed: false,
    version: '1.0',
    stageNumber: 19,
    notes: 'Hindi general request updated (Human review required)',
    dltTemplateId: 'DLT_TE_HI_UPD_19'
  }
};
