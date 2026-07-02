import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import AdminPanel from './components/AdminPanel.jsx';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:8080/api';
const TOKEN_KEY = 'admin_token';

const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem(TOKEN_KEY, data.token);
      onLogin(data.username);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'JetBrains Mono', 'Courier New', monospace"
    }}>
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420, padding: '0 20px' }}>
        {/* Logo area */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#00ff8810', border: '1px solid #00ff8830',
            borderRadius: 6, padding: '6px 14px', marginBottom: 24
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00ff88', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 9, color: '#00ff88', letterSpacing: '0.15em' }}>RESTRICTED ACCESS // ADMIN ONLY</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            VETO<span style={{ color: '#00ff88' }}>CAR</span>
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 11, color: '#555', letterSpacing: '0.1em' }}>
            ADMIN CONSOLE // V1.0
          </p>
        </div>

        {/* Login card */}
        <form onSubmit={handleSubmit} style={{
          background: '#111',
          border: '1px solid #1e1e1e',
          borderRadius: 10,
          padding: '32px 28px',
          boxShadow: '0 0 60px rgba(0,255,136,0.04)'
        }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 9, color: '#555', letterSpacing: '0.12em', marginBottom: 8 }}>
              ADMIN USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              autoComplete="off"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#0d0d0d', border: '1px solid #1e1e1e',
                borderRadius: 6, padding: '12px 14px',
                color: '#fff', fontSize: 13, fontFamily: 'inherit',
                outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#00ff8860'}
              onBlur={e => e.target.style.borderColor = '#1e1e1e'}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 9, color: '#555', letterSpacing: '0.12em', marginBottom: 8 }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: '#0d0d0d', border: '1px solid #1e1e1e',
                  borderRadius: 6, padding: '12px 44px 12px 14px',
                  color: '#fff', fontSize: 13, fontFamily: 'inherit',
                  outline: 'none', transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#00ff8860'}
                onBlur={e => e.target.style.borderColor = '#1e1e1e'}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 11,
                  fontFamily: 'inherit', letterSpacing: '0.05em', padding: 0
                }}
              >
                {showPass ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: '#e6394612', border: '1px solid #e6394630',
              borderRadius: 6, padding: '10px 14px', marginBottom: 20,
              fontSize: 11, color: '#e63946', letterSpacing: '0.05em'
            }}>
              ✕ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px',
              background: loading ? '#00ff8830' : '#00ff88',
              border: 'none', borderRadius: 6,
              color: '#000', fontSize: 12, fontWeight: 800,
              fontFamily: 'inherit', letterSpacing: '0.12em',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'AUTHENTICATING...' : 'ACCESS ADMIN CONSOLE →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 9, color: '#333', letterSpacing: '0.08em' }}>
          UNAUTHORIZED ACCESS IS STRICTLY PROHIBITED
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
    </div>
  );
};

const AdminApp = () => {
  const [adminUser, setAdminUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if valid admin token already stored
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      try {
        // Decode payload (don't verify — backend will verify on API calls)
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'admin' && payload.exp * 1000 > Date.now()) {
          setAdminUser(payload.username);
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    setChecking(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAdminUser(null);
  };

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#333', letterSpacing: '0.1em' }}>INITIALIZING...</div>
      </div>
    );
  }

  if (!adminUser) {
    return <AdminLogin onLogin={setAdminUser} />;
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      {/* Admin topbar */}
      <div style={{
        height: 52, background: '#0d0d0d', borderBottom: '1px solid #1a1a1a',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            VETO<span style={{ color: '#00ff88' }}>CAR</span>
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#333', letterSpacing: '0.1em' }}>
            // ADMIN CONSOLE
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#555', letterSpacing: '0.08em' }}>
            LOGGED IN AS: <span style={{ color: '#00ff88' }}>{adminUser.toUpperCase()}</span>
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: 'none', border: '1px solid #1e1e1e', borderRadius: 4,
              color: '#555', fontFamily: 'monospace', fontSize: 9, fontWeight: 700,
              letterSpacing: '0.1em', padding: '5px 12px', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.target.style.borderColor = '#e63946'; e.target.style.color = '#e63946'; }}
            onMouseLeave={e => { e.target.style.borderColor = '#1e1e1e'; e.target.style.color = '#555'; }}
          >
            SIGN OUT
          </button>
        </div>
      </div>

      {/* Admin panel content */}
      <div style={{ padding: '28px 32px', maxWidth: 1600, margin: '0 auto' }}>
        <AdminPanel adminToken={localStorage.getItem(TOKEN_KEY)} />
      </div>
    </div>
  );
};

createRoot(document.getElementById('admin-root')).render(<AdminApp />);
