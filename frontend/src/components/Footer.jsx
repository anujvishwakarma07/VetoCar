import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import darkModeLogo from '../assets/darkModeTextual.png';
import lightModeLogo from '../assets/LightModeTextual.png';
import darkModeSymbol from '../assets/darkModeSymbolic.png';
import lightModeSymbol from '../assets/lightModeSybolic.png';

const Footer = ({ theme, setActiveTab }) => {
  return (
    <footer className="app-footer">
      <div className="footer-top">
        <div className="footer-brand-section">
          <div className="footer-brand" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <img 
              src={theme === 'dark' ? darkModeSymbol : lightModeSymbol} 
              alt="VetoCar Mark" 
              style={{ height: '28px', objectFit: 'contain' }} 
            />
            <img 
              src={theme === 'dark' ? darkModeLogo : lightModeLogo} 
              alt="VetoCar Logo" 
              style={{ height: '18px', objectFit: 'contain' }} 
            />
            <span className="footer-brand-version">// SYS_VER.1.0.4</span>
          </div>
          <p className="footer-disclaimer">
            ADVISORY NOTICE: ALL INTEREST RATE CALCULATIONS, FEE AUDITS, AND NEGOTIATION SCRIPTS ARE PROVIDED FOR INFORMATIONAL AND EDUCATIONAL PURPOSES ONLY. ALWAYS VERIFY FINANCIAL MATH WITH A CERTIFIED PROFESSIONAL OR ACCOUNTANT BEFORE SIGNING.
          </p>
        </div>

        <div className="footer-links-grid">
          <div className="footer-links-col">
            <span className="footer-col-title">INTEGRATIONS</span>
            <a href="https://www.nhtsa.gov/" target="_blank" rel="noopener noreferrer" className="footer-link">
              NHTSA API <ArrowUpRight size={10} />
            </a>
            <a href="https://vpic.nhtsa.dot.gov/api/" target="_blank" rel="noopener noreferrer" className="footer-link">
              VPIC VPIC <ArrowUpRight size={10} />
            </a>
          </div>

          <div className="footer-links-col">
            <span className="footer-col-title">APP NAVIGATION</span>
            {setActiveTab ? (
              <>
                <span onClick={() => setActiveTab('dashboard')} className="footer-link" style={{ cursor: 'pointer' }}>
                  DASHBOARD <ArrowUpRight size={10} />
                </span>
                <span onClick={() => setActiveTab('analyzer')} className="footer-link" style={{ cursor: 'pointer' }}>
                  CONTRACT ANALYZER <ArrowUpRight size={10} />
                </span>
                <span onClick={() => setActiveTab('vin')} className="footer-link" style={{ cursor: 'pointer' }}>
                  VIN LOOKUP <ArrowUpRight size={10} />
                </span>
                <span onClick={() => setActiveTab('coach')} className="footer-link" style={{ cursor: 'pointer' }}>
                  NEGOTIATION COACH <ArrowUpRight size={10} />
                </span>
              </>
            ) : (
              <>
                <span className="footer-link">DASHBOARD <ArrowUpRight size={10} /></span>
                <span className="footer-link">CONTRACT ANALYZER <ArrowUpRight size={10} /></span>
                <span className="footer-link">VIN LOOKUP <ArrowUpRight size={10} /></span>
                <span className="footer-link">NEGOTIATION COACH <ArrowUpRight size={10} /></span>
              </>
            )}
          </div>

          <div className="footer-links-col">
            <span className="footer-col-title">SYSTEM STATUS</span>
            <div className="status-indicator">
              <span className="status-dot"></span>
              <span className="status-text">CORE SERVICE: ONLINE</span>
            </div>
            <div className="status-detail">ENG: VETOCAR CORE V1</div>
            <div className="status-detail">LATENCY: &lt;140ms</div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span className="footer-copyright">
          © {new Date().getFullYear()} VETOCAR. DESIGN AND DEVELOPED BY ANUJ VISHWAKARMA.
        </span>
        <span className="footer-design-tag">
          SECURE AUTOMOTIVE AUDITING
        </span>
      </div>
    </footer>
  );
};

export default Footer;
