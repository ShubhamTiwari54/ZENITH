const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(bodyParser.json());

// Helper function to read database
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDB(getInitialSeedData());
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file, using seed data:", err);
    return getInitialSeedData();
  }
}

// Helper function to write database
function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}

// Helper to add to Security Audit Log
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
  db.auditLogs.unshift(logEntry); // Add to the top
}

// Initial Database Seeding Data
function getInitialSeedData() {
  const seed = {
    user: {
      name: "Kavya",
      email: "kavya.nair@zenithbank.com",
      phone: "+91 98765 43210",
      address: "12, Outer Ring Road, Indiranagar, Bengaluru, 560038",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces",
      transactionPin: "1234",
      securitySettings: {
        twoFactorEnabled: true,
        biometricLogin: false,
        timeoutLimit: 5 // minutes
      }
    },
    accounts: {
      savings: {
        accountNumber: "9876 5432 1098",
        routingNumber: "ZENI0000109",
        balance: 782450.30,
        availableBalance: 560230.10
      },
      current: {
        accountNumber: "8765 4321 0987",
        routingNumber: "ZENI0000109",
        balance: 145000.00,
        availableBalance: 145000.00
      }
    },
    monthlyIncome: 195000,
    monthlyExpenses: 76850,
    creditCard: {
      cardNumber: "4312 8890 5433 4567",
      cardHolder: "KAVYA NAIR",
      expiry: "09/30",
      cvv: "258",
      frozen: false,
      availableLimit: 145230,
      totalLimit: 200000,
      limits: {
        online: 75000,
        offline: 25000,
        contactless: 15000
      }
    },
    spendingBreakdown: [
      { category: "Food & Dining", percentage: 25, amount: 19210, color: "#FF5E8E" },
      { category: "Housing", percentage: 24, amount: 18430, color: "#7B61FF" },
      { category: "Transport", percentage: 16, amount: 12300, color: "#3B82F6" },
      { category: "Shopping", percentage: 14, amount: 10760, color: "#10B981" },
      { category: "Bills & Utilities", percentage: 11, amount: 8450, color: "#F59E0B" },
      { category: "Others", percentage: 10, amount: 7700, color: "#6B7280" }
    ],
    financialHealthScore: {
      score: 790,
      creditUtilization: "Good",
      paymentHistory: "100%",
      derogatoryMarks: "Excellent",
      ageOfCredit: "Good"
    },
    upcomingPayments: [
      { id: 1, type: "credit_card", title: "Credit Card Bill", dueDays: 3, amount: 8750, paid: false },
      { id: 2, type: "mobile", title: "Mobile Bill", dueDays: 5, amount: 589, paid: false },
      { id: 3, type: "internet", title: "Internet Bill", dueDays: 7, amount: 799, paid: false }
    ],
    offers: [
      { id: 1, title: "10% Cashback on Flight Bookings", subtitle: "Using Zenith Credit Card", link: "Book Now", badge: "Travel", code: "ZENFLIGHT10", reward: "Up to ₹1,500 cashback" },
      { id: 2, title: "Zero Processing Fee on Personal Loan", subtitle: "Limited Time Offer", link: "Apply Now", badge: "Loans", code: "ZENLOAN0", reward: "Saves up to ₹5,000" },
      { id: 3, title: "Up to 7.5% p.a. on Fixed Deposits", subtitle: "Secure your future", link: "Invest Now", badge: "Investments", code: "ZENFD75", reward: "High yield guaranteed" }
    ],
    transactions: [
      { id: "TXN10001", date: "2026-06-24T18:32:00Z", merchant: "Zomato India", description: "Food Delivery", amount: 1250, type: "debit", category: "Food & Dining", status: "Completed" },
      { id: "TXN10002", date: "2026-06-24T12:15:00Z", merchant: "Uber India", description: "Ride Share", amount: 450, type: "debit", category: "Transport", status: "Completed" },
      { id: "TXN10003", date: "2026-06-23T20:45:00Z", merchant: "Netflix India", description: "Subscription Plan", amount: 799, type: "debit", category: "Bills & Utilities", status: "Completed" },
      { id: "TXN10004", date: "2026-06-23T10:00:00Z", merchant: "Salary Zenith Inc", description: "Monthly Corporate Payout", amount: 195000, type: "credit", category: "Income", status: "Completed" },
      { id: "TXN10005", date: "2026-06-22T15:30:00Z", merchant: "Amazon India", description: "Ergonomic Office Chair", amount: 8499, type: "debit", category: "Shopping", status: "Completed" },
      { id: "TXN10006", date: "2026-06-22T09:10:00Z", merchant: "Starbucks Coffee", description: "Morning Brew", amount: 380, type: "debit", category: "Food & Dining", status: "Completed" },
      { id: "TXN10007", date: "2026-06-21T11:20:00Z", merchant: "Decathlon Sports", description: "Running Shoes", amount: 2261, type: "debit", category: "Shopping", status: "Completed" },
      { id: "TXN10008", date: "2026-06-20T21:00:00Z", merchant: "Airtel Broadband", description: "Wifi Bill Payment", amount: 999, type: "debit", category: "Bills & Utilities", status: "Completed" },
      { id: "TXN10009", date: "2026-06-20T17:40:00Z", merchant: "Shell Fuel Station", description: "Petrol Top-up", amount: 2500, type: "debit", category: "Transport", status: "Completed" },
      { id: "TXN10010", date: "2026-06-19T14:15:00Z", merchant: "Bescom Power", description: "Electricity Bill", amount: 1540, type: "debit", category: "Bills & Utilities", status: "Completed" },
      { id: "TXN10011", date: "2026-06-18T10:00:00Z", merchant: "Landlord Rent", description: "Monthly Apartment Rental", amount: 18430, type: "debit", category: "Housing", status: "Completed" },
      { id: "TXN10012", date: "2026-06-17T16:20:00Z", merchant: "Swiggy Instamart", description: "Weekly Groceries", amount: 3450, type: "debit", category: "Food & Dining", status: "Completed" },
      { id: "TXN10013", date: "2026-06-16T13:00:00Z", merchant: "H&M Apparel", description: "Summer Jackets", amount: 4500, type: "debit", category: "Shopping", status: "Completed" },
      { id: "TXN10014", date: "2026-06-15T09:00:00Z", merchant: "Interest Credit", description: "Savings Account Interest", amount: 1250.30, type: "credit", category: "Income", status: "Completed" },
      { id: "TXN10015", date: "2026-06-14T19:50:00Z", merchant: "BookMyShow", description: "Movie Tickets", amount: 920, type: "debit", category: "Others", status: "Completed" }
    ],
    budgets: [
      { category: "Food & Dining", spent: 19210, limit: 25000 },
      { category: "Housing", spent: 18430, limit: 20000 },
      { category: "Transport", spent: 12300, limit: 15000 },
      { category: "Shopping", spent: 10760, limit: 12000 },
      { category: "Bills & Utilities", spent: 8450, limit: 10000 },
      { category: "Others", spent: 7700, limit: 10000 }
    ],
    loans: [
      { id: 1, type: "Personal Loan", amount: 300000, remaining: 120000, nextDueDate: "2026-07-05", monthlyEMI: 8500, tenureMonths: 36, paidMonths: 24, rate: 10.5 },
      { id: 2, type: "Car Loan", amount: 800000, remaining: 650000, nextDueDate: "2026-07-10", monthlyEMI: 15400, tenureMonths: 60, paidMonths: 12, rate: 8.75 }
    ],
    insurance: [
      { id: 1, type: "Health Insurance", provider: "Zenith Care Plan", premium: 1200, coverage: 500000, status: "Active", number: "INS-HLTH-902341" },
      { id: 2, type: "Car Insurance", provider: "Zenith Auto Safe", premium: 850, coverage: 300000, status: "Active", number: "INS-AUTO-783229" }
    ],
    investments: {
      summary: { stocks: 125000, mutualFunds: 82000, gold: 45000, fixedDeposits: 150000 },
      holdings: [
        { symbol: "ZENITH", name: "Zenith Bancorp", shares: 150, avgPrice: 150, currentPrice: 185, type: "stock" },
        { symbol: "TCS", name: "Tata Consultancy Services", shares: 12, avgPrice: 3200, currentPrice: 3450, type: "stock" },
        { symbol: "RELIANCE", name: "Reliance Industries", shares: 20, avgPrice: 2200, currentPrice: 2450, type: "stock" }
      ],
      fixedDeposits: [
        { id: 1, amount: 150000, interestRate: 7.5, termMonths: 12, startDate: "2025-10-10", maturityAmount: 161250, autoRenew: true }
      ]
    },
    auditLogs: [],
    supportTickets: [
      { id: "TKT-879", subject: "Inquire about Home Loan rates", status: "Closed", date: "2026-06-20", category: "Loans" }
    ]
  };

  // Seed initial audit log
  const initialLog = {
    id: 'SEC-INIT',
    timestamp: new Date().toISOString(),
    action: "System Startup",
    details: "Demo database seeded successfully with default configurations",
    ip: "127.0.0.1",
    device: "System Core"
  };
  seed.auditLogs.push(initialLog);
  return seed;
}

// Ensure database is created on startup
readDB();

// API Endpoints

// 1. Get Dashboard Details
app.get('/api/dashboard', (req, res) => {
  const db = readDB();
  res.json({
    user: {
      name: db.user.name,
      avatar: db.user.avatar,
      email: db.user.email,
      securitySettings: db.user.securitySettings
    },
    accounts: db.accounts,
    monthlyIncome: db.monthlyIncome,
    monthlyExpenses: db.monthlyExpenses,
    creditCard: {
      cardNumber: db.creditCard.cardNumber,
      expiry: db.creditCard.expiry,
      frozen: db.creditCard.frozen,
      availableLimit: db.creditCard.availableLimit,
      totalLimit: db.creditCard.totalLimit
    },
    spendingBreakdown: db.spendingBreakdown,
    financialHealthScore: db.financialHealthScore,
    upcomingPayments: db.upcomingPayments.filter(p => !p.paid),
    offers: db.offers
  });
});

// 2. Get Transaction Records
app.get('/api/transactions', (req, res) => {
  const db = readDB();
  res.json(db.transactions);
});

// 3. Make Transaction (Transfer)
app.post('/api/transactions', (req, res) => {
  const { recipientName, recipientAccount, amount, category, remark, pin } = req.body;
  const db = readDB();

  // Basic Validation
  if (!recipientName || !recipientAccount || !amount || !pin) {
    return res.status(400).json({ error: "Missing required details." });
  }

  const txnAmount = parseFloat(amount);
  if (isNaN(txnAmount) || txnAmount <= 0) {
    return res.status(400).json({ error: "Invalid transfer amount." });
  }

  // PIN Validation
  if (pin !== db.user.transactionPin) {
    logSecurityEvent(db, "Failed Transfer Attempt", `Incorrect transaction PIN entered for transfer of ₹${txnAmount} to ${recipientName}`);
    writeDB(db);
    return res.status(401).json({ error: "Invalid Transaction PIN." });
  }

  // Funds Check
  if (db.accounts.savings.availableBalance < txnAmount) {
    logSecurityEvent(db, "Failed Transfer Attempt", `Insufficient funds for transfer of ₹${txnAmount} to ${recipientName}`);
    writeDB(db);
    return res.status(400).json({ error: "Insufficient available balance in savings account." });
  }

  // Deduct Balance
  db.accounts.savings.balance -= txnAmount;
  db.accounts.savings.availableBalance -= txnAmount;

  // Add Expenses tracking if it matches a category
  db.monthlyExpenses += txnAmount;

  // Update Category Spending Breakdown if applicable
  const categoryMap = {
    "Food & Dining": 0,
    "Housing": 1,
    "Transport": 2,
    "Shopping": 3,
    "Bills & Utilities": 4,
    "Others": 5
  };
  const categoryIndex = categoryMap[category] !== undefined ? categoryMap[category] : 5;
  db.spendingBreakdown[categoryIndex].amount += txnAmount;

  // Re-calculate percentages for breakdown
  const totalSpend = db.spendingBreakdown.reduce((sum, item) => sum + item.amount, 0);
  db.spendingBreakdown.forEach(item => {
    item.percentage = Math.round((item.amount / totalSpend) * 100);
  });

  // Create Transaction Record
  const newTxn = {
    id: "TXN" + Math.floor(10000 + Math.random() * 90000),
    date: new Date().toISOString(),
    merchant: recipientName,
    description: remark || `Transfer to A/C: ${recipientAccount.slice(-4)}`,
    amount: txnAmount,
    type: "debit",
    category: category || "Others",
    status: "Completed"
  };

  db.transactions.unshift(newTxn);

  // Security Log
  logSecurityEvent(db, "Fund Transfer Executed", `Transferred ₹${txnAmount.toLocaleString('en-IN')} to ${recipientName} (A/C: ${recipientAccount})`);

  writeDB(db);
  res.json({ success: true, balance: db.accounts.savings.balance, transaction: newTxn });
});

// 4. Pay Bill from Dashboard
app.post('/api/payments/pay-bill', (req, res) => {
  const { billId } = req.body;
  const db = readDB();

  const billIndex = db.upcomingPayments.findIndex(p => p.id === parseInt(billId));
  if (billIndex === -1) {
    return res.status(404).json({ error: "Bill not found." });
  }

  const bill = db.upcomingPayments[billIndex];
  if (bill.paid) {
    return res.status(400).json({ error: "Bill already paid." });
  }

  if (db.accounts.savings.availableBalance < bill.amount) {
    logSecurityEvent(db, "Failed Bill Payment", `Insufficient funds to pay ${bill.title} of ₹${bill.amount}`);
    writeDB(db);
    return res.status(400).json({ error: "Insufficient available balance to pay this bill." });
  }

  // Deduct
  db.accounts.savings.balance -= bill.amount;
  db.accounts.savings.availableBalance -= bill.amount;
  db.monthlyExpenses += bill.amount;

  // Mark bill as paid
  bill.paid = true;

  // Create Transaction Record
  const newTxn = {
    id: "TXN" + Math.floor(10000 + Math.random() * 90000),
    date: new Date().toISOString(),
    merchant: bill.title,
    description: `Paid Bill: ${bill.title}`,
    amount: bill.amount,
    type: "debit",
    category: "Bills & Utilities",
    status: "Completed"
  };
  db.transactions.unshift(newTxn);

  // Log Security Event
  logSecurityEvent(db, "Bill Payment Completed", `Paid bill "${bill.title}" of ₹${bill.amount.toLocaleString('en-IN')}`);

  writeDB(db);
  res.json({ success: true, balance: db.accounts.savings.balance, upcomingPayments: db.upcomingPayments.filter(p => !p.paid) });
});

// 5. Get Cards API
app.get('/api/cards', (req, res) => {
  const db = readDB();
  res.json(db.creditCard);
});

// 6. Freeze Card Toggle
app.post('/api/cards/toggle-freeze', (req, res) => {
  const db = readDB();
  db.creditCard.frozen = !db.creditCard.frozen;
  const status = db.creditCard.frozen ? "Frozen" : "Unfrozen";

  // Log event
  logSecurityEvent(db, `Card ${status}`, `Credit Card ending 4567 was ${status.toLowerCase()} by user`);

  writeDB(db);
  res.json({ success: true, frozen: db.creditCard.frozen });
});

// 7. Update Card Spending Limits
app.post('/api/cards/update-limits', (req, res) => {
  const { online, offline, contactless } = req.body;
  const db = readDB();

  if (online !== undefined) db.creditCard.limits.online = parseInt(online);
  if (offline !== undefined) db.creditCard.limits.offline = parseInt(offline);
  if (contactless !== undefined) db.creditCard.limits.contactless = parseInt(contactless);

  logSecurityEvent(db, "Card Limits Updated", `Transaction limits modified. Online: ₹${db.creditCard.limits.online}, Offline: ₹${db.creditCard.limits.offline}, Contactless: ₹${db.creditCard.limits.contactless}`);

  writeDB(db);
  res.json({ success: true, limits: db.creditCard.limits });
});

// 8. Reset Card PIN
app.post('/api/cards/reset-pin', (req, res) => {
  const { newPin, currentPin } = req.body;
  const db = readDB();

  if (!newPin || newPin.length !== 4 || isNaN(parseInt(newPin))) {
    return res.status(400).json({ error: "PIN must be a 4-digit number." });
  }

  // Validate user pin to confirm authority
  if (currentPin !== db.user.transactionPin) {
    logSecurityEvent(db, "Failed Card PIN Reset", "Attempted to reset credit card PIN with invalid transaction PIN");
    writeDB(db);
    return res.status(401).json({ error: "Invalid Transaction PIN." });
  }

  db.creditCard.creditCardPin = newPin;
  logSecurityEvent(db, "Card PIN Reset Success", "Successfully reset credit card PIN");

  writeDB(db);
  res.json({ success: true });
});

// 9. Reveal Card Details (CVV/Card Number)
app.post('/api/cards/reveal', (req, res) => {
  const { pin } = req.body;
  const db = readDB();

  if (pin !== db.user.transactionPin) {
    logSecurityEvent(db, "Unauthorized Card Reveal", "Failed PIN validation during attempt to reveal full card details");
    writeDB(db);
    return res.status(401).json({ error: "Invalid transaction PIN." });
  }

  logSecurityEvent(db, "Card Details Revealed", "Successfully authorized full card details and CVV exposure");
  res.json({ cardNumber: db.creditCard.cardNumber, cvv: db.creditCard.cvv });
});

// 10. Buy/Sell Investment Assets
app.post('/api/investments/trade', (req, res) => {
  const { symbol, shares, type, currentPrice, action } = req.body; // action: 'buy' or 'sell'
  const db = readDB();

  const shareCount = parseInt(shares);
  const price = parseFloat(currentPrice);

  if (!symbol || isNaN(shareCount) || shareCount <= 0 || !action || isNaN(price)) {
    return res.status(400).json({ error: "Invalid trade parameters." });
  }

  const totalCost = shareCount * price;

  if (action === 'buy') {
    if (db.accounts.savings.availableBalance < totalCost) {
      return res.status(400).json({ error: "Insufficient savings balance to complete purchase." });
    }

    db.accounts.savings.balance -= totalCost;
    db.accounts.savings.availableBalance -= totalCost;

    // Add holdings or update existing
    const holdingIndex = db.investments.holdings.findIndex(h => h.symbol === symbol);
    if (holdingIndex !== -1) {
      const holding = db.investments.holdings[holdingIndex];
      const newTotalShares = holding.shares + shareCount;
      holding.avgPrice = ((holding.shares * holding.avgPrice) + totalCost) / newTotalShares;
      holding.shares = newTotalShares;
    } else {
      db.investments.holdings.push({
        symbol,
        name: symbol === 'ZENITH' ? 'Zenith Bancorp' : (symbol === 'TCS' ? 'Tata Consultancy Services' : 'Reliance Industries'),
        shares: shareCount,
        avgPrice: price,
        currentPrice: price,
        type: "stock"
      });
    }

    db.investments.summary.stocks += totalCost;

    // Create txn
    db.transactions.unshift({
      id: "TXN" + Math.floor(10000 + Math.random() * 90000),
      date: new Date().toISOString(),
      merchant: `Investments: Buy ${symbol}`,
      description: `Bought ${shareCount} shares of ${symbol}`,
      amount: totalCost,
      type: "debit",
      category: "Shopping", // Or Investment category
      status: "Completed"
    });

    logSecurityEvent(db, "Asset Purchase", `Purchased ${shareCount} shares of ${symbol} for ₹${totalCost.toLocaleString('en-IN')}`);
  } else if (action === 'sell') {
    const holdingIndex = db.investments.holdings.findIndex(h => h.symbol === symbol);
    if (holdingIndex === -1 || db.investments.holdings[holdingIndex].shares < shareCount) {
      return res.status(400).json({ error: "Insufficient shares available to sell." });
    }

    const holding = db.investments.holdings[holdingIndex];
    db.accounts.savings.balance += totalCost;
    db.accounts.savings.availableBalance += totalCost;

    holding.shares -= shareCount;
    db.investments.summary.stocks -= (shareCount * holding.avgPrice);

    // Clean up if shares = 0
    if (holding.shares === 0) {
      db.investments.holdings.splice(holdingIndex, 1);
    }

    // Create txn
    db.transactions.unshift({
      id: "TXN" + Math.floor(10000 + Math.random() * 90000),
      date: new Date().toISOString(),
      merchant: `Investments: Sell ${symbol}`,
      description: `Sold ${shareCount} shares of ${symbol}`,
      amount: totalCost,
      type: "credit",
      category: "Income",
      status: "Completed"
    });

    logSecurityEvent(db, "Asset Liquidation", `Sold ${shareCount} shares of ${symbol} for ₹${totalCost.toLocaleString('en-IN')}`);
  }

  writeDB(db);
  res.json({ success: true, balance: db.accounts.savings.balance, investments: db.investments });
});

// 11. Create Fixed Deposit
app.post('/api/investments/fd', (req, res) => {
  const { amount, termMonths, autoRenew } = req.body;
  const db = readDB();

  const fdAmount = parseFloat(amount);
  const term = parseInt(termMonths);

  if (isNaN(fdAmount) || fdAmount < 10000 || isNaN(term) || term <= 0) {
    return res.status(400).json({ error: "Invalid FD details. Minimum amount is ₹10,000." });
  }

  if (db.accounts.savings.availableBalance < fdAmount) {
    return res.status(400).json({ error: "Insufficient available balance." });
  }

  db.accounts.savings.balance -= fdAmount;
  db.accounts.savings.availableBalance -= fdAmount;

  const rate = 7.5;
  const interest = (fdAmount * rate * (term / 12)) / 100;
  const maturityVal = fdAmount + interest;

  const newFD = {
    id: db.investments.fixedDeposits.length + 1,
    amount: fdAmount,
    interestRate: rate,
    termMonths: term,
    startDate: new Date().toISOString().split('T')[0],
    maturityAmount: parseFloat(maturityVal.toFixed(2)),
    autoRenew: !!autoRenew
  };

  db.investments.fixedDeposits.push(newFD);
  db.investments.summary.fixedDeposits += fdAmount;

  // Add Transaction
  db.transactions.unshift({
    id: "TXN" + Math.floor(10000 + Math.random() * 90000),
    date: new Date().toISOString(),
    merchant: "Zenith Fixed Deposit",
    description: `Opened FD Plan (Maturity: ₹${newFD.maturityAmount.toLocaleString('en-IN')})`,
    amount: fdAmount,
    type: "debit",
    category: "Others",
    status: "Completed"
  });

  logSecurityEvent(db, "Fixed Deposit Opened", `Created Fixed Deposit of ₹${fdAmount.toLocaleString('en-IN')} for ${term} months at ${rate}% interest`);

  writeDB(db);
  res.json({ success: true, balance: db.accounts.savings.balance, investments: db.investments });
});

// 12. Get Security Audit Logs
app.get('/api/audit-logs', (req, res) => {
  const db = readDB();
  res.json(db.auditLogs || []);
});

// 13. Get Settings / Budgets
app.get('/api/settings', (req, res) => {
  const db = readDB();
  res.json({
    user: db.user,
    budgets: db.budgets,
    loans: db.loans,
    insurance: db.insurance
  });
});

// 14. Update Settings / Profile
app.post('/api/settings/profile', (req, res) => {
  const { name, email, phone, address } = req.body;
  const db = readDB();

  if (name) db.user.name = name;
  if (email) db.user.email = email;
  if (phone) db.user.phone = phone;
  if (address) db.user.address = address;

  logSecurityEvent(db, "Profile Updated", "User modified their personal contact profile settings");

  writeDB(db);
  res.json({ success: true, user: db.user });
});

// 15. Update Security Toggles
app.post('/api/settings/security', (req, res) => {
  const { twoFactorEnabled, biometricLogin, timeoutLimit, transactionPin } = req.body;
  const db = readDB();

  if (twoFactorEnabled !== undefined) {
    db.user.securitySettings.twoFactorEnabled = twoFactorEnabled;
    logSecurityEvent(db, "MFA Settings Changed", `2FA authentication was ${twoFactorEnabled ? 'enabled' : 'disabled'}`);
  }

  if (biometricLogin !== undefined) {
    db.user.securitySettings.biometricLogin = biometricLogin;
    logSecurityEvent(db, "Biometrics Toggled", `Fingerprint/Face login was ${biometricLogin ? 'enabled' : 'disabled'}`);
  }

  if (timeoutLimit !== undefined) {
    db.user.securitySettings.timeoutLimit = parseInt(timeoutLimit);
    logSecurityEvent(db, "Inactivity Timeout Configured", `Inactivity duration threshold set to ${timeoutLimit} minutes`);
  }

  if (transactionPin !== undefined) {
    if (transactionPin.length === 4 && !isNaN(parseInt(transactionPin))) {
      db.user.transactionPin = transactionPin;
      logSecurityEvent(db, "Transaction PIN Modified", "User successfully modified their transaction execution PIN");
    } else {
      return res.status(400).json({ error: "PIN must be a 4-digit number." });
    }
  }

  writeDB(db);
  res.json({ success: true, securitySettings: db.user.securitySettings });
});

// 16. Update Budget Limits
app.post('/api/settings/budgets', (req, res) => {
  const { category, limit } = req.body;
  const db = readDB();

  const budgetIndex = db.budgets.findIndex(b => b.category === category);
  if (budgetIndex !== -1) {
    db.budgets[budgetIndex].limit = parseFloat(limit);
    logSecurityEvent(db, "Budget Target Updated", `Category "${category}" monthly limit adjusted to ₹${limit}`);
    writeDB(db);
    return res.json({ success: true, budgets: db.budgets });
  }

  res.status(404).json({ error: "Category not found." });
});

// 17. Submit Insurance Claim
app.post('/api/insurance/claim', (req, res) => {
  const { policyId, claimAmount, details } = req.body;
  const db = readDB();

  const policy = db.insurance.find(i => i.id === parseInt(policyId));
  if (!policy) {
    return res.status(404).json({ error: "Policy not found." });
  }

  logSecurityEvent(db, "Insurance Claim Lodged", `Claim of ₹${claimAmount} registered under policy ${policy.number} for: ${details}`);
  res.json({ success: true, claimId: "CLM-" + Math.floor(100000 + Math.random() * 900000) });
});

// 18. Apply for Loan
app.post('/api/loans/apply', (req, res) => {
  const { type, amount, tenureMonths } = req.body;
  const db = readDB();

  const loanAmount = parseFloat(amount);
  const tenure = parseInt(tenureMonths);

  if (!type || isNaN(loanAmount) || loanAmount < 50000 || isNaN(tenure) || tenure <= 0) {
    return res.status(400).json({ error: "Invalid loan details. Minimum amount is ₹50,000." });
  }

  const interestRate = type.includes('Car') ? 8.75 : (type.includes('Home') ? 7.25 : 10.5);
  // Simple EMI math
  const monthlyRate = (interestRate / 12) / 100;
  const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);

  const newLoan = {
    id: db.loans.length + 1,
    type,
    amount: loanAmount,
    remaining: loanAmount,
    nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    monthlyEMI: parseFloat(emi.toFixed(2)),
    tenureMonths: tenure,
    paidMonths: 0,
    rate: interestRate
  };

  db.loans.push(newLoan);

  // Credit Account savings with loan amount!
  db.accounts.savings.balance += loanAmount;
  db.accounts.savings.availableBalance += loanAmount;

  // Add Transaction
  db.transactions.unshift({
    id: "TXN" + Math.floor(10000 + Math.random() * 90000),
    date: new Date().toISOString(),
    merchant: `Zenith Loan Disbursal`,
    description: `Credited ${type} Principal`,
    amount: loanAmount,
    type: "credit",
    category: "Income",
    status: "Completed"
  });

  logSecurityEvent(db, "Loan Disbursed", `Approved and credited ${type} of ₹${loanAmount.toLocaleString('en-IN')} with EMI: ₹${newLoan.monthlyEMI.toLocaleString('en-IN')}`);

  writeDB(db);
  res.json({ success: true, balance: db.accounts.savings.balance, loans: db.loans });
});

// 19. Raise Support Ticket
app.post('/api/support/ticket', (req, res) => {
  const { subject, category, message } = req.body;
  const db = readDB();

  if (!subject || !category || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const newTicket = {
    id: "TKT-" + Math.floor(100 + Math.random() * 900),
    subject,
    category,
    status: "Open",
    date: new Date().toISOString().split('T')[0]
  };

  db.supportTickets.unshift(newTicket);
  logSecurityEvent(db, "Service Ticket Raised", `Opened support ticket ${newTicket.id}: "${subject}"`);

  writeDB(db);
  res.json({ success: true, tickets: db.supportTickets });
});

app.get('/api/support/tickets', (req, res) => {
  const db = readDB();
  res.json(db.supportTickets || []);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Zenith Secure Banking Backend running on port ${PORT}`);
});
