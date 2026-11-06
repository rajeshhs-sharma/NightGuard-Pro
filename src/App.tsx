import React, { useState } from 'react';
import { AppView, Guard, Checkpoint, NightReportEntry } from './types/security';
import { INITIAL_GUARDS, INITIAL_CHECKPOINTS, INITIAL_NIGHT_REPORTS } from './data/mockData';
import { Header } from './components/Header';
import { GuardApp } from './components/guard/GuardApp';
import { SupervisorDashboard } from './components/supervisor/SupervisorDashboard';
import { sound } from './utils/audio';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('guard');
  const [guards, setGuards] = useState<Guard[]>(INITIAL_GUARDS);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>(INITIAL_CHECKPOINTS);
  const [nightReports, setNightReports] = useState<NightReportEntry[]>(INITIAL_NIGHT_REPORTS);
  const [isTorchOn, setIsTorchOn] = useState(false);

 const [isLoggedIn, setIsLoggedIn] = useState(false);
const [userRole, setUserRole] = useState<'supervisor' | 'guard'>('guard');
if (!isLoggedIn) {
  return (
    <div style={{padding: 20, textAlign: 'center'}}>
      <h2>NightGuard Pro Login</h2>
      <input id="loginId" placeholder="ID - 12345 / 2419" style={{display:'block', margin:'10px auto', padding:10, width:'80%'}} />
      <input id="loginPass" type="password" placeholder="Password - 12345" style={{display:'block', margin:'10px auto', padding:10, width:'80%'}} />
      <button onClick={() => {
        const id = (document.getElementById('loginId') as HTMLInputElement).value;
        const pass = (document.getElementById('loginPass') as HTMLInputElement).value;
        if (id === '12345' && pass === '12345') { setUserRole('supervisor'); setIsLoggedIn(true); }
        else if (id === '2419' && pass === '12345') { setUserRole('guard'); setIsLoggedIn(true); }
        else alert('Wrong ID / Password');
      }} style={{padding:'10px 30px'}}>Login</button>
    </div>
  );
}
  // Ramesh is the primary guard logged into the Guard App
  const rameshGuard = guards.find((g) => g.id === 'guard-ramesh') || guards[0];

  // Update guard details (e.g. on check-in or alarm)
  const handleUpdateGuard = (updatedFields: Partial<Guard>) => {
    setGuards((prev) =>
      prev.map((g) => {
        if (g.id === 'guard-ramesh') {
          return { ...g, ...updatedFields };
        }
        return g;
      })
    );

    // Also sync the Night Report row for Ramesh
    setNightReports((prev) =>
      prev.map((r) => {
        if (r.guardName.includes('Ramesh')) {
          return {
            ...r,
            lastPing: `Just now (${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })})`,
            status: 'AWAKE',
          };
        }
        return r;
      })
    );
  };

  // Update checkpoint status (e.g. when scanned)
  const handleUpdateCheckpoint = (checkpointId: string, status: 'DONE' | 'PENDING', scannedAt: string) => {
    setCheckpoints((prev) =>
      prev.map((cp) => (cp.id === checkpointId ? { ...cp, status, scannedAt } : cp))
    );

    // Recalculate completed count
    const completedCount = checkpoints.map((c) => (c.id === checkpointId ? { ...c, status } : c)).filter((c) => c.status === 'DONE').length;
    const patrolPct = Math.round((completedCount / 4) * 100);

    // Update Ramesh's patrol count in guards list
    setGuards((prev) =>
      prev.map((g) => {
        if (g.id === 'guard-ramesh') {
          return {
            ...g,
            patrolCompletedCount: completedCount,
          };
        }
        return g;
      })
    );

    // Update Ramesh's patrol percentage in night reports
    setNightReports((prev) =>
      prev.map((r) => {
        if (r.guardName.includes('Ramesh')) {
          return {
            ...r,
            patrolPercentage: patrolPct,
            supervisorNotes: `Patrol updated: ${completedCount}/4 checkpoints cleared. Last scan at ${scannedAt}.`,
          };
        }
        return r;
      })
    );
  };

  // Supervisor triggers remote loud alarm on Manju or other guards
  const handleTriggerAlarmOnGuard = (guardId: string) => {
    setGuards((prev) =>
      prev.map((g) => {
        if (g.id === guardId) {
          return {
            ...g,
            isAlarmTriggered: true,
            status: 'ALERT',
          };
        }
        return g;
      })
    );

    setNightReports((prev) =>
      prev.map((r) => {
        if (r.guardName.includes('Manju')) {
          return {
            ...r,
            supervisorNotes: `URGENT INTERVENTION: 110dB remote alarm dispatched by supervisor at ${new Date().toLocaleTimeString()}.`,
          };
        }
        return r;
      })
    );
  };

  const missedAlertsCount = guards.filter((g) => g.status === 'MISSED' || g.status === 'ALERT').length;

  return (
    <div className={`min-h-screen bg-black text-slate-100 flex flex-col font-sans transition-colors ${isTorchOn ? 'filter brightness-125' : ''}`}>
      
      {/* High-Intensity Flashlight Overlay (When Guard activates torch) */}
      {isTorchOn && (
        <div
          onClick={() => {
            sound.playRadioClick();
            setIsTorchOn(false);
          }}
          className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-between p-8 text-black cursor-pointer select-none animate-in fade-in duration-200"
        >
          <div className="text-center">
            <span className="font-mono text-xs uppercase tracking-widest font-black text-slate-500">
              NIGHTGUARD PRO · TACTICAL TORCH
            </span>
            <h2 className="text-3xl font-black mt-1">TORCH ACTIVE</h2>
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold text-slate-700">
              Screen brightness maximized for gate inspections and dark corridors.
            </p>
            <p className="text-xs font-mono text-slate-500">
              Tap anywhere on screen to turn OFF
            </p>
          </div>
          <button
            onClick={() => setIsTorchOn(false)}
            className="py-3 px-8 rounded-2xl bg-black text-white font-extrabold text-sm shadow-2xl"
          >
            TURN OFF TORCH
          </button>
        </div>
      )}

      {/* TOP HEADER WITH SWITCHER */}
      <Header
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        missedAlertsCount={missedAlertsCount}
        onToggleTorch={() => setIsTorchOn(!isTorchOn)}
        isTorchOn={isTorchOn}
      />

      {/* MAIN VIEWPORT: GUARD APP (MOBILE VIEW) OR SUPERVISOR DASHBOARD (LAPTOP VIEW) */}
      <main className="flex-1 w-full">
        {currentView === 'guard' ? (
          <GuardApp
            guard={rameshGuard}
            checkpoints={checkpoints}
            onUpdateGuard={handleUpdateGuard}
            onUpdateCheckpoint={handleUpdateCheckpoint}
            onToggleTorch={() => setIsTorchOn(!isTorchOn)}
            isTorchOn={isTorchOn}
          />
        ) : (
          <SupervisorDashboard
            guards={guards}
            checkpoints={checkpoints}
            nightReports={nightReports}
            onTriggerAlarmOnGuard={handleTriggerAlarmOnGuard}
          />
        )}
      </main>
    </div>
  );
}
