import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Radio, HeartPulse, FileText } from 'lucide-react';
import VoiceSOS from '../components/VoiceSOS';

const VoiceSOSPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[85vh] bg-[#0b0f19] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/emergency"
            className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Switch to Standard Form</span>
          </Link>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[11px] font-mono text-red-400">
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span>DIRECT EMERGENCY DISPATCH</span>
          </div>
        </div>

        {/* Voice SOS Core Component */}
        <VoiceSOS onSwitchToForm={() => navigate('/emergency')} />

      </div>
    </div>
  );
};

export default VoiceSOSPage;

