import React, { useState, useEffect } from 'react';
import { 
  FileSearch, Car, MessageSquare, ArrowRight, 
  DollarSign, AlertTriangle, ShieldCheck 
} from 'lucide-react';

const DashboardView = ({ setActiveTab, user, setContractResult, setChatMessages }) => {
  const [contracts, setContracts] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeString, setTimeString] = useState('');

  const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : `http://${window.location.hostname}:8080/api`;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleString('en-US', { 
        hour12: false, 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch contracts list
        const contractsRes = await fetch(`${API_URL}/contracts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        let contractsList = [];
        if (contractsRes.ok) {
          contractsList = await contractsRes.json();
          setContracts(contractsList);
        }

        // Fetch user profile details
        const profileRes = await fetch(`${API_URL}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setProfileData(profile);
        }
      } catch (err) {
        console.error("Dashboard statistics loading failed:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  // Utility to clean up and capitalize model filenames
  const getVehicleLabel = (contract) => {
    if (contract.analysis?.vehicleName) return contract.analysis.vehicleName;
    let label = contract.fileName
      .replace(/\.[^/.]+$/, "") // remove extension
      .replace(/[-_]/g, " ")
      .trim();
    return label.replace(/\b\w/g, c => c.toUpperCase());
  };

  // Utility to calculate actual savings from red flags
  const calculatePotentialSavings = (contractsList) => {
    let total = 0;
    contractsList.forEach(c => {
      const flags = c.analysis?.redFlags || [];
      flags.forEach(flag => {
        const matches = flag.match(/\$\d{1,3}(,\d{3})*(\.\d{2})?/g);
        if (matches) {
          matches.forEach(m => {
            const val = parseFloat(m.replace(/[$,]/g, ''));
            if (!isNaN(val)) total += val;
          });
        }
      });
    });
    // Fallback estimate if we have flagged markups but no clear parsed numbers
    if (total === 0 && contractsList.length > 0) {
      let flagsCount = 0;
      contractsList.forEach(c => {
        flagsCount += (c.analysis?.redFlags?.length || 0);
      });
      total = flagsCount * 450;
    }
    return total;
  };

  const handleNegotiateClick = (contract) => {
    if (setContractResult) {
      setContractResult(contract);
    }
    if (setChatMessages) {
      const vehicleName = [contract.analysis.year, contract.analysis.make, contract.analysis.model].filter(Boolean).join(' ') || 'vehicle';
      setChatMessages([
        { role: 'bot', text: `Yeah, I have got access for the contract of ${vehicleName}. Ask me anything about this offer!` }
      ]);
    }
    setActiveTab('coach');
  };

  const totalSavings = calculatePotentialSavings(contracts);
  const totalAudits = contracts.length;
  const credits = profileData?.user?.credits ?? 1; // default to 1 if profile fails
  const creditFillPct = Math.min(100, Math.max(0, (credits / 15) * 100));
  const activeScriptsCount = contracts.filter(c => (c.analysis?.redFlags?.length || 0) > 0).length;
  
  const latestContract = contracts[0];

  return (
    <div className="dash-container">
      {/* 1. High Tech Welcome Banner */}
      <div className="dash-welcome-banner">
        <div>
          <div className="dash-tag">
            <span className="dash-pulse-dot" />
            <span>SESSION_STATUS // SECURE ACCESS GRANTED</span>
          </div>
          <h1 className="dash-header">
            WELCOME BACK, <span className="dash-accent-name">{profileData?.user?.username?.toUpperCase() || user?.username?.toUpperCase() || 'AGENT'}</span>
          </h1>
          <p className="dash-subtitle">
            Your lease diagnostic deck is synchronized. Upload and review contracts to negotiate like a professional.
          </p>
        </div>
        <div className="dash-time-panel">
          <div className="dash-time-label">LOCAL SYSTEM INDEX:</div>
          <div className="dash-time-val">{timeString || 'SYNCHRONIZING...'}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
          <div className="spinner" style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>FETCHING DATABASE RECORD ENTRIES...</span>
        </div>
      ) : (
        <>
          {/* 2. Key Metrics Grid */}
          <div className="dash-metrics-grid">
            <div className="dash-metric-card">
              <div className="dash-metric-header">
                <span className="dash-metric-title">CONTRACTS AUDITED</span>
                <FileSearch size={16} className="dash-metric-icon" />
              </div>
              <div className="dash-metric-value">{totalAudits}</div>
              <div className="dash-metric-footer">
                <span className="dash-trend positive">
                  {totalAudits > 0 ? `+${totalAudits} stored in profile` : 'No audits yet'}
                </span>
              </div>
            </div>

            <div className="dash-metric-card">
              <div className="dash-metric-header">
                <span className="dash-metric-title">POTENTIAL SAVINGS</span>
                <DollarSign size={16} className="dash-metric-icon" style={{ color: 'var(--accent)' }} />
              </div>
              <div className="dash-metric-value text-accent">
                ${totalSavings.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </div>
              <div className="dash-metric-footer">
                <span className="dash-trend alert">
                  {contracts.reduce((acc, curr) => acc + (curr.analysis?.redFlags?.length || 0), 0)} MARKUPS FLAGGED
                </span>
              </div>
            </div>

            <div className="dash-metric-card">
              <div className="dash-metric-header">
                <span className="dash-metric-title">VIN ENGINE LOOKUPS</span>
                <Car size={16} className="dash-metric-icon" />
              </div>
              <div className="dash-metric-value">{profileData?.stats?.vinLookups || 0}</div>
              <div className="dash-metric-footer">
                <span className="dash-trend positive">
                  {profileData?.stats?.vinLookups > 0 ? `+${profileData.stats.vinLookups} decodes completed` : 'No lookup history'}
                </span>
              </div>
            </div>

            <div className="dash-metric-card">
              <div className="dash-metric-header">
                <span className="dash-metric-title">COACHING SCRIPTS</span>
                <MessageSquare size={16} className="dash-metric-icon" />
              </div>
              <div className="dash-metric-value">{activeScriptsCount}</div>
              <div className="dash-metric-footer">
                <span className="dash-trend positive">
                  {activeScriptsCount > 0 ? 'COACH ACTIVE' : 'NO SCRIPTS YET'}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Main Dashboard Body: Recent Audits & Terminal Monitor */}
          <div className="dash-main-split">
            {/* Left: Recent Audits Table */}
            <div className="dash-panel-card">
              <div className="dash-panel-header">
                <h3 className="dash-panel-title">RECENT CONTRACT AUDITS</h3>
                <span className="dash-panel-badge">{totalAudits} ITEMS</span>
              </div>
              
              <div className="dash-table-wrapper">
                {contracts.length > 0 ? (
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>VEHICLE MODEL</th>
                        <th>DATE REVIEWED</th>
                        <th>AUDIT STATUS</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contracts.slice(0, 5).map((contract) => {
                        const redFlagsCount = contract.analysis?.redFlags?.length || 0;
                        const hasRedFlags = redFlagsCount > 0;
                        const dateReviewed = new Date(contract.uploadedAt || contract.createdAt || Date.now()).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        });

                        return (
                          <tr key={contract._id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Car size={14} style={{ color: hasRedFlags ? 'var(--accent)' : 'var(--text-muted)' }} />
                                <span style={{ fontWeight: 700 }}>{getVehicleLabel(contract)}</span>
                              </div>
                            </td>
                            <td>{dateReviewed}</td>
                            <td>
                              {hasRedFlags ? (
                                <span className="dash-status-badge alert">
                                  <AlertTriangle size={10} />
                                  <span>{redFlagsCount} {redFlagsCount === 1 ? 'MARKUP' : 'MARKUPS'} FLAGGED</span>
                                </span>
                              ) : (
                                <span className="dash-status-badge success">
                                  <ShieldCheck size={10} />
                                  <span>CLEAN CONTRACT</span>
                                </span>
                              )}
                            </td>
                            <td>
                              <button className="dash-action-link" onClick={() => handleNegotiateClick(contract)}>
                                Negotiate <ArrowRight size={10} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px', lineHeight: '1.6' }}>
                    <AlertTriangle size={24} style={{ color: 'var(--text-dim)', marginBottom: '12px' }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>NO AUDIT RECORDS FOUND</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                      Upload a dealer worksheet or quote PDF in the Analyzer tab to begin.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Live Monitor Terminal */}
            <div className="dash-panel-card dash-terminal-panel">
              <div className="dash-panel-header">
                <h3 className="dash-panel-title">SYSTEM MONITOR FEED</h3>
                <span className="dash-panel-pulse-tag">LIVE</span>
              </div>

              <div className="dash-terminal">
                {latestContract ? (
                  <>
                    <div className="dash-term-line font-mono"><span className="term-cyan">[SECURE CORE DEPLOYED]</span> - 100% Ready</div>
                    <div className="dash-term-line font-mono"><span className="term-cyan">[AUDIT ENGINE]</span> - Parsing: {latestContract.fileName} ({Math.round(latestContract.fileSize / 1024)} KB)</div>
                    <div className="dash-term-line font-mono"><span className="term-green">[INTELLIGENCE]</span> - Fairness Score of {latestContract.analysis?.fairnessScore || 0}/100 calculated</div>
                    <div className="dash-term-line font-mono"><span className="term-yellow">[RED FLAGS]</span> - {latestContract.analysis?.redFlags?.length || 0} dealer items flagged</div>
                    <div className="dash-term-line font-mono"><span className="term-cyan">[SESSION LOG]</span> - Handshake valid for {profileData?.user?.username || user?.username}</div>
                    <div className="dash-term-line font-mono cursor-blink"><span className="term-cyan">[SYSTEM]</span> - Ready to negotiate. Navigate to coach tab to generate scripts.</div>
                  </>
                ) : (
                  <>
                    <div className="dash-term-line font-mono"><span className="term-cyan">[SECURE CORE DEPLOYED]</span> - 100% Ready</div>
                    <div className="dash-term-line font-mono"><span className="term-cyan">[NHTSA VEHICLE DATABASE]</span> - Connected</div>
                    <div className="dash-term-line font-mono"><span className="term-cyan">[NEGOTIATION RULES ENGINE]</span> - v1.02 Active</div>
                    <div className="dash-term-line font-mono"><span className="term-yellow">[AUDIT_ENGINE]</span> - Buffer clean. Waiting for contract upload...</div>
                    <div className="dash-term-line font-mono cursor-blink"><span className="term-cyan">[SYSTEM]</span> - Standby mode.</div>
                  </>
                )}
              </div>

              <div className="dash-quick-buttons">
                <button className="btn btn-sm" onClick={() => setActiveTab('analyzer')} style={{ flex: 1, fontSize: '11px', textTransform: 'uppercase', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <FileSearch size={12} /> Scan Lease
                </button>
                <button className="btn btn-sm" onClick={() => setActiveTab('vin')} style={{ flex: 1, fontSize: '11px', textTransform: 'uppercase', padding: '12px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Car size={12} /> Verify VIN
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 4. Capabilities Bento Grid */}
      <div className="dash-capabilities-header">
        <h3 className="dash-capabilities-title">CAPABILITY DECKS</h3>
      </div>
      
      <div className="dash-capabilities-grid">
        <div className="dash-cap-card" onClick={() => setActiveTab('analyzer')}>
          <div className="dash-cap-icon-box">
            <FileSearch size={20} />
          </div>
          <h4 className="dash-cap-name">CONTRACT ANALYZER</h4>
          <p className="dash-cap-desc">
            Upload Quotation Sheets, dealer sheets, or finance agreements to verify interest rates (Money Factor) and detect hidden fee markups.
          </p>
          <span className="dash-cap-link">Launch Deck <ArrowRight size={12} /></span>
        </div>

        <div className="dash-cap-card" onClick={() => setActiveTab('vin')}>
          <div className="dash-cap-icon-box">
            <Car size={20} />
          </div>
          <h4 className="dash-cap-name">VIN SPEC DECODER</h4>
          <p className="dash-cap-desc">
            Decode standard build specifications directly from public manufacturer safety databases to audit model trim baselines.
          </p>
          <span className="dash-cap-link">Launch Deck <ArrowRight size={12} /></span>
        </div>

        <div className="dash-cap-card" onClick={() => setActiveTab('coach')}>
          <div className="dash-cap-icon-box">
            <MessageSquare size={20} />
          </div>
          <h4 className="dash-cap-name">NEGOTIATION COACH</h4>
          <p className="dash-cap-desc">
            Generate custom dealer counter-offer script objections and professional emails straight to sales managers based on your uploaded quotes.
          </p>
          <span className="dash-cap-link">Launch Deck <ArrowRight size={12} /></span>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
