import React, { useState } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, Sparkles, QrCode, Smartphone } from 'lucide-react';

const BuyCredits = ({ onPaymentSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Simulator Modal State
  const [showSimulator, setShowSimulator] = useState(false);
  const [mockOrder, setMockOrder] = useState(null);
  const [simulatingPayment, setSimulatingPayment] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const packages = [
    { credits: 10, price: 499, popular: true, description: 'Best for comparing dealer lease quotes' },
    { credits: 25, price: 999, popular: false, description: 'Ideal for extensive lookup and professional audits' }
  ];

  const handlePurchase = async (pkg) => {
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/payment/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: pkg.price })
      });

      const orderData = await res.json();

      if (!res.ok) {
        throw new Error(orderData.error || 'Failed to initiate order.');
      }

      // Check if backend responded in Simulator Mode (isMock: true)
      if (orderData.isMock) {
        setMockOrder({ ...orderData, price: pkg.price });
        setShowSimulator(true);
        setLoading(false);
      } else {
        // Run Real Razorpay Integration
        runRealRazorpay(orderData, pkg.price);
      }

    } catch (err) {
      console.error('Purchase initiation failed:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  // --- Real Razorpay Payment SDK Integration ---
  const runRealRazorpay = (order, price) => {
    const loadScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const startCheckout = async () => {
      const isScriptLoaded = await loadScript();
      if (!isScriptLoaded) {
        setError('Failed to load Razorpay Payment Gateway. Check your internet connection.');
        setLoading(false);
        return;
      }

      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: 'VetoCar',
        description: 'Purchase Audit Credits',
        order_id: order.id,
        handler: async function (response) {
          try {
            // Verify payment on the backend
            const token = localStorage.getItem('token');
            const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: price
              })
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(verifyData.error || 'Payment signature verification failed.');
            }

            setSuccessMsg(`Success! Added credits. Your new balance: ${verifyData.credits}`);
            if (onPaymentSuccess) onPaymentSuccess(verifyData.credits);
          } catch (verifyErr) {
            console.error('Verification error:', verifyErr);
            setError(verifyErr.message || 'Payment verification failed.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: 'VetoCar User',
          email: 'user@example.com'
        },
        theme: {
          color: '#00f2fe'
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    };

    startCheckout();
  };

  // --- Mock Simulator Payment Handler ---
  const handleSimulatePayment = async (status) => {
    if (status === 'fail') {
      setError('Payment simulation cancelled/failed.');
      setShowSimulator(false);
      return;
    }

    setSimulatingPayment(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpay_order_id: mockOrder.id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: 'mock_signature', // triggers mock block in backend
          amount: mockOrder.price
        })
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Simulation verification failed.');
      }

      setSuccessMsg(`Simulated Success! Added credits. Your new balance: ${verifyData.credits}`);
      if (onPaymentSuccess) onPaymentSuccess(verifyData.credits);
      setShowSimulator(false);
    } catch (err) {
      console.error('Simulation verification failed:', err);
      setError(err.message || 'Payment simulation failed.');
    } finally {
      setSimulatingPayment(false);
    }
  };

  return (
    <div>
      <div className="view-header">
        <h1 className="view-title">Top Up Credits</h1>
        <p className="view-subtitle">Add credits to unlock premium contract audits, money factor calculations, and live database plate checks.</p>
      </div>

      {error && (
        <div className="flag-item" style={{ marginBottom: '24px' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '16px 20px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '24px', fontSize: '14px' }}>
          <CheckCircle2 size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {packages.map((pkg) => (
          <div key={pkg.credits} className="card" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px', 
            position: 'relative',
            border: pkg.popular ? '1px solid var(--primary)' : '1px solid var(--border)'
          }}>
            {pkg.popular && (
              <span style={{
                position: 'absolute',
                top: '-12px',
                right: '20px',
                background: 'var(--primary)',
                color: 'var(--bg-main)',
                fontSize: '10px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                padding: '4px 8px',
                borderRadius: '0px'
              }}>
                Popular Choice
              </span>
            )}
            
            <h3 style={{ fontSize: '20px', fontWeight: 700 }}>{pkg.credits} Audit Credits</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.5' }}>{pkg.description}</p>
            
            <div style={{ margin: '12px 0' }}>
              <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-main)' }}>₹{pkg.price}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginLeft: '6px' }}>one-time payment</span>
            </div>

            <button 
              className="btn" 
              onClick={() => handlePurchase(pkg)}
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? <><div className="spinner"></div> Processing...</> : 'Top Up Now'}
            </button>
          </div>
        ))}
      </div>

      {/* CUSTOM GLASSMORPHISM PAYMENT SIMULATION MODAL */}
      {showSimulator && mockOrder && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 8, 12, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card" style={{ 
            maxWidth: '440px', 
            width: '100%', 
            padding: '32px', 
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(0, 242, 254, 0.1)', borderRadius: '50%', marginBottom: '16px' }}>
                <Sparkles size={24} style={{ color: 'var(--primary)' }} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>VetoCar Payment Simulator</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                You are in sandbox development mode. Select a payment option to simulate success.
              </p>
            </div>

            <div style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Amount</span>
              <p style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px', color: 'var(--text-main)' }}>₹{mockOrder.price}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                className="btn"
                onClick={() => handleSimulatePayment('success')}
                disabled={simulatingPayment}
                style={{ 
                  justifyContent: 'center', 
                  backgroundColor: '#10b981', 
                  borderColor: '#10b981', 
                  color: '#000' 
                }}
              >
                {simulatingPayment ? <div className="spinner"></div> : 'Simulate Success Payment'}
              </button>

              <button 
                className="btn"
                onClick={() => handleSimulatePayment('fail')}
                disabled={simulatingPayment}
                style={{ 
                  justifyContent: 'center', 
                  backgroundColor: 'transparent', 
                  borderColor: 'var(--border)', 
                  color: 'var(--text-main)' 
                }}
              >
                Simulate Payment Failure
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '11px', color: 'var(--text-dim)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CreditCard size={12} /> Cards</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><QrCode size={12} /> UPI QR</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Smartphone size={12} /> GPay</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyCredits;
