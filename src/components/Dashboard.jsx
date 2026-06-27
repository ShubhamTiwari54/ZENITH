import React, { useState, useEffect } from 'react';

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
    upcoming: true,
    achievements: true,
    insights: true,
    recharge: true,
    cibil: true,
    investments: true,
    budgets: true,
    transactions: true
  });

  const [aiInsights, setAiInsights] = useState(null);
  const [achievementsState, setAchievementsState] = useState(null);
  const [dailyTipIndex, setDailyTipIndex] = useState(0);
  const [settingsSnapshot, setSettingsSnapshot] = useState(null);
  const [transactionQuery, setTransactionQuery] = useState('payments above 1000');
  const [transactionResults, setTransactionResults] = useState([]);

  // Dynamic utilities recharges list
  const [rechargesList, setRechargesList] = useState([]);
  const [showAddBiller, setShowAddBiller] = useState(false);
  const [billerTitle, setBillerTitle] = useState('');
  const [billerType, setBillerType] = useState('Mobile');
  const [billerProvider, setBillerProvider] = useState('Jio');
  const [billerAmount, setBillerAmount] = useState('');
  const [billerDetails, setBillerDetails] = useState('');

  // Voucher redemption state
  const [showRedemptionPanel, setShowRedemptionPanel] = useState(false);
  const [redemptionSuccessMsg, setRedemptionSuccessMsg] = useState('');

  const fetchRecharges = async () => {
    try {
      const res = await fetch('/api/recharges');
      if (res.ok) {
        const data = await res.json();
        setRechargesList(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAchievements = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.user?.achievements) {
          setAchievementsState(data.user.achievements);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (dashboardData) {
      fetch('/api/ai/insights')
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) setAiInsights(data);
        })
        .catch(err => console.error(err));

      fetchRecharges();
      fetchAchievements();
      fetch('/api/settings')
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) setSettingsSnapshot(data);
        })
        .catch(err => console.error(err));
    }
  }, [dashboardData]);

  if (loading || !dashboardData) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading Zenith Dashboard...</p>
      </div>
    );
  }

  const { user, accounts, creditCard, spendingBreakdown, financialHealthScore, upcomingPayments, offers } = dashboardData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handlePayBill = async (billId, title, amount) => {
    if (confirm(`Do you want to authorize immediate payment of ${formatCurrency(amount)} for your ${title}?`)) {
      await onPayBill(billId, title, amount);
      fetchAchievements(); // Reload achievements goal counter
    }
  };

  const toggleWidget = (widget) => {
    setVisibleWidgets(prev => ({
      ...prev,
      [widget]: !prev[widget]
    }));
  };

  const handleClaimStreak = async () => {
    try {
      const response = await fetch('/api/ai/achievements/claim', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        setAchievementsState(result.achievements);
        addNotification("Streak Claimed!", "Gained +50 Points! Keep up your healthy savings streak.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClaimGoal = async (goalId, points) => {
    try {
      const res = await fetch('/api/achievements/claim-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId })
      });
      if (res.ok) {
        const result = await res.json();
        setAchievementsState(result.achievements);
        addNotification("Goal Completed!", `Gained +${points} Points! Reward claimed successfully.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRedeemVoucher = async (cost, name) => {
    try {
      const res = await fetch('/api/achievements/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voucherCost: cost, voucherName: name })
      });
      if (res.ok) {
        const result = await res.json();
        setAchievementsState(result.achievements);
        addNotification("Points Redeemed", `Claimed ${name} for ${cost} Points! Check support log.`);
        setRedemptionSuccessMsg(`Claimed ${name}! Your gift card will be sent via email.`);
        setTimeout(() => setRedemptionSuccessMsg(''), 5000);
      } else {
        const err = await res.json();
        alert(err.error || "Redemption failed.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddBillerSubmit = async (e) => {
    e.preventDefault();
    if (!billerTitle || !billerAmount) return;
    try {
      const res = await fetch('/api/recharges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: billerTitle,
          type: billerType,
          provider: billerProvider,
          amount: billerAmount,
          details: billerDetails || `Saved ${billerType} Biller`
        })
      });
      if (res.ok) {
        addNotification("Biller Added", `Registered ${billerTitle} for quick utility payment.`);
        setBillerTitle('');
        setBillerAmount('');
        setBillerDetails('');
        setShowAddBiller(false);
        fetchRecharges();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickRecharge = async (rechargeItem) => {
    if (confirm(`Authorize ₹${rechargeItem.amount} ${rechargeItem.type} payment for ${rechargeItem.title} (${rechargeItem.provider})?`)) {
      try {
        const response = await fetch('/api/payments/pay-bill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ billId: 2 }) // Recharge billing simulation
        });
        if (response.ok) {
          addNotification("Recharge Complete", `${rechargeItem.type} recharge of ₹${rechargeItem.amount} was successful.`);
          fetchAchievements();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleTransactionSearch = async (e) => {
    e.preventDefault();
    if (!transactionQuery.trim()) return;
    try {
      const res = await fetch('/api/ai/search-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: transactionQuery })
      });
      if (res.ok) {
        const data = await res.json();
        setTransactionResults(data);
        addNotification("Transaction Search", `Found ${data.length} matching transactions.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good Morning";
    if (hr < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getSortedWidgets = () => {
    const completeLayout = ['insights', 'spending', 'health', 'budgets', 'upcoming', 'transactions', 'cibil', 'achievements', 'recharge', 'investments'];
    const savedLayout = user?.dashboardLayout || completeLayout;
    const defaultLayout = [...savedLayout, ...completeLayout.filter(widget => !savedLayout.includes(widget))];
    
    const hasUrgentBill = upcomingPayments.some(p => !p.paid && p.dueDays <= 3);
    const ccLimitAlert = creditCard && (creditCard.availableLimit / creditCard.totalLimit < 0.25);

    let layout = [...defaultLayout];

    if (hasUrgentBill) {
      layout = layout.filter(w => w !== 'upcoming');
      layout.unshift('upcoming');
    } else if (ccLimitAlert) {
      layout = layout.filter(w => w !== 'insights' && w !== 'spending');
      layout.unshift('spending');
      layout.unshift('insights');
    }

    return layout;
  };

  let totalBreakdownAmount = spendingBreakdown.reduce((sum, item) => sum + item.amount, 0) || 1;
  let accumulatedAngle = 0;
  const sortedWidgets = getSortedWidgets();
  const budgets = settingsSnapshot?.budgets || [];
  const investments = settingsSnapshot?.investments || {};
  const investmentSummary = investments.summary || {};
  const totalInvestments = Object.values(investmentSummary).reduce((sum, value) => sum + Number(value || 0), 0);
  const creditUtilization = Math.round(((creditCard.totalLimit - creditCard.availableLimit) / creditCard.totalLimit) * 100);
  const cibilPoints = [690, 705, 720, 742, 765, financialHealthScore.score || 790];

  return (
    <div className="page-container">
      <div className="welcome-section">
        <div>
          <h1 className="welcome-title">{getGreeting()}, {user.name} 👋</h1>
          <p className="welcome-subtitle">
            You spent 12% less than last month. You are close to your savings goal!
          </p>
        </div>
        <button className="btn btn-secondary btn-custom-view" onClick={() => setCustomizingView(!customizingView)}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9M5 20h9M19 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          Customize View
        </button>
      </div>

      {customizingView && (
        <div className="customize-panel">
          <h4>Toggle Dashboard Widgets</h4>
          <div className="customize-toggles">
            {Object.keys(visibleWidgets).map((widgetKey) => (
              <label key={widgetKey} className="toggle-label" style={{ textTransform: 'capitalize' }}>
                <input 
                  type="checkbox" 
                  checked={visibleWidgets[widgetKey]} 
                  onChange={() => toggleWidget(widgetKey)} 
                />
                {widgetKey === 'health' ? 'Financial Health' : widgetKey === 'upcoming' ? 'Upcoming Bills' : widgetKey}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Savings Balance Card */}
        <div className="kpi-card balance-card">
          <div className="card-top">
            <span style={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px' }}>SAVINGS ACCOUNT AVAILABLE</span>
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
          <h2 className="balance-amount font-display" style={{ fontSize: '28px', marginTop: '6px' }}>
            {hideBalance ? "₹ *,**,***.**" : formatCurrency(accounts.savings.availableBalance)}
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span>Ledger: {hideBalance ? "₹ *,**,***.**" : formatCurrency(accounts.savings.balance)}</span>
            <span>A/C: ...1098</span>
          </div>
        </div>

        {/* Current Balance Card */}
        <div className="kpi-card balance-card">
          <div className="card-top">
            <span style={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px' }}>CURRENT ACCOUNT AVAILABLE</span>
          </div>
          <h2 className="balance-amount font-display" style={{ fontSize: '28px', marginTop: '6px' }}>
            {hideBalance ? "₹ *,**,***.**" : formatCurrency(accounts.current.availableBalance)}
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span>Ledger: {hideBalance ? "₹ *,**,***.**" : formatCurrency(accounts.current.balance)}</span>
            <span>A/C: ...0987</span>
          </div>
        </div>

        {/* Credit Card Card */}
        <div className="kpi-card cc-widget font-display">
          <div className="cc-header">
            <span style={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px' }}>ZENITH CREDIT CARD</span>
            <div className="cc-chip">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <line x1="7" y1="4" x2="7" y2="20" />
                <line x1="17" y1="4" x2="17" y2="20" />
                <line x1="2" y1="12" x2="22" y2="12" />
              </svg>
            </div>
          </div>
          <h3 className="cc-number" style={{ fontSize: '18px', margin: '8px 0' }}>•••• •••• •••• {creditCard.cardNumber.slice(-4)}</h3>
          <div className="cc-details-row">
            <div>
              <span className="cc-label">Limit Used</span>
              <p className="cc-value">{((creditCard.totalLimit - creditCard.availableLimit) / creditCard.totalLimit * 100).toFixed(0)}%</p>
            </div>
            <div className="text-right">
              <span className="cc-label">Available Limit</span>
              <p className="cc-value">{formatCurrency(creditCard.availableLimit).split('.')[0]}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="widgets-container-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '24px' }}>
        {sortedWidgets.map((widgetName) => {
          if (!visibleWidgets[widgetName]) return null;

          switch (widgetName) {
            case 'spending':
              return (
                <div key="spending" className="zenith-card widget-card" id="spending-breakdown-card">
                  <h3>Spending Breakdown</h3>
                  <p className="widget-subtitle">This Month</p>
                  
                  <div className="spending-content">
                    <div className="donut-chart-container">
                      <svg viewBox="0 0 200 200" width="160" height="160" className="donut-svg">
                        <circle cx="100" cy="100" r="75" fill="none" stroke="#f5f6fa" strokeWidth="20" />
                        {spendingBreakdown.map((item, idx) => {
                          const percentage = (item.amount / totalBreakdownAmount) * 100;
                          const strokeDasharray = `${(percentage / 100) * 471} 471`;
                          const strokeDashoffset = `${-(accumulatedAngle / 100) * 471}`;
                          accumulatedAngle += percentage;
                          return (
                            <circle
                              key={idx}
                              cx="100" cy="100" r="75" fill="none" stroke={item.color} strokeWidth="20"
                              strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset}
                              transform="rotate(-90 100 100)" className="donut-segment"
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
              );
            case 'health':
              return (
                <div key="health" className="zenith-card widget-card health-card-align">
                  <h3>Financial Health Score</h3>
                  <div className="health-score-content">
                    <div className="gauge-container">
                      <svg viewBox="0 0 200 120" width="180" height="110" className="gauge-svg">
                        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#f5f6fa" strokeWidth="16" strokeLinecap="round" />
                        <path 
                          d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--primary)" strokeWidth="16" strokeLinecap="round"
                          strokeDasharray="251" strokeDashoffset={251 - (251 * ((financialHealthScore?.aiScore || 85) / 100))}
                          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                        />
                      </svg>
                      <div className="gauge-center-text">
                        <span className="gauge-score">{financialHealthScore?.aiScore || 85}</span>
                        <span className="gauge-label">Excellent</span>
                      </div>
                    </div>
                    <div className="health-details">
                      <div className="health-detail-row">
                        <span className="health-dot-indicator green-dot"></span>
                        <span className="health-lbl">Credit Score | </span>
                        <span className="health-val text-success">{financialHealthScore.score}</span>
                      </div>
                      <button className="view-report-link" onClick={() => setShowReport(true)}>
                        View Bureau Report
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px' }}>
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            case 'upcoming':
              return (
                <div key="upcoming" className="zenith-card widget-card">
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
                             {payment.type === 'credit_card' ? <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg> : <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>}
                          </div>
                          <div className="payment-info">
                            <h4>{payment.title}</h4>
                            <p>Due in {payment.dueDays} days</p>
                          </div>
                          <div className="payment-action-group">
                            <span className="payment-amt">{formatCurrency(payment.amount)}</span>
                            <button className="pay-btn-instant" onClick={() => handlePayBill(payment.id, payment.title, payment.amount)}>Pay</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            case 'insights':
              return (
                <div key="insights" className="zenith-card widget-card ai-insights-card" style={{ padding: '24px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 'bold' }}>🤖 AI Spending Insights</h3>
                  {aiInsights ? (
                    <div className="insights-container" style={{ marginTop: '16px' }}>
                      <p className="summary-sentence" style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: '16px' }}>{aiInsights.monthlySummary}</p>
                      <div className="insights-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {aiInsights.recommendations.map((rec, i) => (
                          <div key={i} className="insight-badge-item" style={{ background: 'var(--body-bg)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                            <span className="insight-cat-tag" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>{rec.category}</span>
                            <p className="insight-text" style={{ fontSize: '13px', marginTop: '8px', lineHeight: 1.4, color: 'var(--text-primary)' }}>{rec.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : <div className="insights-placeholder" style={{ padding: '40px', textAlign: 'center' }}><div className="spinner-sm"></div><p>Calculating insights...</p></div>}
                </div>
              );
            case 'achievements':
              return (
                <div key="achievements" className="zenith-card widget-card achievements-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>🏆 Achievements & Rewards</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-success" style={{ padding: '4px 10px', fontSize: '12px' }}>{achievementsState?.points || 450} pts</span>
                      <button 
                        type="button" 
                        className="btn btn-outline" 
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                        onClick={() => setShowRedemptionPanel(!showRedemptionPanel)}
                      >
                        Redeem
                      </button>
                    </div>
                  </div>

                  {redemptionSuccessMsg && <p style={{ color: 'var(--success)', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>{redemptionSuccessMsg}</p>}

                  {showRedemptionPanel ? (
                    <div className="redemption-panel" style={{ background: 'var(--body-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>Redeem Gift Vouchers</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                          { name: "₹500 Amazon Gift Card", cost: 2500 },
                          { name: "₹200 Statement Cashback", cost: 1000 },
                          { name: "Free Starbucks Latte", cost: 500 }
                        ].map((voucher, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid var(--card-border)' }}>
                            <div>
                              <p style={{ fontSize: '12px', fontWeight: 'bold' }}>{voucher.name}</p>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Cost: {voucher.cost} pts</span>
                            </div>
                            <button 
                              className="btn btn-primary" 
                              style={{ fontSize: '11px', padding: '4px 8px' }}
                              disabled={(achievementsState?.points || 450) < voucher.cost}
                              onClick={() => handleRedeemVoucher(voucher.cost, voucher.name)}
                            >
                              Redeem
                            </button>
                          </div>
                        ))}
                      </div>
                      <button className="btn btn-outline w-full mt-3" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => setShowRedemptionPanel(false)}>Back to Goals</button>
                    </div>
                  ) : (
                    achievementsState && (
                      <div className="achievements-content">
                        <div className="streak-indicator" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--body-bg)', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 'medium' }}>🔥 {achievementsState.streakDays}-Day Savings Streak</span>
                          <button className="btn btn-secondary py-1 px-3 text-xs" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={handleClaimStreak}>Claim Streak +50</button>
                        </div>
                        
                        <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px' }}>Gamified Monthly Goals</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {(achievementsState.goals || []).map((goal) => {
                            const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
                            return (
                              <div key={goal.id} style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                  <div>
                                    <h5 style={{ fontSize: '13px', fontWeight: 'bold' }}>{goal.title}</h5>
                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{goal.description}</p>
                                  </div>
                                  <div>
                                    {goal.claimed ? (
                                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>Claimed ✓</span>
                                    ) : (
                                      <button 
                                        className={`btn ${goal.current >= goal.target ? 'btn-primary' : 'btn-outline'}`}
                                        style={{ fontSize: '11px', padding: '4px 8px' }}
                                        disabled={goal.current < goal.target}
                                        onClick={() => handleClaimGoal(goal.id, goal.points)}
                                      >
                                        Claim +{goal.points}
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ flex: 1, height: '6px', background: 'var(--body-bg)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? 'var(--success)' : 'var(--primary)', borderRadius: '3px' }}></div>
                                  </div>
                                  <span style={{ fontSize: '11px', fontWeight: 'medium' }}>{goal.current}/{goal.target}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )}
                </div>
              );
            case 'recharge':
              return (
                <div key="recharge" className="zenith-card widget-card recharge-quick-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>⚡ Quick Utility Payments</h3>
                    <button 
                      type="button" 
                      className="btn btn-secondary py-1 px-3 text-xs" 
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                      onClick={() => setShowAddBiller(!showAddBiller)}
                    >
                      + Add Biller
                    </button>
                  </div>

                  {showAddBiller && (
                    <form onSubmit={handleAddBillerSubmit} className="add-biller-form" style={{ background: 'var(--body-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--card-border)', marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>New Biller details</h4>
                      <div className="form-group" style={{ marginBottom: '8px' }}>
                        <input type="text" className="form-control" style={{ fontSize: '12px', padding: '6px 10px' }} placeholder="Biller Name (e.g. Mom's Phone)" value={billerTitle} onChange={e => setBillerTitle(e.target.value)} required />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <select className="form-control" style={{ fontSize: '12px', padding: '6px 10px', flex: 1 }} value={billerType} onChange={e => setBillerType(e.target.value)}>
                          <option value="Mobile">Mobile</option>
                          <option value="Electricity">Electricity</option>
                          <option value="TV">TV / DTH</option>
                          <option value="Water">Water</option>
                        </select>
                        <input type="text" className="form-control" style={{ fontSize: '12px', padding: '6px 10px', flex: 1 }} placeholder="Provider (e.g. Jio, BESCOM)" value={billerProvider} onChange={e => setBillerProvider(e.target.value)} required />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input type="number" className="form-control" style={{ fontSize: '12px', padding: '6px 10px', flex: 1 }} placeholder="Default Bill (₹)" value={billerAmount} onChange={e => setBillerAmount(e.target.value)} required />
                        <input type="text" className="form-control" style={{ fontSize: '12px', padding: '6px 10px', flex: 1 }} placeholder="Consumer/Mobile ID" value={billerDetails} onChange={e => setBillerDetails(e.target.value)} />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-outline" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => setShowAddBiller(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ fontSize: '11px', padding: '4px 8px' }}>Save Biller</button>
                      </div>
                    </form>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {rechargesList.length === 0 ? (
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>No saved billers.</p>
                    ) : (
                      rechargesList.map((item) => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--body-bg)', padding: '12px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ fontSize: '20px', width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {item.type === 'Mobile' ? '📱' : item.type === 'Electricity' ? '💡' : item.type === 'TV' ? '📺' : '💧'}
                            </div>
                            <div>
                              <h4 style={{ fontSize: '13px', fontWeight: 'bold' }}>{item.title}</h4>
                              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.provider} • {item.details}</p>
                            </div>
                          </div>
                          <div style={{ textAlignment: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--primary)' }}>₹{item.amount}</span>
                            <button 
                              className="btn btn-primary" 
                              style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px' }} 
                              onClick={() => handleQuickRecharge(item)}
                            >
                              Pay
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            case 'budgets':
              return (
                <div key="budgets" className="zenith-card widget-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Budget Progress</h3>
                  <p className="widget-subtitle">Category limits with live spend tracking</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                    {budgets.map((budget) => {
                      const pct = Math.min(100, Math.round((budget.spent / budget.limit) * 100));
                      const overLimit = budget.spent > budget.limit;
                      return (
                        <div key={budget.category}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '13px', marginBottom: '6px' }}>
                            <strong>{budget.category}</strong>
                            <span style={{ color: overLimit ? 'var(--danger)' : 'var(--text-secondary)' }}>
                              {formatCurrency(budget.spent).split('.')[0]} / {formatCurrency(budget.limit).split('.')[0]}
                            </span>
                          </div>
                          <div style={{ height: '8px', background: 'var(--body-bg)', borderRadius: '999px', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: overLimit ? 'var(--danger)' : 'var(--primary)' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            case 'transactions':
              return (
                <div key="transactions" className="zenith-card widget-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Recent Transactions & AI Search</h3>
                  <form onSubmit={handleTransactionSearch} style={{ display: 'flex', gap: '8px', margin: '16px 0' }}>
                    <input
                      className="form-control"
                      value={transactionQuery}
                      onChange={e => setTransactionQuery(e.target.value)}
                      placeholder="Try: food above 500, June salary, utility bills"
                      style={{ fontSize: '13px' }}
                    />
                    <button className="btn btn-primary" type="submit" style={{ whiteSpace: 'nowrap' }}>Search</button>
                  </form>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(transactionResults.length ? transactionResults : (settingsSnapshot?.transactions || []).slice(0, 5)).map((txn) => (
                      <div key={txn.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--card-border)' }}>
                        <div>
                          <strong style={{ fontSize: '13px' }}>{txn.merchant}</strong>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{txn.description} | {txn.category}</p>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: txn.type === 'credit' ? 'var(--success)' : 'var(--text-primary)' }}>
                          {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount).split('.')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            case 'cibil':
              return (
                <div key="cibil" className="zenith-card widget-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>CIBIL Score & Eligibility</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '40px', fontWeight: 'bold', color: 'var(--primary)' }}>{financialHealthScore.score}</span>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Excellent bureau standing</p>
                    </div>
                    <svg viewBox="0 0 240 90" width="180" height="72">
                      <polyline
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={cibilPoints.map((point, idx) => `${idx * 44 + 10},${80 - ((point - 650) / 220) * 70}`).join(' ')}
                      />
                    </svg>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                    <div style={{ background: 'var(--body-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Utilization</p>
                      <strong>{creditUtilization}% used</strong>
                    </div>
                    <div style={{ background: 'var(--body-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Loan offer</p>
                      <strong>Zero fee eligible</strong>
                    </div>
                  </div>
                </div>
              );
            case 'investments':
              return (
                <div key="investments" className="zenith-card widget-card" style={{ padding: '24px' }}>
                  <div className="widget-header-row">
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Investment Snapshot</h3>
                    <button className="view-all-link" onClick={() => onPromoAction('investments')}>Open</button>
                  </div>
                  <p style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '12px' }}>{formatCurrency(totalInvestments).split('.')[0]}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                    {Object.entries(investmentSummary).map(([key, value]) => (
                      <div key={key} style={{ background: 'var(--body-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</p>
                        <strong style={{ fontSize: '13px' }}>{formatCurrency(value).split('.')[0]}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              );
            default: return null;
          }
        })}
      </div>

      {aiInsights?.dailyTips && (
        <div className="zenith-card daily-tips-ticker mt-6" style={{ background: 'var(--primary-glow)', border: '1px solid var(--card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>💡</span>
            <div style={{ flex: 1 }}>
              <h5 style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>ZENITH DAILY FINANCIAL TIP</h5>
              <p style={{ fontSize: '13px', fontStyle: 'italic', marginTop: '2px' }}>{aiInsights.dailyTips[dailyTipIndex]}</p>
            </div>
            <button className="btn-next-tip" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' }} onClick={() => setDailyTipIndex((dailyTipIndex + 1) % aiInsights.dailyTips.length)}>➔</button>
          </div>
        </div>
      )}

      <div className="offers-section">
        <h3>Offers for You</h3>
        <div className="offers-grid">
          {offers.map(offer => (
            <div key={offer.id} className="zenith-card offer-card">
              <div className="offer-badge-row">
                <span className="badge badge-success">{offer.badge}</span>
                <span className="offer-code" title="Click to copy" onClick={() => { navigator.clipboard.writeText(offer.code); addNotification("Promo Code Copied", `Copied ${offer.code}`); }}>{offer.code}</span>
              </div>
              <h4 className="offer-title">{offer.title}</h4>
              <p className="offer-subtitle">{offer.subtitle}</p>
              <div className="offer-bottom">
                <span className="offer-reward">{offer.reward}</span>
                <button className="offer-link-btn" onClick={() => onPromoAction(offer.badge.toLowerCase())}>
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

      {showReport && (
        <div className="modal-overlay" onClick={() => setShowReport(false)}>
          <div className="modal-content credit-report-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setShowReport(false)}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
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
