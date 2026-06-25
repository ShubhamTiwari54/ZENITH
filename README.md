# Zenith - Hyperpersonalized Secure Banking Application

Welcome to **Zenith**, a premium, secure, and hyperpersonalized banking dashboard designed to give users complete control over their financial wealth. 

Built using a modern **React + Vite** frontend and a stateful **Node.js + Express** backend, the Zenith application serves simulated mock banking operations backed by a local JSON file database (`db.json`) for data persistence.

---

## 📸 Project Interface Workflow

```
┌────────────────────────────────────────────────────────┐
│                   Zenith Bank Sidebar                  │
│  [Dashboard] [Accounts] [Payments] [Cards] [Loans] ... │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Vibrant Mesh Header                  │
│       Hello, Kavya 👋 (Personalized Greeting)          │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Main Widget Grid                     │
│  ┌───────────────────┐ ┌────────────────────────────┐  │
│  │ Total Balance Card│ │ Upcoming Bill Payments     │  │
│  │    ₹7,82,450.30   │ │ - Pay Card Bill (₹8,750)   │  │
│  │    (Eye Toggle)   │ │ - Pay Mobile Bill (₹589)   │  │
│  │   [Available...]  │ │    (Instant deductions)    │  │
│  └───────────────────┘ └────────────────────────────┘  │
│  ┌───────────────────┐ ┌────────────────────────────┐  │
│  │ Spending Donut    │ │ Credit Score Radial Gauge  │  │
│  │   - Food (25%)    │ │    [ 790 - Very Good ]     │  │
│  │   - Rent (24%)    │ │    (View Bureau Report)    │  │
│  └───────────────────┘ └────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, Vite, Vanilla CSS (harmonious HSL palettes, glassmorphism, responsive grid layouts).
- **Backend**: Node.js, Express.js, CORS, Body-Parser.
- **Database**: Local JSON storage (`db.json`) with auto-seeding. Handles balances, cards, loans, active policies, budgets, and security audit logs.
- **Proxy Routing**: Vite is configured to proxy all `/api/*` traffic automatically to the Express server running on port 5000.

---

## 🛡️ Security Simulator Features

1. **Two-Factor Authentication (2FA)**: Money transfers require double validation (Transaction PIN first, followed by a simulated SMS OTP) before releasing savings.
2. **Inactivity Session Lock**: The app monitors user activity. After 5 minutes of idle time, a 30-second warning countdown modal is shown. If unanswered, the session locks and encrypts, requiring the Transaction PIN to resume.
3. **Card CVV Reveal**: Full credit card numbers and CVVs are masked with asterisks. Clicking "Show Card Details" requires PIN authorization and starts a 15-second visual countdown before auto-masking.
4. **Security Audit Log**: Every database mutation (transfers, paid bills, limits adjusted, card frozen, profile updates) triggers a backend security log entry, viewable dynamically under the *Settings & Security* tab.

---

## 🔑 Demo Credentials

To test the security flows, use the following simulated credentials:
* **Transaction PIN**: `1234`
* **SMS OTP Code**: `123456`

---

## 🚀 Getting Started & Workflow

Follow these steps to launch and explore the project locally:

### 1. Install Dependencies
Run the command below in the project directory to install React, Vite, Express, and CORS:
```bash
npm install
```

### 2. Start the Backend API
Start the Express server on port 5000:
```bash
node server.cjs
```
*(On startup, it will seed `db.json` automatically if it doesn't already exist).*

### 3. Start the Frontend
Launch the Vite React application:
```bash
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your web browser.

---

## 📋 Interactive Verification Checklist

To experience the full functionality of the Zenith App, perform these tests:
- [ ] **Dashboard**: Click the eye icon on the Total Balance card. Verify that the balance masks to `₹ *,**,***.**` and unmasks on second click.
- [ ] **Pay a Bill**: Under *Upcoming Payments*, click **Pay** next to the Credit Card Bill (₹8,750). Authorize it, and verify that the savings balance declines and the bill is removed.
- [ ] **Send Money**: Navigate to the *Payments* page, fill out the form (e.g. transfer ₹5,000 to Priya), enter PIN `1234`, and enter OTP `123456`. Verify the receipt.
- [ ] **Adjust Limits**: Navigate to the *Cards* page, slide the *Online Transactions* range slider, and click **Save Custom Limits**.
- [ ] **Check Audit Log**: Navigate to the *Settings* page and scroll to the *Security Activity Log*. Verify that every transaction, card action, and limits change is logged in real-time.
