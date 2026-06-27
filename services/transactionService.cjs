// Transaction ledger and statement analysis service

/**
 * Parses queries for transaction records
 * @param {object} db database instance
 * @param {string} query search filter query
 * @returns {Array} list of matching transactions
 */
function searchTransactions(db, query) {
  let results = db.transactions || [];
  if (!query) return [];

  const cleanQuery = query.toLowerCase().trim();

  // Search above/below threshold
  const aboveMatch = cleanQuery.match(/above\s*(?:rs\.?|₹)?\s*(\d+)/i);
  const belowMatch = cleanQuery.match(/below\s*(?:rs\.?|₹)?\s*(\d+)/i);
  
  if (aboveMatch) {
    const threshold = parseFloat(aboveMatch[1]);
    results = results.filter(t => t.amount >= threshold);
  } else if (belowMatch) {
    const threshold = parseFloat(belowMatch[1]);
    results = results.filter(t => t.amount <= threshold);
  }

  // Merchant matches
  if (cleanQuery.includes('amazon')) {
    results = results.filter(t => t.merchant.toLowerCase().includes('amazon'));
  }
  if (cleanQuery.includes('zomato')) {
    results = results.filter(t => t.merchant.toLowerCase().includes('zomato'));
  }
  if (cleanQuery.includes('uber')) {
    results = results.filter(t => t.merchant.toLowerCase().includes('uber'));
  }
  if (cleanQuery.includes('rent') || cleanQuery.includes('landlord')) {
    results = results.filter(t => t.description.toLowerCase().includes('rent') || t.merchant.toLowerCase().includes('landlord'));
  }
  if (cleanQuery.includes('swiggy') || cleanQuery.includes('groceries')) {
    results = results.filter(t => t.merchant.toLowerCase().includes('swiggy') || t.description.toLowerCase().includes('groceries'));
  }
  if (cleanQuery.includes('food') || cleanQuery.includes('dining')) {
    results = results.filter(t => t.category.toLowerCase().includes('food'));
  }
  if (cleanQuery.includes('shopping')) {
    results = results.filter(t => t.category.toLowerCase().includes('shopping'));
  }

  // Payment channel matches
  if (cleanQuery.includes('upi') || cleanQuery.includes('rahul') || cleanQuery.includes('priya')) {
    results = results.filter(t => 
      t.description.toLowerCase().includes('upi') || 
      t.description.toLowerCase().includes('transfer') || 
      t.merchant.toLowerCase().includes('rahul') || 
      t.merchant.toLowerCase().includes('priya')
    );
  }

  if (cleanQuery.includes('failed') || cleanQuery.includes('declined')) {
    results = results.filter(t => t.status === 'Failed' || t.status === 'Declined');
  }

  if (cleanQuery.includes('salary') || cleanQuery.includes('credit') || cleanQuery.includes('income')) {
    results = results.filter(t => t.type === 'credit');
  } else if (cleanQuery.includes('debit') || cleanQuery.includes('spent') || cleanQuery.includes('spend')) {
    results = results.filter(t => t.type === 'debit');
  }

  // Month filters
  if (cleanQuery.includes('june') || cleanQuery.includes('this month')) {
    results = results.filter(t => t.date.includes('-06-') || t.date.includes('/06/'));
  } else if (cleanQuery.includes('may') || cleanQuery.includes('last month')) {
    results = results.filter(t => t.date.includes('-05-') || t.date.includes('/05/'));
  }

  return results.slice(0, 10);
}

/**
 * Compiles AI Digi Statement summary for a user
 * @param {object} db database instance
 * @returns {object} statement summary model
 */
function compileDigiStatement(db) {
  const txs = db.transactions || [];
  
  // Totals
  const income = txs
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
  const spent = txs
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);
  const saved = Math.max(0, income - spent);

  // Group by category
  const categories = {};
  txs.filter(t => t.type === 'debit').forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + t.amount;
  });
  
  let largestCategory = "None";
  let maxSpentVal = 0;
  for (const cat in categories) {
    if (categories[cat] > maxSpentVal) {
      maxSpentVal = categories[cat];
      largestCategory = cat;
    }
  }

  // Count Payment Channels (UPI vs cards vs bank transfers)
  let upiCount = 0;
  let cardCount = 0;
  let otherCount = 0;
  txs.forEach(t => {
    const desc = t.description.toLowerCase();
    if (desc.includes('upi') || desc.includes('transfer to')) {
      upiCount++;
    } else if (desc.includes('card') || desc.includes('subscription') || t.merchant.includes('Zomato') || t.merchant.includes('Amazon')) {
      cardCount++;
    } else {
      otherCount++;
    }
  });

  let primaryPayment = "UPI";
  if (cardCount > upiCount && cardCount > otherCount) {
    primaryPayment = "Zenith Credit Card";
  } else if (otherCount > upiCount && otherCount > cardCount) {
    primaryPayment = "Net Banking Transfer";
  }

  const savingsTrend = saved > 0.15 * income ? "Positive" : (saved > 0 ? "Neutral" : "Negative");

  // Custom recommendations based on spending
  const recommendations = [];
  if (categories['Food & Dining'] && categories['Food & Dining'] > 10000) {
    recommendations.push("Reduce restaurant and Zomato spending by 15% to save around ₹1,800.");
  }
  if (categories['Shopping'] && categories['Shopping'] > 8000) {
    recommendations.push("Zenith AI detected high e-commerce retail shopping. Enable a daily limit threshold.");
  }
  if (savingsTrend === 'Negative') {
    recommendations.push("Your expenses exceeded your monthly credit income. Consolidate outstanding card dues.");
  } else {
    recommendations.push("Routing ₹5,000 to fixed deposits can earn 7.5% p.a. guaranteed interest.");
  }

  return {
    income: income || db.monthlyIncome,
    spent: spent || db.monthlyExpenses,
    saved: saved,
    largestExpense: largestCategory,
    mostUsedPayment: primaryPayment,
    savingsTrend: savingsTrend,
    aiRecommendations: recommendations
  };
}

module.exports = {
  searchTransactions,
  compileDigiStatement
};
