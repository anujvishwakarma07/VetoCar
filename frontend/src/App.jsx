import { useState, useEffect } from 'react';
import { Sparkles, Sun, Moon, Menu, X, Settings, Coins } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import DashboardView from './components/DashboardView.jsx';
import ContractAnalyser from './components/ContractAnalyser.jsx';
import VinLookup from './components/VinLookup.jsx';
import NegotiationCoach from './components/NegotiationCoach.jsx';
import Footer from './components/Footer.jsx';
import AuthView from './components/AuthView.jsx';
import OfferComparision from './components/OfferComparision.jsx';
import SettingsView from './components/SettingsView.jsx';
import BuyCredits from './components/BuyCredits.jsx';
import PublicLanding from './components/PublicLanding.jsx';
import { Agentation } from 'agentation';

import darkModeLogo from './assets/darkModeTextual.png';
import lightModeLogo from './assets/LightModeTextual.png';
import darkModeSymbol from './assets/darkModeSymbolic.png';
import lightModeSymbol from './assets/lightModeSybolic.png';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Theme state persisted in localStorage
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  const [contractResult, setContractResult] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);

  // Sync user credits on mount / tab swaps
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUserCredits = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const res = await fetch(`${API_URL}/api/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCredits(data.user.credits || 0);
        }
      } catch (err) {
        console.error('Failed to load user credits:', err);
      }
    };
    fetchUserCredits();
  }, [isAuthenticated, activeTab]);

  // Auto-restore session from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ username: payload.username, id: payload.id });
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Session restore failed:', err);
        localStorage.removeItem('token');
      }
    }
  }, []);

  // Preload logos
  useEffect(() => {
    const logos = [darkModeLogo, lightModeLogo, darkModeSymbol, lightModeSymbol];
    logos.forEach((logoSrc) => {
      const img = new Image();
      img.src = logoSrc;
    });
  }, []);

  // Chat memory state
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'bot',
      text: 'Hello! I am your AI Car Negotiation Coach.\n\nI can help you review dealer pricing sheets, draft professional emails to salespeople, or advice you on specific terms like acquisition fees, doc fees, and money factors.\n\nIf you have uploaded a contract in the Contract Analyzer tab, I will automatically use its numbers to give you custom negotiation counter-offers!'
    }
  ]);
  const [chatHistory, setChatHistory] = useState([]);

  // Scroll to top of the content container on tab switches
  useEffect(() => {
    window.scrollTo(0, 0);
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
  }, [activeTab]);

  // Auto-redirect to home dashboard upon login success
  useEffect(() => {
    if (isAuthenticated) {
      setActiveTab('dashboard');
    }
  }, [isAuthenticated]);

  // Show public landing page for unauthenticated users (no sidebar, no protected features)
  if (!isAuthenticated) {
    return (
      <>
        <Agentation />
        <PublicLanding
          setIsAuthenticated={setIsAuthenticated}
          setUser={setUser}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      </>
    );
  }

  return (
    <>
      <Agentation />
      <div className="dashboard-layout">
        {/* Backdrop overlay for mobile drawer */}
        {isSidebarOpen && (
          <div 
            className="sidebar-backdrop"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="mobile-header">
          <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              marginRight: '8px'
            }}
            aria-label="Toggle navigation menu"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <img 
              src={theme === 'dark' ? darkModeSymbol : lightModeSymbol} 
              alt="VetoCar Mark" 
              style={{ height: '25px', objectFit: 'contain' }} 
            />
            <img 
              src={theme === 'dark' ? darkModeLogo : lightModeLogo} 
              alt="VetoCar Logo" 
              style={{ height: '18px', objectFit: 'contain' }} 
            />
          </div>
          <button
            onClick={toggleTheme}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px'
            }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setIsAuthenticated={setIsAuthenticated}
          setUser={setUser}
          theme={theme}
          toggleTheme={toggleTheme}
          isAuthenticated={isAuthenticated}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          credits={credits}
        />

        <div className="content-pane" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <div className="desktop-header" style={{
            height: '64px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 80px',
            background: 'var(--bg-surface)',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                VetoCar System Control v1.2
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div 
                onClick={() => setActiveTab('buy_credits')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  border: '1px solid var(--border)',
                  background: 'rgba(255, 255, 255, 0.01)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: 'var(--accent)',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                title="Purchase or view audit credits"
              >
                <Coins size={12} style={{ color: 'var(--accent)' }} />
                <span>{credits} AUDIT CREDITS</span>
              </div>

              <button
                onClick={() => setActiveTab('settings')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 8px',
                  transition: 'var(--transition)'
                }}
                title="Account Profile Settings"
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  border: activeTab === 'settings' ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: activeTab === 'settings' ? 'rgba(0, 245, 212, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  color: activeTab === 'settings' ? 'var(--accent)' : 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  transition: 'all 0.15s'
                }}>
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{ 
                  fontSize: '11px', 
                  fontFamily: 'var(--font-mono)', 
                  fontWeight: 800, 
                  color: activeTab === 'settings' ? 'var(--accent)' : 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {user?.username ? user.username.toUpperCase() : 'PROFILE'}
                </span>
              </button>

              <button
                onClick={toggleTheme}
                style={{
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 14px',
                  gap: '8px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  transition: 'var(--transition)'
                }}
                title="Toggle visual theme"
              >
                {theme === 'dark' ? <Sun size={13} style={{ color: 'var(--accent)' }} /> : <Moon size={13} />}
                <span>THEME</span>
              </button>
            </div>
          </div>

          <div className="main-content" style={activeTab === 'coach' ? { overflow: 'hidden', padding: '32px 80px 16px 80px', height: '100%' } : { overflowY: 'auto' }}>
            {activeTab === 'dashboard' && (
              <DashboardView 
                setActiveTab={setActiveTab} 
                user={user} 
                theme={theme} 
                setContractResult={setContractResult} 
              />
            )}

            {activeTab === 'analyzer' && (
              isAuthenticated ? (
                <ContractAnalyser
                  contractResult={contractResult}
                  setContractResult={setContractResult}
                  setChatMessages={setChatMessages}
                  setActiveTab={setActiveTab}
                  userCredits={credits}
                  setCredits={setCredits}
                />
              ) : (
                <AuthView setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
              )
            )}

            {activeTab === 'vin' && (
              isAuthenticated ? (
                <VinLookup
                  userCredits={credits}
                  setCredits={setCredits}
                  setActiveTab={setActiveTab}
                />
              ) : (
                <AuthView setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
              )
            )}

            {activeTab === 'coach' && (
              isAuthenticated ? (
                <NegotiationCoach
                  contractResult={contractResult}
                  chatMessages={chatMessages}
                  setChatMessages={setChatMessages}
                  chatHistory={chatHistory}
                  setChatHistory={setChatHistory}
                  userCredits={credits}
                  setCredits={setCredits}
                  setActiveTab={setActiveTab}
                />
              ) : (
                <AuthView setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
              )
            )}

            {activeTab === 'compare' && (
              isAuthenticated ? (
                <OfferComparision />
              ) : (
                <AuthView setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
              )
            )}
            {activeTab === 'settings' && (
              isAuthenticated ? (
                <SettingsView />
              ) : (
                <AuthView setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
              )
            )}
            {activeTab === 'buy_credits' && (
              isAuthenticated ? (
                <BuyCredits onPaymentSuccess={(newBalance) => setCredits(newBalance)} />
              ) : (
                <AuthView setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
              )
            )}
            <Footer theme={theme} setActiveTab={setActiveTab} />
          </div>
        </div>
      </div>
    </>
  );

}

export default App;
