import React, { useState } from 'react';

export default function Dashboard({ 
  dashboardData, 
  loading, 
  onPayBill, 
  onPromoAction,
  addNotification 
}) {
  const [hideBalance, setHideBalance] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [customizingView, setCustomizingView] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState({
    spending: true,
    health: true,
    upcoming: true
  });

  if (loading || !dashboardData) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading Zenith Dashboard...</p>
      </div>
    );
  }

  const { user, accounts, monthlyIncome, monthlyExpenses, creditCard, spendingBreakdown, financialHealthScore, upcomingPayments, offers } = dashboardData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Quick Pay bill handler
  const handlePayBill = async (billId, title, amount) => {
    if (confirm(`Do you want to authorize immediate payment of ${formatCurrency(amount)} for your ${title}?`)) {
      await onPayBill(billId, title, amount);
    }
  };

  // Customize View toggle
  const toggleWidget = (widget) => {
    setVisibleWidgets(prev => ({
      ...prev,
      [widget]: !prev[widget]
    }));
  };

  // ==========================================
  // Spending Breakdown chart Math (SVG Donut)
  // Sums up all category expenditures to calculate percentage angles.
  // Fallback to 1 to prevent division-by-zero (NaN) if total expenses are zero.
  // ==========================================
  let totalBreakdownAmount = spendingBreakdown.reduce((sum, item) => sum + item.amount, 0) || 1;
  let accumulatedAngle = 0;


  return (
    <div className="page-container">
      {/* Welcome Header */}
      <div className="welcome-section">
        <div>
          <h1 className="welcome-title">Hello, {user.name} 👋</h1>
          <p className="welcome-subtitle">You're doing great! Keep building your financial future.</p>
        </div>
        <button className="btn btn-secondary btn-custom-view" onClick={() => setCustomizingView(!customizingView)}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9M5 20h9M19 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          Customize View
        </button>
      </div>

      {/* Customizer Panel */}
      {customizingView && (
        <div className="customize-panel">
          <h4>Toggle Dashboard Widgets</h4>
          <div className="customize-toggles">
            <label className="toggle-label">
              <input 
                type="checkbox" 
                checked={visibleWidgets.spending} 
                onChange={() => toggleWidget('spending')} 
              />
              Spending Breakdown
            </label>
            <label className="toggle-label">
              <input 
                type="checkbox" 
                checked={visibleWidgets.health} 
                onChange={() => toggleWidget('health')} 
              />
              Financial Health Score
            </label>
            <label className="toggle-label">
              <input 
                type="checkbox" 
                checked={visibleWidgets.upcoming} 
                onChange={() => toggleWidget('upcoming')} 
              />
              Upcoming Payments
            </label>
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div className="kpi-grid">
        {/* Total Balance Card */}
        <div className="kpi-card balance-card">
          <div className="card-top">
            <span>Total Balance</span>
            <button className="icon-btn-toggle" onClick={() => setHideBalance(!hideBalance)} title={hideBalance ? "Show balance" : "Hide balance"}>
              {hideBalance ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          <h2 className="balance-amount font-display">
            {hideBalance ? "₹ *,**,***.**" : formatCurrency(accounts.savings.balance)}
          </h2>
          <p className="available-sub">
            Available {hideBalance ? "₹ *,**,***.**" : formatCurrency(accounts.savings.availableBalance)}
          </p>
        </div>

        {/* Monthly Income Card */}
        <div className="kpi-card text-dark-kpi">
          <div className="card-top">
            <span className="kpi-title">Monthly Income</span>
          </div>
          <h2 className="kpi-value font-display">{formatCurrency(monthlyIncome)}</h2>
          <p className="trend-up font-semibold">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px' }}>
              <polyline points="18 15 12 9 6 15" />
            </svg>
            +9.3% <span className="trend-sub">vs last month</span>
          </p>
        </div>

        {/* Monthly Expenses Card */}
        <div className="kpi-card text-dark-kpi">
          <div className="card-top">
            <span className="kpi-title">Monthly Expenses</span>
          </div>
          <h2 className="kpi-value font-display">{formatCurrency(monthlyExpenses)}</h2>
          <p className="trend-down font-semibold">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
            -5.2% <span className="trend-sub">vs last month</span>
          </p>
        </div>

        {/* Credit Card Widget */}
        <div className="kpi-card cc-widget font-display">
          <div className="cc-header">
            <span>Credit Card</span>
            <div className="cc-chip">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <line x1="7" y1="4" x2="7" y2="20" />
                <line x1="17" y1="4" x2="17" y2="20" />
                <line x1="2" y1="12" x2="22" y2="12" />
              </svg>
            </div>
          </div>
          <div className="cc-number">
            xxxx xxxx xxxx {creditCard.cardNumber ? creditCard.cardNumber.slice(-4) : "4567"}
          </div>
          <div className="cc-details">
            <div>
              <span className="cc-label">Available Limit</span>
              <span className="cc-limit-val">{formatCurrency(creditCard.availableLimit)}</span>
            </div>
            <div className="cc-logo">VISA</div>
          </div>
        </div>
      </div>

      {/* Middle Widgets Grid */}
      <div className="middle-widgets-grid">
        {/* Spending Breakdown Widget */}
        {visibleWidgets.spending && (
          <div className="zenith-card widget-card">
            <h3>Spending Breakdown</h3>
            <p className="widget-subtitle">This Month</p>
            
            <div className="spending-content">
              {/* Donut Chart */}
              <div className="donut-chart-container">
                <svg viewBox="0 0 200 200" width="160" height="160" className="donut-svg">
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="75" 
                    fill="none" 
                    stroke="#f5f6fa" 
                    strokeWidth="20" 
                  />
                  {spendingBreakdown.map((item, idx) => {
                    const percentage = (item.amount / totalBreakdownAmount) * 100;
                    const strokeDasharray = `${(percentage / 100) * 471} 471`;
                    const strokeDashoffset = `${-(accumulatedAngle / 100) * 471}`;
                    accumulatedAngle += percentage;

                    return (
                      <circle
                        key={idx}
                        cx="100"
                        cy="100"
                        r="75"
                        fill="none"
                        stroke={item.color}
                        strokeWidth="20"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 100 100)"
                        className="donut-segment"
                        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                      />
                    );
                  })}
                </svg>
                <div className="donut-inner-text">
                  <span className="inner-amt">{formatCurrency(totalBreakdownAmount).split('.')[0]}</span>
                  <span className="inner-lbl">Total Spent</span>
                </div>
              </div>

              {/* Legend */}
              <div className="spending-legend">
                {spendingBreakdown.map((item, idx) => (
                  <div key={idx} className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: item.color }} />
                    <span className="legend-name">{item.category}</span>
                    <span className="legend-percent">{item.percentage}%</span>
                    <span className="legend-amount">{formatCurrency(item.amount).split('.')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Financial Health Score Widget */}
        {visibleWidgets.health && (
          <div className="zenith-card widget-card health-card-align">
            <h3>Financial Health Score</h3>
            
            <div className="health-score-content">
              <div className="gauge-container">
                <svg viewBox="0 0 200 120" width="180" height="110" className="gauge-svg">
                  {/* Background Arc */}
                  <path 
                    d="M 20 100 A 80 80 0 0 1 180 100" 
                    fill="none" 
                    stroke="#f5f6fa" 
                    strokeWidth="16" 
                    strokeLinecap="round" 
                  />
                  {/* Active Score Arc (790/850 score is ~92%) */}
                  <path 
                    d="M 20 100 A 80 80 0 0 1 180 100" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="16" 
                    strokeLinecap="round"
                    strokeDasharray="251"
                    strokeDashoffset={251 - (251 * (financialHealthScore.score / 850))}
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                  />
                </svg>
                <div className="gauge-center-text">
                  <span className="gauge-score">{financialHealthScore.score}</span>
                  <span className="gauge-label">{financialHealthScore.creditUtilization === 'Good' ? 'Very Good' : financialHealthScore.creditUtilization}</span>
                </div>
              </div>
              
              <div className="health-details">
                <div className="health-detail-row">
                  <span className="health-dot-indicator green-dot"></span>
                  <span className="health-lbl">Credit Utilization |</span>
                  <span className="health-val text-success">Good</span>
                </div>
                <button className="view-report-link" onClick={() => setShowReport(true)}>
                  View Full Report 
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px' }}>
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Payments Widget */}
        {visibleWidgets.upcoming && (
          <div className="zenith-card widget-card">
            <div className="widget-header-row">
              <h3>Upcoming Payments</h3>
              <button className="view-all-link" onClick={() => onPromoAction('payments')}>View All</button>
            </div>
            
            <div className="upcoming-payments-list">
              {upcomingPayments.length === 0 ? (
                <div className="no-bills">
                  <span className="success-emoji">🎉</span>
                  <p>All bills paid! No upcoming bills.</p>
                </div>
              ) : (
                upcomingPayments.map(payment => (
                  <div key={payment.id} className="payment-row-item">
                    <div className="payment-icon-box">
                      {payment.type === 'credit_card' ? (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                          <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                      ) : payment.type === 'mobile' ? (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                          <line x1="12" y1="18" x2="12.01" y2="18" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                          <circle cx="12" cy="20" r="1" />
                        </svg>
                      )}
                    </div>
                    
                    <div className="payment-info">
                      <h4>{payment.title}</h4>
                      <p>Due in {payment.dueDays} days</p>
                    </div>
                    
                    <div className="payment-action-group">
                      <span className="payment-amt">{formatCurrency(payment.amount)}</span>
                      <button 
                        className="pay-btn-instant"
                        onClick={() => handlePayBill(payment.id, payment.title, payment.amount)}
                      >
                        Pay
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Offers for You Section */}
      <div className="offers-section">
        <h3>Offers for You</h3>
        
        <div className="offers-grid">
          {offers.map(offer => (
            <div key={offer.id} className="zenith-card offer-card">
              <div className="offer-badge-row">
                <span className="badge badge-success">{offer.badge}</span>
                <span className="offer-code" title="Click to copy" onClick={() => {
                  navigator.clipboard.writeText(offer.code);
                  addNotification("Promo Code Copied", `Copied code ${offer.code} to your clipboard.`);
                }}>
                  {offer.code}
                </span>
              </div>
              <h4 className="offer-title">{offer.title}</h4>
              <p className="offer-subtitle">{offer.subtitle}</p>
              
              <div className="offer-bottom">
                <span className="offer-reward">{offer.reward}</span>
                <button 
                  className="offer-link-btn"
                  onClick={() => onPromoAction(offer.badge.toLowerCase())}
                >
                  {offer.link}
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px' }}>
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Credit Report Modal */}
      {showReport && (
        <div className="modal-overlay" onClick={() => setShowReport(false)}>
          <div className="modal-content credit-report-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setShowReport(false)}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            
            <div className="modal-report-header">
              <span className="report-badge">790 / 850</span>
              <h2>Credit Rating Report</h2>
              <p>Powered by Zenith Bureau Insights</p>
            </div>
            
            <div className="report-factors">
              <div className="factor-row">
                <div className="factor-name">
                  <h4>Payment History</h4>
                  <p>On-time bill payment history</p>
                </div>
                <div className="factor-grade text-success">{financialHealthScore.paymentHistory} (Excellent)</div>
              </div>
              <div className="factor-row">
                <div className="factor-name">
                  <h4>Credit Utilization</h4>
                  <p>Ratio of balance to credit limits</p>
                </div>
                <div className="factor-grade text-success">{financialHealthScore.creditUtilization} (15% used)</div>
              </div>
              <div className="factor-row">
                <div className="factor-name">
                  <h4>Derogatory Marks</h4>
                  <p>Late payments or bank reports</p>
                </div>
                <div className="factor-grade text-success">{financialHealthScore.derogatoryMarks} (0 marks)</div>
              </div>
              <div className="factor-row">
                <div className="factor-name">
                  <h4>Age of Credit</h4>
                  <p>Average age of accounts</p>
                </div>
                <div className="factor-grade text-warning">{financialHealthScore.ageOfCredit} (4.5 years)</div>
              </div>
            </div>
            
            <div className="report-footer">
              <p>Your credit rating puts you in the top 8% of banking clients nationwide. You are eligible for zero-processing fees on loans.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
