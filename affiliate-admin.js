// affiliate-admin.js - Admin Affiliate Management - FIXED

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    ensureAllClientsHaveReferralCodes();
    loadAffiliateAdminData();
    loadAllAffiliatesWithReferrals();
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

// Ensure all clients have referral codes
function ensureAllClientsHaveReferralCodes() {
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    let updated = false;
    
    clients.forEach(client => {
        const affiliateId = client.email || client.id;
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

// Replace the entire loadAffiliatesList function in affiliate-admin.js
function loadAffiliatesList() {
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    const tableBody = document.getElementById('affiliatesListBody');
    
    if (!tableBody) return;
    
    const affiliates = [];
    
    clients.forEach(client => {
        const affiliateId = client.email;
        
        // Get affiliate data
        const earningsKey = `affiliate_earnings_${affiliateId}`;
        const referralsKey = `affiliate_referrals_${affiliateId}`;
        
        const earnings = JSON.parse(localStorage.getItem(earningsKey) || '[]');
        const referrals = JSON.parse(localStorage.getItem(referralsKey) || '[]');
        
        const totalEarnings = earnings
            .filter(e => e.status !== 'used' && e.status !== 'cancelled')
            .reduce((sum, e) => sum + e.amount, 0);
        
        const usedEarnings = earnings
            .filter(e => e.status === 'used')
            .reduce((sum, e) => sum + e.amount, 0);
        
        const cancelledEarnings = earnings
            .filter(e => e.status === 'cancelled')
            .reduce((sum, e) => sum + e.amount, 0);
        
        const balance = totalEarnings - usedEarnings;
        
        // Get referral code
        let referralCode = localStorage.getItem(`referral_code_${affiliateId}`);
        
        // ===== FIND WHO REFERRED THIS AFFILIATE =====
        let referredByInfo = 'None';
        
        // Method 1: Check if client has referredBy property
        if (client.referredBy) {
            const referrer = clients.find(c => c.email === client.referredBy);
            if (referrer) {
                referredByInfo = `${referrer.username} (${referrer.email})`;
            }
        }
        
        // Method 2: Check referredByCode
        if (referredByInfo === 'None' && client.referredByCode) {
            // Find who owns this code
            for (const potentialReferrer of clients) {
                const storedCode = localStorage.getItem(`referral_code_${potentialReferrer.email}`);
                if (storedCode === client.referredByCode) {
                    referredByInfo = `${potentialReferrer.username} (${potentialReferrer.email})`;
                    break;
                }
            }
        }
        
        // Method 3: Check if this client appears in anyone's referrals
        if (referredByInfo === 'None') {
            for (const potentialReferrer of clients) {
                const refKey = `affiliate_referrals_${potentialReferrer.email}`;
                const refData = JSON.parse(localStorage.getItem(refKey) || '[]');
                
                const found = refData.find(r => 
                    r.referredEmail === client.email
                );
                
                if (found) {
                    referredByInfo = `${potentialReferrer.username} (${potentialReferrer.email})`;
                    break;
                }
            }
        }
        
        affiliates.push({
            id: client.id,
            name: client.username,
            email: client.email,
            joined: client.createdAt,
            referredBy: referredByInfo,
            referralCode: referralCode || 'No code',
            referrals: referrals.length,
            pendingReferrals: referrals.filter(r => r.status === 'pending').length,
            completedReferrals: referrals.filter(r => r.status === 'completed').length,
            cancelledReferrals: referrals.filter(r => r.status === 'cancelled').length,
            earnings: totalEarnings,
            balance: balance,
            cancelledEarnings: cancelledEarnings,
            hasActivity: earnings.length > 0 || referrals.length > 0
        });
    });
    
    // Sort by referrals (most active first)
    affiliates.sort((a, b) => b.referrals - a.referrals);
    
    document.getElementById('totalAffiliates').textContent = affiliates.length;
    
    if (affiliates.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="empty-table">No affiliates yet</td></tr>';
        return;
    }
    
    let html = '';
    affiliates.forEach(aff => {
        const joined = aff.joined ? new Date(aff.joined).toLocaleDateString() : 'N/A';
        const badge = aff.hasActivity ? 
            '<span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">Active</span>' : 
            '<span style="background: #6c757d; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">Inactive</span>';
        
        html += `
            <tr>
                <td><strong>${aff.name}</strong> ${badge}</td>
                <td>${aff.email}</td>
                <td><code style="background: #f1f3f5; padding: 3px 8px; border-radius: 4px;">${aff.referralCode}</code></td>
                <td><span style="color: #${aff.referredBy === 'None' ? '6c757d' : '28a745'};">${aff.referredBy}</span></td>
                <td>${joined}</td>
                <td>
                    <strong>${aff.referrals}</strong> total<br>
                    <small style="color: #666;">
                        Pending: ${aff.pendingReferrals} | 
                        Completed: ${aff.completedReferrals} | 
                        <span style="color: #dc3545;">Cancelled: ${aff.cancelledReferrals}</span>
                    </small>
                </td>
                <td>$${aff.earnings.toFixed(2)}</td>
                <td>$${aff.balance.toFixed(2)}</td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}
// Load all affiliates with their referral stats
function loadAllAffiliatesWithReferrals() {
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    const tableBody = document.getElementById('affiliatesListBody');
    
    if (!tableBody) return;
    
    const affiliates = [];
    
    clients.forEach(client => {
        const affiliateId = client.email || client.id;
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
        
        // Get referral code
        let referralCode = localStorage.getItem(`referral_code_${affiliateId}`);
        
        // Find who referred this client
        let referredByInfo = 'None';
        
        // Check if this client was referred by someone
        if (client.referredByCode) {
            // Find the referrer
            for (const potentialReferrer of clients) {
                const refId = potentialReferrer.email || potentialReferrer.id;
                const storedCode = localStorage.getItem(`referral_code_${refId}`);
                
                if (storedCode === client.referredByCode) {
                    referredByInfo = `${potentialReferrer.username} (${potentialReferrer.email})`;
                    break;
                }
            }
        }
        
        // Also check in referrals data
        if (referredByInfo === 'None') {
            for (const potentialReferrer of clients) {
                const refId = potentialReferrer.email || potentialReferrer.id;
                const refKey = `affiliate_referrals_${refId}`;
                const refData = JSON.parse(localStorage.getItem(refKey) || '[]');
                
                const foundRef = refData.find(r => 
                    r.referredEmail === client.email
                );
                
                if (foundRef) {
                    referredByInfo = `${potentialReferrer.username} (${potentialReferrer.email})`;
                    break;
                }
            }
        }
        
        affiliates.push({
            id: client.id,
            name: client.username,
            email: client.email,
            joined: client.createdAt,
            referredBy: referredByInfo,
            referralCode: referralCode || 'No code',
            referrals: referrals.length,
            pendingReferrals: referrals.filter(r => r.status === 'pending').length,
            completedReferrals: referrals.filter(r => r.status === 'completed').length,
            earnings: totalEarnings,
            availableBalance: balance,
            hasAffiliateData: earnings.length > 0 || referrals.length > 0
        });
    });
    
    // Sort by referrals count
    affiliates.sort((a, b) => b.referrals - a.referrals);
    
    document.getElementById('totalAffiliates').textContent = affiliates.length;
    
    if (affiliates.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="empty-table">No affiliates yet</td></tr>';
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
                <td><small style="color: #666;">${aff.referredBy}</small></td>
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
}

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
            const client = clients.find(c => (c.email || c.id) == card.redeemedBy);
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
        const affiliateId = client.email || client.id;
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

// Fixed: Archive gift card (removes from list but preserves status)
function archiveGiftCard(code) {
    if (!confirm(`Archive gift card ${code}? It will be removed from the active list.`)) {
        return;
    }
    
    const giftCards = JSON.parse(localStorage.getItem('admin_gift_cards') || '[]');
    const cardIndex = giftCards.findIndex(c => c.code === code);
    
    if (cardIndex !== -1) {
        // Store the ORIGINAL status before archiving
        const originalStatus = giftCards[cardIndex].status;
        
        // Add archive info but KEEP original status in a separate field
        giftCards[cardIndex].archived = true;
        giftCards[cardIndex].archivedAt = new Date().toISOString();
        giftCards[cardIndex].archivedBy = document.getElementById('adminName')?.textContent || 'Admin';
        giftCards[cardIndex].originalStatus = originalStatus; // Save original status
        giftCards[cardIndex].status = 'archived'; // Change current status to archived
        
        localStorage.setItem('admin_gift_cards', JSON.stringify(giftCards));

// Check current view and refresh accordingly
const filterDropdown = document.getElementById('giftCardFilter');
if (filterDropdown && filterDropdown.value === 'archived') {
    viewArchivedGiftCards(); // Stay in archived view
} else {
    loadGiftCards(); // Refresh main view
}

showAdminNotification('✅ Gift card archived', 'success');
    }
}

// Fixed: View archived cards showing original status
// Fixed: View archived cards with proper display and filter integration
function viewArchivedGiftCards() {
    const giftCards = JSON.parse(localStorage.getItem('admin_gift_cards') || '[]');
    const tableBody = document.getElementById('giftCardsTableBody');
    
    // Set the filter dropdown to 'archived'
    const filterDropdown = document.getElementById('giftCardFilter');
    if (filterDropdown) {
        filterDropdown.value = 'archived';
    }
    
    const archivedCards = giftCards.filter(card => card.status === 'archived');
    
    if (archivedCards.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="empty-table">No archived gift cards found</td></tr>';
        return;
    }
    
    // Sort by most recently archived first
    archivedCards.sort((a, b) => new Date(b.archivedAt || b.createdAt) - new Date(a.archivedAt || a.createdAt));
    
    let html = '';
    archivedCards.forEach(card => {
        const created = new Date(card.createdAt).toLocaleDateString() + ' ' + new Date(card.createdAt).toLocaleTimeString();
        const archived = card.archivedAt ? new Date(card.archivedAt).toLocaleDateString() : 'Unknown';
        
        // Get created by info
        const createdBy = card.createdBy || 'Admin';
        
        // Determine original status for display
        const originalStatus = card.originalStatus || card.status;
        let originalStatusBadge = '';
        
        if (originalStatus === 'active') {
            originalStatusBadge = '<span class="status-badge status-pending" style="opacity: 0.7; margin-top: 5px; display: inline-block;">Was: Active</span>';
        } else if (originalStatus === 'used') {
            originalStatusBadge = '<span class="status-badge status-completed" style="opacity: 0.7; margin-top: 5px; display: inline-block;">Was: Used</span>';
        } else {
            originalStatusBadge = `<span class="status-badge" style="background: #6c757d; opacity: 0.7; margin-top: 5px; display: inline-block;">Was: ${originalStatus}</span>`;
        }
        
        // Show redemption info if it was used
        let redeemedInfo = '-';
        if (card.redeemedBy) {
            const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
            const client = clients.find(c => (c.email || c.id) == card.redeemedBy);
            redeemedInfo = client ? `${client.username} (${card.redeemedBy})` : card.redeemedBy;
            
            if (card.redeemedAt) {
                redeemedInfo += `<br><small>${new Date(card.redeemedAt).toLocaleDateString()}</small>`;
            }
        }
        
        // Who archived it
        const archivedBy = card.archivedBy || 'Unknown';
        
        html += `
            <tr>
                <td><code class="gift-card-code">${card.code}</code></td>
                <td><strong>$${card.amount.toFixed(2)}</strong></td>
                <td>${card.description || '-'}</td>
                <td>${created}<br><small>by ${createdBy}</small></td>
                <td>
                    <span class="status-badge" style="background: #6c757d; color: white;">Archived</span>
                    <br><small style="color: #666;">${archived} by ${archivedBy}</small>
                    ${originalStatusBadge}
                </td>
                <td>${redeemedInfo}</td>
                <td>
                    <button class="btn-approve" onclick="unarchiveGiftCard('${card.code}')" style="background: #28a745;">
                        <i class="fas fa-undo"></i> Restore
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Also add this helper function to reset to all cards
function viewAllGiftCards() {
    const filterDropdown = document.getElementById('giftCardFilter');
    if (filterDropdown) {
        filterDropdown.value = 'all';
    }
    filterGiftCards();
}

// FIXED: Restore to ORIGINAL status, not always 'active'
function unarchiveGiftCard(code) {
    if (!confirm(`Restore gift card ${code} to the list?`)) {
        return;
    }
    
    const giftCards = JSON.parse(localStorage.getItem('admin_gift_cards') || '[]');
    const cardIndex = giftCards.findIndex(c => c.code === code);
    
    if (cardIndex !== -1) {
        // Restore to original status (active OR used)
        const originalStatus = giftCards[cardIndex].originalStatus || 'active';
        
        // Remove archive properties
        delete giftCards[cardIndex].archived;
        delete giftCards[cardIndex].archivedAt;
        delete giftCards[cardIndex].archivedBy;
        delete giftCards[cardIndex].originalStatus;
        
        // Set status back to original
        giftCards[cardIndex].status = originalStatus;
        
       localStorage.setItem('admin_gift_cards', JSON.stringify(giftCards));

// Show appropriate message
if (originalStatus === 'used') {
    showAdminNotification('⚠️ Gift card restored - but it was already USED', 'warning');
} else {
    showAdminNotification('✅ Gift card restored to active list', 'success');
}

// Check current view and refresh accordingly
const filterDropdown = document.getElementById('giftCardFilter');
if (filterDropdown && filterDropdown.value === 'archived') {
    viewArchivedGiftCards(); // Stay in archived view
} else {
    loadGiftCards(); // Go back to main view
}
    }
}

// Also fix the loadGiftCards function to handle used cards properly
function loadGiftCards() {
    const giftCards = JSON.parse(localStorage.getItem('admin_gift_cards') || '[]');
    const tableBody = document.getElementById('giftCardsTableBody');
    
    if (!tableBody) return;
    
    // Show active AND used cards (but not archived)
    const visibleCards = giftCards.filter(card => card.status !== 'archived');
    
    // Update stats - only count truly active cards
    const activeCount = giftCards.filter(card => card.status === 'active').length;
    document.getElementById('activeGiftCards').textContent = activeCount;
    
    if (visibleCards.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="7" class="empty-table">No gift cards found</td></tr>';
    return;
}
    
    // Sort by most recent first
    visibleCards.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    let html = '';
    visibleCards.forEach(card => {
        const created = new Date(card.createdAt).toLocaleDateString() + ' ' + new Date(card.createdAt).toLocaleTimeString();
        let redeemedInfo = '-';
        
        if (card.redeemedBy) {
            const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
            const client = clients.find(c => (c.email || c.id) == card.redeemedBy);
            redeemedInfo = client ? `${client.username} (${card.redeemedBy})` : card.redeemedBy;
            
            if (card.redeemedAt) {
                redeemedInfo += `<br><small>${new Date(card.redeemedAt).toLocaleDateString()}</small>`;
            }
        }
        
        const createdBy = card.createdBy || 'Admin';
        
        // Status badge
        let statusBadge = '';
        let actionButtons = '-';
        
        if (card.status === 'active') {
            statusBadge = '<span class="status-badge status-pending">Active</span>';
            actionButtons = `
                <button class="btn-approve" onclick="archiveGiftCard('${card.code}')" style="background: #6c757d;" title="Archive">
                    <i class="fas fa-archive"></i> Archive
                </button>
            `;
        } else if (card.status === 'used') {
            statusBadge = '<span class="status-badge status-completed">Used</span>';
            actionButtons = `
                <button class="btn-approve" onclick="archiveGiftCard('${card.code}')" style="background: #6c757d;" title="Archive">
                    <i class="fas fa-archive"></i> Archive
                </button>
            `;
        }
        
        html += `
            <tr>
                <td><code class="gift-card-code">${card.code}</code></td>
                <td><strong>$${card.amount.toFixed(2)}</strong></td>
                <td>${card.description || '-'}</td>
                <td>${created}<br><small>by ${createdBy}</small></td>
                <td>${statusBadge}</td>
                <td>${redeemedInfo}</td>
                <td>${actionButtons}</td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Filter gift cards
function filterGiftCards() {
    const filter = document.getElementById('giftCardFilter').value;
    const giftCards = JSON.parse(localStorage.getItem('admin_gift_cards') || '[]');
    const tableBody = document.getElementById('giftCardsTableBody');
    
    let filteredCards = giftCards;
    
    // Apply filter
if (filter !== 'all') {
    filteredCards = giftCards.filter(card => card.status === filter);
} else {
    // For "all", still hide archived cards by default
    filteredCards = giftCards.filter(card => card.status !== 'archived');
}
    
    // Sort by most recent first
    filteredCards.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (filteredCards.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="empty-table">No ${filter} gift cards found</td></tr>`;
        return;
    }
    
    // Render the filtered cards
    let html = '';
    filteredCards.forEach(card => {
        const created = new Date(card.createdAt).toLocaleDateString() + ' ' + new Date(card.createdAt).toLocaleTimeString();
        let redeemedInfo = '-';
        
        if (card.redeemedBy) {
            const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
            const client = clients.find(c => (c.email || c.id) == card.redeemedBy);
            redeemedInfo = client ? `${client.username} (${card.redeemedBy})` : card.redeemedBy;
            
            if (card.redeemedAt) {
                redeemedInfo += `<br><small>${new Date(card.redeemedAt).toLocaleDateString()}</small>`;
            }
        }
        
        const createdBy = card.createdBy || 'Admin';
        
        // Status badge based on card status
        let statusBadge = '';
        let actionButtons = '-';
        
        if (card.status === 'active') {
            statusBadge = '<span class="status-badge status-pending">Active</span>';
            actionButtons = `
                <button class="btn-approve" onclick="archiveGiftCard('${card.code}')" style="background: #6c757d;" title="Archive">
                    <i class="fas fa-archive"></i> Archive
                </button>
            `;
        } else if (card.status === 'used') {
            statusBadge = '<span class="status-badge status-completed">Used</span>';
            actionButtons = `
                <button class="btn-approve" onclick="archiveGiftCard('${card.code}')" style="background: #6c757d;" title="Archive">
                    <i class="fas fa-archive"></i> Archive
                </button>
            `;
        } else if (card.status === 'archived') {
            statusBadge = '<span class="status-badge" style="background: #6c757d; color: white;">Archived</span>';
            actionButtons = `
                <button class="btn-approve" onclick="unarchiveGiftCard('${card.code}')" style="background: #28a745;">
                    <i class="fas fa-undo"></i> Restore
                </button>
            `;
        } else if (card.status === 'disabled') {
            statusBadge = '<span class="status-badge" style="background: #dc3545; color: white;">Disabled</span>';
            actionButtons = '-';
        }
        
        html += `
            <tr>
                <td><code class="gift-card-code">${card.code}</code></td>
                <td><strong>$${card.amount.toFixed(2)}</strong></td>
                <td>${card.description || '-'}</td>
                <td>${created}<br><small>by ${createdBy}</small></td>
                <td>${statusBadge}</td>
                <td>${redeemedInfo}</td>
                <td>${actionButtons}</td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Also fix the loadGiftCards function to use the same rendering logic
function loadGiftCards() {
    // Reset filter dropdown to "all" when loading
    const filterDropdown = document.getElementById('giftCardFilter');
    if (filterDropdown) {
        filterDropdown.value = 'all';
    }
    
    // Call filter function with "all"
    filterGiftCards();
    
    // Update stats
    const giftCards = JSON.parse(localStorage.getItem('admin_gift_cards') || '[]');
    const activeCount = giftCards.filter(card => card.status === 'active').length;
    document.getElementById('activeGiftCards').textContent = activeCount;
}

// Modified generateGiftCard with admin tracking
function generateGiftCard() {
    const amount = parseFloat(document.getElementById('giftCardAmount').value);
    const description = document.getElementById('giftCardDescription').value.trim();
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    // Get current admin info
    const adminName = document.getElementById('adminName')?.textContent || 'Admin';
    const adminEmail = localStorage.getItem('adminEmail') || 'admin@wighub.com';
    
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    const giftCards = JSON.parse(localStorage.getItem('admin_gift_cards') || '[]');
    
    const newCard = {
        code: code,
        amount: amount,
        description: description,
        createdAt: new Date().toISOString(),
        status: 'active',
        createdBy: adminName,
        createdByEmail: adminEmail,
        auditTrail: [{
            action: 'created',
            by: adminName,
            at: new Date().toISOString()
        }]
    };
    
    giftCards.push(newCard);
    localStorage.setItem('admin_gift_cards', JSON.stringify(giftCards));
    
    // Log to admin activity log
    logAdminActivity('GIFT_CARD_GENERATED', {
        code: code,
        amount: amount,
        description: description
    });
    
    // Show the code to admin
    alert(`✅ Gift card generated!\n\nCode: ${code}\nAmount: $${amount.toFixed(2)}\n\nShare this code with the affiliate.`);
    
    // Clear form
    document.getElementById('giftCardAmount').value = '';
    document.getElementById('giftCardDescription').value = '';
    
    // Reload gift cards
    loadGiftCards();
}

// Admin activity logging
function logAdminActivity(action, details) {
    const logs = JSON.parse(localStorage.getItem('admin_activity_logs') || '[]');
    logs.push({
        timestamp: new Date().toISOString(),
        admin: document.getElementById('adminName')?.textContent || 'Admin',
        action: action,
        details: details
    });
    
    // Keep only last 1000 logs
    if (logs.length > 1000) logs.shift();
    localStorage.setItem('admin_activity_logs', JSON.stringify(logs));
}
// Auto-archive gift cards older than 90 days
function autoArchiveOldGiftCards() {
    const giftCards = JSON.parse(localStorage.getItem('admin_gift_cards') || '[]');
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    let updated = false;
    
    giftCards.forEach(card => {
        if (card.status === 'used' || card.status === 'active') {
            const cardDate = new Date(card.createdAt);
            if (cardDate < ninetyDaysAgo) {
                card.status = 'archived';
                card.archivedAt = new Date().toISOString();
                card.archivedBy = 'System Auto-Archive';
                updated = true;
            }
        }
    });
    
    if (updated) {
        localStorage.setItem('admin_gift_cards', JSON.stringify(giftCards));
        console.log('✅ Auto-archived old gift cards');
    }
}

// Call this when page loads
document.addEventListener('DOMContentLoaded', function() {
    autoArchiveOldGiftCards();
    // ... rest of your initialization
});