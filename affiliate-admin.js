// affiliate-admin.js - Admin Affiliate Management

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
        document.getElementById('minWithdrawal').value = settings.minWithdrawal || 10;
    }
    
    // Load pending withdrawals
    loadPendingWithdrawals();
    
    // Load affiliates list
    loadAffiliatesList();
    
    // Update stats
    updateAffiliateStats();
}

// Load pending withdrawals
function loadPendingWithdrawals() {
    const withdrawals = JSON.parse(localStorage.getItem('admin_withdrawal_requests') || '[]');
    const pending = withdrawals.filter(w => w.status === 'pending');
    
    const tableBody = document.getElementById('pendingWithdrawalsBody');
    if (!tableBody) return;
    
    document.getElementById('pendingWithdrawals').textContent = pending.length;
    
    if (pending.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="empty-table">No pending withdrawals</td></tr>';
        return;
    }
    
    let html = '';
    pending.forEach(w => {
        const date = new Date(w.requestedAt).toLocaleDateString();
        let details = '';
        
        if (w.method === 'bank') {
            details = `${w.paymentDetails.accountName}<br>${w.paymentDetails.bankName}`;
        } else if (w.method === 'mpesa') {
            details = w.paymentDetails.mpesaNumber;
        } else if (w.method === 'paypal') {
            details = w.paymentDetails.paypalEmail;
        } else if (w.method === 'store_credit') {
            details = 'Store Credit';
        }
        
        html += `
            <tr>
                <td>${date}</td>
                <td><strong>${w.affiliateName}</strong><br><small>${w.affiliateEmail}</small></td>
                <td><strong>$${w.amount.toFixed(2)}</strong></td>
                <td>${w.method.replace('_', ' ')}</td>
                <td><small>${details}</small></td>
                <td>
                    <button class="btn-approve" onclick="approveWithdrawal('${w.id}')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn-reject" onclick="rejectWithdrawal('${w.id}')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Approve withdrawal
function approveWithdrawal(withdrawalId) {
    if (!confirm('Approve this withdrawal request?')) return;
    
    const adminWithdrawals = JSON.parse(localStorage.getItem('admin_withdrawal_requests') || '[]');
    const withdrawalIndex = adminWithdrawals.findIndex(w => w.id === withdrawalId);
    
    if (withdrawalIndex === -1) return;
    
    adminWithdrawals[withdrawalIndex].status = 'approved';
    adminWithdrawals[withdrawalIndex].processedAt = new Date().toISOString();
    adminWithdrawals[withdrawalIndex].processedBy = document.getElementById('adminName')?.textContent || 'Admin';
    
    localStorage.setItem('admin_withdrawal_requests', JSON.stringify(adminWithdrawals));
    
    // Update affiliate's withdrawal status
    const w = adminWithdrawals[withdrawalIndex];
    const affiliateWithdrawalsKey = `affiliate_withdrawals_${w.affiliateId}`;
    const affiliateWithdrawals = JSON.parse(localStorage.getItem(affiliateWithdrawalsKey) || '[]');
    const affWithdrawalIndex = affiliateWithdrawals.findIndex(aw => aw.id === withdrawalId);
    
    if (affWithdrawalIndex !== -1) {
        affiliateWithdrawals[affWithdrawalIndex].status = 'approved';
        affiliateWithdrawals[affWithdrawalIndex].processedAt = new Date().toISOString();
        localStorage.setItem(affiliateWithdrawalsKey, JSON.stringify(affiliateWithdrawals));
    }
    
    showAdminNotification('✅ Withdrawal approved successfully!', 'success');
    loadPendingWithdrawals();
}

// Reject withdrawal
function rejectWithdrawal(withdrawalId) {
    if (!confirm('Reject this withdrawal request?')) return;
    
    const adminWithdrawals = JSON.parse(localStorage.getItem('admin_withdrawal_requests') || '[]');
    const withdrawalIndex = adminWithdrawals.findIndex(w => w.id === withdrawalId);
    
    if (withdrawalIndex === -1) return;
    
    const w = adminWithdrawals[withdrawalIndex];
    
    // Return funds to affiliate
    const affiliateEarningsKey = `affiliate_earnings_${w.affiliateId}`;
    const affiliateEarnings = JSON.parse(localStorage.getItem(affiliateEarningsKey) || '[]');
    
    // Add back the amount (reverse withdrawal)
    affiliateEarnings.push({
        id: 'EARN-' + Date.now(),
        amount: w.amount,
        type: 'refund',
        description: 'Refund from rejected withdrawal',
        date: new Date().toISOString(),
        status: 'available'
    });
    
    localStorage.setItem(affiliateEarningsKey, JSON.stringify(affiliateEarnings));
    
    // Update withdrawal status
    adminWithdrawals[withdrawalIndex].status = 'rejected';
    adminWithdrawals[withdrawalIndex].processedAt = new Date().toISOString();
    localStorage.setItem('admin_withdrawal_requests', JSON.stringify(adminWithdrawals));
    
    // Update affiliate's withdrawal status
    const affiliateWithdrawalsKey = `affiliate_withdrawals_${w.affiliateId}`;
    const affiliateWithdrawals = JSON.parse(localStorage.getItem(affiliateWithdrawalsKey) || '[]');
    const affWithdrawalIndex = affiliateWithdrawals.findIndex(aw => aw.id === withdrawalId);
    
    if (affWithdrawalIndex !== -1) {
        affiliateWithdrawals[affWithdrawalIndex].status = 'rejected';
        affiliateWithdrawals[affWithdrawalIndex].processedAt = new Date().toISOString();
        localStorage.setItem(affiliateWithdrawalsKey, JSON.stringify(affiliateWithdrawals));
    }
    
    showAdminNotification('❌ Withdrawal rejected', 'info');
    loadPendingWithdrawals();
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
            .filter(e => e.status !== 'withdrawn')
            .reduce((sum, e) => sum + e.amount, 0);
        const withdrawn = earnings
            .filter(e => e.status === 'withdrawn')
            .reduce((sum, e) => sum + e.amount, 0);
        const balance = totalEarnings - withdrawn;
        
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
            if (e.status !== 'withdrawn') {
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
        minWithdrawal: parseFloat(document.getElementById('minWithdrawal').value),
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