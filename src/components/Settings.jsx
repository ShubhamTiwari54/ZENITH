import React, { useState, useEffect } from 'react';

export default function Settings({ user, onSettingsChange, addNotification }) {
  const [profileName, setProfileName] = useState(user?.name || 'Kavya');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'kavya.nair@zenithbank.com');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '+91 98765 43210');
  const [profileAddress, setProfileAddress] = useState(user?.address || '12, Outer Ring Road, Bengaluru');
  
  // Security options
  const [twoFactor, setTwoFactor] = useState(user?.securitySettings?.twoFactorEnabled ?? true);
  const [timeout, setTimeoutVal] = useState(user?.securitySettings?.timeoutLimit ?? 5);
  const [newTxnPin, setNewTxnPin] = useState('');
  
  // Biometrics
  const [faceEnabled, setFaceEnabled] = useState(user?.biometricEnabled?.face ?? false);
  const [fingerprintEnabled, setFingerprintEnabled] = useState(user?.biometricEnabled?.fingerprint ?? false);

  // Accessibility
  const [lang, setLang] = useState(user?.accessibility?.language || 'en');
  const [fontSizeVal, setFontSizeVal] = useState(user?.accessibility?.fontSize || 'medium');
  const [themeVal, setThemeVal] = useState(user?.accessibility?.theme || 'light');
  const [contrastVal, setContrastVal] = useState(user?.accessibility?.contrast || 'normal');
  const [voiceNav, setVoiceNav] = useState(user?.accessibility?.voiceNavigation || false);

  // Audit Logs & Simulation state
  const [auditLogs, setAuditLogs] = useState([]);
  const [trustedDevices, setTrustedDevices] = useState(user?.trustedDevices || []);
  const [loginHistory, setLoginHistory] = useState(user?.loginHistory || []);
  const [fraudAlerts, setFraudAlerts] = useState(user?.fraudAlerts || []);

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch('/api/audit-logs');
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/settings/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
          phone: profilePhone,
          address: profileAddress
        })
      });

      if (response.ok) {
        onSettingsChange();
        addNotification("Profile Updated", "Your contact details have been updated.");
        fetchAuditLogs();
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSecurityToggle = async (field, value) => {
    try {
      const bodyData = {};
      bodyData[field] = value;

      const response = await fetch('/api/settings/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      if (response.ok) {
        onSettingsChange();
        addNotification("Security Configured", `Security setting for ${field} updated.`);
        fetchAuditLogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccessibilitySave = async (field, val) => {
    try {
      const body = {
        language: field === 'language' ? val : lang,
        fontSize: field === 'fontSize' ? val : fontSizeVal,
        theme: field === 'theme' ? val : themeVal,
        contrast: field === 'contrast' ? val : contrastVal,
        voiceNavigation: field === 'voiceNavigation' ? val : voiceNav
      };
      
      const response = await fetch('/api/settings/accessibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        onSettingsChange();
        addNotification("Accessibility Configured", `Updated accessibility setting: ${field}`);
        fetchAuditLogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBiometricsSave = async (field, val) => {
    try {
      const body = {
        face: field === 'face' ? val : faceEnabled,
        fingerprint: field === 'fingerprint' ? val : fingerprintEnabled
      };
      const response = await fetch('/api/settings/biometrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        onSettingsChange();
        addNotification("Biometrics Configured", "Adjusted simulated biometrics options.");
        fetchAuditLogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePinUpdate = async (e) => {
    e.preventDefault();
    if (newTxnPin.length !== 4 || isNaN(parseInt(newTxnPin))) {
      alert("PIN must be 4 digits.");
      return;
    }

    try {
      const response = await fetch('/api/settings/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionPin: newTxnPin })
      });

      if (response.ok) {
        setNewTxnPin('');
        addNotification("Transaction PIN Updated", "Your funds authorization PIN has been changed.");
        fetchAuditLogs();
      } else {
        alert("Failed to modify PIN.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <div className="welcome-section">
        <div>
          <h1 className="welcome-title">Settings & Security</h1>
          <p className="welcome-subtitle">Control privacy, edit credentials, and trace security logs.</p>
        </div>
      </div>

      <div className="settings-layout-grid">
        {/* Profile & Security inputs column */}
        <div className="settings-inputs-column">
          
          {/* Profile form */}
          <div className="zenith-card profile-settings-card">
            <h3>Personal Information</h3>
            <p className="widget-subtitle">Update contact details</p>

            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="form-group mt-4">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  required
                />
              </div>

              <div className="form-double-row">
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    className="form-control"
                    value={profileEmail}
                    onChange={e => setProfileEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={profilePhone}
                    onChange={e => setProfilePhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Billing Address</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={profileAddress}
                  onChange={e => setProfileAddress(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-full mt-2">Save Profile Updates</button>
            </form>
          </div>

          {/* Accessibility panel */}
          <div className="zenith-card accessibility-settings-card mt-6">
            <h3>Accessibility Profile</h3>
            <p className="widget-subtitle">Customize application rendering parameters</p>

            <div className="accessibility-selectors grid-2col-responsive mt-4">
              <div className="form-group">
                <label>Preferred Language</label>
                <select 
                  className="form-control" 
                  value={lang} 
                  onChange={e => { setLang(e.target.value); handleAccessibilitySave('language', e.target.value); }}
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="mr">मराठी (Marathi)</option>
                  <option value="gu">ગુજરાતી (Gujarati)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Text Scaling</label>
                <select 
                  className="form-control" 
                  value={fontSizeVal} 
                  onChange={e => { setFontSizeVal(e.target.value); handleAccessibilitySave('fontSize', e.target.value); }}
                >
                  <option value="normal">Normal Text</option>
                  <option value="medium">Medium Text</option>
                  <option value="large">Large Text</option>
                </select>
              </div>

              <div className="form-group">
                <label>Theme Style</label>
                <select 
                  className="form-control" 
                  value={themeVal} 
                  onChange={e => { setThemeVal(e.target.value); handleAccessibilitySave('theme', e.target.value); }}
                >
                  <option value="light">Light Theme</option>
                  <option value="dark">Dark Theme</option>
                </select>
              </div>

              <div className="form-group">
                <label>High Contrast Mode</label>
                <select 
                  className="form-control" 
                  value={contrastVal} 
                  onChange={e => { setContrastVal(e.target.value); handleAccessibilitySave('contrast', e.target.value); }}
                >
                  <option value="normal">Normal</option>
                  <option value="high">High Contrast</option>
                </select>
              </div>
            </div>

            <div className="toggle-row-item mt-4 pt-4 border-top-dash">
              <div>
                <h4>Voice Assistant Navigation</h4>
                <p>Support direct voice queries and read-backs</p>
              </div>
              <label className="switch-input">
                <input 
                  type="checkbox" 
                  checked={voiceNav}
                  onChange={e => { setVoiceNav(e.target.checked); handleAccessibilitySave('voiceNavigation', e.target.checked); }}
                />
                <span className="slider-switch"></span>
              </label>
            </div>
          </div>

          {/* Security details & biometrics */}
          <div className="zenith-card security-settings-card mt-6">
            <h3>Authorization Rules</h3>
            <p className="widget-subtitle">Configure Multi-Factor and Transaction PINs</p>

            <div className="security-toggles-list mt-4">
              <div className="toggle-row-item">
                <div>
                  <h4>Two-Factor Authentication (2FA)</h4>
                  <p>Require OTP code during money transfers</p>
                </div>
                <label className="switch-input">
                  <input 
                    type="checkbox" 
                    checked={twoFactor}
                    onChange={e => {
                      setTwoFactor(e.target.checked);
                      handleSecurityToggle('twoFactorEnabled', e.target.checked);
                    }}
                  />
                  <span className="slider-switch"></span>
                </label>
              </div>

              <div className="toggle-row-item">
                <div>
                  <h4>Face ID Authentication</h4>
                  <p>Simulate face recognition scan during checkouts</p>
                </div>
                <label className="switch-input">
                  <input 
                    type="checkbox" 
                    checked={faceEnabled}
                    onChange={e => {
                      setFaceEnabled(e.target.checked);
                      handleBiometricsSave('face', e.target.checked);
                    }}
                  />
                  <span className="slider-switch"></span>
                </label>
              </div>

              <div className="toggle-row-item">
                <div>
                  <h4>Touch ID Fingerprint scanner</h4>
                  <p>Simulate fingerprint scan challenge during signins</p>
                </div>
                <label className="switch-input">
                  <input 
                    type="checkbox" 
                    checked={fingerprintEnabled}
                    onChange={e => {
                      setFingerprintEnabled(e.target.checked);
                      handleBiometricsSave('fingerprint', e.target.checked);
                    }}
                  />
                  <span className="slider-switch"></span>
                </label>
              </div>

              <div className="toggle-row-item">
                <div>
                  <h4>Auto Session Lockout</h4>
                  <p>Log out after {timeout} minutes of inactivity</p>
                </div>
                <select 
                  className="form-control timeout-select" 
                  value={timeout}
                  onChange={e => {
                    setTimeoutVal(parseInt(e.target.value));
                    handleSecurityToggle('timeoutLimit', parseInt(e.target.value));
                  }}
                >
                  <option value="1">1 Min</option>
                  <option value="2">2 Mins</option>
                  <option value="5">5 Mins</option>
                  <option value="10">10 Mins</option>
                </select>
              </div>
            </div>

            {/* Change Txn PIN */}
            <form onSubmit={handlePinUpdate} className="pin-update-form mt-6 pt-6 border-top-dash">
              <div className="form-group">
                <label>Reset Transaction PIN (4 digits)</label>
                <div className="flex-row gap-4">
                  <input 
                    type="password" 
                    maxLength="4"
                    className="form-control text-center font-bold"
                    style={{ letterSpacing: '6px', fontSize: '18px', width: '120px' }}
                    placeholder="••••"
                    value={newTxnPin}
                    onChange={e => setNewTxnPin(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-secondary flex-1">Update PIN</button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Live Security Audit Log Explorer & Device Info */}
        <div className="settings-logs-column">
          
          {/* Trusted Devices and Login History */}
          <div className="zenith-card device-management-card">
            <h3>Device Management</h3>
            <p className="widget-subtitle">Authorized devices and active sessions</p>

            <div className="trusted-devices-list mt-4">
              <h4 style={{ fontSize: '13px', fontWeight: 'bold' }}>Active Devices</h4>
              {trustedDevices.map(dev => (
                <div key={dev.id} className="device-item flex items-center justify-between mt-2 p-2" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--body-bg)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <strong style={{ fontSize: '13px' }}>{dev.model}</strong>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Registered: {dev.dateAdded}</p>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 'bold' }}>{dev.active ? 'Active' : ''}</span>
                </div>
              ))}
            </div>

            <div className="login-history-list mt-4 pt-4 border-top-dash">
              <h4 style={{ fontSize: '13px', fontWeight: 'bold' }}>Login History</h4>
              <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
                {loginHistory.map((history, idx) => (
                  <div key={idx} className="history-row mt-2" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', borderBottom: '1px solid var(--card-border)', paddingBottom: '6px' }}>
                    <div>
                      <strong>{history.device}</strong>
                      <p style={{ color: 'var(--text-muted)' }}>{new Date(history.date).toLocaleDateString()}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p>IP: {history.ip}</p>
                      <span className="text-success">{history.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Fraud Alerts */}
          {fraudAlerts.length > 0 && (
            <div className="zenith-card fraud-alerts-card mt-6" style={{ borderLeft: '4px solid var(--danger)' }}>
              <h3>🚨 AI Security Fraud Alerts</h3>
              <p className="widget-subtitle">Unusual transaction behaviors analyzed in real-time</p>
              
              <div className="fraud-alerts-list mt-3">
                {fraudAlerts.map(alert => (
                  <div key={alert.id} className="alert-item p-3" style={{ background: 'var(--danger-bg)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
                      <span>{alert.merchant}</span>
                      <span style={{ color: 'var(--danger)' }}>₹{alert.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '6px', color: 'var(--text-secondary)' }}>
                      <span>Date: {alert.date}</span>
                      <span>Action: <strong>{alert.action} ({alert.status})</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Real-time Audit Logs */}
          <div className="zenith-card audit-logs-card mt-6">
            <div className="logs-header-row">
              <div>
                <h3>Security Activity Log</h3>
                <p className="widget-subtitle">Real-time audit trail of API and profile updates</p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={fetchAuditLogs}>
                ↻ Refresh
              </button>
            </div>

            <div className="audit-timeline mt-4" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {auditLogs.length === 0 ? (
                <p className="text-secondary text-center py-6">No security events logged.</p>
              ) : (
                auditLogs.map(log => (
                  <div key={log.id} className="audit-timeline-item">
                    <div className="timeline-dot-indicator"></div>
                    <div className="timeline-content-box">
                      <div className="timeline-header-meta">
                        <strong>{log.action}</strong>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="timeline-detail-txt">{log.details}</p>
                      <div className="timeline-footer-meta mt-1">
                        <span>IP: {log.ip}</span>
                        <span>{log.device}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
