import React, { useState, useEffect, useRef } from 'react';
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
import AIAssistant from './components/AIAssistant';
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // AI Prefill states for workflow automations
  const [prefilledPayment, setPrefilledPayment] = useState(null);
  const [prefilledInvestment, setPrefilledInvestment] = useState(null);
  const [prefilledLoan, setPrefilledLoan] = useState(null);
  const [prefilledClaim, setPrefilledClaim] = useState(null);
  
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

  // Biometrics Simulator State
  const [biometricModalOpen, setBiometricModalOpen] = useState(false);
  const [biometricType, setBiometricType] = useState('face'); // 'face' or 'fingerprint'
  const [biometricStatus, setBiometricStatus] = useState('idle'); // 'idle', 'scanning', 'success', 'failed'
  const [biometricCallback, setBiometricCallback] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    let stream = null;
    if (biometricModalOpen && biometricType === 'face') {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(err => {
          console.warn("Camera stream unavailable, using SVG simulation:", err);
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [biometricModalOpen, biometricType]);

  const triggerBiometricVerification = (type, callback) => {
    setBiometricType(type);
    setBiometricStatus('idle');
    setBiometricCallback(() => callback);
    setBiometricModalOpen(true);

    setTimeout(() => {
      setBiometricStatus('scanning');
      setTimeout(() => {
        setBiometricStatus('success');
        setTimeout(() => {
          setBiometricModalOpen(false);
          if (callback) callback(true);
        }, 1200);
      }, 2000);
    }, 500);
  };

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
            prefilledPayment={prefilledPayment}
            clearPrefilledPayment={() => setPrefilledPayment(null)}
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
            prefilledInvestment={prefilledInvestment}
            clearPrefilledInvestment={() => setPrefilledInvestment(null)}
          />
        );
      case 'loans':
        return (
          <Loans 
            loans={settings?.loans}
            balance={dashboardData?.accounts?.savings?.availableBalance || 0}
            onLoanApproved={refreshAllData}
            addNotification={addNotification}
            prefilledLoan={prefilledLoan}
            clearPrefilledLoan={() => setPrefilledLoan(null)}
          />
        );
      case 'insurance':
        return (
          <Insurance 
            insurance={settings?.insurance}
            addNotification={addNotification}
            prefilledClaim={prefilledClaim}
            clearPrefilledClaim={() => setPrefilledClaim(null)}
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

  const accessTheme = settings?.user?.accessibility?.theme || 'light';
  const accessContrast = settings?.user?.accessibility?.contrast || 'normal';
  const accessSize = settings?.user?.accessibility?.fontSize || 'medium';
  const accessLang = settings?.user?.accessibility?.language || 'en';

  return (
    <div className={`app-container theme-${accessTheme} contrast-${accessContrast} size-${accessSize}`}>
      {/* Sidebar navigation */}
      <Sidebar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        notificationCount={notifications.length}
        language={accessLang}
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
          language={accessLang}
          transactions={transactions}
          offers={dashboardData?.offers || []}
          setCurrentPage={setCurrentPage}
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
            
            {settings?.user?.biometricEnabled && (settings.user.biometricEnabled.face || settings.user.biometricEnabled.fingerprint) && (
              <div className="biometric-quick-login mt-4">
                <button 
                  type="button" 
                  className="btn btn-outline w-full flex items-center justify-center gap-2"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  onClick={() => {
                    const type = settings.user.biometricEnabled.face ? 'face' : 'fingerprint';
                    triggerBiometricVerification(type, (success) => {
                      if (success) {
                        setSessionLocked(false);
                        setLockPin('');
                        setLockError('');
                        setInactivitySeconds(0);
                        addNotification("Biometric Login Success", "Session decrypted via AI security simulator.");
                      }
                    });
                  }}
                >
                  {settings.user.biometricEnabled.face ? '👤 Authenticate Face ID' : '👆 Scan Touch ID'}
                </button>
                <div className="biometric-divider my-3" style={{ opacity: 0.5, fontSize: '12px' }}>— OR —</div>
              </div>
            )}
            
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

      {/* Floating AI Assistant Panel */}
      <AIAssistant 
        user={settings?.user}
        accounts={dashboardData?.accounts}
        creditCard={settings?.user ? settings.creditCard : null}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onCardAction={refreshAllData}
        refreshAllData={refreshAllData}
        addNotification={addNotification}
        accessibilitySettings={settings?.user?.accessibility}
        triggerBiometrics={triggerBiometricVerification}
        setPrefilledPayment={setPrefilledPayment}
        setPrefilledInvestment={setPrefilledInvestment}
        setPrefilledLoan={setPrefilledLoan}
        setPrefilledClaim={setPrefilledClaim}
      />

      {/* Biometrics Scan Overlay Simulation */}
      {biometricModalOpen && (
        <div className="biometric-modal-overlay">
          <div className="biometric-modal-content text-center">
            <h4 style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {biometricType === 'face' ? 'Zenith Face Unlock' : 'Zenith Touch ID'}
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {biometricStatus === 'idle' && 'Initializing security camera...'}
              {biometricStatus === 'scanning' && 'Analyzing secure credentials...'}
              {biometricStatus === 'success' && 'Biometrics verified successfully!'}
            </p>

            <div className="biometric-scan-container mt-6">
              {biometricType === 'face' ? (
                <div className="face-scanner-box">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="biometric-video-feed"
                  />
                  {/* Glowing camera scanning line */}
                  {biometricStatus === 'scanning' && <div className="scanner-sweep-line"></div>}
                  {/* Glowing overlay ring */}
                  <div className={`scanner-oval-target ${biometricStatus}`}></div>
                </div>
              ) : (
                <div className={`fingerprint-scanner-box ${biometricStatus}`}>
                  <svg className="fingerprint-svg" viewBox="0 0 100 100" width="120" height="120">
                    <path 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      d="M50 15c-18.7 0-34 15.3-34 34v1m4-1c0-16.5 13.5-30 30-30s30 13.5 30 30v1m-56 0c0-14.3 11.7-26 26-26s26 11.7 26 26v1m-48 0c0-12.1 9.9-22 22-22s22 9.9 22 22v1m-40 0c0-9.9 8.1-18 18-18s18 8.1 18 18m-32 0c0-6.6 5.4-12 12-12s12 5.4 12 12m-20 0c0-4.4 3.6-8 8-8s8 3.6 8 8" 
                    />
                  </svg>
                  {biometricStatus === 'scanning' && <div className="fingerprint-glowing-pulse"></div>}
                </div>
              )}
            </div>

            <div className="biometric-status-indicator mt-4">
              {biometricStatus === 'success' && <span className="indicator-badge success">✓ Secure Access Granted</span>}
              {biometricStatus === 'scanning' && <span className="indicator-badge scanning">⚡ Securing Session...</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
