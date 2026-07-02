import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:8080/api';

const FeedbackWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('feedback');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Continuously expand and contract the button every 8 seconds to attract attention
    const interval = setInterval(() => {
      setIsExpanded(prev => !prev);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!message.trim() || message.trim().length < 5) {
      setError('Message must be at least 5 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          type,
          message: message.trim(),
          page: window.location.pathname + window.location.hash
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit feedback');

      setSuccess(true);
      setMessage('');
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
      }, 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button - Match VetoCar Floating Style (Auto-expanding animation) */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          zIndex: 999,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: isExpanded ? '26px' : '50%',
          width: isExpanded ? '180px' : '52px',
          height: '52px',
          padding: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          color: 'var(--text-main)',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.06em',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          transition: 'all 0.6s cubic-bezier(0.19, 1, 0.22, 1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.color = 'var(--accent)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--text-main)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', flexShrink: 0 }}>
          <MessageSquare size={18} style={{ stroke: 'var(--accent)' }} />
        </div>
        <span style={{
          opacity: isExpanded ? 1 : 0,
          visibility: isExpanded ? 'visible' : 'hidden',
          whiteSpace: 'nowrap',
          transition: 'opacity 0.4s ease 0.2s',
          marginRight: '16px'
        }}>
          SUPPORT &amp; QUERY
        </span>
      </button>

      {/* Center Modal with Backdrop Blur */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          animation: 'fadeIn 0.25s ease'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(0, 245, 212, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'system-ui, sans-serif'
          }}>
            {/* Header */}
            <div style={{
              padding: '24px 28px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.01)'
            }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  color: 'var(--accent)',
                  letterSpacing: '0.12em',
                  marginBottom: '4px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }} />
                  SUPPORT TICKET CENTER
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                  SUBMIT <span style={{ color: 'var(--accent)' }}>QUERY</span>
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content area */}
            {success ? (
              <div style={{
                padding: '48px 32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: '16px'
              }}>
                <CheckCircle size={48} color="var(--accent)" />
                <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  TICKET RECEIVED SUCCESSFULLY
                </h4>
                <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '12px', lineHeight: '1.6' }}>
                  Your support inquiry has been logged. Our administration team will review your query in the control deck.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: '6px', fontWeight: 700, letterSpacing: '0.08em' }}>
                      YOUR NAME
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      required
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        background: 'var(--bg-main)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        padding: '10px 12px',
                        color: 'var(--text-main)',
                        fontSize: '12px',
                        fontFamily: 'var(--font-mono)',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: '6px', fontWeight: 700, letterSpacing: '0.08em' }}>
                      EMAIL (OPTIONAL)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        background: 'var(--bg-main)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        padding: '10px 12px',
                        color: 'var(--text-main)',
                        fontSize: '12px',
                        fontFamily: 'var(--font-mono)',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.08em' }}>
                    TICKET TYPE
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['bug', 'feedback', 'query'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        style={{
                          flex: 1,
                          padding: '9px 0',
                          background: type === t ? 'rgba(0, 245, 212, 0.08)' : 'var(--bg-main)',
                          border: type === t ? '1px solid var(--accent)' : '1px solid var(--border)',
                          borderRadius: '4px',
                          color: type === t ? 'var(--accent)' : 'var(--text-muted)',
                          fontSize: '10px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: '6px', fontWeight: 700, letterSpacing: '0.08em' }}>
                    TICKET DETAILS
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about your query or bug..."
                    required
                    rows={4}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'var(--bg-main)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      padding: '12px',
                      color: 'var(--text-main)',
                      fontSize: '12px',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'inherit',
                      lineHeight: '1.5',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>

                {error && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(230, 57, 70, 0.08)',
                    border: '1px solid rgba(230, 57, 70, 0.2)',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    color: '#e63946',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: 'none',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      color: 'var(--text-dim)',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-main)';
                      e.currentTarget.style.borderColor = 'var(--text-muted)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-dim)';
                      e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                  >
                    DISMISS
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 2,
                      padding: '12px',
                      background: loading ? 'rgba(0, 245, 212, 0.2)' : 'var(--accent)',
                      border: 'none',
                      borderRadius: '4px',
                      color: '#000',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'background 0.2s'
                    }}
                  >
                    <Send size={13} />
                    {loading ? 'TRANSMITTING...' : 'SUBMIT TICKET'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackWidget;
