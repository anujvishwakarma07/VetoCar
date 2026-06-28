import React, { useState } from 'react';
import { Car, Search, AlertCircle, Info } from 'lucide-react';

const VinLookup = () => {
  const [vinInput, setVinInput] = useState('');
  const [vinResult, setVinResult] = useState(null);
  const [decoding, setDecoding] = useState(false);
  const [vinError, setVinError] = useState('');

  const API_URL = 'http://localhost:8080/api';

  const handleDecodeVin = async (e) => {
    e.preventDefault();
    if (!vinInput.trim()) return;

    setDecoding(true);
    setVinError('');
    setVinResult(null);

    try {
      const response = await fetch(`${API_URL}/vin/decode/${vinInput.trim()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Invalid VIN or service error.');
      }

      setVinResult(data.carInfo);
    } catch (err) {
      console.error('Error decoding VIN:', err);
      setVinError(err.message || 'Failed to decode VIN.');
    } finally {
      setDecoding(false);
    }
  };

  return (
    <div>
      <div className="view-header">
        <h1 className="view-title">VIN Lookup</h1>
        <p className="view-subtitle">Retrieve official specifications and verify structural details via the NHTSA database.</p>
      </div>

      {/* Input Section */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={20} style={{ color: 'var(--primary)' }} />
          Verify Vehicle Specifications
        </h3>

        <form onSubmit={handleDecodeVin} className="input-group">
          <input
            type="text"
            className="form-input"
            placeholder="Enter 17-character VIN Number (e.g. 1FTMW1T88MFA00001)..."
            value={vinInput}
            onChange={(e) => setVinInput(e.target.value.toUpperCase())}
            maxLength={17}
            disabled={decoding}
          />
          <button type="submit" className="btn" disabled={decoding || vinInput.trim().length !== 17}>
            {decoding ? (
              <>
                <div className="spinner"></div> Decoding...
              </>
            ) : (
              'Decode VIN'
            )}
          </button>
        </form>

        {vinError && (
          <div className="flag-item" style={{ marginTop: '16px' }}>
            <AlertCircle size={20} />
            <span>{vinError}</span>
          </div>
        )}
      </div>

      {/* Results Display */}
      {vinResult && (
        <div className="card">
          <h3 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Car size={20} style={{ color: 'var(--primary)' }} />
            NHTSA Decoded Specifications
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            <table className="parameters-table">
              <tbody>
                <tr>
                  <td className="parameter-label">Make</td>
                  <td className="parameter-value">{vinResult.make || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="parameter-label">Model</td>
                  <td className="parameter-value">{vinResult.model || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="parameter-label">Model Year</td>
                  <td className="parameter-value">{vinResult.year || 'N/A'}</td>
                </tr>
              </tbody>
            </table>

            <table className="parameters-table">
              <tbody>
                <tr>
                  <td className="parameter-label">Manufacturer</td>
                  <td className="parameter-value">{vinResult.manufacturer || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="parameter-label">Body Class</td>
                  <td className="parameter-value">{vinResult.bodyClass || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="parameter-label">Vehicle Type</td>
                  <td className="parameter-value">{vinResult.vehicleType || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '32px', padding: '16px', backgroundColor: 'var(--bg-hover)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <Info size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Specifications are retrieved directly from the public database of the National Highway Traffic Safety Administration (NHTSA). Please cross-verify with your physical vehicle to ensure accuracy.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VinLookup;
