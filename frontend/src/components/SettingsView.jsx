import React, { useState, useEffect } from 'react';
import { Shield, Key, Mail, User as UserIcon, Calendar, BarChart3, AlertCircle, CheckCircle, Edit3, Save, X, Coins } from 'lucide-react';

const SettingsView = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Navigation Tabs
  const [activeSubTab, setActiveSubTab] = useState('profile'); // 'profile' or 'security'

  // Profile Edit State
  const [editMode, setEditMode] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [updating, setUpdating] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : `http://${window.location.hostname}:8080/api`;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch user profile.');
        }

        setProfile(data);
        setEditUsername(data.user.username);
        setEditEmail(data.user.email);
      } catch (err) {
        console.error('Error fetching settings profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!editUsername.trim() || !editEmail.trim()) {
      setProfileError('Username and Email cannot be blank.');
      return;
    }

    setSavingProfile(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: editUsername.trim(), email: editEmail.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      setProfile(prev => ({
        ...prev,
        user: {
          ...prev.user,
          username: data.user.username,
          email: data.user.email
        }
      }));
      setProfileSuccess('Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      console.error('Update profile error:', err);
      setProfileError(err.message || 'Failed to save changes.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPassError('All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    setUpdating(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setPassSuccess('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Change password error:', err);
      setPassError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div className="spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flag-item" style={{ border: '1px solid var(--border)', borderRadius: '0px' }}>
        <AlertCircle size={20} />
        <span>Error loading settings: {error}</span>
      </div>
    );
  }

  const avatarLetter = profile?.user?.username ? profile.user.username.charAt(0).toUpperCase() : 'U';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', color: 'var(--text-main)' }}>
      {profile && (
        <>
          <div className="dash-welcome-banner" style={{ marginBottom: '32px', border: '1px solid var(--border)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '72px',
                height: '72px',
                border: '1px solid var(--accent)',
                background: 'rgba(0, 245, 212, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: 900,
                color: 'var(--accent)',
                fontFamily: 'var(--font-mono)'
              }}>
                {avatarLetter}
              </div>
              <div>
                <div className="dash-tag" style={{ display: 'inline-flex', marginBottom: '6px' }}>
                  <span className="dash-pulse-dot" />
                  <span>ACCESS LEVEL // PRO AUDITOR</span>
                </div>
                <h2 className="dash-header" style={{ fontSize: '24px', margin: 0, letterSpacing: '-0.02em' }}>
                  {profile.user.username.toUpperCase()}
                </h2>
                <p className="dash-subtitle" style={{ fontSize: '13px', marginTop: '4px' }}>
                  {profile.user.email}
                </p>
              </div>
            </div>
            
            <div className="dash-time-panel" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '24px', justifyContent: 'flex-end' }}>
                <div style={{ textAlign: 'right' }}>
                  <div className="dash-time-label">CREDIT BALANCE //</div>
                  <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 800, fontSize: '18px', marginTop: '4px' }}>{profile.user.credits ?? 0} CREDITS</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="dash-time-label">AUDITS PERFORMED //</div>
                  <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)', fontWeight: 800, fontSize: '18px', marginTop: '4px' }}>{profile.stats.contractAudited ?? 0} DOCUMENTS</div>
                </div>
              </div>
            </div>
          </div>

          <div className="dash-metrics-grid" style={{ marginBottom: '32px' }}>
            <div className="dash-metric-card" style={{ borderRadius: '0px' }}>
              <div className="dash-metric-header">
                <span className="dash-metric-title">SYSTEM STATUS</span>
                <Shield size={16} className="dash-metric-icon" style={{ color: 'var(--accent)' }} />
              </div>
              <div className="dash-metric-value" style={{ color: 'var(--success)', fontSize: '20px', fontWeight: 800 }}>ACTIVE // ONLINE</div>
              <div className="dash-metric-footer">
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>SECURE TERMINAL GATEWAY</span>
              </div>
            </div>

            <div className="dash-metric-card" style={{ borderRadius: '0px' }}>
              <div className="dash-metric-header">
                <span className="dash-metric-title">TOTAL AUDITED CONTRACTS</span>
                <BarChart3 size={16} className="dash-metric-icon" />
              </div>
              <div className="dash-metric-value">{profile.stats.contractAudited || 0}</div>
              <div className="dash-metric-footer">
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>SYNCHRONIZED AUDIT DECKS</span>
              </div>
            </div>

            <div className="dash-metric-card" style={{ borderRadius: '0px' }}>
              <div className="dash-metric-header">
                <span className="dash-metric-title">REGISTRATION DATE</span>
                <Calendar size={16} className="dash-metric-icon" />
              </div>
              <div className="dash-metric-value" style={{ fontSize: '20px', fontWeight: 800 }}>{new Date(profile.user.createdAt).toLocaleDateString().toUpperCase()}</div>
              <div className="dash-metric-footer">
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>DATABASE CREATION ENTRY</span>
              </div>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            borderBottom: '1px solid var(--border)', 
            marginBottom: '32px',
            gap: '8px'
          }}>
            <button
              onClick={() => setActiveSubTab('profile')}
              style={{
                background: activeSubTab === 'profile' ? 'var(--bg-hover)' : 'none',
                border: 'none',
                borderBottom: activeSubTab === 'profile' ? '2px solid var(--accent)' : '2px solid transparent',
                color: activeSubTab === 'profile' ? 'var(--text-main)' : 'var(--text-muted)',
                padding: '12px 20px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                transition: 'var(--transition)'
              }}
            >
              [ 01 // PROFILE & DATA ]
            </button>
            <button
              onClick={() => setActiveSubTab('security')}
              style={{
                background: activeSubTab === 'security' ? 'var(--bg-hover)' : 'none',
                border: 'none',
                borderBottom: activeSubTab === 'security' ? '2px solid var(--accent)' : '2px solid transparent',
                color: activeSubTab === 'security' ? 'var(--text-main)' : 'var(--text-muted)',
                padding: '12px 20px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                transition: 'var(--transition)'
              }}
            >
              [ 02 // SECURITY CONFIG ]
            </button>
          </div>

          {/* Tab 1: Profile & Details */}
          {activeSubTab === 'profile' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
              
              {/* Profile Details Edit Card */}
              <div className="card" style={{ padding: '24px', borderRadius: '0px', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '12px', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)' }}>
                    <UserIcon size={14} style={{ color: 'var(--accent)' }} />
                    Personal Information
                  </h3>
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      style={{
                        background: 'none',
                        border: '1px solid var(--border)',
                        color: 'var(--text-main)',
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        padding: '4px 12px',
                        borderRadius: '0px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 800,
                        transition: 'var(--transition)'
                      }}
                    >
                      <Edit3 size={11} />
                      <span>EDIT INFO</span>
                    </button>
                  )}
                </div>

                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.05em' }}>
                      Account Username //
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      disabled={!editMode || savingProfile}
                      style={{
                        background: editMode ? 'var(--bg-main)' : 'var(--bg-hover)',
                        border: '1px solid var(--border)',
                        borderRadius: '0px',
                        opacity: editMode ? 1 : 0.8
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.05em' }}>
                      Primary Email Address //
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      disabled={!editMode || savingProfile}
                      style={{
                        background: editMode ? 'var(--bg-main)' : 'var(--bg-hover)',
                        border: '1px solid var(--border)',
                        borderRadius: '0px',
                        opacity: editMode ? 1 : 0.8
                      }}
                    />
                  </div>

                  {editMode && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button
                        type="submit"
                        className="btn"
                        style={{ flex: 1, height: '38px', borderRadius: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        disabled={savingProfile}
                      >
                        {savingProfile ? (
                          <div className="spinner" style={{ width: '12px', height: '12px' }}></div>
                        ) : (
                          <Save size={14} />
                        )}
                        <span>Save Changes</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditMode(false);
                          setEditUsername(profile.user.username);
                          setEditEmail(profile.user.email);
                          setProfileError('');
                        }}
                        style={{
                          background: 'none',
                          border: '1px solid var(--border)',
                          color: 'var(--text-main)',
                          padding: '0 16px',
                          borderRadius: '0px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)'
                        }}
                        disabled={savingProfile}
                      >
                        <X size={14} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}

                  {profileError && (
                    <div className="flag-item" style={{ marginTop: '8px', border: '1px solid var(--border)', borderRadius: '0px' }}>
                      <AlertCircle size={18} />
                      <span>{profileError}</span>
                    </div>
                  )}

                  {profileSuccess && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--success)', background: 'var(--success-bg)', padding: '10px 14px', borderRadius: '0px', border: '1px solid var(--success)', fontSize: '12px', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
                      <CheckCircle size={16} />
                      <span>{profileSuccess.toUpperCase()}</span>
                    </div>
                  )}
                </form>
              </div>

              {/* Account Analytics & Info Card */}
              <div className="card" style={{ padding: '24px', borderRadius: '0px', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 800, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)' }}>
                  <Shield size={14} style={{ color: 'var(--accent)' }} />
                  System Membership Info
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Member Status</span>
                    <strong style={{ color: 'var(--success)' }}>Active (Online)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Credits Remaining</span>
                    <strong style={{ color: 'var(--accent)' }}>{profile.user.credits ?? 0} Credits</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Registration Date</span>
                    <strong>{new Date(profile.user.createdAt).toLocaleDateString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Membership Tier</span>
                    <strong style={{ color: 'var(--accent)' }}>PRO AUDITOR</strong>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Tab 2: Security Settings */}
          {activeSubTab === 'security' && (
            <div style={{ maxWidth: '500px' }}>
              <div className="card" style={{ padding: '24px', borderRadius: '0px', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 800, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)' }}>
                  <Key size={14} style={{ color: 'var(--accent)' }} />
                  Update Security Credentials
                </h3>

                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.05em' }}>
                      Current Password //
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter current password..."
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      disabled={updating}
                      style={{ borderRadius: '0px', background: 'var(--bg-main)', border: '1px solid var(--border)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.05em' }}>
                      New Password //
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter new password (min. 6 chars)..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={updating}
                      style={{ borderRadius: '0px', background: 'var(--bg-main)', border: '1px solid var(--border)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.05em' }}>
                      Confirm New Password //
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Confirm new password..."
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={updating}
                      style={{ borderRadius: '0px', background: 'var(--bg-main)', border: '1px solid var(--border)' }}
                    />
                  </div>

                  {passError && (
                    <div className="flag-item" style={{ marginTop: '8px', border: '1px solid var(--border)', borderRadius: '0px' }}>
                      <AlertCircle size={18} />
                      <span>{passError}</span>
                    </div>
                  )}

                  {passSuccess && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--success)', background: 'var(--success-bg)', padding: '10px 14px', borderRadius: '0px', border: '1px solid var(--success)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                      <CheckCircle size={16} />
                      <span>{passSuccess.toUpperCase()}</span>
                    </div>
                  )}

                  <button type="submit" className="btn" style={{ marginTop: '10px', justifyContent: 'center', borderRadius: '0px' }} disabled={updating}>
                    {updating ? <><div className="spinner" style={{ width: '12px', height: '12px' }}></div> Saving...</> : 'Save Password'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SettingsView;
