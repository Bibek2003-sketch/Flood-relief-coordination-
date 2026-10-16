import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  ArrowRight,
  RotateCcw,
  ShieldAlert,
  Loader2,
  Sparkles,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import botAvatarSvg from '../assets/bot-avatar.svg';

export type GuideLanguage = 'en' | 'hi' | 'bn' | 'br' | 'as';

interface Destination {
  id: string;
  path: string;
  title: string;
  actionLabel: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  destination?: Destination | null;
  suggestedFollowUps?: string[];
  timestamp: string;
}

const UI_STRINGS: Record<GuideLanguage, {
  title: string;
  subtitle: string;
  disclaimer: string;
  placeholder: string;
  initialGreeting: string;
  quickPrompts: string[];
  clearChat: string;
  badge: string;
}> = {
  en: {
    title: 'FloodRelief AI Guide',
    subtitle: 'Navigation & assistance',
    disclaimer: 'For life-threatening rescue, call 1070 / 112 or use Voice SOS immediately.',
    placeholder: 'Ask where to find shelters, report SOS, track status...',
    initialGreeting: 'Hello! I am your FloodRelief AI Guide. I can help you navigate the website, report flood emergencies, track your SOS request, find open relief shelters, or view emergency helpline numbers. How can I assist you?',
    quickPrompts: [
      '🚨 How do I report a flood emergency?',
      '🎙️ How does Voice SOS work?',
      '📍 Where can I track my SOS request?',
      '🏕️ How to find active relief camps?',
      '📞 What are the emergency helpline numbers?',
      '🤝 How to register as a volunteer?',
      '🔐 Staff & responder sign in'
    ],
    clearChat: 'Reset conversation',
    badge: 'AI GUIDE'
  },
  hi: {
    title: 'फ्लडरिलीफ एआई गाइड',
    subtitle: 'वेबसाइट नेविगेशन और सहायता',
    disclaimer: 'तत्काल बचाव के लिए 1070 / 112 पर कॉल करें या वॉयस एसओएस का उपयोग करें।',
    placeholder: 'पूछें: राहत शिविर कहाँ हैं, एसओएस कैसे करें...',
    initialGreeting: 'नमस्ते! मैं आपका फ्लडरिलीफ एआई गाइड हूँ। मैं आपको वेबसाइट नेविगेट करने, बाढ़ आपातकाल रिपोर्ट करने, अपनी एसओएस स्थिति ट्रैक करने, राहत शिविर खोजने या हेल्पलाइन नंबर प्राप्त करने में मदद कर सकता हूँ।',
    quickPrompts: [
      '🚨 बाढ़ आपातकाल कैसे दर्ज करें?',
      '🎙️ वॉयस एसओएस कैसे काम करता है?',
      '📍 एसओएस स्थिति कहाँ ट्रैक करें?',
      '🏕️ राहत शिविर और शरणस्थल कैसे खोजें?',
      '📞 आपातकालीन हेल्पलाइन नंबर क्या हैं?',
      '🤝 स्वयंसेवक के रूप में कैसे जुड़ें?',
      '🔐 कर्मचारी और बचाव दल लॉगिन'
    ],
    clearChat: 'चैट रीसेट करें',
    badge: 'एआई गाइड'
  },
  bn: {
    title: 'ফ্লাডরিলিফ এআই গাইড',
    subtitle: 'ওয়েবসাইট নেভিগেশন ও সহায়তা',
    disclaimer: 'জরুরি জীবন বাঁচানোর জন্য অবিলম্বে ১০৭০ / ১১২ নম্বরে কল করুন বা ভয়েস এসওএস দিন।',
    placeholder: 'জিজ্ঞাসা করুন: ত্রাণ শিবির কোথায়, জরুরি রিপোর্ট...',
    initialGreeting: 'নমস্কার! আমি আপনার ফ্লাডরিলিফ এআই গাইড। আমি আপনাকে জরুরি রিপোর্ট জমা দিতে, ভয়েস এসওএস ব্যবহার করতে, এসওএস স্ট্যাটাস ট্র্যাক করতে, ত্রাণ শিবির খুঁজতে ও সরকারি হেল্পলাইন নম্বর পেতে সহায়তা করতে পারি।',
    quickPrompts: [
      '🚨 কীভাবে বন্যা জরুরি অবস্থা রিপোর্ট করব?',
      '🎙️ ভয়েস এসওএস কীভাবে ব্যবহার করব?',
      '📍 এসওএস অনুরোধ কীভাবে ট্র্যাক করব?',
      '🏕️ নিকটবর্তী ত্রাণ শিবির কীভাবে খুঁজব?',
      '📞 দুর্যোগ জরুরি হেল্পলাইন নম্বরগুলো কী?',
      '🤝 স্বেচ্ছাসেবক হিসেবে কীভাবে যোগ দেব?',
      '🔐 উদ্ধারকারী দল ও কর্মী লগইন'
    ],
    clearChat: 'চ্যাট মুছে ফেলুন',
    badge: 'এআই গাইড'
  },
  br: {
    title: 'फ्लडरिलीफ AI दिन्थिगिरि',
    subtitle: 'बिलाइ दिन्थिनाय आरो हेफाजाब',
    disclaimer: 'गोनांथार उद्धारनि थाखाय ১০৭০ / ১১২ आव फन खालाम बा राव एसओएस बाहाय।',
    placeholder: 'सों: राहत केम्प बबेयाव, एसओएस माबोरै...',
    initialGreeting: 'खुलुमबाय! आं नोंथांनि फ्लडरिलीफ AI दिन्थिगिरि। आं नोंथांखौ आपत खौरां हरनो, एसओएस थासारि नायनो, राहत केम्प नागिरनो बा हेल्पलाइन नम्बर मोननो हेफाजाब होनो हागोन।',
    quickPrompts: [
      '🚨 आपत खौरां माबोरै हरनो?',
      '🎙️ राव एसओएस माबोरै बाहायनांगौ?',
      '📍 एसओएस थासारि बबेयाव नायनो?',
      '🏕️ राहत केम्प माबोरै नागिरनो?',
      '📞 आपत हेल्पलाइन नम्बर मा मा?',
      '🤝 स्वयंसेवक जानानै माबोरै थांनो?',
      '🔐 उद्धार हान्जा लगिन'
    ],
    clearChat: 'रिसेट खालाम',
    badge: 'AI दिन्थिगिरि'
  },
  as: {
    title: 'ফ্লাডৰিলিফ এআই সহায়ক',
    subtitle: 'ৱেবছাইট নিৰ্দেশনা আৰু সাহায্য',
    disclaimer: 'জীৱন ৰক্ষাৰ জৰুৰী সাহায্যৰ বাবে ১০৭০ / ১১২ নম্বৰত ফোন কৰক বা ভইচ এছ অ\' এছ ব্যৱহাৰ কৰক।',
    placeholder: 'সুধক: আশ্ৰয় শিবিৰ ক\'ত আছে, এছ অ\' এছ কেনেকৈ...',
    initialGreeting: 'নমস্কাৰ! মই আপোনাৰ ফ্লাডৰিলিফ এআই সহায়ক। মই আপোনাক জৰুৰী বানসাহায্য আবেদন দাখিল কৰিবলৈ, এছ অ\' এছ অৱস্থা ট্ৰেক কৰিবলৈ, আশ্ৰয় শিবিৰ বিচাৰিবলৈ আৰু জৰুৰী নম্বৰ পাবলৈ সহায় কৰিম।',
    quickPrompts: [
      '🚨 বানপানীৰ আবেদন কেনেকৈ দিম?',
      '🎙️ ভইচ এছ অ\' এছ কেনেকৈ কাম কৰে?',
      '📍 এছ অ\' এছ অৱস্থা ক\'ত চাম?',
      '🏕️ সক্ৰিয় আশ্ৰয় শিবিৰ কেনেকৈ বিচাৰিম?',
      '📞 চৰকাৰী হেল্পলাইন নম্বৰসমূহ কি কি?',
      '🤝 স্বেচ্ছাসেৱক হিচাপে কেনেকৈ যোগদান কৰিম?',
      '🔐 উদ্ধাৰকাৰী দলৰ প্ৰৱেশদ্বাৰ'
    ],
    clearChat: 'নতুন কথা-বতৰা',
    badge: 'এআই সহায়ক'
  }
};

const LANGUAGE_OPTIONS: { code: GuideLanguage; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
  { code: 'br', label: 'बर’', flag: '🇮🇳' },
  { code: 'as', label: 'অসমীয়া', flag: '🇮🇳' }
];

export const FloodReliefAIGuide: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<GuideLanguage>('en');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = UI_STRINGS[language] || UI_STRINGS.en;

  // Initialize welcome message when language changes or first load
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: t.initialGreeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedFollowUps: t.quickPrompts.slice(0, 3)
        }
      ]);
    }
  }, [language]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-3)
        .map((m) => ({
          role: m.sender,
          content: m.text
        }));

      const res = await fetch(`${baseUrl}/guide/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language,
          history: historyPayload
        })
      });

      const json = await res.json();

      if (res.ok && json.success && json.data) {
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: json.data.reply,
          destination: json.data.destination,
          suggestedFollowUps: json.data.suggestedFollowUps,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(json.error || 'Failed to get answer');
      }
    } catch (err) {
      console.error('AI Guide query error:', err);
      // Fallback friendly message
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'I am temporarily experiencing connection issues, but our emergency response hotlines and SOS reporting pages are fully active.',
        destination: {
          id: 'REPORT_EMERGENCY',
          path: '/emergency',
          title: 'Report Flood Emergency',
          actionLabel: 'Go to Emergency Form'
        },
        suggestedFollowUps: [
          'Report an emergency',
          'Voice SOS Guide',
          'Emergency contact numbers'
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'assistant',
        text: t.initialGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: t.quickPrompts.slice(0, 3)
      }
    ]);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    // On small mobile screens, minimize panel so user can see destination immediately
    if (window.innerWidth < 640) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Tactical Launcher Pill / Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 flex items-center">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open FloodRelief AI Guide"
            className="group relative flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/95 hover:bg-slate-850 text-white border border-cyan-500/50 hover:border-cyan-400 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all duration-200 transform hover:scale-[1.02] backdrop-blur-md"
          >
            {/* Bot Avatar Image with active status dot */}
            <div className="relative w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md shadow-cyan-950/60 shrink-0 group-hover:scale-105 transition-transform duration-200">
              <img
                src={botAvatarSvg}
                alt="FloodRelief AI Bot"
                className="w-full h-full object-cover rounded-full bg-slate-900"
              />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-slate-900"></span>
              </span>
            </div>

            {/* Bot Name and Navigation & assistance bottom text side-by-side */}
            <div className="flex flex-col text-left pr-1">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors leading-tight">
                  {t.title}
                </span>
                <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse hidden sm:inline" />
              </div>
              <span className="text-[10px] font-mono font-medium text-cyan-400/90 leading-tight">
                {t.subtitle}
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Slide-in / Pop-out Assistant Modal Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-guide-title"
          className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 w-[calc(100vw-2rem)] sm:w-[380px] h-[520px] max-h-[80vh] flex flex-col rounded-2xl bg-[#090d16]/95 border border-cyan-500/40 shadow-[0_12px_50px_rgba(0,0,0,0.85)] backdrop-blur-xl overflow-hidden transition-all duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md shadow-cyan-950/60 shrink-0">
                <img
                  src={botAvatarSvg}
                  alt="FloodRelief AI Bot"
                  className="w-full h-full object-cover rounded-full bg-slate-900"
                />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 border border-slate-900"></span>
                </span>
              </div>
              <div>
                <h3 id="ai-guide-title" className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 leading-tight">
                  {t.title}
                </h3>
                <p className="text-[10px] font-mono text-cyan-400/90 font-medium leading-tight">
                  {t.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Selector Dropdown */}
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as GuideLanguage)}
                  className="bg-slate-950 border border-slate-700 hover:border-cyan-500 text-xs font-mono text-slate-200 py-1 px-2 rounded-lg appearance-none pr-6 cursor-pointer focus:outline-none focus:border-cyan-400"
                  aria-label="Select Assistant Language"
                >
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code} className="bg-slate-900 text-white">
                      {opt.flag} {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-2.5 pointer-events-none" />
              </div>

              {/* Reset / Clear Button */}
              <button
                onClick={handleResetChat}
                title={t.clearChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label={t.clearChat}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Safety Notice Ribbon */}
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 py-1.5 flex items-center gap-2 text-[11px] font-mono text-amber-300">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{t.disclaimer}</span>
          </div>

          {/* Quick Prompts Bar (Scrollable chips) */}
          <div className="bg-slate-900/40 border-b border-slate-800/80 px-3 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5">
            {t.quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt.replace(/^[^\s]+\s/, ''))}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-950 hover:border-cyan-500/60 border border-slate-700 text-[11px] text-slate-300 hover:text-cyan-300 transition-all font-medium shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

            {/* Chat Messages Feed */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3.5 text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`flex items-end gap-2 max-w-[92%] ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'assistant' && (
                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-cyan-400/50 shadow-sm mb-1 bg-slate-900">
                      <img src={botAvatarSvg} alt="Bot" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-3.5 py-2.5 leading-relaxed text-xs sm:text-sm shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Destination Action Card (if verified destination exists) */}
                    {msg.destination && (
                      <div className="mt-2.5 pt-2 border-t border-slate-700/80">
                        <button
                          onClick={() => handleNavigate(msg.destination!.path)}
                          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 hover:border-cyan-400 text-cyan-300 font-bold text-xs transition-all duration-200 group shadow-sm"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <ExternalLink className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="truncate">{msg.destination.actionLabel}</span>
                            <span className="text-[10px] font-mono text-cyan-400/70 font-normal">
                              ({msg.destination.path})
                            </span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform shrink-0" />
                        </button>
                      </div>
                    )}

                    <span
                      className={`block text-[9px] font-mono mt-1 ${
                        msg.sender === 'user' ? 'text-cyan-200/80 text-right' : 'text-slate-400 text-left'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>

                {/* Follow-up suggestions chips */}
                {msg.sender === 'assistant' && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5 ml-8">
                    {msg.suggestedFollowUps.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(chip)}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-300 transition-colors"
                      >
                        ↳ {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Loader Indicator */}
            {isLoading && (
              <div className="flex items-end gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-cyan-400/50 shadow-sm mb-1 bg-slate-900 animate-pulse">
                  <img src={botAvatarSvg} alt="Bot" className="w-full h-full object-cover" />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none px-3.5 py-2.5 text-xs text-slate-400 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>Searching navigation index...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <div className="p-3 bg-slate-900/90 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  maxLength={500}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={t.placeholder}
                  disabled={isLoading}
                  className="w-full bg-slate-950 border border-slate-700/80 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all pr-12"
                />
                {inputMessage.length > 300 && (
                  <span className="absolute right-2 top-3 text-[10px] font-mono text-slate-500">
                    {inputMessage.length}/500
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                aria-label="Send query"
                className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white disabled:text-slate-600 font-bold transition-all disabled:cursor-not-allowed shadow-md shadow-cyan-950"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FloodReliefAIGuide;

