import React from 'react';
import { FileSearch, Car, MessageSquare, ArrowRight } from 'lucide-react';

const DashboardView = ({ setActiveTab }) => {
  return (
    <div>
      <div className="home-split-grid">
        {/* Left Side: Bold Hero Presentation */}
        <div>
          <h1 className="home-hero-header">
            DECODE DEALS.<br />
            NEGOTIATE LIKE<br />
            AN EXPERT.
          </h1>
          
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.7', marginBottom: '32px', maxWidth: '480px' }}>
            VetoCar extracts terms, isolates hidden dealer fees, and gives you exact, tailored conversation scripts to drop your monthly lease payments.
          </p>

          <div className="home-hero-buttons">
            <button className="btn" onClick={() => setActiveTab('analyzer')}>
              Analyze Contract
            </button>
            <button 
              className="btn" 
              style={{ backgroundColor: 'transparent', color: 'var(--primary)', borderColor: 'var(--border)' }}
              onClick={() => setActiveTab('coach')}
            >
              Consult Coach
            </button>
          </div>
        </div>

        {/* Right Side: Architectural Action List */}
        <div className="feature-action-panel">
          <div className="feature-action-card" onClick={() => setActiveTab('analyzer')}>
            <span className="feature-action-num">01 //</span>
            <div>
              <h3 className="feature-action-title">Lease Contract Analyzer</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.5' }}>
                Upload quotation sheets or draft lease contracts. Isolate interest markups, check residual calculations, and find hidden administrative add-ons.
              </p>
            </div>
          </div>

          <div className="feature-action-card" onClick={() => setActiveTab('vin')}>
            <span className="feature-action-num">02 //</span>
            <div>
              <h3 className="feature-action-title">VIN Lookup Engine</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.5' }}>
                Retrieve manufacturing specs and body details directly from the public NHTSA database to verify trim options and base values.
              </p>
            </div>
          </div>

          <div className="feature-action-card" onClick={() => setActiveTab('coach')}>
            <span className="feature-action-num">03 //</span>
            <div>
              <h3 className="feature-action-title">AI Negotiation Coach</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.5' }}>
                Generate specific objection-handling responses, counter-offer letters, or custom emails to send to dealership sales managers.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ margin: '64px 0 32px 0', borderTop: '1px solid var(--border)', paddingTop: '32px' }}>
        <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '24px', color: 'var(--text-muted)' }}>
          System Workflow //
        </h3>
        <div className="home-workflow-grid">
          <div style={{ borderLeft: '2px solid var(--primary)', paddingLeft: '16px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Upload Data</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Import draft sales quotes or finance agreements in PDF format.</p>
          </div>
          <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '16px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Audit Parameters</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Gemini scans for rate markups, incorrect residual values, and dealer add-ons.</p>
          </div>
          <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '16px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Obtain Counter-Offers</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Generate professional counter-offers to negotiate payments directly with the dealer.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
