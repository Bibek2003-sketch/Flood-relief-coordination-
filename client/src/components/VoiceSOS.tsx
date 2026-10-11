import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  RotateCcw,
  Navigation,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ArrowRight,
  Phone,
  Globe,
  Radio,
  Clock,
  ShieldAlert,
  Loader2,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { reverseGeocode } from '../utils/geocoding';

type SupportedLang = 'en' | 'as' | 'hi' | 'bn' | 'br';

interface LangContent {
  name: string;
  nativeName: string;
  tagline: string;
  speakPrompt: string;
  recordBtn: string;
  recordingActive: string;
  stopBtn: string;
  reviewTitle: string;
  reRecordBtn: string;
  locationLabel: string;
  detectLocationBtn: string;
  locationPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  phoneHelp: string;
  peopleLabel: string;
  submitBtn: string;
  submittingText: string;
  successTitle: string;
  successSubtitle: string;
  trackBtn: string;
}

const LOCALIZED_CONTENT: Record<SupportedLang, LangContent> = {
  en: {
    name: 'English',
    nativeName: 'English',
    tagline: 'Emergency Audio Distress Dispatch',
    speakPrompt: "Don't waste time typing. Record your message and tell rescue teams what is happening.",
    recordBtn: 'Record Voice SOS',
    recordingActive: 'Recording Your Distress Signal...',
    stopBtn: 'Stop & Review Message',
    reviewTitle: 'Review Audio Recording',
    reRecordBtn: 'Discard & Re-Record',
    locationLabel: 'Your Location (GPS or Landmark)',
    detectLocationBtn: 'Detect My GPS Location',
    locationPlaceholder: 'e.g. Near Jalukbari Flyover, flood water rising',
    phoneLabel: 'Callback Mobile Number (Optional)',
    phonePlaceholder: 'e.g. 9864012345 (10-digit mobile)',
    phoneHelp: 'If provided, you will receive real-time SMS status alerts. No login required.',
    peopleLabel: 'People Stranded',
    submitBtn: 'Broadcast Voice SOS Distress Signal',
    submittingText: 'Uploading Audio & Transmitting SOS...',
    successTitle: 'Voice SOS Transmitted Successfully',
    successSubtitle: 'Your spoken distress call has been logged into the Emergency Command Registry.',
    trackBtn: 'Track SOS Status Live'
  },
  as: {
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    tagline: 'জৰুৰী ভয়েচ এছঅ’এছ বাৰ্তা',
    speakPrompt: 'টাইপ কৰি সময় নষ্ট নকৰিব। আপোনাৰ কথা ৰেকৰ্ড কৰক আৰু উদ্ধাৰকাৰী দলক জনাওক কি হৈছে।',
    recordBtn: 'ভয়েচ এছঅ’এছ ৰেকৰ্ড কৰক',
    recordingActive: 'বাৰ্তা ৰেকৰ্ড হৈ আছে...',
    stopBtn: 'ৰেকৰ্ডিং বন্ধ কৰক',
    reviewTitle: 'ৰেকৰ্ড কৰা বাৰ্তা শুনক',
    reRecordBtn: 'পুনৰ ৰেকৰ্ড কৰক',
    locationLabel: 'আপোনাৰ স্থান (জি.পি.এছ বা চিনাক্ত স্থান)',
    detectLocationBtn: 'মোৰ স্থান চিনাক্ত কৰক',
    locationPlaceholder: 'যেনে: জালুকবাৰী দলঙৰ ওচৰত, পানী বাঢ়িছে',
    phoneLabel: 'ফোন নম্বৰ (ঐচ্ছিক)',
    phonePlaceholder: '১০ সংখ্যাৰ মোবাইল নম্বৰ দিয়ক',
    phoneHelp: 'নম্বৰ দিলে এছ.এম.এছ যোগে উদ্ধাৰৰ অগ্ৰগতি জনোৱা হ’ব।',
    peopleLabel: 'আৱদ্ধ হৈ থকা লোকৰ সংখ্যা',
    submitBtn: 'এছঅ’এছ বাৰ্তা প্ৰেৰণ কৰক',
    submittingText: 'বাৰ্তা প্ৰেৰণ হৈ আছে...',
    successTitle: 'বাৰ্তা সফলতাৰে প্ৰেৰণ কৰা হ’ল',
    successSubtitle: 'আপোনাৰ জৰুৰী আহ্বান দুৰ্যোগ নিয়ন্ত্ৰণ কক্ষত নথিভুক্ত কৰা হৈছে।',
    trackBtn: 'স্থিতি নিৰীক্ষণ কৰক'
  },
  hi: {
    name: 'Hindi',
    nativeName: 'हिन्दी',
    tagline: 'आपातकालीन वॉयस एसओएस',
    speakPrompt: 'टाइप करने में समय न गंवाएं। अपनी बात रिकॉर्ड करें और बताएं कि क्या स्थिति है।',
    recordBtn: 'वॉयस एसओएस रिकॉर्ड करें',
    recordingActive: 'संदेश रिकॉर्ड हो रहा है...',
    stopBtn: 'रिकॉर्डिंग समाप्त करें',
    reviewTitle: 'रिकॉर्ड किया गया संदेश सुनें',
    reRecordBtn: 'दोबारा रिकॉर्ड करें',
    locationLabel: 'आपका स्थान (जीपीएस या लैंडमार्क)',
    detectLocationBtn: 'मेरा स्थान ढूंढें',
    locationPlaceholder: 'उदा. जलुकबाड़ी फ्लाईओवर के पास, पानी बढ़ रहा है',
    phoneLabel: 'मोबाइल नंबर (वैकल्पिक)',
    phonePlaceholder: '10 अंकों का मोबाइल नंबर',
    phoneHelp: 'नंबर देने पर आपको स्थिति की एसएमएस सूचना मिलेगी।',
    peopleLabel: 'फंसे हुए लोगों की संख्या',
    submitBtn: 'एसओएस संदेश भेजें',
    submittingText: 'संदेश भेजा जा रहा है...',
    successTitle: 'एसओएस संदेश सफलतापूर्वक भेजा गया',
    successSubtitle: 'आपकी आवाज आपदा नियंत्रण कक्ष में दर्ज कर ली गई है।',
    trackBtn: 'स्थिति ट्रैक करें'
  },
  bn: {
    name: 'Bengali',
    nativeName: 'বাংলা',
    tagline: 'জরুরী ভয়েস এসওএস বার্তা',
    speakPrompt: 'টাইপ করে সময় নষ্ট করবেন না। আপনার কথা রেকর্ড করুন এবং বলুন কী ঘটেছে।',
    recordBtn: 'ভয়েস এসওএস রেকর্ড করুন',
    recordingActive: 'বার্তা রেকর্ড হচ্ছে...',
    stopBtn: 'রেকর্ডিং শেষ করুন',
    reviewTitle: 'রেকর্ড করা বার্তা শুনুন',
    reRecordBtn: 'পুনরায় রেকর্ড করুন',
    locationLabel: 'আপনার অবস্থান (জিপিএস বা ল্যান্ডমার্ক)',
    detectLocationBtn: 'আমার অবস্থান নির্ণয় করুন',
    locationPlaceholder: 'যেমন: জালুকবাড়ি ফ্লাইওভারের কাছে',
    phoneLabel: 'ফোন নম্বর (ঐচ্ছিক)',
    phonePlaceholder: '১০ সংখ্যার মোবাইল নম্বর',
    phoneHelp: 'নম্বর দিলে আপনি এসএমএসের মাধ্যমে অগ্রগতির খবর পাবেন।',
    peopleLabel: 'আটকে থাকা লোকের সংখ্যা',
    submitBtn: 'এসওএস বার্তা পাঠান',
    submittingText: 'বার্তা পাঠানো হচ্ছে...',
    successTitle: 'বার্তা সফলভাবে পাঠানো হয়েছে',
    successSubtitle: 'আপনার বার্তাটি দুর্যোগ নিয়ন্ত্রণ কক্ষে রেকর্ড করা হয়েছে।',
    trackBtn: 'অবস্থা ট্র্যাক করুন'
  },
  br: {
    name: 'Bodo',
    nativeName: "बर'",
    tagline: 'गावनि रावाव एसओएस खौरां',
    speakPrompt: 'टाइप खालामनानै सम गारनो नाङा। नोंथांनि रावखौ रेकर्ड खालाम आरो मा जादों फोरमाय।',
    recordBtn: 'राव रेकर्ड खालाम',
    recordingActive: 'राव रेकर्ड जागासिनो दं...',
    stopBtn: 'रेकर्ड बन्द खालाम',
    reviewTitle: 'रेकर्ड खौरां खोनासं',
    reRecordBtn: 'फिन रेकर्ड खालाम',
    locationLabel: 'जायगा (GPS एबा जायगानि मुं)',
    detectLocationBtn: 'आंनि जायगा नागिर',
    locationPlaceholder: 'उदा. जलुकबारी दलनि सेराव',
    phoneLabel: 'कल खालामग्रा फोन (गनायथि)',
    phonePlaceholder: '10-अंकनि मबाइल नम्बर',
    phoneHelp: 'नम्बर हरब्ला SMS खौरां मोनगोन।',
    peopleLabel: 'थाफानाय सुबुंनि अनजिमा',
    submitBtn: 'एसओएस खौरां दैथायहर',
    submittingText: 'दैथायहरगासिनो दं...',
    successTitle: 'एसओएस खौरां मोजाङै दैथायबाय',
    successSubtitle: 'नोंथांनि खौरांखौ डिजास्टार क्मान्ड सेन्टाराव दोनथुमबाय।',
    trackBtn: 'अवस्था नाय'
  }
};

const MAX_RECORDING_SECONDS = 90;

export const VoiceSOS: React.FC<{ onSwitchToForm?: () => void }> = ({ onSwitchToForm }) => {
  // Localization
  const [lang, setLang] = useState<SupportedLang>('en');
  const t = LOCALIZED_CONTENT[lang];

  // Recording State
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'recorded' | 'uploading' | 'success'>('idle');
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [audioMimeType, setAudioMimeType] = useState('audio/webm');

  // MediaRecorder references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Form Fields
  const [locationText, setLocationText] = useState('');
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null); // [lat, lng]
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [callbackPhone, setCallbackPhone] = useState('');
  const [peopleCount, setPeopleCount] = useState(1);

  // Success State
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupMediaStream();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const cleanupMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  // Determine best supported audio MIME type
  const getSupportedMimeType = (): string => {
    if (typeof MediaRecorder === 'undefined') return 'audio/webm';
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/aac'
    ];
    for (const type of candidates) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  };

  // Start Recording
  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Microphone access is not supported by your browser. Please use the text report form.');
      return;
    }

    try {
      cleanupMediaStream();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      setAudioBlob(null);
      setDuration(0);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      mediaStreamRef.current = stream;

      const mime = getSupportedMimeType();
      const options: MediaRecorderOptions = mime ? { mimeType: mime } : {};
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      setAudioMimeType(mime || 'audio/webm');

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        cleanupMediaStream();
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

        const blob = new Blob(audioChunksRef.current, { type: mime || 'audio/webm' });
        if (blob.size < 1000) {
          toast.error('Recording too short or silent. Please speak into the microphone.');
          setRecordingState('idle');
          return;
        }

        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setRecordingState('recorded');
        toast.success('Audio message recorded! Review or submit below.', { icon: '🎙️' });
      };

      recorder.start(250); // Slice data every 250ms
      setRecordingState('recording');

      // Duration counter
      const startTime = Date.now();
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setDuration(elapsed);
        if (elapsed >= MAX_RECORDING_SECONDS) {
          stopRecording();
          toast.success('Maximum recording length (90s) reached.');
        }
      }, 500);

    } catch (err: any) {
      console.error('Error opening microphone:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        toast.error('Microphone permission was denied. Please allow microphone access or use the text form.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        toast.error('No microphone found on your device.');
      } else {
        toast.error(`Could not start recording: ${err.message || 'Unknown error'}`);
      }
      setRecordingState('idle');
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    cleanupMediaStream();
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // Discard & Re-record
  const handleDiscard = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setAudioBlob(null);
    setDuration(0);
    setIsPlaying(false);
    setRecordingState('idle');
  };

  // Toggle Playback
  const togglePlay = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  // GPS Location Detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCoordinates([latitude, longitude]);
        setAccuracyMeters(accuracy ? Math.round(accuracy) : null);
        setIsLocating(false);

        // Reverse geocode to human readable address
        const readable = await reverseGeocode(latitude, longitude);
        if (readable) {
          setLocationText(readable);
          toast.success(`Location Pinned: ${readable.split(',')[0]} (±${Math.round(accuracy)}m)`);
        } else {
          setLocationText(`GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          toast.success(`GPS Coordinates Captured: ±${Math.round(accuracy)}m`);
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        if (err.code === 1) {
          toast.error('Location permission was denied. You can describe your location or landmarks below.');
        } else {
          toast.error('Unable to acquire GPS signal. You can describe your location or landmarks below.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000
      }
    );
  };

  // Submit Voice SOS to Backend
  const handleSubmitSOS = async () => {
    if (!audioBlob) {
      toast.error('Please record your voice distress message first.');
      return;
    }

    // Validate phone number if provided
    const cleanPhone = callbackPhone.replace(/[\s\-\(\)\.]/g, '');
    if (cleanPhone) {
      const digitsOnly = cleanPhone.replace(/^\+91/, '').replace(/^0/, '');
      if (!/^[6-9]\d{9}$/.test(digitsOnly)) {
        toast.error('Please enter a valid 10-digit Indian mobile number (starting with 6,7,8,9) or leave it blank.');
        return;
      }
    }

    setRecordingState('uploading');

    try {
      const formData = new FormData();
      
      // Audio File
      const ext = audioMimeType.includes('ogg') ? 'ogg' : audioMimeType.includes('mp4') ? 'm4a' : 'webm';
      formData.append('audio', audioBlob, `voice_sos_${Date.now()}.${ext}`);
      formData.append('durationSeconds', duration.toString());
      
      // Location data
      if (coordinates) {
        formData.append('latitude', coordinates[0].toString());
        formData.append('longitude', coordinates[1].toString());
      }
      if (accuracyMeters) {
        formData.append('locationAccuracy', accuracyMeters.toString());
      }
      if (locationText.trim()) {
        formData.append('locationDescription', locationText.trim());
      }
      formData.append('locationCapturedAt', new Date().toISOString());

      // Callback Phone
      if (cleanPhone) {
        formData.append('callbackPhone', cleanPhone);
      }

      // Metadata
      formData.append('preferredLanguage', lang);
      formData.append('peopleAffected', peopleCount.toString());
      formData.append('emergencyDescription', `Voice SOS distress signal (${duration}s message). Coordinates: ${coordinates ? `${coordinates[0]}, ${coordinates[1]}` : 'Spoken in audio'}.`);

      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${baseUrl}/requests/voice`, {
        method: 'POST',
        body: formData
      });

      const json = await res.json();

      if (res.ok && (json.success || json.status === 'success') && json.requestId) {
        setSubmittedRequestId(json.requestId);
        setRecordingState('success');
        toast.success(`SOS Logged: ${json.requestId}`, { icon: '🚨', duration: 6000 });
      } else {
        throw new Error(json.error || json.message || 'Server failed to save Voice SOS.');
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      toast.error(err.message || 'Network error submitting Voice SOS. Please retry or call 112 directly.');
      setRecordingState('recorded');
    }
  };

  const copyRequestId = () => {
    if (!submittedRequestId) return;
    navigator.clipboard.writeText(submittedRequestId);
    setCopied(true);
    toast.success('Request ID copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // SUCCESS CONFIRMATION VIEW
  if (recordingState === 'success' && submittedRequestId) {
    return (
      <div className="bg-[#0f172a] border border-emerald-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6 animate-fadeIn max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-bold">
            DISTRESS SIGNAL LOGGED
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">{t.successTitle}</h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto">{t.successSubtitle}</p>
        </div>

        {/* Unique Request ID Card */}
        <div className="bg-slate-900/90 border border-slate-700 p-5 rounded-2xl max-w-md mx-auto space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
            YOUR EMERGENCY TRACKING CODE
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl sm:text-4xl font-mono font-black text-cyan-400 tracking-wider">
              {submittedRequestId}
            </span>
            <button
              onClick={copyRequestId}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all hover:scale-105 active:scale-95"
              title="Copy ID"
            >
              {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <span className="text-xs text-slate-400 block">
            Save this ID. You can track rescue deployment and field operations anytime.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 max-w-md mx-auto">
          <Link
            to={`/track-emergency?id=${submittedRequestId}`}
            className="flex-1 py-3.5 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-sm shadow-lg shadow-cyan-950 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>{t.trackBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => {
              setRecordingState('idle');
              setAudioBlob(null);
              setAudioUrl(null);
              setSubmittedRequestId(null);
            }}
            className="py-3.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs border border-slate-700 transition-colors"
          >
            Submit Another Report
          </button>
        </div>

        {/* Immediate Danger Emergency Hotline */}
        <div className="p-3.5 bg-red-950/30 border border-red-500/30 rounded-xl text-xs text-red-200 flex items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>Immediate life-threatening danger? Call NDRF / SDRF State Control:</span>
          </div>
          <a
            href="tel:1070"
            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs rounded-lg shrink-0 whitespace-nowrap"
          >
            Dial 1070
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 max-w-2xl mx-auto text-left relative overflow-hidden">
      
      {/* Background glow decoration */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header & Language Bar */}
      <div className="space-y-3 relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-[11px] font-mono text-red-400 font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>VOICE SOS DISPATCH</span>
          </div>

          {/* Quick toggle to regular form */}
          {onSwitchToForm && (
            <button
              onClick={onSwitchToForm}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline decoration-cyan-500/50 underline-offset-4"
            >
              Prefer standard form?
            </button>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Speak Your Emergency
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          {t.speakPrompt}
        </p>

        {/* Language Selector Chips */}
        <div className="pt-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-cyan-400" />
            <span>Spoken Language Preference:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(LOCALIZED_CONTENT) as SupportedLang[]).map((code) => {
              const active = lang === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all ${
                    active
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20 ring-2 ring-cyan-400'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {LOCALIZED_CONTENT[code].nativeName}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* PRIMARY AUDIO RECORDER CONTAINER */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-center space-y-5 relative shadow-inner">
        
        {/* Recording Animation / Visualizer */}
        {recordingState === 'recording' && (
          <div className="space-y-4">
            <div className="relative inline-flex items-center justify-center">
              <span className="absolute w-28 h-28 rounded-full bg-red-600/20 animate-ping"></span>
              <span className="absolute w-24 h-24 rounded-full bg-red-600/40 animate-pulse"></span>
              <div className="relative w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl shadow-red-600/50">
                <Mic className="w-10 h-10 animate-bounce" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-bold text-red-400 font-mono tracking-wide">
                {t.recordingActive}
              </div>
              <div className="text-3xl font-black font-mono text-white">
                {formatTime(duration)} <span className="text-xs text-slate-500 font-normal">/ {formatTime(MAX_RECORDING_SECONDS)}</span>
              </div>
              
              {/* Progress Bar for Max 90 seconds */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden max-w-xs mx-auto mt-2">
                <div 
                  className="bg-gradient-to-r from-red-600 to-amber-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (duration / MAX_RECORDING_SECONDS) * 100)}%` }}
                ></div>
              </div>
            </div>

            <button
              onClick={stopRecording}
              className="py-3 px-8 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-sm shadow-xl shadow-red-950 flex items-center justify-center gap-2 mx-auto transition-all active:scale-95"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>{t.stopBtn}</span>
            </button>
          </div>
        )}

        {/* Idle State - Big Red Tap to Record Button */}
        {recordingState === 'idle' && (
          <div className="py-4 space-y-4">
            <button
              onClick={startRecording}
              className="group relative inline-flex flex-col items-center justify-center p-8 rounded-full bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white shadow-2xl shadow-red-600/40 transition-all hover:scale-105 active:scale-95 border-4 border-red-400/30 w-36 h-36 mx-auto"
              aria-label="Tap to Record Emergency Voice Message"
            >
              <Mic className="w-12 h-12 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-mono font-black uppercase tracking-wider">
                TAP TO SPEAK
              </span>
            </button>
            <div className="text-xs text-slate-400 font-mono">
              Press the red button and describe your location, water level, and how many people are stranded. (Max 90s)
            </div>
          </div>
        )}

        {/* Recorded Review State - Playback & Re-record */}
        {(recordingState === 'recorded' || recordingState === 'uploading') && audioUrl && (
          <div className="space-y-4 py-2">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold block flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{t.reviewTitle} ({formatTime(duration)})</span>
            </span>

            {/* Hidden native audio element */}
            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              onTimeUpdate={(e) => setPlaybackTime(Math.floor(e.currentTarget.currentTime))}
            />

            {/* Custom tactical audio player bar */}
            <div className="flex items-center justify-center gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800 max-w-md mx-auto">
              <button
                type="button"
                onClick={togglePlay}
                disabled={recordingState === 'uploading'}
                className="w-12 h-12 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-950 transition-all active:scale-95 shrink-0"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
              </button>

              <div className="flex-1 text-left">
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>{formatTime(playbackTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full transition-all"
                    style={{ width: `${duration ? (playbackTime / duration) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDiscard}
                disabled={recordingState === 'uploading'}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-red-400 transition-colors"
                title={t.reRecordBtn}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              Satisfied with your message? Add optional location &amp; contact details below and transmit.
            </div>
          </div>
        )}

      </div>

      {/* LOCATION & CONTACT SECTION */}
      <div className="space-y-4 pt-1 border-t border-slate-800">
        
        {/* GPS Location Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.locationLabel}</span>
            </label>
            {accuracyMeters && (
              <span className="text-[10px] font-mono text-emerald-400">
                GPS Accuracy: ±{accuracyMeters}m
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 text-xs font-mono font-bold flex items-center justify-center gap-2 shrink-0 transition-all disabled:opacity-50"
            >
              {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              <span>{isLocating ? 'Locating...' : t.detectLocationBtn}</span>
            </button>
            
            <input
              type="text"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              placeholder={t.locationPlaceholder}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Callback Mobile Number (Optional) */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.phoneLabel}</span>
          </label>
          <input
            type="tel"
            value={callbackPhone}
            onChange={(e) => setCallbackPhone(e.target.value)}
            placeholder={t.phonePlaceholder}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 text-xs font-mono tracking-wider focus:outline-none focus:border-cyan-500"
          />
          <span className="text-[11px] text-slate-400 font-mono block">
            {t.phoneHelp}
          </span>
        </div>

        {/* Stranded People Counter */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.peopleLabel}</span>
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-mono font-bold text-sm flex items-center justify-center"
            >
              -
            </button>
            <span className="font-mono text-base font-bold text-white px-2">
              {peopleCount} {peopleCount === 1 ? 'Person' : 'People'}
            </span>
            <button
              type="button"
              onClick={() => setPeopleCount(peopleCount + 1)}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-mono font-bold text-sm flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

      </div>

      {/* FINAL SUBMIT BUTTON */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSubmitSOS}
          disabled={!audioBlob || recordingState === 'recording' || recordingState === 'uploading'}
          className={`w-full py-4 px-6 rounded-2xl font-mono font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-xl ${
            !audioBlob || recordingState === 'recording'
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
              : recordingState === 'uploading'
              ? 'bg-cyan-700 text-white animate-pulse'
              : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-950/80 hover:scale-[1.01] active:scale-[0.99] border border-red-500'
          }`}
        >
          {recordingState === 'uploading' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t.submittingText}</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-5 h-5 animate-pulse text-red-200" />
              <span>{t.submitBtn}</span>
            </>
          )}
        </button>

        {!audioBlob && (
          <p className="text-[11px] text-center text-slate-500 font-mono mt-2">
            Record your voice message above to enable transmission.
          </p>
        )}
      </div>

    </div>
  );
};

export default VoiceSOS;

