import React from 'react';
import {
  LayoutDashboard,
  FileSearch,
  Car,
  MessageSquare,
  LogOut,
  Sun,
  Moon,
  GitCompare,
  Settings,
  Coins,
} from 'lucide-react';

import darkModeLogo from '../assets/darkModeTextual.png';
import lightModeLogo from '../assets/LightModeTextual.png';
import darkModeSymbol from '../assets/darkModeSymbolic.png';
import lightModeSymbol from '../assets/lightModeSybolic.png';

const Sidebar = ({ activeTab, setActiveTab, setIsAuthenticated, setUser, user, theme, toggleTheme, isAuthenticated, isOpen, setIsOpen, credits }) => {
  const handleSignOut = () => {
    if (setIsAuthenticated) setIsAuthenticated(false);
    if (setUser) setUser(null);
    localStorage.removeItem('token');
    if (setIsOpen) setIsOpen(false);
  };

  const handleItemClick = (tab) => {
    setActiveTab(tab);
    if (setIsOpen) {
      setIsOpen(false);
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Logo */}
      <div 
        className="sidebar-logo" 
        onClick={() => setActiveTab('dashboard')}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
      >
        <img 
          src={theme === 'dark' ? darkModeSymbol : lightModeSymbol} 
          alt="VetoCar Mark" 
          style={{ height: '35px', width: 'auto', objectFit: 'contain' }} 
        />
        <img 
          src={theme === 'dark' ? darkModeLogo : lightModeLogo} 
          alt="VetoCar Logo" 
          style={{ height: '20px', width: 'auto', objectFit: 'contain' }} 
        />
      </div>

      {/* Mobile Drawer Quick Stats Bar */}
      <div className="sidebar-mobile-stats" style={{
        display: 'none', // Overridden to flex on mobile via CSS
        flexWrap: 'wrap',
        gap: '8px',
        padding: '0 20px 20px 20px',
        borderBottom: '1px solid var(--border)',
        marginBottom: '20px'
      }}>
        {/* Credits Pill */}
        <div 
          onClick={() => handleItemClick('buy_credits')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            background: 'rgba(255, 255, 255, 0.01)',
            cursor: 'pointer',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            color: 'var(--accent)',
          }}
        >
          <Coins size={12} />
          <span>{credits} CREDITS</span>
        </div>

        {/* Profile Pill */}
        <div 
          onClick={() => handleItemClick('settings')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            background: 'rgba(255, 255, 255, 0.01)',
            cursor: 'pointer',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            color: 'var(--text-main)',
          }}
        >
          <div style={{
            width: '14px',
            height: '14px',
            backgroundColor: 'rgba(0, 245, 212, 0.1)',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '9px',
            fontWeight: 800,
            borderRadius: '2px'
          }}>
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <span>{user?.username ? user.username.toUpperCase() : 'USER'}</span>
        </div>

        {/* Theme Toggle Pill */}
        <div 
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            background: 'rgba(255, 255, 255, 0.01)',
            cursor: 'pointer',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            color: 'var(--text-main)',
          }}
        >
          {theme === 'dark' ? <Sun size={12} style={{ color: 'var(--accent)' }} /> : <Moon size={12} />}
          <span>THEME</span>
        </div>
      </div>

      {/* Menu Options */}
      <div className="sidebar-menu">
        <div
          className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleItemClick('dashboard')}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </div>

        <div
          className={`sidebar-item ${activeTab === 'analyzer' ? 'active' : ''}`}
          onClick={() => handleItemClick('analyzer')}
        >
          <FileSearch size={20} />
          <span>Contract Analyzer</span>
        </div>

        <div
          className={`sidebar-item ${activeTab === 'vin' ? 'active' : ''}`}
          onClick={() => handleItemClick('vin')}
        >
          <Car size={20} />
          <span>VIN Lookup</span>
        </div>

        <div
          className={`sidebar-item ${activeTab === 'coach' ? 'active' : ''}`}
          onClick={() => handleItemClick('coach')}
        >
          <MessageSquare size={20} />
          <span>Negotiation Coach</span>
        </div>

        <div
          className={`sidebar-item ${activeTab === 'compare' ? 'active' : ''}`}
          onClick={() => handleItemClick('compare')}
        >
          <GitCompare size={20} />
          <span>Compare Deals</span>
        </div>

        <div
          className={`sidebar-item ${activeTab === 'buy_credits' ? 'active' : ''}`}
          onClick={() => handleItemClick('buy_credits')}
        >
          <Coins size={20} />
          <span>Buy Credits</span>
        </div>

        {isAuthenticated && (
          <div
            className="sidebar-item"
            onClick={handleSignOut}
            style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', color: 'var(--text-dim)' }}
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
