import React from 'react';
import { Guard } from '../../types/security';
import { SITE_DETAILS } from '../../data/mockData';
import { Shield, Phone, Radio, Battery, MapPin, Clock, Award, Flashlight } from 'lucide-react';
import { sound } from '../../utils/audio';

interface GuardProfileProps {
  guard: Guard;
  onToggleTorch: () => void;
  isTorchOn: boolean;
}

export const GuardProfile: React.FC<GuardProfileProps> = ({
  guard,
  onToggleTorch,
  isTorchOn,
}) => {
  return (
    <div className="space-y-4 pb-20">
      {/* Official ID Badge Card */}
      <div className="bg-[#0f1627] border-2 border-yellow-400/40 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={guard.avatar}
              alt={guard.name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-yellow-400 shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0f1627] flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-mono font-bold uppercase">
              <Shield className="w-3.5 h-3.5" />
              <span>Officer on Duty</span>
            </div>
            <h3 className="text-xl font-black text-white truncate">{guard.name}</h3>
            <p className="text-xs font-mono text-slate-300">Badge: {guard.badgeNumber}</p>
            <p className="text-xs text-slate-400 truncate">{guard.site}</p>
          </div>
        </div>

        {/* Shift Details Grid */}
        <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-[#141d33] p-2.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-yellow-400" /> Duty Shift
            </span>
            <span className="font-bold text-white block mt-0.5">{guard.dutyShift}</span>
          </div>

          <div className="bg-[#141d33] p-2.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Battery className="w-3.5 h-3.5 text-emerald-400" /> Device Battery
            </span>
            <span className="font-bold text-emerald-400 block mt-0.5">{guard.battery}% (Good)</span>
          </div>

          <div className="bg-[#141d33] p-2.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-yellow-400" /> Walkie Channel
            </span>
            <span className="font-bold text-white block mt-0.5">CH-04 (Main Ops)</span>
          </div>

          <div className="bg-[#141d33] p-2.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-yellow-400" /> Security Grade
            </span>
            <span className="font-bold text-yellow-400 block mt-0.5">Senior Guard (A+)</span>
          </div>
        </div>
      </div>

      {/* Night Inspection Utility: Flashlight */}
      <div className="bg-[#0f1627] border border-slate-800 rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-extrabold text-white flex items-center gap-2">
              <Flashlight className="w-5 h-5 text-yellow-400" />
              <span>Guard Night Torch</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              High-intensity screen illumination for dark gates and corridors
            </p>
          </div>
          <button
            onClick={() => {
              sound.playRadioClick();
              onToggleTorch();
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              isTorchOn
                ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/40'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <span>{isTorchOn ? 'TORCH ON' : 'TURN ON'}</span>
          </button>
        </div>
      </div>

      {/* Emergency & Supervisor Contact Directory */}
      <div className="bg-[#0f1627] border border-slate-800 rounded-3xl p-5 space-y-3">
        <h4 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <Phone className="w-4 h-4 text-emerald-400" />
          <span>Quick Contacts</span>
        </h4>

        <div className="space-y-2 text-xs">
          <a
            href={`tel:${SITE_DETAILS.supervisorPhone}`}
            className="flex items-center justify-between p-3 rounded-xl bg-[#141d33] border border-slate-800 hover:border-yellow-400/40 transition-colors"
          >
            <div>
              <div className="font-bold text-white">{SITE_DETAILS.supervisor}</div>
              <div className="text-[11px] text-slate-400">Supervisor Direct Line</div>
            </div>
            <span className="px-3 py-1 bg-yellow-400/10 text-yellow-400 font-mono font-bold rounded-lg border border-yellow-400/30">
              CALL
            </span>
          </a>

          <a
            href={`tel:${SITE_DETAILS.controlRoomPhone}`}
            className="flex items-center justify-between p-3 rounded-xl bg-[#141d33] border border-slate-800 hover:border-yellow-400/40 transition-colors"
          >
            <div>
              <div className="font-bold text-white">Central Security Control Room</div>
              <div className="text-[11px] text-slate-400">24x7 Emergency Desk</div>
            </div>
            <span className="px-3 py-1 bg-emerald-400/10 text-emerald-400 font-mono font-bold rounded-lg border border-emerald-400/30">
              CALL
            </span>
          </a>

          <a
            href="tel:100"
            className="flex items-center justify-between p-3 rounded-xl bg-[#141d33] border border-slate-800 hover:border-red-400/40 transition-colors"
          >
            <div>
              <div className="font-bold text-white">{SITE_DETAILS.policeStation}</div>
              <div className="text-[11px] text-slate-400">Local Police Jurisdiction</div>
            </div>
            <span className="px-3 py-1 bg-red-400/10 text-red-400 font-mono font-bold rounded-lg border border-red-400/30">
              DIAL 100
            </span>
          </a>
        </div>
      </div>

      {/* Agency Verification */}
      <div className="text-center text-[11px] text-slate-500 font-mono">
        {SITE_DETAILS.company} · PSARA: {SITE_DETAILS.license}
      </div>
    </div>
  );
};
