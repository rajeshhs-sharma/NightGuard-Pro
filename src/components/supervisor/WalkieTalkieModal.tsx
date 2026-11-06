import React, { useState, useEffect } from 'react';
import { Guard } from '../../types/security';
import { Phone, Radio, Volume2, X, Mic, CheckCircle2, AlertTriangle, Battery } from 'lucide-react';
import { sound } from '../../utils/audio';

interface WalkieTalkieModalProps {
  guard: Guard | null;
  mode: 'call' | 'alarm' | null;
  onClose: () => void;
  onSendAlarmDone: (guardId: string) => void;
}

export const WalkieTalkieModal: React.FC<WalkieTalkieModalProps> = ({
  guard,
  mode,
  onClose,
  onSendAlarmDone,
}) => {
  const [isTalking, setIsTalking] = useState(false);
  const [isTransmittingAlarm, setIsTransmittingAlarm] = useState(false);
  const [alarmSentSuccess, setAlarmSentSuccess] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let timer: number;
    if (mode === 'call') {
      sound.playRadioClick();
      timer = window.setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
      setCallDuration(0);
      setIsTalking(false);
      setAlarmSentSuccess(false);
      setIsTransmittingAlarm(false);
    };
  }, [mode]);

  if (!guard || !mode) return null;

  const handleTransmitAlarm = () => {
    setIsTransmittingAlarm(true);
    sound.startWakeUpAlarm();

    setTimeout(() => {
      sound.stopWakeUpAlarm();
      sound.playSuccessChime();
      setIsTransmittingAlarm(false);
      setAlarmSentSuccess(true);
      onSendAlarmDone(guard.id);

      setTimeout(() => {
        onClose();
      }, 1800);
    }, 2000);
  };

  const handlePushToTalkStart = () => {
    sound.playRadioClick();
    setIsTalking(true);
  };

  const handlePushToTalkEnd = () => {
    sound.playRadioClick();
    setIsTalking(false);
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#0a0f1d] border-2 border-yellow-400 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Top Bar */}
        <div className="px-5 py-3.5 bg-[#12192c] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-yellow-400 text-black flex items-center justify-center font-bold">
              {mode === 'call' ? <Phone className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                {mode === 'call' ? '2-Way Guard Radio & Call' : 'Send Remote Loud Alarm'}
              </h3>
              <p className="text-[11px] text-slate-400">Target: {guard.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 text-center space-y-5">
          {mode === 'call' ? (
            <>
              {/* Radio Avatar & Frequency */}
              <div className="relative w-24 h-24 mx-auto">
                <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-yellow-400 flex items-center justify-center overflow-hidden">
                  {guard.avatar ? (
                    <img src={guard.avatar} alt={guard.name} className="w-full h-full object-cover" />
                  ) : (
                    <Radio className="w-12 h-12 text-yellow-400" />
                  )}
                </div>
                {isTalking && (
                  <span className="absolute -inset-2 rounded-full border-2 border-emerald-400 animate-ping" />
                )}
              </div>

              <div>
                <h4 className="text-xl font-black text-white">{guard.name}</h4>
                <p className="text-xs text-yellow-400 font-mono mt-0.5">
                  Post: {guard.locationName} · Shift: {guard.dutyShift}
                </p>
                <div className="inline-block mt-2 px-3 py-1 bg-[#12192c] border border-slate-800 rounded-full text-xs font-mono text-emerald-400">
                  CONNECTED · {formatDuration(callDuration)}
                </div>
              </div>

              {/* Push To Talk Button */}
              <div className="space-y-3 pt-2">
                <button
                  onMouseDown={handlePushToTalkStart}
                  onMouseUp={handlePushToTalkEnd}
                  onTouchStart={handlePushToTalkStart}
                  onTouchEnd={handlePushToTalkEnd}
                  className={`w-full py-5 px-6 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl transition-all ${
                    isTalking
                      ? 'bg-emerald-500 text-black scale-95 shadow-emerald-500/40'
                      : 'bg-yellow-400 hover:bg-yellow-300 text-black shadow-yellow-400/20'
                  }`}
                >
                  <Mic className="w-6 h-6" />
                  <span>{isTalking ? 'TRANSMITTING VOICE...' : 'HOLD TO TALK (WALKIE-TALKIE)'}</span>
                </button>

                <a
                  href={`tel:${guard.phone}`}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#1c2438] hover:bg-[#25324e] text-white border border-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Direct Mobile Call ({guard.phone})</span>
                </a>
              </div>
            </>
          ) : (
            <>
              {/* Loud Alarm Trigger View */}
              {alarmSentSuccess ? (
                <div className="py-6 space-y-3 animate-in zoom-in duration-300">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-black text-emerald-400">LOUD ALARM TRIGGERED!</h4>
                  <p className="text-xs text-slate-300 font-mono">
                    Emergency buzzer & haptic vibration activated on {guard.name}'s handset.
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 mx-auto rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center text-red-500 animate-pulse">
                    <AlertTriangle className="w-10 h-10" />
                  </div>

                  <div>
                    <h4 className="text-xl font-black text-white">Send Wake-Up Alarm?</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      This overrides silent mode and sounds an ear-piercing 110dB buzzer on{' '}
                      <strong className="text-yellow-400">{guard.name}'s</strong> device to wake them up.
                    </p>
                    <div className="mt-3 p-3 bg-[#170a0a] border border-red-500/30 rounded-xl text-left text-xs font-mono text-red-300 space-y-1">
                      <div>• Guard: {guard.name} ({guard.badgeNumber})</div>
                      <div>• Post: {guard.locationName}</div>
                      <div>• Status: MISSED CHECK-IN (35m overdue)</div>
                    </div>
                  </div>

                  <button
                    onClick={handleTransmitAlarm}
                    disabled={isTransmittingAlarm}
                    className="w-full py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-red-600/40 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Volume2 className="w-6 h-6 animate-bounce" />
                    <span>
                      {isTransmittingAlarm ? 'TRANSMITTING 110dB BUZZER...' : 'SEND LOUD ALARM NOW'}
                    </span>
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
