// Authentication and Security helper service
/**
 * Log a security incident to user audit log
 * @param {object} db database instance
 * @param {string} action action identifier
 * @param {string} details descriptive details of transaction or lock status
 * @param {string} ip client IP address
 */
function logSecurityEvent(db, action, details, ip = '127.0.0.1') {
  const logEntry = {
    id: 'SEC-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    action,
    details,
    ip,
    device: 'Chrome v120 / Windows 11'
  };
  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.unshift(logEntry);
}

/**
 * Validates a 4-digit PIN against the database value
 * @param {object} db database instance
 * @param {string} inputPin pin to test
 * @returns {boolean} validity
 */
function verifyTransactionPin(db, inputPin) {
  return db.user.transactionPin === inputPin;
}

/**
 * Updates two-factor authentication toggles or limits
 * @param {object} db database instance
 * @param {object} securityParams security settings changes
 * @returns {object} updated security settings
 */
function updateSecuritySettings(db, securityParams) {
  if (securityParams.twoFactorEnabled !== undefined) {
    db.user.securitySettings.twoFactorEnabled = securityParams.twoFactorEnabled;
    logSecurityEvent(db, "MFA Settings Changed", `2FA authentication was ${securityParams.twoFactorEnabled ? 'enabled' : 'disabled'}`);
  }
  if (securityParams.biometricLogin !== undefined) {
    db.user.securitySettings.biometricLogin = securityParams.biometricLogin;
    logSecurityEvent(db, "Biometrics Toggled", `Fingerprint/Face login was ${securityParams.biometricLogin ? 'enabled' : 'disabled'}`);
  }
  if (securityParams.timeoutLimit !== undefined) {
    db.user.securitySettings.timeoutLimit = parseInt(securityParams.timeoutLimit);
    logSecurityEvent(db, "Inactivity Timeout Configured", `Inactivity duration threshold set to ${securityParams.timeoutLimit} minutes`);
  }
  if (securityParams.transactionPin !== undefined) {
    db.user.transactionPin = securityParams.transactionPin;
    logSecurityEvent(db, "Transaction PIN Modified", "User successfully modified their transaction execution PIN");
  }
  return db.user.securitySettings;
}

/**
 * Registers biometric authentication configuration
 * @param {object} db database instance
 * @param {object} biometrics face/fingerprint flags
 */
function updateBiometrics(db, biometrics) {
  if (biometrics.face !== undefined) db.user.biometricEnabled.face = biometrics.face;
  if (biometrics.fingerprint !== undefined) db.user.biometricEnabled.fingerprint = biometrics.fingerprint;
  logSecurityEvent(db, "Biometrics Configured", `Biometric settings adjusted: face=${db.user.biometricEnabled.face}, fingerprint=${db.user.biometricEnabled.fingerprint}`);
}

module.exports = {
  logSecurityEvent,
  verifyTransactionPin,
  updateSecuritySettings,
  updateBiometrics
};
