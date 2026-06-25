import React, { useState } from 'react';

export default function Investments({ investments, balance, onTrade, onOpenFD, addNotification }) {
  const [tradeSymbol, setTradeSymbol] = useState('ZENITH');
  const [tradeShares, setTradeShares] = useState('');
  const [tradeAction, setTradeAction] = useState('buy');
  
  // FD Calculator state
  const [fdAmount, setFdAmount] = useState(50000);
  const [fdTerm, setFdTerm] = useState(12);
  const [fdAutoRenew, setFdAutoRenew] = useState(true);

  // Asset prices
  const assetPrices = {
    'ZENITH': 185,
    'TCS': 3450,
    'RELIANCE': 2450
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Stock trading handler
  const handleTradeSubmit = async (e) => {
    e.preventDefault();
    const count = parseInt(tradeShares);
    if (isNaN(count) || count <= 0) {
      alert("Please enter a valid share count.");
      return;
    }

    const price = assetPrices[tradeSymbol];
    const totalCost = count * price;

    if (tradeAction === 'buy' && balance < totalCost) {
      alert("Insufficient funds in savings account to complete purchase.");
      return;
    }

    if (confirm(`Confirm ${tradeAction.toUpperCase()} order: ${count} shares of ${tradeSymbol} for ${formatCurrency(totalCost)}?`)) {
      try {
        const response = await fetch('/api/investments/trade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbol: tradeSymbol,
            shares: count,
            type: 'stock',
            currentPrice: price,
            action: tradeAction
          })
        });

        if (response.ok) {
          onTrade(); // Refresh state
          addNotification(
            "Order Executed", 
            `Successfully ${tradeAction === 'buy' ? 'bought' : 'sold'} ${count} shares of ${tradeSymbol}.`
          );
          setTradeShares('');
        } else {
          const res = await response.json();
          alert(res.error || "Trade failed.");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // FD Creator handler
  const handleCreateFD = async (e) => {
    e.preventDefault();
    if (balance < fdAmount) {
      alert("Insufficient funds in savings account to open this Fixed Deposit.");
      return;
    }

    if (confirm(`Open a Fixed Deposit of ${formatCurrency(fdAmount)} for ${fdTerm} months at 7.5% interest rate?`)) {
      try {
        const response = await fetch('/api/investments/fd', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: fdAmount,
            termMonths: fdTerm,
            autoRenew: fdAutoRenew
          })
        });

        if (response.ok) {
          onOpenFD(); // Refresh state
          addNotification("Fixed Deposit Opened", `Created FD of ${formatCurrency(fdAmount)} successfully.`);
        } else {
          const res = await response.json();
          alert(res.error || "FD creation failed.");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // FD calculations
  const calculateFDInterest = () => {
    const rate = 7.5;
    const interest = (fdAmount * rate * (fdTerm / 12)) / 100;
    return {
      interest,
      total: fdAmount + interest
    };
  };

  const fdCalc = calculateFDInterest();

  // Total Portfolio value
  const totalPortfolioValue = (investments?.summary.stocks || 0) + 
                               (investments?.summary.mutualFunds || 0) + 
                               (investments?.summary.gold || 0) + 
                               (investments?.summary.fixedDeposits || 0);

  return (
    <div className="page-container">
      <div className="welcome-section">
        <div>
          <h1 className="welcome-title">Zenith Wealth Management</h1>
          <p className="welcome-subtitle">Grow your assets with our hyperpersonalized portfolio recommendations.</p>
        </div>
      </div>

      {/* Portfolio overview blocks */}
      <div className="wealth-grid-overview">
        {/* Total Wealth */}
        <div className="zenith-card wealth-summary-card">
          <span>Net Portfolio Value</span>
          <h2>{formatCurrency(totalPortfolioValue)}</h2>
          <div className="allocation-indicators">
            <div className="alloc-bar" title="Stocks" style={{ width: `${((investments?.summary.stocks || 0)/totalPortfolioValue)*100}%`, backgroundColor: '#7B61FF' }} />
            <div className="alloc-bar" title="Mutual Funds" style={{ width: `${((investments?.summary.mutualFunds || 0)/totalPortfolioValue)*100}%`, backgroundColor: '#10B981' }} />
            <div className="alloc-bar" title="Gold" style={{ width: `${((investments?.summary.gold || 0)/totalPortfolioValue)*100}%`, backgroundColor: '#F59E0B' }} />
            <div className="alloc-bar" title="Fixed Deposits" style={{ width: `${((investments?.summary.fixedDeposits || 0)/totalPortfolioValue)*100}%`, backgroundColor: '#3B82F6' }} />
          </div>
          <div className="alloc-labels mt-4">
            <span style={{color: '#7B61FF'}}>● Stocks ({Math.round(((investments?.summary.stocks || 0)/totalPortfolioValue)*100)}%)</span>
            <span style={{color: '#10B981'}}>● Funds ({Math.round(((investments?.summary.mutualFunds || 0)/totalPortfolioValue)*100)}%)</span>
            <span style={{color: '#F59E0B'}}>● Gold ({Math.round(((investments?.summary.gold || 0)/totalPortfolioValue)*100)}%)</span>
            <span style={{color: '#3B82F6'}}>● FD ({Math.round(((investments?.summary.fixedDeposits || 0)/totalPortfolioValue)*100)}%)</span>
          </div>
        </div>

        {/* Dynamic Performance Chart */}
        <div className="zenith-card wealth-chart-card">
          <h3>Growth Performance</h3>
          <p className="widget-subtitle">6 Months Asset Growth</p>
          
          <div className="invest-chart-wrapper">
            <svg viewBox="0 0 500 150" className="invest-line-chart">
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" />
              
              {/* Trend Line (Simulated path) */}
              <path 
                d="M 10 130 Q 100 110 180 80 T 350 40 T 490 15" 
                fill="none" 
                stroke="var(--primary)" 
                strokeWidth="3.5" 
                strokeLinecap="round"
              />
              {/* Area fill */}
              <path 
                d="M 10 130 Q 100 110 180 80 T 350 40 T 490 15 L 490 150 L 10 150 Z" 
                fill="url(#chartGrad)"
                opacity="0.1"
              />
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <div className="chart-months-x">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main trading & FD layout */}
      <div className="invest-actions-layout">
        {/* Trade portal */}
        <div className="wealth-interactive-section">
          {/* Equity Holdings */}
          <div className="zenith-card equity-holdings-card">
            <h3>Equity Portfolio</h3>
            <p className="widget-subtitle">Active Stocks and Shares</p>
            
            <div className="holdings-list-table">
              <table className="holdings-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Shares Owned</th>
                    <th>Avg Price</th>
                    <th>Current Price</th>
                    <th>Total Value</th>
                    <th>Returns</th>
                  </tr>
                </thead>
                <tbody>
                  {investments?.holdings.map((hold, index) => {
                    const value = hold.shares * hold.currentPrice;
                    const returns = (hold.currentPrice - hold.avgPrice) * hold.shares;
                    const returnsPercent = ((hold.currentPrice - hold.avgPrice) / hold.avgPrice) * 100;
                    return (
                      <tr key={index}>
                        <td className="font-semibold">{hold.symbol}</td>
                        <td>{hold.shares}</td>
                        <td>{formatCurrency(hold.avgPrice)}</td>
                        <td>{formatCurrency(hold.currentPrice)}</td>
                        <td className="font-semibold">{formatCurrency(value)}</td>
                        <td className={returns >= 0 ? "text-success font-semibold" : "text-danger font-semibold"}>
                          {returns >= 0 ? '+' : ''}{formatCurrency(returns)} ({returnsPercent.toFixed(1)}%)
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stock Trading Portal */}
          <div className="zenith-card stock-trading-card mt-6">
            <h3>Instant Mock Trading</h3>
            <p className="widget-subtitle">Trade primary stocks securely</p>
            
            <form onSubmit={handleTradeSubmit} className="trade-form">
              <div className="form-double-row mt-4">
                <div className="form-group">
                  <label>Select Asset</label>
                  <select 
                    className="form-control" 
                    value={tradeSymbol}
                    onChange={e => setTradeSymbol(e.target.value)}
                  >
                    <option value="ZENITH">Zenith Bancorp (₹185.00)</option>
                    <option value="TCS">Tata Consultancy Services (₹3,450.00)</option>
                    <option value="RELIANCE">Reliance Industries (₹2,450.00)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Trade Action</label>
                  <div className="trade-action-toggle">
                    <button 
                      type="button" 
                      className={`action-toggle-btn buy ${tradeAction === 'buy' ? 'active' : ''}`}
                      onClick={() => setTradeAction('buy')}
                    >
                      Buy
                    </button>
                    <button 
                      type="button" 
                      className={`action-toggle-btn sell ${tradeAction === 'sell' ? 'active' : ''}`}
                      onClick={() => setTradeAction('sell')}
                    >
                      Sell
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-double-row">
                <div className="form-group">
                  <label>Shares Quantity</label>
                  <input 
                    type="number" 
                    min="1"
                    className="form-control"
                    placeholder="Enter shares count"
                    value={tradeShares}
                    onChange={e => setTradeShares(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Total Estimate</label>
                  <div className="trade-estimate-display font-semibold">
                    {tradeShares ? formatCurrency(parseInt(tradeShares) * assetPrices[tradeSymbol]) : "₹ 0.00"}
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full py-3">Place Trade Order</button>
            </form>
          </div>
        </div>

        {/* Fixed Deposits Portal */}
        <div className="wealth-fd-section">
          {/* Active FDs */}
          <div className="zenith-card active-fds-card">
            <h3>Active Fixed Deposits</h3>
            <div className="fd-list mt-4">
              {investments?.fixedDeposits.map((fd, idx) => (
                <div key={idx} className="fd-card-item">
                  <div className="fd-item-header">
                    <strong>₹{fd.amount.toLocaleString('en-IN')}</strong>
                    <span className="badge badge-success">{fd.interestRate}% Interest</span>
                  </div>
                  <div className="fd-item-body mt-2">
                    <p>Duration: {fd.termMonths} Months</p>
                    <p>Maturity Value: {formatCurrency(fd.maturityAmount)}</p>
                    <p className="fd-renew-status">Auto Renew: {fd.autoRenew ? "Enabled" : "Disabled"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Create FD form */}
          <div className="zenith-card create-fd-card mt-6">
            <h3>Open Fixed Deposit</h3>
            <p className="widget-subtitle">Earn up to 7.5% p.a. returns securely</p>
            
            <form onSubmit={handleCreateFD}>
              <div className="form-group mt-4">
                <label>Deposit Amount (INR)</label>
                <input 
                  type="number" 
                  min="10000"
                  step="5000"
                  className="form-control"
                  value={fdAmount}
                  onChange={e => setFdAmount(parseInt(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Tenure: {fdTerm} Months</label>
                <input 
                  type="range" 
                  min="3" 
                  max="60" 
                  step="3"
                  className="limit-range-slider"
                  value={fdTerm}
                  onChange={e => setFdTerm(parseInt(e.target.value))}
                />
              </div>

              <div className="fd-preview-box">
                <div className="fd-preview-row">
                  <span>Interest Yield:</span>
                  <strong className="text-success">+{formatCurrency(fdCalc.interest)}</strong>
                </div>
                <div className="fd-preview-row">
                  <span>Maturity Payoff:</span>
                  <strong>{formatCurrency(fdCalc.total)}</strong>
                </div>
              </div>

              <div className="form-group mt-4">
                <label className="toggle-label">
                  <input 
                    type="checkbox" 
                    checked={fdAutoRenew} 
                    onChange={e => setFdAutoRenew(e.target.checked)} 
                  />
                  Auto Renew on Maturity
                </label>
              </div>

              <button type="submit" className="btn btn-secondary w-full">Create Fixed Deposit Plan</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
