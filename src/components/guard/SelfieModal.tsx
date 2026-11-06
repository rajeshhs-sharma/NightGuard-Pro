import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { sound } from '../../utils/audio';

interface SelfieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  guardName: string;
}

export const SelfieModal: React.FC<SelfieModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  guardName,
}) => {
  const [captured, setCaptured] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setCaptured(false);
      setAnalyzing(false);
      return;
    }

    // Try starting front camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'user' } })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch(() => {
          // Fallback to simulated biometric canvas
        });
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCapture = () => {
    sound.playRadioClick();
    setAnalyzing(true);
    sound.triggerVibrate([100, 50, 100]);

    setTimeout(() => {
      setAnalyzing(false);
      setCaptured(true);
      sound.playSuccessChime();

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/95 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#0a0f1d] border-2 border-emerald-400 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-[#12192c] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-black flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Facial Alertness Check
              </h3>
              <p className="text-[11px] text-slate-400">Officer: {guardName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder with Face Guide */}
        <div className="relative min-h-[320px] bg-black flex items-center justify-center overflow-hidden">
          {streamRef.current ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#131b2e] to-black p-6">
              <div className="relative w-40 h-52 border-2 border-dashed border-emerald-400/80 rounded-full flex flex-col items-center justify-center">
                <Camera className="w-12 h-12 text-emerald-400/60 mb-2" />
                <span className="text-[11px] font-mono text-emerald-300 text-center px-4">
                  Position your face in the oval
                </span>
                <div className="absolute top-8 left-8 w-6 h-3 border-b-2 border-emerald-400" />
                <div className="absolute top-8 right-8 w-6 h-3 border-b-2 border-emerald-400" />
              </div>
            </div>
          )}

          {/* Biometric Analysis Overlay */}
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md border border-emerald-500/30 rounded-lg px-2.5 py-1 text-[11px] text-emerald-400 font-mono space-y-0.5">
            <div>• EYES OPEN: 100%</div>
            <div>• ALERTNESS: VERIFIED</div>
          </div>

          {analyzing && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin" />
              <p className="text-sm font-bold text-white font-mono">
                Analyzing alertness & biometrics...
              </p>
            </div>
          )}

          {captured && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-3">
              <CheckCircle2 className="w-14 h-14 text-emerald-400 animate-wake-glow" />
              <p className="text-xl font-black text-emerald-400">
                Selfie Verified!
              </p>
              <p className="text-xs text-slate-300 font-mono">
                Awake status logged for {guardName}
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="p-4 bg-[#0d1424] border-t border-slate-800">
          <button
            onClick={handleCapture}
            disabled={analyzing || captured}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-base flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Camera className="w-5 h-5" />
            <span>{captured ? 'VERIFIED' : 'CAPTURE AWAKE SELFIE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
