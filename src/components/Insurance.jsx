import React, { useState, useEffect } from 'react';

export default function Insurance({ 
  insurance, 
  addNotification,
  prefilledClaim,
  clearPrefilledClaim
}) {
  const [selectedPlan, setSelectedPlan] = useState('health'); // health, auto, life
  const [coverageAmt, setCoverageAmt] = useState(500000);
  const [userAge, setUserAge] = useState(30);
  
  // Claim form states
  const [claimPolicy, setClaimPolicy] = useState('1');
  const [claimAmount, setClaimAmount] = useState('');
  const [claimReason, setClaimReason] = useState('');

  useEffect(() => {
    if (prefilledClaim) {
      const policyId = String(prefilledClaim.policyId || '1');
      const amount = prefilledClaim.claimAmount || '';
      const reason = prefilledClaim.details || '';
      setClaimPolicy(policyId);
      setClaimAmount(amount);
      setClaimReason(reason);
      clearPrefilledClaim();

      if (amount && reason) {
        setTimeout(() => {
          if (window.confirm(`Confirm: Lodge a claim of ${formatCurrency(amount)} against policy ${policyId}?`)) {
            fetch('/api/insurance/claim', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                policyId,
                claimAmount: amount,
                details: reason
              })
            }).then(res => {
              if (res.ok) {
                res.json().then(result => {
                  addNotification(
                    "Claim Lodged", 
                    `Registered Claim ${result.claimId} of ${formatCurrency(amount)} for verification.`
                  );
                  setClaimAmount('');
                  setClaimReason('');
                });
              } else {
                alert("Failed to submit claim.");
              }
            }).catch(err => console.error(err));
          }
        }, 100);
      }
    }
  }, [prefilledClaim]);

  const plans = {
    health: { title: "Zenith Care Plan", rateFactor: 0.0024 },
    auto: { title: "Zenith Auto Safe", rateFactor: 0.0035 },
    life: { title: "Zenith Secure Life", rateFactor: 0.0018 }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const calculatePremium = () => {
    const base = coverageAmt * plans[selectedPlan].rateFactor;
    // Premium increases slightly with age
    const ageFactor = userAge > 45 ? 1.4 : (userAge > 30 ? 1.15 : 1.0);
    return Math.round(base * ageFactor);
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!claimAmount || parseFloat(claimAmount) <= 0 || !claimReason) {
      alert("Please fill in claim parameters.");
      return;
    }

    try {
      const response = await fetch('/api/insurance/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyId: claimPolicy,
          claimAmount,
          details: claimReason
        })
      });

      if (response.ok) {
        const result = await response.json();
        addNotification(
          "Claim Lodged", 
          `Registered Claim ${result.claimId} of ${formatCurrency(claimAmount)} for verification.`
        );
        setClaimAmount('');
        setClaimReason('');
      } else {
        alert("Failed to submit claim.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <div className="welcome-section">
        <div>
          <h1 className="welcome-title">Zenith Insurance</h1>
          <p className="welcome-subtitle">Protect your health, vehicles, and family with tailored coverages.</p>
        </div>
      </div>

      <div className="insurance-layout-grid">
        {/* Active Policies List */}
        <div className="active-policies-section">
          <div className="zenith-card active-policies-card">
            <h3>My Active Policies</h3>
            <p className="widget-subtitle">Ongoing Insurance Coverages</p>

            <div className="policies-list mt-4">
              {insurance?.map(policy => (
                <div key={policy.id} className="policy-item-card">
                  <div className="policy-header">
                    <h4>{policy.type}</h4>
                    <span className="badge badge-success">{policy.status}</span>
                  </div>
                  <p className="policy-number">Policy No: {policy.number}</p>
                  
                  <div className="policy-details-row mt-4">
                    <div className="pol-det">
                      <span>Coverage Limit</span>
                      <strong>{formatCurrency(policy.coverage)}</strong>
                    </div>
                    <div className="pol-det">
                      <span>Monthly Premium</span>
                      <strong>{formatCurrency(policy.premium)} / mo</strong>
                    </div>
                    <div className="pol-det">
                      <span>Provider</span>
                      <strong>{policy.provider}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit a claim portal */}
          <div className="zenith-card claim-insurance-card mt-6">
            <h3>Lodge a Coverage Claim</h3>
            <p className="widget-subtitle">Submit receipts and details to request payouts</p>

            <form onSubmit={handleClaimSubmit} className="claim-form">
              <div className="form-group mt-4">
                <label>Select Policy</label>
                <select 
                  className="form-control"
                  value={claimPolicy}
                  onChange={e => setClaimPolicy(e.target.value)}
                >
                  {insurance?.map(p => (
                    <option key={p.id} value={p.id}>{p.type} ({p.number})</option>
                  ))}
                </select>
              </div>

              <div className="form-double-row">
                <div className="form-group">
                  <label>Claim Amount Requested (INR)</label>
                  <input 
                    type="number" 
                    min="1"
                    className="form-control"
                    placeholder="₹ 0.00"
                    value={claimAmount}
                    onChange={e => setClaimAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Incident Date</label>
                  <input type="date" className="form-control" required />
                </div>
              </div>

              <div className="form-group">
                <label>Reason & Cause Description</label>
                <textarea 
                  rows="3"
                  className="form-control"
                  placeholder="Provide clinical details or accident reports..."
                  value={claimReason}
                  onChange={e => setClaimReason(e.target.value)}
                  style={{ resize: 'none' }}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-full mt-2">Submit Claim Form</button>
            </form>
          </div>
        </div>

        {/* Premium Calculator */}
        <div className="premium-calculator-section">
          <div className="zenith-card prem-calc-card">
            <h3>Plan Premium Calculator</h3>
            <p className="widget-subtitle">Get immediate insurance cost estimates</p>

            <div className="form-group mt-4">
              <label>Plan Type</label>
              <div className="plan-selector-grid">
                <button 
                  className={`plan-opt-btn ${selectedPlan === 'health' ? 'active' : ''}`}
                  onClick={() => setSelectedPlan('health')}
                >
                  🏥 Health
                </button>
                <button 
                  className={`plan-opt-btn ${selectedPlan === 'auto' ? 'active' : ''}`}
                  onClick={() => setSelectedPlan('auto')}
                >
                  🚗 Auto
                </button>
                <button 
                  className={`plan-opt-btn ${selectedPlan === 'life' ? 'active' : ''}`}
                  onClick={() => setSelectedPlan('life')}
                >
                  🛡️ Life
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Target Coverage Limit: {formatCurrency(coverageAmt).split('.')[0]}</label>
              <input 
                type="range" 
                min="100000" 
                max="2000000" 
                step="50000"
                className="limit-range-slider"
                value={coverageAmt}
                onChange={e => setCoverageAmt(parseInt(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Applicant Age: {userAge} Years</label>
              <input 
                type="range" 
                min="18" 
                max="75" 
                step="1"
                className="limit-range-slider"
                value={userAge}
                onChange={e => setUserAge(parseInt(e.target.value))}
              />
            </div>

            <div className="calculator-outputs mt-4">
              <div className="output-row">
                <span>Calculated Premium Quote:</span>
                <strong className="text-primary font-display" style={{ fontSize: '20px' }}>
                  {formatCurrency(calculatePremium())} / month
                </strong>
              </div>
              <p className="claim-helper-lbl mt-2">
                *Subject to medical reviews. Premium includes core standard taxation components.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
