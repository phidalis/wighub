// affiliate.js - Complete Affiliate Dashboard System

// Global variables
let currentAffiliate = null;
let affiliateReferrals = [];
let affiliateEarnings = [];
let affiliateSettings = {};
let affiliateGiftCards = [];

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

// Check if client is logged in (reuse from client.js)
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
    
    // Update UI
    updateStats();
    updateReferralLink();
    loadReferralsTable();
    loadGiftCards();
    loadStoreCredit();
    updateWithdrawalForm();
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
        .filter(e => e.status !== 'used')
        .reduce((sum, e) => sum + e.amount, 0);
    
    const usedEarnings = affiliateEarnings
        .filter(e => e.status === 'used')
        .reduce((sum, e) => sum + e.amount, 0);
    
    const availableBalance = totalEarnings - usedEarnings;
    
    const totalReferrals = affiliateReferrals.length;
    const pendingOrders = affiliateReferrals.filter(r => r.status === 'pending').length;
    
    const completedReferrals = affiliateReferrals.filter(r => r.status === 'completed').length;
    const conversionRate = totalReferrals > 0 
        ? ((completedReferrals / totalReferrals) * 100).toFixed(1) 
        : 0;
    
    // Update UI
    document.getElementById('totalEarnings').textContent = '$' + totalEarnings.toFixed(2);
    document.getElementById('totalReferrals').textContent = totalReferrals;
    document.getElementById('walletBalance').textContent = '$' + availableBalance.toFixed(2);
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('conversionRate').textContent = conversionRate + '%';
    
    // Update commission rate display
    document.getElementById('commissionRate').textContent = affiliateSettings.defaultCommission + '%';
}

// Update commission rates display
function updateCommissionRates() {
    document.getElementById('defaultRate').textContent = affiliateSettings.defaultCommission;
    document.getElementById('wigRate').textContent = affiliateSettings.categoryRates?.wig || 12;
    document.getElementById('skincareRate').textContent = affiliateSettings.categoryRates?.skincare || 8;
    document.getElementById('makeupRate').textContent = affiliateSettings.categoryRates?.makeup || 8;
}

// Load referrals table - FIXED VERSION
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
        
        // Check if this user has made a purchase by looking at orders
        const allOrders = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('orders_')) {
                const ordersJSON = localStorage.getItem(key);
                if (ordersJSON) {
                    try {
                        const userOrders = JSON.parse(ordersJSON);
                        allOrders.push(...userOrders);
                    } catch (e) {}
                }
            }
        }
        
        const hasPurchased = allOrders.some(order => 
            order.customer?.email === ref.referredEmail || order.customer?.email === ref.referredEmail
        );
        
        html += `
            <tr>
                <td>${date}</td>
                <td>${ref.referredUsername || ref.referredEmail || 'New User'}</td>
                <td>${ref.orderId || (hasPurchased ? 'Purchased' : 'Not yet purchased')}</td>
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
// Function to process referral from signup (called from client-login)
function processReferralSignup(referralCode, newUserEmail, newUsername) {
    console.log('Processing referral signup:', { referralCode, newUserEmail, newUsername });
    
    // Find the affiliate who owns this code
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    let affiliateFound = null;
    
    for (const client of clients) {
        const affiliateId = client.id || client.email;
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
    
    const affiliateId = affiliateFound.id || affiliateFound.email;
    
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

// ===== WITHDRAWAL FUNCTIONS =====

// Update withdrawal form with available balance
function updateWithdrawalForm() {
    const totalEarnings = affiliateEarnings
        .filter(e => e.status !== 'used')
        .reduce((sum, e) => sum + e.amount, 0);
    
    const usedEarnings = affiliateEarnings
        .filter(e => e.status === 'used')
        .reduce((sum, e) => sum + e.amount, 0);
    
    const availableBalance = totalEarnings - usedEarnings;
    
    const balanceElement = document.getElementById('availableBalance');
    const amountInput = document.getElementById('withdrawalAmount');
    
    if (balanceElement) {
        balanceElement.textContent = '$' + availableBalance.toFixed(2);
    }
    
    if (amountInput) {
        amountInput.max = availableBalance;
    }
}

// Request withdrawal
function requestWithdrawal() {
    const amount = parseFloat(document.getElementById('withdrawalAmount').value);
    const method = document.getElementById('withdrawalMethod').value;
    const account = document.getElementById('withdrawalAccount').value;
    
    if (!amount || amount <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }
    
    const totalEarnings = affiliateEarnings
        .filter(e => e.status !== 'used')
        .reduce((sum, e) => sum + e.amount, 0);
    
    const usedEarnings = affiliateEarnings
        .filter(e => e.status === 'used')
        .reduce((sum, e) => sum + e.amount, 0);
    
    const availableBalance = totalEarnings - usedEarnings;
    
    if (amount > availableBalance) {
        showNotification('Insufficient balance', 'error');
        return;
    }
    
    if (amount < 10) {
        showNotification('Minimum withdrawal amount is $10', 'error');
        return;
    }
    
    if (!account) {
        showNotification('Please enter your account details', 'error');
        return;
    }
    
    // Create withdrawal request
    const withdrawal = {
        id: 'WD-' + Date.now(),
        amount: amount,
        method: method,
        account: account,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        affiliateEmail: currentAffiliate.email,
        affiliateName: currentAffiliate.username
    };
    
    // Save withdrawal request
    const withdrawals = JSON.parse(localStorage.getItem('withdrawal_requests') || '[]');
    withdrawals.push(withdrawal);
    localStorage.setItem('withdrawal_requests', JSON.stringify(withdrawals));
    
    // Mark earnings as used
    let remainingToUse = amount;
    const updatedEarnings = [];
    
    for (let i = 0; i < affiliateEarnings.length; i++) {
        const earning = affiliateEarnings[i];
        
        if (earning.status === 'available' && remainingToUse > 0) {
            if (earning.amount <= remainingToUse) {
                remainingToUse -= earning.amount;
                updatedEarnings.push({ 
                    ...earning, 
                    status: 'used', 
                    usedAt: new Date().toISOString(),
                    withdrawalId: withdrawal.id
                });
            } else {
                // Split the earning
                updatedEarnings.push({ 
                    ...earning, 
                    amount: remainingToUse,
                    status: 'used', 
                    usedAt: new Date().toISOString(),
                    withdrawalId: withdrawal.id
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
    
    affiliateEarnings = updatedEarnings;
    const earningsKey = `affiliate_earnings_${currentAffiliate.email}`;
    localStorage.setItem(earningsKey, JSON.stringify(affiliateEarnings));
    
    // Clear form
    document.getElementById('withdrawalAmount').value = '';
    document.getElementById('withdrawalAccount').value = '';
    
    // Update UI
    updateStats();
    updateWithdrawalForm();
    loadWithdrawalHistory();
    
    showNotification(`✅ Withdrawal request for $${amount.toFixed(2)} submitted successfully!`, 'success');
}

// Load withdrawal history
function loadWithdrawalHistory() {
    const container = document.getElementById('withdrawalHistory');
    if (!container) return;
    
    const withdrawals = JSON.parse(localStorage.getItem('withdrawal_requests') || '[]');
    const userWithdrawals = withdrawals.filter(w => w.affiliateEmail === currentAffiliate.email);
    
    if (userWithdrawals.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No withdrawal history yet</p>';
        return;
    }
    
    let html = `
        <table class="history-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    userWithdrawals.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
    
    userWithdrawals.forEach(w => {
        const date = new Date(w.requestedAt).toLocaleDateString();
        let statusClass = '';
        
        switch(w.status) {
            case 'pending':
                statusClass = 'status-pending';
                break;
            case 'approved':
                statusClass = 'status-approved';
                break;
            case 'rejected':
                statusClass = 'status-rejected';
                break;
        }
        
        html += `
            <tr>
                <td>${date}</td>
                <td><strong>$${w.amount.toFixed(2)}</strong></td>
                <td>${w.method}</td>
                <td><span class="${statusClass}">${w.status}</span></td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ===== SECTION NAVIGATION (for main menu) =====

// Show main section (from client dashboard)
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

// ===== LOGOUT FUNCTION =====

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('clientToken');
        localStorage.removeItem('clientUser');
        window.location.href = 'index.html';
    }
}

// ===== INITIALIZATION =====

// Add styles for notifications if not present
(function addNotificationStyles() {
    if (!document.getElementById('affiliateNotificationStyles')) {
        const style = document.createElement('style');
        style.id = 'affiliateNotificationStyles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
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
            
            .notification.success {
                background: #28a745;
            }
            
            .notification.error {
                background: #dc3545;
            }
            
            .notification.info {
                background: #17a2b8;
            }
        `;
        document.head.appendChild(style);
    }
})();

// ===== EXTERNAL FUNCTIONS (called from HTML) =====

// These functions are already defined above:
// - showAffiliateTab(tabId)
// - copyReferralLink()
// - redeemGiftCard()
// - requestWithdrawal()
// - showSection(sectionId)
// - logout()

// Add withdrawal history to HTML if needed
document.addEventListener('DOMContentLoaded', function() {
    // Add withdrawal history section if it doesn't exist
    const commissionsTab = document.getElementById('commissionsTab');
    if (commissionsTab && !document.getElementById('withdrawalHistory')) {
        const withdrawalHistoryDiv = document.createElement('div');
        withdrawalHistoryDiv.className = 'withdrawal-history';
        withdrawalHistoryDiv.innerHTML = `
            <h3><i class="fas fa-history"></i> Withdrawal History</h3>
            <div id="withdrawalHistory"></div>
        `;
        commissionsTab.appendChild(withdrawalHistoryDiv);
    }
    
    // Load withdrawal history
    loadWithdrawalHistory();

});
