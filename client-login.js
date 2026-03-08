// Client Login JavaScript - FIXED VERSION
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');


    // Initialize clients storage if not exists
    if (!localStorage.getItem('wigClients')) {
        localStorage.setItem('wigClients', JSON.stringify([]));
    }

    // Check for referral code on page load
    document.addEventListener('DOMContentLoaded', function() {
        // ... existing code ...
        
        // Check URL for referral code
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');
        
        if (refCode) {
            console.log('✅ Referral code detected on signup page:', refCode);
            // Store in sessionStorage temporarily
            sessionStorage.setItem('signup_referral', refCode);
            
            // Also store in a more permanent location for this session
            localStorage.setItem('pending_referral', JSON.stringify({
                code: refCode,
                capturedAt: new Date().toISOString()
            }));
        }
        
    });

 // Check URL parameters on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize clients storage if not exists
    if (!localStorage.getItem('wigClients')) {
        localStorage.setItem('wigClients', JSON.stringify([]));
    }

    // Check for referral code in URL (MOVE THIS CODE UP, DON'T NEST IT)
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
        console.log('✅ Referral code detected on signup page:', refCode);
        // Store in sessionStorage temporarily
        sessionStorage.setItem('signup_referral', refCode);
        
        // Also store in a more permanent location for this session
        localStorage.setItem('pending_referral', JSON.stringify({
            code: refCode,
            capturedAt: new Date().toISOString()
        }));
    }

    // Get URL parameters
    const tabParam = urlParams.get('tab');
    
    // Show appropriate tab based on URL parameter
    if (tabParam === 'signup') {
        showSignupTab();
    } else {
        showLoginTab();
    }
    
    hideMessages();
    
    // Add debug button for testing
    addDebugButton();
}); // ← ONLY ONE CLOSING BRACKET HERE

// Show login tab
function showLoginTab() {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
}

// Show signup tab
function showSignupTab() {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupForm.classList.add('active');
    loginForm.classList.remove('active');
    
    // Check if there's a referral code in session
    const refCode = sessionStorage.getItem('signup_referral');
    const referralField = document.getElementById('referralField');
    const referralInput = document.getElementById('referralCode');
    
    if (refCode && referralField && referralInput) {
        referralField.style.display = 'block';
        referralInput.value = refCode;
        referralInput.disabled = true;
        referralInput.style.background = '#f0f0f0';
        
        const hint = document.querySelector('#referralField .hint');
        if (hint) {
            hint.innerHTML = '<i class="fas fa-check-circle" style="color: #28a745;"></i> Referral code applied automatically!';
            hint.style.color = '#28a745';
        }
    } else if (referralField) {
        referralField.style.display = 'block';
    }
}

// Tab click events
loginTab.addEventListener('click', () => {
    showLoginTab();
    hideMessages();
});

signupTab.addEventListener('click', () => {
    showSignupTab();
    hideMessages();
});

// Toggle Password Visibility
function togglePassword(passwordFieldId, icon) {
    const passwordField = document.getElementById(passwordFieldId);
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

// Password Strength Checker - FIXED
const signupPassword = document.getElementById('signupPassword');
const confirmPassword = document.getElementById('confirmPassword');
const strengthBar = document.querySelector('.strength-bar');
const strengthText = document.getElementById('strengthText');
const passwordMatch = document.getElementById('passwordMatch');

signupPassword.addEventListener('input', function() {
    const password = this.value;
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    const strengthContainer = document.querySelector('.password-strength');
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

// Password Match Checker
confirmPassword.addEventListener('input', function() {
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

// Show success message
function showSuccess(message) {
    const successMessage = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    const errorMessage = document.getElementById('errorMessage');
    
    errorMessage.style.display = 'none';
    successText.textContent = message;
    successMessage.style.display = 'flex';
    
    setTimeout(hideMessages, 5000);
}

// Show error message
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const successMessage = document.getElementById('successMessage');
    
    successMessage.style.display = 'none';
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
    
    setTimeout(hideMessages, 5000);
}

// Hide all messages
function hideMessages() {
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
}

// Form Validation
function validateUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
    return usernameRegex.test(username);
}

function validatePassword(password) {
    // Simplified for testing - at least 6 characters
    const passwordRegex = /^.{6,}$/;
    return passwordRegex.test(password);
}

// Check if username already exists
function usernameExists(username) {
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    return clients.some(client => client.username && client.username.toLowerCase() === username.toLowerCase());
}

// Check if email already exists
function emailExists(email) {
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    return clients.some(client => client.email && client.email.toLowerCase() === email.toLowerCase());
}

// Login Form Submission - FIXED
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const acceptTerms = document.getElementById('acceptTerms').checked;
    
    if (!username || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    if (!acceptTerms) {
        showError('You must accept the terms and conditions');
        return;
    }
    
    // Get all registered clients
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    
    // Find the client - FIXED: Check both username and email
    const client = clients.find(c => {
        // Check if input matches either username or email
        const isUsernameMatch = c.username && c.username.toLowerCase() === username.toLowerCase();
        const isEmailMatch = c.email && c.email.toLowerCase() === username.toLowerCase();
        
        return (isUsernameMatch || isEmailMatch) && c.password === password;
    });
    
    if (client) {
        // Set client session
        localStorage.setItem('clientToken', 'client-' + Date.now());
        localStorage.setItem('clientUser', JSON.stringify({
            username: client.username,
            email: client.email,
            createdAt: client.createdAt,
            id: client.id
        }));
        
        // Update last login time
        client.lastLogin = new Date().toISOString();
        localStorage.setItem('wigClients', JSON.stringify(clients));
        
        // If remember me is checked, save credentials
        if (rememberMe) {
            localStorage.setItem('rememberedUser', username);
        } else {
            localStorage.removeItem('rememberedUser');
        }
        
        showSuccess('Login successful! Redirecting...');
        
        // Redirect to client dashboard after 2 seconds
        setTimeout(() => {
            window.location.href = 'client.html';
        }, 2000);
    } else {
        showError('Invalid username/email or password');
    }
});

// Signup Form Submission - FIXED VERSION WITH PROPER SUCCESS MESSAGE AND REDIRECT
document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;
    const acceptTerms = document.getElementById('signupTerms').checked;
    
    console.log('Signup attempt:', { username, email, password: '***' });
    
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
        showError('Username already exists. Please choose a different username.');
        return;
    }
    
    if (emailExists(email)) {
        showError('Email already registered. Please use a different email or login.');
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
    
    // Get existing clients
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    console.log('Existing clients:', clients.length);
    
    // Fix: Handle cases where clients might not have ids
    let maxId = 0;
    clients.forEach(client => {
        if (client.id && client.id > maxId) {
            maxId = client.id;
        }
    });
    
    // ===== IMPROVED REFERRAL CODE DETECTION =====
    let referralCode = null;
    
    // 1. Check sessionStorage first
    referralCode = sessionStorage.getItem('signup_referral');
    console.log('SessionStorage referral:', referralCode);
    
    // 2. If not in sessionStorage, check URL parameters
    if (!referralCode) {
        const urlParams = new URLSearchParams(window.location.search);
        referralCode = urlParams.get('ref');
        console.log('URL referral:', referralCode);
    }
    
    // 3. If still not found, check the input field
    if (!referralCode) {
        referralCode = document.getElementById('referralCode')?.value.trim();
        console.log('Input field referral:', referralCode);
    }
    
    // 4. If still not found, check pending_referral
    if (!referralCode) {
        const pendingRef = localStorage.getItem('pending_referral');
        if (pendingRef) {
            try {
                referralCode = JSON.parse(pendingRef).code;
                console.log('Pending referral:', referralCode);
            } catch (e) {
                console.log('Error parsing pending referral');
            }
        }
    }
    
    // Create new client object
    const newClient = {
        id: maxId + 1,
        username: username,
        email: email,
        password: password,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        status: 'active',
        role: 'client',
        profile: {
            fullName: username,
            phone: '',
            address: ''
        },
        totalSpent: 0,
        orderCount: 0,
        referredBy: null,
        referredByAffiliate: null,
        referredByCode: null
    };
    
    // ===== PROCESS REFERRAL CODE IF FOUND =====
    let affiliateFound = null;
    
    if (referralCode) {
        console.log('🎯 Found referral code:', referralCode);
        newClient.referredByCode = referralCode;
        
        // Find which affiliate owns this code - IMPROVED LOOKUP
        affiliateFound = null;
        
        // Search through ALL clients to find the affiliate
        for (const client of clients) {
            // Get the affiliate ID (could be client.id or client.email)
            const affiliateId = client.id || client.email;
            
            // Check for referral code in multiple places
            let storedCode = localStorage.getItem(`referral_code_${affiliateId}`);
            
            // Also check if this client has a referral_code property in their object
            if (!storedCode && client.referralCode) {
                storedCode = client.referralCode;
            }
            
            // If we found a matching code
            if (storedCode === referralCode) {
                affiliateFound = {
                    id: affiliateId,
                    username: client.username,
                    email: client.email,
                    code: referralCode
                };
                
                console.log(`✅ Referred by affiliate: ${client.username} (${affiliateId})`);
                break;
            }
        }
        
        if (affiliateFound) {
            // Store affiliate info in new client
            newClient.referredBy = affiliateFound.id;
            newClient.referredByAffiliate = affiliateFound;
            
            // ===== SAVE REFERRAL RECORD FOR AFFILIATE =====
            const referralsKey = `affiliate_referrals_${affiliateFound.id}`;
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
            console.log(`✅ Referral record saved for affiliate ${affiliateFound.id}`);
            
            // ===== ADD WELCOME BONUS TO AFFILIATE =====
            const settings = JSON.parse(localStorage.getItem('affiliateSettings') || '{}');
            const welcomeBonus = settings.welcomeBonus || 5; // Default $5
            
            const earningsKey = `affiliate_earnings_${affiliateFound.id}`;
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
            console.log(`✅ Welcome bonus $${welcomeBonus} added to affiliate ${affiliateFound.username}`);
            
            // ===== NOTIFY ADMIN =====
            const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
            notifications.push({
                id: 'NOTIF-' + Date.now(),
                type: 'new_referral',
                affiliate: affiliateFound.username,
                referred: username,
                bonus: welcomeBonus,
                date: new Date().toISOString(),
                read: false
            });
            localStorage.setItem('adminNotifications', JSON.stringify(notifications));
        } else {
            console.log('⚠️ Referral code found but no affiliate owns it:', referralCode);
        }
        
        // Clear all temporary storage
        sessionStorage.removeItem('signup_referral');
        localStorage.removeItem('pending_referral');
    }
    
    console.log('New client created:', { ...newClient, password: '***' });
    
    // Add to clients array
    clients.push(newClient);
    
    // Save to localStorage
    localStorage.setItem('wigClients', JSON.stringify(clients));
    console.log('Clients saved to localStorage:', clients.length);
    
    // Initialize client-specific storage
    const emailKey = email;
    if (!localStorage.getItem(`cart_${emailKey}`)) {
        localStorage.setItem(`cart_${emailKey}`, JSON.stringify([]));
    }
    if (!localStorage.getItem(`wishlist_${emailKey}`)) {
        localStorage.setItem(`wishlist_${emailKey}`, JSON.stringify([]));
    }
    if (!localStorage.getItem(`orders_${emailKey}`)) {
        localStorage.setItem(`orders_${emailKey}`, JSON.stringify([]));
    }
    
    // Set client session
    localStorage.setItem('clientToken', 'client-' + Date.now());
    localStorage.setItem('clientUser', JSON.stringify({
        username: username,
        email: email,
        createdAt: newClient.createdAt,
        id: newClient.id,
        referredBy: newClient.referredBy,
        referredByCode: newClient.referredByCode
    }));
    
    // Clear form
    document.getElementById('signupUsername').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('signupTerms').checked = false;
    
    // Reset password strength indicator
    const strengthTextElement = document.getElementById('strengthText');
    const passwordMatchElement = document.getElementById('passwordMatch');
    const strengthContainer = document.querySelector('.password-strength');
    
    if (strengthTextElement) strengthTextElement.textContent = '';
    if (passwordMatchElement) passwordMatchElement.textContent = '';
    if (strengthContainer) strengthContainer.className = 'password-strength';
    
    // Get success message elements
    const successMessage = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    const errorMessage = document.getElementById('errorMessage');
    
    // Hide error message if visible
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
    
    // Show success message
    if (successMessage && successText) {
        if (affiliateFound) {
            successText.textContent = `Account created successfully! You were referred by ${affiliateFound.username}. Redirecting...`;
        } else {
            successText.textContent = 'Account created successfully! Redirecting to dashboard...';
        }
        successMessage.style.display = 'flex';
        successMessage.style.opacity = '1';
        successMessage.style.visibility = 'visible';
        
        console.log('✅ Success message displayed:', successText.textContent);
    } else {
        console.error('❌ Success message elements not found!');
        // Fallback alert if message elements don't exist
        alert('Account created successfully! Redirecting to dashboard...');
    }
    
    // Clear any existing timer
    if (window.signupRedirectTimer) {
        clearTimeout(window.signupRedirectTimer);
    }
    
    // Redirect to client dashboard after 2 seconds
    window.signupRedirectTimer = setTimeout(() => {
        console.log('🔄 Redirecting to client.html now...');
        window.location.href = 'client.html';
    }, 2000);
});
// Social Login Buttons
document.querySelectorAll('.social-btn').forEach(button => {
    button.addEventListener('click', function() {
        const provider = this.classList.contains('google') ? 'Google' : 'GitHub';
        showSuccess(`Simulating ${provider} authentication...`);
        console.log(`${provider} authentication would be implemented here`);
    });
});

// Update the forgot password link event listener
document.querySelector('.forgot-link').addEventListener('click', function(e) {
    e.preventDefault();
    
    const email = prompt('Please enter your email address to reset password:');
    if (!email) return;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Check if email exists in clients
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    const client = clients.find(c => c.email.toLowerCase() === email.toLowerCase());
    
    if (!client) {
        alert('No account found with that email address');
        return;
    }
    
    // Create reset request
    const requests = JSON.parse(localStorage.getItem('passwordResetRequests') || '[]');
    const newRequest = {
        id: 'RESET-' + Date.now(),
        email: email,
        username: client.username,
        requestedAt: new Date().toISOString(),
        status: 'pending',
        ip: '127.0.0.1', // In real app, get from server
        userAgent: navigator.userAgent
    };
    
    requests.push(newRequest);
    localStorage.setItem('passwordResetRequests', JSON.stringify(requests));
    
    alert(`Password reset request submitted for ${email}. Our support team will contact you shortly.`);
});

// Auto-fill remembered user
window.addEventListener('load', function() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        document.getElementById('loginUsername').value = rememberedUser;
        document.getElementById('rememberMe').checked = true;
    }
});



