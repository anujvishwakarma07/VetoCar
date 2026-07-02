import React, { useState, useEffect, useRef } from 'react';
import {
  Activity, Users, Globe, Monitor, Smartphone, Tablet,
  TrendingUp, Zap, RefreshCw, Shield, Server,
  ArrowUpRight, Wifi, FileSearch, Coins, Car,
  UserCheck, AlertCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:8080/api';
const COLORS = ['#00ff88', '#00b4d8', '#f77f00', '#e63946', '#a855f7', '#fbbf24'];
const DEVICE_COLORS = { desktop: '#00ff88', mobile: '#00b4d8', tablet: '#f77f00' };

// ── SVG Line Chart ────────────────────────────────────────────────────────────
const LineChart = ({ data, title, color = '#00ff88', valueKey = 'count', labelKey = '_id' }) => {
  if (!data || data.length < 2) return (
    <div>
      <div className="admin-chart-title">{title}</div>
      <div className="admin-empty-chart">No data accumulated yet — traffic logs appear after API calls</div>
    </div>
  );

  const W = 540, H = 110;
  const values = data.map(d => d[valueKey] || 0);
  const max = Math.max(...values, 1);
  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - (values[i] / max) * (H - 16) - 8
  }));
  const linePath = `M ${pts.map(p => `${p.x},${p.y}`).join(' L ')}`;
  const areaPath = `${linePath} L ${pts[pts.length - 1].x},${H} L 0,${H} Z`;
  const labels = data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 6)) === 0);

  return (
    <div>
      <div className="admin-chart-title">{title}</div>
      <svg width="100%" viewBox={`0 0 ${W} ${H + 24}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((t, i) => (
          <line key={i} x1={0} y1={H - t * (H - 16) - 8} x2={W} y2={H - t * (H - 16) - 8}
            stroke="var(--border)" strokeWidth={0.5} strokeDasharray="3 3" opacity={0.5} />
        ))}
        <path d={areaPath} fill={`url(#grad-${color.replace('#','')})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === data.length - 1 ? 4 : 2.5}
            fill={color} opacity={i === data.length - 1 ? 1 : 0.6} />
        ))}
        {labels.map((d, i) => {
          const idx = data.indexOf(d);
          const x = (idx / (data.length - 1)) * W;
          return <text key={i} x={x} y={H + 20} textAnchor="middle"
            fill="var(--text-dim)" fontSize="8" fontFamily="var(--font-mono)">{String(d[labelKey]).slice(-5)}</text>;
        })}
      </svg>
    </div>
  );
};

// ── Donut Chart ───────────────────────────────────────────────────────────────
const DonutChart = ({ data, title }) => {
  if (!data || data.length === 0) return (
    <div><div className="admin-chart-title">{title}</div>
      <div className="admin-empty-chart">No data yet</div></div>
  );
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  const cx = 55, cy = 55, r = 40, inner = 24, circ = 2 * Math.PI * r;
  let cum = 0;
  const slices = data.map((d, i) => {
    const pct = d.count / total;
    const dash = `${pct * circ} ${circ}`;
    const rotate = cum * 360 - 90;
    cum += pct;
    return { ...d, pct, dash, rotate, color: COLORS[i % COLORS.length] };
  });
  return (
    <div>
      <div className="admin-chart-title">{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <svg width={110} height={110} viewBox="0 0 110 110" style={{ flexShrink: 0 }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={15} />
          {slices.map((s, i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color}
              strokeWidth={15} strokeDasharray={s.dash}
              transform={`rotate(${s.rotate} ${cx} ${cy})`} />
          ))}
          <circle cx={cx} cy={cy} r={inner} fill="var(--bg-surface)" />
          <text x={cx} y={cy - 4} textAnchor="middle" fill="var(--text-main)"
            fontSize="10" fontWeight="700" fontFamily="var(--font-mono)">{total}</text>
          <text x={cx} y={cy + 9} textAnchor="middle" fill="var(--text-dim)"
            fontSize="6" fontFamily="var(--font-mono)">TOTAL</text>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {slices.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'capitalize', flex: 1 }}>{s._id || 'Unknown'}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--text-main)' }}>{Math.round(s.pct * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Bar Chart ─────────────────────────────────────────────────────────────────
const BarChart = ({ data, title }) => {
  if (!data || data.length === 0) return (
    <div><div className="admin-chart-title">{title}</div>
      <div className="admin-empty-chart">No data yet</div></div>
  );
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div>
      <div className="admin-chart-title">{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {data.slice(0, 7).map((d, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 40px', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'capitalize' }} title={d._id}>{d._id || 'Unknown'}</span>
            <div style={{ background: 'var(--bg-main)', borderRadius: 2, height: 6, overflow: 'hidden' }}>
              <div style={{ width: `${(d.count / max) * 100}%`, height: '100%', background: COLORS[i % COLORS.length], borderRadius: 2, transition: 'width 0.8s ease' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textAlign: 'right' }}>{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Metric Card ───────────────────────────────────────────────────────────────
const MetricCard = ({ icon: Icon, label, value, sub, color = '#00ff88', loading }) => (
  <div className="admin-metric-card">
    <div className="admin-metric-top">
      <span className="admin-metric-label">{label}</span>
      <div className="admin-metric-icon-wrap" style={{ background: `${color}18`, border: `1px solid ${color}40` }}>
        <Icon size={14} color={color} />
      </div>
    </div>
    <div className="admin-metric-value" style={{ color }}>
      {loading ? <span className="admin-skeleton" style={{ display: 'block', width: 80, height: 26, borderRadius: 4 }} /> : value}
    </div>
    {sub && <div className="admin-metric-sub">{sub}</div>}
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const AdminPanel = ({ adminToken }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [clearing, setClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearResult, setClearResult] = useState('');
  const intervalRef = useRef(null);

  const fetchStats = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const token = adminToken || localStorage.getItem('admin_token');
      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 403 || res.status === 401) {
        setError('Admin session expired. Please log in again.');
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load analytics');
      setStats(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    intervalRef.current = setInterval(() => fetchStats(true), 30000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const clearTrafficData = async () => {
    setClearing(true);
    setClearResult('');
    try {
      const token = adminToken || localStorage.getItem('admin_token');
      const res = await fetch(`${API_URL}/admin/clear-traffic`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Clear failed');
      setClearResult(`✓ ${data.message}`);
      setShowClearConfirm(false);
      setTimeout(() => {
        setClearResult('');
        fetchStats(true);
      }, 2500);
    } catch (err) {
      setClearResult(`✕ ${err.message}`);
    } finally {
      setClearing(false);
    }
  };

  if (error) return (
    <div className="admin-error-state">
      <Shield size={48} color="#e63946" />
      <h2>ERROR</h2>
      <p>{error}</p>
    </div>
  );

  const ov = stats?.overview || {};
  const sections = ['overview', 'users', 'contracts', 'traffic'];

  return (
    <div className="admin-panel">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-left">
          <div className="admin-header-tag">
            <span className="admin-pulse" />
            LIVE ANALYTICS // ADMIN CONSOLE
          </div>
          <h1 className="admin-title">TRAFFIC <span className="admin-title-accent">INTELLIGENCE</span></h1>
          <p className="admin-subtitle">Real-time monitoring — users, contracts, traffic & performance</p>
        </div>
        <div className="admin-header-right">
          {activeSection === 'traffic' && (
            <button
              className="admin-refresh-btn"
              onClick={() => setShowClearConfirm(true)}
              style={{ borderColor: '#e6394660', color: '#e63946' }}
              title="Delete all traffic logs and start fresh"
            >
              <span style={{ fontSize: 13 }}>⊘</span>
              CLEAR TRAFFIC
            </button>
          )}
          <button className="admin-refresh-btn" onClick={() => fetchStats(true)} disabled={refreshing}>
            <RefreshCw size={13} className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'SYNCING...' : 'REFRESH'}
          </button>
          <div className="admin-last-update"><Wifi size={10} color="#00ff88" /> AUTO: 30s</div>
        </div>
      </div>

      {/* Clear traffic confirmation modal */}
      {showClearConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#111', border: '1px solid #e6394640',
            borderRadius: 10, padding: '32px 28px', maxWidth: 420, width: '90%',
            boxShadow: '0 0 60px rgba(230,57,70,0.15)', textAlign: 'center'
          }}>
            <div style={{ fontSize: 38, marginBottom: 12 }}>⚠️</div>
            <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: '#e63946', margin: '0 0 10px', letterSpacing: '0.05em' }}>
              CLEAR ALL TRAFFIC DATA?
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '0 0 24px', lineHeight: 1.7 }}>
              This permanently deletes all traffic logs from MongoDB.<br />
              <strong style={{ color: 'var(--text-muted)' }}>Users and contracts are NOT affected.</strong><br />
              Fresh logging starts immediately after.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  padding: '10px 24px', background: 'none',
                  border: '1px solid var(--border)', borderRadius: 6,
                  color: 'var(--text-dim)', fontFamily: 'var(--font-mono)',
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer'
                }}
              >
                CANCEL
              </button>
              <button
                onClick={clearTrafficData}
                disabled={clearing}
                style={{
                  padding: '10px 28px',
                  background: clearing ? '#e6394640' : '#e63946',
                  border: 'none', borderRadius: 6,
                  color: '#fff', fontFamily: 'var(--font-mono)',
                  fontSize: 11, fontWeight: 800, letterSpacing: '0.08em',
                  cursor: clearing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {clearing ? 'CLEARING...' : 'YES, CLEAR ALL'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear result toast */}
      {clearResult && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9998,
          background: clearResult.startsWith('✓') ? '#00ff8812' : '#e6394612',
          border: `1px solid ${clearResult.startsWith('✓') ? '#00ff8840' : '#e6394640'}`,
          borderRadius: 8, padding: '13px 22px',
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.04em',
          color: clearResult.startsWith('✓') ? '#00ff88' : '#e63946',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.3s ease'
        }}>
          {clearResult}
        </div>
      )}

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {sections.map(s => (
          <button key={s} onClick={() => setActiveSection(s)} style={{
            background: 'none', border: 'none',
            borderBottom: activeSection === s ? '2px solid #00ff88' : '2px solid transparent',
            color: activeSection === s ? '#00ff88' : 'var(--text-dim)',
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.1em', padding: '10px 16px', cursor: 'pointer',
            textTransform: 'uppercase', transition: 'all 0.2s'
          }}>
            {s}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW SECTION ─────────────────────────────────────── */}
      {activeSection === 'overview' && (
        <>
          <div className="admin-metrics-grid">
            <MetricCard icon={Users}      label="TOTAL USERS"      value={ov.totalUsers ?? '—'}           sub={`+${ov.newUsersLast7d ?? 0} this week`}    color="#00ff88" loading={loading} />
            <MetricCard icon={UserCheck}  label="ACTIVE USERS"     value={ov.usersWithCredits ?? '—'}     sub="Users with credits"                        color="#00b4d8" loading={loading} />
            <MetricCard icon={FileSearch} label="CONTRACTS AUDITED" value={ov.totalContracts ?? '—'}      sub={`+${ov.contractsLast7d ?? 0} this week`}   color="#a855f7" loading={loading} />
            <MetricCard icon={Car}        label="VIN LOOKUPS"       value={ov.totalLookupsAllUsers ?? '—'} sub="All users combined"                       color="#f77f00" loading={loading} />
            <MetricCard icon={Coins}      label="CREDITS IN SYSTEM" value={ov.totalCreditsInSystem ?? '—'} sub="Across all accounts"                      color="#fbbf24" loading={loading} />
            <MetricCard icon={Activity}   label="API REQUESTS (24H)" value={ov.last24hRequests ?? '—'}   sub={`${ov.totalRequests ?? 0} all time`}        color="#e63946" loading={loading} />
          </div>

          {/* Daily traffic + user growth */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="admin-card">
              {loading ? <div className="admin-skeleton" style={{ height: 160 }} /> :
                <LineChart data={stats?.dailyTraffic || []} title="API TRAFFIC — LAST 30 DAYS" color="#00ff88" />}
            </div>
            <div className="admin-card">
              {loading ? <div className="admin-skeleton" style={{ height: 160 }} /> :
                <LineChart data={stats?.userGrowth || []} title="USER REGISTRATIONS — GROWTH" color="#00b4d8" />}
            </div>
          </div>

          {/* Device + Browser + OS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div className="admin-card">
              {loading ? <div className="admin-skeleton" style={{ height: 180 }} /> :
                <DonutChart data={stats?.deviceBreakdown || []} title="DEVICE BREAKDOWN" />}
            </div>
            <div className="admin-card">
              {loading ? <div className="admin-skeleton" style={{ height: 180 }} /> :
                <DonutChart data={stats?.browserBreakdown || []} title="BROWSER BREAKDOWN" />}
            </div>
            <div className="admin-card">
              {loading ? <div className="admin-skeleton" style={{ height: 180 }} /> :
                <BarChart data={stats?.osBreakdown || []} title="OPERATING SYSTEM" />}
            </div>
          </div>
        </>
      )}

      {/* ── USERS SECTION ────────────────────────────────────────── */}
      {activeSection === 'users' && (
        <>
          <div className="admin-metrics-grid">
            <MetricCard icon={Users}     label="TOTAL REGISTERED"  value={ov.totalUsers ?? '—'}      sub="All accounts"                  color="#00ff88" loading={loading} />
            <MetricCard icon={TrendingUp} label="NEW (7 DAYS)"      value={ov.newUsersLast7d ?? '—'}  sub="Recent signups"                color="#00b4d8" loading={loading} />
            <MetricCard icon={TrendingUp} label="NEW (30 DAYS)"     value={ov.newUsersLast30d ?? '—'} sub="Monthly growth"                color="#a855f7" loading={loading} />
            <MetricCard icon={UserCheck}  label="WITH CREDITS"      value={ov.usersWithCredits ?? '—'} sub="Paying / active users"        color="#fbbf24" loading={loading} />
            <MetricCard icon={Coins}      label="TOTAL CREDITS"     value={ov.totalCreditsInSystem ?? '—'} sub="Across all accounts"      color="#f77f00" loading={loading} />
            <MetricCard icon={Car}        label="TOTAL VIN LOOKUPS" value={ov.totalLookupsAllUsers ?? '—'} sub="All users combined"       color="#e63946" loading={loading} />
          </div>

          <div className="admin-card admin-card-full">
            <div className="admin-chart-title">ALL REGISTERED USERS</div>
            {loading ? <div className="admin-skeleton" style={{ height: 300 }} /> : (
              <div className="admin-requests-table-wrap">
                <table className="admin-requests-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>USERNAME</th>
                      <th>EMAIL</th>
                      <th>CREDITS</th>
                      <th>VIN LOOKUPS</th>
                      <th>JOINED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.users || []).map((u, i) => (
                      <tr key={u._id}>
                        <td style={{ color: 'var(--text-dim)', fontSize: 9 }}>{i + 1}</td>
                        <td style={{ color: '#00ff88', fontWeight: 700 }}>{u.username}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 10 }}>{u.email}</td>
                        <td>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                            color: u.credits > 10 ? '#00ff88' : u.credits > 0 ? '#fbbf24' : '#e63946'
                          }}>
                            {u.credits ?? 0}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#00b4d8' }}>{u.lookupsCount ?? 0}</td>
                        <td className="admin-time-cell">{new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      </tr>
                    ))}
                    {(!stats?.users || stats.users.length === 0) && (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-dim)', fontSize: 11 }}>No users found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── CONTRACTS SECTION ────────────────────────────────────── */}
      {activeSection === 'contracts' && (
        <>
          <div className="admin-metrics-grid">
            <MetricCard icon={FileSearch} label="TOTAL CONTRACTS"   value={ov.totalContracts ?? '—'}    sub="All time"                    color="#00ff88" loading={loading} />
            <MetricCard icon={TrendingUp} label="LAST 7 DAYS"       value={ov.contractsLast7d ?? '—'}   sub="Recent uploads"              color="#a855f7" loading={loading} />
            <MetricCard icon={TrendingUp} label="LAST 30 DAYS"      value={ov.contractsLast30d ?? '—'}  sub="Monthly audits"              color="#00b4d8" loading={loading} />
            <MetricCard icon={Users}      label="TOTAL USERS"        value={ov.totalUsers ?? '—'}        sub="Registered accounts"         color="#f77f00" loading={loading} />
            <MetricCard icon={Zap}        label="AVG RESPONSE"       value={ov.avgResponseTime ? `${ov.avgResponseTime}ms` : '—'} sub="7-day API avg" color="#fbbf24" loading={loading} />
            <MetricCard icon={Server}     label="API REQUESTS"       value={ov.totalRequests ?? '—'}     sub="All time"                    color="#e63946" loading={loading} />
          </div>

          <div className="admin-card admin-card-full">
            <div className="admin-chart-title">RECENT CONTRACT AUDITS</div>
            {loading ? <div className="admin-skeleton" style={{ height: 280 }} /> : (
              <div className="admin-requests-table-wrap">
                <table className="admin-requests-table">
                  <thead>
                    <tr>
                      <th>FILE NAME</th>
                      <th>USER</th>
                      <th>SIZE</th>
                      <th>RED FLAGS</th>
                      <th>VEHICLE</th>
                      <th>DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.recentContracts || []).map((c, i) => (
                      <tr key={c._id}>
                        <td style={{ color: 'var(--text-main)', fontSize: 10, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.fileName}</td>
                        <td style={{ color: '#00ff88', fontSize: 10 }}>{c.userId?.username || 'Unknown'}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)' }}>
                          {c.fileSize ? `${Math.round(c.fileSize / 1024)}KB` : '—'}
                        </td>
                        <td>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                            color: (c.analysis?.redFlags?.length || 0) > 0 ? '#e63946' : '#00ff88'
                          }}>
                            {c.analysis?.redFlags?.length || 0} flags
                          </span>
                        </td>
                        <td style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.analysis?.vehicleName || '—'}</td>
                        <td className="admin-time-cell">{new Date(c.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      </tr>
                    ))}
                    {(!stats?.recentContracts || stats.recentContracts.length === 0) && (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-dim)', fontSize: 11 }}>No contracts found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── TRAFFIC SECTION ──────────────────────────────────────── */}
      {activeSection === 'traffic' && (
        <>
          <div className="admin-metrics-grid">
            <MetricCard icon={Activity}   label="TOTAL REQUESTS"   value={ov.totalRequests ?? '—'}       sub="All time"             color="#00ff88" loading={loading} />
            <MetricCard icon={TrendingUp} label="LAST 24H"         value={ov.last24hRequests ?? '—'}     sub="Today"                color="#00b4d8" loading={loading} />
            <MetricCard icon={Globe}      label="UNIQUE VISITORS"  value={ov.uniqueVisitors ?? '—'}      sub="Last 30 days by IP"   color="#a855f7" loading={loading} />
            <MetricCard icon={Zap}        label="AVG RESPONSE"     value={ov.avgResponseTime ? `${ov.avgResponseTime}ms` : '—'} sub="7-day avg" color="#fbbf24" loading={loading} />
            <MetricCard icon={TrendingUp} label="LAST 7 DAYS"      value={ov.last7dRequests ?? '—'}      sub="Weekly"               color="#f77f00" loading={loading} />
            <MetricCard icon={Server}     label="ENDPOINTS HIT"    value={stats?.topRoutes?.length ?? '—'} sub="Unique routes"      color="#e63946" loading={loading} />
          </div>

          {/* Top routes + Requests table */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
            <div className="admin-card">
              {loading
                ? <div className="admin-skeleton" style={{ height: 260 }} />
                : <BarChart data={stats?.topRoutes || []} title="TOP ENDPOINTS — 7 DAYS" />
              }
            </div>

            <div className="admin-card">
              <div className="admin-chart-title">RECENT API REQUESTS</div>
              {loading ? <div className="admin-skeleton" style={{ height: 260 }} /> : (
                <div className="admin-requests-table-wrap">
                  <table className="admin-requests-table">
                    <thead>
                      <tr>
                        <th>METHOD</th>
                        <th>ROUTE</th>
                        <th>STATUS</th>
                        <th>IP ADDRESS</th>
                        <th>LOCATION</th>
                        <th>BROWSER</th>
                        <th>DEVICE</th>
                        <th>TIME</th>
                        <th>MS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(stats?.recentRequests || []).map((r, i) => (
                        <tr key={i}>
                          <td><span className={`admin-method-tag method-${r.method?.toLowerCase()}`}>{r.method}</span></td>
                          <td className="admin-route-cell" title={r.route}>{r.route}</td>
                          <td><span className={`admin-status-tag ${r.statusCode < 300 ? 'ok' : r.statusCode < 500 ? 'redirect' : 'err'}`}>{r.statusCode}</span></td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.04em' }}>
                            {r.ip || '—'}
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: 9 }}>
                            {r.country && r.country !== 'Unknown' ? (
                              <span style={{ color: '#00b4d8' }} title={r.region ? `${r.city}, ${r.country} (${r.region})` : `${r.city}, ${r.country}`}>
                                {r.city && r.city !== 'Unknown' ? `${r.city}, ` : ''}{r.country}
                              </span>
                            ) : <span style={{ color: 'var(--text-dim)' }}>—</span>}
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#a855f7' }}>{r.browser || '—'}</td>
                          <td style={{ textTransform: 'capitalize', color: DEVICE_COLORS[r.device] || 'var(--text-dim)', fontSize: 10 }}>
                            {r.device === 'mobile' ? <Smartphone size={11} /> : r.device === 'tablet' ? <Tablet size={11} /> : <Monitor size={11} />}
                            {' '}{r.device}
                          </td>
                          <td className="admin-time-cell">{new Date(r.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: r.responseTime > 500 ? '#e63946' : r.responseTime > 200 ? '#fbbf24' : '#00ff88' }}>
                            {r.responseTime}ms
                          </td>
                        </tr>
                      ))}
                      {(!stats?.recentRequests || stats.recentRequests.length === 0) && (
                        <tr><td colSpan={9} style={{ textAlign: 'center', padding: 24, color: 'var(--text-dim)', fontSize: 11 }}>
                          No traffic yet — make some API calls and refresh
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Location breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="admin-card">
              {loading ? <div className="admin-skeleton" style={{ height: 180 }} />
                : <BarChart data={stats?.countryBreakdown || []} title="TRAFFIC BY COUNTRY — LAST 30 DAYS" />}
            </div>
            <div className="admin-card">
              {loading ? <div className="admin-skeleton" style={{ height: 180 }} />
                : <BarChart
                    data={(stats?.cityBreakdown || []).map(d => ({ _id: d.country ? `${d._id}, ${d.country}` : d._id, count: d.count }))}
                    title="TRAFFIC BY CITY — LAST 30 DAYS"
                  />}
            </div>
          </div>

          {/* HTTP status breakdown */}
          <div className="admin-card admin-card-full">
            <div className="admin-chart-title">HTTP STATUS DISTRIBUTION — LAST 7 DAYS</div>
            {loading ? <div className="admin-skeleton" style={{ height: 60 }} /> : (
              stats?.statusBreakdown?.length > 0 ? (
                <div className="admin-status-grid">
                  {stats.statusBreakdown.map((s, i) => {
                    const color = s._id < 300 ? '#00ff88' : s._id < 400 ? '#fbbf24' : s._id < 500 ? '#f77f00' : '#e63946';
                    return (
                      <div key={i} className="admin-status-item" style={{ borderColor: `${color}40`, background: `${color}0d` }}>
                        <span className="admin-status-code" style={{ color }}>{s._id}</span>
                        <span className="admin-status-count">{s.count.toLocaleString()}</span>
                        <span className="admin-status-label">{s._id < 300 ? 'Success' : s._id < 400 ? 'Redirect' : s._id < 500 ? 'Client Err' : 'Server Err'}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="admin-empty-chart">No status data yet — traffic logs appear after API activity</div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPanel;
