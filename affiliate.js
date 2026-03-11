// affiliate.js - Complete Affiliate Dashboard System - FIXED

// Global variables
let currentAffiliate = null;
let affiliateReferrals = [];
let affiliateEarnings = [];
let affiliateSettings = {};
let affiliateGiftCards = [];

// Add this at the beginning of affiliate.js
function syncAffiliateDataWithOrders() {
    console.log('🔄 Syncing affiliate data with orders...');
    
    const affiliateId = currentAffiliate.email;
    const referralCode = localStorage.getItem(`referral_code_${affiliateId}`);
    
    if (!referralCode) return;
    
    // Get all orders from all users
    let allOrders = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('orders_')) {
            try {
                const orders = JSON.parse(localStorage.getItem(key) || '[]');
                allOrders = allOrders.concat(orders);
            } catch (e) {}
        }
    }
    
    // Get current referrals
    const referralsKey = `affiliate_referrals_${affiliateId}`;
    let referrals = JSON.parse(localStorage.getItem(referralsKey) || '[]');
    
    // Get current earnings
    const earningsKey = `affiliate_earnings_${affiliateId}`;
    let earnings = JSON.parse(localStorage.getItem(earningsKey) || '[]');
    
    let updated = false;
    
    // Check each order
    allOrders.forEach(order => {
        // Check if this order was referred
        if (order.referralCode === referralCode) {
            console.log(`Found order ${order.id} with referral code`);
            
            // Check if this order is already in referrals
            const existingRef = referrals.find(r => r.orderId === order.id);
            
            if (!existingRef) {
                // Add to referrals
                referrals.push({
                    id: 'REF-' + Date.now() + Math.random(),
                    orderId: order.id,
                    referredEmail: order.customer?.email,
                    referredUsername: order.customer?.username,
                    orderTotal: order.total,
                    commissionEarned: order.total * 0.1, // 10% default
                    date: order.date,
                    status: 'completed'
                });
                updated = true;
            }
            
            // Check if commission is already in earnings
            const existingEarning = earnings.find(e => e.orderId === order.id);
            
            if (!existingEarning && order.total > 0) {
                earnings.push({
                    id: 'EARN-' + Date.now() + Math.random(),
                    amount: order.total * 0.1,
                    type: 'commission',
                    description: `Commission from order #${order.id}`,
                    orderId: order.id,
                    customerEmail: order.customer?.email,
                    date: new Date().toISOString(),
                    status: 'available'
                });
                updated = true;
            }
        }
    });
    
    if (updated) {
        localStorage.setItem(referralsKey, JSON.stringify(referrals));
        localStorage.setItem(earningsKey, JSON.stringify(earnings));
        console.log('✅ Affiliate data synced with orders');
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Affiliate Dashboard Initializing...');
    
    // Check if client is logged in
    if (!checkAffiliateLogin()) {
        return;
    }
    
    // Load affiliate data
    loadAffiliateSettings();
    loadAffiliateData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Show default tab
    showAffiliateTab('referrals');
    
    console.log('Affiliate Dashboard Ready');
});

// Check if client is logged in
function checkAffiliateLogin() {
    const clientToken = localStorage.getItem('clientToken');
    const clientUser = localStorage.getItem('clientUser');
    
    if (!clientToken || !clientUser) {
        window.location.href = 'client-login.html';
        return false;
    }
    
    // Get current affiliate
    currentAffiliate = JSON.parse(clientUser);
    
    // Display affiliate name
    document.getElementById('clientName').textContent = currentAffiliate.username;
    
    return true;
}

// Setup event listeners
// In affiliate.js - Inside setupEventListeners() function
function setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('mobile-open');
            
            const icon = this.querySelector('i');
            if (sidebar.classList.contains('mobile-open')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Gift card input - auto uppercase
    const giftCardInput = document.getElementById('giftCardCode');
    if (giftCardInput) {
        giftCardInput.addEventListener('input', function() {
            this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        });
    }
    
    // ===== ADD THIS NEW SECTION =====
    // Real-time updates from other tabs
    window.addEventListener('storage', function(e) {
        if (e.key && (e.key.includes('affiliate_') || e.key.includes('orders_') || e.key === 'wigClients')) {
            console.log('📡 Data updated in another tab, refreshing affiliate data...');
            loadAffiliateData();
            showNotification('🔄 Data refreshed', 'info');
        }
    });
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        console.log('⏰ Auto-refreshing affiliate data...');
        loadAffiliateData();
    }, 30000);
}
// ===== AFFILIATE DATA LOADING =====

// Load affiliate settings
function loadAffiliateSettings() {
    affiliateSettings = JSON.parse(localStorage.getItem('affiliateSettings') || '{}');
    
    // Set default settings if not exist
    if (Object.keys(affiliateSettings).length === 0) {
        affiliateSettings = {
            defaultCommission: 10,
            welcomeBonus: 5,
            cookieDuration: 30,
            categoryRates: {
                wig: 12,
                skincare: 8,
                haircare: 8,
                fragrance: 10,
                makeup: 8
            },
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem('affiliateSettings', JSON.stringify(affiliateSettings));
    }
    
    // Update commission rate display
    updateCommissionRates();
}

// Load all affiliate data
function loadAffiliateData() {
    const affiliateId = currentAffiliate.email;
    
    // Load referrals
    const referralsKey = `affiliate_referrals_${affiliateId}`;
    affiliateReferrals = JSON.parse(localStorage.getItem(referralsKey) || '[]');
    
    // Load earnings
    const earningsKey = `affiliate_earnings_${affiliateId}`;
    affiliateEarnings = JSON.parse(localStorage.getItem(earningsKey) || '[]');

     // ADD THIS LINE:
    syncAffiliateDataWithOrders();
    
    // Load ALL orders to find any missing referrals
    loadAllOrdersForReferrals(affiliateId);
    
    // Update UI
    updateStats();
    updateReferralLink();
    loadReferralsTable();
    loadGiftCards();
    loadStoreCredit();

}

// Load all orders to find missing referrals
function loadAllOrdersForReferrals(affiliateId) {
    console.log('Loading all orders to find referrals for:', affiliateId);
    
    // Get all orders from all users
    let allOrders = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('orders_')) {
            const ordersJSON = localStorage.getItem(key);
            if (ordersJSON) {
                try {
                    const userOrders = JSON.parse(ordersJSON);
                    allOrders = allOrders.concat(userOrders);
                } catch (e) {}
            }
        }
    }
    
    // Get referral code for this affiliate
    const referralCode = localStorage.getItem(`referral_code_${affiliateId}`);
    
    if (!referralCode) return;
    
    console.log(`Checking orders for referral code: ${referralCode}`);
    
    // Check each order for this referral code
    allOrders.forEach(order => {
        if (order.referralCode === referralCode) {
            console.log(`Found order with referral code: ${order.id}`);
            
            // Check if this order is already in referrals
            const existingRef = affiliateReferrals.find(r => 
                r.orderId === order.id || r.referredEmail === order.customer?.email
            );
            
            if (!existingRef) {
                // Add to referrals
                affiliateReferrals.push({
                    id: 'REF-' + Date.now() + Math.random(),
                    orderId: order.id,
                    referredEmail: order.customer?.email,
                    referredUsername: order.customer?.username,
                    orderTotal: order.total,
                    commissionEarned: order.total * (affiliateSettings.defaultCommission / 100),
                    date: order.date,
                    status: 'completed'
                });
                
                // Add to earnings if not already there
                const existingEarning = affiliateEarnings.find(e => e.orderId === order.id);
                if (!existingEarning) {
                    affiliateEarnings.push({
                        id: 'EARN-' + Date.now() + Math.random(),
                        amount: order.total * (affiliateSettings.defaultCommission / 100),
                        type: 'commission',
                        description: `Commission from order #${order.id}`,
                        orderId: order.id,
                        customerEmail: order.customer?.email,
                        date: new Date().toISOString(),
                        status: 'available'
                    });
                }
            }
        }
    });
    
    // Save updated data
    localStorage.setItem(`affiliate_referrals_${affiliateId}`, JSON.stringify(affiliateReferrals));
    localStorage.setItem(`affiliate_earnings_${affiliateId}`, JSON.stringify(affiliateEarnings));
    
    console.log(`Updated referrals: ${affiliateReferrals.length} total`);
}

// ===== REFERRAL LINK FUNCTIONS =====

// Generate or get referral code
function getReferralCode() {
    const affiliateId = currentAffiliate.email;
    const codeKey = `referral_code_${affiliateId}`;
    let referralCode = localStorage.getItem(codeKey);
    
    if (!referralCode) {
        // Generate new referral code based on username
        const username = currentAffiliate.username.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        referralCode = username + randomNum;
        
        // Ensure uniqueness
        let isUnique = false;
        let attempts = 0;
        while (!isUnique && attempts < 10) {
            isUnique = true;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('referral_code_')) {
                    const existingCode = localStorage.getItem(key);
                    if (existingCode === referralCode) {
                        isUnique = false;
                        referralCode = username + Math.floor(1000 + Math.random() * 9000);
                        break;
                    }
                }
            }
            attempts++;
        }
        
        localStorage.setItem(codeKey, referralCode);
        console.log('✅ New referral code generated:', referralCode);
    }
    
    return referralCode;
}

// Update referral link in UI
function updateReferralLink() {
    const referralCode = getReferralCode();
    const baseUrl = window.location.origin + window.location.pathname.replace('affiliate.html', '');
    const referralLink = `${baseUrl}client-login.html?ref=${referralCode}`;
    
    const linkInput = document.getElementById('referralLink');
    if (linkInput) {
        linkInput.value = referralLink;
    }
    
    // Update clicks count
    const clicksKey = `referral_clicks_${referralCode}`;
    const clicks = parseInt(localStorage.getItem(clicksKey) || '0');
    document.getElementById('totalClicks').textContent = clicks;
}

// Copy referral link to clipboard
function copyReferralLink() {
    const linkInput = document.getElementById('referralLink');
    linkInput.select();
    linkInput.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        const copyBtn = document.querySelector('.btn-copy');
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Link';
        }, 2000);
        
        showNotification('✅ Referral link copied to clipboard!', 'success');
    } catch (err) {
        showNotification('❌ Failed to copy link', 'error');
    }
}

// ===== STATS FUNCTIONS =====

// Update all statistics
function updateStats() {
    // Calculate totals
    const totalEarnings = affiliateEarnings
        .filter(e => e.status !== 'used' && e.status !== 'cancelled')  // ← Added 'cancelled'
        .reduce((sum, e) => sum + e.amount, 0);
    
    const usedEarnings = affiliateEarnings
        .filter(e => e.status === 'used')
        .reduce((sum, e) => sum + e.amount, 0);
    
    const cancelledEarnings = affiliateEarnings  // ← NEW - track cancelled
        .filter(e => e.status === 'cancelled')
        .reduce((sum, e) => sum + e.amount, 0);
    
    const availableBalance = totalEarnings - usedEarnings;
    
    const totalReferrals = affiliateReferrals.length;
    const pendingOrders = affiliateReferrals.filter(r => r.status === 'pending').length;
    const cancelledReferrals = affiliateReferrals.filter(r => r.status === 'cancelled').length;  // ← NEW
    
    const completedReferrals = affiliateReferrals.filter(r => r.status === 'completed').length;
    const conversionRate = totalReferrals > 0 
        ? ((completedReferrals / totalReferrals) * 100).toFixed(1) 
        : 0;
    
    // Update UI
    document.getElementById('totalEarnings').textContent = '$' + (totalEarnings + usedEarnings).toFixed(2);  // Show all earnings
    document.getElementById('totalReferrals').textContent = totalReferrals;
    document.getElementById('walletBalance').textContent = '$' + availableBalance.toFixed(2);
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('conversionRate').textContent = conversionRate + '%';
    
    // Update commission rate display
    document.getElementById('commissionRate').textContent = affiliateSettings.defaultCommission + '%';
    
    // ===== ADD THIS - Show cancelled info in console (or add to UI) =====
    if (cancelledEarnings > 0 || cancelledReferrals > 0) {
        console.log(`⚠️ Cancelled: $${cancelledEarnings.toFixed(2)} earnings, ${cancelledReferrals} referrals`);
        
        // Optional: Add a small notification in the UI
        addCancellationNotice(cancelledEarnings, cancelledReferrals);
    }
}

// Update commission rates display
function updateCommissionRates() {
    document.getElementById('defaultRate').textContent = affiliateSettings.defaultCommission;
    document.getElementById('wigRate').textContent = affiliateSettings.categoryRates?.wig || 12;
    document.getElementById('skincareRate').textContent = affiliateSettings.categoryRates?.skincare || 8;
    document.getElementById('makeupRate').textContent = affiliateSettings.categoryRates?.makeup || 8;
}

// Load referrals table
function loadReferralsTable() {
    const tableBody = document.getElementById('referralsTableBody');
    if (!tableBody) return;
    
    const affiliateId = currentAffiliate.email;
    const referralsKey = `affiliate_referrals_${affiliateId}`;
    affiliateReferrals = JSON.parse(localStorage.getItem(referralsKey) || '[]');
    
    console.log(`📊 Loading referrals for ${affiliateId}:`, affiliateReferrals.length);
    
    if (affiliateReferrals.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-table">
                    No referrals yet. Share your referral link to start earning!
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by date (newest first)
    affiliateReferrals.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let html = '';
    affiliateReferrals.forEach(ref => {
        const date = new Date(ref.date).toLocaleDateString();
        let statusClass = '';
        let statusText = '';
        
        switch(ref.status) {
            case 'completed':
                statusClass = 'status-completed';
                statusText = 'Completed ✓';
                break;
            case 'pending':
                statusClass = 'status-pending';
                statusText = 'Pending';
                break;
            case 'cancelled':
                statusClass = 'status-cancelled';
                statusText = 'Cancelled';
                break;
            default:
                statusClass = 'status-pending';
                statusText = 'Processing';
        }
        
        html += `
            <tr>
                <td>${date}</td>
                <td>${ref.referredUsername || ref.referredEmail || 'New User'}</td>
                <td>${ref.orderId || 'Not purchased yet'}</td>
                <td>$${(ref.orderTotal || 0).toFixed(2)}</td>
                <td>$${(ref.commissionEarned || 0).toFixed(2)}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
    
    // Update total referrals count
    document.getElementById('totalReferrals').textContent = affiliateReferrals.length;
    
    // Calculate pending orders
    const pendingOrders = affiliateReferrals.filter(r => r.status === 'pending').length;
    document.getElementById('pendingOrders').textContent = pendingOrders;
}

// Process referral from signup
function processReferralSignup(referralCode, newUserEmail, newUsername) {
    console.log('Processing referral signup:', { referralCode, newUserEmail, newUsername });
    
    // Find the affiliate who owns this code
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    let affiliateFound = null;
    
    for (const client of clients) {
        const affiliateId = client.email || client.id;
        const storedCode = localStorage.getItem(`referral_code_${affiliateId}`);
        
        if (storedCode === referralCode) {
            affiliateFound = client;
            break;
        }
    }
    
    if (!affiliateFound) {
        console.log('No affiliate found for code:', referralCode);
        return false;
    }
    
    const affiliateId = affiliateFound.email || affiliateFound.id;
    
    // Save referral record
    const referralsKey = `affiliate_referrals_${affiliateId}`;
    const referrals = JSON.parse(localStorage.getItem(referralsKey) || '[]');
    
    referrals.push({
        id: 'REF-' + Date.now(),
        referredEmail: newUserEmail,
        referredUsername: newUsername,
        referralCode: referralCode,
        date: new Date().toISOString(),
        status: 'pending',
        firstPurchase: null,
        commissionEarned: 0
    });
    
    localStorage.setItem(referralsKey, JSON.stringify(referrals));
    
    // Add welcome bonus
    const settings = JSON.parse(localStorage.getItem('affiliateSettings') || '{}');
    const welcomeBonus = settings.welcomeBonus || 5;
    
    const earningsKey = `affiliate_earnings_${affiliateId}`;
    const earnings = JSON.parse(localStorage.getItem(earningsKey) || '[]');
    
    earnings.push({
        id: 'EARN-' + Date.now(),
        amount: welcomeBonus,
        type: 'welcome_bonus',
        description: `Welcome bonus for referring ${newUsername}`,
        date: new Date().toISOString(),
        status: 'available'
    });
    
    localStorage.setItem(earningsKey, JSON.stringify(earnings));
    
    console.log(`✅ Referral processed for ${affiliateFound.username}, earned $${welcomeBonus}`);
    return true;
}

// Load gift cards
function loadGiftCards() {
    const container = document.getElementById('giftCardsContainer');
    if (!container) return;
    
    // Get gift cards from admin
    const allGiftCards = JSON.parse(localStorage.getItem('admin_gift_cards') || '[]');
    
    // Filter gift cards redeemed by this affiliate
    const redeemedCards = allGiftCards.filter(card => 
        card.redeemedBy === currentAffiliate.email && card.status === 'used'
    );
    
    if (redeemedCards.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-gift"></i>
                <h3>No Gift Cards</h3>
                <p>You haven't redeemed any gift cards yet.</p>
                <div class="gift-card-form">
                    <h4>Redeem a Gift Card</h4>
                    <div class="form-group">
                        <input type="text" id="giftCardCode" placeholder="Enter 6-digit gift card code" maxlength="6">
                    </div>
                    <button class="btn btn-primary" onclick="redeemGiftCard()" style="width: 100%;">
                        <i class="fas fa-gift"></i> Redeem Gift Card
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    let html = '<div class="gift-cards-grid">';
    
    redeemedCards.forEach(card => {
        const date = new Date(card.redeemedAt || card.createdAt).toLocaleDateString();
        html += `
            <div class="gift-card used">
                <div class="card-amount">$${card.amount.toFixed(2)}</div>
                <div class="card-code">Code: ${card.code}</div>
                <div class="card-status">Redeemed: ${date}</div>
            </div>
        `;
    });
    
    html += `
        </div>
        <div class="gift-card-form" style="margin-top: 30px;">
            <h4>Redeem Another Gift Card</h4>
            <div class="form-group">
                <input type="text" id="giftCardCode" placeholder="Enter 6-digit gift card code" maxlength="6">
            </div>
            <button class="btn btn-primary" onclick="redeemGiftCard()" style="width: 100%;">
                <i class="fas fa-gift"></i> Redeem Gift Card
            </button>
        </div>
    `;
    
    container.innerHTML = html;
}

// Redeem gift card
function redeemGiftCard() {
    const code = document.getElementById('giftCardCode').value.trim().toUpperCase();
    
    if (!code || code.length !== 6) {
        showNotification('Please enter a valid 6-digit gift card code', 'error');
        return;
    }
    
    const giftCards = JSON.parse(localStorage.getItem('admin_gift_cards') || '[]');
    const cardIndex = giftCards.findIndex(card => card.code === code && card.status === 'active');
    
    if (cardIndex === -1) {
        showNotification('Invalid or already used gift card code', 'error');
        return;
    }
    
    // Mark gift card as used
    giftCards[cardIndex].status = 'used';
    giftCards[cardIndex].redeemedBy = currentAffiliate.email;
    giftCards[cardIndex].redeemedAt = new Date().toISOString();
    localStorage.setItem('admin_gift_cards', JSON.stringify(giftCards));
    
    // Add to affiliate earnings
    affiliateEarnings.push({
        id: 'EARN-' + Date.now(),
        amount: giftCards[cardIndex].amount,
        type: 'gift_card',
        description: `Gift card redemption: ${code}`,
        date: new Date().toISOString(),
        status: 'available'
    });
    
    const earningsKey = `affiliate_earnings_${currentAffiliate.email}`;
    localStorage.setItem(earningsKey, JSON.stringify(affiliateEarnings));
    
    // Clear input
    document.getElementById('giftCardCode').value = '';
    
    // Reload data
    loadGiftCards();
    loadStoreCredit();
    updateStats();
    
    showNotification(`✅ Gift card redeemed! $${giftCards[cardIndex].amount.toFixed(2)} added to your store credit`, 'success');
}

// ===== STORE CREDIT FUNCTIONS =====

// Load store credit
function loadStoreCredit() {
    const container = document.getElementById('storeCreditContainer');
    if (!container) return;
    
    const totalEarnings = affiliateEarnings
        .filter(e => e.status !== 'used')
        .reduce((sum, e) => sum + e.amount, 0);
    
    const usedEarnings = affiliateEarnings
        .filter(e => e.status === 'used')
        .reduce((sum, e) => sum + e.amount, 0);
    
    const availableBalance = totalEarnings - usedEarnings;
    
    // Group earnings by type
    const commissionTotal = affiliateEarnings
        .filter(e => e.type === 'commission' && e.status !== 'used')
        .reduce((sum, e) => sum + e.amount, 0);
    
    const giftCardTotal = affiliateEarnings
        .filter(e => e.type === 'gift_card' && e.status !== 'used')
        .reduce((sum, e) => sum + e.amount, 0);
    
    const welcomeBonusTotal = affiliateEarnings
        .filter(e => e.type === 'welcome_bonus' && e.status !== 'used')
        .reduce((sum, e) => sum + e.amount, 0);
    
    // Get recent transactions
    const recentTransactions = [...affiliateEarnings]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);
    
    let transactionsHtml = '';
    if (recentTransactions.length > 0) {
        transactionsHtml = `
            <h4 style="margin: 30px 0 15px;">Recent Transactions</h4>
            <table class="transaction-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        recentTransactions.forEach(t => {
            const date = new Date(t.date).toLocaleDateString();
            const status = t.status === 'used' ? 'Used' : (t.status === 'available' ? 'Available' : t.status);
            const statusColor = t.status === 'available' ? '#28a745' : (t.status === 'used' ? '#6c757d' : '#856404');
            
            transactionsHtml += `
                <tr>
                    <td>${date}</td>
                    <td>${t.description || t.type || 'Commission'}</td>
                    <td style="color: #28a745; font-weight: 600;">+$${t.amount.toFixed(2)}</td>
                    <td><span style="color: ${statusColor};">${status}</span></td>
                </tr>
            `;
        });
        
        transactionsHtml += '</tbody></table>';
    }
    
    container.innerHTML = `
        <div class="credit-card">
            <h3 style="margin-bottom: 20px;">Your Store Credit</h3>
            
            <div class="credit-available">
                <div style="opacity: 0.9;">Available Balance</div>
                <div class="credit-amount">$${availableBalance.toFixed(2)}</div>
            </div>
            
            <div class="credit-breakdown" style="margin-top: 20px;">
                <h4 style="margin-bottom: 15px;">Breakdown</h4>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>Commissions Earned:</span>
                    <span style="font-weight: 600;">$${commissionTotal.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>Gift Cards Redeemed:</span>
                    <span style="font-weight: 600;">$${giftCardTotal.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>Welcome Bonus:</span>
                    <span style="font-weight: 600;">$${welcomeBonusTotal.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 2px solid #e2e8f0;">
                    <span><strong>Total Used:</strong></span>
                    <span style="color: #6c757d;">$${usedEarnings.toFixed(2)}</span>
                </div>
            </div>
            
            ${transactionsHtml}
        </div>
    `;
}

// ===== TAB NAVIGATION =====

// Show affiliate tab
function showAffiliateTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.affiliate-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.affiliate-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabId + 'Tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Activate corresponding button
    const activeButton = document.querySelector(`.affiliate-tab[onclick*="${tabId}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Load tab data if needed
    switch(tabId) {
        case 'giftcards':
            loadGiftCards();
            break;
        case 'storecredit':
            loadStoreCredit();
            break;
    }
}

// ===== SECTION NAVIGATION =====

// Show main section
function showSection(sectionId) {
    console.log('Switching to main section:', sectionId);
    
    // Redirect to client dashboard with appropriate section
    if (sectionId === 'affiliate') {
        return; // Already on affiliate page
    }
    
    window.location.href = `client.html#${sectionId}`;
}

// ===== NOTIFICATION FUNCTIONS =====

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
// Add this near the bottom of affiliate.js (before the logout function)
function addCancellationNotice(cancelledEarnings, cancelledReferrals) {
    // Check if notice already exists
    if (document.getElementById('cancellationNotice')) return;
    
    const statsGrid = document.querySelector('.affiliate-stats-grid');
    if (!statsGrid) return;
    
    const notice = document.createElement('div');
    notice.id = 'cancellationNotice';
    notice.style.cssText = `
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 8px;
        padding: 15px;
        margin: 20px 0;
        display: flex;
        align-items: center;
        gap: 15px;
        color: #856404;
        animation: fadeIn 0.3s ease;
    `;
    
    notice.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="font-size: 24px;"></i>
        <div>
            <strong>Cancelled Activity:</strong> 
            $${cancelledEarnings.toFixed(2)} in cancelled commissions, 
            ${cancelledReferrals} cancelled referrals
        </div>
        <button onclick="this.parentElement.remove()" style="margin-left: auto; background: none; border: none; color: #856404; cursor: pointer;">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    statsGrid.parentNode.insertBefore(notice, statsGrid.nextSibling);
}

// ===== ADD STYLES =====
(function addNotificationStyles() {
    if (!document.getElementById('affiliateNotificationStyles')) {
        const style = document.createElement('style');
        style.id = 'affiliateNotificationStyles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 10000;
                animation: slideIn 0.3s ease;
                max-width: 400px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            }
            
            .notification.success { background: #28a745; }
            .notification.error { background: #dc3545; }
            .notification.info { background: #17a2b8; }
        `;
        document.head.appendChild(style);
    }
})();


// ===== LOGOUT FUNCTION =====

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('clientToken');
        localStorage.removeItem('clientUser');
        window.location.href = 'index.html';
    }
}




