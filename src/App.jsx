import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Accounts from './components/Accounts';
import Payments from './components/Payments';
import Cards from './components/Cards';
import Investments from './components/Investments';
import Loans from './components/Loans';
import Insurance from './components/Insurance';
import BudgetPlanner from './components/BudgetPlanner';
import Offers from './components/Offers';
import Support from './components/Support';
import Settings from './components/Settings';
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Custom notifications
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Welcome to Zenith", message: "Your hyperpersonalized secure dashboard is active.", time: "Just Now" }
  ]);
  const [toastAlerts, setToastAlerts] = useState([]);

  // Lockscreen Security
  const [sessionLocked, setSessionLocked] = useState(false);
  const [lockPin, setLockPin] = useState('');
  const [lockError, setLockError] = useState('');
  
  // Timeout tracking
  const [inactivitySeconds, setInactivitySeconds] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningCountdown, setWarningCountdown] = useState(30);

  // Sync API Core
  const refreshAllData = async () => {
    try {
      const dbResp = await fetch('/api/dashboard');
      const txnResp = await fetch('/api/transactions');
      const setResp = await fetch('/api/settings');

      if (dbResp.ok && txnResp.ok && setResp.ok) {
        const dbData = await dbResp.json();
        const txnData = await txnResp.json();
        const setData = await setResp.json();
        
        setDashboardData(dbData);
        setTransactions(txnData);
        setSettings(setData);
      }
    } catch (err) {
      console.error("Core Synchronization Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Inactivity monitor
  useEffect(() => {
    if (sessionLocked) return;

    const timeoutLimit = settings?.user?.securitySettings?.timeoutLimit || 5; // default 5 mins
    const maxInactivitySeconds = timeoutLimit * 60;

    const interval = setInterval(() => {
      setInactivitySeconds(prev => {
        const next = prev + 1;
        // Start warning when 30 seconds are left
        if (next >= maxInactivitySeconds - 30 && next < maxInactivitySeconds) {
          setShowWarningModal(true);
          setWarningCountdown(maxInactivitySeconds - next);
        } else if (next >= maxInactivitySeconds) {
          // Lock session
          setSessionLocked(true);
          setShowWarningModal(false);
          setInactivitySeconds(0);
          addNotification("Session Locked", "Logged out due to inactivity. Enter PIN to resume.");
        }
        return next;
      });
    }, 1000);

    const resetInactivity = () => {
      setInactivitySeconds(0);
      setShowWarningModal(false);
    };

    window.addEventListener('mousemove', resetInactivity);
    window.addEventListener('keydown', resetInactivity);
    window.addEventListener('click', resetInactivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', resetInactivity);
      window.removeEventListener('keydown', resetInactivity);
      window.removeEventListener('click', resetInactivity);
    };
  }, [settings, sessionLocked]);

  // Toast Notification Generator
  const addNotification = (title, message) => {
    const id = Date.now() + Math.random();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add to Header Notifications Panel
    setNotifications(prev => [{ id, title, message, time }, ...prev]);
    
    // Trigger visual sliding toast
    setToastAlerts(prev => [...prev, { id, title, message }]);
    
    // Remove toast after 4 seconds
    setTimeout(() => {
      setToastAlerts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Instant pay bill handler
  const handlePayBill = async (billId, title, amount) => {
    try {
      const response = await fetch('/api/payments/pay-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billId })
      });

      if (response.ok) {
        addNotification("Bill Paid Successfully", `Authorized ₹${amount.toLocaleString('en-IN')} payment for ${title}.`);
        refreshAllData();
      } else {
        const err = await response.json();
        alert(err.error || "Payment failed.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Lockscreen unlock
  const handleUnlockSession = (e) => {
    e.preventDefault();
    if (lockPin === '1234') {
      setSessionLocked(false);
      setLockPin('');
      setLockError('');
      setInactivitySeconds(0);
      addNotification("Session Resumed", "Welcome back! Security gateway decrypted successfully.");
    } else {
      setLockError("Invalid authorization PIN.");
    }
  };

  const extendSession = () => {
    setInactivitySeconds(0);
    setShowWarningModal(false);
  };

  // Promotional Banner actions routing helper
  const handlePromoAction = (target) => {
    if (target === 'travel' || target === 'offers') {
      setCurrentPage('offers');
    } else if (target === 'loans') {
      setCurrentPage('loans');
    } else if (target === 'investments') {
      setCurrentPage('investments');
    } else if (target === 'payments') {
      setCurrentPage('payments');
    } else {
      setCurrentPage('dashboard');
    }
  };

  // Page Routing Table
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            dashboardData={dashboardData}
            loading={loading}
            onPayBill={handlePayBill}
            onPromoAction={handlePromoAction}
            addNotification={addNotification}
          />
        );
      case 'accounts':
        return (
          <Accounts 
            dashboardData={dashboardData}
            transactions={transactions}
            addNotification={addNotification}
          />
        );
      case 'payments':
        return (
          <Payments 
            dashboardData={dashboardData}
            onTransfer={refreshAllData}
            addNotification={addNotification}
          />
        );
      case 'cards':
        return (
          <Cards 
            creditCard={settings?.user ? settings.creditCard : null}
            onCardAction={refreshAllData}
            addNotification={addNotification}
          />
        );
      case 'investments':
        return (
          <Investments 
            investments={settings?.investments}
            balance={dashboardData?.accounts?.savings?.availableBalance || 0}
            onTrade={refreshAllData}
            onOpenFD={refreshAllData}
            addNotification={addNotification}
          />
        );
      case 'loans':
        return (
          <Loans 
            loans={settings?.loans}
            balance={dashboardData?.accounts?.savings?.availableBalance || 0}
            onLoanApproved={refreshAllData}
            addNotification={addNotification}
          />
        );
      case 'insurance':
        return (
          <Insurance 
            insurance={settings?.insurance}
            addNotification={addNotification}
          />
        );
      case 'budget':
        return (
          <BudgetPlanner 
            budgets={settings?.budgets}
            onBudgetAction={refreshAllData}
            addNotification={addNotification}
          />
        );
      case 'offers':
        return (
          <Offers 
            offers={dashboardData?.offers}
            addNotification={addNotification}
          />
        );
      case 'support':
        return (
          <Support 
            addNotification={addNotification}
          />
        );
      case 'settings':
        return (
          <Settings 
            user={settings?.user}
            onSettingsChange={refreshAllData}
            addNotification={addNotification}
          />
        );
      default:
        return <div className="page-container"><h2>Subpage Under Construction</h2></div>;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <Sidebar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        notificationCount={notifications.length}
      />

      {/* Main page layout */}
      <main className="main-content">
        {/* Mockup Header Gradient Background */}
        <div className="header-mesh"></div>

        {/* Header toolbar */}
        <Header 
          setSidebarOpen={setSidebarOpen}
          user={dashboardData?.user}
          upcomingPayments={dashboardData?.upcomingPayments || []}
          addNotification={addNotification}
          notifications={notifications}
          clearNotifications={clearNotifications}
        />

        {/* Loaded View */}
        {renderCurrentPage()}
      </main>

      {/* Sliding Toast Notifications Container */}
      <div className="toast-container">
        {toastAlerts.map(toast => (
          <div key={toast.id} className="toast-alert-item">
            <span className="toast-icon">🔔</span>
            <div>
              <h5>{toast.title}</h5>
              <p>{toast.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Warning Timeout Lockscreen Modal */}
      {showWarningModal && (
        <div className="modal-overlay">
          <div className="modal-content text-center py-6">
            <h3>Inactivity Warning</h3>
            <p className="modal-subtitle mt-2">
              For your account safety, your session locks in <strong>{warningCountdown} seconds</strong>.
            </p>
            <button className="btn btn-primary w-full mt-6" onClick={extendSession}>
              Extend Session
            </button>
          </div>
        </div>
      )}

      {/* Locked Lockscreen Modal */}
      {sessionLocked && (
        <div className="lockscreen-overlay">
          <div className="lockscreen-content text-center">
            <div className="lock-icon-circ">🔑</div>
            <h2>Zenith Secured</h2>
            <p className="modal-subtitle mt-2">Session locked due to inactivity. Enter PIN to decrypt.</p>
            
            {lockError && <p className="gate-error-banner mt-2">{lockError}</p>}
            
            <form onSubmit={handleUnlockSession}>
              <div className="form-group mt-4">
                <input 
                  type="password" 
                  maxLength="4"
                  className="form-control text-center font-bold"
                  style={{ fontSize: '24px', letterSpacing: '8px' }}
                  placeholder="••••"
                  value={lockPin}
                  onChange={e => {
                    setLockError('');
                    setLockPin(e.target.value);
                  }}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-full mt-4">Decrypt Session</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
