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
    
    // Search all clients for matching referral code
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    
    for (const client of clients) {
        const affiliateId = client.id || client.email;
        const storedCode = localStorage.getItem(`referral_code_${affiliateId}`);
        if (storedCode === refCode) {
            console.log(`✅ Found affiliate: ${client.username} (${affiliateId})`);
            return {
                id: affiliateId,
                username: client.username,
                email: client.email
            };
        }
    }
    
    console.log('❌ No affiliate found for code:', refCode);
    return null;
}

// ===== CALCULATE COMMISSION =====

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

// Process commission for an order
function processAffiliateCommission(order) {
    console.log('🔄 Processing affiliate commission for order:', order.id);
    
    const refCode = sessionStorage.getItem('referral_code');
    
    if (!refCode) {
        console.log('ℹ️ No referral code found');
        return null;
    }
    
    const affiliate = getAffiliateFromReferral(refCode);
    
    if (!affiliate) {
        console.log('❌ No affiliate found for code:', refCode);
        return null;
    }
    
    // Calculate commission
    const commissionData = calculateCommission(order.total, order.items, affiliate.id);
    
    // Create commission record
    const commissionRecord = {
        id: 'COMM-' + Date.now(),
        affiliateId: affiliate.id,
        affiliateName: affiliate.username,
        orderId: order.id,
        orderTotal: order.total,
        commission: commissionData.total,
        breakdown: commissionData.breakdown,
        date: new Date().toISOString(),
        status: 'pending', // Will become 'available' when order is completed
        customerEmail: order.customer?.email || 'guest',
        customerName: order.customer?.name || order.customer?.username || 'Guest'
    };
    
    // Save to affiliate earnings
    const earningsKey = `affiliate_earnings_${affiliate.id}`;
    const earnings = JSON.parse(localStorage.getItem(earningsKey) || '[]');
    
    earnings.push({
        id: 'EARN-' + Date.now(),
        amount: commissionData.total,
        type: 'commission',
        description: `Commission from order #${order.id}`,
        orderId: order.id,
        date: new Date().toISOString(),
        status: 'pending',
        breakdown: commissionData.breakdown
    });
    
    localStorage.setItem(earningsKey, JSON.stringify(earnings));
    console.log(`✅ Commission saved to earnings: $${commissionData.total.toFixed(2)}`);
    
    // Save referral record
    const referralsKey = `affiliate_referrals_${affiliate.id}`;
    const referrals = JSON.parse(localStorage.getItem(referralsKey) || '[]');
    
    referrals.push({
        id: 'REF-' + Date.now(),
        orderId: order.id,
        customerEmail: order.customer?.email || 'guest',
        customerName: order.customer?.name || order.customer?.username || 'Guest',
        orderTotal: order.total,
        commission: commissionData.total,
        date: new Date().toISOString(),
        status: 'pending',
        items: order.items.length
    });
    
    localStorage.setItem(referralsKey, JSON.stringify(referrals));
    console.log(`✅ Referral record saved for affiliate: ${affiliate.username}`);
    
    // Save to admin tracking
    saveCommissionToAdmin(commissionRecord, affiliate);
    
    // Clear referral code from session
    sessionStorage.removeItem('referral_code');
    console.log('🧹 Referral code cleared from session');
    
    return commissionRecord;
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

// ===== UPDATE ORDER STATUS TO COMPLETE COMMISSION =====

// Call this when order status changes to 'completed' or 'delivered'
function completeAffiliateCommission(orderId) {
    console.log('🔄 Checking for pending commissions for order:', orderId);
    
    // Find all clients (potential affiliates)
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
                return { ...r, status: 'completed', completedAt: new Date().toISOString() };
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
        
        // Optional: Show notification to admin
        if (typeof showAdminNotification === 'function') {
            showAdminNotification(`💰 Commissions released for order ${orderId}`, 'success');
        }
    } else {
        console.log(`ℹ️ No pending commissions found for order ${orderId}`);
    }
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