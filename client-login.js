// Client Login JavaScript - FIXED VERSION
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// Check URL parameters on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize clients storage if not exists
    if (!localStorage.getItem('wigClients')) {
        localStorage.setItem('wigClients', JSON.stringify([]));
    }
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
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
});

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

// Signup Form Submission - FIXED
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
        orderCount: 0
    };
    
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
        id: newClient.id
    }));
    
    // Show success message
    showSuccess('Account created successfully! Redirecting to dashboard...');
    
    // Clear form
    document.getElementById('signupUsername').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('signupTerms').checked = false;
    
    // Reset password strength indicator
    strengthText.textContent = '';
    passwordMatch.textContent = '';
    document.querySelector('.password-strength').className = 'password-strength';
    
    // Redirect to client dashboard after 2 seconds
    setTimeout(() => {
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

// Terms Links
document.querySelectorAll('.terms-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Terms and Conditions:\n\n1. You must be at least 18 years old to use this service.\n2. All products are subject to availability.\n3. Returns are accepted within 30 days of purchase.\n4. We respect your privacy and will never share your information.\n\nBy using WigHub, you agree to these terms.');
    });
});

// Auto-fill remembered user
window.addEventListener('load', function() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        document.getElementById('loginUsername').value = rememberedUser;
        document.getElementById('rememberMe').checked = true;
    }
});

// DEBUG FUNCTIONS
function debugViewClients() {
    const clients = JSON.parse(localStorage.getItem('wigClients') || '[]');
    console.log('=== DEBUG: All Clients ===');
    console.log('Total clients:', clients.length);
    clients.forEach((client, index) => {
        console.log(`Client ${index + 1}:`, {
            id: client.id,
            username: client.username,
            email: client.email,
            password: client.password ? '***' : 'none',
            createdAt: client.createdAt
        });
    });
    console.log('=== END DEBUG ===');
    return clients.length;
}

function clearAllClients() {
    if (confirm('Clear all clients? This cannot be undone!')) {
        localStorage.setItem('wigClients', JSON.stringify([]));
        console.log('All clients cleared');
        alert('All clients cleared');
    }
}

function addDebugButton() {
    // Add debug button to page
    const debugBtn = document.createElement('button');
    debugBtn.textContent = 'DEBUG';
    debugBtn.style.position = 'fixed';
    debugBtn.style.bottom = '10px';
    debugBtn.style.right = '10px';
    debugBtn.style.padding = '5px 10px';
    debugBtn.style.backgroundColor = '#667eea';
    debugBtn.style.color = 'white';
    debugBtn.style.border = 'none';
    debugBtn.style.borderRadius = '4px';
    debugBtn.style.cursor = 'pointer';
    debugBtn.style.zIndex = '9999';
    debugBtn.style.fontSize = '12px';
    debugBtn.style.opacity = '0.7';
    
    debugBtn.onclick = function() {
        const clientCount = debugViewClients();
        alert(`Total clients: ${clientCount}\nCheck browser console (F12) for details`);
    };
    
    document.body.appendChild(debugBtn);
}

// ===== 12. RATE LIMITING FOR LOGIN =====
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

function getLoginAttempts(identifier) {
    const key = `login_attempts_${identifier}`;
    const attempts = JSON.parse(localStorage.getItem(key) || '{"count":0, "timestamp":0}');
    
    // Reset if lockout period has passed
    if (Date.now() - attempts.timestamp > LOCKOUT_TIME) {
        attempts.count = 0;
    }
    
    return attempts;
}

function incrementLoginAttempts(identifier) {
    const key = `login_attempts_${identifier}`;
    const attempts = getLoginAttempts(identifier);
    
    attempts.count++;
    attempts.timestamp = Date.now();
    
    localStorage.setItem(key, JSON.stringify(attempts));
    
    return attempts;
}

function resetLoginAttempts(identifier) {
    const key = `login_attempts_${identifier}`;
    localStorage.removeItem(key);
}

function isLoginLocked(identifier) {
    const attempts = getLoginAttempts(identifier);
    
    if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
        const timeLeft = LOCKOUT_TIME - (Date.now() - attempts.timestamp);
        if (timeLeft > 0) {
            return {
                locked: true,
                timeLeft: Math.ceil(timeLeft / 60000) // minutes
            };
        }
    }
    
    return { locked: false };
}

// Add CAPTCHA simulation after 3 attempts
function showCaptcha() {
    return prompt('Please enter the CAPTCHA code: 12345') === '12345';
}

