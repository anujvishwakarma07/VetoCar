import { AlertCircle, CheckCircle, Scale, ShieldAlert, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react'

const OfferComparision = () => {
    const [contract, setContract] = useState([]);
    const [dealAId, setDealAId] = useState('');
    const [dealBId, setDealBId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [uploadingA, setUploadingA] = useState(false);
    const [uploadingB, setUploadingB] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8080`;

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleUploadDirect = async (e, target) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];
        
        if (file.type !== "application/pdf") {
            setUploadError('Only PDF files are supported for upload.');
            return;
        }

        setUploadError('');
        if (target === 'A') setUploadingA(true);
        else setUploadingB(true);

        const formData = new FormData();
        formData.append('contract', file);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/contracts/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to analyze contract');
            }

            // Append to local contract list
            setContract(prev => [data, ...prev]);

            // Auto-select the newly analyzed contract ID
            if (target === 'A') {
                setDealAId(data._id);
            } else {
                setDealBId(data._id);
            }

        } catch (err) {
            console.error('Error uploading contract directly:', err);
            setUploadError(err.message || 'Something went wrong during upload.');
        } finally {
            if (target === 'A') setUploadingA(false);
            else setUploadingB(false);
        }
    };

    useEffect(() => {
        const fetchContract = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/api/contracts`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch saved contracts');
                }

                const data = await res.json();
                setContract(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            };
        }
        fetchContract();
    }, []);

    const dealA = contract.find(c => c._id === dealAId);
    const dealB = contract.find(c => c._id == dealBId);

    const calculateTotalCost = (deal) => {
        if (!deal || !deal.analysis) return 0;
        const { monthlyPayment, leaseTermMonths, downPayment, dispositionFee } = deal.analysis;
        const term = leaseTermMonths || 0;
        const down = downPayment || 0;
        const disp = dispositionFee || 0;
        const monthly = monthlyPayment || 0;
        return (monthly * term) + down + disp;
    };

    const costA = calculateTotalCost(dealA);
    const costB = calculateTotalCost(dealB);

    const getRecommendation = () => {
        if (!dealA || !dealB) return null;
        const scoreA = dealA.analysis.fairnessScore || 0;
        const scoreB = dealB.analysis.fairnessScore || 0;
        let winner = null;
        let reason = '';
        let savings = 0;
        if (costA > 0 && costB > 0) {
            if (costA < costB) {
                winner = 'Deal A';
                savings = costB - costA;
                reason = `it saves you $${savings.toLocaleString(undefined, { maximumFractionDigits: 2 })} in total lease costs over the term`;
            } else if (costB < costA) {
                winner = 'Deal B';
                savings = costA - costB;
                reason = `it saves you $${savings.toLocaleString(undefined, { maximumFractionDigits: 2 })} in total lease costs over the term`;
            }
        }
        if (!winner || savings === 0) {
            if (scoreA > scoreB) {
                winner = 'Deal A';
                reason = `it has a higher fairness rating (${scoreA}/100 vs ${scoreB}/100) and fewer red flags`;
            } else if (scoreB > scoreA) {
                winner = 'Deal B';
                reason = `it has a higher fairness rating (${scoreB}/100 vs ${scoreA}/100) and fewer red flags`;
            } else {
                return { text: "Both deals are financially equivalent. Pick the vehicle you prefer!", isEqual: true };
            }
        }
        return {
            text: `VETOCAR Recommendation: We advise proceeding with **${winner}** because ${reason}.`,
            winner,
            savings
        };
    };
    const recommendation = getRecommendation();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', color: 'var(--text-main)' }}>
            {/* Header */}
            <div className="view-header">
                <div className="dash-tag" style={{ marginBottom: '10px' }}>
                    <span className="dash-pulse-dot" />
                    <span>COMPARATIVE AUDIT PORTAL</span>
                </div>
                <h1 className="view-title">
                    Multiple Offer Comparison
                </h1>
                <p className="view-subtitle">
                    Compare two audited quotes side-by-side to highlight payment deltas, hidden markups, and identify the better offer.
                </p>
            </div>
            {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                    <div className="spinner"></div>
                </div>
            )}
            {error && (
                <div className="badge badge-error" style={{ marginBottom: '24px', padding: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <ShieldAlert size={16} />
                    <span>Error loading comparisons: {error}</span>
                </div>
            )}
            {!loading && !error && (
                <>
                    {/* Dropdowns (Unified Card Layout) */}
                    <div className="card" style={{ padding: '20px', borderRadius: '0px', marginBottom: '32px' }}>
                        {uploadError && (
                            <div className="badge badge-error" style={{ marginBottom: '16px', padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px' }}>
                                <ShieldAlert size={16} />
                                <span>{uploadError}</span>
                            </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '16px' : '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px', fontFamily: 'var(--font-mono)' }}>
                                    Select Deal A //
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 42px', gap: '8px', alignItems: 'center', width: '100%' }}>
                                    <select
                                        value={dealAId}
                                        onChange={(e) => setDealAId(e.target.value)}
                                        className="form-input"
                                        style={{ width: '100%', minWidth: 0 }}
                                    >
                                        <option value="">Select Deal A...</option>
                                        {contract
                                            .filter(c => c._id !== dealBId)
                                            .map(c => {
                                                const truncated = c.fileName.length > 20 ? c.fileName.substring(0, 17) + '...' : c.fileName;
                                                return (
                                                    <option key={c._id} value={c._id}>
                                                        {truncated} ({c.analysis.fairnessScore})
                                                    </option>
                                                );
                                            })
                                        }
                                    </select>
                                    <label className="btn" style={{ 
                                        padding: 0, 
                                        height: '42px',
                                        width: '42px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: uploadingA ? 'not-allowed' : 'pointer',
                                        backgroundColor: 'rgba(0, 242, 254, 0.05)',
                                        borderColor: 'var(--border)',
                                        flexShrink: 0
                                    }} title="Upload and analyze new PDF directly">
                                        {uploadingA ? (
                                            <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></div>
                                        ) : (
                                            <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                                        )}
                                        <input 
                                            type="file" 
                                            accept="application/pdf" 
                                            onChange={(e) => handleUploadDirect(e, 'A')} 
                                            style={{ display: 'none' }} 
                                            disabled={uploadingA} 
                                        />
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px', fontFamily: 'var(--font-mono)' }}>
                                    Select Deal B //
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 42px', gap: '8px', alignItems: 'center', width: '100%' }}>
                                    <select
                                        value={dealBId}
                                        onChange={(e) => setDealBId(e.target.value)}
                                        className="form-input"
                                        style={{ width: '100%', minWidth: 0 }}
                                    >
                                        <option value="">Select Deal B...</option>
                                        {contract
                                            .filter(c => c._id !== dealAId)
                                            .map(c => {
                                                const truncated = c.fileName.length > 20 ? c.fileName.substring(0, 17) + '...' : c.fileName;
                                                return (
                                                    <option key={c._id} value={c._id}>
                                                        {truncated} ({c.analysis.fairnessScore})
                                                    </option>
                                                );
                                            })
                                        }
                                    </select>
                                    <label className="btn" style={{ 
                                        padding: 0, 
                                        height: '42px',
                                        width: '42px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: uploadingB ? 'not-allowed' : 'pointer',
                                        backgroundColor: 'rgba(0, 242, 254, 0.05)',
                                        borderColor: 'var(--border)',
                                        flexShrink: 0
                                    }} title="Upload and analyze new PDF directly">
                                        {uploadingB ? (
                                            <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></div>
                                        ) : (
                                            <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                                        )}
                                        <input 
                                            type="file" 
                                            accept="application/pdf" 
                                            onChange={(e) => handleUploadDirect(e, 'B')} 
                                            style={{ display: 'none' }} 
                                            disabled={uploadingB} 
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Deal Cards Comparison */}
                    {dealA && dealB ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                            {recommendation && (
                                <div style={{
                                    backgroundColor: 'var(--bg-hover)',
                                    border: '1px solid var(--border)',
                                    borderLeft: '4px solid var(--accent)',
                                    padding: '20px',
                                    borderRadius: '4px',
                                    fontSize: '13.5px',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '14px',
                                    boxShadow: '0 4px 20px rgba(0, 245, 212, 0.03)'
                                }}>
                                    <Sparkles size={20} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
                                    <div>
                                        <strong style={{ color: 'var(--accent)', display: 'block', marginBottom: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                          SYSTEM DECISION ENGINE RECOMMENDATION
                                        </strong>
                                        <span style={{ lineHeight: '1.6', color: 'var(--text-main)' }}>
                                          {recommendation.text.replace(/\*\*(.*?)\*\*/g, '$1')}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '24px' : '32px', position: 'relative' }}>
                                {/* Floating VS Divider Badge */}
                                {!isMobile && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        zIndex: 10,
                                        backgroundColor: 'var(--bg-main)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '50%',
                                        width: '44px',
                                        height: '44px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontFamily: 'var(--font-mono)',
                                        fontWeight: 800,
                                        fontSize: '11px',
                                        color: 'var(--accent)',
                                        boxShadow: '0 0 15px rgba(0, 245, 212, 0.1)'
                                    }}>
                                        VS
                                    </div>
                                )}

                                {/* Deal A Card */}
                                <div className="card" style={{ 
                                    padding: '28px', 
                                    borderRadius: '4px', 
                                    position: 'relative',
                                    background: 'var(--bg-surface)',
                                    border: recommendation?.winner === 'Deal A' ? '2px solid var(--accent)' : '1px solid var(--border)',
                                    boxShadow: recommendation?.winner === 'Deal A' ? '0 10px 30px rgba(0, 245, 212, 0.04)' : 'none'
                                }}>
                                    {recommendation?.winner === 'Deal A' && (
                                        <div style={{ 
                                            position: 'absolute', 
                                            top: '-12px', 
                                            left: '20px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '6px', 
                                            color: 'var(--bg-main)', 
                                            background: 'var(--accent)',
                                            fontSize: '9px', 
                                            fontFamily: 'var(--font-mono)', 
                                            fontWeight: 800,
                                            padding: '4px 10px',
                                            borderRadius: '2px',
                                            letterSpacing: '0.05em'
                                        }}>
                                            <CheckCircle size={11} /> RECOMMENDED DEAL
                                        </div>
                                    )}
                                    <h3 style={{ textTransform: 'uppercase', letterSpacing: '-0.01em', fontWeight: 800, fontSize: '20px', marginBottom: '6px', color: 'var(--text-main)' }}>
                                        Deal A
                                    </h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '11px', wordBreak: 'break-all', marginBottom: '24px', fontFamily: 'var(--font-mono)' }}>
                                        {dealA.fileName}
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Deal Fairness Score</span>
                                            <strong style={{ fontSize: '16px', color: dealA.analysis.fairnessScore >= 80 ? 'var(--success)' : dealA.analysis.fairnessScore >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                                                {dealA.analysis.fairnessScore}/100
                                            </strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Contract Type</span>
                                            <strong style={{ fontSize: '13px' }}>{dealA.analysis.contractType}</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Monthly Payment</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {dealA.analysis.monthlyPayment < dealB.analysis.monthlyPayment && (
                                                    <span style={{ fontSize: '9px', background: 'rgba(16, 185, 129, 0.08)', color: 'var(--success)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                                      -${Math.abs(dealA.analysis.monthlyPayment - dealB.analysis.monthlyPayment).toFixed(2)}/MO
                                                    </span>
                                                )}
                                                <strong style={{ color: dealA.analysis.monthlyPayment <= dealB.analysis.monthlyPayment ? 'var(--success)' : 'inherit' }}>
                                                    ${dealA.analysis.monthlyPayment?.toFixed(2) || 'N/A'}
                                                </strong>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Down Payment</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {dealA.analysis.downPayment < dealB.analysis.downPayment && (
                                                    <span style={{ fontSize: '9px', background: 'rgba(16, 185, 129, 0.08)', color: 'var(--success)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                                      -${Math.abs(dealA.analysis.downPayment - dealB.analysis.downPayment).toFixed(2)}
                                                    </span>
                                                )}
                                                <strong style={{ color: dealA.analysis.downPayment <= dealB.analysis.downPayment ? 'var(--success)' : 'inherit' }}>
                                                    ${dealA.analysis.downPayment?.toFixed(2) || '0.00'}
                                                </strong>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Interest Rate / APR</span>
                                            <strong style={{ color: dealA.analysis.interestRateOrAPR <= dealB.analysis.interestRateOrAPR ? 'var(--success)' : 'inherit' }}>
                                                {dealA.analysis.interestRateOrAPR ? `${dealA.analysis.interestRateOrAPR}%` : 'N/A'}
                                            </strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Lease Term</span>
                                            <strong>{dealA.analysis.leaseTermMonths || 'N/A'} mos</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Total Term Out-of-Pocket</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {costA < costB && (
                                                    <span style={{ fontSize: '9px', background: 'rgba(0, 245, 212, 0.1)', color: 'var(--accent)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                                      -${Math.abs(costA - costB).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                    </span>
                                                )}
                                                <strong style={{ color: costA <= costB ? 'var(--accent)' : 'inherit', fontSize: '15px' }}>
                                                    ${costA.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '28px' }}>
                                        <h4 style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
                                            Audited Red Flags ({dealA.analysis.redFlags?.length || 0})
                                        </h4>
                                        {dealA.analysis.redFlags && dealA.analysis.redFlags.length > 0 ? (
                                            <ul style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--danger)' }}>
                                                {dealA.analysis.redFlags.map((flag, idx) => (
                                                    <li key={idx} style={{ lineHeight: '1.4' }}>{flag}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p style={{ color: 'var(--success)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', margin: 0, fontWeight: 600 }}>
                                                <CheckCircle size={14} /> No red flags detected!
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Deal B Card */}
                                <div className="card" style={{ 
                                    padding: '28px', 
                                    borderRadius: '4px', 
                                    position: 'relative',
                                    background: 'var(--bg-surface)',
                                    border: recommendation?.winner === 'Deal B' ? '2px solid var(--accent)' : '1px solid var(--border)',
                                    boxShadow: recommendation?.winner === 'Deal B' ? '0 10px 30px rgba(0, 245, 212, 0.04)' : 'none'
                                }}>
                                    {recommendation?.winner === 'Deal B' && (
                                        <div style={{ 
                                            position: 'absolute', 
                                            top: '-12px', 
                                            left: '20px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '6px', 
                                            color: 'var(--bg-main)', 
                                            background: 'var(--accent)',
                                            fontSize: '9px', 
                                            fontFamily: 'var(--font-mono)', 
                                            fontWeight: 800,
                                            padding: '4px 10px',
                                            borderRadius: '2px',
                                            letterSpacing: '0.05em'
                                        }}>
                                            <CheckCircle size={11} /> RECOMMENDED DEAL
                                        </div>
                                    )}
                                    <h3 style={{ textTransform: 'uppercase', letterSpacing: '-0.01em', fontWeight: 800, fontSize: '20px', marginBottom: '6px', color: 'var(--text-main)' }}>
                                        Deal B
                                    </h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '11px', wordBreak: 'break-all', marginBottom: '24px', fontFamily: 'var(--font-mono)' }}>
                                        {dealB.fileName}
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Deal Fairness Score</span>
                                            <strong style={{ fontSize: '16px', color: dealB.analysis.fairnessScore >= 80 ? 'var(--success)' : dealB.analysis.fairnessScore >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                                                {dealB.analysis.fairnessScore}/100
                                            </strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Contract Type</span>
                                            <strong style={{ fontSize: '13px' }}>{dealB.analysis.contractType}</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Monthly Payment</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {dealB.analysis.monthlyPayment < dealA.analysis.monthlyPayment && (
                                                    <span style={{ fontSize: '9px', background: 'rgba(16, 185, 129, 0.08)', color: 'var(--success)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                                      -${Math.abs(dealB.analysis.monthlyPayment - dealA.analysis.monthlyPayment).toFixed(2)}/MO
                                                    </span>
                                                )}
                                                <strong style={{ color: dealB.analysis.monthlyPayment <= dealA.analysis.monthlyPayment ? 'var(--success)' : 'inherit' }}>
                                                    ${dealB.analysis.monthlyPayment?.toFixed(2) || 'N/A'}
                                                </strong>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Down Payment</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {dealB.analysis.downPayment < dealA.analysis.downPayment && (
                                                    <span style={{ fontSize: '9px', background: 'rgba(16, 185, 129, 0.08)', color: 'var(--success)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                                      -${Math.abs(dealB.analysis.downPayment - dealA.analysis.downPayment).toFixed(2)}
                                                    </span>
                                                )}
                                                <strong style={{ color: dealB.analysis.downPayment <= dealA.analysis.downPayment ? 'var(--success)' : 'inherit' }}>
                                                    ${dealB.analysis.downPayment?.toFixed(2) || '0.00'}
                                                </strong>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Interest Rate / APR</span>
                                            <strong style={{ color: dealB.analysis.interestRateOrAPR <= dealA.analysis.interestRateOrAPR ? 'var(--success)' : 'inherit' }}>
                                                {dealB.analysis.interestRateOrAPR ? `${dealB.analysis.interestRateOrAPR}%` : 'N/A'}
                                            </strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Lease Term</span>
                                            <strong>{dealB.analysis.leaseTermMonths || 'N/A'} mos</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Total Term Out-of-Pocket</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {costB < costA && (
                                                    <span style={{ fontSize: '9px', background: 'rgba(0, 245, 212, 0.1)', color: 'var(--accent)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                                      -${Math.abs(costB - costA).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                    </span>
                                                )}
                                                <strong style={{ color: costB <= costA ? 'var(--accent)' : 'inherit', fontSize: '15px' }}>
                                                    ${costB.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '28px' }}>
                                        <h4 style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
                                            Audited Red Flags ({dealB.analysis.redFlags?.length || 0})
                                        </h4>
                                        {dealB.analysis.redFlags && dealB.analysis.redFlags.length > 0 ? (
                                            <ul style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--danger)' }}>
                                                {dealB.analysis.redFlags.map((flag, idx) => (
                                                    <li key={idx} style={{ lineHeight: '1.4' }}>{flag}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p style={{ color: 'var(--success)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', margin: 0, fontWeight: 600 }}>
                                                <CheckCircle size={14} /> No red flags detected!
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            border: '1px dashed var(--border)',
                            padding: '60px 20px',
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px'
                        }}>
                            <AlertCircle size={32} style={{ color: 'var(--border)' }} />
                            <div>
                                <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Awaiting Selection</strong>
                                <span>Please select two active contract offers from the dropdown lists above to trigger side-by-side audits.</span>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default OfferComparision