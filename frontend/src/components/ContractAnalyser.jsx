import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, CheckCircle2, ShieldAlert, Trash2, 
  Download, Eye, X, ClipboardCheck, MessageSquare 
} from 'lucide-react';

const ContractAnalyzer = ({ contractResult, setContractResult, setChatMessages, setActiveTab, userCredits, setCredits }) => {
  const [contractFile, setContractFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [history, setHistory] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : `http://${window.location.hostname}:8080/api`;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_URL}/contracts`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        }
      } catch (error) {
        console.error('Failed to load history : ', error);
      }
    };
    fetchHistory();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this contract?')) return;

    try {
      const res = await fetch(`${API_URL}/contracts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (res.ok) {
        setHistory(prev => prev.filter(c => c._id !== id));
        if (contractResult && contractResult._id === id) {
          setContractResult(null);
        }
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to delete contract');
      }
    } catch (error) {
      console.error('Delete error', error);
      alert('Something went wrong during deletion.');
    }
  };

  const handleExportPDF = () => {
    setShowPreviewModal(true);
  };

  const triggerPdfDownload = () => {
    const element = document.getElementById('pdf-render-target');
    if (!element) return;

    setExporting(true);

    const runHtml2Pdf = () => {
      const opt = {
        margin: 0,
        filename: `VetoCar_Audit_${contractResult.fileName.replace('.pdf', '')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      window.html2pdf()
        .from(element)
        .set(opt)
        .save()
        .then(() => {
          setExporting(false);
          setShowPreviewModal(false);
        })
        .catch((err) => {
          console.error("PDF generation failed:", err);
          setExporting(false);
        });
    };

    if (!window.html2pdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.crossOrigin = 'anonymous';
      script.onload = runHtml2Pdf;
      document.body.appendChild(script);
    } else {
      runHtml2Pdf();
    }
  };

  // Score styling helpers
  const getScoreClass = (score) => {
    if (!score && score !== 0) return 'avg';
    if (score >= 75) return 'good';
    if (score >= 50) return 'avg';
    return 'bad';
  };

  const getScoreBadge = (score) => {
    if (!score && score !== 0) return <span className="badge badge-warning">Medium</span>;
    if (score >= 75) return <span className="badge badge-success">Fair Deal</span>;
    if (score >= 50) return <span className="badge badge-warning">Caution</span>;
    return <span className="badge badge-danger">Unfair Deal</span>;
  };

  // Drag and drop event handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragover" || e.type === "dragenter") {
      setDragging(true);
    } else if (e.type === "dragleave") {
      setDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setContractFile(file);
        setUploadError('');
      } else {
        setUploadError('Only PDF files are supported.');
      }
    }
  };

  const selectFile = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setContractFile(e.target.files[0]);
      setUploadError('');
    }
  };

  const handleAnalyze = async () => {
    if (!contractFile) return;

    if (userCredits !== undefined && userCredits < 15) {
      alert(`Insufficient credits. Analyzing a contract requires 15 credits, but you only have ${userCredits}. Redirecting to purchase credits.`);
      setActiveTab('buy_credits');
      return;
    }

    setAnalyzing(true);
    setUploadError('');
    setContractResult(null);

    const formData = new FormData();
    formData.append('contract', contractFile);

    try {
      const response = await fetch(`${API_URL}/contracts/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402 || data.code === 'INSUFFICIENT_CREDITS') {
          if (setCredits) setCredits(0);
          alert("Insufficient credits. Redirecting to top-up packages.");
          setActiveTab('buy_credits');
          return;
        }
        throw new Error(data.error || 'Failed to analyze contract');
      }

      setContractResult(data);
      setHistory(prev => [data, ...prev]);
      if (setCredits) {
        setCredits(prev => Math.max(0, prev - 15));
      }

      if (setChatMessages) {
        const vehicleName = [data.analysis.year, data.analysis.make, data.analysis.model].filter(Boolean).join(' ') || 'vehicle';
        setChatMessages(prev => [
          ...prev,
          { role: 'bot', text: `Yeah, I have got access for the contract of ${vehicleName}. Ask me anything about this offer!` }
        ]);
      }

    } catch (err) {
      console.error('Error uploading contract:', err);
      setUploadError(err.message || 'Something went wrong during analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div>
      <div className="view-header">
        <div className="dash-tag" style={{ marginBottom: '10px' }}>
          <span className="dash-pulse-dot" />
          <span>CONTRACT AUDIT DECK</span>
        </div>
        <h1 className="view-title">Contract Analyzer</h1>
        <p className="view-subtitle">Upload your draft contract to review lease parameters and find hidden costs.</p>
      </div>

      {/* Upload Box */}
      <div className="card">
        <div
          className={`drop-zone ${dragging ? 'dragging' : ''}`}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={selectFile}
        >
          <UploadCloud className="drop-zone-icon" size={48} />
          {contractFile ? (
            <div>
              <p style={{ fontWeight: 600 }}>{contractFile.name}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                {(contractFile.size / 1024 / 1024).toFixed(2)} MB - Click to replace
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontWeight: 600 }}>Drag & Drop your Lease/Loan PDF here</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>or click to browse files</p>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            style={{ display: 'none' }}
          />
        </div>

        {uploadError && <p style={{ color: 'var(--danger)', marginTop: '12px' }}>{uploadError}</p>}

        {contractFile && (
          <button
            className="btn"
            onClick={handleAnalyze}
            disabled={analyzing}
            style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}
          >
            {analyzing ? (
              <>
                <div className="spinner"></div> Running Gemini Analysis...
              </>
            ) : (
              'Analyze Contract'
            )}
          </button>
        )}
      </div>

      {/* Saved Contracts History List */}
      {history.length > 0 && (
        <div className="card" style={{ marginTop: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: 600 }}>
            Saved Contracts History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {history.map((c) => (
              <div
                key={c._id}
                onClick={() => {
                  if (contractResult && contractResult._id === c._id) {
                    setContractResult(null);
                  } else {
                    setContractResult(c);
                    if (setChatMessages) {
                      const vehicleName = [c.analysis.year, c.analysis.make, c.analysis.model].filter(Boolean).join(' ') || 'vehicle';
                      setChatMessages([
                        { role: 'bot', text: `Yeah, I have got access for the contract of ${vehicleName}. Ask me anything about this offer!` }
                      ]);
                    }
                  }
                }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-hover)',
                  border: contractResult && contractResult._id === c._id ? '1px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: contractResult && contractResult._id === c._id ? '0 0 8px rgba(0, 245, 212, 0.15)' : 'none',
                }}
              >
                <div style={{ flex: 1, minWidth: 0, marginRight: '12px' }}>
                  <p style={{ 
                    fontWeight: 600, 
                    fontSize: '13px', 
                    marginBottom: '2px',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                  }} title={c.fileName}>
                    {c.fileName}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Analyzed on: {new Date(c.uploadedAt || c.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`badge ${c.analysis.fairnessScore >= 75 ? 'badge-success' : c.analysis.fairnessScore >= 50 ? 'badge-warning' : 'badge-danger'
                    }`}>
                    Score: {c.analysis.fairnessScore}
                  </span>
                  <button
                    onClick={(e) => handleDelete(c._id, e)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--danger)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Results Display */}
      {contractResult && (
        <div style={{ marginTop: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Analysis Report</h2>
            <div className="report-action-buttons" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                className="btn"
                onClick={() => setActiveTab('coach')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '8px 16px',
                  background: 'rgba(0, 245, 212, 0.08)',
                  border: '1px solid rgba(0, 245, 212, 0.3)',
                  color: 'var(--accent)'
                }}
              >
                <MessageSquare size={16} />
                <span>Discuss with Coach</span>
              </button>
              <button 
                className="btn" 
                onClick={handleExportPDF} 
                disabled={exporting}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
              >
                <Eye size={16} />
                <span>Preview & Download PDF</span>
              </button>
            </div>
          </div>

          <div id="analysis-report-container" style={{ padding: '8px' }}>
            <div className="analysis-grid">

              {/* Left Card: Score and Red Flags */}
              <div className="card">
                <h3 style={{ marginBottom: '20px' }}>Deal Fairness & Assessment</h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                  <div className="score-radial-progress">
                    <div className={`score-progress-label ${getScoreClass(contractResult.analysis.fairnessScore)}`}>
                      {contractResult.analysis.fairnessScore ?? 'N/A'}
                    </div>
                  </div>
                  <div>
                    <h4 style={{ marginBottom: '4px', fontSize: '15px', fontWeight: 800 }}>FAIRNESS SCORE</h4>
                    <div style={{ marginBottom: '8px' }}>{getScoreBadge(contractResult.analysis.fairnessScore)}</div>
                    <div className="verified-stamp-badge">
                      <ClipboardCheck size={12} style={{ color: 'var(--accent)' }} /> 
                      <span>AUDIT PASS // SECURE</span>
                    </div>
                  </div>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
                  {contractResult.analysis.fairnessExplanation}
                </p>

                <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
                  <ShieldAlert size={20} style={{ color: 'var(--danger)' }} />
                  RED FLAGS & WARNINGS
                </h4>
                {contractResult.analysis.redFlags && contractResult.analysis.redFlags.length > 0 ? (
                  <ul style={{ paddingLeft: '0', listStyle: 'none', color: 'var(--text-muted)' }}>
                    {contractResult.analysis.redFlags.map((flag, idx) => (
                      <li key={idx} style={{ 
                        display: 'flex', gap: '8px', alignItems: 'flex-start',
                        marginBottom: '10px', color: 'var(--danger)', fontSize: '13px', lineHeight: '1.5'
                      }}>
                        <ShieldAlert size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--success)', background: 'rgba(16,185,129,0.08)', padding: '12px 16px', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <CheckCircle2 size={16} />
                    <span style={{ fontSize: '13px' }}>No major hidden fees or warning clauses detected.</span>
                  </div>
                )}

                <button
                  className="btn"
                  onClick={() => setActiveTab('coach')}
                  style={{
                    marginTop: '24px',
                    width: '100%',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'var(--accent-gradient)',
                    border: 'none',
                    color: '#0c1017',
                    fontWeight: 700
                  }}
                >
                  <MessageSquare size={16} />
                  <span>Start Coach Negotiation</span>
                </button>
              </div>

              {/* Right Card: Parameter List */}
              <div className="card">
                <h3 style={{ marginBottom: '20px' }}>Extracted Offer Terms</h3>
                <table className="parameters-table">
                  <tbody>
                    <tr>
                      <td className="parameter-label">Contract Type</td>
                      <td className="parameter-value">{contractResult.analysis.contractType || 'Unknown'}</td>
                    </tr>
                    <tr>
                      <td className="parameter-label">Interest Rate / APR</td>
                      <td className="parameter-value">{contractResult.analysis.interestRateOrAPR ? `${contractResult.analysis.interestRateOrAPR}%` : 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="parameter-label">Lease Duration</td>
                      <td className="parameter-value">{contractResult.analysis.leaseTermMonths ? `${contractResult.analysis.leaseTermMonths} Months` : 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="parameter-label">Monthly Payment</td>
                      <td className="parameter-value" style={{ fontWeight: 800, color: 'var(--text-main)' }}>{contractResult.analysis.monthlyPayment ? `$${contractResult.analysis.monthlyPayment}` : 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="parameter-label">Down Payment</td>
                      <td className="parameter-value">{contractResult.analysis.downPayment ? `$${contractResult.analysis.downPayment}` : 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="parameter-label">Residual Value</td>
                      <td className="parameter-value">{contractResult.analysis.residualValue ? `$${contractResult.analysis.residualValue}` : 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="parameter-label">Yearly Mileage Limit</td>
                      <td className="parameter-value">{contractResult.analysis.mileageAllowanceYearly ? `${contractResult.analysis.mileageAllowanceYearly.toLocaleString()} mi` : 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="parameter-label">Mileage Overage Fee</td>
                      <td className="parameter-value">{contractResult.analysis.mileageOverageFeePerMile ? `$${contractResult.analysis.mileageOverageFeePerMile}/mi` : 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="parameter-label">Disposition Fee</td>
                      <td className="parameter-value">{contractResult.analysis.dispositionFee ? `$${contractResult.analysis.dispositionFee}` : 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>

                {contractResult.analysis.maintenanceResponsibility && (
                  <div style={{ marginTop: '20px', padding: '12px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}><strong>Maintenance:</strong> {contractResult.analysis.maintenanceResponsibility}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Slide-Over PDF Report Preview Modal ── */}
      {showPreviewModal && contractResult && (
        <div className="pdf-preview-backdrop">
          <div className="pdf-preview-modal">
            <div className="pdf-preview-header">
              <h3 className="pdf-preview-title">PDF REPORT PRINT PREVIEW // SECURE DECK</h3>
              <div className="pdf-preview-actions">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowPreviewModal(false)}
                  style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <X size={14} /> Close
                </button>
                <button 
                  className="btn" 
                  onClick={triggerPdfDownload} 
                  disabled={exporting}
                  style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', minWidth: '170px', justifyContent: 'center' }}
                >
                  {exporting ? (
                    <>
                      <div className="spinner" style={{ width: '12px', height: '12px', marginRight: '6px' }} />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download size={14} /> Confirm & Download PDF
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="pdf-preview-body">
              {/* Print Target (Standard A4 dimensions) */}
              <div id="pdf-render-target" className="pdf-paper-sheet">
                {/* Header */}
                <div className="pdf-cert-header">
                  <div className="pdf-cert-logo-area">
                    <div style={{ background: '#0c1017', color: '#00f5d4', padding: '10px 12px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontWeight: 900, fontFamily: 'monospace', fontSize: '18px', letterSpacing: '0.05em' }}>VC</span>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0c1017', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1.2' }}>VetoCar Audit Systems</h2>
                      <p style={{ fontSize: '9px', color: '#64748b', margin: 0, fontWeight: 700, letterSpacing: '0.05em' }}>AUTOMOTIVE CONTRACT DIAGNOSTICS</p>
                    </div>
                  </div>
                  
                  <div className="pdf-cert-title-block">
                    <h1 className="pdf-cert-title-large">LEASE AUDIT REPORT</h1>
                    <p className="pdf-cert-subtitle">VERIFIED PARAMETER ANALYSIS</p>
                  </div>
                </div>

                {/* Audit Metadata */}
                <div className="pdf-cert-meta-grid">
                  <div className="pdf-meta-item" style={{ textAlign: 'left' }}>
                    <span className="pdf-meta-label">DOCUMENT AUDITED</span>
                    <span className="pdf-meta-val" style={{ fontSize: '10px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{contractResult.fileName}</span>
                  </div>
                  <div className="pdf-meta-item" style={{ textAlign: 'left' }}>
                    <span className="pdf-meta-label">VERIFICATION HASH</span>
                    <span className="pdf-meta-val">VC-{(contractResult._id || 'demo').substring(0, 10).toUpperCase()}</span>
                  </div>
                  <div className="pdf-meta-item" style={{ textAlign: 'left' }}>
                    <span className="pdf-meta-label">AUDIT TIMESTAMP</span>
                    <span className="pdf-meta-val">{new Date(contractResult.uploadedAt || contractResult.createdAt || Date.now()).toLocaleDateString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Split Main Section */}
                <div className="pdf-cert-main-split">
                  {/* Score card */}
                  <div className={`pdf-cert-score-box ${contractResult.analysis.fairnessScore >= 75 ? '' : contractResult.analysis.fairnessScore >= 50 ? 'alert' : 'danger'}`}>
                    <div className={`pdf-cert-score-circle ${contractResult.analysis.fairnessScore >= 75 ? '' : contractResult.analysis.fairnessScore >= 50 ? 'alert' : 'danger'}`}>
                      {contractResult.analysis.fairnessScore ?? 'N/A'}
                    </div>
                    <div className="pdf-cert-score-label" style={{ color: contractResult.analysis.fairnessScore >= 75 ? '#10b981' : contractResult.analysis.fairnessScore >= 50 ? '#f59e0b' : '#ef4444' }}>
                      {contractResult.analysis.fairnessScore >= 75 ? 'FAIR DEAL' : contractResult.analysis.fairnessScore >= 50 ? 'CAUTION ADVISED' : 'UNFAIR DEAL'}
                    </div>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '12px 0 0 0', lineHeight: '1.5', textAlign: 'center' }}>
                      {contractResult.analysis.fairnessExplanation}
                    </p>
                  </div>

                  {/* Extracted Terms card */}
                  <div className="pdf-cert-terms-card" style={{ textAlign: 'left' }}>
                    <h3 className="pdf-cert-terms-title">EXTRACTED LEASE TERMS</h3>
                    <table className="pdf-table">
                      <tbody>
                        <tr>
                          <td className="pdf-table-label">Contract Type</td>
                          <td className="pdf-table-val">{contractResult.analysis.contractType || 'Unknown'}</td>
                        </tr>
                        <tr>
                          <td className="pdf-table-label">Interest Rate / APR</td>
                          <td className="pdf-table-val">{contractResult.analysis.interestRateOrAPR ? `${contractResult.analysis.interestRateOrAPR}%` : 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="pdf-table-label">Lease Duration</td>
                          <td className="pdf-table-val">{contractResult.analysis.leaseTermMonths ? `${contractResult.analysis.leaseTermMonths} Months` : 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="pdf-table-label">Monthly Payment</td>
                          <td className="pdf-table-val" style={{ fontWeight: 800 }}>{contractResult.analysis.monthlyPayment ? `$${contractResult.analysis.monthlyPayment}` : 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="pdf-table-label">Down Payment</td>
                          <td className="pdf-table-val">{contractResult.analysis.downPayment ? `$${contractResult.analysis.downPayment}` : 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="pdf-table-label">Residual Value</td>
                          <td className="pdf-table-val">{contractResult.analysis.residualValue ? `$${contractResult.analysis.residualValue}` : 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="pdf-table-label">Yearly Mileage Limit</td>
                          <td className="pdf-table-val">{contractResult.analysis.mileageAllowanceYearly ? `${contractResult.analysis.mileageAllowanceYearly.toLocaleString()} mi` : 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="pdf-table-label">Mileage Overage Fee</td>
                          <td className="pdf-table-val">{contractResult.analysis.mileageOverageFeePerMile ? `$${contractResult.analysis.mileageOverageFeePerMile}/mi` : 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="pdf-table-label">Disposition Fee</td>
                          <td className="pdf-table-val">{contractResult.analysis.dispositionFee ? `$${contractResult.analysis.dispositionFee}` : 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Warnings and Red flags card */}
                <div className={`pdf-cert-warning-card ${contractResult.analysis.redFlags?.length > 0 ? '' : 'clean'}`} style={{ textAlign: 'left' }}>
                  <h3 className={`pdf-cert-warning-title ${contractResult.analysis.redFlags?.length > 0 ? '' : 'clean'}`}>
                    {contractResult.analysis.redFlags?.length > 0 ? '⚠️ DETECTED WARNING CLAUSES & DEALER MARKUPS' : '✅ CONTRACT HEALTH VERIFIED'}
                  </h3>
                  {contractResult.analysis.redFlags && contractResult.analysis.redFlags.length > 0 ? (
                    <ul className="pdf-cert-warning-list">
                      {contractResult.analysis.redFlags.map((flag, idx) => (
                        <li key={idx} style={{ marginBottom: '6px' }}>{flag}</li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ margin: 0, fontSize: '12px', color: '#166534' }}>
                      No hidden markup fees, excessive document charges, or unauthorized aftermarket warranty upgrades were detected on this contract sheet.
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="pdf-cert-footer">
                  <div className="pdf-cert-disclaimer" style={{ textAlign: 'left' }}>
                    <strong>LEGAL DISCLAIMER:</strong> This report is a digital audit generated by VetoCar's contract diagnostic engine. Calculations are estimates based on standard retail vehicle banking criteria. This report is for negotiation and informational purposes and does not constitute formal legal counsel.
                  </div>
                  <div className="pdf-cert-stamp-area">
                    <div className="pdf-digital-stamp">VC VERIFIED AUDIT</div>
                    <div style={{ fontSize: '7px', color: '#94a3b8' }}>SYSTEM ENGINE MODEL: VETOCAR-DEC-2.5</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractAnalyzer;
