import React, { useState } from 'react';

export default function Accounts({ dashboardData, transactions, addNotification }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [linkingAccount, setLinkingAccount] = useState(false);
  const [linkStep, setLinkStep] = useState(1); // 1: Bank select, 2: Credentials, 3: MFA/OTP, 4: Success
  const [linkedBanks, setLinkedBanks] = useState([]);
  
  // Link state
  const [linkBankName, setLinkBankName] = useState('HDFC Bank');
  const [linkUser, setLinkUser] = useState('');
  const [linkPass, setLinkPass] = useState('');
  const [linkOtp, setLinkOtp] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const categories = ['All', 'Food & Dining', 'Housing', 'Transport', 'Shopping', 'Bills & Utilities', 'Income', 'Others'];

  // Filtering logic
  const filteredTxns = transactions.filter(txn => {
    const matchesSearch = txn.merchant.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          txn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          txn.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || txn.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Handle statement exports
  const handleExport = (format) => {
    addNotification("Export Successful", `Downloaded account statement in ${format} format.`);
    
    // Simulate file download
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredTxns, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `zenith_statement_${Date.now()}.${format === 'CSV' ? 'csv' : 'pdf'}`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Linking wizard
  const handleStartLink = () => {
    setLinkStep(1);
    setLinkingAccount(true);
  };

  const handleNextStep = () => {
    if (linkStep === 1) {
      setLinkStep(2);
    } else if (linkStep === 2) {
      if (!linkUser || !linkPass) {
        alert("Please enter credentials.");
        return;
      }
      setLinkStep(3);
    } else if (linkStep === 3) {
      if (linkOtp !== '123456') {
        alert("Invalid demo OTP. Use 123456.");
        return;
      }
      setLinkedBanks([...linkedBanks, { name: linkBankName, user: linkUser, balance: 45000 }]);
      setLinkStep(4);
      addNotification("Account Linked", `Successfully integrated external account from ${linkBankName}`);
    }
  };

  return (
    <div className="page-container">
      <div className="welcome-section">
        <div>
          <h1 className="welcome-title">My Accounts</h1>
          <p className="welcome-subtitle">Manage your balances and view transaction records.</p>
        </div>
        <button className="btn btn-primary" onClick={handleStartLink}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Link External Account
        </button>
      </div>

      {/* Accounts List Grid */}
      <div className="accounts-list-grid">
        {/* Savings Account */}
        <div className="zenith-card account-detail-card">
          <div className="ac-header-row">
            <div>
              <span className="badge badge-success">Active</span>
              <h3 className="ac-title">Zenith Premium Savings</h3>
              <p className="ac-number-lbl">A/C: {dashboardData?.accounts.savings.accountNumber}</p>
            </div>
            <div className="ac-icon-circ">💰</div>
          </div>
          <div className="ac-balance-sec">
            <span className="ac-bal-lbl">Available Balance</span>
            <h2>{formatCurrency(dashboardData?.accounts.savings.availableBalance)}</h2>
            <p>Total Balance: {formatCurrency(dashboardData?.accounts.savings.balance)}</p>
          </div>
          <div className="ac-footer-info">
            <span>IFSC: {dashboardData?.accounts.savings.routingNumber}</span>
            <span>Bank: Zenith Headquarters</span>
          </div>
        </div>

        {/* Current Account */}
        <div className="zenith-card account-detail-card">
          <div className="ac-header-row">
            <div>
              <span className="badge badge-success">Active</span>
              <h3 className="ac-title">Zenith Business Current</h3>
              <p className="ac-number-lbl">A/C: {dashboardData?.accounts.current.accountNumber}</p>
            </div>
            <div className="ac-icon-circ">🏢</div>
          </div>
          <div className="ac-balance-sec">
            <span className="ac-bal-lbl">Available Balance</span>
            <h2>{formatCurrency(dashboardData?.accounts.current.availableBalance)}</h2>
            <p>Total Balance: {formatCurrency(dashboardData?.accounts.current.balance)}</p>
          </div>
          <div className="ac-footer-info">
            <span>IFSC: {dashboardData?.accounts.current.routingNumber}</span>
            <span>Bank: Zenith Headquarters</span>
          </div>
        </div>

        {/* Linked Banks */}
        {linkedBanks.map((bank, index) => (
          <div key={index} className="zenith-card account-detail-card linked-bank-card">
            <div className="ac-header-row">
              <div>
                <span className="badge badge-warning">Linked</span>
                <h3 className="ac-title">{bank.name} External</h3>
                <p className="ac-number-lbl">User: {bank.user}</p>
              </div>
              <div className="ac-icon-circ">🔗</div>
            </div>
            <div className="ac-balance-sec">
              <span className="ac-bal-lbl">Sync Balance</span>
              <h2>{formatCurrency(bank.balance)}</h2>
              <p>Last Sync: Just Now</p>
            </div>
            <div className="ac-footer-info">
              <span>Status: Secure API Connected</span>
            </div>
          </div>
        ))}
      </div>

      {/* Transactions Search and Log */}
      <div className="zenith-card transactions-log-card">
        <div className="log-header-row">
          <h3>Transaction History</h3>
          
          <div className="export-actions">
            <button className="btn btn-outline btn-sm" onClick={() => handleExport('CSV')}>Export CSV</button>
            <button className="btn btn-outline btn-sm" onClick={() => handleExport('PDF')}>Export PDF</button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="filter-bar-row">
          <div className="search-box-txn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', color: 'var(--text-muted)' }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input 
              type="text" 
              placeholder="Search by merchant, description, ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-chips">
            {categories.map(cat => (
              <button 
                key={cat}
                className={`chip ${categoryFilter === cat ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table list */}
        <div className="transactions-table-container">
          <table className="txn-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Date & Time</th>
                <th>Merchant / Details</th>
                <th>Category</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-table-row">No transactions match your search.</td>
                </tr>
              ) : (
                filteredTxns.map(txn => (
                  <tr key={txn.id}>
                    <td><span className="txn-id-badge">{txn.id}</span></td>
                    <td className="text-secondary">{new Date(txn.date).toLocaleString()}</td>
                    <td>
                      <div className="txn-merchant-cell">
                        <span className="merchant-title">{txn.merchant}</span>
                        <span className="desc-sub">{txn.description}</span>
                      </div>
                    </td>
                    <td><span className="txn-category-tag">{txn.category}</span></td>
                    <td>
                      <span className={`status-pill ${txn.status.toLowerCase()}`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className={`txn-amount-val ${txn.type} font-semibold`} style={{ textAlign: 'right' }}>
                      {txn.type === 'debit' ? '-' : '+'}{formatCurrency(txn.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* External Bank Linking Modal */}
      {linkingAccount && (
        <div className="modal-overlay" onClick={() => setLinkingAccount(false)}>
          <div className="modal-content link-bank-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setLinkingAccount(false)}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {linkStep === 1 && (
              <div className="modal-link-body">
                <h3>Link External Account</h3>
                <p className="modal-subtitle">Choose a banking institution to connect via secure API.</p>
                <div className="bank-select-grid">
                  {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra'].map(b => (
                    <button 
                      key={b} 
                      className={`bank-opt-btn ${linkBankName === b ? 'selected' : ''}`}
                      onClick={() => setLinkBankName(b)}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                <button className="btn btn-primary w-full mt-6" onClick={handleNextStep}>Continue</button>
              </div>
            )}

            {linkStep === 2 && (
              <div className="modal-link-body">
                <h3>Enter Credentials</h3>
                <p className="modal-subtitle">Enter Netbanking credentials for {linkBankName}. Connection is encrypted.</p>
                <div className="form-group mt-4">
                  <label>Username / Customer ID</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Enter customer ID"
                    value={linkUser}
                    onChange={e => setLinkUser(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Netbanking Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="Enter password"
                    value={linkPass}
                    onChange={e => setLinkPass(e.target.value)}
                  />
                </div>
                <button className="btn btn-primary w-full mt-4" onClick={handleNextStep}>Authenticate</button>
              </div>
            )}

            {linkStep === 3 && (
              <div className="modal-link-body">
                <h3>Enter 2FA OTP Code</h3>
                <p className="modal-subtitle">A verification code has been sent to your registered phone number. (Use code: 123456)</p>
                <div className="form-group mt-4">
                  <label>One-Time Password (6 digits)</label>
                  <input 
                    type="text" 
                    maxLength="6"
                    className="form-control text-center font-bold" 
                    style={{ letterSpacing: '4px', fontSize: '18px' }}
                    placeholder="------"
                    value={linkOtp}
                    onChange={e => setLinkOtp(e.target.value)}
                  />
                </div>
                <button className="btn btn-primary w-full mt-4" onClick={handleNextStep}>Verify and Link</button>
              </div>
            )}

            {linkStep === 4 && (
              <div className="modal-link-body text-center py-6">
                <span className="success-emoji-lg">🚀</span>
                <h3>Account Connected!</h3>
                <p className="modal-subtitle mt-2">Your {linkBankName} savings account is now safely linked. Balances will sync automatically.</p>
                <button className="btn btn-secondary w-full mt-6" onClick={() => setLinkingAccount(false)}>Finish</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
