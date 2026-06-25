import React, { useState, useEffect } from 'react';

export default function Settings({ user, onSettingsChange, addNotification }) {
  const [profileName, setProfileName] = useState(user?.name || 'Kavya');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'kavya.nair@zenithbank.com');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '+91 98765 43210');
  const [profileAddress, setProfileAddress] = useState(user?.address || '12, Outer Ring Road, Bengaluru');
  
  // Security options
  const [twoFactor, setTwoFactor] = useState(user?.securitySettings?.twoFactorEnabled ?? true);
  const [biometrics, setBiometrics] = useState(user?.securitySettings?.biometricLogin ?? false);
  const [timeout, setTimeoutVal] = useState(user?.securitySettings?.timeoutLimit ?? 5);
  const [newTxnPin, setNewTxnPin] = useState('');
  
  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState([]);

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
        onSettingsChange(); // Refresh profile state
        addNotification("Profile Updated", "Your contact details have been updated.");
        fetchAuditLogs(); // Refresh logs
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
        fetchAuditLogs(); // Refresh logs
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
        fetchAuditLogs(); // Refresh logs
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
        {/* Profile & Security forms */}
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

          {/* Security details toggles */}
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
                  <h4>Biometric Face ID Simulation</h4>
                  <p>Allow touch/face sign-ins in supporting devices</p>
                </div>
                <label className="switch-input">
                  <input 
                    type="checkbox" 
                    checked={biometrics}
                    onChange={e => {
                      setBiometrics(e.target.checked);
                      handleSecurityToggle('biometricLogin', e.target.checked);
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

        {/* Live Security Audit Log Explorer */}
        <div className="settings-logs-column">
          <div className="zenith-card audit-logs-card">
            <div className="logs-header-row">
              <div>
                <h3>Security Activity Log</h3>
                <p className="widget-subtitle">Real-time audit trail of API and profile updates</p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={fetchAuditLogs}>
                ↻ Refresh
              </button>
            </div>

            <div className="audit-timeline mt-4">
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
