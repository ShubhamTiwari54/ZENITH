// Real-time Transaction Security and Fraud Engine
const authService = require('./authService.cjs');

/**
 * Checks a transaction for fraud indicators in real-time
 * @param {object} db database instance
 * @param {object} transactionDetails payee, amount, channel info
 * @returns {object} verification verdict: { allowed: boolean, reason: string }
 */
function inspectTransaction(db, transactionDetails) {
  const amount = parseFloat(transactionDetails.amount);
  const card = db.creditCard;

  // 1. Frozen Card Check
  if (transactionDetails.channel === 'card' && card.frozen) {
    return { allowed: false, reason: "Zenith credit card is currently suspended/frozen by user." };
  }

  // 2. Limit Breach
  if (transactionDetails.channel === 'card') {
    const limits = card.limits || { online: 75000, offline: 25000, contactless: 15000 };
    if (transactionDetails.type === 'online' && amount > limits.online) {
      return { allowed: false, reason: `Online charge of ₹${amount} exceeds set limit cap of ₹${limits.online}.` };
    }
  }

  // 3. International Mode Check
  if (transactionDetails.isInternational && card && !card.internationalEnabled) {
    authService.logSecurityEvent(db, "Fraud Blocked", `Blocked international transaction of ₹${amount} at ${transactionDetails.merchant || 'ForeignMerchant'} (International Mode Disabled)`);
    return { allowed: false, reason: "International transactions are disabled on this card." };
  }

  // 4. Large Transaction Risk Trigger (e.g. > 1,500,000 INR)
  if (amount > 150000) {
    authService.logSecurityEvent(db, "High Risk Suspended", `Flagged high-risk transfer of ₹${amount} to ${transactionDetails.merchant || transactionDetails.recipientName}. Awaiting security verification.`);
    return { allowed: false, reason: "Transaction exceeds secure limit threshold. Direct contact verification required." };
  }

  return { allowed: true, reason: "Verified secure transaction." };
}

/**
 * Flags fraud on card, logs audit event, and locks card instantly
 * @param {object} db database instance
 * @param {string} merchant merchant name
 * @param {number} amount transaction amount
 * @returns {object} updated card settings
 */
function reportFraudAlert(db, merchant, amount) {
  if (!db.user.fraudAlerts) db.user.fraudAlerts = [];
  
  const alertId = 'FRD-' + Date.now();
  const alertObj = {
    id: alertId,
    date: new Date().toISOString().split('T')[0],
    merchant: merchant || 'Unknown Merchant',
    amount: amount || 0,
    status: "Blocked",
    action: "Declined"
  };

  db.user.fraudAlerts.unshift(alertObj);
  
  // Lock credit card
  if (db.creditCard) {
    db.creditCard.frozen = true;
  }

  authService.logSecurityEvent(db, "Fraud Suspicious Activity Reported", `Card reported for fraud at ${alertObj.merchant}. Suspended card ending in 4567.`);
  
  return alertObj;
}

module.exports = {
  inspectTransaction,
  reportFraudAlert
};
