// affiliate-admin.js - Admin Affiliate Management with Gift Cards

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadAffiliateAdminData();
});

// Load affiliate admin data
function loadAffiliateAdminData() {
    // Load settings
    const settings = JSON.parse(localStorage.getItem('affiliateSettings') || '{}');
    if (settings.defaultCommission) {
        document.getElementById('defaultRate').value = settings.defaultCommission;
        document.getElementById('wigRate').value = settings.categoryRates?.wig || 12;
        document.getElementById('skincareRate').value = settings.categoryRates?.skincare || 8;
        document.getElementById('haircareRate').value = settings.categoryRates?.haircare || 8;
        document.getElementById('fragranceRate').value = settings.categoryRates?.fragrance || 10;
        document.getElementById('makeupRate').value = settings.categoryRates?.makeup || 8;
        document.getElementById('welcomeBonus').value = settings.welcomeBonus || 5;
    }
    
    // Load affiliates list
    loadAffiliatesList();
    
    // Load gift cards
    loadGiftCards();
    
    // Update stats
    updateAffiliateStats();
}

// Load affiliates list
function loadAffiliatesList() {
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    const tableBody = document.getElementById('affiliatesListBody');
    
    if (!tableBody) return;
    
    // Find clients who have affiliate data
    const affiliates = [];
    
    clients.forEach(client => {
        const affiliateId = client.id || client.email;
        const earningsKey = `affiliate_earnings_${affiliateId}`;
        const referralsKey = `affiliate_referrals_${affiliateId}`;
        
        const earnings = JSON.parse(localStorage.getItem(earningsKey) || '[]');
        const referrals = JSON.parse(localStorage.getItem(referralsKey) || '[]');
        
        const totalEarnings = earnings
            .filter(e => e.status !== 'used')
            .reduce((sum, e) => sum + e.amount, 0);
        const used = earnings
            .filter(e => e.status === 'used')
            .reduce((sum, e) => sum + e.amount, 0);
        const balance = totalEarnings - used;
        
        if (earnings.length > 0 || referrals.length > 0) {
            affiliates.push({
                name: client.username,
                email: client.email,
                joined: client.createdAt,
                referrals: referrals.length,
                earnings: totalEarnings,
                balance: balance
            });
        }
    });
    
    document.getElementById('totalAffiliates').textContent = affiliates.length;
    
    if (affiliates.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="empty-table">No affiliates yet</td></tr>';
        return;
    }
    
    let html = '';
    affiliates.forEach(aff => {
        const joined = new Date(aff.joined).toLocaleDateString();
        html += `
            <tr>
                <td><strong>${aff.name}</strong></td>
                <td>${aff.email}</td>
                <td>${joined}</td>
                <td>${aff.referrals}</td>
                <td>$${aff.earnings.toFixed(2)}</td>
                <td>$${aff.balance.toFixed(2)}</td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}
// Load all affiliates with their referral stats - FIXED VERSION
function loadAllAffiliatesWithReferrals() {
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    const tableBody = document.getElementById('affiliatesListBody');
    
    if (!tableBody) return;
    
    const affiliates = [];
    
    clients.forEach(client => {
        const affiliateId = client.id || client.email;
        const earningsKey = `affiliate_earnings_${affiliateId}`;
        const referralsKey = `affiliate_referrals_${affiliateId}`;
        
        const earnings = JSON.parse(localStorage.getItem(earningsKey) || '[]');
        const referrals = JSON.parse(localStorage.getItem(referralsKey) || '[]');
        
        const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
        const availableEarnings = earnings
            .filter(e => e.status === 'available')
            .reduce((sum, e) => sum + e.amount, 0);
        
        // Get referral code
        let referralCode = localStorage.getItem(`referral_code_${affiliateId}`);
        if (!referralCode && client.referralCode) {
            referralCode = client.referralCode;
        }
        
        // Only include clients that have affiliate data OR are potential affiliates
        // This ensures we see all clients in admin view
        affiliates.push({
            id: client.id,
            name: client.username,
            email: client.email,
            joined: client.createdAt,
            referralCode: referralCode || 'No code',
            referrals: referrals.length,
            pendingReferrals: referrals.filter(r => r.status === 'pending').length,
            completedReferrals: referrals.filter(r => r.status === 'completed').length,
            earnings: totalEarnings,
            availableBalance: availableEarnings,
            hasAffiliateData: earnings.length > 0 || referrals.length > 0
        });
    });
    
    // Sort: Show affiliates with data first, then others
    affiliates.sort((a, b) => {
        if (a.hasAffiliateData && !b.hasAffiliateData) return -1;
        if (!a.hasAffiliateData && b.hasAffiliateData) return 1;
        return b.referrals - a.referrals;
    });
    
    if (affiliates.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="empty-table">No affiliates yet</td></tr>';
        return;
    }
    
    let html = '';
    affiliates.forEach(aff => {
        const joined = new Date(aff.joined).toLocaleDateString();
        const hasDataBadge = aff.hasAffiliateData ? 
            '<span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-left: 5px;">Active</span>' : 
            '<span style="background: #6c757d; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-left: 5px;">Inactive</span>';
        
        html += `
            <tr>
                <td><strong>${aff.name}</strong> ${hasDataBadge}</td>
                <td>${aff.email}</td>
                <td><code style="background: #f8f9fa; padding: 3px 8px; border-radius: 4px;">${aff.referralCode}</code></td>
                <td>${joined}</td>
                <td>
                    Total: ${aff.referrals}<br>
                    <small style="color: #666;">Pending: ${aff.pendingReferrals} | Completed: ${aff.completedReferrals}</small>
                </td>
                <td>$${aff.earnings.toFixed(2)}</td>
                <td>$${aff.availableBalance.toFixed(2)}</td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
    
    // Update total affiliates count
    document.getElementById('totalAffiliates').textContent = affiliates.length;
}
// Function to ensure all clients have referral codes
function ensureAllClientsHaveReferralCodes() {
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    let updated = false;
    
    clients.forEach(client => {
        const affiliateId = client.id || client.email;
        const existingCode = localStorage.getItem(`referral_code_${affiliateId}`);
        
        if (!existingCode) {
            // Generate new referral code
            const username = client.username.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            const referralCode = username + randomNum;
            
            localStorage.setItem(`referral_code_${affiliateId}`, referralCode);
            console.log(`✅ Generated referral code for ${client.username}: ${referralCode}`);
            updated = true;
        }
    });
    
    if (updated) {
        console.log('All clients now have referral codes');
    }
}

// Call this when page loads
document.addEventListener('DOMContentLoaded', function() {
    ensureAllClientsHaveReferralCodes();
    loadAffiliateAdminData();
    loadAllAffiliatesWithReferrals();
});

// Load gift cards
function loadGiftCards() {
    const giftCards = JSON.parse(localStorage.getItem('admin_gift_cards') || '[]');
    const tableBody = document.getElementById('giftCardsTableBody');
    
    if (!tableBody) return;
    
    // Update stats
    const activeCount = giftCards.filter(card => card.status === 'active').length;
    document.getElementById('activeGiftCards').textContent = activeCount;
    
    if (giftCards.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="empty-table">No gift cards generated yet</td></tr>';
        return;
    }
    
    let html = '';
    giftCards.forEach(card => {
        const created = new Date(card.createdAt).toLocaleDateString();
        let redeemedBy = card.redeemedBy || '-';
        if (card.redeemedBy) {
            // Try to get username
            const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
            const client = clients.find(c => (c.id || c.email) == card.redeemedBy);
            redeemedBy = client ? client.username : card.redeemedBy;
        }
        
        html += `
            <tr>
                <td><code style="background: #f8f9fa; padding: 5px 10px; border-radius: 4px; font-size: 16px; font-weight: bold;">${card.code}</code></td>
                <td><strong>$${card.amount.toFixed(2)}</strong></td>
                <td>${card.description || '-'}</td>
                <td>${created}</td>
                <td>
                    <span class="status-badge ${card.status === 'active' ? 'status-pending' : 'status-completed'}">
                        ${card.status === 'active' ? 'Active' : 'Used'}
                    </span>
                </td>
                <td>${redeemedBy}</td>
                <td>
                    ${card.status === 'active' ? `
                        <button class="btn-approve" onclick="disableGiftCard('${card.code}')" style="background: #dc3545;">
                            <i class="fas fa-ban"></i> Disable
                        </button>
                    ` : '-'}
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Generate gift card
function generateGiftCard() {
    const amount = parseFloat(document.getElementById('giftCardAmount').value);
    const description = document.getElementById('giftCardDescription').value.trim();
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    const giftCards = JSON.parse(localStorage.getItem('admin_gift_cards') || '[]');
    
    const newCard = {
        code: code,
        amount: amount,
        description: description,
        createdAt: new Date().toISOString(),
        status: 'active',
        createdBy: document.getElementById('adminName')?.textContent || 'Admin'
    };
    
    giftCards.push(newCard);
    localStorage.setItem('admin_gift_cards', JSON.stringify(giftCards));
    
    // Show the code to admin
    alert(`✅ Gift card generated!\n\nCode: ${code}\nAmount: $${amount.toFixed(2)}\n\nShare this code with the affiliate.`);
    
    // Clear form
    document.getElementById('giftCardAmount').value = '';
    document.getElementById('giftCardDescription').value = '';
    
    // Reload gift cards
    loadGiftCards();
}

// Disable gift card
function disableGiftCard(code) {
    if (!confirm(`Disable gift card ${code}? This will prevent it from being redeemed.`)) {
        return;
    }
    
    const giftCards = JSON.parse(localStorage.getItem('admin_gift_cards') || '[]');
    const cardIndex = giftCards.findIndex(c => c.code === code);
    
    if (cardIndex !== -1) {
        giftCards[cardIndex].status = 'disabled';
        localStorage.setItem('admin_gift_cards', JSON.stringify(giftCards));
        loadGiftCards();
        showAdminNotification('✅ Gift card disabled', 'success');
    }
}

// Update affiliate stats
function updateAffiliateStats() {
    let totalCommissions = 0;
    let monthlyCommissions = 0;
    
    // Calculate totals from all affiliates
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    clients.forEach(client => {
        const affiliateId = client.id || client.email;
        const earningsKey = `affiliate_earnings_${affiliateId}`;
        const earnings = JSON.parse(localStorage.getItem(earningsKey) || '[]');
        
        earnings.forEach(e => {
            if (e.status !== 'used') {
                totalCommissions += e.amount;
            }
            
            const earnDate = new Date(e.date);
            if (earnDate >= startOfMonth) {
                monthlyCommissions += e.amount;
            }
        });
    });
    
    document.getElementById('totalCommissions').textContent = '$' + totalCommissions.toFixed(2);
    document.getElementById('monthlyCommissions').textContent = '$' + monthlyCommissions.toFixed(2);
}

// Save commission rates
function saveCommissionRates() {
    const settings = {
        defaultCommission: parseFloat(document.getElementById('defaultRate').value),
        categoryRates: {
            wig: parseFloat(document.getElementById('wigRate').value),
            skincare: parseFloat(document.getElementById('skincareRate').value),
            haircare: parseFloat(document.getElementById('haircareRate').value),
            fragrance: parseFloat(document.getElementById('fragranceRate').value),
            makeup: parseFloat(document.getElementById('makeupRate').value)
        },
        welcomeBonus: parseFloat(document.getElementById('welcomeBonus').value),
        cookieDuration: 30,
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('affiliateSettings', JSON.stringify(settings));
    showAdminNotification('✅ Commission rates saved successfully!', 'success');
}

// Admin notification
function showAdminNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#17a2b8'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}