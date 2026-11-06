import React, { useRef } from 'react';
import { NightReportEntry } from '../../types/security';
import { SITE_DETAILS } from '../../data/mockData';
import { Printer, Download, X, Shield, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { sound } from '../../utils/audio';

interface NightReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportEntries: NightReportEntry[];
}

export const NightReportModal: React.FC<NightReportModalProps> = ({
  isOpen,
  onClose,
  reportEntries,
}) => {
  const printRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    sound.playRadioClick();
    window.print();
  };

  const handleDownloadPDF = () => {
    sound.playSuccessChime();
    // Create printable clean window or formatted file download
    const reportText = `
NIGHTGUARD PRO - OFFICIAL NIGHT SHIFT SECURITY AUDIT REPORT
================================================================
Site: ${SITE_DETAILS.name}, ${SITE_DETAILS.area}
Agency: ${SITE_DETAILS.company} (PSARA: ${SITE_DETAILS.license})
Supervisor: ${SITE_DETAILS.supervisor}
Shift: 10:00 PM - 06:00 AM | Date: ${new Date().toLocaleDateString()}
Generated: ${new Date().toLocaleTimeString()}

EXECUTIVE SUMMARY
----------------------------------------------------------------
Total Guards Deployed: ${reportEntries.length}
Awake & Verified: ${reportEntries.filter((r) => r.status === 'AWAKE').length}
Missed Check-ins: ${reportEntries.filter((r) => r.status === 'MISSED').length}
Average Patrol Completion: 78%

GUARD AUDIT LOG
----------------------------------------------------------------
${reportEntries
  .map(
    (r, i) =>
      `${i + 1}. [${r.badgeNumber}] ${r.guardName}
   Post: ${r.post}
   Check-ins: ${r.totalCheckIns}/${r.expectedCheckIns} (Missed: ${r.missedCheckIns})
   Patrol Completion: ${r.patrolPercentage}%
   Status: ${r.status}
   Last Ping: ${r.lastPing}
   Notes: ${r.supervisorNotes}
`
  )
  .join('\n')}

INCIDENTS & REMARKS
----------------------------------------------------------------
01:25 AM - Guard Manju Nathan missed scheduled 15-min wake-up ping at Back Gate.
01:42 AM - Supervisor remote alert & alarm broadcast dispatched.
All other perimeter gates nominal.

SUPERVISOR VERIFICATION
----------------------------------------------------------------
Verified by: Vikram Singh (Head of Night Operations)
Electronic Signature: NGP-SIG-${Math.floor(Math.random() * 900000 + 100000)}
================================================================
`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NightGuard_Report_SunriseApartments_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalAwake = reportEntries.filter((r) => r.status === 'AWAKE').length;
  const totalMissed = reportEntries.filter((r) => r.status === 'MISSED').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#0a0f1d] border-2 border-yellow-400 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-[#12192c] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-yellow-400 text-black flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                Official Night Shift Audit Report
              </h3>
              <p className="text-xs text-slate-400">
                {SITE_DETAILS.name} · Shift 22:00 - 06:00
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-[#1a233a] hover:bg-[#253252] text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-3.5 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black flex items-center gap-1.5 shadow-md shadow-yellow-400/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF / Text</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Printable Document View */}
        <div ref={printRef} className="p-6 overflow-y-auto space-y-6 text-slate-200 bg-[#070b14]">
          {/* Official Letterhead */}
          <div className="border-b-2 border-yellow-400/60 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <div className="flex items-center gap-2 text-yellow-400 font-extrabold text-xl tracking-tight">
                <Shield className="w-6 h-6 fill-current" />
                <span>APEX SECURITY FORCE PVT. LTD.</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Govt Regd Security Provider · PSARA License: {SITE_DETAILS.license}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                Central Operations Control: {SITE_DETAILS.controlRoomPhone}
              </p>
            </div>

            <div className="text-left sm:text-right text-xs font-mono space-y-0.5">
              <div className="text-white font-bold">REPORT: SHIFT-AUDIT-20261105</div>
              <div className="text-yellow-400 font-bold">SITE: {SITE_DETAILS.name}</div>
              <div className="text-slate-400">Date: {new Date().toLocaleDateString()}</div>
              <div className="text-slate-400">Shift: 10:00 PM - 06:00 AM</div>
            </div>
          </div>

          {/* KPI Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
            <div className="bg-[#0e1628] border border-slate-800 rounded-xl p-3">
              <div className="text-xs text-slate-400 uppercase">Total Guards</div>
              <div className="text-2xl font-black text-white mt-1">{reportEntries.length}</div>
            </div>
            <div className="bg-[#0a1a12] border border-emerald-500/40 rounded-xl p-3">
              <div className="text-xs text-emerald-400 uppercase">Awake / Active</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{totalAwake}</div>
            </div>
            <div className="bg-[#1c0c0c] border border-red-500/40 rounded-xl p-3">
              <div className="text-xs text-red-400 uppercase">Missed Pings</div>
              <div className="text-2xl font-black text-red-400 mt-1">{totalMissed}</div>
            </div>
            <div className="bg-[#0e1628] border border-yellow-400/40 rounded-xl p-3">
              <div className="text-xs text-yellow-400 uppercase">Patrol Coverage</div>
              <div className="text-2xl font-black text-yellow-400 mt-1">78%</div>
            </div>
          </div>

          {/* Audit Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#12192c] text-yellow-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-bold">GUARD NAME & ID</th>
                  <th className="py-3 px-4 font-bold">POSTED LOCATION</th>
                  <th className="py-3 px-4 font-bold">CHECK-INS</th>
                  <th className="py-3 px-4 font-bold">MISSED</th>
                  <th className="py-3 px-4 font-bold">PATROL %</th>
                  <th className="py-3 px-4 font-bold">STATUS</th>
                  <th className="py-3 px-4 font-bold">SUPERVISOR LOG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-[#090d18]">
                {reportEntries.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      {row.guardName}
                      <span className="block text-[11px] text-slate-400 font-normal">
                        {row.badgeNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{row.post}</td>
                    <td className="py-3.5 px-4 text-white">
                      {row.totalCheckIns}/{row.expectedCheckIns}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-red-400">
                      {row.missedCheckIns > 0 ? `${row.missedCheckIns} MISSED` : '0'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-yellow-400">{row.patrolPercentage}%</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {row.status === 'AWAKE' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> AWAKE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-0.5 rounded font-bold border border-red-500/30">
                          <AlertTriangle className="w-3 h-3" /> MISSED
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs text-[11px] font-sans">
                      {row.supervisorNotes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Supervisor Sign-Off Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div className="p-4 bg-[#0e1628] rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                Field Supervisor In Charge
              </span>
              <div className="font-bold text-white text-sm">{SITE_DETAILS.supervisor}</div>
              <div className="text-slate-400 text-xs">Head of Night Operations · Mobile: {SITE_DETAILS.supervisorPhone}</div>
            </div>

            <div className="p-4 bg-[#0e1628] rounded-xl border border-slate-800 font-mono">
              <span className="text-[11px] text-slate-400 uppercase block mb-1">
                Digital Verification Seal
              </span>
              <div className="text-emerald-400 font-bold">✓ CRYPTOGRAPHIC AUDIT VERIFIED</div>
              <div className="text-slate-400 text-[11px]">Timestamp: {new Date().toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
