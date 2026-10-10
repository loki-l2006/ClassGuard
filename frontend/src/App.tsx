import { useEffect, useState, type FormEvent } from 'react';
import {
  CLASSES, PERIODS, SUBJECTS, USERS, loadState, periodStatus, saveState,
  type Alert, type DemoState, type Role, type Session,
} from './data';

type Tone = 'green' | 'red' | 'blue' | 'gray';

const STUDENTS = [
  { roll: 'CSE23A01', name: 'Arjun K' },
  { roll: 'CSE23A05', name: 'Divya S' },
  { roll: 'CSE23A12', name: 'Rahul M' },
];
const TITLES: Record<string, string> = {
  home: 'ClassGuard', alerts: 'Activity Alerts', sessions: 'Session History',
  profile: 'Profile', start: 'Start New Session', monitor: 'Monitoring',
};

const uid = () => Math.random().toString(36).slice(2, 10);
const when = (iso: string) => new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
const initials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
const hms = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
};
const toneOf = (status: string): Tone => (status === 'Ongoing' ? 'green' : status === 'Upcoming' ? 'blue' : 'gray');

const Badge = ({ text, tone }: { text: string; tone: Tone }) => <span className={`badge ${tone}`}>{text}</span>;
const DemoTag = () => <span className="badge red">SIMULATED DEMO EVENT</span>;
const Info = ({ label, value }: { label: string; value: string }) => (
  <div><div className="small muted">{label}</div><b>{value}</b></div>
);

function Login({ onLogin }: { onLogin: (r: Role) => void }) {
  const [role, setRole] = useState<Role>('faculty');
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');

  const pick = (r: Role) => { setRole(r); setId(''); setPw(''); setError(''); };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const u = USERS[role];
    if (!id.trim() || !pw) return setError('User ID and password are required.');
    if (id.trim().toUpperCase() !== u.id || pw !== u.password) {
      return setError(`Wrong ID or password for ${role}. Use the demo credentials below.`);
    }
    setError('');
    onLogin(role);
  };

  return (
    <div className="center">
      <div className="logo">CG</div>
      <h1 className="brand">ClassGuard</h1>
      <p className="muted">Smart Classroom Screen-Time Monitoring System</p>
      <div className="seg">
        <button className={role === 'faculty' ? 'on' : ''} onClick={() => pick('faculty')}>Faculty</button>
        <button className={role === 'student' ? 'on' : ''} onClick={() => pick('student')}>Student</button>
      </div>
      <form className="card" onSubmit={submit} noValidate>
        <label>User ID<input value={id} onChange={e => setId(e.target.value)} placeholder={USERS[role].id} /></label>
        <label>Password<input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Password" /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="primary" type="submit">Login</button>
      </form>
      <p className="small muted">Demo only: Faculty FAC001 / 1234 · Student STU001 / 1234</p>
    </div>
  );
}

function FacultyHome({ db, now, go }: { db: DemoState; now: Date; go: (t: string) => void }) {
  const unreviewed = db.alerts.filter(a => !a.reviewed).length;
  return (
    <>
      <div className="hero">
        <div className="avatar">{initials(db.facultyName)}</div>
        <div>
          <div className="small muted">{now.getHours() < 12 ? 'Good Morning,' : 'Good Afternoon,'}</div>
          <h2>{db.facultyName}</h2>
          <div className="small muted">Faculty | {USERS.faculty.dept}</div>
        </div>
      </div>
      <div className="grid2">
        <div className="card"><span className="small muted">Assigned Classes</span><b>{CLASSES.join(', ')}</b></div>
        <div className="card"><span className="small muted">Academic Year</span><b>2024 - 2025</b></div>
      </div>
      <div className="grid3">
        <button onClick={() => go(db.active ? 'monitor' : 'start')}>Start Session</button>
        <button onClick={() => go('alerts')}>Alerts ({unreviewed})</button>
        <button onClick={() => go('sessions')}>History</button>
      </div>
      <h3>Today's Schedule</h3>
      {PERIODS.map(p => {
        const s = periodStatus(p.start, p.end, now);
        return (
          <div className="card row" key={p.no}>
            <div><b>{p.start} – {p.end}</b><div>{p.subject}</div><div className="small muted">{p.teacher} · Period {p.no}</div></div>
            <Badge text={s} tone={toneOf(s)} />
          </div>
        );
      })}
    </>
  );
}

function StartSession({ onStart }: { onStart: (cls: string, subject: string, period: number) => void }) {
  const [cls, setCls] = useState('');
  const [subject, setSubject] = useState('');
  const [period, setPeriod] = useState('');
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!cls || !subject || !period) return setError('Select class, subject and period to continue.');
    setError('');
    onStart(cls, subject, Number(period));
  };

  return (
    <form className="card" onSubmit={submit} noValidate>
      <label>Select Class
        <select value={cls} onChange={e => setCls(e.target.value)}>
          <option value="">Choose class</option>
          {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label>Select Subject
        <select value={subject} onChange={e => setSubject(e.target.value)}>
          <option value="">Choose subject</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <label>Select Period
        <select value={period} onChange={e => setPeriod(e.target.value)}>
          <option value="">Choose period</option>
          {PERIODS.map(p => <option key={p.no} value={p.no}>Period {p.no} ({p.start} – {p.end})</option>)}
        </select>
      </label>
      <label>Date<input value={new Date().toLocaleDateString()} readOnly /></label>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="primary" type="submit">Start Monitoring</button>
    </form>
  );
}

function Monitor({ db, now, onGenerate, onStop, go }: {
  db: DemoState; now: Date; onGenerate: () => void; onStop: () => void; go: (t: string) => void;
}) {
  const a = db.active;
  if (!a) {
    return (
      <div className="card">
        <h2>No active session</h2>
        <p className="muted">Start monitoring a class to begin a session.</p>
        <button className="primary" onClick={() => go('start')}>Start New Session</button>
      </div>
    );
  }
  return (
    <>
      <div className="card soft"><h2>Monitoring Active</h2><div className="small muted">Class is under monitoring</div></div>
      <div className="card">
        <Info label="Class" value={a.cls} />
        <Info label="Subject" value={a.subject} />
        <Info label="Period" value={`Period ${a.period}`} />
        <Info label="Start Time" value={when(a.startedAt)} />
        <Info label="Duration" value={hms(now.getTime() - new Date(a.startedAt).getTime())} />
      </div>
      <button onClick={onGenerate}>Generate Demo Alert</button>
      <button onClick={() => go('alerts')}>View Alerts</button>
      <button className="stop" onClick={onStop}>Stop Monitoring</button>
    </>
  );
}

function Alerts({ alerts, onReview }: { alerts: Alert[]; onReview?: (id: string) => void }) {
  const [filter, setFilter] = useState<'all' | 'unreviewed' | 'reviewed'>('all');
  const shown = alerts.filter(a => filter === 'all' || (filter === 'reviewed') === a.reviewed);
  return (
    <>
      <div className="seg">
        {(['all', 'unreviewed', 'reviewed'] as const).map(f => (
          <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      {shown.length === 0 && <p className="card muted">No alerts in this view.</p>}
      {shown.map(a => (
        <div className="card" key={a.id}>
          <div className="row"><DemoTag /><Badge text={a.reviewed ? 'Reviewed' : 'Unreviewed'} tone={a.reviewed ? 'green' : 'red'} /></div>
          <b>Potential Phone Activity</b>
          <div className="small">Roll No: {a.roll} · Student: {a.student}</div>
          <div className="small muted">{a.cls} · Period {a.period} · {when(a.at)}</div>
          {onReview && !a.reviewed && <button className="primary" onClick={() => onReview(a.id)}>Mark as Reviewed</button>}
        </div>
      ))}
    </>
  );
}

function Sessions({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) return <p className="card muted">No sessions yet. Stopped sessions are saved here.</p>;
  return (
    <>
      {[...sessions].reverse().map(s => (
        <div className="card" key={s.id}>
          <div className="row"><b>{s.subject}</b><Badge text={s.endedAt ? 'Completed' : 'Active'} tone={s.endedAt ? 'green' : 'blue'} /></div>
          <div className="small muted">{s.cls} · Period {s.period}</div>
          <div className="small muted">{when(s.startedAt)}{s.endedAt && ` → ${when(s.endedAt)}`}</div>
        </div>
      ))}
    </>
  );
}

function Profile({ name, meta, onSave, onLogout }: {
  name: string; meta: string; onSave: (n: string) => void; onLogout: () => void;
}) {
  const [draft, setDraft] = useState(name);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (draft.trim()) onSave(draft.trim());
  };
  return (
    <>
      <div className="hero"><div className="avatar">{initials(name)}</div><div><h2>{name}</h2><div className="small muted">{meta}</div></div></div>
      <form className="card" onSubmit={submit} noValidate>
        <label>Display name<input value={draft} onChange={e => setDraft(e.target.value)} /></label>
        {!draft.trim() && <p className="error" role="alert">Name cannot be empty.</p>}
        <div className="grid2">
          <button type="button" onClick={() => setDraft(name)}>Cancel</button>
          <button className="primary" type="submit">Save</button>
        </div>
      </form>
      <button className="danger" onClick={onLogout}>Logout</button>
    </>
  );
}

function StudentHome({ db, now }: { db: DemoState; now: Date }) {
  const me = USERS.student;
  return (
    <>
      <div className="hero">
        <div className="avatar">{initials(db.studentName)}</div>
        <div><div className="small muted">Hello,</div><h2>{db.studentName}</h2><div className="small muted">{me.cls} | Roll No: {me.roll}</div></div>
      </div>
      <div className="grid2">
        <div className="card"><span className="small muted">Class</span><b>{me.cls}</b></div>
        <div className="card"><span className="small muted">Academic Year</span><b>{me.year}</b></div>
      </div>
      <h3>Today's Classes</h3>
      {PERIODS.map(p => {
        const s = periodStatus(p.start, p.end, now);
        return (
          <div className="card row" key={p.no}>
            <div><b>{p.start} – {p.end}</b><div>{p.subject}</div><div className="small muted">{p.teacher}</div></div>
            <Badge text={s} tone={toneOf(s)} />
          </div>
        );
      })}
      <div className="card soft small">Your phone usage is monitored during class hours. Please stay focused and avoid distractions.</div>
    </>
  );
}

export default function App() {
  const [db, setDb] = useState<DemoState>(loadState);
  const [role, setRole] = useState<Role | null>(null);
  const [tab, setTab] = useState('home');
  const [now, setNow] = useState(() => new Date());
  const [confirmStop, setConfirmStop] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { saveState(db); }, [db]);
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const update = (p: Partial<DemoState>) => setDb(d => ({ ...d, ...p }));
  const go = (t: string) => { setTab(t); setConfirmStop(false); };
  const flash = (m: string) => setToast(m);
  const logout = () => { setRole(null); setTab('home'); setConfirmStop(false); flash('Logged out'); };

  const startSession = (cls: string, subject: string, period: number) => {
    if (db.active) { flash('A session is already running. Stop it first.'); return go('monitor'); }
    update({ active: { id: uid(), cls, subject, period, startedAt: new Date().toISOString() } });
    flash('Monitoring started (demo)');
    go('monitor');
  };
  const generateAlert = () => {
    const a = db.active;
    if (!a) return;
    const s = STUDENTS[db.alerts.length % STUDENTS.length];
    const alert: Alert = { id: uid(), roll: s.roll, student: s.name, cls: a.cls, period: a.period, at: new Date().toISOString(), reviewed: false };
    update({ alerts: [alert, ...db.alerts] });
    flash('Demo alert created (SIMULATED DEMO EVENT)');
  };
  const review = (id: string) => {
    update({ alerts: db.alerts.map(a => (a.id === id ? { ...a, reviewed: true } : a)) });
    flash('Marked as reviewed');
  };
  const stopSession = () => {
    const a = db.active;
    if (!a) return;
    update({ active: null, sessions: [...db.sessions, { ...a, endedAt: new Date().toISOString() }] });
    setConfirmStop(false);
    flash('Session stopped and saved');
    go('sessions');
  };

  if (!role) {
    return (
      <div className="app">
        <Login onLogin={r => { setRole(r); setTab('home'); }} />
        {toast && <div className="toast">{toast}</div>}
      </div>
    );
  }

  const faculty = role === 'faculty';
  const tabs: [string, string][] = faculty
    ? [['home', 'Home'], ['sessions', 'Sessions'], ['alerts', 'Alerts'], ['profile', 'Profile']]
    : [['home', 'Home'], ['alerts', 'Alerts'], ['profile', 'Profile']];
  const navKey = tab === 'start' || tab === 'monitor' ? 'home' : tab;
  const myAlerts = db.alerts.filter(a => a.roll === USERS.student.roll);
  const profileMeta = faculty
    ? `${USERS.faculty.id} · ${USERS.faculty.dept}`
    : `${USERS.student.roll} · ${USERS.student.cls} · ${USERS.student.year}`;

  const renderScreen = () => {
    if (faculty) {
      switch (tab) {
        case 'sessions': return <Sessions sessions={db.sessions} />;
        case 'alerts': return <Alerts alerts={db.alerts} onReview={review} />;
        case 'start': return <StartSession onStart={startSession} />;
        case 'monitor': return <Monitor db={db} now={now} onGenerate={generateAlert} onStop={() => setConfirmStop(true)} go={go} />;
        case 'profile': return <Profile name={db.facultyName} meta={profileMeta} onSave={n => { update({ facultyName: n }); flash('Profile saved (demo)'); }} onLogout={logout} />;
        default: return <FacultyHome db={db} now={now} go={go} />;
      }
    }
    switch (tab) {
      case 'alerts': return <Alerts alerts={myAlerts} />;
      case 'profile': return <Profile name={db.studentName} meta={profileMeta} onSave={n => { update({ studentName: n }); flash('Profile saved (demo)'); }} onLogout={logout} />;
      default: return <StudentHome db={db} now={now} />;
    }
  };

  return (
    <div className="app">
      <header className="top">
        {!tabs.some(([k]) => k === tab) && <button className="back" onClick={() => go('home')} aria-label="Back">←</button>}
        <b>{TITLES[tab]}</b>
      </header>
      <main className="content">{renderScreen()}</main>
      <nav className="tabbar">
        {tabs.map(([k, label]) => (
          <button key={k} className={`tab ${navKey === k ? 'on' : ''}`} onClick={() => go(k)}>{label}</button>
        ))}
      </nav>
      {faculty && confirmStop && db.active && (
        <div className="modal">
          <div className="sheet">
            <h2>Stop Monitoring?</h2>
            <p className="muted">This will end the active session and save the session data.</p>
            <button className="danger" onClick={stopSession}>Yes, Stop Monitoring</button>
            <button onClick={() => setConfirmStop(false)}>Cancel</button>
          </div>
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
