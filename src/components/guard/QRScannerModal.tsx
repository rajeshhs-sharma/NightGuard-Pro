import React, { useState, useEffect, useRef } from 'react';
import { X, QrCode, Flashlight, Camera, Check, RefreshCw } from 'lucide-react';
import { sound } from '../../utils/audio';
import { Checkpoint } from '../../types/security';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (checkpointId?: string) => void;
  targetCheckpoint?: Checkpoint | null;
  allCheckpoints?: Checkpoint[];
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  targetCheckpoint,
  allCheckpoints = [],
}) => {
  const [isTorchActive, setIsTorchActive] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<string>(
    targetCheckpoint?.id || (allCheckpoints.find((c) => c.status === 'PENDING')?.id || 'wake-up')
  );
  const [useRealCamera, setUseRealCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (targetCheckpoint) {
      setSelectedTargetId(targetCheckpoint.id);
    }
  }, [targetCheckpoint]);

  // Clean up camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setUseRealCamera(false);
      setCameraError(null);
    }
  }, [isOpen]);

  const toggleRealCamera = async () => {
    if (useRealCamera) {
      stopCamera();
      setUseRealCamera(false);
      return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera API not accessible in this sandbox environment');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setUseRealCamera(true);
      setCameraError(null);
    } catch {
      setCameraError('Camera permission denied or camera not found. Using high-tech simulated viewfinder.');
      setUseRealCamera(false);
    }
  };

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    sound.playRadioClick();
    sound.triggerVibrate([100, 50, 150]);
    setTimeout(() => {
      sound.playSuccessChime();
      stopCamera();
      onScanSuccess(selectedTargetId === 'wake-up' ? undefined : selectedTargetId);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/95 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#0a0f1d] border-2 border-yellow-400/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-[#12192c] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-yellow-400 text-black flex items-center justify-center font-bold">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Security QR Scanner
              </h3>
              <p className="text-[11px] text-slate-400">
                {targetCheckpoint ? `Checkpoint: ${targetCheckpoint.name}` : 'Awake Verification Check-in'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Checkpoint selector if multiple are pending */}
        {allCheckpoints.length > 0 && !targetCheckpoint && (
          <div className="px-4 py-2 bg-[#0c1222] border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-400 shrink-0 font-medium text-[11px]">Target:</span>
            <button
              onClick={() => setSelectedTargetId('wake-up')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedTargetId === 'wake-up'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Awake Check-in
            </button>
            {allCheckpoints.map((cp) => (
              <button
                key={cp.id}
                onClick={() => setSelectedTargetId(cp.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedTargetId === cp.id
                    ? 'bg-yellow-400 text-black'
                    : cp.status === 'DONE'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {cp.name} {cp.status === 'DONE' && '✓'}
              </button>
            ))}
          </div>
        )}

        {/* Camera / Viewfinder Box */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[340px] bg-black flex items-center justify-center overflow-hidden">
          {/* Real Video or Simulated HUD */}
          {useRealCamera ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-radial from-slate-900 to-black p-4">
              {/* Simulated QR Code Target */}
              <div className="relative p-3 bg-white rounded-xl shadow-2xl border-4 border-yellow-400/40">
                <div className="w-32 h-32 bg-slate-900 rounded flex flex-col items-center justify-center p-2">
                  <div className="grid grid-cols-5 gap-1.5 w-full h-full p-1 bg-white rounded">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-xs ${
                          [0, 1, 2, 5, 9, 10, 12, 14, 15, 19, 20, 21, 22, 24].includes(i)
                            ? 'bg-black'
                            : 'bg-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-black font-extrabold text-center mt-1">
                  {targetCheckpoint?.qrCode || 'NGP-GATEHOUSE-AWAKE-QR'}
                </div>
              </div>
              <p className="text-xs text-yellow-300 font-mono mt-4 font-semibold">
                Align QR Code inside yellow brackets
              </p>
            </div>
          )}

          {/* Scanner Viewfinder Overlay */}
          <div className="relative w-64 h-64 border-2 border-yellow-400/40 rounded-2xl pointer-events-none flex items-center justify-center">
            {/* Viewfinder corner brackets */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-yellow-400 rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-yellow-400 rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-yellow-400 rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-yellow-400 rounded-br-lg" />

            {/* Red / Yellow Laser Scanline */}
            <div className="absolute left-2 right-2 h-0.5 bg-red-500 shadow-[0_0_12px_3px_rgba(239,68,68,0.9)] animate-scanline" />

            {/* Center target crosshair */}
            <div className="w-4 h-4 border border-yellow-400/60 rounded-full opacity-60" />
          </div>

          {/* Torch Light Overlay if active */}
          {isTorchActive && (
            <div className="absolute inset-0 bg-yellow-200/10 pointer-events-none backdrop-brightness-125" />
          )}

          {/* Bottom Floating controls inside camera */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-auto">
            <button
              onClick={() => setIsTorchActive(!isTorchActive)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                isTorchActive
                  ? 'bg-yellow-400 text-black border-yellow-400'
                  : 'bg-black/70 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <Flashlight className="w-3.5 h-3.5" />
              <span>Torch</span>
            </button>

            <button
              onClick={toggleRealCamera}
              className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-black/70 text-slate-300 border border-slate-700 hover:text-white"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{useRealCamera ? 'Use Demo QR' : 'Real Camera'}</span>
            </button>
          </div>
        </div>

        {/* Error notice if camera was blocked */}
        {cameraError && (
          <div className="px-4 py-2 bg-yellow-500/10 border-t border-yellow-500/20 text-[11px] text-yellow-300">
            {cameraError}
          </div>
        )}

        {/* Bottom Big Action Button */}
        <div className="p-4 bg-[#0d1424] border-t border-slate-800 space-y-2">
          <button
            onClick={handleSimulateScan}
            className="w-full py-4 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-base flex items-center justify-center gap-3 shadow-lg shadow-yellow-400/20 active:scale-[0.98] transition-transform"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>CONFIRM & SCAN QR CODE</span>
          </button>
          <p className="text-[11px] text-center text-slate-400">
            GPS Location & Digital Signature automatically stamped on scan
          </p>
        </div>
      </div>
    </div>
  );
};
