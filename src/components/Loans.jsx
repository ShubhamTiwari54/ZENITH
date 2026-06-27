import React, { useState, useEffect } from 'react';

export default function Loans({ 
  loans, 
  balance, 
  onLoanApproved, 
  addNotification,
  prefilledLoan,
  clearPrefilledLoan
}) {
  const [loanType, setLoanType] = useState('Personal Loan');
  const [loanAmount, setLoanAmount] = useState(100000);
  const [loanTenure, setLoanTenure] = useState(24);

  const rates = {
    'Personal Loan': 10.5,
    'Car Loan': 8.75,
    'Home Loan': 7.25
  };

  useEffect(() => {
    if (prefilledLoan) {
      const type = prefilledLoan.type || 'Personal Loan';
      const amount = prefilledLoan.amount || 100000;
      const tenure = prefilledLoan.tenureMonths || 24;
      setLoanType(type);
      setLoanAmount(amount);
      setLoanTenure(tenure);
      clearPrefilledLoan();

      setTimeout(() => {
        if (window.confirm(`Confirm: Apply for a ${type} of ${formatCurrency(amount)} for ${tenure} months?`)) {
          fetch('/api/loans/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type,
              amount,
              tenureMonths: tenure
            })
          }).then(res => {
            if (res.ok) {
              onLoanApproved();
              addNotification(
                "Loan Approved", 
                `Your ${type} of ${formatCurrency(amount)} has been disbursed to your savings account!`
              );
            } else {
              alert("Loan application failed.");
            }
          }).catch(err => console.error(err));
        }
      }, 100);
    }
  }, [prefilledLoan]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // EMI calculator math
  const calculateEMI = () => {
    const rate = rates[loanType];
    const monthlyRate = (rate / 12) / 100;
    const n = loanTenure;
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    return isNaN(emi) ? 0 : parseFloat(emi.toFixed(2));
  };

  const emiVal = calculateEMI();
  const totalPayable = emiVal * loanTenure;
  const interestPayable = totalPayable - loanAmount;

  // Apply for loan handler
  const handleApplyLoan = async (e) => {
    e.preventDefault();
    if (confirm(`Do you wish to submit an application for a ${loanType} of ${formatCurrency(loanAmount)} for ${loanTenure} months?`)) {
      try {
        const response = await fetch('/api/loans/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: loanType,
            amount: loanAmount,
            tenureMonths: loanTenure
          })
        });

        if (response.ok) {
          onLoanApproved(); // Refresh state
          addNotification(
            "Loan Approved", 
            `Your ${loanType} of ${formatCurrency(loanAmount)} has been disbursed to your savings account!`
          );
        } else {
          alert("Loan application failed.");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Pay EMI handler
  const handlePayEMI = async (loanId, loanType, emi) => {
    if (balance < emi) {
      alert("Insufficient available balance in savings account to pay this EMI.");
      return;
    }

    if (confirm(`Authorize EMI payment of ${formatCurrency(emi)} for your ${loanType}?`)) {
      try {
        // We will simulate payment by posting a transaction for the EMI
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientName: `Zenith Loans Dept`,
            recipientAccount: `LOAN-PAY-${loanId}`,
            amount: emi,
            category: 'Housing',
            remark: `${loanType} EMI Payment`,
            pin: '1234' // Hardcoded demo PIN
          })
        });

        if (response.ok) {
          onLoanApproved(); // Refresh balance and loans list
          addNotification("EMI Paid", `Successfully paid EMI of ${formatCurrency(emi)}.`);
        } else {
          alert("Failed to pay EMI.");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="page-container">
      <div className="welcome-section">
        <div>
          <h1 className="welcome-title">Zenith Loan Services</h1>
          <p className="welcome-subtitle">Apply for new loans and manage your active EMI repayments.</p>
        </div>
      </div>

      <div className="loans-layout-grid">
        {/* Active Loans */}
        <div className="active-loans-section">
          <div className="zenith-card active-loans-card">
            <h3>Active Loan Accounts</h3>
            <p className="widget-subtitle">Ongoing EMI Repayments</p>
            
            <div className="loans-list mt-4">
              {loans?.length === 0 ? (
                <p className="text-secondary text-center py-6">No active loans found.</p>
              ) : (
                loans?.map(loan => (
                  <div key={loan.id} className="loan-account-item">
                    <div className="loan-item-top">
                      <div>
                        <h4>{loan.type}</h4>
                        <span className="loan-rate-badge">{loan.rate}% p.a.</span>
                      </div>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handlePayEMI(loan.id, loan.type, loan.monthlyEMI)}
                      >
                        Pay EMI
                      </button>
                    </div>
                    
                    <div className="loan-details-grid mt-4">
                      <div className="detail-box">
                        <span>Original Amount</span>
                        <strong>{formatCurrency(loan.amount)}</strong>
                      </div>
                      <div className="detail-box">
                        <span>Remaining Balance</span>
                        <strong className="text-danger">{formatCurrency(loan.remaining)}</strong>
                      </div>
                      <div className="detail-box">
                        <span>Monthly EMI</span>
                        <strong>{formatCurrency(loan.monthlyEMI)}</strong>
                      </div>
                      <div className="detail-box">
                        <span>Next Due Date</span>
                        <strong>{loan.nextDueDate}</strong>
                      </div>
                    </div>
                    
                    <div className="loan-progress-row mt-4">
                      <div className="progress-lbl">
                        <span>Repayment Progress</span>
                        <span>{loan.paidMonths} / {loan.tenureMonths} Months</span>
                      </div>
                      <div className="limit-progress-bg">
                        <div className="limit-progress-fill" style={{ width: `${(loan.paidMonths / loan.tenureMonths) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* EMI Calculator */}
        <div className="loans-calculator-section">
          <div className="zenith-card loan-calc-card">
            <h3>EMI Calculator & Application</h3>
            <p className="widget-subtitle">Calculate monthly interest rates and apply instantly</p>
            
            <form onSubmit={handleApplyLoan}>
              <div className="form-group mt-4">
                <label>Loan Purpose / Category</label>
                <select 
                  className="form-control"
                  value={loanType}
                  onChange={e => setLoanType(e.target.value)}
                >
                  <option value="Personal Loan">Personal Loan (10.5%)</option>
                  <option value="Car Loan">Car Loan (8.75%)</option>
                  <option value="Home Loan">Home Loan (7.25%)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Desired Amount: {formatCurrency(loanAmount).split('.')[0]}</label>
                <input 
                  type="range" 
                  min="50000" 
                  max="1500000" 
                  step="25000"
                  className="limit-range-slider"
                  value={loanAmount}
                  onChange={e => setLoanAmount(parseInt(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label>Tenure Period: {loanTenure} Months</label>
                <input 
                  type="range" 
                  min="12" 
                  max="84" 
                  step="6"
                  className="limit-range-slider"
                  value={loanTenure}
                  onChange={e => setLoanTenure(parseInt(e.target.value))}
                />
              </div>

              <div className="calculator-outputs mt-4">
                <div className="output-row">
                  <span>Monthly EMI Quote:</span>
                  <strong className="text-primary font-display" style={{ fontSize: '18px' }}>
                    {formatCurrency(emiVal)}
                  </strong>
                </div>
                <div className="output-row">
                  <span>Total Interest Cost:</span>
                  <span className="text-secondary">{formatCurrency(interestPayable)}</span>
                </div>
                <div className="output-row">
                  <span>Total Loan Payback:</span>
                  <span className="text-secondary">{formatCurrency(totalPayable)}</span>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full mt-4 py-3">Apply & Disburse Loan</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
