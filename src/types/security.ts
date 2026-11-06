export type GuardStatus = 'AWAKE' | 'MISSED' | 'ALERT';

export interface Checkpoint {
  id: string;
  name: string;
  location: string;
  status: 'DONE' | 'PENDING';
  scannedAt?: string;
  order: number;
  qrCode: string;
  coords: { x: number; y: number };
}

export interface Guard {
  id: string;
  name: string;
  avatar: string;
  badgeNumber: string;
  site: string;
  locationName: string;
  dutyShift: string;
  status: GuardStatus;
  lastCheckInMinutesAgo: number;
  lastCheckInTime: string;
  nextCheckInSeconds: number;
  patrolCompletedCount: number;
  patrolTotalCount: number;
  phone: string;
  battery: number;
  isAlarmTriggered?: boolean;
  coords: { x: number; y: number };
}

export interface NightReportEntry {
  id: string;
  guardName: string;
  badgeNumber: string;
  post: string;
  totalCheckIns: number;
  expectedCheckIns: number;
  missedCheckIns: number;
  patrolPercentage: number;
  status: GuardStatus;
  lastPing: string;
  incidentsReported: number;
  supervisorNotes: string;
}

export type ActiveTab = 'home' | 'patrol' | 'sos' | 'profile';
export type AppView = 'guard' | 'supervisor';
