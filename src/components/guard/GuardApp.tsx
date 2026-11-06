import React, { useState, useEffect } from 'react';
import {
  Guard,
  Checkpoint,
  ActiveTab,
} from '../../types/security';
import {
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  AlertOctagon,
  Home,
  MapPin,
  User,
  ChevronRight,
  Battery,
  Flame,
  Volume2,
} from 'lucide-react';
import { sound } from '../../utils/audio';
import { WakeUpModal } from './WakeUpModal';
import { QRScannerModal } from './QRScannerModal';
import { SelfieModal } from './SelfieModal';
import { SOSModal } from './SOSModal';
import { GuardProfile } from './GuardProfile';

interface GuardAppProps {
  guard: Guard;
  checkpoints: Checkpoint[];
  onUpdateGuard: (updatedGuard: Partial<Guard>) => void;
  onUpdateCheckpoint: (checkpointId: string, status: 'DONE' | 'PENDING', scannedAt: string) => void;
  onToggleTorch: () => void;
  isTorchOn: boolean;
}

export const GuardApp: React.FC<GuardAppProps> = ({
  guard,
  checkpoints,
  onUpdateGuard,
  onUpdateCheckpoint,
  onToggleTorch,
  isTorchOn,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Modals
  const [isWakeUpModalOpen, setIsWakeUpModalOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [targetCheckpoint, setTargetCheckpoint] = useState<Checkpoint | null>(null);
  const [isSelfieModalOpen, setIsSelfieModalOpen] = useState(false);
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);

  // Wake-up Countdown timer (in seconds)
  const [nextCheckInSeconds, setNextCheckInSeconds] = useState(guard.nextCheckInSeconds || 765);
  // Last check-in text
  const [lastCheckInMinutes, setLastCheckInMinutes] = useState(guard.lastCheckInMinutesAgo || 2);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Clock updater
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Countdown timer for next check-in
  useEffect(() => {
    const timer = setInterval(() => {
      setNextCheckInSeconds((prev) => {
        if (prev <= 1) {
          // Trigger wake up alert automatically when reaches 0
          setIsWakeUpModalOpen(true);
          return 900; // reset to 15 mins
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Minutes since last check in incremental counter
  useEffect(() => {
    const minTimer = setInterval(() => {
      setLastCheckInMinutes((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(minTimer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Format seconds to MM:SS
  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} mins`;
  };

  // Current formatted duty time
  const formattedDutyClock = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  // Handle successful check in
  const handleCheckInSuccess = (method: 'qr' | 'selfie') => {
    setNextCheckInSeconds(900); // 15 mins
    setLastCheckInMinutes(0);
    const nowTime = currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    onUpdateGuard({
      status: 'AWAKE',
      lastCheckInMinutesAgo: 0,
      lastCheckInTime: nowTime,
      nextCheckInSeconds: 900,
    });
    showToast('Check-in Successful - You are Awake & Verified!');
  };

  // Handle checkpoint scan completion
  const handleCheckpointScan = (checkpointId?: string) => {
    const nowTime = currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    if (checkpointId) {
      onUpdateCheckpoint(checkpointId, 'DONE', nowTime);
      const cp = checkpoints.find((c) => c.id === checkpointId);
      showToast(`Checkpoint [${cp?.name || 'Gate'}] Verified at ${nowTime}!`);
    } else {
      // General check in
      handleCheckInSuccess('qr');
    }
    setTargetCheckpoint(null);
  };

  const handleOpenScanForCheckpoint = (cp: Checkpoint) => {
    sound.playRadioClick();
    setTargetCheckpoint(cp);
    setIsQRScannerOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col items-center">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 z-50 px-4 py-2.5 rounded-2xl bg-emerald-500 text-black font-extrabold text-sm shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container - Mobile First (constrained width for ergonomic feel, responsive on laptop) */}
      <div className="w-full max-w-md sm:max-w-lg px-4 pt-3 pb-28 space-y-4">
        
        {/* TOP: GUARD PROFILE */}
        <div className="bg-[#0b101c] border border-slate-800 rounded-3xl p-4 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={guard.avatar}
                  alt={guard.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-yellow-400/80 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-bold uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5" />
                  <span>On Duty</span>
                </div>
                <h1 className="text-lg font-black text-white tracking-tight">{guard.name}</h1>
                <p className="text-xs text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-yellow-400 shrink-0" />
                  <span className="truncate">{guard.site}</span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                Shift Hours
              </span>
              <span className="text-xs font-mono font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20 whitespace-nowrap">
                {guard.dutyShift}
              </span>
              <div className="flex items-center justify-end gap-1 text-[11px] text-emerald-400 font-mono mt-1">
                <Battery className="w-3 h-3" />
                <span>{guard.battery}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 1: HOME (Standard guard active view) */}
        {activeTab === 'home' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* BIG LIVE CLOCK WITH DUTY TIMER */}
            <div className="bg-[#0f172a] border-2 border-yellow-400/50 rounded-3xl p-5 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-400" />
              
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-yellow-400" /> LIVE DUTY CLOCK
                </span>
                <span className="text-yellow-400 font-semibold">NIGHT SHIFT ACTIVE</span>
              </div>

              {/* Big High-Visibility Digits */}
              <div className="font-mono text-4xl sm:text-5xl font-black text-white tracking-tight py-1 tabular-nums">
                {formattedDutyClock}
              </div>

              <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-300 pt-2 border-t border-slate-800/80">
                <span>Duty Remaining: <strong className="text-yellow-400">4h 18m</strong></span>
                <span>·</span>
                <span>Patrols: <strong className="text-emerald-400">{checkpoints.filter(c => c.status === 'DONE').length}/4 Done</strong></span>
              </div>
            </div>

            {/* STATUS CARD: BIG GREEN CIRCLE - "YOU ARE AWAKE" */}
            <div className="bg-[#091510] border-2 border-emerald-500/60 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Big Green Circle */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-500/20 border-4 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(34,197,94,0.4)] animate-wake-glow">
                    <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-mono uppercase font-bold tracking-widest text-emerald-400">
                    STATUS VERIFIED
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none mt-1">
                    YOU ARE AWAKE
                  </h2>
                  <p className="text-xs sm:text-sm font-semibold text-emerald-300/90 mt-1.5">
                    Last Check-in: <span className="font-mono text-white">{lastCheckInMinutes === 0 ? 'Just now' : `${lastCheckInMinutes} mins ago`}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Supervisor status: <span className="text-emerald-400 font-semibold">Active & Green</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 1. SMART WAKE-UP CHECK-IN */}
            <div className="bg-[#121826] border-2 border-yellow-400 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-bold">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white tracking-tight">
                      Smart Wake-Up Check-In
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Automatic anti-sleep verification cycle
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 rounded-lg">
                  15 MIN LOOP
                </span>
              </div>

              {/* Big Countdown Display */}
              <div className="p-4 bg-[#0a0f1d] border border-yellow-500/30 rounded-2xl text-center">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                  Next Scheduled Alert In
                </span>
                <div className="font-mono text-3xl sm:text-4xl font-black text-yellow-400 tracking-tight mt-1 tabular-nums">
                  {formatCountdown(nextCheckInSeconds)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Loud alert will trigger if you don't respond within 60s
                </p>
              </div>

              {/* DEMO BUTTON: Simulate Check-In Alert Now */}
              <button
                onClick={() => {
                  sound.playRadioClick();
                  setIsWakeUpModalOpen(true);
                }}
                className="w-full py-4 px-5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl shadow-yellow-400/30 active:scale-[0.98] transition-transform"
              >
                <Volume2 className="w-6 h-6 stroke-[2.5] animate-pulse" />
                <span>Simulate Check-In Alert Now</span>
              </button>
            </div>

            {/* 2. PATROL TASKS PREVIEW */}
            <div className="bg-[#0b101c] border border-slate-800 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-yellow-400" />
                  <span>Tonight Patrol - 4 Checkpoints</span>
                </h3>
                <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                  {checkpoints.filter((c) => c.status === 'DONE').length}/4
                </span>
              </div>

              {/* Checkpoints list */}
              <div className="space-y-2.5">
                {checkpoints.map((cp) => (
                  <div
                    key={cp.id}
                    className="p-3.5 rounded-2xl bg-[#12192c] border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          cp.status === 'DONE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30'
                        }`}
                      >
                        {cp.status === 'DONE' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <QrCode className="w-5 h-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-white truncate">
                            {cp.name}
                          </span>
                          {cp.status === 'DONE' && (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded font-bold">
                              DONE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {cp.status === 'DONE'
                            ? `Scanned at ${cp.scannedAt}`
                            : cp.location}
                        </p>
                      </div>
                    </div>

                    {/* Scan Button or Done indicator */}
                    {cp.status === 'DONE' ? (
                      <span className="text-xs font-mono text-emerald-400 font-bold px-2 py-1 bg-emerald-500/10 rounded-lg shrink-0">
                        ✓ Scanned
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenScanForCheckpoint(cp)}
                        className="py-2 px-3.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-yellow-400/20 active:scale-95 transition-transform shrink-0"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Scan QR</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 3. SOS EMERGENCY: BIG RED BUTTON AT BOTTOM */}
            <div className="pt-2">
              <button
                onClick={() => {
                  sound.playRadioClick();
                  setIsSOSModalOpen(true);
                }}
                className="w-full py-5 px-6 rounded-3xl bg-red-600 hover:bg-red-500 text-white font-black text-xl sm:text-2xl flex items-center justify-center gap-3 shadow-2xl shadow-red-600/40 border-2 border-red-400 active:scale-[0.98] transition-transform animate-urgent"
              >
                <AlertOctagon className="w-7 h-7 sm:w-8 sm:h-8" />
                <span>SOS - EMERGENCY</span>
              </button>
              <p className="text-center text-[11px] text-slate-400 font-mono mt-2">
                Pressing instantly alerts Supervisor, Control Room, and triggers siren
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: PATROL CHECKPOINTS FULL VIEW */}
        {activeTab === 'patrol' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black text-white">Patrol Route: 4 Checkpoints</h2>
                  <p className="text-xs text-slate-400">
                    Mandatory 2-hour perimeter round · Sunrise Apartment
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-yellow-400 font-mono">
                    {Math.round((checkpoints.filter((c) => c.status === 'DONE').length / 4) * 100)}%
                  </span>
                  <span className="block text-[10px] text-slate-400 font-mono uppercase">
                    COMPLETED
                  </span>
                </div>
              </div>

              {/* Checkpoint Detailed Cards */}
              <div className="space-y-3">
                {checkpoints.map((cp, idx) => (
                  <div
                    key={cp.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      cp.status === 'DONE'
                        ? 'bg-[#0b1712] border-emerald-500/40'
                        : 'bg-[#12192c] border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-800 font-mono font-bold text-xs text-white flex items-center justify-center shrink-0 mt-0.5">
                          0{idx + 1}
                        </span>
                        <div>
                          <h4 className="font-extrabold text-base text-white">{cp.name}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">{cp.location}</p>
                          <div className="text-[11px] font-mono text-slate-500 mt-1">
                            QR Tag: {cp.qrCode}
                          </div>
                        </div>
                      </div>

                      {cp.status === 'DONE' ? (
                        <div className="text-right shrink-0">
                          <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                            ✓ Scanned at {cp.scannedAt}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenScanForCheckpoint(cp)}
                          className="py-2.5 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-yellow-400/20 active:scale-95 transition-transform shrink-0"
                        >
                          <QrCode className="w-4 h-4" />
                          <span>Scan QR</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SOS DIRECT LAUNCHER */}
        {activeTab === 'sos' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-[#1a0808] border-2 border-red-500 rounded-3xl p-6 text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center text-red-500 animate-pulse">
                <AlertOctagon className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-black text-white">Emergency Panic Terminal</h2>
              <p className="text-xs text-slate-300">
                Tap button below in case of intrusion, medical emergency, fire, or safety threat.
              </p>

              <button
                onClick={() => {
                  sound.playRadioClick();
                  setIsSOSModalOpen(true);
                }}
                className="w-full py-5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xl shadow-xl shadow-red-600/40 active:scale-95 transition-transform"
              >
                TRIGGER SOS NOW
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === 'profile' && (
          <GuardProfile
            guard={guard}
            onToggleTorch={onToggleTorch}
            isTorchOn={isTorchOn}
          />
        )}
      </div>

      {/* BOTTOM NAVIGATION BAR FOR GUARD APP: Home, Patrol, SOS, Profile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#090d18]/95 backdrop-blur-md border-t border-slate-800/80 px-4 py-2">
        <div className="max-w-md sm:max-w-lg mx-auto grid grid-cols-4 gap-1">
          <button
            onClick={() => {
              sound.playRadioClick();
              setActiveTab('home');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === 'home'
                ? 'text-yellow-400 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Home</span>
          </button>

          <button
            onClick={() => {
              sound.playRadioClick();
              setActiveTab('patrol');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all relative ${
              activeTab === 'patrol'
                ? 'text-yellow-400 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Patrol</span>
            {checkpoints.filter((c) => c.status === 'PENDING').length > 0 && (
              <span className="absolute top-1 right-5 w-2 h-2 rounded-full bg-yellow-400" />
            )}
          </button>

          <button
            onClick={() => {
              sound.playRadioClick();
              setActiveTab('sos');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === 'sos'
                ? 'text-red-500 font-extrabold'
                : 'text-red-400/80 hover:text-red-400'
            }`}
          >
            <AlertOctagon className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">SOS</span>
          </button>

          <button
            onClick={() => {
              sound.playRadioClick();
              setActiveTab('profile');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === 'profile'
                ? 'text-yellow-400 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Profile</span>
          </button>
        </div>
      </nav>

      {/* FULL SCREEN MODALS */}
      <WakeUpModal
        isOpen={isWakeUpModalOpen}
        onClose={() => setIsWakeUpModalOpen(false)}
        onSuccess={handleCheckInSuccess}
        onOpenQRScanner={() => {
          setIsWakeUpModalOpen(false);
          setIsQRScannerOpen(true);
        }}
        onOpenSelfie={() => {
          setIsWakeUpModalOpen(false);
          setIsSelfieModalOpen(true);
        }}
      />

      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => {
          setIsQRScannerOpen(false);
          setTargetCheckpoint(null);
        }}
        onScanSuccess={handleCheckpointScan}
        targetCheckpoint={targetCheckpoint}
        allCheckpoints={checkpoints}
      />

      <SelfieModal
        isOpen={isSelfieModalOpen}
        onClose={() => setIsSelfieModalOpen(false)}
        onSuccess={() => handleCheckInSuccess('selfie')}
        guardName={guard.name}
      />

      <SOSModal
        isOpen={isSOSModalOpen}
        onClose={() => setIsSOSModalOpen(false)}
        guardName={guard.name}
        siteName={guard.site}
      />
    </div>
  );
};
