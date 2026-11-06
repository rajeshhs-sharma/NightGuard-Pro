import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Volume2, VolumeX, Flashlight, Clock, Radio } from 'lucide-react';
import { AppView } from '../types/security';
import { sound } from '../utils/audio';

interface HeaderProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  missedAlertsCount: number;
  onToggleTorch?: () => void;
  isTorchOn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  missedAlertsCount,
  onToggleTorch,
  isTorchOn = false,
}) => {
  const [time, setTime] = useState(new Date());
  const [isMuted, setIsMuted] = useState(sound.isMuted);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSound = () => {
    sound.isMuted = !isMuted;
    setIsMuted(!isMuted);
    if (!sound.isMuted) {
      sound.playSuccessChime();
    }
  };

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-yellow-500/30 px-3 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        
        {/* Left Zone: Brand and Live Status */}
        <div className="flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-yellow-400 text-black flex items-center justify-center font-bold shadow-lg shadow-yellow-400/20">
              <Shield className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-white whitespace-nowrap">
                  NightGuard <span className="text-yellow-400">Pro</span>
                </span>
                <span className="text-[10px] font-mono uppercase bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 px-1.5 py-0.5 rounded font-semibold">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Sunrise Apartment · Shift: 10 PM - 6 AM
              </p>
            </div>
          </div>

          {/* Clock on mobile */}
          <div className="flex md:hidden items-center gap-1.5 bg-[#121826] border border-slate-800 rounded-md px-2.5 py-1 text-xs font-mono text-yellow-400">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold">{formattedTime}</span>
          </div>
        </div>

        {/* Center Zone: Mode Switcher */}
        <div className="flex items-center justify-center">
          <div className="w-full md:w-auto p-1 bg-[#121826] border border-slate-800 rounded-xl flex items-center gap-1 shadow-inner">
            <button
              onClick={() => {
                sound.playRadioClick();
                onViewChange('guard');
              }}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                currentView === 'guard'
                  ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/30 font-extrabold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Guard App</span>
              <span className="text-[10px] opacity-80 font-mono">(Mobile)</span>
            </button>

            <button
              onClick={() => {
                sound.playRadioClick();
                onViewChange('supervisor');
              }}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all relative ${
                currentView === 'supervisor'
                  ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/30 font-extrabold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Supervisor Dashboard</span>
              {missedAlertsCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-mono font-bold animate-pulse">
                  {missedAlertsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right Zone: System Tools & Clock */}
        <div className="hidden md:flex items-center gap-3">
          {/* Live Desktop Clock */}
          <div className="flex items-center gap-2 bg-[#121826] border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-yellow-400">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="font-bold tracking-wider">{formattedTime}</span>
          </div>

          {/* Flashlight toggle */}
          {onToggleTorch && (
            <button
              onClick={() => {
                sound.playRadioClick();
                onToggleTorch();
              }}
              title="Toggle Security Torch / Night Flashlight"
              className={`p-2 rounded-lg border transition-colors ${
                isTorchOn
                  ? 'bg-white text-black border-white shadow-lg shadow-white/40'
                  : 'bg-[#121826] text-slate-300 border-slate-800 hover:text-yellow-400 hover:border-yellow-400/50'
              }`}
            >
              <Flashlight className="w-4 h-4" />
            </button>
          )}

          {/* Audio Mute / Sound Toggle */}
          <button
            onClick={toggleSound}
            title={isMuted ? 'Unmute Audio & Sirens' : 'Mute Sounds'}
            className={`p-2 rounded-lg border transition-colors ${
              isMuted
                ? 'bg-red-500/20 text-red-400 border-red-500/40'
                : 'bg-[#121826] text-emerald-400 border-slate-800 hover:border-emerald-500/40'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </header>
  );
};
