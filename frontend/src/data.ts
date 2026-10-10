// DEMO DATA ONLY. The passwords and localStorage store here are NOT secure.
// A real build checks credentials on a server (hashed passwords) and uses a database.
export type Role = 'faculty' | 'student';

export const USERS = {
  faculty: { id: 'FAC001', password: '1234', name: 'Dr. Priya Sharma', dept: 'Computer Science' },
  student: { id: 'STU001', password: '1234', name: 'Arjun K', roll: 'CSE23A01', cls: 'III CSE A', year: '2024 - 2025' },
};

export const CLASSES = ['III CSE A', 'III CSE B'];
export const SUBJECTS = ['Database Management', 'Operating Systems', 'Computer Networks'];
export const PERIODS = [
  { no: 1, start: '09:00', end: '09:50', subject: 'Database Management', teacher: 'Dr. Priya Sharma' },
  { no: 2, start: '10:00', end: '10:50', subject: 'Operating Systems', teacher: 'Prof. Ravi Kumar' },
  { no: 3, start: '11:00', end: '11:50', subject: 'Computer Networks', teacher: 'Dr. Meena Lakshmi' },
];

export interface Alert { id: string; roll: string; student: string; cls: string; period: number; at: string; reviewed: boolean; }
export interface Session { id: string; cls: string; subject: string; period: number; startedAt: string; endedAt?: string; }
export interface DemoState { facultyName: string; studentName: string; alerts: Alert[]; sessions: Session[]; active: Session | null; }

const KEY = 'classguard-demo-v1';
const seed: DemoState = {
  facultyName: USERS.faculty.name,
  studentName: USERS.student.name,
  alerts: [
    { id: 'seed1', roll: 'CSE23A01', student: 'Arjun K', cls: 'III CSE A', period: 1, at: new Date().toISOString(), reviewed: false },
    { id: 'seed2', roll: 'CSE23A05', student: 'Divya S', cls: 'III CSE A', period: 1, at: new Date().toISOString(), reviewed: true },
  ],
  sessions: [],
  active: null,
};

export function loadState(): DemoState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as DemoState;
  } catch {
    // corrupt or blocked storage: fall back to seed data
  }
  return seed;
}

export function saveState(s: DemoState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // storage full or blocked: the demo keeps working in memory
  }
}

const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
export function periodStatus(start: string, end: string, now: Date): 'Ongoing' | 'Upcoming' | 'Completed' {
  const m = now.getHours() * 60 + now.getMinutes();
  if (m < toMin(start)) return 'Upcoming';
  return m <= toMin(end) ? 'Ongoing' : 'Completed';
}
