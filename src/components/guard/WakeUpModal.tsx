import React, { useState, useEffect } from 'react';
import { AlertTriangle, QrCode, Camera, CheckCircle2, Volume2, ShieldAlert } from 'lucide-react';
import { sound } from '../../utils/audio';

interface WakeUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (method: 'qr' | 'selfie') => void;
  onOpenQRScanner: () => void;
  onOpenSelfie: () => void;
}

export const WakeUpModal: React.FC<WakeUpModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenQRScanner,
  onOpenSelfie,
}) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isSuccessState, setIsSuccessState] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(60);
      setIsSuccessState(false);
      sound.stopWakeUpAlarm();
      return;
    }

    // Start alarm and vibrate
    sound.startWakeUpAlarm();
    sound.triggerVibrate([300, 150, 300, 150, 500]);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        // Vibrate intermittently
        if (prev % 5 === 0) {
          sound.triggerVibrate([200, 100, 200]);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      sound.stopWakeUpAlarm();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle direct Quick Verification or routing to Scan/Selfie
  const handleQuickSuccess = (method: 'qr' | 'selfie') => {
    sound.stopWakeUpAlarm();
    sound.playSuccessChime();
    setIsSuccessState(true);
    setTimeout(() => {
      onSuccess(method);
      setIsSuccessState(false);
      onClose();
    }, 1600);
  };

  const progressPercent = ((60 - timeLeft) / 60) * 100;
  const isUrgent = timeLeft <= 20;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md">
      {/* Container with urgent shake/pulse animation */}
      <div
        className={`w-full max-w-md bg-[#0a0e17] border-2 ${
          isUrgent ? 'border-red-500 animate-urgent' : 'border-yellow-400'
        } rounded-3xl p-5 sm:p-6 text-center text-white shadow-2xl relative overflow-hidden`}
      >
        {/* Ambient Top Light Bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-2.5 ${
            isUrgent ? 'bg-red-500 animate-pulse' : 'bg-yellow-400 animate-pulse'
          }`}
        />

        {isSuccessState ? (
          <div className="py-8 space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 animate-wake-glow">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-emerald-400 tracking-tight">
                Check-in Successful!
              </h3>
              <p className="text-lg font-bold text-white mt-1">
                You are AWAKE & VERIFIED
              </p>
              <p className="text-xs text-slate-400 font-mono mt-2">
                Logged to Central Server · Timestamp recorded
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Urgent Header */}
            <div className="flex items-center justify-center gap-2">
              <div
                className={`p-2 rounded-full ${
                  isUrgent ? 'bg-red-500/20 text-red-500' : 'bg-yellow-400/20 text-yellow-400'
                }`}
              >
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <span className="text-xs font-mono tracking-widest uppercase font-bold text-yellow-400">
                LOUD WAKE-UP ALERT
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
                ARE YOU AWAKE?
              </h2>
              <p className="text-sm font-semibold text-yellow-300 mt-1">
                Scan QR or take selfie in <span className="font-mono text-white text-base">{timeLeft}s</span>
              </p>
            </div>

            {/* Circular Timer Display */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-800"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * (60 - timeLeft)) / 60}
                  strokeLinecap="round"
                  className={`transition-all duration-1000 ${
                    isUrgent ? 'text-red-500' : 'text-yellow-400'
                  }`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-4xl sm:text-5xl font-black text-white tabular-nums tracking-tight">
                  {timeLeft}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">
                  SECONDS
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 px-4">
              If not confirmed within 60s, supervisor is automatically notified and alert siren will sound on site.
            </p>

            {/* Action Buttons: Big and Easy to Tap at Night */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  sound.stopWakeUpAlarm();
                  onOpenQRScanner();
                }}
                className="w-full py-4 px-5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 shadow-lg shadow-yellow-400/25 active:scale-[0.98] transition-transform"
              >
                <QrCode className="w-6 h-6 stroke-[2.5]" />
                <span>Scan QR Code</span>
              </button>

              <button
                onClick={() => {
                  sound.stopWakeUpAlarm();
                  onOpenSelfie();
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#1c2436] hover:bg-[#253047] text-white border border-slate-700 font-bold text-sm sm:text-base flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
              >
                <Camera className="w-5 h-5 text-yellow-400" />
                <span>I Am Awake - Selfie</span>
              </button>

              {/* Quick direct demo confirmation for fast testing */}
              <button
                onClick={() => handleQuickSuccess('qr')}
                className="w-full text-xs text-slate-400 hover:text-slate-200 py-1.5 underline decoration-slate-600 transition-colors"
              >
                Instant 1-Click Verification (Demo)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
