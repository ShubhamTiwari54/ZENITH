import React, { useState } from 'react';

export default function Payments({ dashboardData, onTransfer, addNotification }) {
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Others');
  const [remark, setRemark] = useState('');
  
  // Security Modal State
  const [showSecurityGate, setShowSecurityGate] = useState(false);
  const [gateStep, setGateStep] = useState(1); // 1: PIN entry, 2: OTP verification, 3: Success, 4: Error
  const [pin, setPin] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successReceipt, setSuccessReceipt] = useState(null);

  // Quick Pay contacts
  const savedBillers = [
    { name: "Rahul Sharma", account: "9823 4112 5590", bank: "ICICI Bank", category: "Others" },
    { name: "Priya Patel", account: "7820 1199 4432", bank: "HDFC Bank", category: "Others" },
    { name: "Aarav Gupta", account: "4509 3321 0019", bank: "Axis Bank", category: "Shopping" }
  ];

  const handleQuickPay = (biller) => {
    setRecipientName(biller.name);
    setRecipientAccount(biller.account);
    setBankName(biller.bank);
    setCategory(biller.category);
  };

  const handleInitiateTransfer = (e) => {
    e.preventDefault();
    if (!recipientName || !recipientAccount || !bankName || !amount) {
      alert("Please fill in all transaction fields.");
      return;
    }
    if (parseFloat(amount) <= 0) {
      alert("Please enter a positive amount.");
      return;
    }
    
    // Clear and open gate
    setPin('');
    setOtp('');
    setErrorMsg('');
    setGateStep(1);
    setShowSecurityGate(true);
  };

  const handleVerifyPIN = () => {
    if (pin === '1234') {
      setGateStep(2);
    } else {
      setErrorMsg("Incorrect PIN. Please try again.");
    }
  };

  const handleVerifyOTP = async () => {
    if (otp !== '123456') {
      setErrorMsg("Invalid OTP. Use the demo code 123456.");
      return;
    }

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName,
          recipientAccount,
          amount,
          category,
          remark,
          pin
        })
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessReceipt(result.transaction);
        setGateStep(3);
        onTransfer(); // Callback to refresh global state
        
        // Reset form
        setRecipientName('');
        setRecipientAccount('');
        setBankName('');
        setAmount('');
        setRemark('');
        setCategory('Others');
      } else {
        setErrorMsg(result.error || "Transfer failed.");
        setGateStep(4);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error connecting to Zenith Core.");
      setGateStep(4);
    }
  };

  return (
    <div className="page-container">
      <div className="welcome-section">
        <div>
          <h1 className="welcome-title">Payments & Transfers</h1>
          <p className="welcome-subtitle">Send money securely to external accounts instantly.</p>
        </div>
      </div>

      <div className="payments-layout-grid">
        {/* Money Transfer Form */}
        <div className="zenith-card transfer-form-card">
          <h3>Send Money</h3>
          <p className="widget-subtitle">Immediate IMPS/NEFT Transfer</p>
          
          <form onSubmit={handleInitiateTransfer} className="transfer-form">
            <div className="form-group">
              <label>Recipient Full Name</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="E.g. Rahul Sharma"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                required
              />
            </div>

            <div className="form-double-row">
              <div className="form-group">
                <label>Account Number</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Enter account number"
                  value={recipientAccount}
                  onChange={e => setRecipientAccount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Bank Name / Branch</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="E.g. ICICI Bank"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-double-row">
              <div className="form-group">
                <label>Amount (INR)</label>
                <input 
                  type="number" 
                  min="1" 
                  step="any"
                  className="form-control font-semibold"
                  placeholder="₹ 0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select 
                  className="form-control"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Housing">Housing</option>
                  <option value="Transport">Transport</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Bills & Utilities">Bills & Utilities</option>
                  <option value="Others">Others</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Remark / Memo (Optional)</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="E.g. Monthly rent or Grocery share"
                value={remark}
                onChange={e => setRemark(e.target.value)}
              />
            </div>

            <div className="security-notice-strip">
              <span className="notice-icon">🛡️</span>
              <p>Transactions are protected with 256-bit encryption. Authorization via PIN and OTP is required.</p>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-4 py-3">Initiate Secure Transfer</button>
          </form>
        </div>

        {/* Quick Beneficiaries and Instructions */}
        <div className="payments-sidebar-grid">
          {/* Quick Pay Beneficiaries */}
          <div className="zenith-card saved-billers-card">
            <h3>Quick Transfer</h3>
            <p className="widget-subtitle">Select a saved beneficiary to pay instantly</p>
            
            <div className="billers-list">
              {savedBillers.map((biller, idx) => (
                <div key={idx} className="biller-item-row" onClick={() => handleQuickPay(biller)}>
                  <div className="biller-avatar">
                    {biller.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="biller-info">
                    <h4>{biller.name}</h4>
                    <p>{biller.bank} • A/C {biller.account.slice(-4)}</p>
                  </div>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* Secure Limits panel */}
          <div className="zenith-card transfer-limits-card">
            <h3>Daily Transfer Limits</h3>
            <div className="limit-item mt-4">
              <div className="limit-top">
                <span>IMPS Limit</span>
                <span className="limit-count">₹2,00,000 / ₹5,00,000</span>
              </div>
              <div className="limit-progress-bg">
                <div className="limit-progress-fill" style={{ width: '40%' }}></div>
              </div>
            </div>
            <div className="limit-item">
              <div className="limit-top">
                <span>UPI Limit</span>
                <span className="limit-count">₹76,850 / ₹1,00,000</span>
              </div>
              <div className="limit-progress-bg">
                <div className="limit-progress-fill" style={{ width: '76.8%', backgroundColor: 'var(--warning)' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Gateway Modal */}
      {showSecurityGate && (
        <div className="modal-overlay">
          <div className="modal-content security-gate-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setShowSecurityGate(false)}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Step 1: PIN Entry */}
            {gateStep === 1 && (
              <div className="gate-body">
                <div className="gate-icon-shield">🔐</div>
                <h3>Enter Transaction PIN</h3>
                <p className="modal-subtitle">Authorized signature needed to release funds. (Demo PIN: 1234)</p>
                
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
                <button className="btn btn-primary w-full mt-4" onClick={handleVerifyPIN}>Next</button>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {gateStep === 2 && (
              <div className="gate-body">
                <div className="gate-icon-shield">📱</div>
                <h3>Enter Two-Factor OTP</h3>
                <p className="modal-subtitle">A verification code has been dispatched to your mobile. (Demo OTP: 123456)</p>
                
                {errorMsg && <p className="gate-error-banner">{errorMsg}</p>}

                <div className="form-group mt-4">
                  <input 
                    type="text" 
                    maxLength="6"
                    className="form-control text-center font-bold"
                    style={{ fontSize: '22px', letterSpacing: '6px' }}
                    placeholder="------"
                    value={otp}
                    onChange={e => {
                      setErrorMsg('');
                      setOtp(e.target.value);
                    }}
                  />
                </div>
                <button className="btn btn-primary w-full mt-4" onClick={handleVerifyOTP}>Verify & Send</button>
              </div>
            )}

            {/* Step 3: Success Receipt */}
            {gateStep === 3 && successReceipt && (
              <div className="gate-body text-center">
                <span className="success-emoji-lg animate-bounce">✅</span>
                <h3 className="text-success">Transfer Successful!</h3>
                <p className="modal-subtitle">Transaction ID: {successReceipt.id}</p>
                
                <div className="receipt-box mt-4">
                  <div className="receipt-row">
                    <span>Beneficiary:</span>
                    <strong>{recipientName}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Account Number:</span>
                    <strong>{recipientAccount}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Amount Sent:</span>
                    <strong className="text-success">₹{parseFloat(amount).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Date & Time:</span>
                    <strong>{new Date(successReceipt.date).toLocaleString()}</strong>
                  </div>
                </div>
                
                <button className="btn btn-secondary w-full mt-6" onClick={() => setShowSecurityGate(false)}>Close</button>
              </div>
            )}

            {/* Step 4: Core Error */}
            {gateStep === 4 && (
              <div className="gate-body text-center">
                <span className="success-emoji-lg text-danger">❌</span>
                <h3 className="text-danger">Transfer Failed</h3>
                <p className="gate-error-banner mt-2">{errorMsg}</p>
                <button className="btn btn-primary w-full mt-6" onClick={() => setGateStep(1)}>Try Again</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
