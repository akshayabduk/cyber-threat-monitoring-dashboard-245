import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

/**
 * PUBLIC_INTERFACE
 * App entry for Advanced Cybersecurity AI Dashboard Frontend.
 * Features:
 * - Authentication and role management (mock)
 * - Real-time threat monitoring via WebSocket (mock)
 * - AI analysis visualization and historical analytics (mock)
 * - Configurable dashboard widgets
 * - Incident alert notifications
 * - Responsive layout: sidebar, topbar, analytics panel, widgets panel, alert overlays
 *
 * ENV NOTE:
 * - Uses environment variables for backend endpoints:
 *   REACT_APP_API_BASE_URL, REACT_APP_WS_URL
 *   Provide these in .env (see .env.example we generate).
 */

// ------- Environment helpers (no hardcoded URLs) --------
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const WS_URL = process.env.REACT_APP_WS_URL || '';

// ------- Mock services (will switch to real if env provided) --------

// PUBLIC_INTERFACE
export function apiFetch(path, options = {}) {
  /** Wrapper to call REST API; falls back to mock if API_BASE_URL is empty. */
  if (!API_BASE_URL) {
    return mockApi(path, options);
  }
  return fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  }).then(r => r.json());
}

// PUBLIC_INTERFACE
export function connectWebSocket(onMessage) {
  /** Connect to WS if REACT_APP_WS_URL is given, fallback to mock stream. Returns disconnect function. */
  if (WS_URL) {
    const ws = new WebSocket(WS_URL);
    ws.onmessage = (e) => {
      try { onMessage(JSON.parse(e.data)); } catch { /* ignore */ }
    };
    return () => ws.close();
  }
  // Mock stream using interval
  const id = setInterval(() => {
    const severities = ['low', 'medium', 'high'];
    const sev = severities[Math.floor(Math.random() * severities.length)];
    const event = {
      type: 'THREAT_EVENT',
      payload: {
        id: `evt_${Date.now()}`,
        sourceIP: `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`,
        severity: sev,
        timestamp: new Date().toISOString(),
        rule: ['Anomaly', 'Malware', 'Recon', 'Exfil'][Math.floor(Math.random()*4)],
        score: Math.round(Math.random()*100),
        aiInsights: `Model flags ${sev} risk due to unusual behavior.`,
      }
    };
    onMessage(event);
  }, 2500);
  return () => clearInterval(id);
}

// Mock REST API
function mockApi(path, options) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (path === '/auth/login' && options.method === 'POST') {
        const body = JSON.parse(options.body || '{}');
        const role = body.email?.includes('admin') ? 'admin' : 'analyst';
        resolve({ token: 'mock-token', user: { id: 'u1', email: body.email, role } });
        return;
      }
      if (path === '/auth/me') {
        resolve({ id: 'u1', email: 'user@example.com', role: 'analyst' });
        return;
      }
      if (path === '/analytics/summary') {
        resolve({
          totalAlerts24h: 132,
          criticalOpen: 7,
          avgResponseMins: 14,
          modelConfidence: 92
        });
        return;
      }
      if (path === '/analytics/historical') {
        resolve({
          points: Array.from({ length: 14 }).map((_, i) => ({
            t: Date.now() - (13 - i) * 3600 * 1000,
            alerts: Math.floor(Math.random()*20)+5,
            anomalies: Math.floor(Math.random()*8)+2
          }))
        });
        return;
      }
      if (path === '/widgets' && options.method === 'GET') {
        resolve({
          widgets: [
            { id: 'w1', title: 'Top Sources', type: 'list' },
            { id: 'w2', title: 'Protocol Distribution', type: 'chart' },
          ]
        });
        return;
      }
      if (path === '/alerts/recent') {
        resolve({
          alerts: Array.from({ length: 6 }).map((_, idx) => ({
            id: `a_${idx}`,
            title: ['Suspicious Login', 'Port Scan', 'Malware Signature', 'DLP Violation'][idx%4],
            severity: ['low','medium','high','medium'][idx%4],
            time: new Date(Date.now() - idx*600000).toISOString(),
          }))
        });
        return;
      }
      resolve({ ok: true });
    }, 350);
  });
}

// -------- Simple in-memory auth store --------
const AuthContext = React.createContext(null);

function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const login = async (email, password) => {
    const res = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    setSession({ token: res.token, user: res.user });
    return res;
  };
  const logout = () => setSession(null);
  const value = useMemo(() => ({ session, login, logout }), [session]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// --------- UI Helpers ----------
function Icon({ name }) {
  const map = {
    dashboard: '📊', stream: '📡', alerts: '🚨', users: '👤', settings: '⚙️', search: '🔎', add: '➕'
  };
  return <span className="icon" aria-hidden="true">{map[name] || '•'}</span>;
}

// --------- Auth Screens ----------
function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (e) {
      setErr('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="panel-header">
          <div className="panel-title">Sign in</div>
        </div>
        <form className="form" onSubmit={onSubmit}>
          <div className="input">
            <label htmlFor="email">Email</label>
            <input id="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@company.com" required />
          </div>
          <div className="input">
            <label htmlFor="pwd">Password</label>
            <input id="pwd" type="password" value={password} onChange={(e)=>setPwd(e.target.value)} placeholder="••••••••" required />
          </div>
          {err ? <div style={{ color: '#b40013', fontSize: 12 }}>{err}</div> : null}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
            <button className="btn" type="button" onClick={()=>{ setEmail('admin@company.com'); setPwd('admin'); }}>Use admin</button>
          </div>
          <div style={{ fontSize: 12, color: '#475569' }}>Tip: emails containing "admin" get admin role.</div>
        </form>
      </div>
    </div>
  );
}

// ---------- Layout ----------
function Sidebar({ active, onNavigate }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'realtime', label: 'Real-time', icon: 'stream' },
    { id: 'alerts', label: 'Alerts', icon: 'alerts' },
    { id: 'users', label: 'Users', icon: 'users', roles: ['admin'] },
    { id: 'settings', label: 'Settings', icon: 'settings', roles: ['admin'] },
  ];
  const { session } = useAuth();
  const role = session?.user?.role || 'analyst';
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo" />
        <div className="title">Cyber AI Monitor</div>
      </div>
      <nav className="nav-group">
        {items.filter(i => !i.roles || i.roles.includes(role)).map(i => (
          <button key={i.id} className={`nav-item ${active === i.id ? 'active' : ''}`} onClick={() => onNavigate(i.id)}>
            <Icon name={i.icon} /> {i.label}
          </button>
        ))}
      </nav>
      <div style={{ marginTop: 'auto', fontSize: 12, color: '#E5EAF3' }}>
        v0.1 • Role: {role}
      </div>
    </aside>
  );
}

function Topbar({ onAddWidget, onSearch }) {
  const { session, logout } = useAuth();
  return (
    <header className="topbar">
      <div className="glass-wrap glass">
        <div className="search" role="search" aria-label="Global search">
          <Icon name="search" />
          <input placeholder="Search threats, hosts, users..." onChange={(e)=>onSearch?.(e.target.value)} />
          <div className="ai-typing" title="AI activity indicator" />
        </div>
        <div className="actions">
          <button className="btn" onClick={onAddWidget}><Icon name="add" /> Add widget</button>
          <button className="btn btn-accent" onClick={logout}>Logout ({session?.user?.email})</button>
        </div>
      </div>
    </header>
  );
}

// ---------- Dashboard panels ----------
function KPICards({ data }) {
  const items = [
    { label: 'Alerts (24h)', value: data?.totalAlerts24h ?? '—' },
    { label: 'Critical Open', value: data?.criticalOpen ?? '—' },
    { label: 'Avg Response (m)', value: data?.avgResponseMins ?? '—' },
    { label: 'Model Confidence (%)', value: data?.modelConfidence ?? '—' },
  ];
  return (
    <div className="kpis">
      {items.map((k, idx) => (
        <div className="kpi" key={idx}>
          <div className="label">{k.label}</div>
          <div className="value">{k.value}</div>
        </div>
      ))}
    </div>
  );
}

function SimpleChart({ label }) {
  return <div className="chart">{label} chart placeholder</div>;
}

function ThreatList({ items, filter }) {
  const filtered = items.filter(i => {
    if (!filter) return true;
    return i.sourceIP.includes(filter) || i.rule.toLowerCase().includes(filter.toLowerCase());
  });
  return (
    <div className="threat-list">
      {filtered.map(t => (
        <div key={t.id} className="threat-item">
          <div>
            <div style={{ fontWeight: 700 }}>{t.rule} • {t.sourceIP}</div>
            <div style={{ fontSize: 12, color: '#475569' }}>{new Date(t.timestamp).toLocaleString()} • Score {t.score}</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>{t.aiInsights}</div>
          </div>
          <div className={`severity ${t.severity}`}>{t.severity}</div>
        </div>
      ))}
      {filtered.length === 0 ? <div className="threat-item">No items match filter.</div> : null}
    </div>
  );
}

function WidgetGrid({ widgets }) {
  return (
    <div className="widget-grid">
      {widgets.map(w => (
        <div className="widget" key={w.id}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>{w.title}</div>
          <div style={{ fontSize: 12, color: '#475569' }}>Type: {w.type}</div>
          <div className="chart" style={{ height: 140, marginTop: 10 }}>{w.type === 'chart' ? 'Widget chart' : 'Widget list'}</div>
        </div>
      ))}
      {widgets.length === 0 ? <div className="widget">No widgets yet. Click "Add widget".</div> : null}
    </div>
  );
}

function AlertsOverlay({ toasts, onDismiss }) {
  return (
    <div className="alert-overlay" aria-live="polite" aria-atomic="true">
      {toasts.map(t => (
        <div key={t.id} className="toast">
          <div style={{ fontWeight: 700 }}>{t.title}</div>
          <div style={{ fontSize: 12, color: '#475569' }}>{new Date(t.time).toLocaleString()}</div>
          <div style={{ marginTop: 6 }}><span className={`severity ${t.severity}`}>{t.severity}</span></div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn" onClick={()=>onDismiss(t.id)}>Dismiss</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- Main Screen (Protected) ----------
function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [historical, setHistorical] = useState(null);
  const [realtime, setRealtime] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [active, setActive] = useState('dashboard');
  const [filter, setFilter] = useState('');
  const toastQueueRef = useRef([]);

  // Load static data
  useEffect(() => {
    apiFetch('/analytics/summary').then(setSummary);
    apiFetch('/analytics/historical').then(setHistorical);
    apiFetch('/widgets', { method: 'GET' }).then((r) => setWidgets(r.widgets || []));
    apiFetch('/alerts/recent').then((r) => setToasts(r.alerts || []));
  }, []);

  // WebSocket / mock stream
  useEffect(() => {
    const disconnect = connectWebSocket((event) => {
      if (event.type === 'THREAT_EVENT') {
        setRealtime(prev => [event.payload, ...prev].slice(0, 50));
        // create toast for high severity
        if (event.payload.severity === 'high') {
          const t = {
            id: event.payload.id,
            title: `High severity: ${event.payload.rule}`,
            severity: 'high',
            time: event.payload.timestamp
          };
          toastQueueRef.current = [t, ...toastQueueRef.current].slice(0, 5);
          setToasts([...toastQueueRef.current]);
        }
      }
    });
    return () => disconnect();
  }, []);

  const onAddWidget = () => {
    const id = `w_${Date.now()}`;
    setWidgets(prev => [{ id, title: 'Custom Widget', type: Math.random() > 0.5 ? 'chart' : 'list' }, ...prev]);
  };

  const onDismissToast = (id) => {
    toastQueueRef.current = toastQueueRef.current.filter(t => t.id !== id);
    setToasts([...toastQueueRef.current]);
  };

  return (
    <div className="app-shell">
      <Sidebar active={active} onNavigate={setActive} />
      <Topbar onAddWidget={onAddWidget} onSearch={setFilter} />
      <main className="main">
        <section className="analytics">
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Key Metrics</div>
            </div>
            <div className="panel-content"><KPICards data={summary} /></div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Historical Analytics</div>
              <div className="ai-activity" aria-hidden="true">
                <span className="ai-dot" />
                <span className="ai-dot" />
                <span className="ai-dot" />
              </div>
            </div>
            <div className="panel-content">
              <SimpleChart label="Historical alerts/anomalies" />
              <div style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>
                {historical?.points?.length ? `${historical.points.length} pts` : 'Loading historical activity…'}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Real-time Threat Stream</div>
              <div className="ai-activity" aria-hidden="true">
                <span className="ai-dot" />
                <span className="ai-dot" />
                <span className="ai-dot" />
              </div>
            </div>
            <div className="panel-content">
              <ThreatList items={realtime} filter={filter} />
            </div>
          </div>
        </section>

        <section className="widgets">
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">AI Analysis Visualization</div>
              <div className="ai-activity" aria-hidden="true">
                <span className="ai-dot" />
                <span className="ai-dot" />
                <span className="ai-dot" />
              </div>
            </div>
            <div className="panel-content">
              <SimpleChart label="AI model confidence / risk surface" />
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Configurable Widgets</div>
              <div className="actions">
                <button className="btn" onClick={onAddWidget}><Icon name="add" /> Add</button>
              </div>
            </div>
            <div className="panel-content">
              <WidgetGrid widgets={widgets} />
            </div>
          </div>
        </section>
      </main>

      <AlertsOverlay toasts={toasts} onDismiss={onDismissToast} />
    </div>
  );
}

// ---------- Root ----------
function ProtectedApp() {
  const { session } = useAuth();
  if (!session) return <LoginScreen />;
  return <Dashboard />;
}

// PUBLIC_INTERFACE
export default function App() {
  /** Root App with providers. */
  return (
    <AuthProvider>
      <ProtectedApp />
    </AuthProvider>
  );
}
