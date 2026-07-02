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
