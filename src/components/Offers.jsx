import React, { useState } from 'react';

export default function Offers({ offers, addNotification }) {
  const [rewardPoints, setRewardPoints] = useState(5420);
  
  const redemptionStore = [
    { id: 1, title: "Amazon Pay Gift Card", value: "₹500 Voucher", cost: 2500, emoji: "🎁" },
    { id: 2, title: "Starbucks Coffee Coupon", value: "Free Premium Brew", cost: 1000, emoji: "☕" },
    { id: 3, title: "BookMyShow Movie Code", value: "₹300 Off Tickets", cost: 1500, emoji: "🍿" },
    { id: 4, title: "Flipkart Shopping Voucher", value: "₹1,000 Voucher", cost: 5000, emoji: "🛍️" }
  ];

  const handleRedeem = (item) => {
    if (rewardPoints < item.cost) {
      alert("Insufficient reward points to redeem this item.");
      return;
    }

    if (confirm(`Redeem ${item.cost} points for "${item.title}"?`)) {
      setRewardPoints(prev => prev - item.cost);
      const voucherCode = "ZEN-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      addNotification(
        "Voucher Redeemed", 
        `Claimed ${item.title}. Voucher Code: ${voucherCode} (copied to clipboard).`
      );
      navigator.clipboard.writeText(voucherCode);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    addNotification("Promo Code Copied", `Copied promo code ${code} to clipboard.`);
  };

  return (
    <div className="page-container">
      <div className="welcome-section">
        <div>
          <h1 className="welcome-title">Zenith Offers & Rewards</h1>
          <p className="welcome-subtitle">Redeem accumulated points for gift cards and copy promotional deal codes.</p>
        </div>
      </div>

      <div className="offers-layout-grid-custom">
        {/* Left Side: Rewards Tally and Shop */}
        <div className="rewards-shop-section">
          {/* Points summary */}
          <div className="zenith-card rewards-summary-card-custom">
            <div className="rew-summary-content">
              <div>
                <span>Accumulated Zenith Points</span>
                <h2>{rewardPoints.toLocaleString()} PTS</h2>
                <p>Status: Gold Tier Partner</p>
              </div>
              <div className="rew-badge-large">🏆</div>
            </div>
          </div>

          {/* Redemption store grid */}
          <div className="zenith-card redemptions-card mt-6">
            <h3>Zenith Redemptions Store</h3>
            <p className="widget-subtitle">Convert points to online shopping vouchers</p>

            <div className="redemption-grid mt-4">
              {redemptionStore.map(item => (
                <div key={item.id} className="red-store-item">
                  <div className="red-item-top-row">
                    <span className="red-emoji">{item.emoji}</span>
                    <span className="red-points">{item.cost} pts</span>
                  </div>
                  <h4 className="red-item-title">{item.title}</h4>
                  <p className="red-item-val">{item.value}</p>
                  <button 
                    className="btn btn-secondary btn-sm w-full mt-4"
                    onClick={() => handleRedeem(item)}
                  >
                    Redeem
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Cashback coupons list */}
        <div className="promotional-offers-section">
          <div className="zenith-card active-promo-card">
            <h3>Special Promo Coupons</h3>
            <p className="widget-subtitle">Click code to copy and apply in checkout portals</p>

            <div className="promo-codes-list mt-4">
              {offers?.map(off => (
                <div key={off.id} className="promo-row-banner">
                  <div className="promo-banner-left">
                    <span className="badge badge-success">{off.badge}</span>
                    <h4>{off.title}</h4>
                    <p>{off.subtitle}</p>
                    <strong className="text-success mt-2 block font-semibold">{off.reward}</strong>
                  </div>
                  
                  <div className="promo-banner-right">
                    <button 
                      className="promo-copy-btn"
                      onClick={() => handleCopyCode(off.code)}
                    >
                      {off.code}
                      <span className="copy-sub-lbl">Copy Code</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
