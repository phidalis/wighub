// client-login.js - COMPLETE FIREBASE VERSION (Fixed imports and functions)

// ===== IMPORT FIREBASE FUNCTIONS =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    query, 
    where,
    updateDoc,
    deleteDoc,
    arrayUnion,
    arrayRemove,
    addDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ===== FIREBASE CONFIGURATION =====
const firebaseConfig = {
    apiKey: "AIzaSyDmpsaBtFvWjVBX5IeZzN9ktYZRxwoInmA",
    authDomain: "aviator-pro-16914.firebaseapp.com",
    projectId: "aviator-pro-16914",
    storageBucket: "aviator-pro-16914.firebasestorage.app",
    messagingSenderId: "536049864881",
    appId: "1:536049864881:web:5ac2cb820394e6a90dd290",
    measurementId: "G-BZZ1SQM9EX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Make them available globally
window.auth = auth;
window.db = db;
window.firebaseCollections = {
    users: 'users',
    admins: 'admins',
    braiders: 'braiders',
    products: 'products',
    orders: 'orders',
    guestOrders: 'guestOrders',
    supportTickets: 'supportTickets',
    heroImages: 'heroImages',
    giftCards: 'giftCards',
    affiliateEarnings: 'affiliateEarnings',
    affiliateReferrals: 'affiliateReferrals',
    referralCodes: 'referralCodes'
};

// Also expose the functions globally for inline event handlers
window.collection = collection;
window.doc = doc;
window.setDoc = setDoc;
window.getDoc = getDoc;
window.getDocs = getDocs;
window.query = query;
window.where = where;
window.updateDoc = updateDoc;
window.addDoc = addDoc;

console.log('🔥 Firebase initialized');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
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

// Debug function to test Firestore connection
async function testFirestoreConnection() {
    try {
        console.log('Testing Firestore connection...');
        const testRef = collection(db, 'users');
        const testSnapshot = await getDocs(query(testRef, where('username', '==', 'testuser123')));
        console.log('✅ Firestore connection successful');
        return true;
    } catch (error) {
        console.error('❌ Firestore connection failed:', error);
        console.error('Error details:', error.code, error.message);
        return false;
    }
}

// Run this on page load
document.addEventListener('DOMContentLoaded', function() {
    testFirestoreConnection();
    // ... rest of your initialization code
});

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
window.togglePassword = function(passwordFieldId, icon) {
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
};

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
            strengthBar.style.width = '0%';
        } else if (strength <= 2) {
            strengthBar.style.width = '25%';
            strengthBar.style.backgroundColor = '#e74c3c';
            strengthText.textContent = 'Weak';
            strengthContainer.classList.add('strength-weak');
        } else if (strength <= 3) {
            strengthBar.style.width = '50%';
            strengthBar.style.backgroundColor = '#f39c12';
            strengthText.textContent = 'Medium';
            strengthContainer.classList.add('strength-medium');
        } else {
            strengthBar.style.width = '100%';
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

// ===== LOGIN FORM SUBMISSION (FIREBASE) =====
document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
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
    
    try {
        let email = username;
        
        // If it's a username, find the email from Firestore
        if (!username.includes('@')) {
            const usersRef = collection(db, 'users');
            const usernameQuery = query(usersRef, where('username', '==', username));
            const usernameSnapshot = await getDocs(usernameQuery);
            
            if (usernameSnapshot.empty) {
                showError('Account not found. Please sign up first.');
                return;
            }
            
            email = usernameSnapshot.docs[0].data().email;
        }
        
        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (!userDoc.exists()) {
            showError('User data not found');
            return;
        }
        
        const userData = userDoc.data();
        
        if (userData.status !== 'active') {
            showError('Your account has been suspended. Contact support.');
            return;
        }
        
        // Update last login
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
            lastLogin: new Date().toISOString()
        });
        
        // Set session
        localStorage.setItem('clientToken', firebaseUser.uid);
        localStorage.setItem('clientUser', JSON.stringify({
            uid: firebaseUser.uid,
            username: userData.username,
            email: userData.email,
            createdAt: userData.createdAt,
            role: userData.role,
            referredBy: userData.referredBy,
            referredByCode: userData.referredByCode
        }));
        
        // Save remembered user
        if (rememberMe) {
            localStorage.setItem('rememberedUser', username);
        } else {
            localStorage.removeItem('rememberedUser');
        }
        
        showSuccess('Login successful! Redirecting...');
        setTimeout(() => window.location.href = 'client.html', 1500);
        
    } catch (error) {
        console.error('Login error:', error);
        if (error.code === 'auth/user-not-found') {
            showError('Account not found. Please sign up first.');
        } else if (error.code === 'auth/wrong-password') {
            showError('Incorrect password. Please try again.');
        } else if (error.code === 'auth/too-many-requests') {
            showError('Too many failed attempts. Try again later.');
        } else {
            showError(error.message);
        }
    }
});

// ===== SIGNUP FORM SUBMISSION (FIXED VERSION) =====
document.getElementById('signupForm')?.addEventListener('submit', async function(e) {
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
    
    // ===== GET REFERRAL CODE =====
    let referralCode = null;
    const urlParams = new URLSearchParams(window.location.search);
    referralCode = urlParams.get('ref') || 
                   sessionStorage.getItem('signup_referral') || 
                   (referralInput ? referralInput.value.trim() : null);
    
    console.log('🎯 Final referral code:', referralCode);
    
    // Show loading state
    const submitBtn = document.querySelector('#signupForm .btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    submitBtn.disabled = true;
    
    try {
        // IMPORTANT: First check if email exists in Firebase Auth (more reliable)
        // We do this by attempting to fetch user info - this requires an additional API call
        // But we can use Firestore as fallback
        
        // Check Firestore for existing username
        const usersRef = collection(db, 'users');
        const usernameQuery = query(usersRef, where('username', '==', username));
        let usernameExists = false;
        
        try {
            const usernameSnapshot = await getDocs(usernameQuery);
            usernameExists = !usernameSnapshot.empty;
        } catch (queryError) {
            console.error('Username query failed:', queryError);
            // If query fails, assume username is available
            usernameExists = false;
        }
        
        if (usernameExists) {
            showError('Username already exists. Please choose another one.');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }
        
        // Check if email exists in Auth (primary check)
        // We'll attempt to create and catch the specific error
        let userCredential;
        
        try {
            // Try to create the user
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            
            console.log('✅ User created in Auth:', firebaseUser.uid);
            
            // ===== PROCESS REFERRAL IF CODE EXISTS =====
            let referredBy = null;
            let referredByInfo = null;
            let welcomeBonus = 5;
            
            if (referralCode) {
                try {
                    // Find affiliate who owns this code from referralCodes collection
                    const codesRef = collection(db, 'referralCodes');
                    const codeQuery = query(codesRef, where('code', '==', referralCode));
                    const codeSnapshot = await getDocs(codeQuery);
                    
                    if (!codeSnapshot.empty) {
                        const referrerData = codeSnapshot.docs[0].data();
                        referredBy = referrerData.userId;
                        referredByInfo = {
                            id: referrerData.userId,
                            username: referrerData.username,
                            email: referrerData.email,
                            code: referralCode
                        };
                        
                        console.log('✅ Referred by:', referrerData.username);
                        
                        // Save referral record
                        const referralsRef = collection(db, 'affiliateReferrals');
                        await addDoc(referralsRef, {
                            id: 'REF-' + Date.now(),
                            affiliateId: referredBy,
                            affiliateUsername: referrerData.username,
                            referredEmail: email,
                            referredUsername: username,
                            referredId: firebaseUser.uid,
                            referralCode: referralCode,
                            date: new Date().toISOString(),
                            status: 'pending',
                            firstPurchase: null,
                            commissionEarned: 0
                        });
                        
                        // Add welcome bonus
                        try {
                            const settingsDoc = await getDoc(doc(db, 'affiliateSettings', 'global'));
                            if (settingsDoc.exists()) {
                                welcomeBonus = settingsDoc.data().welcomeBonus || 5;
                            }
                        } catch (err) {
                            console.log('Using default welcome bonus:', welcomeBonus);
                        }
                        
                        const earningsRef = collection(db, 'affiliateEarnings');
                        await addDoc(earningsRef, {
                            id: 'EARN-' + Date.now(),
                            userId: referredBy,
                            amount: welcomeBonus,
                            type: 'welcome_bonus',
                            description: `Welcome bonus for referring ${username}`,
                            referredEmail: email,
                            referredUsername: username,
                            date: new Date().toISOString(),
                            status: 'available'
                        });
                        
                        console.log(`✅ Welcome bonus $${welcomeBonus} added`);
                    }
                } catch (err) {
                    console.error('Error processing referral:', err);
                    // Continue with signup even if referral processing fails
                }
            }
            
            // Save user to Firestore
            const userData = {
                uid: firebaseUser.uid,
                username: username,
                email: email,
                role: 'client',
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                status: 'active',
                referredBy: referredBy,
                referredByCode: referralCode || null,
                referredByInfo: referredByInfo
            };
            
            // Use setDoc with merge option to avoid overwriting
            await setDoc(doc(db, 'users', firebaseUser.uid), userData, { merge: true });
            console.log('✅ User saved to Firestore');
            
            // Create referral code for this user
            const newReferralCode = username.toUpperCase() + Math.floor(1000 + Math.random() * 9000);
            await setDoc(doc(db, 'referralCodes', newReferralCode), {
                code: newReferralCode,
                userId: firebaseUser.uid,
                username: username,
                email: email,
                createdAt: new Date().toISOString()
            });
            console.log('✅ Referral code created');
            
            // Initialize empty collections
            try {
                await setDoc(doc(db, 'carts', firebaseUser.uid), { items: [] }, { merge: true });
                await setDoc(doc(db, 'wishlists', firebaseUser.uid), { items: [] }, { merge: true });
                await setDoc(doc(db, 'orders', firebaseUser.uid), { orders: [] }, { merge: true });
                console.log('✅ Collections initialized');
            } catch (err) {
                console.error('Error initializing collections:', err);
            }
            
            // Clear referral storage
            sessionStorage.removeItem('signup_referral');
            localStorage.removeItem('pending_referral');
            
            // Set session
            localStorage.setItem('clientToken', firebaseUser.uid);
            localStorage.setItem('clientUser', JSON.stringify({
                uid: firebaseUser.uid,
                username: username,
                email: email,
                createdAt: userData.createdAt,
                role: 'client',
                referredBy: referredBy,
                referredByCode: referralCode
            }));
            
            // Show success message
            const message = referredByInfo ? 
                `Account created successfully! You were referred by ${referredByInfo.username}. Redirecting...` : 
                'Account created successfully! Redirecting to dashboard...';
            
            showSuccess(message);
            
            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = 'client.html';
            }, 2000);
            
        } catch (authError) {
            console.error('Auth creation error:', authError);
            
            // Handle specific Firebase Auth errors
            if (authError.code === 'auth/email-already-in-use') {
                showError('This email is already registered. Please login instead.');
            } else if (authError.code === 'auth/weak-password') {
                showError('Password should be at least 6 characters');
            } else if (authError.code === 'auth/invalid-email') {
                showError('Invalid email address');
            } else {
                showError(authError.message || 'Registration failed. Please try again.');
            }
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
        
    } catch (error) {
        console.error('Signup error:', error);
        showError(error.message || 'Registration failed. Please try again.');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// ===== FORGOT PASSWORD =====
document.querySelector('.forgot-link')?.addEventListener('click', async function(e) {
    e.preventDefault();
    
    const email = prompt('Please enter your email address to reset password:');
    if (!email) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    try {
        await sendPasswordResetEmail(auth, email);
        
        // Store reset request in Firestore for tracking
        try {
            const resetRequestsRef = collection(db, 'passwordResetRequests');
            await addDoc(resetRequestsRef, {
                id: 'RESET-' + Date.now(),
                email: email,
                requestedAt: new Date().toISOString(),
                status: 'pending',
                userAgent: navigator.userAgent
            });
        } catch (err) {
            console.log('Could not store reset request:', err);
        }
        
        alert(`Password reset email sent to ${email}. Check your inbox and spam folder.`);
    } catch (error) {
        console.error('Password reset error:', error);
        if (error.code === 'auth/user-not-found') {
            alert('No account found with that email address');
        } else {
            alert('Failed to send reset email: ' + error.message);
        }
    }
});

// ===== SOCIAL LOGIN (Enhanced with Firebase) =====
document.querySelectorAll('.social-btn').forEach(button => {
    button.addEventListener('click', async function() {
        const providerType = this.classList.contains('google') ? 'google' : 'github';
        
        try {
            let authProvider;
            if (providerType === 'google') {
                authProvider = new GoogleAuthProvider();
            } else {
                authProvider = new GithubAuthProvider();
            }
            
            const result = await signInWithPopup(auth, authProvider);
            const user = result.user;
            
            // Check if user exists in Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            
            if (!userDoc.exists()) {
                // Create new user profile
                const username = (user.displayName?.replace(/\s/g, '') || user.email.split('@')[0]) + Math.floor(Math.random() * 1000);
                const userData = {
                    uid: user.uid,
                    username: username,
                    email: user.email,
                    role: 'client',
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    status: 'active',
                    photoURL: user.photoURL || null,
                    provider: providerType
                };
                
                await setDoc(doc(db, 'users', user.uid), userData);
                
                // Create referral code
                const newReferralCode = username.toUpperCase() + Math.floor(1000 + Math.random() * 9000);
                await setDoc(doc(db, 'referralCodes', newReferralCode), {
                    code: newReferralCode,
                    userId: user.uid,
                    username: username,
                    email: user.email,
                    createdAt: new Date().toISOString()
                });
                
                // Initialize collections
                try {
                    await setDoc(doc(db, 'carts', user.uid), { items: [] });
                    await setDoc(doc(db, 'wishlists', user.uid), { items: [] });
                    await setDoc(doc(db, 'orders', user.uid), { orders: [] });
                } catch (err) {
                    console.log('Could not initialize collections:', err);
                }
            } else {
                // Update last login
                await updateDoc(doc(db, 'users', user.uid), {
                    lastLogin: new Date().toISOString()
                });
            }
            
            // Get fresh user data
            const freshUserDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = freshUserDoc.exists() ? freshUserDoc.data() : null;
            
            // Set session
            localStorage.setItem('clientToken', user.uid);
            localStorage.setItem('clientUser', JSON.stringify({
                uid: user.uid,
                username: userData?.username || user.displayName || user.email.split('@')[0],
                email: user.email,
                role: userData?.role || 'client'
            }));
            
            showSuccess(`${providerType === 'google' ? 'Google' : 'GitHub'} login successful! Redirecting...`);
            setTimeout(() => window.location.href = 'client.html', 1500);
            
        } catch (error) {
            console.error(`${providerType} login error:`, error);
            showError(`${providerType === 'google' ? 'Google' : 'GitHub'} login failed: ${error.message}`);
        }
    });
});

// ===== ANIMATION STYLES =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { opacity: 0; transform: translate(-50%, -20px); }
        to { opacity: 1; transform: translate(-50%, 0); }
    }
    
    .strength-bar {
        height: 5px;
        background: #e0e0e0;
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: 5px;
        transition: all 0.3s ease;
    }
    
    .mismatch {
        color: #ff4757 !important;
    }
    
    .match {
        color: #2ed573 !important;
    }
`;
document.head.appendChild(style);

