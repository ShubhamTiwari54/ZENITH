import React, { useState } from 'react';

export default function BudgetPlanner({ budgets, onBudgetAction, addNotification }) {
  const [targetCategory, setTargetCategory] = useState('Food & Dining');
  const [newLimit, setNewLimit] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const handleUpdateBudget = async (e) => {
    e.preventDefault();
    const limitVal = parseFloat(newLimit);
    if (isNaN(limitVal) || limitVal <= 0) {
      alert("Please enter a positive limit amount.");
      return;
    }

    try {
      const response = await fetch('/api/settings/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: targetCategory,
          limit: limitVal
        })
      });

      if (response.ok) {
        onBudgetAction(); // Refresh state
        addNotification("Budget Adjusted", `Set new limit of ${formatCurrency(limitVal)} for ${targetCategory}.`);
        setNewLimit('');
      } else {
        alert("Failed to modify budget.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <div className="welcome-section">
        <div>
          <h1 className="welcome-title">Budget Planner</h1>
          <p className="welcome-subtitle">Set monthly spending guidelines and keep your goals in sight.</p>
        </div>
      </div>

      <div className="budget-layout-grid">
        {/* Budgets Progress List */}
        <div className="budget-progress-section">
          <div className="zenith-card budget-logs-card">
            <h3>Monthly Budget Limits</h3>
            <p className="widget-subtitle">Spent vs Monthly Allowance</p>

            <div className="budget-progress-list mt-4">
              {budgets?.map((bud, idx) => {
                const ratio = bud.spent / bud.limit;
                const percent = Math.round(ratio * 100);
                const isOver = ratio >= 1.0;
                const isWarning = ratio >= 0.85 && ratio < 1.0;
                
                return (
                  <div key={idx} className="budget-progress-item">
                    <div className="bud-item-top">
                      <div>
                        <h4>{bud.category}</h4>
                        <p>{formatCurrency(bud.spent)} spent / {formatCurrency(bud.limit)} limit</p>
                      </div>
                      
                      {isOver ? (
                        <span className="badge badge-danger">Exceeded ({percent}%)</span>
                      ) : isWarning ? (
                        <span className="badge badge-warning">Warning ({percent}%)</span>
                      ) : (
                        <span className="badge badge-success">On Track ({percent}%)</span>
                      )}
                    </div>

                    <div className="budget-bar-bg mt-2">
                      <div 
                        className={`budget-bar-fill ${isOver ? 'danger' : isWarning ? 'warning' : 'success'}`} 
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Adjust Limits Form */}
        <div className="budget-form-section">
          <div className="zenith-card adjust-budget-card">
            <h3>Adjust Budget Cap</h3>
            <p className="widget-subtitle">Reallocate category spending allowances</p>

            <form onSubmit={handleUpdateBudget} className="budget-form">
              <div className="form-group mt-4">
                <label>Select Category</label>
                <select 
                  className="form-control"
                  value={targetCategory}
                  onChange={e => setTargetCategory(e.target.value)}
                >
                  {budgets?.map((b, i) => (
                    <option key={i} value={b.category}>{b.category}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>New Monthly Limit (INR)</label>
                <input 
                  type="number" 
                  min="1"
                  className="form-control"
                  placeholder="₹ 0.00"
                  value={newLimit}
                  onChange={e => setNewLimit(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-full mt-2">Update Category Limit</button>
            </form>
          </div>
          
          {/* Personalization tip */}
          <div className="zenith-card budget-tip-card mt-6">
            <h3>💡 Zenith Advisor Recommendation</h3>
            <p className="mt-2 text-secondary" style={{ fontSize: '13px', lineHeight: '1.4' }}>
              Your spending on <strong>Food & Dining</strong> is 20% lower than average. Consider routing ₹5,000 of your Food budget into your **Fixed Deposit** to earn 7.5% p.a. interest.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
