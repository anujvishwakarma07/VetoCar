import React, { useState } from 'react';
import { 
  Sparkles, FileText, ChevronDown, 
  ArrowRight, ShieldCheck, Database, 
  Search, MessageCircle, BarChart3, X, Play
} from 'lucide-react';
import AuthView from './AuthView.jsx';

import darkModeLogo from '../assets/darkModeTextual.png';
import darkModeSymbol from '../assets/darkModeSymbolic.png';

const PublicLanding = ({ setIsAuthenticated, setUser, theme }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  
  // Savings Simulator State
  const [msrp, setMsrp] = useState(3500000); // 35 Lakhs INR default
  
  // FAQ Toggles State
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Savings calculation helpers
  const calculateSavings = () => {
    const markupSaved = Math.round(msrp * 0.035); // 3.5% average markup
    const monthlySaved = Math.round(markupSaved / 36); // over 36 months lease
    return { markupSaved, monthlySaved };
  };

  const { markupSaved, monthlySaved } = calculateSavings();

  const faqs = [
    {
      question: "What is VetoCar and how does it help me?",
      answer: "VetoCar is an AI-powered automobile audit and negotiation assistant. When dealers draft lease quotes, they often inflate interest rates (money factors), markup acquisition costs, or slip in administrative fees. VetoCar parses these numbers in seconds, reports hidden markups, and drafts counter-offers to help you save."
    },
    {
      question: "How does the Lease Contract Analyzer work?",
      answer: "Simply upload a PDF of your dealer quote sheet or lease agreement. Our backend AI extracts values like MSRP, Capitalized Cost, Residual Value, and Money Factor. It compares them against market benchmarks, gives the deal a fairness score, and lists key red flags you can negotiate down."
    },
    {
      question: "Does it support Indian vehicle registrations and license plates?",
      answer: "Yes! VetoCar includes a premium VAHAN/Parivahan lookup engine. By entering any Indian vehicle number (e.g., DL3CA1234), you can fetch chassis details, registration dates, vehicle class, fitness records, and insurance coverage to verify car history instantly."
    },
    {
      question: "Do I need to sign up for a monthly subscription?",
      answer: "No. VetoCar uses a pay-as-you-go credit system because car buying is a one-time process for most users. You receive 1 free audit credit upon registration. If you want to audit additional offers or run more license plate lookups, you can purchase credit packs starting at ₹499."
    },
    {
      question: "How secure is my data?",
      answer: "We take privacy seriously. Your uploaded PDFs and decoded details are secured with bank-grade encryption in our database and are never shared with third parties or dealerships. You can delete any saved report from your history at any time."
    }
  ];

  const handleOpenAuth = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  // Explicit Stark Black & White styles
  const styles = {
    landingWrapper: {
      background: '#000000',
      color: '#ffffff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      position: 'relative',
      overflowX: 'hidden'
    },
    blueprintGrid: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px), 
                        linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)`,
      backgroundSize: '50px 50px',
      pointerEvents: 'none',
      zIndex: 1
    },
    radialGlow: {
      position: 'absolute',
      top: '20%',
      right: '-10%',
      width: '600px',
      height: '600px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 70%)',
      pointerEvents: 'none',
      zIndex: 1
    },
    header: {
      position: 'sticky',
      top: 0,
      zIndex: 99,
      background: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid #1a1a1e',
      padding: '0 40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '80px'
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    logoMark: {
      height: '32px',
      width: 'auto',
      objectFit: 'contain'
    },
    logoText: {
      height: '18px',
      width: 'auto',
      objectFit: 'contain'
    },
    navLinks: {
      display: 'flex',
      gap: '40px',
      fontSize: '11px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      fontFamily: "'Space Mono', monospace"
    },
    navLinkItem: {
      color: '#8e8e93',
      textDecoration: 'none',
      transition: 'color 0.15s ease'
    },
    heroSection: {
      position: 'relative',
      zIndex: 2,
      padding: '40px 40px',
      maxWidth: '1200px',
      width: '100%',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '64px',
      minHeight: 'calc(100vh - 80px)' 
    },
    heroLeft: {
      flex: '1 1 540px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      paddingRight: '20px'
    },
    heroRight: {
      flex: '1 1 440px',
      maxWidth: '540px',
      width: '100%',
      display: 'flex',
      justifyContent: 'center'
    },
    pillTag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 14px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid #1a1a1e',
      borderRadius: '0px',
      marginBottom: '28px',
      alignSelf: 'flex-start'
    },
    pillText: {
      fontSize: '10px',
      fontWeight: 800,
      fontFamily: "'Space Mono', monospace",
      color: '#ffffff',
      textTransform: 'uppercase',
      letterSpacing: '0.1em'
    },
    heroTitle: {
      fontSize: 'clamp(36px, 6vw, 64px)', 
      fontWeight: 800,
      lineHeight: 1.02,
      textTransform: 'uppercase',
      marginBottom: '28px',
      letterSpacing: '-0.03em',
      color: '#ffffff'
    },
    heroDescription: {
      color: '#8e8e93',
      fontSize: '15px',
      lineHeight: '1.8',
      marginBottom: '40px',
      maxWidth: '520px'
    },
    btnGroup: {
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap'
    },
    primaryBtn: {
      background: '#ffffff',
      color: '#000000',
      border: '1px solid #ffffff',
      borderRadius: '0px',
      padding: '16px 36px',
      fontWeight: 800,
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 20px rgba(255, 255, 255, 0.15)'
    },
    secondaryBtn: {
      background: 'transparent',
      color: '#ffffff',
      border: '1px solid #242428',
      borderRadius: '0px',
      padding: '16px 36px',
      fontWeight: 800,
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease'
    },
    glassCard: {
      background: 'rgba(10, 10, 12, 0.75)',
      backdropFilter: 'blur(16px)',
      border: '1px solid #1a1a1e',
      borderRadius: '0px',
      padding: '36px',
      width: '100%',
      boxShadow: '0 30px 60px rgba(0, 0, 0, 0.8)',
      position: 'relative'
    },
    sectionTitle: {
      fontSize: '11px',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      marginBottom: '48px',
      color: '#8e8e93',
      fontFamily: "'Space Mono', monospace",
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  };

  return (
    <div style={styles.landingWrapper}>
      {/* Decorative Grid & Glow layers */}
      <div style={styles.blueprintGrid}></div>
      <div style={styles.radialGlow}></div>
      
      {/* Stark Header */}
      <header style={styles.header}>
        <div style={styles.logoSection}>
          <img src={darkModeSymbol} alt="VetoCar Mark" style={styles.logoMark} />
          <img src={darkModeLogo} alt="VetoCar Logo" style={styles.logoText} />
        </div>

        <nav className="desktop-only" style={styles.navLinks}>
          <a href="#features" style={styles.navLinkItem} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#8e8e93'}>Features</a>
          <a href="#simulator" style={styles.navLinkItem} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#8e8e93'}>Savings Calculator</a>
          <a href="#pricing" style={styles.navLinkItem} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#8e8e93'}>Pricing</a>
          <a href="#faqs" style={styles.navLinkItem} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#8e8e93'}>FAQs</a>
        </nav>

        <div>
          <button 
            className="btn" 
            style={{ padding: '12px 28px', fontSize: '11px', borderRadius: '0px', background: '#ffffff', color: '#000000', border: '1px solid #ffffff', fontWeight: 800, letterSpacing: '0.1em' }} 
            onClick={() => handleOpenAuth('login')}
          >
            Enter Portal
          </button>
        </div>
      </header>

      {/* Main Sections */}
      <main style={{ flex: 1, position: 'relative', zIndex: 2 }}>

        {/* Dynamic Responsive Viewport-Adjusted Hero Section */}
        <section style={styles.heroSection}>
          <div style={styles.heroLeft}>
            <div style={styles.pillTag}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff', animation: 'pulse-dot 2s infinite' }}></div>
              <span style={styles.pillText}>AI LEASE AUDIT ENGINE //</span>
            </div>
            <h1 style={styles.heroTitle}>
              Decode Deals.<br />
              Negotiate Like<br />
              An Expert.
            </h1>
            <p style={styles.heroDescription}>
              Dealerships often inflate interest rates and hide markups. VetoCar's deep scanner analyzes draft lease sheets, calculates the true Money Factor margin, and builds custom objection scripts to drop your showroom payments.
            </p>
            <div style={styles.btnGroup}>
              <button 
                style={styles.primaryBtn} 
                onClick={() => handleOpenAuth('register')}
                onMouseEnter={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#ffffff'; e.target.style.boxShadow = 'none'; }}
                onMouseLeave={(e) => { e.target.style.background = '#ffffff'; e.target.style.color = '#000000'; e.target.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.15)'; }}
              >
                Create Account <ArrowRight size={16} />
              </button>
              <a 
                href="#simulator" 
                style={styles.secondaryBtn}
                onMouseEnter={(e) => { e.target.style.borderColor = '#ffffff'; }}
                onMouseLeave={(e) => { e.target.style.borderColor = '#242428'; }}
              >
                Calculate Savings
              </a>
            </div>
          </div>

          <div style={styles.heroRight}>
            <div style={styles.glassCard}>
              {/* Card Accent Lights */}
              <div style={{ position: 'absolute', top: 0, left: '20px', right: '20px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1a1a1e', paddingBottom: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffffff' }}></div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#48484a' }}></div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1a1a1e' }}></div>
                </div>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#8e8e93', letterSpacing: '0.05em' }}>AUDIT_REPORT_SYS_OK</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '28px' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '0px',
                  border: '1px solid #ef4444',
                  background: 'rgba(239, 68, 68, 0.05)',
                  color: '#ef4444',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '24px', fontFamily: "'Space Mono', monospace"
                }}>
                  48
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>Unfair Deal Index</h4>
                  <p style={{ fontSize: '11px', color: '#8e8e93', lineHeight: '1.4' }}>AI isolated rate markups totaling ₹84,200.</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #1a1a1e' }}>
                  <span style={{ color: '#8e8e93' }}>Dealer Money Factor Markup</span>
                  <span style={{ fontWeight: 700, color: '#ef4444', fontFamily: "'Space Mono', monospace" }}>+ 1.85% (Unfair)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #1a1a1e' }}>
                  <span style={{ color: '#8e8e93' }}>Residual Value Benchmark</span>
                  <span style={{ fontWeight: 700, color: '#10b981', fontFamily: "'Space Mono', monospace" }}>Match Verified</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #1a1a1e' }}>
                  <span style={{ color: '#8e8e93' }}>Documentation & Processing Fees</span>
                  <span style={{ fontWeight: 700, color: '#f59e0b', fontFamily: "'Space Mono', monospace" }}>₹12,500 (Inflated)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features list */}
        <section id="features" style={{ borderTop: '1px solid #1a1a1e', padding: '80px 40px', background: '#050507' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={styles.sectionTitle}>
              <Play size={10} style={{ fill: '#ffffff', color: '#ffffff' }} /> Stark Modules //
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <div style={styles.glassCard}>
                <div style={{ color: '#ffffff', marginBottom: '20px' }}><FileText size={32} /></div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>Lease Audit Scanner</h4>
                <p style={{ color: '#8e8e93', fontSize: '13px', lineHeight: '1.6' }}>Upload quotes. Extracts values, residual metrics, and alerts you to hidden dealer interest margin markups.</p>
              </div>

              <div style={styles.glassCard}>
                <div style={{ color: '#ffffff', marginBottom: '20px' }}><Search size={32} /></div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>VAHAN & VIN Lookup</h4>
                <p style={{ color: '#8e8e93', fontSize: '13px', lineHeight: '1.6' }}>Query Indian RC data or US license plates to retrieve chassis details, owner masks, and spec verify trims.</p>
              </div>

              <div style={styles.glassCard}>
                <div style={{ color: '#ffffff', marginBottom: '20px' }}><MessageCircle size={32} /></div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>Objection Handling Coach</h4>
                <p style={{ color: '#8e8e93', fontSize: '13px', lineHeight: '1.6' }}>Generates context-rich email objection handlers and dialogue scripts based on your specific document terms.</p>
              </div>

              <div style={styles.glassCard}>
                <div style={{ color: '#ffffff', marginBottom: '20px' }}><BarChart3 size={32} /></div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>Deal Comparer</h4>
                <p style={{ color: '#8e8e93', fontSize: '13px', lineHeight: '1.6' }}>Compare multiple lease quote sheets side-by-side to determine which showroom is offering the best rates.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Savings Simulator */}
        <section id="simulator" style={{ borderTop: '1px solid #1a1a1e', padding: '80px 40px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '-0.02em' }}>Estimate Your Savings</h2>
              <p style={{ color: '#8e8e93', fontSize: '11px', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Drag slider to adjust vehicle value
              </p>
            </div>

            <div style={styles.glassCard}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <span>Vehicle Valuation</span>
                    <span style={{ color: '#ffffff', fontFamily: "'Space Mono', monospace" }}>₹{msrp.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <input 
                    type="range" 
                    min="800000" 
                    max="9000000" 
                    step="50000" 
                    value={msrp} 
                    onChange={(e) => setMsrp(Number(e.target.value))}
                    style={{
                      width: '100%',
                      height: '4px',
                      background: '#1a1a1e',
                      outline: 'none',
                      accentColor: '#ffffff',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', borderTop: '1px solid #1a1a1e', paddingTop: '28px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Interest Markup Blocked</span>
                    <p style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>₹{markupSaved.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Reduction (Monthly)</span>
                    <p style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>- ₹{monthlySaved.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <button 
                  style={{ ...styles.primaryBtn, width: '100%', justifyContent: 'center' }} 
                  onClick={() => handleOpenAuth('register')}
                  onMouseEnter={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#ffffff'; e.target.style.boxShadow = 'none'; }}
                  onMouseLeave={(e) => { e.target.style.background = '#ffffff'; e.target.style.color = '#000000'; e.target.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.15)'; }}
                >
                  Save This Money Now <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" style={{ borderTop: '1px solid #1a1a1e', padding: '80px 40px', background: '#050507' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '-0.02em' }}>Stark Packages</h2>
              <p style={{ color: '#8e8e93', fontSize: '12px', fontFamily: "'Space Mono', monospace" }}>Pay-as-you-go credits. Audit only when you negotiate.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              
              <div style={styles.glassCard}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>10 Audit Credits</h3>
                <p style={{ color: '#8e8e93', fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>Perfect for comparing local dealer quotes.</p>
                <div style={{ margin: '16px 0' }}>
                  <span style={{ fontSize: '36px', fontWeight: 800 }}>₹499</span>
                  <span style={{ color: '#8e8e93', fontSize: '11px', marginLeft: '6px', fontFamily: "'Space Mono', monospace" }}>one-time</span>
                </div>
                <button 
                  style={{ ...styles.secondaryBtn, width: '100%', justifyContent: 'center' }} 
                  onClick={() => handleOpenAuth('login')}
                  onMouseEnter={(e) => { e.target.style.borderColor = '#ffffff'; }}
                  onMouseLeave={(e) => { e.target.style.borderColor = '#242428'; }}
                >
                  Acquire Pack
                </button>
              </div>

              <div style={{ ...styles.glassCard, border: '1px solid #ffffff' }}>
                <span style={{ position: 'absolute', top: '-10px', right: '20px', background: '#ffffff', color: '#000000', fontSize: '8px', fontWeight: 800, fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', padding: '2px 6px' }}>Recommended</span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>25 Audit Credits</h3>
                <p style={{ color: '#8e8e93', fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>Best for comprehensive shopping and license plate runs.</p>
                <div style={{ margin: '16px 0' }}>
                  <span style={{ fontSize: '36px', fontWeight: 800 }}>₹999</span>
                  <span style={{ color: '#8e8e93', fontSize: '11px', marginLeft: '6px', fontFamily: "'Space Mono', monospace" }}>one-time</span>
                </div>
                <button 
                  style={{ ...styles.primaryBtn, width: '100%', justifyContent: 'center' }} 
                  onClick={() => handleOpenAuth('login')}
                  onMouseEnter={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#ffffff'; e.target.style.boxShadow = 'none'; }}
                  onMouseLeave={(e) => { e.target.style.background = '#ffffff'; e.target.style.color = '#000000'; e.target.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.15)'; }}
                >
                  Acquire Pack
                </button>
              </div>

            </div>
          </div>
        </section>

        {/* FAQs */}
        <section id="faqs" style={{ borderTop: '1px solid #1a1a1e', padding: '80px 40px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, textTransform: 'uppercase', textAlign: 'center', marginBottom: '48px', letterSpacing: '-0.02em' }}>
              Frequently Answered Questions
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div key={index} style={{
                    border: '1px solid #1a1a1e',
                    borderRadius: '0px',
                    overflow: 'hidden',
                    background: 'rgba(10, 10, 12, 0.6)'
                  }}>
                    <button 
                      onClick={() => toggleFaq(index)}
                      style={{
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: '#ffffff'
                      }}
                    >
                      <span style={{ fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{faq.question}</span>
                      <ChevronDown size={18} style={{ 
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                        transition: 'transform 0.2s',
                        color: '#8e8e93'
                      }} />
                    </button>
                    
                    {isOpen && (
                      <div style={{
                        padding: '0 24px 20px 24px',
                        fontSize: '13px',
                        color: '#8e8e93',
                        lineHeight: '1.6',
                        borderTop: '1px solid #1a1a1e'
                      }}>
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="app-footer" style={{ padding: '64px 40px 24px 40px', background: '#050507', borderTop: '1px solid #1a1a1e' }}>
        <div className="footer-top">
          <div className="footer-brand-section">
            <div className="footer-brand">
              <Sparkles size={16} className="footer-brand-icon" style={{ color: '#ffffff' }} />
              <span className="footer-brand-title" style={{ color: '#ffffff' }}>VetoCar Audit Studio</span>
              <span className="footer-brand-version">v1.1.0</span>
            </div>
            <p className="footer-disclaimer">
              DISCLAIMER: VetoCar provides information parsing, score benchmarks, and negotiation assistance based on AI models. We do not provide binding legal or certified financial advice. Always review terms with a qualified finance advisor before executing automobile contracts.
            </p>
          </div>

          <div className="footer-links-grid">
            <div className="footer-links-col">
              <span className="footer-col-title">Portal APIs</span>
              <a href="#features" className="footer-link">Audits</a>
              <a href="#simulator" className="footer-link">Savings Calculator</a>
              <a href="#pricing" className="footer-link">Credits & Top Ups</a>
            </div>
            <div className="footer-links-col">
              <span className="footer-col-title">Documentation</span>
              <a href="#faqs" className="footer-link">Help Center</a>
              <a href="https://vahan.parivahan.gov.in" target="_blank" rel="noreferrer" className="footer-link">Parivahan Node</a>
              <a href="https://nhtsa.gov" target="_blank" rel="noreferrer" className="footer-link">NHTSA API</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-copyright">© {new Date().getFullYear()} VetoCar. All Rights Reserved.</span>
          <div className="status-indicator">
            <div className="status-dot" style={{ backgroundColor: '#ffffff', boxShadow: '0 0 8px #ffffff' }}></div>
            <span style={{ color: '#ffffff' }}>VetoCar Core Engine: Active</span>
          </div>
        </div>
      </footer>

      {/* ACCESS PORTAL GATEWAY MODAL OVERLAY */}
      {showAuthModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '440px' }}>
            <button 
              onClick={() => setShowAuthModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: '#8e8e93',
                cursor: 'pointer',
                zIndex: 10
              }}
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <AuthView 
              setIsAuthenticated={(val) => {
                setIsAuthenticated(val);
                setShowAuthModal(false);
              }} 
              setUser={(usr) => {
                setUser(usr);
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default PublicLanding;
