// Smart Notification Service

/**
 * Generate real-time personalized smart notifications based on user data
 * @param {object} db database instance
 * @returns {Array} notifications list
 */
function generateSmartNotifications(db) {
  const notifications = [];
  const savings = db.accounts.savings.availableBalance;
  
  // 1. Low Balance Alert
  if (savings < 20000) {
    notifications.push({
      id: "NTF-LOW-BAL",
      title: "Low Balance Warning",
      message: `Your savings available balance (₹${savings.toLocaleString('en-IN')}) is below your recommended threshold.`,
      time: "Just Now",
      type: "warning"
    });
  }

  // 2. Bill Due Alerts
  const upcomingBills = db.upcomingPayments || [];
  upcomingBills.forEach(bill => {
    if (!bill.paid && bill.dueDays <= 3) {
      notifications.push({
        id: `NTF-BILL-${bill.id}`,
        title: "Bill Payment Pending",
        message: `Your ${bill.title} of ₹${bill.amount.toLocaleString('en-IN')} is due in ${bill.dueDays} days.`,
        time: "1h ago",
        type: "danger"
      });
    }
  });

  // 3. EMI Reminder
  const activeLoans = db.loans || [];
  activeLoans.forEach(loan => {
    const nextDate = new Date(loan.nextDueDate);
    const diffDays = Math.ceil((nextDate - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays > 0 && diffDays <= 7) {
      notifications.push({
        id: `NTF-EMI-${loan.id}`,
        title: "EMI Due Soon",
        message: `Your ${loan.type} monthly EMI of ₹${loan.monthlyEMI.toLocaleString('en-IN')} is due on ${loan.nextDueDate}.`,
        time: "3h ago",
        type: "info"
      });
    }
  });

  // 4. Large Debit Alerts
  const transactions = db.transactions || [];
  if (transactions.length > 0 && transactions[0].type === 'debit' && transactions[0].amount >= 5000) {
    notifications.push({
      id: "NTF-LARGE-TXN",
      title: "Large Expense Alert",
      message: `A charge of ₹${transactions[0].amount.toLocaleString('en-IN')} at ${transactions[0].merchant} was debited.`,
      time: "Recent",
      type: "info"
    });
  }

  // 5. Fraud Alert Notification
  const activeFraud = db.user.fraudAlerts || [];
  if (activeFraud.length > 0) {
    notifications.push({
      id: "NTF-FRAUD-RISK",
      title: "Security Fraud Warning",
      message: `Zenith AI blocked a suspicious charge of ₹${activeFraud[0].amount.toLocaleString('en-IN')} at ${activeFraud[0].merchant}.`,
      time: "24h ago",
      type: "danger"
    });
  }

  // 6. CIBIL score notification
  if (db.financialHealthScore && db.financialHealthScore.score >= 750) {
    notifications.push({
      id: "NTF-CREDIT-EXCELLENT",
      title: "Credit Rating: Excellent",
      message: `Your CIBIL score is ${db.financialHealthScore.score}. You qualify for pre-approved loans!`,
      time: "1d ago",
      type: "success"
    });
  }

  // Fallback default message if empty
  if (notifications.length === 0) {
    notifications.push({
      id: "NTF-WELCOME",
      title: "Account Secure",
      message: "Your hyper-personalized secure dashboard is active. No pending critical warnings.",
      time: "Just Now",
      type: "success"
    });
  }

  return notifications;
}

module.exports = {
  generateSmartNotifications
};
