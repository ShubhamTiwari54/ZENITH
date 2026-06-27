import React, { useState, useEffect, useRef } from 'react';

export default function Header({ 
  setSidebarOpen, 
  user, 
  upcomingPayments, 
  addNotification, 
  notifications, 
  clearNotifications,
  transactions,
  offers,
  setCurrentPage
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showRewards, setShowRewards] = useState(false);

  // Search Bar States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ pages: [], txns: [], offersList: [] });
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef(null);

  // Dummy messages
  const messages = [
    { id: 1, sender: "Zenith Care", preview: "Your new Credit Card has been dispatched.", time: "1h ago", unread: true },
    { id: 2, sender: "System", preview: "Weekly financial audit report is available.", time: "1d ago", unread: false },
    { id: 3, sender: "Loan Department", preview: "Your Personal Loan application has been approved.", time: "2d ago", unread: false }
  ];

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ pages: [], txns: [], offersList: [] });
      return;
    }
    const query = searchQuery.toLowerCase();
    
    // Pages matching
    const pagesList = [
      { name: "Dashboard Overview", id: "dashboard" },
      { name: "Accounts & Ledger Statements", id: "accounts" },
      { name: "Payments & Payee Transfers", id: "payments" },
      { name: "Credit Cards Security", id: "cards" },
      { name: "Investments & Fixed Deposits", id: "investments" },
      { name: "Loans Principal Section", id: "loans" },
      { name: "Insurance Policies Claims", id: "insurance" },
      { name: "Budget Target Planner", id: "budget" },
      { name: "Offers Center", id: "offers" },
      { name: "Support Ticket Desk", id: "support" },
      { name: "Accessibility Theme Settings", id: "settings" }
    ];
    const matchedPages = pagesList.filter(p => p.name.toLowerCase().includes(query));

    // Transactions matching
    const matchedTxns = (transactions || []).filter(t => 
      t.merchant.toLowerCase().includes(query) ||
      (t.description && t.description.toLowerCase().includes(query)) ||
      (t.category && t.category.toLowerCase().includes(query)) ||
      t.amount.toString().includes(query)
    ).slice(0, 5);

    // Offers matching
    const matchedOffers = (offers || []).filter(o => 
      o.title.toLowerCase().includes(query) ||
      o.subtitle.toLowerCase().includes(query) ||
      o.badge.toLowerCase().includes(query)
    ).slice(0, 3);

    setSearchResults({ pages: matchedPages, txns: matchedTxns, offersList: matchedOffers });
  }, [searchQuery, transactions, offers]);

  const handleSearchResultClick = (targetPage, scrollElementId = null) => {
    setCurrentPage(targetPage);
    setSearchQuery('');
    setShowSearchResults(false);
    if (scrollElementId) {
      setTimeout(() => {
        const el = document.getElementById(scrollElementId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  };

  return (
    <header className="header">
      <button className="menu-toggle-btn" onClick={() => setSidebarOpen(true)}>
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div className="search-bar" ref={searchContainerRef} style={{ position: 'relative' }}>
        <span className="search-icon">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input 
          type="text" 
          placeholder="Search for transactions, cards, offers..." 
          className="search-input"
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value);
            setShowSearchResults(true);
          }}
          onFocus={() => setShowSearchResults(true)}
        />
        
        {/* Floating Search Results Dropdown Overlay */}
        {showSearchResults && searchQuery.trim() && (
          <div className="dropdown-panel search-results-dropdown" style={{
            position: 'absolute',
            top: '110%',
            left: 0,
            right: 0,
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            maxHeight: '360px',
            overflowY: 'auto',
            padding: '12px'
          }}>
            {searchResults.pages.length === 0 && searchResults.txns.length === 0 && searchResults.offersList.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>No matches found</p>
            ) : (
              <>
                {/* Pages */}
                {searchResults.pages.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <h5 style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '6px', borderBottom: '1px solid var(--card-border)', paddingBottom: '3px' }}>Pages</h5>
                    {searchResults.pages.map(page => (
                      <div 
                        key={page.id} 
                        style={{ fontSize: '13px', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
                        className="search-result-item"
                        onClick={() => handleSearchResultClick(page.id)}
                      >
                        📄 {page.name}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Transactions */}
                {searchResults.txns.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <h5 style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '6px', borderBottom: '1px solid var(--card-border)', paddingBottom: '3px' }}>Transactions</h5>
                    {searchResults.txns.map(txn => (
                      <div 
                        key={txn.id} 
                        style={{ fontSize: '13px', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                        className="search-result-item"
                        onClick={() => handleSearchResultClick('accounts')}
                      >
                        <span>💸 {txn.merchant} <span style={{fontSize: '11px', color: 'var(--text-muted)'}}>({txn.category})</span></span>
                        <strong style={{ color: txn.type === 'credit' ? 'var(--success)' : 'var(--text-primary)' }}>
                          {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                        </strong>
                      </div>
                    ))}
                  </div>
                )}

                {/* Offers */}
                {searchResults.offersList.length > 0 && (
                  <div>
                    <h5 style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '6px', borderBottom: '1px solid var(--card-border)', paddingBottom: '3px' }}>Deals & Vouchers</h5>
                    {searchResults.offersList.map(offer => (
                      <div 
                        key={offer.id} 
                        style={{ fontSize: '13px', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
                        className="search-result-item"
                        onClick={() => handleSearchResultClick('offers')}
                      >
                        🎁 {offer.title}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="header-actions">
        {/* Gift / Rewards Icon */}
        <div style={{ position: 'relative' }}>
          <button 
            className="action-btn" 
            title="Rewards Center"
            onClick={() => {
              setShowRewards(!showRewards);
              setShowNotifications(false);
              setShowMessages(false);
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 12 20 22 4 22 4 12" />
              <rect x="2" y="7" width="20" height="5" />
              <line x1="12" y1="22" x2="12" y2="7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
          </button>
          
          {showRewards && (
            <div className="dropdown-panel rewards-panel">
              <div className="dropdown-header">
                <h3>Zenith Rewards</h3>
                <span className="points-pill">5,420 pts</span>
              </div>
              <div className="dropdown-content">
                <p className="rewards-sub">You have earned 120 points this week. Keep saving to unlock more deals!</p>
                <div className="reward-item-simple">
                  <div className="reward-icon-circle">🎁</div>
                  <div>
                    <h4>Amazon Pay Voucher</h4>
                    <p>Redeem 2,500 points for ₹500</p>
                  </div>
                </div>
                <div className="reward-item-simple">
                  <div className="reward-icon-circle">☕</div>
                  <div>
                    <h4>Starbucks Coupon</h4>
                    <p>Redeem 1,000 points for free Latte</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Messages Icon */}
        <div style={{ position: 'relative' }}>
          <button 
            className="action-btn" 
            title="Inbox Messages"
            onClick={() => {
              setShowMessages(!showMessages);
              setShowNotifications(false);
              setShowRewards(false);
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span className="notification-badge" />
          </button>

          {showMessages && (
            <div className="dropdown-panel messages-panel">
              <div className="dropdown-header">
                <h3>Secure Messages</h3>
              </div>
              <div className="dropdown-content">
                {messages.map(msg => (
                  <div key={msg.id} className={`dropdown-item ${msg.unread ? 'unread' : ''}`}>
                    <div className="item-meta">
                      <span className="sender">{msg.sender}</span>
                      <span className="time">{msg.time}</span>
                    </div>
                    <p className="preview">{msg.preview}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <div style={{ position: 'relative' }}>
          <button 
            className="action-btn" 
            title="Activity Notifications"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowMessages(false);
              setShowRewards(false);
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {notifications.length > 0 && <span className="notification-badge" />}
          </button>

          {showNotifications && (
            <div className="dropdown-panel notifications-panel">
              <div className="dropdown-header">
                <h3>Notifications</h3>
                {notifications.length > 0 && (
                  <button className="clear-btn" onClick={clearNotifications}>Clear</button>
                )}
              </div>
              <div className="dropdown-content">
                {notifications.length === 0 ? (
                  <p className="empty-dropdown">No new notifications</p>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className="dropdown-item">
                      <div className="item-meta">
                        <span className="notif-title">{notif.title}</span>
                        <span className="time">{notif.time}</span>
                      </div>
                      <p className="preview">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="user-profile">
          <div className="profile-avatar-container">
            <img 
              src={user?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces"} 
              alt={user?.name || "Kavya"} 
              className="profile-avatar"
            />
            <span className="online-indicator" />
          </div>
        </div>
      </div>
    </header>
  );
}
