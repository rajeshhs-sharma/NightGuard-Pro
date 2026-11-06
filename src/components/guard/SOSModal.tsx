import React, { useState, useEffect } from 'react';
import { AlertOctagon, PhoneCall, MapPin, Radio, ShieldAlert, Volume2, X } from 'lucide-react';
import { sound } from '../../utils/audio';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  guardName: string;
  siteName: string;
}

export const SOSModal: React.FC<SOSModalProps> = ({
  isOpen,
  onClose,
  guardName,
  siteName,
}) => {
  const [cancelCountdown, setCancelCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      sound.startSiren();
      sound.triggerVibrate([400, 150, 400, 150, 800, 200, 800]);
    } else {
      sound.stopSiren();
      setCancelCountdown(null);
    }

    return () => {
      sound.stopSiren();
    };
  }, [isOpen]);

  const handleCancelSOS = () => {
    sound.stopSiren();
    sound.playRadioClick();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-red-950/95 backdrop-blur-lg overflow-y-auto">
      {/* Flashing strobe border effect */}
      <div className="w-full max-w-lg bg-[#140505] border-4 border-red-500 rounded-3xl p-5 sm:p-8 text-center text-white shadow-2xl relative overflow-hidden animate-urgent">
        
        {/* Top Emergency Beacon */}
        <div className="w-24 h-24 mx-auto rounded-full bg-red-600/30 border-4 border-red-500 flex items-center justify-center text-red-400 mb-5 animate-pulse">
          <AlertOctagon className="w-14 h-14 text-white" />
        </div>

        {/* Headline */}
        <div className="space-y-2 mb-6">
          <div className="inline-block bg-red-600 text-white font-mono uppercase text-xs font-black tracking-widest px-3 py-1 rounded-full animate-bounce">
            EMERGENCY PROTOCOL ACTIVATED
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-red-400 tracking-tight">
            SOS SENT!
          </h2>
          <p className="text-base sm:text-lg font-bold text-white">
            Supervisor Notified · Location Shared · Siren ON
          </p>
        </div>

        {/* Real-time Dispatch Telemetry */}
        <div className="bg-[#240808] border border-red-500/40 rounded-2xl p-4 text-left space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-mono text-red-300 font-bold uppercase">
                Live GPS Broadcast
              </div>
              <div className="text-sm font-semibold text-white">
                {siteName} - North Gate Perimeter
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Lat: 13.1007° N, Lon: 77.5963° E (Accuracy: ±1.2m)
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-2 border-t border-red-500/20">
            <Radio className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-mono text-red-300 font-bold uppercase">
                Supervisor Dispatch Status
              </div>
              <div className="text-sm font-semibold text-white">
                Vikram Singh (Head of Night Ops) - <span className="text-emerald-400">ALERT RECEIVED</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Central Monitoring Control Room dialed automatically
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-red-500/20">
            <Volume2 className="w-5 h-5 text-yellow-400 shrink-0 animate-pulse" />
            <div className="text-xs text-yellow-300 font-bold">
              Site Alarm & Strobe Siren is active on guard handset
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-3">
          <a
            href="tel:100"
            className="w-full py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-base flex items-center justify-center gap-3 shadow-lg shadow-red-600/30 active:scale-[0.98] transition-transform"
          >
            <PhoneCall className="w-5 h-5" />
            <span>DIRECT CALL POLICE (100)</span>
          </a>

          <button
            onClick={handleCancelSOS}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#2e1313] hover:bg-[#3d1818] text-slate-200 border border-red-500/50 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <X className="w-4 h-4 text-red-400" />
            <span>Cancel SOS / Stand Down (False Alarm)</span>
          </button>
        </div>

        <p className="text-[11px] text-red-300/70 font-mono mt-4">
          Incident ID: SOS-20261105-0142 · Officer: {guardName}
        </p>
      </div>
    </div>
  );
};
