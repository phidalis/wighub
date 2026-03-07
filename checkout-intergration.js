// checkout-integration.js - COMPLETE AFFILIATE TRACKING SYSTEM

// ===== TRACK REFERRALS FROM URL PARAMETERS =====

// Check for referral code on page load
function checkReferralCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
        console.log('✅ Referral code detected:', refCode);
        // Store referral code in session
        sessionStorage.setItem('referral_code', refCode);
        
        // Record click
        recordReferralClick(refCode);
        
        // Show notification to customer (optional)
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
    // Optional: Show a small banner that they came through a referral
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

// Get affiliate ID from referral code
function getAffiliateFromReferral(refCode) {
    if (!refCode) return null;
    
    console.log('Looking up affiliate for referral code:', refCode);
    
    // Search all clients for matching referral code
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    
    for (const client of clients) {
        const affiliateId = client.id || client.email;
        
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
// Calculate commission for an order
function calculateCommission(orderTotal, items, affiliateId) {
    const settings = JSON.parse(localStorage.getItem('affiliateSettings') || '{}');
    const defaultRate = settings.defaultCommission || 10;
    const categoryRates = settings.categoryRates || {};
    
    let totalCommission = 0;
    let breakdown = [];
    
    items.forEach(item => {
        const productType = item.productType || 'default';
        const rate = categoryRates[productType] || defaultRate;
        const itemSubtotal = item.price * item.quantity;
        const itemCommission = itemSubtotal * (rate / 100);
        
        totalCommission += itemCommission;
        
        breakdown.push({
            product: item.name,
            type: productType,
            subtotal: itemSubtotal,
            rate: rate,
            commission: itemCommission
        });
    });
    
    console.log('💰 Commission calculated:', {
        total: totalCommission,
        breakdown: breakdown
    });
    
    return {
        total: totalCommission,
        breakdown: breakdown
    };
}

// ===== PROCESS AFFILIATE COMMISSION =====

// ===== PROCESS COMMISSION FROM ORDER =====
function processAffiliateCommission(order) {
    console.log('🔄 Processing affiliate commission for order:', order.id);
    
    // Check if this order came from a referral
    const refCode = order.referralCode || sessionStorage.getItem('referral_code');
    
    if (!refCode) {
        console.log('ℹ️ No referral code found for this order');
        return null;
    }
    
    const affiliate = getAffiliateFromReferral(refCode);
    
    if (!affiliate) {
        console.log('❌ No affiliate found for code:', refCode);
        return null;
    }
    
    // Check if this customer was referred by this affiliate
    const customerEmail = order.customer?.email;
    if (customerEmail) {
        const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
        const customer = clients.find(c => c.email === customerEmail);
        
        if (customer && customer.referredByCode && customer.referredByCode !== refCode) {
            console.log('⚠️ Customer was referred by a different affiliate');
            // Still process? Or return? We'll process but note it
        }
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
        customerName: order.customer?.name || order.customer?.username,
        date: new Date().toISOString(),
        status: 'pending' // Will become 'available' when order is completed
    });
    
    localStorage.setItem(earningsKey, JSON.stringify(earnings));
    
    // Update referral record
    const referralsKey = `affiliate_referrals_${affiliate.id}`;
    const referrals = JSON.parse(localStorage.getItem(referralsKey) || '[]');
    
    const referralIndex = referrals.findIndex(r => 
        r.referredEmail === order.customer?.email || 
        (r.referredEmail && order.customer?.email && r.referredEmail.toLowerCase() === order.customer.email.toLowerCase())
    );
    
    if (referralIndex !== -1) {
        referrals[referralIndex].orderId = order.id;
        referrals[referralIndex].orderTotal = order.total;
        referrals[referralIndex].commissionEarned = commission;
        referrals[referralIndex].status = 'pending';
        referrals[referralIndex].orderDate = order.date;
        localStorage.setItem(referralsKey, JSON.stringify(referrals));
    } else {
        // Create new referral record
        referrals.push({
            id: 'REF-' + Date.now(),
            orderId: order.id,
            referredEmail: order.customer?.email,
            referredUsername: order.customer?.name || order.customer?.username,
            orderTotal: order.total,
            commissionEarned: commission,
            date: new Date().toISOString(),
            status: 'pending'
        });
        localStorage.setItem(referralsKey, JSON.stringify(referrals));
    }
    
    console.log(`✅ Commission saved for affiliate ${affiliate.username}: $${commission.toFixed(2)}`);
    
    // Clear referral code from session
    sessionStorage.removeItem('referral_code');
    
    return {
        affiliate: affiliate,
        commission: commission,
        orderId: order.id
    };
}

// Save commission to admin tracking
function saveCommissionToAdmin(commission, affiliate) {
    const adminCommissionsKey = 'admin_affiliate_commissions';
    const adminCommissions = JSON.parse(localStorage.getItem(adminCommissionsKey) || '[]');
    
    adminCommissions.push({
        ...commission,
        affiliateUsername: affiliate.username,
        affiliateEmail: affiliate.email,
        reportedAt: new Date().toISOString()
    });
    
    localStorage.setItem(adminCommissionsKey, JSON.stringify(adminCommissions));
    
    // Create admin notification
    const notificationsKey = 'adminNotifications';
    const notifications = JSON.parse(localStorage.getItem(notificationsKey) || '[]');
    
    notifications.push({
        id: 'NOTIF-' + Date.now(),
        type: 'affiliate_commission',
        affiliate: affiliate.username,
        amount: commission.commission,
        orderId: commission.orderId,
        date: new Date().toISOString(),
        read: false
    });
    
    localStorage.setItem(notificationsKey, JSON.stringify(notifications));
}


// ===== COMPLETE ORDER AND RELEASE COMMISSION =====
function completeAffiliateCommission(orderId) {
    console.log('🔄 Checking for pending commissions for order:', orderId);
    
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    let updated = false;
    
    clients.forEach(client => {
        const affiliateId = client.id || client.email;
        
        // Update earnings
        const earningsKey = `affiliate_earnings_${affiliateId}`;
        const earnings = JSON.parse(localStorage.getItem(earningsKey) || '[]');
        
        let earningsUpdated = false;
        const updatedEarnings = earnings.map(e => {
            if (e.orderId === orderId && e.status === 'pending') {
                earningsUpdated = true;
                console.log(`✅ Commission for order ${orderId} marked as available`);
                return { ...e, status: 'available', completedAt: new Date().toISOString() };
            }
            return e;
        });
        
        if (earningsUpdated) {
            localStorage.setItem(earningsKey, JSON.stringify(updatedEarnings));
            updated = true;
        }
        
        // Update referrals
        const referralsKey = `affiliate_referrals_${affiliateId}`;
        const referrals = JSON.parse(localStorage.getItem(referralsKey) || '[]');
        
        let referralsUpdated = false;
        const updatedReferrals = referrals.map(r => {
            if (r.orderId === orderId && r.status === 'pending') {
                referralsUpdated = true;
                return { 
                    ...r, 
                    status: 'completed', 
                    completedAt: new Date().toISOString() 
                };
            }
            return r;
        });
        
        if (referralsUpdated) {
            localStorage.setItem(referralsKey, JSON.stringify(updatedReferrals));
            updated = true;
        }
    });
    
    if (updated) {
        console.log(`✅ Affiliate commissions completed for order ${orderId}`);
    } else {
        console.log(`ℹ️ No pending commissions found for order ${orderId}`);
    }
}
// Add this function to track referral clicks
function trackReferralClick(refCode) {
    const clicksKey = `referral_clicks_${refCode}`;
    const clicks = parseInt(localStorage.getItem(clicksKey) || '0');
    localStorage.setItem(clicksKey, (clicks + 1).toString());
    console.log(`📊 Referral click recorded for ${refCode}: ${clicks + 1} total clicks`);
}

// Get category rate
function getCategoryRate(category) {
    const settings = JSON.parse(localStorage.getItem('affiliateSettings') || '{}');
    const categoryRates = settings.categoryRates || {};
    return categoryRates[category] || settings.defaultCommission || 10;
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

// ===== STORE CREDIT CHECKOUT =====

// Check if user has store credit
function getUserStoreCredit(userEmail) {
    const earningsKey = `affiliate_earnings_${userEmail}`;
    const earnings = JSON.parse(localStorage.getItem(earningsKey) || '[]');
    
    const totalEarnings = earnings
        .filter(e => e.status !== 'used')
        .reduce((sum, e) => sum + e.amount, 0);
    const used = earnings
        .filter(e => e.status === 'used')
        .reduce((sum, e) => sum + e.amount, 0);
    
    return totalEarnings - used;
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

// ===== GIFT CARD CHECKOUT FUNCTIONS =====

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