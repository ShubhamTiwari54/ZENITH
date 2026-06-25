import React, { useState } from 'react';

export default function Header({ setSidebarOpen, user, upcomingPayments, addNotification, notifications, clearNotifications }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  
  // Dummy messages
  const messages = [
    { id: 1, sender: "Zenith Care", preview: "Your new Credit Card has been dispatched.", time: "1h ago", unread: true },
    { id: 2, sender: "System", preview: "Weekly financial audit report is available.", time: "1d ago", unread: false },
    { id: 3, sender: "Loan Department", preview: "Your Personal Loan application has been approved.", time: "2d ago", unread: false }
  ];

  return (
    <header className="header">
      <button className="menu-toggle-btn" onClick={() => setSidebarOpen(true)}>
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div className="search-bar">
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
        />
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
