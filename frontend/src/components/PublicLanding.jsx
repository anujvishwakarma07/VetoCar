import React, { useState } from 'react';
import {
  Sun, Moon, Sparkles, ShieldAlert, CheckCircle2,
  X, ShieldCheck, Zap, RefreshCw, Car, Gauge, Key
} from 'lucide-react';
import darkModeLogo from '../assets/darkModeTextual.png';
import darkModeSymbol from '../assets/darkModeSymbolic.png';
import lightModeLogo from '../assets/LightModeTextual.png';
import lightModeSymbol from '../assets/lightModeSybolic.png';

const PublicLanding = ({ setIsAuthenticated, setUser, theme, toggleTheme }) => {
  const [showAuth, setShowAuth] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  // Auth Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Interactive Calculator State
  const [selectedPreset, setSelectedPreset] = useState('bmw');
  const [msrp, setMsrp] = useState(44500);
  const [acqFee, setAcqFee] = useState(1095);
  const [addonsCost, setAddonsCost] = useState(500);
  const [mfMarkup, setMfMarkup] = useState(true);

  // Preset Configurations
  const vehiclePresets = {
    tesla: { name: 'Tesla Model Y', msrp: 47990, acqFee: 695, addons: 0, mfMarkup: false },
    bmw: { name: 'BMW 3-Series', msrp: 44500, acqFee: 1095, addons: 500, mfMarkup: true },
    toyota: { name: 'Toyota RAV4', msrp: 32000, acqFee: 895, addons: 1500, mfMarkup: false }
  };

  const handleApplyPreset = (key) => {
    setSelectedPreset(key);
    const p = vehiclePresets[key];
    setMsrp(p.msrp);
    setAcqFee(p.acqFee);
    setAddonsCost(p.addons);
    setMfMarkup(p.mfMarkup);
  };

  // Auth Handler
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all required fields.'); setLoading(false); return;
    }
    if (isRegister) {
      if (!email.trim()) { setError('Please provide a valid email address.'); setLoading(false); return; }
      if (password !== confirmPassword) { setError('Passwords do not match.'); setLoading(false); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:8080/api';
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), email: email.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Access handshake failed.');
      setLoading(false);
      if (isRegister) {
        setSuccess('Account created! Please sign in.');
        setTimeout(() => { setIsRegister(false); setSuccess(''); setUsername(''); setPassword(''); setConfirmPassword(''); setEmail(''); }, 1500);
      } else {
        localStorage.setItem('token', data.token);
        if (setIsAuthenticated) setIsAuthenticated(true);
        if (setUser) setUser(data.user);
      }
    } catch (err) {
      setError(err.message || 'Connection refused.'); setLoading(false);
    }
  };

  return (
    <div className="landing-container">
      {/* Background patterns and glowing orbs */}
      <div className="landing-grid-bg" />
      <div className="landing-glow-orb" style={{ top: '-100px', left: '-100px' }} />
      <div className="landing-glow-orb-2" style={{ top: '35%', right: '-150px' }} />
      <div className="landing-glow-orb" style={{ bottom: '150px', left: '-200px' }} />

      {/* ── Slide-Over Authentication Drawer Backdrop ── */}
      {showAuth && (
        <div
          className="auth-drawer-backdrop"
          onClick={() => setShowAuth(false)}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          {/* Detailed Diagnostic Car HUD on the left */}
          <div className="auth-backdrop-hud">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(0, 245, 212, 0.1)', border: '1px solid rgba(0, 245, 212, 0.2)', marginBottom: '16px' }}>
                <Car size={13} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)' }}>
                  PORTAL SECURE ACCESS HANDSHAKE
                </span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>
                LEASE DIAGNOSTIC INTERFACE
              </h3>
            </div>

            {/* Detailed Vector Car Blueprint SVG */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '580px', height: '240px' }}>
              <svg viewBox="0 0 800 200" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 8px rgba(0, 245, 212, 0.3))' }}>
                {/* Sports car blueprint path */}
                <path d="M 50 150 L 150 150 C 180 150, 190 110, 230 110 L 300 110 C 330 110, 360 80, 420 80 L 520 80 C 580 80, 620 110, 680 120 L 730 130 C 760 135, 780 150, 790 150 L 800 150 M 100 150 A 35 35 0 0 1 170 150 M 630 150 A 35 35 0 0 1 700 150" />
                <circle cx="135" cy="150" r="28" stroke="var(--accent)" strokeWidth="1" strokeDasharray="4 2" />
                <circle cx="135" cy="150" r="12" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
                <circle cx="665" cy="150" r="28" stroke="var(--accent)" strokeWidth="1" strokeDasharray="4 2" />
                <circle cx="665" cy="150" r="12" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
                <path d="M 70 142 L 95 142" stroke="var(--accent)" strokeWidth="2" />
                <path d="M 780 125 L 755 128" stroke="var(--accent)" strokeWidth="1" />
                <path d="M 400 85 C 440 85, 490 85, 520 100 L 450 120 Z" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.5" />

                {/* HUD detailing lines pointing to components */}
                <path d="M 120 120 L 70 60 L 20 60" stroke="var(--accent)" strokeWidth="0.75" strokeDasharray="2 2" />
                <path d="M 450 90 L 480 40 L 530 40" stroke="var(--accent)" strokeWidth="0.75" strokeDasharray="2 2" />
                <path d="M 720 135 L 750 90 L 800 90" stroke="var(--accent)" strokeWidth="0.75" strokeDasharray="2 2" />
              </svg>

              {/* Text labels floating on HUD lines */}
              <div style={{ position: 'absolute', left: '10px', top: '35px', fontFamily: 'var(--font-mono)', fontSize: '9px', textAlign: 'left' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 800 }}>[01 // ACQ FEE DETECTOR]</span><br />
                <span style={{ color: 'var(--text-muted)' }}>MAX CAP: $695 baseline</span>
              </div>

              <div style={{ position: 'absolute', right: '10px', top: '15px', fontFamily: 'var(--font-mono)', fontSize: '9px', textAlign: 'left' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 800 }}>[02 // INTEREST RATE AUDIT]</span><br />
                <span style={{ color: 'var(--text-muted)' }}>Checking hidden APR inflation</span>
              </div>

              <div style={{ position: 'absolute', right: '-40px', top: '65px', fontFamily: 'var(--font-mono)', fontSize: '9px', textAlign: 'left' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 800 }}>[03 // RESIDUAL VALUE SHIELD]</span><br />
                <span style={{ color: 'var(--text-muted)' }}>Confirming specifications</span>
              </div>
            </div>

            <div style={{
              display: 'flex', gap: '32px', marginTop: '32px',
              fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)'
            }}>
              <div>// CORE: VETOCAR.V1</div>
              <div>// HANDSHAKE: CONNECTED</div>
              <div>// SECURE AUDIT BLOCK</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Slide-Over Authentication Drawer ── */}
      <div className={`auth-drawer ${showAuth ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>
            {isRegister ? 'HANDSHAKE REGISTRATION' : 'GATEWAY PORTAL'}
          </span>
          <button
            onClick={() => setShowAuth(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: '0 0 8px 0' }}>
            {isRegister ? 'Request Portal Access' : 'Connect to Portal'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
            {isRegister ? 'Provide credentials to setup auto-audit capabilities.' : 'Input credentials to enter your secure review deck.'}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '12px 16px', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <ShieldAlert size={14} style={{ flexShrink: 0, marginTop: '1px', color: '#ef4444' }} />
            <span style={{ fontSize: '12px', color: '#ef4444' }}>{error}</span>
          </div>
        )}
        {success && (
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '12px 16px', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: '1px', color: '#10b981' }} />
            <span style={{ fontSize: '12px', color: '#10b981' }}>{success}</span>
          </div>
        )}

        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
              Username
            </label>
            <input
              type="text"
              placeholder="e.g. lease_breaker"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              style={{
                width: '100%', boxSizing: 'border-box', background: 'var(--bg-main)',
                border: '1px solid var(--border)', color: 'var(--text-main)',
                padding: '12px 14px', fontSize: '13px', outline: 'none'
              }}
            />
          </div>

          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. name@domain.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: '100%', boxSizing: 'border-box', background: 'var(--bg-main)',
                  border: '1px solid var(--border)', color: 'var(--text-main)',
                  padding: '12px 14px', fontSize: '13px', outline: 'none'
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%', boxSizing: 'border-box', background: 'var(--bg-main)',
                border: '1px solid var(--border)', color: 'var(--text-main)',
                padding: '12px 14px', fontSize: '13px', outline: 'none'
              }}
            />
          </div>

          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                style={{
                  width: '100%', boxSizing: 'border-box', background: 'var(--bg-main)',
                  border: '1px solid var(--border)', color: 'var(--text-main)',
                  padding: '12px 14px', fontSize: '13px', outline: 'none'
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn"
            style={{ width: '100%', padding: '16px', justifyContent: 'center', marginTop: '10px' }}
          >
            {loading ? 'Processing...' : isRegister ? 'Register Account' : 'Authenticate'}
          </button>
        </form>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }}
          >
            {isRegister ? '← Already have an account? Sign In' : 'No account? Create one now →'}
          </button>
        </div>
      </div>

      {/* ── Sticky Glassmorphic Header ── */}
      <div className={`landing-page-content ${showAuth ? 'blurred' : ''}`}>
        <header className="glass-panel" style={{
        position: 'sticky', top: 0, zIndex: 999,
        borderBottom: '1px solid var(--border)',
        padding: '0 32px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '72px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={theme === 'dark' ? darkModeSymbol : lightModeSymbol} alt="VetoCar Mark" style={{ height: '28px', objectFit: 'contain' }} />
          <img src={theme === 'dark' ? darkModeLogo : lightModeLogo} alt="VetoCar" style={{ height: '18px', objectFit: 'contain' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={toggleTheme} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px' }} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="btn hover-glow"
            style={{
              padding: '12px 28px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background: 'var(--primary)',
              color: 'var(--bg-main)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              transition: 'var(--transition)'
            }}
            onClick={() => { setIsRegister(false); setShowAuth(true); }}
          >
            Sign In
          </button>
        </div>
      </header>

      {/* ── FIRST PAGE VIEWPORT FOLD ── */}
      <div className="hero-viewport-fold">
        <div className="hero-centered" style={{ margin: 0 }}>
          <div className="hero-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Car size={12} style={{ color: 'var(--accent)' }} />
            <span>VetoCar Auto Audit</span>
            <Sparkles size={11} style={{ color: 'var(--accent)' }} />
            <span>Powered by VetoCar Diagnostic Engine</span>
          </div>

          <h1 className="hero-title-large">
            DECODE YOUR AUTO LEASE.<br />
            NEGOTIATE LIKE AN <span className="glow-text" style={{ color: 'var(--accent)' }}>EXPERT.</span>
          </h1>

          <p className="hero-subtitle">
            Instantly audit dealer worksheets, uncover hidden interest rate markups, and obtain customized negotiation rebuttals to slash your monthly payments.
          </p>

          <div className="hero-buttons-container">
            <button
              className="btn hover-glow"
              style={{ padding: '16px 36px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              onClick={() => { setIsRegister(true); setShowAuth(true); }}
            >
              <Key size={14} />
              <span>Get Started Free</span>
            </button>
            <button
              className="btn"
              style={{ background: 'transparent', color: 'var(--primary)', borderColor: 'var(--border)', padding: '16px 36px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              onClick={() => document.getElementById('simulator-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Gauge size={14} />
              <span>Run Deal Simulator</span>
            </button>
          </div>

          {/* High-Tech Automotive Diagnostic Ticker */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            flexWrap: 'wrap',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--text-muted)',
            borderTop: '1px dashed var(--border)',
            paddingTop: '20px',
            width: '100%',
            maxWidth: '640px',
            margin: '40px auto 0 auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Car size={12} style={{ color: 'var(--accent)' }} />
              <span>NHTSA VPIC RECALL ENGINE // ONLINE</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Gauge size={12} style={{ color: 'var(--accent)' }} />
              <span>124,510 VEHICLE TRIMS INDEXED</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Key size={12} style={{ color: 'var(--accent)' }} />
              <span>EST. AVG LEASE SAVINGS: $2,840</span>
            </div>
          </div>

          {/* Sleek CSS Sports Car Silhouette Outline */}
          <svg viewBox="0 0 800 200" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: theme === 'dark' ? 0.70 : 0.85, width: '100%', maxWidth: '480px', height: 'auto', display: 'block', margin: '32px auto 0 auto' }}>
            <path d="M 50 150 L 150 150 C 180 150, 190 110, 230 110 L 300 110 C 330 110, 360 80, 420 80 L 520 80 C 580 80, 620 110, 680 120 L 730 130 C 760 135, 780 150, 790 150 L 800 150 M 100 150 A 35 35 0 0 1 170 150 M 630 150 A 35 35 0 0 1 700 150" />
            <circle cx="135" cy="150" r="28" stroke="var(--accent)" strokeWidth="1" strokeDasharray="4 2" />
            <circle cx="135" cy="150" r="12" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
            <circle cx="665" cy="150" r="28" stroke="var(--accent)" strokeWidth="1" strokeDasharray="4 2" />
            <circle cx="665" cy="150" r="12" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
            <path d="M 70 142 L 95 142" stroke="var(--accent)" strokeWidth="2" />
            <path d="M 780 125 L 755 128" stroke="var(--accent)" strokeWidth="1" />
            <path d="M 400 85 C 440 85, 490 85, 520 100 L 450 120 Z" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.5" />
          </svg>
        </div>
      </div>

      {/* ── LOWER SCROLLABLE SECTIONS ── */}
      <div style={{ padding: '0 32px 80px 32px', maxWidth: '1200px', width: '100%', margin: '0 auto', boxSizing: 'border-box', position: 'relative', zIndex: 10 }}>

        {/* Bento Grid: Core Capabilities */}
        <div className="landing-section">
          <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '32px', color: 'var(--text-muted)' }}>
            CORE SYSTEM CAPABILITIES //
          </h3>

          <div className="bento-grid">
            {/* Bento Card 1: Auditor (Span 2) */}
            <div className="bento-item bento-span-2 hover-glow" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '42px', height: '42px', background: 'rgba(0, 245, 212, 0.1)', border: '1px solid rgba(0, 245, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: '24px' }}>
                  <Car size={18} />
                </div>
                <h4 style={{ textTransform: 'uppercase', fontSize: '15px', fontWeight: 800, marginBottom: '12px', letterSpacing: '0.05em' }}>1. Lease Contract Auditor</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6', margin: 0, maxWidth: '480px' }}>
                  Upload dealer rate sheets or purchase quotation documents. VetoCar isolated hidden dealer margins on interest factor, calculating baseline MSRP deviations.
                </p>
              </div>
              <div style={{ marginTop: '28px', background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  <span>SYS_AUDIT_THREAD_01 //</span>
                  <span style={{ color: 'var(--accent)' }}>ACTIVE</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                  <span>Analyzing quotation_work.pdf...</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>[100% COMPLETE]</span>
                </div>
              </div>
            </div>

            {/* Bento Card 2: NHTSA Verification (Span 1) */}
            <div className="bento-item hover-glow" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '42px', height: '42px', background: 'rgba(0, 245, 212, 0.1)', border: '1px solid rgba(0, 245, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: '24px' }}>
                  <ShieldCheck size={18} />
                </div>
                <h4 style={{ textTransform: 'uppercase', fontSize: '15px', fontWeight: 800, marginBottom: '12px', letterSpacing: '0.05em' }}>2. NHTSA Verification</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                  Verify safety trim configuration, standard accessories, and default manufacturer specifications are priced correctly.
                </p>
              </div>
              <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="pulsing-dot" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>DB SECURE: ACTIVE</span>
              </div>
            </div>

            {/* Bento Card 3: Negotiation Coach (Span 1) */}
            <div className="bento-item hover-glow" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '42px', height: '42px', background: 'rgba(0, 245, 212, 0.1)', border: '1px solid rgba(0, 245, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: '24px' }}>
                  <Zap size={18} />
                </div>
                <h4 style={{ textTransform: 'uppercase', fontSize: '15px', fontWeight: 800, marginBottom: '12px', letterSpacing: '0.05em' }}>3. Negotiation Coach</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                  Generate targeted rebuttals and sales manager counter-offer emails using precise audited calculations.
                </p>
              </div>
              <div style={{ marginTop: '28px', background: 'rgba(0, 245, 212, 0.05)', border: '1px dashed var(--border)', padding: '12px', fontSize: '11px', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                "The documented acquisition fee exceeds MSRP..."
              </div>
            </div>

            {/* Bento Card 4: Side-by-Side Compare (Span 2) */}
            <div className="bento-item bento-span-2 hover-glow" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '42px', height: '42px', background: 'rgba(0, 245, 212, 0.1)', border: '1px solid rgba(0, 245, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: '24px' }}>
                  <RefreshCw size={18} />
                </div>
                <h4 style={{ textTransform: 'uppercase', fontSize: '15px', fontWeight: 800, marginBottom: '12px', letterSpacing: '0.05em' }}>4. Deal Comparison Deck</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6', margin: 0, maxWidth: '480px' }}>
                  Stack multiple quote sheets side-by-side. Calculate total out-of-pocket costs, amortize down payments, and flag the winner.
                </p>
              </div>
              <div style={{ marginTop: '28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                <div style={{ border: '1px solid var(--border)', padding: '12px', background: 'var(--bg-main)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>DEAL A (UNAUDITED)</span>
                  <div style={{ color: '#ef4444', fontWeight: 800, marginTop: '6px', fontSize: '11px' }}>$540/mo</div>
                </div>
                <div style={{ border: '1px solid var(--accent)', padding: '12px', background: 'rgba(0, 245, 212, 0.05)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>DEAL B (VETOCAR AUDITED)</span>
                  <div style={{ color: 'var(--accent)', fontWeight: 800, marginTop: '6px', fontSize: '11px' }}>$475/mo ★ WINNER</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Simulator & Audit Calculator */}
        <div id="simulator-section" className="landing-section">
          <div style={{ marginBottom: '48px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', background: 'var(--bg-hover)',
              border: '1px solid var(--border)', marginBottom: '18px',
            }}>
              <Sparkles size={11} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
                Interactive Simulator
              </span>
            </div>
            <h2 style={{ fontSize: '38px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: '16px' }}>
              Expose Dealer Margins In Real Time
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxRight: '560px', margin: 0 }}>
              Adjust the values below to simulate standard dealer markups on acquisition fees, add-on costs, and money factors, and watch VetoCar audit the math instantly.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 992 ? '1fr' : '1.1fr 0.9fr', gap: '64px', alignItems: 'start' }}>
            {/* Sliders Control Card */}
            <div className="card" style={{ padding: '32px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 0, margin: 0 }}>
              {/* Vehicle Preset Selector */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '36px' }}>
                {Object.keys(vehiclePresets).map((key) => (
                  <button
                    key={key}
                    onClick={() => handleApplyPreset(key)}
                    style={{
                      flex: 1, padding: '14px',
                      background: selectedPreset === key ? 'var(--primary)' : 'var(--bg-hover)',
                      color: selectedPreset === key ? 'var(--bg-main)' : 'var(--text-main)',
                      border: '1px solid var(--border)', fontWeight: 800,
                      fontSize: '11px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)',
                      cursor: 'pointer', transition: 'all 0.15s ease'
                    }}
                  >
                    {vehiclePresets[key].name}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                    <span>ACQUISITION FEE</span>
                    <span style={{ color: acqFee > 695 ? 'var(--accent)' : 'var(--text-muted)' }}>${acqFee}</span>
                  </div>
                  <input
                    type="range"
                    min="695"
                    max="1195"
                    step="50"
                    value={acqFee}
                    onChange={(e) => { setAcqFee(parseInt(e.target.value)); setSelectedPreset('custom'); }}
                    style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'ew-resize' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-dim)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                    <span>Bank Charge: $695</span>
                    <span>Inflated: $1195</span>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                    <span>DEALER ADD-ONS</span>
                    <span style={{ color: addonsCost > 0 ? 'var(--accent)' : 'var(--text-muted)' }}>${addonsCost}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2500"
                    step="250"
                    value={addonsCost}
                    onChange={(e) => { setAddonsCost(parseInt(e.target.value)); setSelectedPreset('custom'); }}
                    style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'ew-resize' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-dim)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                    <span>Fair: $0</span>
                    <span>Inflated: $2500</span>
                  </div>
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '20px', background: 'var(--bg-hover)', border: '1px solid var(--border)'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>MONEY FACTOR MARKUP STATUS</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Hidden APR inflation from 4.8% baseline to 6.7%</div>
                  </div>
                  <button
                    onClick={() => { setMfMarkup(!mfMarkup); setSelectedPreset('custom'); }}
                    style={{
                      background: mfMarkup ? 'var(--accent)' : 'transparent',
                      border: '1px solid var(--border)',
                      color: mfMarkup ? 'var(--bg-main)' : 'var(--text-main)',
                      padding: '10px 20px', fontSize: '11px', fontWeight: 800,
                      cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.2s',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    {mfMarkup ? 'ACTIVATED' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>

            {/* Calculations Dashboard Card */}
            <div className="glass-panel" style={{ padding: '40px', border: '1px solid var(--border)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, var(--accent), var(--primary))' }} />

              <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '24px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                AUDIT DIAGNOSTICS //
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Base Fair Lease Cost</span>
                  <span style={{ fontWeight: 600 }}>$20,880</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Acquisition Markup</span>
                  <span style={{ color: acqFee > 695 ? '#ef4444' : 'var(--text-main)', fontWeight: 600 }}>+${acqFee - 695}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Dealer Add-ons Markup</span>
                  <span style={{ color: addonsCost > 0 ? '#ef4444' : 'var(--text-main)', fontWeight: 600 }}>+${addonsCost}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Hidden Interest Markup</span>
                  <span style={{ color: mfMarkup ? '#ef4444' : 'var(--text-main)', fontWeight: 600 }}>+${mfMarkup ? 1800 : 0}</span>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '0.05em' }}>TOTAL HIDDEN MARKUP</span>
                  <span style={{ fontSize: '28px', fontWeight: 900, color: (acqFee - 695 + addonsCost + (mfMarkup ? 1800 : 0)) > 0 ? 'var(--accent)' : 'var(--text-main)' }}>
                    ${(acqFee - 695) + addonsCost + (mfMarkup ? 1800 : 0)}
                  </span>
                </div>

                {/* Glowing markup scale slider */}
                <div style={{ width: '100%', height: '6px', background: 'var(--border)', position: 'relative', marginTop: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    background: 'linear-gradient(to right, var(--accent), #ef4444)',
                    width: `${Math.min(100, ((acqFee - 695) + addonsCost + (mfMarkup ? 1800 : 0)) / 4800 * 100)}%`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              <div style={{
                background: 'var(--bg-hover)', border: '1px solid var(--border)',
                padding: '24px', textAlign: 'center', marginBottom: '32px'
              }}>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>
                  Potential Monthly Savings
                </div>
                <div style={{ fontSize: '36px', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                  ${(((acqFee - 695) + addonsCost + (mfMarkup ? 1800 : 0)) / 36).toFixed(2)}/mo
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  over 36-month lease duration
                </div>
              </div>

              <button className="btn hover-glow" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }} onClick={() => setShowAuth(true)}>
                Unlock Full Contract Scanner
              </button>
            </div>
          </div>
        </div>

        {/* Workflow Timeline */}
        <div className="landing-section">
          <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '40px', color: 'var(--text-muted)' }}>
            SYSTEM WORKFLOW //
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '40px' }}>
            <div className="step-glow-indicator" style={{ paddingLeft: '24px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent)', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ padding: '4px 8px', background: 'rgba(0, 245, 212, 0.1)', border: '1px solid rgba(0, 245, 212, 0.3)' }}>01</span>
                <span>UPLOAD DEAL DATA</span>
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Submit Quotations</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.7' }}>
                Drag and drop your dealer worksheets, lease rate sheets, or purchase proposals in PDF format.
              </p>
            </div>
            <div className="step-glow-indicator" style={{ paddingLeft: '24px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-dim)', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ padding: '4px 8px', background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>02</span>
                <span>VETOCAR SMART AUDIT</span>
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Detect Markup</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.7' }}>
                The diagnostic engine isolates hidden dealer markups on interest rate (money factor), calculates residual value accuracy, and flags add-on compliance.
              </p>
            </div>
            <div className="step-glow-indicator" style={{ paddingLeft: '24px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-dim)', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ padding: '4px 8px', background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>03</span>
                <span>LEVERAGE & COACHING</span>
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Generate Counter-Offers</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.7' }}>
                Receive customized, line-by-line objection talking scripts and professional counter-offer email templates to send straight to the sales manager.
              </p>
            </div>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="landing-section" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '40px', color: 'var(--text-muted)', textAlign: 'center', width: '100%' }}>
            FREQUENTLY ASKED QUESTIONS //
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px', width: '100%' }}>
            {[
              {
                q: "How does VetoCar detect hidden dealer markups?",
                a: "Car dealerships often quote interest rates as a tiny decimal called the 'Money Factor' (e.g., 0.0028). VetoCar automatically converts this decimal back into a traditional APR (6.72%), and checks it against the manufacturer's base rate. We also flag DMV/doc fees that exceed your state's legal limits."
              },
              {
                q: "What types of documents can VetoCar scan?",
                a: "You can upload draft dealer worksheets, quotation sheets, final lease agreements, or purchase proposals in PDF format. As long as it lists monthly payments, residual percentages, sales prices, and fees, VetoCar can extract and audit it."
              },
              {
                q: "Is my personal financial information secure?",
                a: "Absolutely. VetoCar audits the vehicle lease parameters, not your personal credit. Your uploaded documents are processed securely in memory buffers to generate calculations, and no personally identifiable credit data is stored."
              },
              {
                q: "Can I use this for purchase loans, or only leases?",
                a: "While our core analyzer specializes in complex auto lease calculations (such as residual values and acquisition fee inflation), the Negotiation Coach can help write emails and objections handling responses for standard finance loans and out-the-door purchase negotiations too!"
              },
              {
                q: "How does the Negotiation Coach work?",
                a: "Once you upload a contract, its parameters (like trim level, MSRP, monthly fee, and markups) are saved in memory. When you switch to the coach tab, the diagnostic engine uses that exact data to script professional objection emails and rebuttal arguments to counter the dealer's sales tactics."
              }
            ].map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  style={{
                    border: '1px solid var(--border)',
                    background: isOpen ? 'var(--bg-hover)' : 'var(--bg-surface)',
                    borderLeft: isOpen ? '3px solid var(--accent)' : '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    padding: '0',
                    marginBottom: '12px'
                  }}
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                >
                  <div style={{
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                  }}>
                    <span>{faq.q}</span>
                    <span style={{ color: 'var(--accent)', fontSize: '18px', fontFamily: 'monospace' }}>
                      {isOpen ? '—' : '+'}
                    </span>
                  </div>
                  {isOpen && (
                    <div style={{
                      padding: '0 24px 20px 24px',
                      fontSize: '13px',
                      lineHeight: '1.7',
                      color: 'var(--text-muted)',
                      borderTop: '1px solid rgba(255,255,255,0.02)',
                      paddingTop: '12px'
                    }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        color: 'var(--text-dim)',
        letterSpacing: '0.05em',
        background: 'var(--bg-sidebar)',
        zIndex: 10,
        height: '48px',
        flexShrink: 0
      }}>
        <span>© {new Date().getFullYear()} VETOCAR. DESIGN AND DEVELOPED BY ANUJ VISHWAKARMA.</span>
        <span>DESIGNED FOR AUTOMOTIVE INTELLIGENCE</span>
        </footer>
      </div>
    </div>
  );
};

export default PublicLanding;
