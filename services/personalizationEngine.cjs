// UI Personalization and Dashboard Prioritization Engine

/**
 * Calculates the personalized dashboard widget layout order based on transaction history and alert urgency
 * @param {object} db database instance
 * @returns {Array} layout widget list
 */
function getPersonalizedLayout(db) {
  const completeLayout = ['insights', 'spending', 'health', 'budgets', 'upcoming', 'transactions', 'cibil', 'achievements', 'recharge', 'investments'];
  const savedLayout = db.user.dashboardLayout || completeLayout;
  const defaultLayout = [
    ...savedLayout,
    ...completeLayout.filter(widget => !savedLayout.includes(widget))
  ];
  
  // Urgent alerts override
  const upcomingPayments = db.upcomingPayments || [];
  const hasUrgentBill = upcomingPayments.some(p => !p.paid && p.dueDays <= 3);
  
  const card = db.creditCard;
  const ccLimitAlert = card && (card.availableLimit / card.totalLimit < 0.25);

  let layout = [...defaultLayout];

  // If a layout priority is set to UPI or card, reorder explicitly
  if (db.user.dashboardPriority === 'upi') {
    layout = layout.filter(w => w !== 'recharge');
    layout.unshift('recharge'); // Move Quick UPI/Recharges to top
  } else if (db.user.dashboardPriority === 'cards') {
    layout = layout.filter(w => w !== 'spending');
    layout.unshift('spending');
  }

  // Urgent triggers override custom priority
  if (hasUrgentBill) {
    layout = layout.filter(w => w !== 'upcoming');
    layout.unshift('upcoming'); // Urgent outstanding payments must be front and center
  } else if (ccLimitAlert) {
    layout = layout.filter(w => w !== 'insights' && w !== 'spending');
    layout.unshift('spending');
    layout.unshift('insights');
  }

  return layout;
}

/**
 * Updates accessibility configs
 * @param {object} db database instance
 * @param {object} params language, scale, contrast settings
 * @returns {object} updated accessibility configurations
 */
function updateAccessibility(db, params) {
  if (!db.user.accessibility) {
    db.user.accessibility = { language: 'en', fontSize: 'medium', theme: 'light', contrast: 'normal', voiceNavigation: false };
  }
  if (params.language) db.user.accessibility.language = params.language;
  if (params.fontSize) db.user.accessibility.fontSize = params.fontSize;
  if (params.theme) db.user.accessibility.theme = params.theme;
  if (params.contrast) db.user.accessibility.contrast = params.contrast;
  if (params.voiceNavigation !== undefined) db.user.accessibility.voiceNavigation = params.voiceNavigation;
  
  return db.user.accessibility;
}

module.exports = {
  getPersonalizedLayout,
  updateAccessibility
};
