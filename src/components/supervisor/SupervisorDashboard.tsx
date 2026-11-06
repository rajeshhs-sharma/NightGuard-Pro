import React, { useState } from 'react';
import { Guard, Checkpoint, NightReportEntry } from '../../types/security';
import { SITE_DETAILS } from '../../data/mockData';
import { BuildingMap } from './BuildingMap';
import { WalkieTalkieModal } from './WalkieTalkieModal';
import { NightReportModal } from './NightReportModal';
import {
  Shield,
  Users,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Phone,
  Volume2,
  Download,
  Search,
  Radio,
  Clock,
  MapPin,
  ExternalLink,
  BellRing,
  Send,
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface SupervisorDashboardProps {
  guards: Guard[];
  checkpoints: Checkpoint[];
  nightReports: NightReportEntry[];
  onTriggerAlarmOnGuard: (guardId: string) => void;
  onBroadcastMessage?: (message: string) => void;
}

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({
  guards,
  checkpoints,
  nightReports,
  onTriggerAlarmOnGuard,
  onBroadcastMessage,
}) => {
  const [selectedGuard, setSelectedGuard] = useState<Guard | null>(null);
  const [modalMode, setModalMode] = useState<'call' | 'alarm' | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AWAKE' | 'MISSED'>('ALL');
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastToast, setBroadcastToast] = useState<string | null>(null);

  // Calculations for top stats
  const totalGuards = guards.length;
  const awakeGuards = guards.filter((g) => g.status === 'AWAKE').length;
  const missedGuards = guards.filter((g) => g.status === 'MISSED' || g.status === 'ALERT').length;
  
  // Calculate aggregate patrol percentage
  const totalPatrolPossible = guards.reduce((sum, g) => sum + g.patrolTotalCount, 0);
  const totalPatrolDone = guards.reduce((sum, g) => sum + g.patrolCompletedCount, 0);
  const aggregatePatrolPercent = totalPatrolPossible > 0
    ? Math.round((totalPatrolDone / totalPatrolPossible) * 100)
    : 78;

  const handleOpenCall = (guard: Guard) => {
    setSelectedGuard(guard);
    setModalMode('call');
  };

  const handleOpenAlarm = (guard: Guard) => {
    setSelectedGuard(guard);
    setModalMode('alarm');
  };

  const handleBroadcastSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    sound.playRadioClick();
    setBroadcastToast(`Broadcast sent to all 3 guards: "${broadcastText}"`);
    setBroadcastText('');
    setTimeout(() => setBroadcastToast(null), 4000);
  };

  const filteredGuards = guards.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.locationName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      statusFilter === 'ALL' ||
      (statusFilter === 'AWAKE' && g.status === 'AWAKE') ||
      (statusFilter === 'MISSED' && g.status === 'MISSED');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-black text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Broadcast Toast Banner */}
      {broadcastToast && (
        <div className="bg-yellow-400 text-black px-4 py-3 rounded-2xl font-black text-sm flex items-center justify-between shadow-xl animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 animate-pulse" />
            <span>{broadcastToast}</span>
          </div>
          <button onClick={() => setBroadcastToast(null)} className="font-bold text-xs uppercase underline">
            Dismiss
          </button>
        </div>
      )}

      {/* TOP HEADER TITLE & SITE INFO */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0b101c] border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full opacity-10 pointer-events-none hidden lg:block">
          <img
            src="/src/assets/images/site_sunrise_apartments_1793938696612.jpg"
            alt="Sunrise Apartment Site"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-yellow-400 font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>COMMAND & MONITORING CONSOLE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Supervisor Live Dashboard - {SITE_DETAILS.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-yellow-400 shrink-0" />
            <span>{SITE_DETAILS.area}</span>
            <span>·</span>
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-mono text-slate-300">Shift: 10 PM - 6 AM</span>
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              sound.playRadioClick();
              setIsReportOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-yellow-400/20 active:scale-95 transition-transform"
          >
            <Download className="w-4 h-4" />
            <span>Download Night Report PDF</span>
          </button>
        </div>
      </div>

      {/* TOP STATS: Total Guards: 3, Awake: 2, Sleeping/Missed: 1, Patrol Completed: 78% */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-mono">
        {/* Stat 1: Total Guards */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-sans uppercase font-bold tracking-wider">
              Total Guards
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white mt-2 tabular-nums">
            {totalGuards}
          </div>
          <span className="text-[11px] text-slate-400 font-sans mt-1 block">
            All 3 posts occupied
          </span>
        </div>

        {/* Stat 2: Awake */}
        <div className="bg-[#091510] border-2 border-emerald-500/60 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-sans uppercase font-bold tracking-wider">
              Awake & Active
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-400 mt-2 tabular-nums">
            {awakeGuards}
          </div>
          <span className="text-[11px] text-emerald-300/80 font-sans mt-1 block">
            Regular 15m pings verified
          </span>
        </div>

        {/* Stat 3: Sleeping / Missed */}
        <div className="bg-[#1c0c0c] border-2 border-red-500 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden animate-urgent">
          <div className="flex items-center justify-between">
            <span className="text-xs text-red-400 font-sans uppercase font-bold tracking-wider">
              Sleeping / Missed
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-600/30 text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-red-400 mt-2 tabular-nums">
            {missedGuards}
          </div>
          <span className="text-[11px] text-red-300 font-sans mt-1 block font-bold">
            Alert Sent · Action Required!
          </span>
        </div>

        {/* Stat 4: Patrol Completed */}
        <div className="bg-[#0f172a] border border-yellow-400/50 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-yellow-400 font-sans uppercase font-bold tracking-wider">
              Patrol Completed
            </span>
            <div className="w-8 h-8 rounded-lg bg-yellow-400/10 text-yellow-400 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-yellow-400 mt-2 tabular-nums">
            {aggregatePatrolPercent}%
          </div>
          <span className="text-[11px] text-slate-400 font-sans mt-1 block">
            Round 02 in progress
          </span>
        </div>
      </div>

      {/* TWO COLUMNS: LIVE GUARD LIST & LIVE RADAR MAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: LIVE GUARD LIST (7 cols) */}
        <div className="lg:col-span-7 bg-[#0b101c] border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-yellow-400" />
                <span>Live Guard Roster & Status</span>
              </h2>
              <p className="text-xs text-slate-400">
                Real-time vigilance tracking and remote intervention controls
              </p>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-1 p-1 bg-[#12192c] rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  statusFilter === 'ALL' ? 'bg-yellow-400 text-black' : 'text-slate-400'
                }`}
              >
                All (3)
              </button>
              <button
                onClick={() => setStatusFilter('AWAKE')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  statusFilter === 'AWAKE' ? 'bg-yellow-400 text-black' : 'text-slate-400'
                }`}
              >
                Awake (2)
              </button>
              <button
                onClick={() => setStatusFilter('MISSED')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  statusFilter === 'MISSED' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                Missed (1)
              </button>
            </div>
          </div>

          {/* Guard List Cards */}
          <div className="space-y-3">
            {filteredGuards.map((guard, index) => {
              const isMissed = guard.status === 'MISSED';
              return (
                <div
                  key={guard.id}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    isMissed
                      ? 'bg-[#1a0a0a] border-red-500 shadow-lg shadow-red-950/50'
                      : 'bg-[#12192c] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Guard Info */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* Avatar or Status Indicator */}
                      <div className="relative shrink-0">
                        {guard.avatar ? (
                          <img
                            src={guard.avatar}
                            alt={guard.name}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-slate-700"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-white text-base">
                            {guard.name.charAt(0)}
                          </div>
                        )}
                        <span
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black flex items-center justify-center ${
                            isMissed ? 'bg-red-600 animate-ping' : 'bg-emerald-500'
                          }`}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400">
                            #{index + 1}
                          </span>
                          <h3 className="font-extrabold text-base text-white truncate">
                            {guard.name}
                          </h3>
                          <span className="text-xs font-mono text-slate-400">
                            ({guard.locationName})
                          </span>
                        </div>

                        {/* Status Pills */}
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs font-mono">
                          {isMissed ? (
                            <span className="px-2 py-0.5 rounded bg-red-600 text-white font-extrabold uppercase animate-pulse">
                              RED · MISSED CHECK-IN!
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-extrabold uppercase border border-emerald-500/40">
                              GREEN · AWAKE
                            </span>
                          )}

                          <span className="text-slate-300">
                            Last Check-in: <strong className="text-white">{guard.lastCheckInMinutesAgo} mins ago</strong>
                          </span>

                          <span className="text-yellow-400">
                            Patrol: <strong>{guard.patrolCompletedCount}/{guard.patrolTotalCount}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isMissed ? (
                        <>
                          <button
                            onClick={() => handleOpenCall(guard)}
                            className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95 transition-transform"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Call Guard</span>
                          </button>
                          <button
                            onClick={() => handleOpenAlarm(guard)}
                            className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-600/30 active:scale-95 transition-transform animate-bounce"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Send Loud Alarm</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleOpenCall(guard)}
                          className="w-full sm:w-auto py-2 px-4 rounded-xl bg-[#1a233a] hover:bg-[#253252] text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95 transition-transform"
                        >
                          <Radio className="w-3.5 h-3.5 text-yellow-400" />
                          <span>Radio / Call</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Broadcast Announcement */}
          <form onSubmit={handleBroadcastSend} className="pt-2 flex items-center gap-2">
            <input
              type="text"
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              placeholder="Send live walkie-talkie message to all 3 guards..."
              className="flex-1 bg-[#12192c] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-yellow-400/20 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast</span>
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: LIVE RADAR MAP (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <BuildingMap
            guards={guards}
            checkpoints={checkpoints}
            onSelectGuard={(g) => {
              if (g.status === 'MISSED') {
                handleOpenAlarm(g);
              } else {
                handleOpenCall(g);
              }
            }}
          />
        </div>

      </div>

      {/* NIGHT REPORT SECTION */}
      <div className="bg-[#0b101c] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span>Night Shift Audit Report Section</span>
            </h2>
            <p className="text-xs text-slate-400">
              Shift summary table with vigilance compliance, checkpoint log, and official PDF generator
            </p>
          </div>

          <button
            onClick={() => {
              sound.playRadioClick();
              setIsReportOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-yellow-400/20 active:scale-95 transition-transform"
          >
            <Download className="w-4 h-4" />
            <span>Download Night Report PDF</span>
          </button>
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#12192c] text-yellow-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-bold">GUARD NAME</th>
                <th className="py-3 px-4 font-bold">TOTAL CHECK-INS</th>
                <th className="py-3 px-4 font-bold">MISSED</th>
                <th className="py-3 px-4 font-bold">PATROL %</th>
                <th className="py-3 px-4 font-bold">STATUS</th>
                <th className="py-3 px-4 font-bold">LAST PING</th>
                <th className="py-3 px-4 font-bold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-[#090d18]">
              {nightReports.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                    {row.guardName}
                    <span className="block text-[11px] text-slate-400 font-normal">
                      {row.post}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-white">
                    {row.totalCheckIns}/{row.expectedCheckIns}
                  </td>
                  <td className="py-3.5 px-4 font-bold">
                    {row.missedCheckIns > 0 ? (
                      <span className="text-red-400">{row.missedCheckIns} MISSED</span>
                    ) : (
                      <span className="text-emerald-400">0</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-yellow-400">
                    {row.patrolPercentage}%
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {row.status === 'AWAKE' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Awake
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-0.5 rounded font-bold border border-red-500/30">
                        <AlertTriangle className="w-3 h-3" /> Missed Check-in
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{row.lastPing}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        const targetGuard = guards.find((g) => g.name.includes(row.guardName.split(' ')[0]));
                        if (targetGuard) {
                          handleOpenCall(targetGuard);
                        }
                      }}
                      className="px-2.5 py-1 rounded bg-[#1a233a] hover:bg-[#253252] text-yellow-400 border border-slate-700 font-bold text-[11px] transition-colors"
                    >
                      Audit Log
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUPERVISOR MODALS */}
      <WalkieTalkieModal
        guard={selectedGuard}
        mode={modalMode}
        onClose={() => {
          setSelectedGuard(null);
          setModalMode(null);
        }}
        onSendAlarmDone={(guardId) => onTriggerAlarmOnGuard(guardId)}
      />

      <NightReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        reportEntries={nightReports}
      />
    </div>
  );
};
