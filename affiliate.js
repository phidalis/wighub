// affiliate.js - COMPLETE AFFILIATE DASHBOARD - FIXED VERSION

// ===== GLOBAL VARIABLES =====
let currentAffiliate = null;
let affiliateSettings = null;
let affiliateReferrals = [];
let affiliateEarnings = [];
let affiliateWithdrawals = [];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Affiliate System Initializing...');
    
    // Check if affiliate is logged in
    if (!checkAffiliateLogin()) {
        return;
    }
    
    // Initialize affiliate settings
    initializeAffiliateSettings();
    
    // Load affiliate data
    loadAffiliateData();
    
    // Setup payment method handler
    setupPaymentMethodHandler();
    
    // Setup mobile menu toggle
    setupMobileMenu();
    
    // Setup sidebar navigation
    setupSidebarNavigation();
});

// ===== MOBILE MENU SETUP =====
function setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('mobile-open');
            
            // Change icon
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
}

// ===== SIDEBAR NAVIGATION =====
function setupSidebarNavigation() {
    // Make sidebar buttons work in affiliate page
    document.querySelectorAll('.sidebar-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const onclickAttr = this.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes('showSection')) {
                // Extract section name
                const match = onclickAttr.match(/'([^']+)'/);
                if (match && match[1]) {
                    showSection(match[1]);
                }
            } else if (this.getAttribute('onclick')?.includes('window.location')) {
                // Let the window.location redirect work normally
                return;
            } else {
                // Default behavior for other buttons
                window.location.href = 'client.html';
            }
        });
    });
}

// ===== SECTION NAVIGATION (for client sections) =====
function showSection(sectionId) {
    console.log('Switching to client section:', sectionId);
    // This function is called when clicking client dashboard buttons
    // Redirect to client.html with the section
    window.location.href = `client.html#${sectionId}`;
}

// Check affiliate login
function checkAffiliateLogin() {
    const affiliateToken = localStorage.getItem('affiliateToken');
    const affiliateUser = localStorage.getItem('affiliateUser');
    
    // FIX: Get clientName element correctly
    const clientNameElement = document.getElementById('clientName');
    
    if (!affiliateToken || !affiliateUser) {
        // Try to use client login as affiliate
        const clientUser = localStorage.getItem('clientUser');
        if (clientUser) {
            // If client is logged in, they can access affiliate dashboard
            currentAffiliate = JSON.parse(clientUser);
            localStorage.setItem('affiliateUser', clientUser);
            localStorage.setItem('affiliateToken', 'affiliate-' + Date.now());
            
            // Display client name
            if (clientNameElement) {
                clientNameElement.textContent = currentAffiliate.username || 'Affiliate';
            }
            return true;
        } else {
            window.location.href = 'client-login.html?tab=signup&affiliate=true';
            return false;
        }
    }
    
    currentAffiliate = JSON.parse(affiliateUser);
    
    // Display client name
    if (clientNameElement && currentAffiliate) {
        clientNameElement.textContent = currentAffiliate.username || 'Affiliate';
    }
    
    return true;
}

// Initialize affiliate settings
function initializeAffiliateSettings() {
    if (!localStorage.getItem('affiliateSettings')) {
        const defaultSettings = {
            defaultCommission: 10,
            categoryRates: {
                wig: 12,
                skincare: 8,
                haircare: 8,
                fragrance: 10,
                makeup: 8
            },
            minWithdrawal: 10,
            cookieDuration: 30, // days
            welcomeBonus: 5 // $5 welcome bonus for new affiliates
        };
        localStorage.setItem('affiliateSettings', JSON.stringify(defaultSettings));
    }
    
    affiliateSettings = JSON.parse(localStorage.getItem('affiliateSettings'));
}

// Load affiliate data
function loadAffiliateData() {
    if (!currentAffiliate) return;
    
    const affiliateId = currentAffiliate.id || currentAffiliate.email;
    
    // Load referrals
    const referralsKey = `affiliate_referrals_${affiliateId}`;
    affiliateReferrals = JSON.parse(localStorage.getItem(referralsKey) || '[]');
    
    // Load earnings
    const earningsKey = `affiliate_earnings_${affiliateId}`;
    affiliateEarnings = JSON.parse(localStorage.getItem(earningsKey) || '[]');
    
    // Load withdrawals
    const withdrawalsKey = `affiliate_withdrawals_${affiliateId}`;
    affiliateWithdrawals = JSON.parse(localStorage.getItem(withdrawalsKey) || '[]');
    
    // Update UI
    updateAffiliateStats();
    displayReferrals();
    displayReferralLink();
    displayWithdrawalHistory();
    updateCommissionRates();
    
    // Check for welcome bonus
    checkWelcomeBonus();
}

// Check and apply welcome bonus
function checkWelcomeBonus() {
    if (!currentAffiliate) return;
    
    const affiliateId = currentAffiliate.id || currentAffiliate.email;
    const welcomeKey = `affiliate_welcome_${affiliateId}`;
    
    if (!localStorage.getItem(welcomeKey) && affiliateSettings && affiliateSettings.welcomeBonus > 0) {
        // Apply welcome bonus
        const bonusEarning = {
            id: 'EARN-' + Date.now(),
            amount: affiliateSettings.welcomeBonus,
            type: 'welcome_bonus',
            description: 'Welcome bonus for joining affiliate program',
            date: new Date().toISOString(),
            status: 'available'
        };
        
        affiliateEarnings.push(bonusEarning);
        const earningsKey = `affiliate_earnings_${affiliateId}`;
        localStorage.setItem(earningsKey, JSON.stringify(affiliateEarnings));
        
        localStorage.setItem(welcomeKey, 'true');
        
        showNotification(`🎉 You received a $${affiliateSettings.welcomeBonus} welcome bonus!`, 'success');
        updateAffiliateStats();
    }
}

// ===== REFERRAL LINK GENERATION =====

// Generate referral link
function generateReferralLink() {
    if (!currentAffiliate) return '#';
    
    const affiliateId = currentAffiliate.id || currentAffiliate.email;
    const baseUrl = window.location.origin;
    
    // Create unique referral code
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    let encodedId;
    try {
        encodedId = btoa(affiliateId).substring(0, 4);
    } catch (e) {
        encodedId = affiliateId.substring(0, 4);
    }
    const referralCode = (encodedId + timestamp + random).substring(0, 12);
    
    // Store referral code
    localStorage.setItem(`referral_code_${affiliateId}`, referralCode);
    
    return `${baseUrl}/index.html?ref=${referralCode}`;
}

// Display referral link
function displayReferralLink() {
    const linkInput = document.getElementById('referralLink');
    if (!linkInput || !currentAffiliate) return;
    
    const affiliateId = currentAffiliate.id || currentAffiliate.email;
    let referralCode = localStorage.getItem(`referral_code_${affiliateId}`);
    
    if (!referralCode) {
        referralCode = generateReferralCode(affiliateId);
        localStorage.setItem(`referral_code_${affiliateId}`, referralCode);
    }
    
    const baseUrl = window.location.origin;
    linkInput.value = `${baseUrl}/index.html?ref=${referralCode}`;
    
    // Update clicks count
    const clicksKey = `referral_clicks_${referralCode}`;
    const clicks = parseInt(localStorage.getItem(clicksKey) || '0');
    const totalClicksEl = document.getElementById('totalClicks');
    if (totalClicksEl) totalClicksEl.textContent = clicks;
    
    // Calculate conversion rate
    const conversions = affiliateReferrals.filter(r => r.status === 'completed').length;
    const rate = clicks > 0 ? ((conversions / clicks) * 100).toFixed(1) : 0;
    const conversionRateEl = document.getElementById('conversionRate');
    if (conversionRateEl) conversionRateEl.textContent = rate + '%';
    
    // Pending orders
    const pending = affiliateReferrals.filter(r => r.status === 'pending').length;
    const pendingOrdersEl = document.getElementById('pendingOrders');
    if (pendingOrdersEl) pendingOrdersEl.textContent = pending;
}

// Generate referral code
function generateReferralCode(affiliateId) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Copy referral link
function copyReferralLink() {
    const linkInput = document.getElementById('referralLink');
    linkInput.select();
    document.execCommand('copy');
    
    const copyBtn = document.querySelector('.btn-copy');
    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    copyBtn.classList.add('copied');
    
    setTimeout(() => {
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Link';
        copyBtn.classList.remove('copied');
    }, 2000);
}

// ===== STATISTICS & DISPLAY =====

// Update affiliate statistics
function updateAffiliateStats() {
    if (!affiliateEarnings) return;
    
    // Calculate total earnings (all time)
    const totalEarnings = affiliateEarnings
        .filter(e => e.status !== 'withdrawn')
        .reduce((sum, e) => sum + e.amount, 0);
    
    const totalEarningsEl = document.getElementById('totalEarnings');
    if (totalEarningsEl) totalEarningsEl.textContent = '$' + totalEarnings.toFixed(2);
    
    // Calculate available balance (not withdrawn)
    const withdrawn = affiliateEarnings
        .filter(e => e.status === 'withdrawn')
        .reduce((sum, e) => sum + e.amount, 0);
    const pending = affiliateEarnings
        .filter(e => e.status === 'pending')
        .reduce((sum, e) => sum + e.amount, 0);
    const available = totalEarnings - withdrawn - pending;
    
    const walletBalanceEl = document.getElementById('walletBalance');
    if (walletBalanceEl) walletBalanceEl.textContent = '$' + available.toFixed(2);
    
    const availableBalanceEl = document.getElementById('availableBalance');
    if (availableBalanceEl) availableBalanceEl.textContent = '$' + available.toFixed(2);
    
    // Total referrals
    const totalReferralsEl = document.getElementById('totalReferrals');
    if (totalReferralsEl) totalReferralsEl.textContent = affiliateReferrals.length;
    
    // Commission rate
    const commissionRateEl = document.getElementById('commissionRate');
    if (commissionRateEl && affiliateSettings) {
        commissionRateEl.textContent = affiliateSettings.defaultCommission + '%';
    }
    
    // Update withdraw button state
    const withdrawBtn = document.getElementById('withdrawBtn');
    if (withdrawBtn && affiliateSettings) {
        withdrawBtn.disabled = available < affiliateSettings.minWithdrawal;
    }
}

// Display referrals table
function displayReferrals() {
    const tableBody = document.getElementById('referralsTableBody');
    if (!tableBody) return;
    
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
        let statusText = ref.status;
        
        if (ref.status === 'completed') {
            statusClass = 'status-completed';
            statusText = 'Completed';
        } else if (ref.status === 'pending') {
            statusClass = 'status-pending';
            statusText = 'Pending';
        } else if (ref.status === 'cancelled') {
            statusClass = 'status-cancelled';
            statusText = 'Cancelled';
        }
        
        html += `
            <tr>
                <td>${date}</td>
                <td>${ref.customerName || ref.customerEmail || 'Anonymous'}</td>
                <td>${ref.orderId || 'N/A'}</td>
                <td>$${(ref.orderTotal || 0).toFixed(2)}</td>
                <td>$${(ref.commission || 0).toFixed(2)}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Update commission rates display
function updateCommissionRates() {
    if (!affiliateSettings) return;
    
    const defaultRateEl = document.getElementById('defaultRate');
    if (defaultRateEl) defaultRateEl.innerHTML = affiliateSettings.defaultCommission + '<small>%</small>';
    
    if (affiliateSettings.categoryRates) {
        const wigRateEl = document.getElementById('wigRate');
        if (wigRateEl) wigRateEl.innerHTML = (affiliateSettings.categoryRates.wig || 10) + '<small>%</small>';
        
        const skincareRateEl = document.getElementById('skincareRate');
        if (skincareRateEl) skincareRateEl.innerHTML = (affiliateSettings.categoryRates.skincare || 8) + '<small>%</small>';
        
        const makeupRateEl = document.getElementById('makeupRate');
        if (makeupRateEl) makeupRateEl.innerHTML = (affiliateSettings.categoryRates.makeup || 8) + '<small>%</small>';
    }
}

// ===== WITHDRAWAL SYSTEM =====

// Setup payment method handler
function setupPaymentMethodHandler() {
    const paymentSelect = document.getElementById('paymentMethod');
    if (!paymentSelect) return;
    
    paymentSelect.addEventListener('change', function() {
        const detailsDiv = document.getElementById('paymentDetails');
        const method = this.value;
        
        let html = '';
        if (method === 'bank') {
            html = `
                <div style="margin-top: 15px;">
                    <label for="accountName" style="display: block; margin-bottom: 5px; font-weight: 600;">Account Holder Name</label>
                    <input type="text" id="accountName" placeholder="Full name on account" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 5px;">
                    
                    <label for="accountNumber" style="display: block; margin: 10px 0 5px; font-weight: 600;">Account Number</label>
                    <input type="text" id="accountNumber" placeholder="Account number" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 5px;">
                    
                    <label for="bankName" style="display: block; margin: 10px 0 5px; font-weight: 600;">Bank Name</label>
                    <input type="text" id="bankName" placeholder="Bank name" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 5px;">
                </div>
            `;
        } else if (method === 'mpesa') {
            html = `
                <div style="margin-top: 15px;">
                    <label for="mpesaNumber" style="display: block; margin-bottom: 5px; font-weight: 600;">M-Pesa Phone Number</label>
                    <input type="tel" id="mpesaNumber" placeholder="e.g., 0768832415" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 5px;">
                    <p style="font-size: 12px; color: #666; margin-top: 5px;">Enter the phone number registered with M-Pesa</p>
                </div>
            `;
        } else if (method === 'paypal') {
            html = `
                <div style="margin-top: 15px;">
                    <label for="paypalEmail" style="display: block; margin-bottom: 5px; font-weight: 600;">PayPal Email</label>
                    <input type="email" id="paypalEmail" placeholder="Your PayPal email" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 5px;">
                </div>
            `;
        } else if (method === 'store_credit') {
            html = `
                <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
                    <p style="color: #666; margin: 0;">
                        <i class="fas fa-info-circle" style="color: #667eea;"></i> 
                        Store credit will be added to your wallet and can be used for future purchases on our store.
                    </p>
                </div>
            `;
        }
        
        detailsDiv.innerHTML = html;
    });
    
    // Trigger initial change
    setTimeout(() => {
        paymentSelect.dispatchEvent(new Event('change'));
    }, 100);
}

// Request withdrawal
function requestWithdrawal() {
    if (!currentAffiliate) return;
    
    const affiliateId = currentAffiliate.id || currentAffiliate.email;
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const method = document.getElementById('paymentMethod').value;
    
    // Validation
    if (!amount || amount <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }
    
    // Check available balance
    const totalEarnings = affiliateEarnings
        .filter(e => e.status !== 'withdrawn')
        .reduce((sum, e) => sum + e.amount, 0);
    const withdrawn = affiliateEarnings
        .filter(e => e.status === 'withdrawn')
        .reduce((sum, e) => sum + e.amount, 0);
    const pending = affiliateEarnings
        .filter(e => e.status === 'pending')
        .reduce((sum, e) => sum + e.amount, 0);
    const available = totalEarnings - withdrawn - pending;
    
    if (amount > available) {
        showNotification('Insufficient balance', 'error');
        return;
    }
    
    if (amount < affiliateSettings.minWithdrawal) {
        showNotification(`Minimum withdrawal amount is $${affiliateSettings.minWithdrawal}`, 'error');
        return;
    }
    
    // Validate payment details
    let paymentDetails = {};
    let isValid = true;
    
    if (method === 'bank') {
        const accountName = document.getElementById('accountName')?.value;
        const accountNumber = document.getElementById('accountNumber')?.value;
        const bankName = document.getElementById('bankName')?.value;
        
        if (!accountName || !accountNumber || !bankName) {
            showNotification('Please fill in all bank details', 'error');
            isValid = false;
        }
        
        paymentDetails = { accountName, accountNumber, bankName };
    } else if (method === 'mpesa') {
        const mpesaNumber = document.getElementById('mpesaNumber')?.value;
        if (!mpesaNumber) {
            showNotification('Please enter M-Pesa number', 'error');
            isValid = false;
        }
        paymentDetails = { mpesaNumber };
    } else if (method === 'paypal') {
        const paypalEmail = document.getElementById('paypalEmail')?.value;
        if (!paypalEmail) {
            showNotification('Please enter PayPal email', 'error');
            isValid = false;
        }
        paymentDetails = { paypalEmail };
    }
    
    if (!isValid) return;
    
    // Create withdrawal request
    const withdrawal = {
        id: 'WTH-' + Date.now(),
        affiliateId: affiliateId,
        amount: amount,
        method: method,
        paymentDetails: paymentDetails,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        affiliateName: currentAffiliate.username,
        affiliateEmail: currentAffiliate.email
    };
    
    // Add to withdrawals
    affiliateWithdrawals.push(withdrawal);
    const withdrawalsKey = `affiliate_withdrawals_${affiliateId}`;
    localStorage.setItem(withdrawalsKey, JSON.stringify(affiliateWithdrawals));
    
    // Mark earnings as withdrawn (simplified - mark oldest earnings first)
    let remainingToWithdraw = amount;
    const updatedEarnings = [];
    
    for (let i = 0; i < affiliateEarnings.length; i++) {
        const earning = affiliateEarnings[i];
        
        if (earning.status === 'available' && remainingToWithdraw > 0) {
            if (earning.amount <= remainingToWithdraw) {
                // Take full earning
                remainingToWithdraw -= earning.amount;
                updatedEarnings.push({ 
                    ...earning, 
                    status: 'withdrawn', 
                    withdrawnAt: new Date().toISOString(),
                    withdrawalId: withdrawal.id
                });
            } else {
                // Split the earning
                updatedEarnings.push({ 
                    ...earning, 
                    amount: remainingToWithdraw,
                    status: 'withdrawn', 
                    withdrawnAt: new Date().toISOString(),
                    withdrawalId: withdrawal.id
                });
                
                // Keep the remainder
                updatedEarnings.push({
                    ...earning,
                    id: earning.id + '-remain',
                    amount: earning.amount - remainingToWithdraw,
                    status: 'available'
                });
                
                remainingToWithdraw = 0;
            }
        } else {
            updatedEarnings.push(earning);
        }
    }
    
    affiliateEarnings = updatedEarnings;
    const earningsKey = `affiliate_earnings_${affiliateId}`;
    localStorage.setItem(earningsKey, JSON.stringify(affiliateEarnings));
    
    // Save to admin notifications
    saveWithdrawalToAdmin(withdrawal);
    
    // Show success
    showNotification('✅ Withdrawal request submitted successfully!', 'success');
    
    // Clear form
    document.getElementById('withdrawAmount').value = '';
    
    // Update stats and history
    updateAffiliateStats();
    displayWithdrawalHistory();
}

// Save withdrawal to admin
function saveWithdrawalToAdmin(withdrawal) {
    const adminWithdrawalsKey = 'admin_withdrawal_requests';
    const adminWithdrawals = JSON.parse(localStorage.getItem(adminWithdrawalsKey) || '[]');
    adminWithdrawals.push(withdrawal);
    localStorage.setItem(adminWithdrawalsKey, JSON.stringify(adminWithdrawals));
    
    // Create notification for admin
    const notificationsKey = 'adminNotifications';
    const notifications = JSON.parse(localStorage.getItem(notificationsKey) || '[]');
    notifications.push({
        id: 'NOTIF-' + Date.now(),
        type: 'withdrawal_request',
        amount: withdrawal.amount,
        affiliate: withdrawal.affiliateName,
        affiliateEmail: withdrawal.affiliateEmail,
        requestedAt: withdrawal.requestedAt,
        read: false
    });
    localStorage.setItem(notificationsKey, JSON.stringify(notifications));
}

// Display withdrawal history
function displayWithdrawalHistory() {
    const tableBody = document.getElementById('withdrawalHistoryBody');
    if (!tableBody) return;
    
    if (affiliateWithdrawals.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-table">No withdrawal history</td>
            </tr>
        `;
        return;
    }
    
    // Sort by date (newest first)
    affiliateWithdrawals.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
    
    let html = '';
    affiliateWithdrawals.forEach(w => {
        const date = new Date(w.requestedAt).toLocaleDateString();
        let statusClass = 'status-pending';
        let statusText = 'Pending';
        
        if (w.status === 'approved') {
            statusClass = 'status-approved';
            statusText = 'Approved';
        } else if (w.status === 'rejected') {
            statusClass = 'status-rejected';
            statusText = 'Rejected';
        } else if (w.status === 'completed') {
            statusClass = 'status-completed';
            statusText = 'Completed';
        }
        
        html += `
            <tr>
                <td>${date}</td>
                <td><strong>$${w.amount.toFixed(2)}</strong></td>
                <td>${w.method.replace('_', ' ')}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// ===== TAB NAVIGATION =====
function showAffiliateTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.affiliate-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.affiliate-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabId + 'Tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Activate button
    const activeBtn = document.querySelector(`.affiliate-tab[onclick*="${tabId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Refresh data if needed
    if (tabId === 'withdraw') {
        updateAffiliateStats();
    }
}

// ===== NOTIFICATION =====
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// ===== LOGOUT =====
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('affiliateToken');
        localStorage.removeItem('affiliateUser');
        localStorage.removeItem('clientToken');
        localStorage.removeItem('clientUser');
        window.location.href = 'index.html';
    }
}

// Keep old function for backward compatibility
function logoutAffiliate() {
    logout();
}

// Add slide animation
const style = document.createElement('style');
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
`;
document.head.appendChild(style);