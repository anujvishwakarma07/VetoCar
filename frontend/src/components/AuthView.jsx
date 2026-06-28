import React, { useState } from 'react';
import { Sparkles, ShieldAlert, CheckCircle2 } from 'lucide-react';

const AuthView = ({ setIsAuthenticated, setUser }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (isRegister) {
      if (!email.trim()) {
        setError('Please provide a valid email address.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }
    }

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Access handshake failed.');
      }

      setLoading(false);

      if (isRegister) {
        setSuccess('Account created successfully! Access key registered.');
        setTimeout(() => {
          setIsRegister(false);
          setSuccess('');
          setUsername('');
          setPassword('');
          setConfirmPassword('');
          setEmail('');
        }, 1500);
      } else {
        // Save token to browser localStorage
        localStorage.setItem('token', data.token);

        if (setIsAuthenticated) setIsAuthenticated(true);
        if (setUser) setUser(data.user);
      }
    } catch (err) {
      console.error('Authentication Error:', err);
      setError(err.message || 'Gateway connection refused.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Sparkles size={24} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              CarLease AI
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>
            {isRegister ? 'Create Portal Account //' : 'Secure Access Gateway //'}
          </p>
        </div>

        {error && (
          <div className="badge badge-error" style={{ width: '100%', marginBottom: '24px', display: 'flex', gap: '8px', padding: '12px 16px', borderRadius: '0px' }}>
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="badge badge-success" style={{ width: '100%', marginBottom: '24px', display: 'flex', gap: '8px', padding: '12px 16px', borderRadius: '0px' }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
              Username
            </label>
            <input
              type="text"
              placeholder="e.g., dealbreaker07"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              style={{ width: '100%', background: 'var(--bg-surface)' }}
              required
            />
          </div>

          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g., customer@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ width: '100%', background: 'var(--bg-surface)' }}
                required={isRegister}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              style={{ width: '100%', background: 'var(--bg-surface)' }}
              required
            />
          </div>

          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                style={{ width: '100%', background: 'var(--bg-surface)' }}
                required={isRegister}
              />
            </div>
          )}

          <button 
            type="submit" 
            className="btn" 
            style={{ width: '100%', marginTop: '8px', justifyContent: 'center', height: '48px' }}
            disabled={loading}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="spinner" style={{ width: '16px', height: '16px', borderTopColor: 'var(--bg-main)' }}></div>
                <span>{isRegister ? 'PROBING CREDENTIALS...' : 'ESTABLISHING HANDSHAKE...'}</span>
              </div>
            ) : (
              <span>{isRegister ? 'CREATE ACCOUNT' : 'ENTER PORTAL'}</span>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setSuccess('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isRegister ? '// Return to Login Portal' : '// Request Access Key (Sign Up)'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthView;