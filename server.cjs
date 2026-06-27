const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// Modular Backend Services
const aiService = require('./services/aiService.cjs');
const authService = require('./services/authService.cjs');
const notificationService = require('./services/notificationService.cjs');
const transactionService = require('./services/transactionService.cjs');
const recommendationEngine = require('./services/recommendationEngine.cjs');
const personalizationEngine = require('./services/personalizationEngine.cjs');
const analyticsEngine = require('./services/analyticsEngine.cjs');
const fraudDetection = require('./services/fraudDetection.cjs');


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
    const db = JSON.parse(data);
    
    // Database Migration / Backfill
    let changed = false;
    if (!db.user.accessibility) {
      db.user.accessibility = { language: 'en', fontSize: 'medium', theme: 'light', contrast: 'normal', voiceNavigation: false };
      changed = true;
    }
    if (!db.user.achievements) {
      db.user.achievements = { points: 450, streakDays: 14, badges: ['Savings Champion', 'Smart Spender', 'Budget Master'] };
      changed = true;
    }
    if (!db.user.trustedDevices) {
      db.user.trustedDevices = [
        { id: 'DEV-1', model: 'iPhone 15 Pro Max', dateAdded: '2026-03-12', active: true },
        { id: 'DEV-2', model: 'Chrome v120 / Windows 11 (This Device)', dateAdded: '2026-06-25', active: true }
      ];
      changed = true;
    }
    if (!db.user.biometricEnabled) {
      db.user.biometricEnabled = { face: false, fingerprint: false };
      changed = true;
    }
    if (!db.user.dashboardLayout) {
      db.user.dashboardLayout = ['spending', 'health', 'upcoming', 'achievements', 'recharge', 'insights'];
      db.user.dashboardPriority = 'default';
      changed = true;
    }
    if (!db.user.loginHistory) {
      db.user.loginHistory = [
        { date: '2026-06-25T23:02:35.000Z', device: 'Chrome v120 / Windows 11', ip: '127.0.0.1', status: 'Success' },
        { date: '2026-06-24T10:14:22.000Z', device: 'Chrome v120 / Windows 11', ip: '127.0.0.1', status: 'Success' },
        { date: '2026-06-22T19:05:00.000Z', device: 'iPhone 15 Pro Max', ip: '192.168.1.5', status: 'Success' }
      ];
      changed = true;
    }
    if (!db.user.fraudAlerts) {
      db.user.fraudAlerts = [
        { id: 'FRD-1', date: '2026-06-24', merchant: 'MockMerchant LLC', amount: 45000, status: 'Blocked', action: 'Declined' }
      ];
      changed = true;
    }
    if (!db.financialHealthScore.aiScore) {
      db.financialHealthScore.aiScore = 85;
      changed = true;
    }
    if (!db.dailyTips) {
      db.dailyTips = [
        "Consolidate subscriptions to save up to ₹1,500 monthly.",
        "Your credit utilization is 18%, which is excellent for your score.",
        "Set aside 20% of your salary within the first 5 days of credit.",
        "Fixed Deposit rates are currently peaked at 7.5% p.a. Invest now!"
      ];
      changed = true;
    }
    if (!db.contacts) {
      db.contacts = [
        { name: "Rahul Sharma", account: "9823 4112 5590", bank: "ICICI Bank", category: "Others" },
        { name: "Priya Patel", account: "7820 1199 4432", bank: "HDFC Bank", category: "Others" },
        { name: "Aarav Gupta", account: "4509 3321 0019", bank: "Axis Bank", category: "Shopping" }
      ];
      changed = true;
    }
    if (!db.recharges) {
      db.recharges = [
        { id: 1, title: "+91 98765 43210", type: "Mobile", provider: "Jio", amount: 589, details: "Saved Jio Connection" }
      ];
      changed = true;
    }
    if (!db.user.achievements.goals) {
      db.user.achievements.goals = [
        { id: "bill_pay", title: "Pay 4 Bills", description: "Pay utility bills from dashboard", target: 4, current: 2, points: 100, claimed: false },
        { id: "transfer", title: "Complete 5 Transfers", description: "Send money to contacts", target: 5, current: 3, points: 150, claimed: false },
        { id: "fd_open", title: "FD Safe Keeper", description: "Open a Fixed Deposit plan", target: 1, current: 0, points: 200, claimed: false }
      ];
      changed = true;
    }
    if (changed) {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
    }
    return db;
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
  authService.logSecurityEvent(db, action, details, ip);
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
      },
      accessibility: { language: 'en', fontSize: 'medium', theme: 'light', contrast: 'normal', voiceNavigation: false },
      achievements: { points: 450, streakDays: 14, badges: ['Savings Champion', 'Smart Spender', 'Budget Master'] },
      trustedDevices: [
        { id: 'DEV-1', model: 'iPhone 15 Pro Max', dateAdded: '2026-03-12', active: true },
        { id: 'DEV-2', model: 'Chrome v120 / Windows 11 (This Device)', dateAdded: '2026-06-25', active: true }
      ],
      biometricEnabled: { face: false, fingerprint: false },
      dashboardLayout: ['spending', 'health', 'upcoming', 'achievements', 'recharge', 'insights'],
      dashboardPriority: 'default',
      loginHistory: [
        { date: '2026-06-25T23:02:35.000Z', device: 'Chrome v120 / Windows 11', ip: '127.0.0.1', status: 'Success' },
        { date: '2026-06-24T10:14:22.000Z', device: 'Chrome v120 / Windows 11', ip: '127.0.0.1', status: 'Success' },
        { date: '2026-06-22T19:05:00.000Z', device: 'iPhone 15 Pro Max', ip: '192.168.1.5', status: 'Success' }
      ],
      fraudAlerts: [
        { id: 'FRD-1', date: '2026-06-24', merchant: 'MockMerchant LLC', amount: 45000, status: 'Blocked', action: 'Declined' }
      ]
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
      aiScore: 85,
      creditUtilization: "Good",
      paymentHistory: "100%",
      derogatoryMarks: "Excellent",
      ageOfCredit: "Good"
    },
    dailyTips: [
      "Consolidate subscriptions to save up to ₹1,500 monthly.",
      "Your credit utilization is 18%, which is excellent for your score.",
      "Set aside 20% of your salary within the first 5 days of credit.",
      "Fixed Deposit rates are currently peaked at 7.5% p.a. Invest now!"
    ],
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

  // 1. Calculate dynamic financial health score and update DB
  const healthMetrics = analyticsEngine.calculateFinancialHealth(db);
  db.financialHealthScore.score = healthMetrics.creditBureauScore;
  db.financialHealthScore.aiScore = healthMetrics.score;

  // 2. Compute dynamic layout prioritization
  const layout = personalizationEngine.getPersonalizedLayout(db);
  db.user.dashboardLayout = layout;

  // 3. Generate smart notifications queue
  const dynamicNotifs = notificationService.generateSmartNotifications(db);

  // 4. Generate personalized deals
  const dynamicOffers = recommendationEngine.getPersonalizedOffers(db);

  // Save changes back to DB
  writeDB(db);

  res.json({
    user: {
      name: db.user.name,
      avatar: db.user.avatar,
      email: db.user.email,
      securitySettings: db.user.securitySettings,
      dashboardLayout: layout,
      dashboardPriority: db.user.dashboardPriority,
      accessibility: db.user.accessibility,
      achievements: db.user.achievements
    },
    accounts: db.accounts,
    monthlyIncome: db.monthlyIncome,
    monthlyExpenses: db.monthlyExpenses,
    creditCard: {
      cardNumber: db.creditCard.cardNumber,
      expiry: db.creditCard.expiry,
      frozen: db.creditCard.frozen,
      availableLimit: db.creditCard.availableLimit,
      totalLimit: db.creditCard.totalLimit,
      limits: db.creditCard.limits,
      travelModeEnabled: db.creditCard.travelModeEnabled || false,
      internationalEnabled: db.creditCard.internationalEnabled || false,
      rewardsEarned: db.creditCard.rewardsEarned || 1250
    },
    spendingBreakdown: db.spendingBreakdown,
    financialHealthScore: db.financialHealthScore,
    upcomingPayments: db.upcomingPayments.filter(p => !p.paid),
    offers: dynamicOffers,
    notifications: dynamicNotifs
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

  // Increment achievements transfer goal
  if (db.user?.achievements?.goals) {
    const goal = db.user.achievements.goals.find(g => g.id === 'transfer');
    if (goal && goal.current < goal.target) {
      goal.current += 1;
    }
  }

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

  // Increment achievements bill payment goal
  if (db.user?.achievements?.goals) {
    const goal = db.user.achievements.goals.find(g => g.id === 'bill_pay');
    if (goal && goal.current < goal.target) {
      goal.current += 1;
    }
  }

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

// 7b. Toggle Travel Mode
app.post('/api/cards/toggle-travel', (req, res) => {
  const db = readDB();
  db.creditCard.travelModeEnabled = !db.creditCard.travelModeEnabled;
  const status = db.creditCard.travelModeEnabled ? "Enabled" : "Disabled";
  logSecurityEvent(db, `Travel Mode ${status}`, `Credit Card travel mode was ${status.toLowerCase()}`);
  writeDB(db);
  res.json({ success: true, travelModeEnabled: db.creditCard.travelModeEnabled });
});

// 7c. Toggle International Payments
app.post('/api/cards/toggle-international', (req, res) => {
  const db = readDB();
  db.creditCard.internationalEnabled = !db.creditCard.internationalEnabled;
  const status = db.creditCard.internationalEnabled ? "Enabled" : "Disabled";
  logSecurityEvent(db, `International Payments ${status}`, `Credit Card international transactions were ${status.toLowerCase()}`);
  writeDB(db);
  res.json({ success: true, internationalEnabled: db.creditCard.internationalEnabled });
});

// 7d. Replace Lost Card
app.post('/api/cards/replace', (req, res) => {
  const db = readDB();
  db.creditCard.frozen = true;
  logSecurityEvent(db, `Card Replacement Ordered`, `Credit Card ending 4567 reported lost. Order replacement card dispatched.`);
  writeDB(db);
  res.json({ success: true, message: "Replacement card successfully ordered. Current card has been locked." });
});

// 7e. Report Fraud
app.post('/api/cards/report-fraud', (req, res) => {
  const { merchant, amount } = req.body;
  const db = readDB();
  const alert = fraudDetection.reportFraudAlert(db, merchant, amount);
  writeDB(db);
  res.json({ success: true, alert });
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
  const { symbol, shares, currentPrice, action } = req.body; // action: 'buy' or 'sell'
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

  // Increment achievements fd_open goal
  if (db.user?.achievements?.goals) {
    const goal = db.user.achievements.goals.find(g => g.id === 'fd_open');
    if (goal && goal.current < goal.target) {
      goal.current += 1;
    }
  }

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
    creditCard: db.creditCard,
    budgets: db.budgets,
    loans: db.loans,
    insurance: db.insurance,
    investments: db.investments,
    transactions: db.transactions
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

// 19b. Payee Contacts management
app.get('/api/contacts', (req, res) => {
  const db = readDB();
  res.json(db.contacts || []);
});

app.post('/api/contacts', (req, res) => {
  const { name, account, bank, category } = req.body;
  if (!name || !account || !bank) {
    return res.status(400).json({ error: "Missing required contact details." });
  }
  const db = readDB();
  if (!db.contacts) db.contacts = [];
  
  // Prevent duplicate
  const exists = db.contacts.some(c => c.account === account);
  if (!exists) {
    db.contacts.push({ name, account, bank, category: category || 'Others' });
    writeDB(db);
  }
  res.json({ success: true, contacts: db.contacts });
});

// 19c. Utilities Biller Recharges management
app.get('/api/recharges', (req, res) => {
  const db = readDB();
  res.json(db.recharges || []);
});

app.post('/api/recharges', (req, res) => {
  const { title, type, provider, amount, details } = req.body;
  if (!title || !type || !provider || !amount) {
    return res.status(400).json({ error: "Missing required recharge billing details." });
  }
  const db = readDB();
  if (!db.recharges) db.recharges = [];
  const newRecharge = {
    id: db.recharges.length + 1,
    title,
    type,
    provider,
    amount: parseFloat(amount),
    details: details || `Saved ${type} Connection`
  };
  db.recharges.push(newRecharge);
  writeDB(db);
  res.json({ success: true, recharges: db.recharges });
});

// 19d. Claim gamified goals
app.post('/api/achievements/claim-goal', (req, res) => {
  const { goalId } = req.body;
  const db = readDB();
  const goal = db.user.achievements.goals?.find(g => g.id === goalId);
  if (!goal) return res.status(404).json({ error: "Goal not found." });
  if (goal.claimed) return res.status(400).json({ error: "Goal points already claimed." });
  if (goal.current < goal.target) return res.status(400).json({ error: "Goal not completed yet." });

  goal.claimed = true;
  db.user.achievements.points += goal.points;
  writeDB(db);
  res.json({ success: true, achievements: db.user.achievements });
});

// 19e. Redeem Points for Vouchers
app.post('/api/achievements/redeem', (req, res) => {
  const { voucherCost, voucherName } = req.body;
  const db = readDB();
  const cost = parseInt(voucherCost);
  if (db.user.achievements.points < cost) {
    return res.status(400).json({ error: "Insufficient points to redeem this voucher." });
  }
  db.user.achievements.points -= cost;
  logSecurityEvent(db, "Voucher Redeemed", `Redeemed ${cost} points for ${voucherName}`);
  writeDB(db);
  res.json({ success: true, achievements: db.user.achievements });
});

// ==========================================
// AI-Driven Personalization & NLU Routes
// ==========================================

// 20. Update Accessibility Preferences
app.post('/api/settings/accessibility', (req, res) => {
  const { language, fontSize, theme, contrast, voiceNavigation } = req.body;
  const db = readDB();

  if (language) db.user.accessibility.language = language;
  if (fontSize) db.user.accessibility.fontSize = fontSize;
  if (theme) db.user.accessibility.theme = theme;
  if (contrast) db.user.accessibility.contrast = contrast;
  if (voiceNavigation !== undefined) db.user.accessibility.voiceNavigation = voiceNavigation;

  logSecurityEvent(db, "Accessibility Configured", `Updated accessibility options: language=${language || db.user.accessibility.language}, fontSize=${fontSize || db.user.accessibility.fontSize}`);
  writeDB(db);
  res.json({ success: true, accessibility: db.user.accessibility });
});

// 21. Update Biometric Enabled settings
app.post('/api/settings/biometrics', (req, res) => {
  const { face, fingerprint } = req.body;
  const db = readDB();

  if (face !== undefined) db.user.biometricEnabled.face = face;
  if (fingerprint !== undefined) db.user.biometricEnabled.fingerprint = fingerprint;

  logSecurityEvent(db, "Biometrics Configured", `Biometric settings adjusted: face=${db.user.biometricEnabled.face}, fingerprint=${db.user.biometricEnabled.fingerprint}`);
  writeDB(db);
  res.json({ success: true, biometricEnabled: db.user.biometricEnabled });
});

// 22. Get AI Insights
app.get('/api/ai/insights', (req, res) => {
  const db = readDB();
  const totalExpenses = db.monthlyExpenses;
  
  res.json({
    monthlySummary: `In June, you spent ${totalExpenses.toLocaleString('en-IN')}. Food & Housing comprised the majority of your expenses.`,
    recommendations: [
      { text: "You could save ₹1,500 by reducing unused subscriptions.", category: "Bills & Utilities" },
      { text: "You spent ₹3,200 more on food & dining this month compared to your 3-month average.", category: "Food & Dining" },
      { text: "Your electricity bill is 12% higher due to summer AC cooling usage.", category: "Bills & Utilities" }
    ],
    financialHealthScore: db.financialHealthScore,
    dailyTips: db.dailyTips
  });
});

// 23. Get Digi Statement Monthly Summary
app.get('/api/ai/statement', (req, res) => {
  const db = readDB();
  const statement = transactionService.compileDigiStatement(db);

  res.json({
    summary: `In June, you spent INR ${statement.spent.toLocaleString('en-IN')}.`,
    breakdown: [
      `${statement.largestExpense} accounted for the highest share of expenses.`,
      `You saved INR ${statement.saved.toLocaleString('en-IN')} this month.`,
      `Your most-used payment channel was ${statement.mostUsedPayment}.`
    ],
    recommendations: statement.aiRecommendations,
    savingsTrend: statement.savingsTrend
  });
});

// 24. Smart Natural Language Search on Transactions
app.post('/api/ai/search-transactions', (req, res) => {
  const { query } = req.body;
  const db = readDB();
  res.json(transactionService.searchTransactions(db, query));
});

// 25. Claim Streaks & Gamification Points
app.post('/api/ai/achievements/claim', (req, res) => {
  const db = readDB();
  db.user.achievements.points += 50;
  db.user.achievements.streakDays += 1;
  
  if (!db.user.achievements.badges.includes('Streak Master') && db.user.achievements.streakDays >= 15) {
    db.user.achievements.badges.push('Streak Master');
  }

  writeDB(db);
  res.json({ success: true, achievements: db.user.achievements });
});

// ==========================================
// Reusable Gemini API Service & NLU Routing
// ==========================================

// 26. Intelligent AI Assistant Query Handler (Live Gemini API Integration)
app.post('/api/ai/query', async (req, res) => {
  const { prompt, history, context } = req.body;
  const db = readDB();
  
  if (!prompt) {
    return res.status(400).json({ error: "Empty prompt" });
  }

  const savingsBalance = db.accounts.savings.availableBalance;
  const currentBalance = db.accounts.current.availableBalance;
  const isCardFrozen = db.creditCard.frozen;
  const activePage = context?.currentPage || 'dashboard';

  // Construct contacts listing dynamically from DB
  const contactsList = db.contacts || [];
  const contactsStr = contactsList.map((c, i) => `  ${i+1}. Name: "${c.name}", Account: "${c.account}", Bank: "${c.bank}"`).join('\n');

  // Construct context-rich system instruction
  const systemInstruction = `You are Zenith AI, a secure and personalized AI Banking Assistant for Zenith Bank.
You help users with their banking needs by analyzing their query and returning a structured JSON response. You act like a proactive banking officer rather than a basic bot.

Here is the database context of the current user:
- User Profile: { name: "${db.user.name}", email: "${db.user.email}", phone: "${db.user.phone}", address: "${db.user.address}" }
- Savings Account balance: Ledger balance is ₹${db.accounts.savings.balance.toLocaleString('en-IN')}, and Available balance is ₹${savingsBalance.toLocaleString('en-IN')}. ALWAYS distinguish both if requested.
- Current Account balance: Ledger balance is ₹${db.accounts.current.balance.toLocaleString('en-IN')}, and Available balance is ₹${currentBalance.toLocaleString('en-IN')}.
- Credit Card: ending in 4567, frozen: ${isCardFrozen}, available limit: ₹${db.creditCard.availableLimit.toLocaleString('en-IN')}, total limit: ₹${db.creditCard.totalLimit.toLocaleString('en-IN')}
- Saved Payee Contacts for Transfer:
${contactsStr}
- Active viewport page: "${activePage}"
- Selected App Language: "${db.user.accessibility?.language || 'en'}"
- Selected App Font Size: "${db.user.accessibility?.fontSize || 'medium'}"
- Selected App Theme: "${db.user.accessibility?.theme || 'light'}"

You must respond in a valid JSON format with the following keys:
1. "responseText": String. A natural language response. Keep it friendly and concise. If the user asks in Hindi/Tamil/Marathi/etc., reply in that language.
2. "action": String. The action to trigger. Choose from:
   - "speak-balance" (if user asks for balance)
   - "confirm-freeze-card" (if user wants to block/freeze card/account)
   - "confirm-transfer-intent" (if user wants to send/pay money to a contact)
   - "confirm-recharge-intent" (if user wants to recharge mobile/electricity/utility bills)
   - "confirm-trade-stock" (if user wants to buy/sell shares, e.g., "buy 5 shares of RELIANCE")
   - "confirm-apply-loan" (if user wants to apply for a loan)
   - "trigger-biometric-verification" (if user wants to enable/disable Face ID or fingerprint login)
   - "update-budget-limit" (if user wants to adjust a category budget limit)
   - "create-support-ticket" (if user wants to submit/raise a ticket)
   - "file-insurance-claim" (if user wants to submit/file an insurance claim)
   - "calculate-finance" (if user asks to compute EMI or interest rate calculations)
   - "navigate-security-logs" (if user asks to show or view security history / when they last logged in)
   - "download-statement" (if user wants to download statement/pdf)
   - "navigate-dashboard-analytics" (if user wants to see expenses/analytics/charts)
   - "accessibility-update" (if user wants to change language, font size, theme, e.g. dark mode)
   - "toggle-travel-mode" (if user wants to toggle travel mode setting)
   - "toggle-international-mode" (if user wants to toggle international card transactions)
   - "report-card-fraud" (if user reports card fraud or unauthorized transaction)
   - "cibil-inquiry" (if user asks for credit score/CIBIL check)
   - "financial-health-inquiry" (if user asks for health score or improvements tips)
   - "none" (for general talk or when payee is not found)
3. "actionData": Object. Details for the action:
   - For "confirm-transfer-intent": { amount: Number, recipientName: String, recipientAccount: String, bank: String }. CRITICAL: If the recipient name matches one of the saved contacts, populate these fields. If not found, do NOT use this action; set action to "none", suggest buttons like ["Add Contact [Name]", "Cancel"] and explain.
   - For "confirm-trade-stock": { symbol: "ZENITH"|"TCS"|"RELIANCE", shares: Number, actionType: "buy"|"sell", currentPrice: Number } (resolve currentPrice: ZENITH=185, TCS=3450, RELIANCE=2450)
   - For "confirm-apply-loan": { type: "Personal Loan"|"Car Loan"|"Home Loan", amount: Number, tenureMonths: Number }
   - For "trigger-biometric-verification": { type: "face"|"fingerprint" }
   - For "update-budget-limit": { category: "Food & Dining"|"Housing"|"Transport"|"Shopping"|"Bills & Utilities"|"Others", limit: Number }
   - For "create-support-ticket": { subject: String, category: "Loans"|"Accounts"|"Cards"|"Investments"|"Others", message: String }
   - For "file-insurance-claim": { policyId: Number, claimAmount: Number, details: String }
   - For "calculate-finance": { formula: "emi"|"interest", principal: Number, rate: Number, term: Number, resultText: String }
   - For "confirm-recharge-intent": { mobileNumber: String, amount: Number, provider: String }
   - For "accessibility-update": { theme: "dark"|"light", fontSize: "large"|"medium"|"normal", language: "hi"|"ta"|"te"|"bn"|"mr"|"gu"|"en" }
   - For "report-card-fraud": { merchant: String, amount: Number }
4. "buttons": Array of Strings. Suggest next logical actions/choices for the user (e.g. ["Confirm Transfer", "Cancel"] or ["Add Contact Asmit", "Cancel"] or ["Toggle Travel Mode", "Cancel"]).

Important: Output ONLY the raw JSON string. Do not wrap in markdown code blocks like \`\`\`json.`;

  // Format message history
  const contents = [];
  if (Array.isArray(history)) {
    history.forEach(item => {
      if (item.text && item.sender) {
        contents.push({
          role: item.sender === 'user' ? 'user' : 'model',
          parts: [{ text: item.text }]
        });
      }
    });
  }
  // Append current prompt
  contents.push({
    role: 'user',
    parts: [{ text: prompt }]
  });

  try {
    const rawResponse = await aiService.askGemini(contents, systemInstruction);
    const parsed = JSON.parse(rawResponse);
    return res.json(parsed);
  } catch (err) {
    console.warn("Gemini API error, running local NLU fallback:", err.message);

    // Local NLU Fallback
    const query = prompt.toLowerCase().trim();
    let responseText = "";
    let action = "none";
    let actionData = {};
    let buttons = [];

    if (query.includes('lost my card') || query.includes('lost card') || query.includes('lock my credit card') || query.includes('freeze card') || query.includes('block my card')) {
      if (db.creditCard.frozen) {
        responseText = "Your credit card ending in 4567 is already frozen. Would you like to request a replacement card or reset your transaction PIN?";
        buttons = ["Order Replacement", "Reset Card PIN"];
        action = "card-locked-options";
      } else {
        responseText = "I can help freeze your credit card ending in 4567. Please confirm if you wish to block it immediately.";
        buttons = ["Confirm Block", "Cancel"];
        action = "confirm-freeze-card";
      }
    } else if (query.includes('travel mode') || query.includes('traveling')) {
      responseText = `I can update your travel settings on card ending in 4567. Currently travel mode is ${db.creditCard.travelModeEnabled ? 'Enabled' : 'Disabled'}. Confirm to toggle it.`;
      buttons = ["Toggle Travel Mode", "Cancel"];
      action = "toggle-travel-mode";
    } else if (query.includes('international') || query.includes('cross border')) {
      responseText = `I can adjust international access settings on card ending in 4567. Currently it is ${db.creditCard.internationalEnabled ? 'Enabled' : 'Disabled'}. Confirm to toggle.`;
      buttons = ["Toggle International Mode", "Cancel"];
      action = "toggle-international-mode";
    } else if (query.includes('fraud') || query.includes('unauthorized') || query.includes('alert')) {
      responseText = "If you noticed unauthorized charges, I can flag them for investigation and lock your credit card immediately for security.";
      buttons = ["Report Fraud", "Cancel"];
      action = "report-card-fraud";
      actionData = { merchant: "Unrecognized Charge", amount: 4500 };
    } else if (query.includes('cibil') || query.includes('credit score') || query.includes('credit report')) {
      responseText = `Your credit score rating (CIBIL) is ${db.financialHealthScore.score} (Excellent). You are eligible for zero-processing fees on loans.`;
      action = "cibil-inquiry";
    } else if (query.includes('financial health') || query.includes('health score') || query.includes('health rating')) {
      responseText = `Your overall Zenith Financial Health Score is ${db.financialHealthScore.aiScore || 85}/100. Let's look at the details.`;
      action = "financial-health-inquiry";
    } else if (query.includes('balance') || query.includes('how much money') || query.includes('my funds')) {
      const savings = db.accounts.savings.availableBalance;
      const current = db.accounts.current.availableBalance;
      responseText = `Your Savings Account balance is ₹${savings.toLocaleString('en-IN')}, and your Current Account balance is ₹${current.toLocaleString('en-IN')}.`;
      action = "speak-balance";
      actionData = { savings, current };
    } else if (query.includes('send') || query.includes('transfer') || query.includes('pay')) {
      const amountMatch = query.match(/(?:rs\.?|₹)?\s*(\d+(?:\.\d{1,2})?)/i);
      let amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
      
      let contact = "Rahul Sharma";
      if (cleanText(query).includes('priya')) {
        contact = "Priya Patel";
      } else if (cleanText(query).includes('aarav')) {
        contact = "Aarav Gupta";
      }

      if (amount <= 0) {
        responseText = "I can help you transfer money to your saved contacts (Rahul, Priya, Aarav). How much would you like to send?";
        action = "ask-amount";
      } else {
        responseText = `I found ${contact} in your recent UPI contacts. Would you like to transfer ₹${amount.toLocaleString('en-IN')}?`;
        buttons = ["Confirm Transfer", "Cancel"];
        action = "confirm-transfer-intent";
        actionData = {
          amount,
          recipientName: contact,
          recipientAccount: contact === "Rahul Sharma" ? "9823 4112 5590" : (contact === "Priya Patel" ? "7820 1199 4432" : "4509 3321 0019"),
          bank: contact === "Rahul Sharma" ? "ICICI Bank" : (contact === "Priya Patel" ? "HDFC Bank" : "Axis Bank")
        };
      }
    } else if (cleanText(query).includes('recharge') || cleanText(query).includes('jio') || cleanText(query).includes('airtel')) {
      const mobileNo = "+91 98765 43210";
      responseText = `Your saved Jio mobile connection is ${mobileNo}. Would you like to perform a recharge for the ₹589 popular plan?`;
      buttons = ["Confirm Recharge", "Cancel"];
      action = "confirm-recharge-intent";
      actionData = { mobileNumber: mobileNo, amount: 589, provider: "Jio" };
    } else if (query.includes('download') || query.includes('statement') || query.includes('pdf')) {
      responseText = "Certainly. I have generated your Zenith digitized bank statement. Triggering the PDF file compilation now.";
      action = "download-statement";
    } else if (query.includes('expense') || query.includes('spend') || query.includes('analytic') || query.includes('budget') || query.includes('chart')) {
      responseText = "Let me take you to your dashboard analytics page. I've highlighted the categories donut chart.";
      action = "navigate-dashboard-analytics";
    } else if (query.includes('dark mode') || query.includes('night mode')) {
      db.user.accessibility.theme = 'dark';
      writeDB(db);
      responseText = "Dark theme activated successfully. Let me know if you need high contrast adjustments.";
      action = "accessibility-update";
      actionData = { theme: 'dark' };
    } else if (query.includes('light mode') || query.includes('day mode')) {
      db.user.accessibility.theme = 'light';
      writeDB(db);
      responseText = "Light theme activated successfully.";
      action = "accessibility-update";
      actionData = { theme: 'light' };
    } else if (query.includes('large font') || query.includes('big font') || query.includes('text large')) {
      db.user.accessibility.fontSize = 'large';
      writeDB(db);
      responseText = "Font scaling set to large.";
      action = "accessibility-update";
      actionData = { fontSize: 'large' };
    } else if (query.includes('hindi') || query.includes('हिन्दी')) {
      db.user.accessibility.language = 'hi';
      writeDB(db);
      responseText = "प्रणाली की भाषा हिंदी में बदल दी गई है।";
      action = "accessibility-update";
      actionData = { language: 'hi' };
    } else {
      responseText = "I can help you navigate Zenith Bank, transfer money, freeze cards, view spending insights, or adjust accessibility settings. Try saying 'What is my balance?' or 'Lock my card'.";
    }

    res.json({
      responseText,
      action,
      actionData,
      buttons
    });
  }
});

// Helper string sanitizer
function cleanText(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Start Server
app.listen(PORT, () => {
  console.log(`Zenith Secure Banking Backend running on port ${PORT}`);
});
