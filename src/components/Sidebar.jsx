import React from 'react';

const sidebarTranslations = {
  en: {
    brandName: "Zenith AI",
    supportHeader: "Contact Support",
    supportSubtitle: "We are here to help you!",
    dashboard: "Dashboard",
    accounts: "Accounts",
    payments: "Payments",
    cards: "Cards",
    investments: "Investments",
    loans: "Loans",
    insurance: "Insurance",
    budget: "Budget Planner",
    offers: "Offers",
    support: "Support Helpdesk",
    settings: "Settings"
  },
  hi: {
    brandName: "जेनिथ एआई",
    supportHeader: "सहायता डेस्क",
    supportSubtitle: "हम आपकी सहायता के लिए हैं!",
    dashboard: "डैशबोर्ड",
    accounts: "खाते",
    payments: "भुगतान",
    cards: "कार्ड",
    investments: "निवेश",
    loans: "ऋण",
    insurance: "बीमा",
    budget: "बजट योजना",
    offers: "ऑफ़र",
    support: "सहायता डेस्क",
    settings: "सेटिंग्स"
  },
  ta: {
    brandName: "ஜெனித் ஏஐ",
    supportHeader: "உதவி மையம்",
    supportSubtitle: "நாங்கள் உங்களுக்கு உதவ இங்கே இருக்கிறோம்!",
    dashboard: "டாஷ்போர்டு",
    accounts: "கணக்குகள்",
    payments: "செலுத்தல்கள்",
    cards: "அட்டைகள்",
    investments: "முதலீடுகள்",
    loans: "கடன்கள்",
    insurance: "காப்பீடு",
    budget: "பட்ஜெட் திட்டமிடுபவர்",
    offers: "சலுகைகள்",
    support: "உதவி மையம்",
    settings: "அமைப்புகள்"
  },
  te: {
    brandName: "జెనిత్ ఏఐ",
    supportHeader: "సహాయ కేంద్రం",
    supportSubtitle: "మేము సహాయం చేయడానికి ఇక్కడ ఉన్నాము!",
    dashboard: "డాష్‌బోర్డ్",
    accounts: "ఖాతాలు",
    payments: "చెల్లింపులు",
    cards: "కార్డులు",
    investments: "పెట్టుబడులు",
    loans: "రుణాలు",
    insurance: "భీమా",
    budget: "బడ్జెట్ ప్లానర్",
    offers: "ఆఫర్లు",
    support: "సహాయ కేంద్రం",
    settings: "సెట్టింగులు"
  },
  bn: {
    brandName: "জেনিথ এআই",
    supportHeader: "যোগাযোগ হেল্পডেস্ক",
    supportSubtitle: "আমরা সাহায্য করতে প্রস্তুত!",
    dashboard: "ড্যাশবোর্ড",
    accounts: "অ্যাকাউন্টস",
    payments: "পেমেন্টস",
    cards: "কার্ডস",
    investments: "বিনিয়োগ",
    loans: "লোন",
    insurance: "বীমা",
    budget: "বাজেট প্ল্যানার",
    offers: "অফার",
    support: "হেল্পডেস্ক",
    settings: "সেটিংস"
  },
  mr: {
    brandName: "जेनिथ एआय",
    supportHeader: "मदत कक्ष",
    supportSubtitle: "आम्ही तुमच्या मदतीसाठी आहोत!",
    dashboard: "डॅशबोर्ड",
    accounts: "खाते",
    payments: "भुगतान",
    cards: "कार्ड्स",
    investments: "गुंतवणूक",
    loans: "कर्ज",
    insurance: "विमा",
    budget: "बजेट नियोजन",
    offers: "ऑफर्स",
    support: "मदत कक्ष",
    settings: "सेटिंग्ज"
  },
  gu: {
    brandName: "ઝેનિથ એઆઈ",
    supportHeader: "હેલ્પડેસ્ક",
    supportSubtitle: "અમે તમારી મદદ માટે અહીં છીએ!",
    dashboard: "ડેશબોર્ડ",
    accounts: "ખાતાઓ",
    payments: "ચુકવણીઓ",
    cards: "કાર્ડ્સ",
    investments: "રોકાણો",
    loans: "લોન",
    insurance: "વીમો",
    budget: "બજેટ પ્લાનર",
    offers: "ઓફર્સ",
    support: "હેલ્પડેસ્ક",
    settings: "સેટિંગ્સ"
  }
};

export default function Sidebar({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen, notificationCount, language }) {
  const activeLang = language || 'en';
  const t = sidebarTranslations[activeLang] || sidebarTranslations.en;

  const menuItems = [
    {
      id: 'dashboard',
      label: t.dashboard,
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      )
    },
    {
      id: 'accounts',
      label: t.accounts,
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="7" y1="15" x2="7.01" y2="15" />
          <line x1="11" y1="15" x2="13" y2="15" />
        </svg>
      )
    },
    {
      id: 'payments',
      label: t.payments,
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
      )
    },
    {
      id: 'cards',
      label: t.cards,
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      )
    },
    {
      id: 'investments',
      label: t.investments,
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      )
    },
    {
      id: 'loans',
      label: t.loans,
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      id: 'insurance',
      label: t.insurance,
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    },
    {
      id: 'budget',
      label: t.budget,
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      )
    },
    {
      id: 'offers',
      label: t.offers,
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 12 20 22 4 22 4 12" />
          <rect x="2" y="7" width="20" height="5" />
          <line x1="12" y1="22" x2="12" y2="7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
      )
    },
    {
      id: 'support',
      label: t.support,
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
    },
    {
      id: 'settings',
      label: t.settings,
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    }
  ];

  return (
    <>
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span>{t.brandName}</span>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`menu-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => {
                setCurrentPage(item.id);
                setSidebarOpen(false);
              }}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
              {item.id === 'support' && notificationCount > 0 && (
                <span className="badge-dot" />
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="support-card" onClick={() => setCurrentPage('support')}>
            <div className="support-card-header">
              <span>{t.supportHeader}</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
            <p>{t.supportSubtitle}</p>
            <div className="support-card-icons">
              <div className="icon-circle">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="icon-circle">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
