// client-login.js - COMPLETE FIXED VERSION

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize clients storage if not exists
    if (!localStorage.getItem('wigClients')) {
        localStorage.setItem('wigClients', JSON.stringify([]));
    }

    // Check URL for referral code (DO THIS FIRST)
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
        console.log('✅ Referral code detected on page load:', refCode);
        // Store in multiple places for redundancy
        sessionStorage.setItem('signup_referral', refCode);
        localStorage.setItem('pending_referral', JSON.stringify({
            code: refCode,
            capturedAt: new Date().toISOString()
        }));
        
        // Show notification
        showReferralNotification(refCode);
    }

    // Get URL parameters for tab
    const tabParam = urlParams.get('tab');
    
    // Initialize UI
    initializeTabs(tabParam);
    hideMessages();
    
    // Auto-fill remembered user
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        const loginUsername = document.getElementById('loginUsername');
        if (loginUsername) {
            loginUsername.value = rememberedUser;
        }
        const rememberMe = document.getElementById('rememberMe');
        if (rememberMe) {
            rememberMe.checked = true;
        }
    }
});

// ===== UI INITIALIZATION =====
function initializeTabs(tabParam) {
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (!loginTab || !signupTab || !loginForm || !signupForm) {
        console.error('Tab elements not found');
        return;
    }
    
    if (tabParam === 'signup') {
        showSignupTab();
    } else {
        showLoginTab();
    }
}

// Show login tab
function showLoginTab() {
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginTab && signupTab && loginForm && signupForm) {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
    }
}

// Show signup tab
function showSignupTab() {
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const referralField = document.getElementById('referralField');
    const referralInput = document.getElementById('referralCode');
    
    if (loginTab && signupTab && loginForm && signupForm) {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
    }
    
    // Check for referral code and populate field
    if (referralField && referralInput) {
        // Get referral code from any source
        const refCode = sessionStorage.getItem('signup_referral') || 
                        (JSON.parse(localStorage.getItem('pending_referral') || '{}')).code ||
                        new URLSearchParams(window.location.search).get('ref');
        
        if (refCode) {
            referralField.style.display = 'block';
            referralInput.value = refCode;
            referralInput.disabled = true;
            referralInput.style.background = '#f0f0f0';
            
            // Show hint that referral is applied
            const hint = document.querySelector('#referralField .hint');
            if (hint) {
                hint.innerHTML = '<i class="fas fa-check-circle" style="color: #28a745;"></i> Referral code applied automatically!';
                hint.style.color = '#28a745';
            }
        } else {
            referralField.style.display = 'block';
            referralInput.disabled = false;
            referralInput.style.background = '';
        }
    }
}

// Show referral notification
function showReferralNotification(refCode) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 25px;
        border-radius: 30px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        animation: slideDown 0.3s ease;
    `;
    notification.innerHTML = `🎉 You were referred! Complete signup to earn a welcome bonus for your referrer.`;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 6000);
}

// ===== TAB CLICK EVENTS =====
document.addEventListener('click', function(e) {
    if (e.target.id === 'loginTab') {
        showLoginTab();
        hideMessages();
    } else if (e.target.id === 'signupTab') {
        showSignupTab();
        hideMessages();
    }
});

// ===== PASSWORD FUNCTIONS =====
function togglePassword(passwordFieldId, icon) {
    const passwordField = document.getElementById(passwordFieldId);
    if (passwordField) {
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordField.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
}

// Password Strength Checker
const signupPassword = document.getElementById('signupPassword');
if (signupPassword) {
    signupPassword.addEventListener('input', function() {
        const password = this.value;
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.getElementById('strengthText');
        const strengthContainer = document.querySelector('.password-strength');
        
        if (!strengthBar || !strengthText || !strengthContainer) return;
        
        let strength = 0;
        
        if (password.length >= 6) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        strengthContainer.className = 'password-strength';
        
        if (password.length === 0) {
            strengthText.textContent = '';
        } else if (strength <= 2) {
            strengthBar.style.backgroundColor = '#e74c3c';
            strengthText.textContent = 'Weak';
            strengthContainer.classList.add('strength-weak');
        } else if (strength <= 3) {
            strengthBar.style.backgroundColor = '#f39c12';
            strengthText.textContent = 'Medium';
            strengthContainer.classList.add('strength-medium');
        } else {
            strengthBar.style.backgroundColor = '#2ecc71';
            strengthText.textContent = 'Strong';
            strengthContainer.classList.add('strength-strong');
        }
    });
}

// Password Match Checker
const confirmPassword = document.getElementById('confirmPassword');
if (confirmPassword) {
    confirmPassword.addEventListener('input', function() {
        const signupPassword = document.getElementById('signupPassword');
        const passwordMatch = document.getElementById('passwordMatch');
        
        if (!signupPassword || !passwordMatch) return;
        
        if (signupPassword.value !== this.value && this.value.length > 0) {
            passwordMatch.textContent = 'Passwords do not match';
            passwordMatch.className = 'hint mismatch';
        } else if (this.value.length > 0) {
            passwordMatch.textContent = 'Passwords match';
            passwordMatch.className = 'hint match';
        } else {
            passwordMatch.textContent = '';
            passwordMatch.className = 'hint';
        }
    });
}

// ===== VALIDATION FUNCTIONS =====
function validateUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
    return usernameRegex.test(username);
}

function validatePassword(password) {
    return password.length >= 6;
}

function usernameExists(username) {
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    return clients.some(client => client.username && client.username.toLowerCase() === username.toLowerCase());
}

function emailExists(email) {
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    return clients.some(client => client.email && client.email.toLowerCase() === email.toLowerCase());
}

// ===== MESSAGE FUNCTIONS =====
function showSuccess(message) {
    const successMessage = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    const errorMessage = document.getElementById('errorMessage');
    
    if (!successMessage || !successText || !errorMessage) return;
    
    errorMessage.style.display = 'none';
    successText.textContent = message;
    successMessage.style.display = 'flex';
    
    setTimeout(hideMessages, 5000);
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const successMessage = document.getElementById('successMessage');
    
    if (!errorMessage || !errorText || !successMessage) return;
    
    successMessage.style.display = 'none';
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
    
    setTimeout(hideMessages, 5000);
}

function hideMessages() {
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    
    if (successMessage) successMessage.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
}

// ===== LOGIN FORM SUBMISSION =====
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    const rememberMe = document.getElementById('rememberMe')?.checked;
    const acceptTerms = document.getElementById('acceptTerms')?.checked;
    
    if (!username || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    if (!acceptTerms) {
        showError('You must accept the terms and conditions');
        return;
    }
    
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    
    const client = clients.find(c => {
        const isUsernameMatch = c.username && c.username.toLowerCase() === username.toLowerCase();
        const isEmailMatch = c.email && c.email.toLowerCase() === username.toLowerCase();
        return (isUsernameMatch || isEmailMatch) && c.password === password;
    });
    
    if (client) {
        // Update last login
        client.lastLogin = new Date().toISOString();
        localStorage.setItem('wigClients', JSON.stringify(clients));
        
        // Set session
        localStorage.setItem('clientToken', 'client-' + Date.now());
        localStorage.setItem('clientUser', JSON.stringify({
            username: client.username,
            email: client.email,
            createdAt: client.createdAt,
            id: client.id || client.email
        }));
        
        // Save remembered user
        if (rememberMe) {
            localStorage.setItem('rememberedUser', username);
        } else {
            localStorage.removeItem('rememberedUser');
        }
        
        showSuccess('Login successful! Redirecting...');
        setTimeout(() => window.location.href = 'client.html', 1500);
    } else {
        showError('Invalid username/email or password');
    }
});

// ===== SIGNUP FORM SUBMISSION (FIXED VERSION) =====
document.getElementById('signupForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('signupUsername')?.value.trim();
    const email = document.getElementById('signupEmail')?.value.trim();
    const password = document.getElementById('signupPassword')?.value;
    const confirmPass = document.getElementById('confirmPassword')?.value;
    const acceptTerms = document.getElementById('signupTerms')?.checked;
    const referralInput = document.getElementById('referralCode');
    
    // Validation
    if (!username || !email || !password || !confirmPass) {
        showError('Please fill in all fields');
        return;
    }
    
    if (!validateUsername(username)) {
        showError('Username must be 3-20 characters (letters and numbers only)');
        return;
    }
    
    if (usernameExists(username)) {
        showError('Username already exists');
        return;
    }
    
    if (emailExists(email)) {
        showError('Email already registered');
        return;
    }
    
    if (!validatePassword(password)) {
        showError('Password must be at least 6 characters');
        return;
    }
    
    if (password !== confirmPass) {
        showError('Passwords do not match');
        return;
    }
    
    if (!acceptTerms) {
        showError('You must agree to the terms and conditions');
        return;
    }
    
    // ===== GET REFERRAL CODE FROM ALL POSSIBLE SOURCES =====
    let referralCode = null;
    
    // 1. Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    referralCode = urlParams.get('ref');
    
    // 2. Check sessionStorage
    if (!referralCode) {
        referralCode = sessionStorage.getItem('signup_referral');
    }
    
    // 3. Check pending_referral in localStorage
    if (!referralCode) {
        const pendingRef = localStorage.getItem('pending_referral');
        if (pendingRef) {
            try {
                referralCode = JSON.parse(pendingRef).code;
            } catch (e) {}
        }
    }
    
    // 4. Check input field
    if (!referralCode && referralInput) {
        referralCode = referralInput.value.trim();
    }
    
    console.log('🎯 Final referral code:', referralCode);
    
    // Get existing clients
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    
    // Find max ID
    let maxId = 0;
    clients.forEach(client => {
        if (client.id && client.id > maxId) maxId = client.id;
    });
    
    // Create new client
    const newClient = {
        id: maxId + 1,
        username: username,
        email: email,
        password: password,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        status: 'active',
        role: 'client',
        referredByCode: referralCode || null,
        referredBy: null,
        referredByInfo: null
    };
    
    // ===== PROCESS REFERRAL IF CODE EXISTS =====
    if (referralCode) {
        // Find affiliate who owns this code
        for (const client of clients) {
            // Check in multiple places for the referral code
            let storedCode = localStorage.getItem(`referral_code_${client.email}`);
            
            if (!storedCode && client.referralCode) {
                storedCode = client.referralCode;
            }
            
            if (storedCode === referralCode) {
                newClient.referredBy = client.email;
                newClient.referredByInfo = {
                    id: client.id,
                    username: client.username,
                    email: client.email,
                    code: referralCode
                };
                
                console.log('✅ Referred by:', client.username);
                
                // ===== SAVE REFERRAL RECORD =====
                const referralsKey = `affiliate_referrals_${client.email}`;
                const referrals = JSON.parse(localStorage.getItem(referralsKey) || '[]');
                
                referrals.push({
                    id: 'REF-' + Date.now(),
                    referredEmail: email,
                    referredUsername: username,
                    referredId: newClient.id,
                    referralCode: referralCode,
                    date: new Date().toISOString(),
                    status: 'pending',
                    firstPurchase: null,
                    commissionEarned: 0
                });
                
                localStorage.setItem(referralsKey, JSON.stringify(referrals));
                
                // ===== ADD WELCOME BONUS =====
                const settings = JSON.parse(localStorage.getItem('affiliateSettings') || '{}');
                const welcomeBonus = settings.welcomeBonus || 5;
                
                const earningsKey = `affiliate_earnings_${client.email}`;
                const earnings = JSON.parse(localStorage.getItem(earningsKey) || '[]');
                
                earnings.push({
                    id: 'EARN-' + Date.now(),
                    amount: welcomeBonus,
                    type: 'welcome_bonus',
                    description: `Welcome bonus for referring ${username}`,
                    referredEmail: email,
                    referredUsername: username,
                    date: new Date().toISOString(),
                    status: 'available'
                });
                
                localStorage.setItem(earningsKey, JSON.stringify(earnings));
                console.log(`✅ Welcome bonus $${welcomeBonus} added to ${client.username}`);
                break;
            }
        }
    }
    
    // Add new client to array
    clients.push(newClient);
    localStorage.setItem('wigClients', JSON.stringify(clients));
    
    // Initialize user storage
    localStorage.setItem(`cart_${email}`, JSON.stringify([]));
    localStorage.setItem(`wishlist_${email}`, JSON.stringify([]));
    localStorage.setItem(`orders_${email}`, JSON.stringify([]));
    
    // Clear referral storage
    sessionStorage.removeItem('signup_referral');
    localStorage.removeItem('pending_referral');
    
    // Set session
    localStorage.setItem('clientToken', 'client-' + Date.now());
    localStorage.setItem('clientUser', JSON.stringify({
        username: username,
        email: email,
        createdAt: newClient.createdAt,
        id: newClient.id,
        referredBy: newClient.referredBy,
        referredByCode: newClient.referredByCode
    }));
    
    // Show success message
    const message = newClient.referredByInfo ? 
        `Account created successfully! You were referred by ${newClient.referredByInfo.username}. Redirecting...` : 
        'Account created successfully! Redirecting to dashboard...';
    
    showSuccess(message);
    
    // Redirect
    setTimeout(() => {
        window.location.href = 'client.html';
    }, 2000);
});

// ===== FORGOT PASSWORD =====
document.querySelector('.forgot-link')?.addEventListener('click', function(e) {
    e.preventDefault();
    
    const email = prompt('Please enter your email address to reset password:');
    if (!email) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    const client = clients.find(c => c.email.toLowerCase() === email.toLowerCase());
    
    if (!client) {
        alert('No account found with that email address');
        return;
    }
    
    // Create reset request
    const requests = JSON.parse(localStorage.getItem('passwordResetRequests') || '[]');
    requests.push({
        id: 'RESET-' + Date.now(),
        email: email,
        username: client.username,
        requestedAt: new Date().toISOString(),
        status: 'pending',
        userAgent: navigator.userAgent
    });
    
    localStorage.setItem('passwordResetRequests', JSON.stringify(requests));
    alert(`Password reset request submitted for ${email}. Our support team will contact you shortly.`);
});

// ===== SOCIAL LOGIN =====
document.querySelectorAll('.social-btn').forEach(button => {
    button.addEventListener('click', function() {
        const provider = this.classList.contains('google') ? 'Google' : 'GitHub';
        showSuccess(`Simulating ${provider} authentication...`);
        console.log(`${provider} authentication would be implemented here`);
    });
});

// ===== ANIMATION STYLES =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { opacity: 0; transform: translate(-50%, -20px); }
        to { opacity: 1; transform: translate(-50%, 0); }
    }
`;
document.head.appendChild(style);


