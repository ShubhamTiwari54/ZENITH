// Spending Breakdown Analytics & Financial Health Engine

/**
 * Calculates Financial Health Score (0-100) and actionable improvement guidelines
 * @param {object} db database instance
 * @returns {object} score metrics and insights
 */
function calculateFinancialHealth(db) {
  const income = db.monthlyIncome || 195000;
  const expenses = db.monthlyExpenses || 76850;
  const creditLimitUsed = db.creditCard ? (db.creditCard.totalLimit - db.creditCard.availableLimit) : 0;
  const creditLimitTotal = db.creditCard ? db.creditCard.totalLimit : 200000;
  
  // 1. Savings Ratio Component (max 30 points)
  // Optimal savings is 25% or more of income
  const savingsRatio = Math.max(0, (income - expenses) / income);
  const savingsScore = Math.min(30, Math.round(savingsRatio * 120));

  // 2. Budget Adherence Component (max 25 points)
  // Check how many budgets are exceeded
  const budgets = db.budgets || [];
  let budgetOverruns = 0;
  budgets.forEach(b => {
    if (b.spent > b.limit) budgetOverruns++;
  });
  const budgetScore = Math.max(0, 25 - (budgetOverruns * 8));

  // 3. Credit Card Utilization Component (max 20 points)
  // Under 30% utilization is ideal
  const ccUtilRatio = creditLimitTotal > 0 ? (creditLimitUsed / creditLimitTotal) : 0;
  let creditScore = 20;
  if (ccUtilRatio > 0.7) creditScore = 5;
  else if (ccUtilRatio > 0.5) creditScore = 10;
  else if (ccUtilRatio > 0.3) creditScore = 15;

  // 4. Bill Payment Punctuality Component (max 15 points)
  // Deduct points for unpaid past-due bills
  const bills = db.upcomingPayments || [];
  const unpaidCount = bills.filter(b => !b.paid && b.dueDays < 0).length;
  const billScore = Math.max(0, 15 - (unpaidCount * 5));

  // 5. Debt Ratio Component (max 10 points)
  // Active loans remaining principal vs original amount
  const loans = db.loans || [];
  let debtRatioSum = 0;
  loans.forEach(l => {
    debtRatioSum += (l.remaining / l.amount);
  });
  const avgDebtRatio = loans.length > 0 ? (debtRatioSum / loans.length) : 0;
  const debtScore = Math.max(0, 10 - Math.round(avgDebtRatio * 10));

  // Cumulative Score
  const totalScore = savingsScore + budgetScore + creditScore + billScore + debtScore;

  // Compile recommendations
  const tips = [];
  if (savingsRatio < 0.2) {
    tips.push("Your savings rate is below the recommended 20%. Try cutting discretionary dining spending.");
  }
  if (budgetOverruns > 0) {
    tips.push(`You exceeded limits in ${budgetOverruns} categories. Reallocate caps in your Budget Planner.`);
  }
  if (ccUtilRatio > 0.35) {
    tips.push("Credit utilization is high. Keeping utilization below 30% improves credit score ratings.");
  }
  if (unpaidCount > 0) {
    tips.push("You have outstanding past-due utility bills. Settle them to prevent penalties.");
  }
  if (loans.length > 0 && avgDebtRatio > 0.6) {
    tips.push("Consider paying lump-sum repayments toward your highest-interest loans to lower debt loads.");
  }

  if (tips.length === 0) {
    tips.push("Excellent financial management! Allocate surplus funds to long-term stock indices.");
  }

  // Map to range 300 - 850 (credit score metric)
  const creditScoreRating = Math.round(300 + (totalScore / 100) * 550);

  return {
    score: totalScore, // 0-100 scale
    creditBureauScore: creditScoreRating,
    savingsRating: savingsScore >= 20 ? "Strong" : "Average",
    budgetRating: budgetScore >= 20 ? "Compliant" : "Needs Review",
    tips: tips,
    utilizationPercent: Math.round(ccUtilRatio * 100)
  };
}

module.exports = {
  calculateFinancialHealth
};
