// Product Recommendations and Financial Opportunities Engine

/**
 * Generates personalized product recommendations based on user financial criteria
 * @param {object} db database instance
 * @returns {Array} list of customized offers
 */
function getPersonalizedOffers(db) {
  const savings = db.accounts.savings.availableBalance;
  const creditScore = db.financialHealthScore?.score || 790;

  const defaultOffers = [...(db.offers || [])];
  const personalized = [];

  // 1. High Savings User: Investment Opportunity
  if (savings > 200000) {
    personalized.push({
      id: 101,
      title: "Zenith Wealth Manager FD",
      subtitle: "High savings detected. Secure a locked 7.8% p.a. Fixed Deposit.",
      link: "Invest Now",
      badge: "Investments",
      code: "ZENINVEST78",
      reward: "Earn up to ₹15,400 returns"
    });
  }

  // 2. High Credit Score: Personal Loan Pre-approval
  if (creditScore >= 770) {
    personalized.push({
      id: 102,
      title: "Pre-approved Elite Personal Loan",
      subtitle: "Your CIBIL Score is Excellent. Zero processing fees, instant credit.",
      link: "Apply Now",
      badge: "Loans",
      code: "ELITELOAN",
      reward: "Unlocks credit line up to ₹5L"
    });
  }

  // 3. High Card Usage or Travel Intent
  if (db.creditCard && !db.creditCard.frozen) {
    personalized.push({
      id: 103,
      title: "Zenith Card Cashback Sprint",
      subtitle: "Earn 5% flat cashback on fuel top-ups at Shell stations this week.",
      link: "View Rewards",
      badge: "Cards",
      code: "CASHBACK5",
      reward: "Up to ₹500 cashback"
    });
  }

  // Merge, prioritizing personalized offers
  const finalOffers = [...personalized, ...defaultOffers];
  // Remove duplicates by title
  const seen = new Set();
  return finalOffers.filter(el => {
    const duplicate = seen.has(el.title);
    seen.add(el.title);
    return !duplicate;
  }).slice(0, 3);
}

/**
 * Checks if the user is eligible for a loan
 * @param {object} db database instance
 * @param {string} loanType loan type
 * @returns {object} eligibility results
 */
function checkLoanEligibility(db, loanType) {
  const score = db.financialHealthScore?.score || 790;
  const balance = db.accounts.savings.availableBalance;
  
  let eligible = false;
  let maxAmount = 0;
  let rate = 10.5;

  if (score >= 750) {
    eligible = true;
    maxAmount = balance * 2.5; // Eligible for 2.5x balance
    rate = loanType.includes('Car') ? 8.75 : (loanType.includes('Home') ? 7.25 : 9.5);
  } else if (score >= 650) {
    eligible = true;
    maxAmount = balance * 1.2;
    rate = loanType.includes('Car') ? 10.25 : (loanType.includes('Home') ? 8.5 : 12.0);
  }

  return {
    eligible,
    maxAmount: Math.round(maxAmount),
    interestRate: rate,
    cibilRequirement: "Passed",
    tips: eligible ? "Maintain low card utilization to retain premium interest rates." : "Improve payment streaks to elevate CIBIL rating."
  };
}

module.exports = {
  getPersonalizedOffers,
  checkLoanEligibility
};
