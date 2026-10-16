export type SupportedLanguage = 'en' | 'hi' | 'bn' | 'br' | 'as';

export interface RouteDestination {
  id: string;
  path: string;
  titles: Record<SupportedLanguage, string>;
  actionLabels: Record<SupportedLanguage, string>;
  description: Record<SupportedLanguage, string>;
  keywords: string[];
  isPublic: boolean;
  requiresAuth: boolean;
  allowedRoles?: string[];
}

export const ROUTE_REGISTRY: Record<string, RouteDestination> = {
  REPORT_EMERGENCY: {
    id: 'REPORT_EMERGENCY',
    path: '/emergency',
    titles: {
      en: 'Report Flood Emergency (SOS Form)',
      hi: 'बाढ़ आपातकाल रिपोर्ट (एसओएस फॉर्म)',
      bn: 'বন্যা জরুরি রিপোর্ট (এসওএস ফর্ম)',
      br: 'दैदेन आपत खौरां (एसओएस फर्म)',
      as: 'বানপানী জৰুৰীকালীন আবেদন (এছ অ\' এছ ফৰ্ম)'
    },
    actionLabels: {
      en: 'Go to Emergency Form',
      hi: 'आपातकालीन फॉर्म पर जाएं',
      bn: 'জরুরি ফর্মে যান',
      br: 'आपत फर्मआव थां',
      as: 'জৰুৰীকালীন ফৰ্মলৈ যাওক'
    },
    description: {
      en: 'Standard web form to submit detailed rescue, medical, food, or shelter requests with GPS coordinates.',
      hi: 'जीपीएस निर्देशांकों के साथ बचाव, चिकित्सा, भोजन या आश्रय का विस्तृत अनुरोध प्रस्तुत करने के लिए फॉर्म।',
      bn: 'জিপিএস স্থানাঙ্ক সহ উদ্ধার, চিকিৎসা, খাদ্য বা আশ্রয়ের অনুরোধ জানানোর সাধারণ ফর্ম।',
      br: 'उद्धार, मुलि, जामुं आरो आश्रयनि दाबि दैथायहरनो थाखाय फर्म।',
      as: 'উদ্ধাৰ, চিকিৎসা, খাদ্য বা আশ্ৰয়ৰ আবেদন জনাবলৈ জৰুৰীকালীন ফৰ্ম।'
    },
    keywords: [
      'report', 'emergency', 'sos', 'form', 'request', 'help', 'rescue me', 'save us', 'stranded', 'food', 'water', 'medical', 'medicine',
      'আবেদন', 'জরুরি', 'রিপোর্ট', 'সাহায্য', 'উদ্ধার', 'বাঁচাও',
      'रिपोर्ट', 'मदद', 'बचाव', 'आपातकाल', 'सहायता', 'खाना',
      'मदद', 'आपत', 'खौरां', 'उद्धार', 'मुलि',
      'জৰুৰীকালীন', 'বানপানী', 'সহায়', 'উদ্ধাৰ', 'খাদ্য'
    ],
    isPublic: true,
    requiresAuth: false
  },
  VOICE_SOS: {
    id: 'VOICE_SOS',
    path: '/voice-sos',
    titles: {
      en: 'Voice SOS — Speak to Report',
      hi: 'वॉयस एसओएस — बोलकर रिपोर्ट करें',
      bn: 'ভয়েস এসওএস — মুখে বলে রিপোর্ট করুন',
      br: 'राव एसओएस — बुंनानै आपत खौरां हर',
      as: 'ভয়েচ এছ অ\' এছ — মাত মাতি ৰিপ\'ৰ্ট কৰক'
    },
    actionLabels: {
      en: 'Open Voice SOS',
      hi: 'वॉयस एसओएस खोलें',
      bn: 'ভয়েস এসওএস খুলুন',
      br: 'राव एसओएस खुलि',
      as: 'ভয়েচ এছ অ\' এছ খোলক'
    },
    description: {
      en: 'Hands-free voice recording to report emergencies rapidly without typing. Captures audio and GPS automatically.',
      hi: 'टाइप किए बिना तुरंत आपातकाल रिपोर्ट करने के लिए हाथों से मुक्त ऑडियो रिकॉर्डिंग।',
      bn: 'টাইপ না করে কথা বলে দ্রুত জরুরি রিপোর্ট পাঠানোর হ্যান্ডস-ফ্রি ভয়েস রেকর্ডিং।',
      br: 'टाइप खालामलासिनो बुंनानै हरनो थाखाय राव रेकर्डिं।',
      as: 'টাইপ নকৰাকৈ মাত মাতিয়েই জৰুৰীকালীন খবৰ পঠিয়াবলৈ ভইচ ৰেকৰ্ডিং।'
    },
    keywords: [
      'voice', 'voice sos', 'speak', 'audio', 'mic', 'microphone', 'record', 'handsfree', 'talk',
      'ভয়েস', 'কথা বলে', 'মুখে বলে', 'মাইক্রোফোন', 'রেকর্ড',
      'वॉयस', 'बोलकर', 'माइक', 'ऑडियो', 'ध्वनि',
      'राव', 'बुंनानै', 'खोलो', 'रेकर्ड',
      'ভইচ', 'মাত মাতি', 'শব্দ', 'অডিঅ'
    ],
    isPublic: true,
    requiresAuth: false
  },
  TRACK_EMERGENCY: {
    id: 'TRACK_EMERGENCY',
    path: '/track-emergency',
    titles: {
      en: 'Track Emergency SOS Status',
      hi: 'आपातकालीन एसओएस स्थिति ट्रैक करें',
      bn: 'জরুরি এসওএস স্থিতি ট্র্যাক করুন',
      br: 'आपत एसओएसनि थासारि नाय',
      as: 'জৰুৰীকালীন এছ অ\' এছ অৱস্থা ট্ৰেক কৰক'
    },
    actionLabels: {
      en: 'Track SOS Status',
      hi: 'एसओएस ट्रैक करें',
      bn: 'এসওএস ট্র্যাক করুন',
      br: 'एसओएस थासारि नाय',
      as: 'এছ অ\' এছ ট্ৰেক কৰক'
    },
    description: {
      en: 'Enter your 6-character SOS request ID or phone number to view live rescue dispatch progress.',
      hi: 'लाइव बचाव कार्य की स्थिति देखने के लिए अपनी 6-अंकीय अनुरोध आईडी या फोन नंबर दर्ज करें।',
      bn: 'লাইভ উদ্ধার দলের অগ্রগতি দেখতে আপনার ৬ অক্ষরের অনুরোধ আইডি বা ফোন নম্বর দিন।',
      br: 'उद्धारनि थासारि नायनो थाखाय नोंथांनि ६ हांखोनि दाबि आइदि बा फन नम्बर सो।',
      as: 'উদ্ধাৰ কাৰ্যৰ লাইভ খবৰ চাবলৈ আপোনাৰ ৬-ডিজিটৰ অনুৰোধ আই ডি বা ফোন নম্বৰ দিয়ক।'
    },
    keywords: [
      'track', 'status', 'check status', 'where is rescue', 'my request', 'progress', 'sos id', 'follow up',
      'ট্র্যাক', 'স্থিতি', 'অবস্থা', 'কোথায় উদ্ধার', 'আমার আবেদন',
      'ट्रैक', 'स्थिति', 'कहाँ है टीम', 'स्टेटस', 'मेरी रिपोर्ट',
      'नाय', 'थासारि', 'उद्धार दल',
      'ট্ৰেক', 'অৱস্থা', 'বাতৰি', 'মোৰ আবেদন'
    ],
    isPublic: true,
    requiresAuth: false
  },
  FIND_SHELTERS: {
    id: 'FIND_SHELTERS',
    path: '/shelters',
    titles: {
      en: 'Find Evacuation Shelters & Camps',
      hi: 'राहत शिविर और शरणस्थल खोजें',
      bn: 'ত্রাণ শিবির এবং আশ্রয়কেন্দ্র খুঁজুন',
      br: 'आश्रय आरो राहत केम्प नागिर',
      as: 'আশ্ৰয় শিবিৰ আৰু ৰিলিফ কেম্প বিচাৰক'
    },
    actionLabels: {
      en: 'Find Relief Shelters',
      hi: 'राहत शिविर खोजें',
      bn: 'আশ্রয়কেন্দ্র খুঁজুন',
      br: 'केम्प नागिर',
      as: 'শিবিৰ বিচাৰক'
    },
    description: {
      en: 'Interactive map and directory of active relief camps, available bed capacity, food supply, and medical facilities.',
      hi: 'सक्रिय राहत शिविरों, उपलब्ध क्षमता, भोजन और चिकित्सा सुविधाओं का नक्शा और सूची।',
      bn: 'সক্রিয় ত্রাণ শিবির, খালি সিটের সংখ্যা, খাদ্য এবং চিকিৎসা ব্যবস্থার ইন্টারঅ্যাক্টিভ মানচিত্র।',
      br: 'चोली थानाय राहत केम्प, थाग्रा जायगा, जामुं आरो मुलि सुबिधानि मेप।',
      as: 'সক্ৰিয় আশ্ৰয় শিবিৰ, স্থানৰ ক্ষমতা, খাদ্য আৰু চিকিৎসা ব্যৱস্থাৰ মানচিত্ৰ।'
    },
    keywords: [
      'shelter', 'camp', 'relief camp', 'evacuation', 'stay', 'bed', 'safe place', 'refuge', 'where to stay',
      'আশ্রয়', 'ত্রাণ শিবির', 'ক্যাম্প', 'থাকার জায়গা', 'নিরাপদ স্থান',
      'शिविर', 'आश्रय', 'कैंप', 'राहत केंद्र', 'कहाँ रहें',
      'आश्रय', 'केम्प', 'थाग्रा', 'राहत',
      'আশ্ৰয়', 'শিবিৰ', 'কেম্প', 'সুৰক্ষিত স্থান'
    ],
    isPublic: true,
    requiresAuth: false
  },
  EMERGENCY_CONTACTS: {
    id: 'EMERGENCY_CONTACTS',
    path: '/emergency-contacts',
    titles: {
      en: 'Emergency Helplines & Control Rooms',
      hi: 'आपातकालीन हेल्पलाइन और नियंत्रण कक्ष',
      bn: 'জরুরি হেল্পলাইন ও কন্ট্রোল রুম',
      br: 'आपत हेल्पलाइन आरो नियन्त्रण खथा',
      as: 'জৰুৰীকালীন হেল্পলাইন আৰু নিয়ন্ত্ৰণ কক্ষ'
    },
    actionLabels: {
      en: 'View Helpline Numbers',
      hi: 'हेल्पलाइन नंबर देखें',
      bn: 'হেল্পলাইন নম্বর দেখুন',
      br: 'हेल्पलाइन नम्बर नाय',
      as: 'হেল্পলাইন নম্বৰ চাওক'
    },
    description: {
      en: 'Official 24/7 disaster helpline phone numbers: NDRF/SDRF (1070), Ambulance (108), Police (100), Fire (101), District EOCs.',
      hi: 'आधिकारिक 24/7 आपदा हेल्पलाइन नंबर: एनडीआरएफ/एसडीआरएफ (1070), एम्बुलेंस (108), पुलिस (100), दमकल (101)।',
      bn: 'অফিসিয়াল ২৪/৭ দুর্যোগ হেল্পলাইন নম্বর: এনডিআরএফ/এসডিআরএফ (১০৭০), অ্যাম্বুলেন্স (১০৮), পুলিশ (১০০), ফায়ার (১০১)।',
      br: 'अफिसियेल २४/७ आपत हेल्पलाइन: NDRF/SDRF (१०७०), एम्बुलेन्स (१०८), पुलिस (१००), अरनार (१०१)।',
      as: 'চৰকাৰী ২৪/৭ দুৰ্যোগ হেল্পলাইন নম্বৰ: NDRF/SDRF (১০৭০), এম্বুলেন্স (১০৮), আৰক্ষী (১০০), অগ্নিনিৰ্বাপক (১০১)।'
    },
    keywords: [
      'contact', 'helpline', 'phone', 'call', 'control room', 'ndrf', 'sdrf', 'police', 'ambulance', 'fire', 'number', 'hotline',
      'যোগাযোগ', 'হেল্পলাইন', 'ফোন', 'নম্বর', 'পুলিশ', 'অ্যাম্বুলেন্স', 'কল',
      'फोन', 'हेल्पलाइन', 'नंबर', 'कॉल', 'पुलिस', 'एम्बुलेंस', 'कंट्रोल रूम',
      'फन', 'हेल्पलाइन', 'नम्बर', 'खथा', 'पुलिस',
      'যোগাযোগ', 'হেল্পলাইন', 'ফোন', 'নম্বৰ', 'এম্বুলেন্স'
    ],
    isPublic: true,
    requiresAuth: false
  },
  VOLUNTEER_REGISTER: {
    id: 'VOLUNTEER_REGISTER',
    path: '/volunteer',
    titles: {
      en: 'Volunteer Deployment Network',
      hi: 'स्वयंसेवक नेटवर्क पंजीकरण',
      bn: 'স্বেচ্ছাসেবক নেটওয়ার্ক নিবন্ধন',
      br: 'स्वयंसेवक मुं थिसननाय',
      as: 'স্বেচ্ছাসেৱক পঞ্জীয়ন'
    },
    actionLabels: {
      en: 'Join as Volunteer',
      hi: 'स्वयंसेवक के रूप में जुड़ें',
      bn: 'স্বেচ্ছাসেবক হিসেবে যোগ দিন',
      br: 'स्वयंसेवक जानानै थां',
      as: 'স্বেচ্ছাসেৱক হিচাপে যোগদান কৰক'
    },
    description: {
      en: 'Sign up to assist on the ground with relief supplies distribution, first aid, translation, or boat rescue coordination.',
      hi: 'राहत सामग्री वितरण, प्राथमिक चिकित्सा, या नाव बचाव कार्य में सहायता के लिए स्वयंसेवक बनें।',
      bn: 'ত্রাণ বিতরণ, প্রাথমিক চিকিৎসা বা উদ্ধার সহায়তার জন্য স্বেচ্ছাসেবক হিসেবে নিবন্ধন করুন।',
      br: 'राहत बाहान्नाय, मुलि हेफाजाब, बा नावो उद्धार खालामनो थाखाय मुं थिसन।',
      as: 'সাহায্য বিতৰণ আৰু উদ্ধাৰ কাৰ্যত সহায় কৰিবলৈ স্বেচ্ছাসেৱক হিচাপে যোগদান কৰক।'
    },
    keywords: [
      'volunteer', 'join volunteer', 'help others', 'participate', 'signup volunteer', 'ground team',
      'স্বেচ্ছাসেবক', 'সাহায্য করতে চাই', 'যোগদান',
      'स्वयंसेवक', 'मदद करना चाहता हूँ', 'रजिस्ट्रेशन',
      'स्वयंसेवक', 'हेफाजाब', 'मुं थिसन',
      'স্বেচ্ছাসেৱক', 'সহায় কৰিব বিচাৰো'
    ],
    isPublic: true,
    requiresAuth: false
  },
  DONATE_AID: {
    id: 'DONATE_AID',
    path: '/donate',
    titles: {
      en: 'Donate Relief Supplies & Funds',
      hi: 'राहत सामग्री और सहायता दान करें',
      bn: 'ত্রাণ সামগ্রী ও তহবিল দান করুন',
      br: 'राहत जामुं आरो रां दान हो',
      as: 'সাহায্য সামগ্ৰী আৰু দান বৰঙণি'
    },
    actionLabels: {
      en: 'Donate Aid',
      hi: 'दान करें',
      bn: 'দান করুন',
      br: 'दान हो',
      as: 'দান কৰক'
    },
    description: {
      en: 'Contribute dry rations, water purifiers, medicines, tarpaulins, or funds directly to accredited relief organizations.',
      hi: 'मान्यता प्राप्त राहत संगठनों को सूखा राशन, जल शोधक, दवाएं, या धन दान करें।',
      bn: 'অনুমোদিত সংস্থায় শুকনো খাবার, পানি বিশুদ্ধকরণ ট্যাবলেট, ওষুধ বা তহবিল দান করুন।',
      br: 'राहत आफादफोरनो जामुं, दै साफा खालामग्रा, मुलि आरो रां दान हो।',
      as: 'শুকান খাদ্য, ঔষধ বা পুঁজি দান কৰি বানাক্ৰান্ত লোকসকলক সহায় কৰক।'
    },
    keywords: [
      'donate', 'donation', 'fund', 'money', 'food donation', 'tarpaulin', 'contribute', 'give',
      'দান', 'তহবিল', 'টাকা', 'সাহায্য পাঠানো',
      'दान', 'पैसे', 'सहायता राशि', 'राशन दान',
      'दान', 'रां', 'जामुं दान',
      'দান', 'বৰঙণি', 'টকা পইচা'
    ],
    isPublic: true,
    requiresAuth: false
  },
  LOGIN: {
    id: 'LOGIN',
    path: '/login',
    titles: {
      en: 'Staff & Responder Secure Sign In',
      hi: 'कर्मचारी और प्रतिक्रिया दल साइन इन',
      bn: 'কর্মী ও উদ্ধারকারী দলের লগইন',
      br: 'कर्मचारी आरो उद्धार हान्जा लगिन',
      as: 'কৰ্মচাৰী আৰু উদ্ধাৰকাৰী দলৰ প্ৰৱেশ'
    },
    actionLabels: {
      en: 'Go to Sign In',
      hi: 'साइन इन करें',
      bn: 'লগইন করুন',
      br: 'लगिन खालाम',
      as: 'লগইন কৰক'
    },
    description: {
      en: 'Secure portal for Administrators, SDRF/NDRF Rescue Teams, NGOs, and Registered Volunteers.',
      hi: 'प्रशासकों, बचाव दलों, गैर सरकारी संगठनों और पंजीकृत स्वयंसेवकों के लिए सुरक्षित पोर्टल।',
      bn: 'প্রশাসক, উদ্ধার দল, এনজিও এবং নিবন্ধিত স্বেচ্ছাসেবকদের জন্য সুরক্ষিত পোর্টাল।',
      br: 'गाहाय बिबानगिरि, उद्धार हान्जा, NGO आरो स्वयंसेवकफोरनि थाखाय लगिन।',
      as: 'প্ৰশাসক, উদ্ধাৰকাৰী দল, NGO আৰু স্বেচ্ছাসেৱকসকলৰ সুৰক্ষিত প্ৰৱেশদ্বাৰ।'
    },
    keywords: [
      'login', 'signin', 'sign in', 'account', 'staff', 'rescue team login', 'admin login', 'ngo login', 'password',
      'লগইন', 'সাইন ইন', 'অ্যাকাউন্ট', 'উদ্ধার দল লগইন',
      'लॉगिन', 'साइन इन', 'अकाउंट', 'टीम लॉगिन',
      'लगिन', 'साइन इन',
      'লগইন', 'প্ৰৱেশ'
    ],
    isPublic: true,
    requiresAuth: false
  },
  REGISTER: {
    id: 'REGISTER',
    path: '/register',
    titles: {
      en: 'Create Account / Join Network',
      hi: 'खाता बनाएं / नेटवर्क से जुड़ें',
      bn: 'অ্যাকাউন্ট তৈরি করুন / নেটওয়ার্কে যোগ দিন',
      br: 'एकाउन्ट बानाय / नेटवार्कआव हाब',
      as: 'একাউণ্ট খোলক / দলত অন্তৰ্ভুক্ত হওক'
    },
    actionLabels: {
      en: 'Go to Registration',
      hi: 'पंजीकरण करें',
      bn: 'নিবন্ধন করুন',
      br: 'मुं थिसन',
      as: 'পঞ্জীয়ন কৰক'
    },
    description: {
      en: 'Register a new agency, citizen, or volunteer profile with verified email and phone verification.',
      hi: 'ईमेल और फोन सत्यापन के साथ एक नई एजेंसी, नागरिक, या स्वयंसेवक प्रोफ़ाइल पंजीकृत करें।',
      bn: 'যাচাইকৃত ইমেইল ও ফোন নম্বর দিয়ে নতুন অ্যাকাউন্ট বা প্রোফাইল তৈরি করুন।',
      br: 'इमैल आरो फन भेरिफाइ खालामनानै गोदान एकाउन्ट बानाय।',
      as: 'ইমেইল আৰু ফোন নম্বৰ সত্যাপন কৰি নতুন একাউণ্ট পঞ্জীয়ন কৰক।'
    },
    keywords: [
      'register', 'signup', 'sign up', 'create account', 'new user', 'join',
      'নিবন্ধন', 'রেজিস্টার', 'সাইন আপ', 'নতুন অ্যাকাউন্ট',
      'रजिस्टर', 'साइन अप', 'नया खाता',
      'मुं थिसन', 'गोदान एकाउन्ट',
      'পঞ্জীয়ন', 'নতুন একাউণ্ট'
    ],
    isPublic: true,
    requiresAuth: false
  }
};

export interface GuideAnswer {
  reply: string;
  destination: {
    id: string;
    path: string;
    title: string;
    actionLabel: string;
  } | null;
  suggestedFollowUps: string[];
}

export interface FAQItem {
  id: string;
  keywords: string[];
  destinationId: string | null;
  answers: Record<SupportedLanguage, string>;
  followUps: Record<SupportedLanguage, string[]>;
}

export const VERIFIED_FAQS: FAQItem[] = [
  {
    id: 'HOW_TO_REPORT_EMERGENCY',
    keywords: [
      'report', 'how to report', 'emergency report', 'stranded', 'water rising', 'save us', 'sos',
      'কীভাবে রিপোর্ট করব', 'জরুরি অবস্থা রিপোর্ট', 'আটকে পড়েছি', 'উদ্ধার করুন',
      'कैसे रिपोर्ट करें', 'आपातकाल रिपोर्ट', 'फंसे हुए हैं', 'मदद चाहिए',
      'माबोरै आपत खौरां हरनो', 'उद्धार खालाम', 'दै बांदों',
      'কেনেদৰে আবেদন কৰিম', 'জৰুৰীকালীন সাহায্য', 'উদ্ধাৰ কৰক'
    ],
    destinationId: 'REPORT_EMERGENCY',
    answers: {
      en: 'To report a flood emergency, use our Emergency Report Form or Voice SOS. The form allows you to select request type (rescue, medical, food/water, shelter), enter the number of stranded people, and share GPS coordinates.',
      hi: 'बाढ़ आपातकाल की रिपोर्ट करने के लिए, हमारे आपातकालीन रिपोर्ट फॉर्म या वॉयस एसओएस का उपयोग करें। आप बचाव, चिकित्सा, भोजन/पानी का चयन कर सकते हैं और जीपीएस लोकेशन भेज सकते हैं।',
      bn: 'বন্যা পরিস্থিতির জরুরি রিপোর্ট করতে আমাদের "জরুরি রিপোর্ট ফর্ম" বা "ভয়েস এসওএস" ব্যবহার করুন। এখানে আপনি উদ্ধারের ধরন, মানুষের সংখ্যা এবং জিপিএস লোকেশন সরাসরি জানাতে পারবেন।',
      br: 'दैदेन आपत खौरां हरनो थाखाय जोंनि "आपत फर्म" बा "राव एसओएस" बाहाय। बेयाव नोंथाङा उद्धार, मुलि, जामुं आरो न-बांनि दाबि आरो GPS जायगा हरनो हागोन।',
      as: 'বানপানীৰ জৰুৰীকালীন আবেদন জনাবলৈ "জৰুৰীকালীন ফৰ্ম" বা "ভইচ এছ অ\' এছ" ব্যৱহাৰ কৰক। তাত উদ্ধাৰ, চিকিৎসা, খাদ্য আৰু জিপিএছ স্থান প্ৰেৰণ কৰিব পাৰিব।'
    },
    followUps: {
      en: ['How do I use Voice SOS?', 'How to track my SOS status?', 'What is the NDRF helpline number?'],
      hi: ['वॉयस एसओएस का उपयोग कैसे करें?', 'अपनी एसओएस स्थिति कैसे ट्रैक करें?', 'एनडीआरएफ हेल्पलाइन नंबर क्या है?'],
      bn: ['ভয়েস এসওএস কীভাবে কাজ করে?', 'এসওএস স্ট্যাটাস কীভাবে ট্র্যাক করব?', 'এনডিআরএফ হেল্পলাইন নম্বর কী?'],
      br: ['राव एसओएस माबोरै बाहायनांगौ?', 'एसओएस थासारि माबोरै नायनो?', 'NDRF हेल्पलाइन नम्बर मा?'],
      as: ['ভইচ এছ অ\' এছ কেনেকৈ ব্যৱহাৰ কৰিম?', 'মোৰ অনুৰোধৰ অৱস্থা কেনেকৈ চাম?', 'NDRF ৰ হেল্পলাইন নম্বৰ কি?']
    }
  },
  {
    id: 'HOW_TO_USE_VOICE_SOS',
    keywords: [
      'voice sos', 'speak', 'audio', 'without typing', 'recording', 'handsfree',
      'ভয়েস এসওএস', 'মুখে বলে', 'কথা বলে', 'টাইপ না করে',
      'वॉयस एसओएस', 'बोलकर', 'आवाज से', 'बिना टाइप किए',
      'राव एसओएस', 'बुंनानै', 'रेकर्ड',
      'ভইচ এছ অ\' এছ', 'মাত মাতি', 'টাইপ নকৰাকৈ'
    ],
    destinationId: 'VOICE_SOS',
    answers: {
      en: 'Voice SOS lets you report emergencies by speaking. Click "Open Voice SOS", tap the microphone, describe your situation (location, number of people, urgent needs), and submit. It attaches your audio and GPS location automatically.',
      hi: 'वॉयस एसओएस आपको बोलकर आपात स्थिति रिपोर्ट करने की सुविधा देता है। "वॉयस एसओएस खोलें" पर क्लिक करें, माइक दबाएं, अपनी स्थिति बताएं और सबमिट करें। यह आपका ऑडियो और जीपीएस अपने आप जोड़ लेता है।',
      bn: 'ভয়েস এসওএস আপনাকে টাইপ না করে মুখে বলে জরুরি রিপোর্ট পাঠাতে সাহায্য করে। "ভয়েস এসওএস" পেজে গিয়ে মাইক আইকনে চাপ দিন, পরিস্থিতি বর্ণনা করুন এবং জমা দিন। এটি আপনার অডিও ও জিপিএস স্বয়ংক্রিয়ভাবে সংগ্রহ করে।',
      br: 'राव एसओएस आ नोंथांखौ बुंनानै आपत खौरां हरनो हेफाजाब होयो। "राव एसओएस खुलि" आव थु, माइक बाहायनानै नोंनि थासारि बुं आरो सबमिट खालाम।',
      as: 'ভইচ এছ অ\' এছত আপুনি মাত মাতিয়েই জৰুৰী খবৰ পঠিয়াব পাৰে। মাইক বুটামত ক্লিক কৰি কওক আৰু জমা দিয়ক। ই অডিঅ\' আৰু জিপিএছ সংগ্ৰহ কৰে।'
    },
    followUps: {
      en: ['Go to Voice SOS', 'Do I need to login for Voice SOS?', 'How do I find a relief shelter?'],
      hi: ['वॉयस एसओएस पर जाएं', 'क्या वॉयस एसओएस के लिए लॉगिन ज़रूरी है?', 'राहत शिविर कैसे खोजें?'],
      bn: ['ভয়েস এসওএসে যান', 'ভয়েস এসওএসের জন্য কি লগইন দরকার?', 'ত্রাণ শিবির কীভাবে খুঁজে পাব?'],
      br: ['राव एसओएसआव थां', 'लगिन खालामनांगौ नामा?', 'राहत केम्प माबोरै नागिरनो?'],
      as: ['ভইচ এছ অ\' এচলৈ যাওক', 'লগইন কৰাৰ প্ৰয়োজন আছেনে?', 'আশ্ৰয় শিবিৰ ক\'ত পাম?']
    }
  },
  {
    id: 'HOW_TO_TRACK_EMERGENCY',
    keywords: [
      'track', 'where is rescue', 'status', 'progress', 'sos code', 'request id',
      'ট্র্যাক', 'আমার আবেদন কোথায়', 'উদ্ধার দল কোথায়', 'স্ট্যাটাস', 'কোড',
      'ट्रैक', 'स्टेटस', 'टीम कहाँ पहुँची', 'अनुरोध आईडी', 'प्रगति',
      'नाय', 'थासारि', 'उद्धार हान्जा बबेयाव', 'आइदि',
      'ট্ৰেক', 'অৱস্থা', 'উদ্ধাৰকাৰী দল ক\'ত পালেহি', 'অনুগ্ৰহ কৰি কওক'
    ],
    destinationId: 'TRACK_EMERGENCY',
    answers: {
      en: 'To track your emergency request, go to the Track Emergency page and enter your 6-character SOS ID (e.g., "A3F9K2") or your registered phone number. You will see real-time updates: Reported, Assigned, En Route, In Progress, or Resolved.',
      hi: 'अपने आपातकालीन अनुरोध को ट्रैक करने के लिए, "ट्रैक आपातकाल" पृष्ठ पर जाएं और अपनी 6-अंकीय एसओएस आईडी या फोन नंबर दर्ज करें। आप वास्तविक समय की प्रगति देख सकते हैं।',
      bn: 'আপনার জরুরি অনুরোধ ট্র্যাক করতে "জরুরি এসওএস স্থিতি ট্র্যাক" পেজে গিয়ে ৬ অক্ষরের অনুরোধ আইডি বা ফোন নম্বর দিন। আপনি উদ্ধার দলের অগ্রগতি লাইভ দেখতে পাবেন।',
      br: 'नोंथांनि आपत दाबि नायनो थाखाय "एसओएस थासारि नाय" बिलाइआव थां आरो ६ हांखोनि SOS ID बा फन नम्बर सो। नोंथाङा लाइभ थासारि नुनो मोनगोन।',
      as: 'আপোনাৰ জৰুৰীকালীন আবেদন ট্ৰেক কৰিবলৈ "ট্ৰেক পেজ"লৈ যাওক আৰু ৬টা আখৰৰ আই ডি বা ফোন নম্বৰ দিয়ক। উদ্ধাৰকাৰী দলৰ গতিবিধি লাইভ দেখিব।'
    },
    followUps: {
      en: ['Open Track Emergency', 'I lost my SOS ID, what should I do?', 'What are emergency hotlines?'],
      hi: ['एसओएस ट्रैक खोलें', 'मेरी आईडी खो गई है तो क्या करूं?', 'आपातकालीन हॉटलाइन क्या हैं?'],
      bn: ['ট্র্যাক পেজে যান', 'আইডি হারিয়ে গেলে কী করব?', 'জরুরি হটলাইন নম্বর কোনগুলো?'],
      br: ['एसओएस थासारि नाय', 'आइदि गोमाबा मा खालामनांगौ?', 'आपत हेल्पलाइन नम्बर मा?'],
      as: ['ট্ৰেক পেজ খোলক', 'আই ডি হেৰালে কি কৰিম?', 'জৰুৰী হেল্পলাইন নম্বৰবোৰ কি?']
    }
  },
  {
    id: 'HOW_TO_FIND_SHELTERS',
    keywords: [
      'shelter', 'camp', 'relief camp', 'evacuation', 'where can i go', 'bed capacity',
      'ত্রাণ শিবির', 'ক্যাম্প', 'আশ্রয়কেন্দ্র', 'থাকার জায়গা', 'কোথায় যাব',
      'राहत शिविर', 'शरणस्थल', 'कैंप', 'कहाँ जाएं', 'खाली बेड',
      'आश्रय', 'केम्प', 'राहत केम्प', 'बबेयाव थांनो',
      'আশ্ৰয় শিবিৰ', 'ৰিলিফ কেম্প', 'ক\'ত থাকিব পাৰি'
    ],
    destinationId: 'FIND_SHELTERS',
    answers: {
      en: 'You can find active relief shelters and evacuation centers on our Find Shelters page. The interactive map shows camp locations, total capacity, remaining bed space, and whether food or medical assistance is on-site.',
      hi: 'आप "राहत शिविर खोजें" पृष्ठ पर सक्रिय राहत शिविर और आश्रय स्थल देख सकते हैं। मानचित्र शिविर के स्थान, कुल क्षमता, उपलब्ध बिस्तर और सुविधाओं को प्रदर्शित करता है।',
      bn: 'আমাদের "ত্রাণ শিবির এবং আশ্রয়কেন্দ্র" পেজে গিয়ে আপনি নিকটবর্তী আশ্রয়কেন্দ্রগুলির অবস্থান, অবশিষ্ট খালি শয্যা এবং খাদ্য ও প্রাথমিক চিকিৎসার তথ্য দেখতে পাবেন।',
      br: 'नोंथाङा "आश्रय आरो राहत केम्प नागिर" बिलाइआव थांनानै केम्पफोरनि मेप, थाग्रा जायगा, जामुं आरो मुलि सुबिधा नायनो हागोन।',
      as: '"আশ্ৰয় শিবিৰ বিচাৰক" পেজত সক্ৰিয় শিবিৰসমূহৰ মানচিত্ৰ, খালী স্থান, খাদ্য আৰু ঔষধৰ সুবিধা চাব পাৰিব।'
    },
    followUps: {
      en: ['Show Relief Shelters', 'Are shelters free of cost?', 'Emergency contact numbers'],
      hi: ['राहत शिविर दिखाएं', 'क्या शिविर निःशुल्क हैं?', 'आपातकालीन संपर्क नंबर'],
      bn: ['আশ্রয়কেন্দ্রগুলো দেখান', 'শিবিরে থাকার জন্য কি খরচ লাগে?', 'জরুরি যোগাযোগের নম্বর'],
      br: ['केम्पफोरखौ दिन्थि', 'राहत केम्पाव रां नांगौ नामा?', 'आपत फन नम्बर'],
      as: ['আশ্ৰয় শিবিৰ চাওক', 'শিবিৰসমূহত বিনামূলীয়া খাদ্য পোৱা যায়নে?', 'জৰুৰীকালীন ফোন নম্বৰ']
    }
  },
  {
    id: 'EMERGENCY_HELPLINES',
    keywords: [
      'helpline', 'contact', 'phone number', 'control room', 'ndrf number', 'sdrf number', 'ambulance', 'call',
      'হেল্পলাইন', 'জরুরি নম্বর', 'ফোন নম্বর', 'অ্যাম্বুলেন্স', 'এনডিআরএফ নম্বর', 'কন্ট্রোল রুম',
      'हेल्पलाइन', 'फोन नंबर', 'कॉल', 'एनडीआरएफ', 'एसडीआरएफ', 'एम्बुलेंस', 'पुलिस',
      'हेल्पलाइन', 'फन नम्बर', 'NDRF', 'एम्बुलेन्स', 'पुलिस',
      'হেল্পলাইন', 'ফোন নম্বৰ', 'এনডিআৰএফ নম্বৰ', 'এম্বুলেন্স'
    ],
    destinationId: 'EMERGENCY_CONTACTS',
    answers: {
      en: 'Official 24/7 National & State Emergency Helplines: NDRF & State Disaster Management (1070), Medical Ambulance (108), Police SOS (100 / 112), Fire & Rescue (101). Visit our Emergency Contacts page for regional control room directories.',
      hi: 'आधिकारिक 24/7 आपातकालीन नंबर: एनडीआरएफ/राज्य आपदा राहत (1070), एम्बुलेंस (108), पुलिस (100 या 112), दमकल (101)। जिला स्तर के नंबरों के लिए आपातकालीन संपर्क पेज देखें।',
      bn: 'জরুরি ২৪/৭ সরকারি হেল্পলাইন নম্বর: এনডিআরএফ ও দুর্যোগ ব্যবস্থাপনা (১০৭০), অ্যাম্বুলেন্স (১০৮), পুলিশ (১০০ অথবা ১১২), ফায়ার সার্ভিস (১০১)। বিস্তারিত দেখতে আমাদের জরুরি যোগাযোগ পেজে যান।',
      br: 'गाहाय सरकारी २४/७ आपत हेल्पलाइन: NDRF/SDRF (१०७০), एम्बुलेन्स (১০৮), पुलिस (১০০ / ১১২), अरनार (१०১)। गुबुन नम्बर नायनो थाखाय हेल्पलाइन बिलाइआव थां।',
      as: 'চৰকাৰী ২৪/৭ জৰুৰীকালীন নম্বৰ: NDRF/SDRF (১০৭০), এম্বুলেন্স (১০৮), আৰক্ষী (১০০ বা ১১২), অগ্নিনিৰ্বাপক (১০১)। জিলাভিত্তিক নিয়ন্ত্ৰণ কক্ষৰ নম্বৰ চাবলৈ যোগাযোগ পেজ চাওক।'
    },
    followUps: {
      en: ['View Emergency Contacts', 'How do I submit an SOS?', 'Where are relief camps?'],
      hi: ['आपातकालीन संपर्क देखें', 'एसओएस कैसे दर्ज करें?', 'राहत शिविर कहाँ हैं?'],
      bn: ['জরুরি যোগাযোগ তালিকা দেখুন', 'জরুরি এসওএস কীভাবে দেব?', 'ত্রাণ শিবির কোথায়?'],
      br: ['हेल्पलाइन नाय', 'एसओएस माबोरै हरनो?', 'राहत केम्प बबेयाव?'],
      as: ['যোগাযোগ তালিকা চাওক', 'এছ অ\' এছ কেনেকৈ দিম?', 'আশ্ৰয় শিবিৰ ক\'ত আছে?']
    }
  },
  {
    id: 'HOW_TO_VOLUNTEER',
    keywords: [
      'volunteer', 'join', 'help out', 'participate', 'distribute food', 'volunteer registration',
      'স্বেচ্ছাসেবক', 'সাহায্য করতে চাই', 'যোগদান করতে চাই', 'খাবার বিতরণ',
      'स्वयंसेवक', 'मदद करना चाहता हूँ', 'रजिस्ट्रेशन', 'सहयोग',
      'स्वयंसेवक', 'हेफाजाब होनो लुबैदों', 'मुं थिसन',
      'স্বেচ্ছাসেৱক', 'সহায় কৰিব বিচাৰিছো', 'যোগদান'
    ],
    destinationId: 'VOLUNTEER_REGISTER',
    answers: {
      en: 'You can join our on-ground flood relief efforts by visiting the Volunteer page. Register your skills (first aid, boat operations, supply distribution, food preparation, language translation) and local district.',
      hi: 'आप "स्वयंसेवक" पृष्ठ पर जाकर हमारे राहत प्रयासों से जुड़ सकते हैं। अपना कौशल (प्राथमिक चिकित्सा, नाव संचालन, सामग्री वितरण) और जिला दर्ज करें।',
      bn: 'আমাদের বন্যা ত্রাণ কার্যক্রমে সহায়তা করতে "স্বেচ্ছাসেবক" পেজে যান। আপনার দক্ষতা (প্রাথমিক চিকিৎসা, নৌকা পরিচালনা, খাদ্য বিতরণ ইত্যাদি) এবং জেলা উল্লেখ করে নিবন্ধন করুন।',
      br: 'नोंथाङा जोंनि राहत खामानियाव हेफाजाब होनो थाखाय "स्वयंसेवक" बिलाइआव थांनानै मुं थिसननो हागोन।',
      as: 'বানসাহায্য অভিযানত সহায় কৰিবলৈ "স্বেচ্ছাসেৱক" পেজলৈ যাওক। আপোনাৰ দক্ষতা আৰু জিলা উল্লেখ কৰি পঞ্জীয়ন কৰক।'
    },
    followUps: {
      en: ['Go to Volunteer Page', 'How to donate aid supplies?', 'Report an emergency'],
      hi: ['स्वयंसेवक पेज पर जाएं', 'राहत सामग्री कैसे दान करें?', 'आपातकाल रिपोर्ट करें'],
      bn: ['স্বেচ্ছাসেবক পেজে যান', 'ত্রাণ সামগ্রী কীভাবে দান করব?', 'জরুরি রিপোর্ট করুন'],
      br: ['स्वयंसेवक बिलाइआव थां', 'राहत दान माबोरै होनो?', 'आपत खौरां हर'],
      as: ['স্বেচ্ছাসেৱক পেজলৈ যাওক', 'সাহায্য কেনেকৈ দান কৰিম?', 'জৰুৰীকালীন আবেদন']
    }
  },
  {
    id: 'HOW_TO_DONATE',
    keywords: [
      'donate', 'donation', 'give money', 'ration donation', 'tarpaulin', 'contribute',
      'দান', 'সাহায্য পাঠাব', 'টাকা দান', 'ত্রাণ সামগ্রী দান',
      'दान', 'सहायता राशि', 'राशन दान', 'पैसे भेजना',
      'दान हो', 'रां दान', 'जामुं दान',
      'দান', 'বৰঙণি', 'টকা পইচা দান'
    ],
    destinationId: 'DONATE_AID',
    answers: {
      en: 'To donate funds or essential supplies (drinking water, medicines, dry rations, hygiene kits, tarpaulins), navigate to our Donate Aid page. You can contribute directly to verified relief funds and drop-off hubs.',
      hi: 'धन या आवश्यक सामग्री (पीने का पानी, दवाएं, सूखा राशन, तिरपाल) दान करने के लिए हमारे "दान करें" पृष्ठ पर जाएं।',
      bn: 'তহবিল বা জরুরি ত্রাণ সামগ্রী (খাবার পানি, ওষুধ, শুকনো খাবার, ত্রিপল) দান করতে "ত্রাণ সামগ্রী ও তহবিল দান" পেজে যান।',
      br: 'रां बा जामुं (लोंनाय दै, मुलि, जामुं, तिरपाल) दान होनो थाखाय जोंनि "दान हो" बिलाइआव थां।',
      as: 'পুঁজি বা সাহায্য সামগ্ৰী (বিশুদ্ধ খোৱাপানী, ঔষধ, শুকান খাদ্য, তিৰ্পাল) দান কৰিবলৈ "দান" পেজ চাওক।'
    },
    followUps: {
      en: ['Go to Donate Page', 'Find local shelters', 'Track an SOS'],
      hi: ['दान पेज पर जाएं', 'राहत शिविर खोजें', 'एसओएस ट्रैक करें'],
      bn: ['দান পেজে যান', 'ত্রাণ শিবির খুঁজুন', 'এসওএস ট্র্যাক করুন'],
      br: ['दान बिलाइआव थां', 'राहत केम्प नागिर', 'एसओएस नाय'],
      as: ['দান পেজলৈ যাওক', 'আশ্ৰয় শিবিৰ বিচাৰক', 'এছ অ\' এছ ট্ৰেক কৰক']
    }
  },
  {
    id: 'STAFF_RESCUE_LOGIN',
    keywords: [
      'login', 'signin', 'sign in', 'staff login', 'rescue team signin', 'rescue team sign in', 'rescue team member', 'rescue responder', 'admin dashboard', 'ngo portal', 'portal', 'password',
      'লগইন', 'সাইন ইন', 'রেসকিউ টিম লগইন', 'অ্যাডমিন ড্যাশবোর্ড',
      'लॉगिन', 'साइन इन', 'टीम लॉगिन', 'एडमिन पोर्टल',
      'लगिन', 'साइन इन', 'हान्जा लगिन',
      'লগইন', 'প্ৰৱেশ', 'উদ্ধাৰকাৰী দলৰ লগইন'
    ],
    destinationId: 'LOGIN',
    answers: {
      en: 'Authorized rescue teams, NDRF/SDRF personnel, NGOs, and administrators can sign in at the Staff & Partner Login page. Once signed in, you will be redirected to your specialized operational dashboard.',
      hi: 'अधिकृत बचाव दल, आपदा राहत कर्मी, एनजीओ और व्यवस्थापक "कर्मचारी और पार्टनर लॉगिन" पृष्ठ पर साइन इन कर सकते हैं। लॉगिन के बाद आप अपने डैशबोर्ड पर निर्देशित होंगे।',
      bn: 'অনুমোদিত উদ্ধারকারী দল, এনডিআরএফ/এসডিআরএফ কর্মী, এনজিও এবং অ্যাডমিনিস্ট্রেটররা "কর্মী ও পার্টনার লগইন" পেজে সাইন ইন করতে পারেন।',
      br: 'उद्धार हान्जा, सरकारी मावथि, NGO आरो गाहाय बिबानगिरिफोरा "कर्मचारी लगिन" आव लगिन खालामनो हागोन।',
      as: 'উদ্ধাৰকাৰী দল, NGO আৰু প্ৰশাসকসকলে "লগইন" পেজত প্ৰৱেশ কৰি নিজৰ বিশেষ কাৰ্যালয় ডেছব\'ৰ্ড চাব পাৰিব।'
    },
    followUps: {
      en: ['Go to Login Page', 'How to register a new account?', 'Report an emergency'],
      hi: ['लॉगिन पेज पर जाएं', 'नया खाता कैसे बनाएं?', 'आपातकाल रिपोर्ट करें'],
      bn: ['লগইন পেজে যান', 'নতুন অ্যাকাউন্ট কীভাবে খুলব?', 'জরুরি রিপোর্ট করুন'],
      br: ['लगिन बिलाइआव थां', 'गोदान एकाउन्ट माबोरै बानायनो?', 'आपत खौरां हर'],
      as: ['লগইন পেজলৈ যাওক', 'নতুন একাউণ্ট কেনেকৈ পঞ্জীয়ন কৰিম?', 'জৰুৰীকালীন আবেদন']
    }
  },
  {
    id: 'SAFETY_RESTRICTIONS',
    keywords: [
      'dispatch boat now', 'change status', 'delete request', 'forecast flood', 'send helicopter', 'predict water level',
      'নৌকা পাঠান', 'হেলিকপ্টার পাঠান', 'স্ট্যাটাস বদলান', 'বন্যা পূর্বাভাস',
      'तुरंत नाव भेजो', 'हेलीकॉप्टर भेजो', 'स्टेटस बदलो', 'बाढ़ की भविष्यवाणी',
      'नाव दैथायहर', 'हेलिकप्टर दैथायहर', 'थासारि सोलाय',
      'নাও পঠিয়াওক', 'হেলিকপ্টাৰ পঠিয়াওক', 'অৱস্থা সলনি কৰক'
    ],
    destinationId: 'EMERGENCY_CONTACTS',
    answers: {
      en: 'As an AI Website Navigation Assistant, I cannot directly dispatch rescue boats or helicopters, nor can I edit emergency records. For immediate life-saving rescue, please call NDRF at 1070 or 112, or submit an SOS report immediately.',
      hi: 'एआई नेविगेशन सहायक के रूप में, मैं सीधे बचाव नाव या हेलीकॉप्टर नहीं भेज सकता और न ही डेटाबेस रिकॉर्ड बदल सकता हूँ। तत्काल जीवन रक्षक सहायता के लिए कृपया 1070 या 112 पर कॉल करें या तुरंत एसओएस फॉर्म भरें।',
      bn: 'এআই নেভিগেশন সহকারী হিসেবে আমি সরাসরি উদ্ধারকারী নৌকা বা হেলিকপ্টার পাঠাতে বা ডেটাবেজ পরিবর্তন করতে পারি না। তাৎক্ষণিক জীবন বাঁচানোর সহায়তার জন্য অনুগ্রহ করে ১০৭০ বা ১১২ এ কল করুন অথবা দ্রুত জরুরি এসওএস পাঠান।',
      br: 'AI बिलाइ दिन्थिगिरि जानानै आं थोंजों नावो बा हेलिकप्टर दैथायहरनो हाया आरो खौरां सोलायनो हाया। गोनांथार हेफाजाबनि थाखाय NDRF खौ १०৭০ आव फन खालाम बा SOS हर।',
      as: 'এআই সহায়ক হিচাপে মই প্ৰত্যক্ষভাৱে নাও বা হেলিকপ্টাৰ প্ৰেৰণ কৰিব নোৱাৰো। জীৱন ৰক্ষাৰ তাৎক্ষণিক সহায়ৰ বাবে অনুগ্ৰহ কৰি ১০৭০ নম্বৰত ফোন কৰক বা এছ অ\' এছ ফৰ্ম পূৰণ কৰক।'
    },
    followUps: {
      en: ['Call Emergency Hotlines', 'Report Emergency SOS', 'Open Voice SOS'],
      hi: ['आपातकालीन हॉटलाइन पर कॉल करें', 'एसओएस रिपोर्ट करें', 'वॉयस एसओएस खोलें'],
      bn: ['জরুরি হটলাইনে কল করুন', 'জরুরি এসওএস জমা দিন', 'ভয়েস এসওএস খুলুন'],
      br: ['हेल्पलाइनआव फन खालाम', 'एसओएस हर', 'राव एसओएस खुलि'],
      as: ['হেল্পলাইনত ফোন কৰক', 'এছ অ\' এছ আবেদন কৰক', 'ভইচ এছ অ\' এছ খোলক']
    }
  }
];

export function detectLanguage(text: string): SupportedLanguage {
  if (!text) return 'en';
  // Assamese & Bengali share script, but distinct letters/patterns exist:
  // Assamese letters: 'ৰ' (\u09F0), 'ৱ' (\u09F1)
  if (/[\u09F0\u09F1]/.test(text)) {
    return 'as';
  }
  // Bengali / Assamese script block \u0980-\u09FF
  if (/[\u0980-\u09FF]/.test(text)) {
    // Check common Assamese words
    if (/(কেনেদৰে|আবেদন|বানপানী|সহায়|কৰক|আছেনে|চাব|লৈ|লগতে)/.test(text)) {
      return 'as';
    }
    return 'bn';
  }
  // Devanagari script block \u0900-\u097F (Hindi or Bodo written in Devanagari)
  if (/[\u0900-\u097F]/.test(text)) {
    // Check Bodo specific vocabulary
    if (/(माबोरै|नोंथां|नोंथाङा|दैदेन|खौरां|नागिर|हरनो|बाहाय|हागोन|बिलाइ|जायगा|हान्जा|मुं|थिसन|दैथाय|खालाम)/.test(text)) {
      return 'br';
    }
    return 'hi';
  }
  return 'en';
}

export function matchDeterministicGuide(query: string, preferredLang?: SupportedLanguage): GuideAnswer {
  const lang = preferredLang || detectLanguage(query);
  const normalized = query.toLowerCase().trim();

  // 1. Direct check against FAQ items with score
  let bestFaq: FAQItem | null = null;
  let bestScore = 0;

  for (const faq of VERIFIED_FAQS) {
    let score = 0;
    for (const kw of faq.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        score += kw.length; // weight longer matches higher
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestFaq = faq;
    }
  }

  if (bestFaq && bestScore >= 3) {
    const dest = bestFaq.destinationId ? ROUTE_REGISTRY[bestFaq.destinationId] : null;
    return {
      reply: bestFaq.answers[lang] || bestFaq.answers.en,
      destination: dest ? {
        id: dest.id,
        path: dest.path,
        title: dest.titles[lang] || dest.titles.en,
        actionLabel: dest.actionLabels[lang] || dest.actionLabels.en
      } : null,
      suggestedFollowUps: bestFaq.followUps[lang] || bestFaq.followUps.en
    };
  }

  // 2. Direct check against Route Registry keywords
  let bestDest: RouteDestination | null = null;
  let destScore = 0;

  for (const key of Object.keys(ROUTE_REGISTRY)) {
    const dest = ROUTE_REGISTRY[key];
    let score = 0;
    for (const kw of dest.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        score += kw.length;
      }
    }
    if (score > destScore) {
      destScore = score;
      bestDest = dest;
    }
  }

  if (bestDest && destScore >= 3) {
    return {
      reply: bestDest.description[lang] || bestDest.description.en,
      destination: {
        id: bestDest.id,
        path: bestDest.path,
        title: bestDest.titles[lang] || bestDest.titles.en,
        actionLabel: bestDest.actionLabels[lang] || bestDest.actionLabels.en
      },
      suggestedFollowUps: [
        'How do I report an emergency?',
        'Where can I find relief shelters?',
        'Emergency contact phone numbers'
      ]
    };
  }

  // 3. Fallback greeting & guidance
  const defaultReplies: Record<SupportedLanguage, string> = {
    en: 'I am your FloodRelief Website Guide. I can help you report an emergency, track your SOS request, find open relief shelters, look up emergency helpline numbers, or sign up as a volunteer. How may I guide you today?',
    hi: 'मैं आपका फ्लडरिलीफ वेबसाइट गाइड हूँ। मैं आपको आपातकाल की रिपोर्ट करने, एसओएस स्थिति ट्रैक करने, राहत शिविर खोजने या हेल्पलाइन नंबर प्राप्त करने में मदद कर सकता हूँ। मैं आपकी क्या सहायता करूँ?',
    bn: 'আমি আপনার ফ্লাডরিলিফ ওয়েবসাইট গাইড। আমি আপনাকে জরুরি রিপোর্ট জমা দিতে, এসওএস স্থিতি দেখতে, ত্রাণ শিবির খুঁজতে বা হেল্পলাইন নম্বর পেতে সহায়তা করতে পারি। আমি কীভাবে আপনাকে সাহায্য করতে পারি?',
    br: 'आं नोंथांनि फ्लडरिलीफ बिलाइ दिन्थिगिरि। आं नोंथांखौ आपत खौरां हरनो, एसओएस थासारि नायनो, राहत केम्प नागिरनो बा हेल्पलाइन नम्बर मोननो हेफाजाब होनो हाগोन।',
    as: 'মই আপোনাৰ ফ্লাডৰিলিফ ৱেবছাইট সহায়ক। মই আপোনাক জৰুৰী আবেদন দাখিল কৰিবলৈ, এছ অ\' এছ অৱস্থা ট্ৰেক কৰিবলৈ, আশ্ৰয় শিবিৰ বিচাৰিবলৈ সহায় কৰিব পাৰো। মই আপোনাক কেনেকৈ সহায় কৰিব পাৰো?'
  };

  const defaultFollowUps: Record<SupportedLanguage, string[]> = {
    en: ['How do I report an emergency?', 'Track my SOS status', 'Find relief shelters', 'Emergency helpline numbers'],
    hi: ['आपातकाल कैसे रिपोर्ट करें?', 'एसओएस स्थिति ट्रैक करें', 'राहत शिविर खोजें', 'हेल्पलाइन नंबर'],
    bn: ['জরুরি রিপোর্ট কীভাবে করব?', 'এসওএস স্ট্যাটাস ট্র্যাক করুন', 'ত্রাণ শিবির খুঁজুন', 'জরুরি হেল্পলাইন নম্বর'],
    br: ['आपत खौरां माबोरै हरनो?', 'एसओएस थासारि नाय', 'राहत केम्प नागिर', 'आपत हेल्पलाइन'],
    as: ['জৰুৰীকালীন খবৰ কেনেকৈ দিম?', 'এছ অ\' এছ অৱস্থা চাওক', 'আশ্ৰয় শিবিৰ বিচাৰক', 'হেল্পলাইন নম্বৰ']
  };

  return {
    reply: defaultReplies[lang] || defaultReplies.en,
    destination: null,
    suggestedFollowUps: defaultFollowUps[lang] || defaultFollowUps.en
  };
}
