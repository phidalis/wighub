// Check for referral code on page load
function checkReferralCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
        console.log('✅ Referral code detected:', refCode);
        // Store referral code in session
        sessionStorage.setItem('referral_code', refCode);
        
        // Also store in localStorage for persistence
        localStorage.setItem('last_referral_code', refCode);
        
        // Record click
        recordReferralClick(refCode);
        
        // Show notification to customer
        showReferralNotification(refCode);
    }
}

// Record referral click
function recordReferralClick(refCode) {
    const clicksKey = `referral_clicks_${refCode}`;
    const clicks = parseInt(localStorage.getItem(clicksKey) || '0');
    localStorage.setItem(clicksKey, (clicks + 1).toString());
    console.log(`📊 Referral click recorded for ${refCode}: ${clicks + 1} total clicks`);
}

// Show notification that they were referred
function showReferralNotification(refCode) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 10px 20px;
        border-radius: 30px;
        z-index: 9999;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideDown 0.3s ease;
    `;
    notification.innerHTML = '🎉 You were referred by an affiliate! Complete your purchase to support them.';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Get affiliate from referral code
function getAffiliateFromReferral(refCode) {
    if (!refCode) return null;
    
    console.log('Looking up affiliate for referral code:', refCode);
    
    // Search all clients for matching referral code
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    
    for (const client of clients) {
        const affiliateId = client.email || client.id;
        
        // Check in multiple places
        let storedCode = localStorage.getItem(`referral_code_${affiliateId}`);
        
        // Also check if client has a referralCode property
        if (!storedCode && client.referralCode) {
            storedCode = client.referralCode;
        }
        
        if (storedCode === refCode) {
            console.log(`✅ Found affiliate: ${client.username} (${affiliateId})`);
            return {
                id: affiliateId,
                username: client.username,
                email: client.email,
                code: storedCode
            };
        }
    }
    
    console.log('❌ No affiliate found for code:', refCode);
    return null;
}

// ===== PROCESS AFFILIATE COMMISSION =====

// Process commission from order
function processAffiliateCommission(order) {
    console.log('🔄 Processing affiliate commission for order:', order.id);
    
    // Check if this order came from a referral
    const refCode = order.referralCode || sessionStorage.getItem('referral_code') || localStorage.getItem('last_referral_code');
    
    if (!refCode) {
        console.log('ℹ️ No referral code found for this order');
        return null;
    }
    
    const affiliate = getAffiliateFromReferral(refCode);
    
    if (!affiliate) {
        console.log('❌ No affiliate found for code:', refCode);
        return null;
    }
    
    // Calculate commission
    const settings = JSON.parse(localStorage.getItem('affiliateSettings') || '{}');
    const defaultRate = settings.defaultCommission || 10;
    
    let commission = 0;
    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            const productType = item.productType || 'default';
            const categoryRates = settings.categoryRates || {};
            const rate = categoryRates[productType] || defaultRate;
            commission += (item.price * item.quantity) * (rate / 100);
        });
    } else {
        commission = order.total * (defaultRate / 100);
    }
    
    console.log(`💰 Commission calculated: $${commission.toFixed(2)}`);
    
    // Save to affiliate earnings
    const earningsKey = `affiliate_earnings_${affiliate.id}`;
    const earnings = JSON.parse(localStorage.getItem(earningsKey) || '[]');
    
    earnings.push({
        id: 'EARN-' + Date.now(),
        amount: commission,
        type: 'commission',
        description: `Commission from order #${order.id}`,
        orderId: order.id,
        customerEmail: order.customer?.email,
        customerName: order.customer?.username,
        date: new Date().toISOString(),
        status: 'available' // Changed from 'pending' to 'available' for immediate credit
    });
    
    localStorage.setItem(earningsKey, JSON.stringify(earnings));
    
    // Update referral record
    const referralsKey = `affiliate_referrals_${affiliate.id}`;
    const referrals = JSON.parse(localStorage.getItem(referralsKey) || '[]');
    
    const existingReferralIndex = referrals.findIndex(r => 
        r.referredEmail === order.customer?.email
    );
    
    if (existingReferralIndex !== -1) {
        // Update existing referral
        referrals[existingReferralIndex].orderId = order.id;
        referrals[existingReferralIndex].orderTotal = order.total;
        referrals[existingReferralIndex].commissionEarned = commission;
        referrals[existingReferralIndex].status = 'completed';
        referrals[existingReferralIndex].orderDate = order.date;
    } else {
        // Create new referral record
        referrals.push({
            id: 'REF-' + Date.now(),
            orderId: order.id,
            referredEmail: order.customer?.email,
            referredUsername: order.customer?.username,
            orderTotal: order.total,
            commissionEarned: commission,
            date: new Date().toISOString(),
            status: 'completed'
        });
    }
    
    localStorage.setItem(referralsKey, JSON.stringify(referrals));
    
    console.log(`✅ Commission saved for affiliate ${affiliate.username}: $${commission.toFixed(2)}`);
    
    // Clear referral code from session
    sessionStorage.removeItem('referral_code');
    
    return {
        affiliate: affiliate,
        commission: commission,
        orderId: order.id
    };
}

// ===== STORE CREDIT FUNCTIONS =====

// Check if user has store credit
function getUserStoreCredit(userEmail) {
    const earningsKey = `affiliate_earnings_${userEmail}`;
    const earnings = JSON.parse(localStorage.getItem(earningsKey) || '[]');
    
    const totalEarnings = earnings
        .filter(e => e.status === 'available')
        .reduce((sum, e) => sum + e.amount, 0);
    
    return totalEarnings;
}

// Use store credit for order
function useStoreCreditForOrder(userEmail, amount) {
    const earningsKey = `affiliate_earnings_${userEmail}`;
    const earnings = JSON.parse(localStorage.getItem(earningsKey) || '[]');
    
    let remainingToUse = amount;
    const updatedEarnings = [];
    
    for (let i = 0; i < earnings.length; i++) {
        const earning = earnings[i];
        
        if (earning.status === 'available' && remainingToUse > 0) {
            if (earning.amount <= remainingToUse) {
                // Take full earning
                remainingToUse -= earning.amount;
                updatedEarnings.push({ 
                    ...earning, 
                    status: 'used', 
                    usedAt: new Date().toISOString()
                });
            } else {
                // Split the earning
                updatedEarnings.push({ 
                    ...earning, 
                    amount: remainingToUse,
                    status: 'used', 
                    usedAt: new Date().toISOString()
                });
                
                // Keep the remainder
                updatedEarnings.push({
                    ...earning,
                    id: earning.id + '-remain',
                    amount: earning.amount - remainingToUse,
                    status: 'available'
                });
                
                remainingToUse = 0;
            }
        } else {
            updatedEarnings.push(earning);
        }
    }
    
    localStorage.setItem(earningsKey, JSON.stringify(updatedEarnings));
    return amount - remainingToUse; // Return amount actually used
}

// ===== GIFT CARD FUNCTIONS =====

// Apply gift card to order
function applyGiftCard(code, orderTotal) {
    const giftCards = JSON.parse(localStorage.getItem('admin_gift_cards') || '[]');
    const giftCard = giftCards.find(card => card.code === code && card.status === 'active');
    
    if (!giftCard) {
        return { success: false, message: 'Invalid gift card code' };
    }
    
    return {
        success: true,
        amount: giftCard.amount,
        code: giftCard.code
    };
}

// Redeem gift card for user
function redeemGiftCardForUser(code, userEmail) {
    const giftCards = JSON.parse(localStorage.getItem('admin_gift_cards') || '[]');
    const cardIndex = giftCards.findIndex(card => card.code === code && card.status === 'active');
    
    if (cardIndex === -1) {
        return { success: false, message: 'Invalid gift card code' };
    }
    
    // Mark gift card as used
    giftCards[cardIndex].status = 'used';
    giftCards[cardIndex].redeemedBy = userEmail;
    giftCards[cardIndex].redeemedAt = new Date().toISOString();
    localStorage.setItem('admin_gift_cards', JSON.stringify(giftCards));
    
    // Add to user's earnings
    const earningsKey = `affiliate_earnings_${userEmail}`;
    const earnings = JSON.parse(localStorage.getItem(earningsKey) || '[]');
    
    earnings.push({
        id: 'EARN-' + Date.now(),
        amount: giftCards[cardIndex].amount,
        type: 'gift_card',
        description: `Gift card redemption: ${code}`,
        date: new Date().toISOString(),
        status: 'available'
    });
    
    localStorage.setItem(earningsKey, JSON.stringify(earnings));
    
    return {
        success: true,
        amount: giftCards[cardIndex].amount,
        code: code
    };
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkReferralCode();
    
    // Add animation style
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translate(-50%, -20px);
            }
            to {
                opacity: 1;
                transform: translate(-50%, 0);
            }
        }
    `;
    document.head.appendChild(style);
});