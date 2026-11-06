import React, { useState } from 'react';
import { Guard, Checkpoint } from '../../types/security';
import { MapPin, Shield, AlertTriangle, Eye, Compass, Layers } from 'lucide-react';
import { sound } from '../../utils/audio';

interface BuildingMapProps {
  guards: Guard[];
  checkpoints: Checkpoint[];
  onSelectGuard: (guard: Guard) => void;
}

export const BuildingMap: React.FC<BuildingMapProps> = ({
  guards,
  checkpoints,
  onSelectGuard,
}) => {
  const [selectedPin, setSelectedPin] = useState<Guard | null>(null);
  const [activeLayer, setActiveLayer] = useState<'all' | 'guards' | 'checkpoints'>('all');

  return (
    <div className="bg-[#0b101c] border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-yellow-400" />
              <span>Live Site Radar Map</span>
            </h3>
            <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
              GPS TELEMETRY ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Sunrise Apartment Campus · 3 Active Posts · 4 Checkpoint Beacons
          </p>
        </div>

        {/* Layer Filters */}
        <div className="flex items-center gap-1 p-1 bg-[#12192c] rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveLayer('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              activeLayer === 'all'
                ? 'bg-yellow-400 text-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Pins
          </button>
          <button
            onClick={() => setActiveLayer('guards')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              activeLayer === 'guards'
                ? 'bg-yellow-400 text-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Guards Only
          </button>
          <button
            onClick={() => setActiveLayer('checkpoints')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              activeLayer === 'checkpoints'
                ? 'bg-yellow-400 text-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Checkpoints
          </button>
        </div>
      </div>

      {/* SVG Canvas Map Container */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] min-h-[300px] sm:min-h-[340px] bg-[#070b14] border-2 border-slate-800 rounded-2xl overflow-hidden shadow-inner">
        
        {/* Radar Sweep Animation Line */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="w-full h-full rounded-full border border-yellow-400/30 transform scale-150 origin-center animate-radar bg-conic from-yellow-400/20 via-transparent to-transparent" />
        </div>

        {/* Blueprint Grid Lines */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#162238" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Campus Boundary Outline */}
          <rect
            x="5%"
            y="8%"
            width="90%"
            height="84%"
            rx="16"
            fill="none"
            stroke="#1e2d4a"
            strokeWidth="2"
            strokeDasharray="6 4"
          />

          {/* Tower A Block */}
          <rect x="18%" y="22%" width="22%" height="32%" rx="8" fill="#111a2d" stroke="#2a3f68" strokeWidth="1.5" />
          <text x="29%" y="39%" fill="#64748b" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            TOWER A
          </text>

          {/* Tower B Block */}
          <rect x="58%" y="20%" width="24%" height="34%" rx="8" fill="#111a2d" stroke="#2a3f68" strokeWidth="1.5" />
          <text x="70%" y="38%" fill="#64748b" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            TOWER B (ROOFTOP)
          </text>

          {/* Central Courtyard & Swimming Pool */}
          <rect x="43%" y="30%" width="12%" height="18%" rx="6" fill="#0c1d2e" stroke="#1b4965" strokeWidth="1" />
          <text x="49%" y="40%" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            POOL & GARDEN
          </text>

          {/* Main Gate (North) */}
          <rect x="16%" y="74%" width="16%" height="14%" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          <text x="24%" y="82%" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">
            MAIN GATE
          </text>

          {/* Parking Area (Center South) */}
          <rect x="42%" y="60%" width="16%" height="16%" rx="6" fill="#1a253a" stroke="#253552" strokeWidth="1" />
          <text x="50%" y="69%" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">
            PARKING B1
          </text>

          {/* Back Gate (South-East) */}
          <rect x="74%" y="76%" width="16%" height="12%" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          <text x="82%" y="84%" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">
            BACK GATE
          </text>

          {/* Patrol Pathway Lines */}
          <path
            d="M 22 78 L 48 65 L 80 82 L 62 28 Z"
            fill="none"
            stroke="#facc15"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="opacity-40"
          />
        </svg>

        {/* Checkpoint Indicators */}
        {(activeLayer === 'all' || activeLayer === 'checkpoints') &&
          checkpoints.map((cp) => (
            <div
              key={cp.id}
              style={{ left: `${cp.coords.x}%`, top: `${cp.coords.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group z-10"
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-150 ${
                  cp.status === 'DONE'
                    ? 'bg-emerald-500 border-white shadow-[0_0_8px_rgba(34,197,94,0.8)]'
                    : 'bg-yellow-400 border-black shadow-[0_0_8px_rgba(250,204,21,0.8)]'
                }`}
              />
              <div className="hidden group-hover:block absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] font-mono px-2 py-1 rounded shadow border border-slate-700 whitespace-nowrap z-30">
                CP: {cp.name} ({cp.status})
              </div>
            </div>
          ))}

        {/* Guard Live Markers */}
        {(activeLayer === 'all' || activeLayer === 'guards') &&
          guards.map((guard) => {
            const isMissed = guard.status === 'MISSED';
            return (
              <div
                key={guard.id}
                style={{ left: `${guard.coords.x}%`, top: `${guard.coords.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
                onClick={() => {
                  sound.playRadioClick();
                  setSelectedPin(guard);
                  onSelectGuard(guard);
                }}
              >
                {/* Blinking wave rings for missed alert */}
                {isMissed ? (
                  <div className="relative">
                    <span className="absolute -inset-3 rounded-full bg-red-600/40 animate-ping" />
                    <div className="relative w-8 h-8 rounded-full bg-red-600 text-white font-extrabold text-xs flex items-center justify-center border-2 border-white shadow-[0_0_15px_rgba(239,68,68,0.9)] animate-urgent">
                      !
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <span className="absolute -inset-1 rounded-full bg-emerald-400/30 animate-pulse" />
                    <div className="relative w-7 h-7 rounded-full bg-emerald-500 text-black font-extrabold text-xs flex items-center justify-center border-2 border-white shadow-[0_0_12px_rgba(34,197,94,0.8)]">
                      ✓
                    </div>
                  </div>
                )}

                {/* Permanent Name Tag */}
                <div
                  className={`mt-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded shadow-lg whitespace-nowrap text-center ${
                    isMissed
                      ? 'bg-red-600 text-white border border-red-400'
                      : 'bg-black/90 text-emerald-400 border border-emerald-500/50'
                  }`}
                >
                  {guard.name.split(' ')[0]}
                </div>
              </div>
            );
          })}

        {/* Selected Guard Tooltip Popup */}
        {selectedPin && (
          <div className="absolute top-3 right-3 bg-black/95 border-2 border-yellow-400 rounded-2xl p-3.5 text-xs text-white shadow-2xl z-30 max-w-[240px]">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-extrabold text-sm text-yellow-400">{selectedPin.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPin(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1 text-[11px] text-slate-300">
              <p>Post: <strong className="text-white">{selectedPin.locationName}</strong></p>
              <p>
                Status:{' '}
                <strong
                  className={
                    selectedPin.status === 'MISSED' ? 'text-red-400' : 'text-emerald-400'
                  }
                >
                  {selectedPin.status === 'MISSED' ? 'MISSED CHECK-IN!' : 'Awake & Active'}
                </strong>
              </p>
              <p>Last Ping: {selectedPin.lastCheckInMinutesAgo} mins ago</p>
              <p>Patrols: {selectedPin.patrolCompletedCount}/{selectedPin.patrolTotalCount}</p>
            </div>
          </div>
        )}

        {/* Map Legend */}
        <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-3 text-[11px] font-mono text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Awake (Green)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span>Missed (Red)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span>Checkpoint</span>
          </div>
        </div>
      </div>
    </div>
  );
};
