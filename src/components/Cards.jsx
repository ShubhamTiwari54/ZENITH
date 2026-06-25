import React, { useState, useEffect } from 'react';

export default function Cards({ creditCard, onCardAction, addNotification }) {
  const [revealed, setRevealed] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [showPinGate, setShowPinGate] = useState(false);
  const [gateAction, setGateAction] = useState('reveal'); // 'reveal' or 'reset-pin'
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Card details state
  const [fullCardNumber, setFullCardNumber] = useState("•••• •••• •••• 4567");
  const [fullCVV, setFullCVV] = useState("•••");
  
  // Limit Slider states
  const [limits, setLimits] = useState({
    online: creditCard?.limits?.online || 75000,
    offline: creditCard?.limits?.offline || 25000,
    contactless: creditCard?.limits?.contactless || 15000
  });

  // Card PIN Reset states
  const [newCardPin, setNewCardPin] = useState('');

  // Handle countdown for card details exposure
  useEffect(() => {
    let timer;
    if (revealed && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (revealed && countdown === 0) {
      // Re-mask
      setRevealed(false);
      setFullCardNumber("•••• •••• •••• " + (creditCard?.cardNumber ? creditCard.cardNumber.slice(-4) : "4567"));
      setFullCVV("•••");
      addNotification("Privacy Shield Active", "Card details have been masked again for security.");
    }
    return () => clearTimeout(timer);
  }, [revealed, countdown]);

  const handleRevealClick = () => {
    setGateAction('reveal');
    setPin('');
    setErrorMsg('');
    setShowPinGate(true);
  };

  const handleFreezeToggle = async () => {
    try {
      const response = await fetch('/api/cards/toggle-freeze', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        onCardAction(); // Refresh state
        addNotification(
          result.frozen ? "Card Suspended" : "Card Activated", 
          `Credit card ending 4567 has been ${result.frozen ? 'frozen' : 'unfrozen'}.`
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSliderChange = (e, type) => {
    setLimits(prev => ({
      ...prev,
      [type]: parseInt(e.target.value)
    }));
  };

  const handleSaveLimits = async () => {
    try {
      const response = await fetch('/api/cards/update-limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(limits)
      });
      if (response.ok) {
        onCardAction(); // Refresh state
        addNotification("Limits Saved", "Transaction limits updated successfully.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetPinClick = (e) => {
    e.preventDefault();
    if (newCardPin.length !== 4 || isNaN(parseInt(newCardPin))) {
      alert("PIN must be a 4-digit number.");
      return;
    }
    setGateAction('reset-pin');
    setPin('');
    setErrorMsg('');
    setShowPinGate(true);
  };

  const handleVerifyGate = async () => {
    if (gateAction === 'reveal') {
      try {
        const response = await fetch('/api/cards/reveal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin })
        });
        const result = await response.json();

        if (response.ok) {
          setFullCardNumber(result.cardNumber);
          setFullCVV(result.cvv);
          setRevealed(true);
          setCountdown(15);
          setShowPinGate(false);
          addNotification("Details Exposed", "Card number and CVV are visible. Auto-masking in 15s.");
        } else {
          setErrorMsg(result.error || "Incorrect PIN.");
        }
      } catch (err) {
        setErrorMsg("API Connection failure.");
      }
    } else if (gateAction === 'reset-pin') {
      try {
        const response = await fetch('/api/cards/reset-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newPin: newCardPin, currentPin: pin })
        });

        if (response.ok) {
          setShowPinGate(false);
          setNewCardPin('');
          addNotification("Card PIN Changed", "Successfully reset your credit card PIN.");
        } else {
          const result = await response.json();
          setErrorMsg(result.error || "Invalid PIN.");
        }
      } catch (err) {
        setErrorMsg("API Connection failure.");
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="page-container">
      <div className="welcome-section">
        <div>
          <h1 className="welcome-title">My Cards</h1>
          <p className="welcome-subtitle">Configure spending rules and security parameters.</p>
        </div>
      </div>

      <div className="cards-layout-grid">
        {/* Interactive card view */}
        <div className="card-visualizer-section">
          {/* Credit Card Graphic */}
          <div className={`premium-credit-card font-display ${creditCard?.frozen ? 'frozen-card' : ''}`}>
            {creditCard?.frozen && (
              <div className="frozen-overlay">
                <span className="frozen-icon">❄️</span>
                <h3>Card Frozen</h3>
              </div>
            )}
            
            <div className="cc-logo-top">
              <span>Zenith Infinite</span>
              <div className="cc-logo-visa">VISA</div>
            </div>
            
            <div className="cc-middle-row">
              <div className="chip-gold"></div>
              {revealed && <div className="countdown-pill">Masks in {countdown}s</div>}
            </div>
            
            <div className="cc-card-number-large">
              {fullCardNumber}
            </div>
            
            <div className="cc-card-footer">
              <div className="cc-footer-col">
                <span className="cc-lbl-micro">Card Holder</span>
                <span className="cc-val-micro">KAVYA NAIR</span>
              </div>
              <div className="cc-footer-col">
                <span className="cc-lbl-micro">Expires</span>
                <span className="cc-val-micro">{creditCard?.expiry || "09/30"}</span>
              </div>
              <div className="cc-footer-col">
                <span className="cc-lbl-micro">CVV</span>
                <span className="cc-val-micro">{fullCVV}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="card-actions-row">
            <button className={`btn ${creditCard?.frozen ? 'btn-primary' : 'btn-secondary'}`} onClick={handleFreezeToggle}>
              {creditCard?.frozen ? 'Unfreeze Card' : 'Freeze Card'}
            </button>
            <button className="btn btn-outline" onClick={handleRevealClick} disabled={creditCard?.frozen}>
              Show Card Details
            </button>
          </div>
        </div>

        {/* Card Settings Forms */}
        <div className="card-settings-section">
          {/* Card Spending Limits */}
          <div className="zenith-card limits-card-ctrl">
            <h3>Card Limits</h3>
            <p className="widget-subtitle">Configure daily transaction limits per channel</p>

            <div className="slider-group mt-4">
              <div className="slider-label-row">
                <span>Online Transactions</span>
                <strong>{formatCurrency(limits.online).split('.')[0]}</strong>
              </div>
              <input 
                type="range" 
                min="0" 
                max="200000" 
                step="5000"
                value={limits.online} 
                onChange={e => handleSliderChange(e, 'online')}
                disabled={creditCard?.frozen}
                className="limit-range-slider"
              />
            </div>

            <div className="slider-group">
              <div className="slider-label-row">
                <span>Offline / POS Terminal</span>
                <strong>{formatCurrency(limits.offline).split('.')[0]}</strong>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100000" 
                step="2000"
                value={limits.offline} 
                onChange={e => handleSliderChange(e, 'offline')}
                disabled={creditCard?.frozen}
                className="limit-range-slider"
              />
            </div>

            <div className="slider-group">
              <div className="slider-label-row">
                <span>Contactless Payments</span>
                <strong>{formatCurrency(limits.contactless).split('.')[0]}</strong>
              </div>
              <input 
                type="range" 
                min="0" 
                max="50000" 
                step="1000"
                value={limits.contactless} 
                onChange={e => handleSliderChange(e, 'contactless')}
                disabled={creditCard?.frozen}
                className="limit-range-slider"
              />
            </div>

            <button 
              className="btn btn-primary w-full mt-4" 
              onClick={handleSaveLimits}
              disabled={creditCard?.frozen}
            >
              Save Custom Limits
            </button>
          </div>

          {/* Reset PIN form */}
          <div className="zenith-card reset-pin-card-ctrl">
            <h3>Reset Card PIN</h3>
            <p className="widget-subtitle">Create a new 4-digit ATM / POS passcode</p>

            <form onSubmit={handleResetPinClick}>
              <div className="form-group mt-4">
                <label>New Card PIN (4 digits)</label>
                <input 
                  type="password" 
                  maxLength="4" 
                  className="form-control text-center font-bold"
                  style={{ letterSpacing: '6px', fontSize: '18px' }}
                  placeholder="••••"
                  value={newCardPin}
                  onChange={e => setNewCardPin(e.target.value)}
                  disabled={creditCard?.frozen}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-secondary w-full"
                disabled={creditCard?.frozen}
              >
                Change PIN
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Security Gate modal */}
      {showPinGate && (
        <div className="modal-overlay" onClick={() => setShowPinGate(false)}>
          <div className="modal-content security-gate-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setShowPinGate(false)}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="gate-body">
              <div className="gate-icon-shield">🛡️</div>
              <h3>Confirm Account Identity</h3>
              <p className="modal-subtitle">
                {gateAction === 'reveal' 
                  ? 'Verify transaction PIN to decrypt and expose credit card numbers.'
                  : 'Verify transaction PIN to authorize card passcode modification.'
                } (Demo PIN: 1234)
              </p>

              {errorMsg && <p className="gate-error-banner">{errorMsg}</p>}

              <div className="form-group mt-4">
                <input 
                  type="password" 
                  maxLength="4"
                  className="form-control text-center font-bold"
                  style={{ fontSize: '24px', letterSpacing: '8px' }}
                  placeholder="••••"
                  value={pin}
                  onChange={e => {
                    setErrorMsg('');
                    setPin(e.target.value);
                  }}
                />
              </div>
              <button className="btn btn-primary w-full mt-4" onClick={handleVerifyGate}>Authorize</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
