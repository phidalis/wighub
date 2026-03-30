// Check if chatbot should be hidden (admin pages)
const currentPath = window.location.pathname;
const isAdminPage = currentPath.includes('admin-') || 
                    currentPath.includes('service-admin') || 
                    currentPath.includes('ai-chatbot-admin');

// ===== COMPLETE KNOWLEDGE BASE WITH GREETINGS =====
window.KNOWLEDGE_BASE = {
    faq: [
        {
            id: 'greeting_1',
            question: 'hello',
            answer: '👋 Hello! Welcome to WigHub! How can I help you today?\n\nI can help you with:\n• Finding products and wigs\n• Locating braiders\n• Tracking orders\n• Affiliate program info\n• Returns and shipping\n\nWhat would you like to know?',
            keywords: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'],
            category: 'faq'
        },
        {
            id: 'greeting_2',
            question: 'how are you',
            answer: '🤖 I\'m doing great, thanks for asking! I\'m here 24/7 to help you with any questions about WigHub. What can I do for you today?',
            keywords: ['how are you', 'how are you doing', 'you okay', 'what\'s up'],
            category: 'faq'
        },
        {
            id: 'greeting_3',
            question: 'what can you do',
            answer: '✨ **I can help you with:**\n\n• **Products**: Find wigs, skincare, haircare, fragrances, makeup\n• **Braiders**: Find professional braiders in your area\n• **Orders**: Track orders, check status, request cancellation\n• **Affiliate**: Commission rates, referral links, earnings\n• **Account**: Password reset, profile updates\n• **Support**: Contact info, ticket creation\n• **Shipping**: Costs, delivery times, tracking\n• **Returns**: Policy, process, refunds\n\nJust ask me anything! 🎯',
            keywords: ['what can you do', 'help', 'capabilities', 'features', 'what do you do'],
            category: 'faq'
        },
        {
            id: 'greeting_4',
            question: 'thank you',
            answer: '😊 You\'re very welcome! I\'m happy to help. Is there anything else I can assist you with today?',
            keywords: ['thank you', 'thanks', 'appreciate', 'grateful'],
            category: 'faq'
        },
        {
            id: 'faq_1',
            question: 'What is your return policy?',
            answer: '📦 **Return Policy**\n\n• 30-day return window from delivery date\n• Items must be unworn, unwashed, with original tags\n• Return shipping is customer\'s responsibility\n• Refunds processed within 3-5 business days\n• Final sale items cannot be returned\n\nNeed to return something? Contact support@wighub.com',
            keywords: ['return', 'refund', 'exchange', 'policy', 'send back', 'returning'],
            category: 'faq'
        },
        {
            id: 'faq_2',
            question: 'How much does shipping cost?',
            answer: '🚚 **Shipping Information**\n\n• **Free Shipping**: On orders over $100\n• **Standard Shipping**: $5.99 (3-5 business days)\n• **Express Shipping**: $12.99 (1-2 business days)\n• **International Shipping**: $19.99 (5-8 business days)\n\nAll orders include tracking. You\'ll receive a tracking number via email once your order ships.',
            keywords: ['shipping', 'delivery', 'cost', 'price', 'ship', 'deliver', 'how much'],
            category: 'faq'
        },
        {
            id: 'faq_3',
            question: 'What payment methods do you accept?',
            answer: '💳 **Payment Methods**\n\n• **M-Pesa** - Instant payment\n• **Credit/Debit Cards** - Visa, Mastercard, American Express\n• **PayPal** - Secure online payments\n• **Store Credit** - Available for affiliates\n\nAll payments are encrypted and secure. We never store your payment information.',
            keywords: ['payment', 'pay', 'card', 'mpesa', 'paypal', 'credit', 'debit'],
            category: 'faq'
        },
        {
            id: 'faq_4',
            question: 'How do I track my order?',
            answer: '🔍 **Track Your Order**\n\n1. Log into your account\n2. Go to "My Orders"\n3. Click "Track Order" next to your order\n4. Or use the tracking link in your confirmation email\n\nNeed help? Provide your order ID and I can help track it!',
            keywords: ['track', 'order status', 'where is my order', 'tracking', 'delivery status'],
            category: 'faq'
        },
        {
            id: 'faq_5',
            question: 'How can I become an affiliate?',
            answer: '💸 **Affiliate Program**\n\nAnyone can become an affiliate! Simply:\n\n1. Create a free account\n2. Go to the Affiliate Program section\n3. Get your unique referral link\n4. Share it with friends\n5. Earn 10% commission on their purchases!\n\nSign up today to start earning!',
            keywords: ['affiliate', 'commission', 'earn money', 'referral', 'make money', 'become affiliate'],
            category: 'affiliate'
        },
        {
            id: 'faq_6',
            question: 'Do you have braiders in Nairobi?',
            answer: '💇 **Braiders in Nairobi**\n\nYes! We have several professional braiders in Nairobi:\n\n• Sarah Beauty - Box Braids Specialist\n• Mary Hair Art - Fulani Braids\n• Grace Styles - Cornrows Expert\n\nCheck the "Find Braiders" section to view all available braiders in your location.',
            keywords: ['braider', 'nairobi', 'stylist', 'hair braiding', 'find braider'],
            category: 'braiders'
        },
        {
            id: 'faq_7',
            question: 'How do I contact customer support?',
            answer: '📞 **Customer Support**\n\n• **Email**: support@wighub.com\n• **Phone**: 0768832415\n• **Live Chat**: Available 24/7 (click the chat icon)\n• **Support Tickets**: Submit via your dashboard\n\nResponse time: Within 24 hours on business days',
            keywords: ['contact', 'support', 'help', 'customer service', 'reach', 'phone', 'email'],
            category: 'faq'
        },
        {
            id: 'faq_8',
            question: 'How do I change my password?',
            answer: '🔐 **Change Password**\n\n1. Log into your account\n2. Go to "My Profile"\n3. Click "Change Password"\n4. Enter current password\n5. Enter new password (min 6 characters)\n6. Confirm and save\n\nForgot your password? Click "Forgot Password" on the login page.',
            keywords: ['password', 'change password', 'reset password', 'forgot password'],
            category: 'faq'
        },
        {
            id: 'faq_9',
            question: 'What is your cancellation policy?',
            answer: '❌ **Cancellation Policy**\n\n• Orders can be cancelled within 1 hour of placement\n• Cancellation requests after 1 hour are subject to review\n• If your order has already shipped, you\'ll need to process a return\n• To cancel, go to My Orders and click "Request Cancellation"\n\nContact support immediately for cancellation assistance.',
            keywords: ['cancel', 'cancellation', 'cancel order', 'change order'],
            category: 'faq'
        },
        {
            id: 'faq_10',
            question: 'How do I find braiders in my area?',
            answer: '📍 **Find Braiders**\n\n1. Go to the "Braiders" section\n2. Use the location filter to select your city\n3. Filter by specialty (Box Braids, Cornrows, etc.)\n4. View profiles and portfolios\n5. Click "View Profile" to see contact details\n\nCities covered: Nairobi, Eldoret, Nakuru, Mombasa, Kisumu',
            keywords: ['find braider', 'near me', 'local braider', 'braider location'],
            category: 'braiders'
        }
    ],
    
    products: [
        {
            id: 'prod_1',
            question: 'What wigs do you sell?',
            answer: '💇 **Our Wig Collection**\n\nWe offer premium wigs in:\n• Brazilian Straight - $89.99\n• Peruvian Curly - $109.99\n• Malaysian Body Wave - $99.99\n• Synthetic Short Bob - $49.99\n\nAll wigs are 100% human hair (except synthetic), available in various lengths and colors.',
            keywords: ['wigs', 'wig', 'hair', 'extensions', 'brazilian', 'peruvian', 'malaysian'],
            category: 'products'
        },
        {
            id: 'prod_2',
            question: 'What skincare products do you have?',
            answer: '🧴 **Skincare Products**\n\n• Vitamin C Brightening Serum - $34.99\n• Hydrating Face Serum - $34.99\n• More products coming soon!\n\nAll products are dermatologist-tested and suitable for all skin types.',
            keywords: ['skincare', 'serum', 'face', 'skin', 'vitamin c'],
            category: 'products'
        },
        {
            id: 'prod_3',
            question: 'Do you sell hair care products?',
            answer: '💆 **Haircare Products**\n\n• Argan Oil Hair Mask - $24.99 (Deep conditioning)\n• More products coming soon!\n\nAll haircare products are designed to nourish and protect all hair types.',
            keywords: ['haircare', 'hair mask', 'hair oil', 'shampoo', 'conditioner'],
            category: 'products'
        },
        {
            id: 'prod_4',
            question: 'What fragrances do you have?',
            answer: '🌸 **Fragrances**\n\n• Midnight Rose Perfume - $79.99\n  Elegant floral with rose and vanilla notes\n\nMore fragrances coming soon! Perfect for all occasions.',
            keywords: ['perfume', 'fragrance', 'scent', 'cologne', 'rose'],
            category: 'products'
        },
        {
            id: 'prod_5',
            question: 'What makeup products do you sell?',
            answer: '💄 **Makeup Products**\n\n• Matte Liquid Lipstick - $19.99\n  Long-lasting, transfer-resistant, classic red\n\nMore makeup products coming soon! Including foundations, eyeshadows, and more.',
            keywords: ['makeup', 'lipstick', 'cosmetics', 'beauty'],
            category: 'products'
        }
    ],
    
    braiders: [
        {
            id: 'braider_1',
            question: 'Who are your top braiders?',
            answer: '🏆 **Top Rated Braiders**\n\n1. **Sarah Beauty** (4.8⭐) - Box Braids specialist\n2. **Mary Hair Art** (4.9⭐) - Fulani braids expert\n3. **Grace Styles** (4.5⭐) - Cornrows professional\n\nView their profiles to see portfolios and contact details!',
            keywords: ['top braiders', 'best braiders', 'highest rated', 'popular braiders'],
            category: 'braiders'
        },
        {
            id: 'braider_2',
            question: 'How do I book a braider?',
            answer: '📅 **Booking a Braider**\n\n1. Find a braider in your area\n2. View their profile and portfolio\n3. Contact them via phone or Instagram\n4. Schedule an appointment directly with them\n\nBraiders set their own availability and rates.',
            keywords: ['book braider', 'hire braider', 'appointment', 'schedule'],
            category: 'braiders'
        }
    ],
    
    affiliate: [
        {
            id: 'aff_1',
            question: 'How much commission can I earn?',
            answer: '💰 **Commission Rates**\n\n• Default Rate: 10% on all sales\n• Wigs & Extensions: 12%\n• Skincare/Makeup/Haircare: 8%\n• Fragrances: 10%\n\nPlus a $5 welcome bonus when your referral signs up!',
            keywords: ['commission', 'earnings', 'how much', 'percentage', 'rate'],
            category: 'affiliate'
        },
        {
            id: 'aff_2',
            question: 'How do I withdraw my earnings?',
            answer: '💸 **Withdrawing Earnings**\n\nYour earnings are added to your Store Credit automatically. You can use store credit for purchases on our site.\n\nTo withdraw as cash:\n1. Go to Affiliate Dashboard\n2. Click "Withdraw"\n3. Enter amount and payment details\n4. Minimum withdrawal: $20\n\nProcessing time: 3-5 business days',
            keywords: ['withdraw', 'cash out', 'get money', 'payout', 'transfer'],
            category: 'affiliate'
        },
        {
            id: 'aff_3',
            question: 'How do I get my referral link?',
            answer: '🔗 **Get Your Referral Link**\n\n1. Log into your account\n2. Go to "Affiliate Program" section\n3. Your unique referral link will be displayed\n4. Copy and share it with friends!\n\nEvery purchase made through your link earns you commission!',
            keywords: ['referral link', 'share link', 'invite link', 'affiliate link'],
            category: 'affiliate'
        }
    ],
    
    orders: [
        {
            id: 'order_1',
            question: 'How long does shipping take?',
            answer: '📦 **Shipping Times**\n\n• Standard: 3-5 business days\n• Express: 1-2 business days\n• International: 5-8 business days\n\nProcessing time: 1-2 business days before shipping.\n\nYou\'ll receive tracking information once your order ships.',
            keywords: ['shipping time', 'delivery time', 'how long', 'arrive', 'when will it arrive'],
            category: 'orders'
        }
    ]
};

// ===== FIREBASE SERVICE =====
const AIChatbotFirebase = {
    db: null,
    auth: null,
    
    init: function(db, auth) {
        this.db = db;
        this.auth = auth;
        console.log('🔥 Firebase service initialized');
        return this;
    },
    
    getAllKnowledgeBase: async function() {
        if (!this.db) return null;
        const snapshot = await getDocs(collection(this.db, 'aiKnowledge'));
        const knowledgeBase = { faq: [], products: [], braiders: [], affiliate: [], orders: [] };
        snapshot.forEach(doc => {
            const data = doc.data();
            if (knowledgeBase[data.category]) {
                knowledgeBase[data.category].push({ id: doc.id, ...data });
            }
        });
        return knowledgeBase;
    },
    
    addKnowledgeEntry: async function(entry) {
        if (!this.db) return null;
        const docRef = await addDoc(collection(this.db, 'aiKnowledge'), {
            ...entry, createdAt: new Date().toISOString(), usageCount: 0
        });
        return { id: docRef.id, ...entry };
    },
    
    updateKnowledgeUsage: async function(id) {
        if (!this.db) return false;
        const docRef = doc(this.db, 'aiKnowledge', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const current = docSnap.data().usageCount || 0;
            await updateDoc(docRef, { usageCount: current + 1, lastUsed: new Date().toISOString() });
        }
        return true;
    },
    
    logUnansweredQuestion: async function(question, userType, userId, page) {
        if (!this.db) return false;
        const unansweredRef = collection(this.db, 'aiUnanswered');
        const q = query(unansweredRef, where('question', '==', question));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            await addDoc(unansweredRef, {
                question, timestamp: new Date().toISOString(),
                userType, userId: userId || 'guest', page, count: 1, answered: false
            });
        } else {
            const docRef = snapshot.docs[0].ref;
            const currentCount = snapshot.docs[0].data().count || 1;
            await updateDoc(docRef, { count: currentCount + 1, lastAsked: new Date().toISOString() });
        }
        return true;
    },
    
    createSupportRequest: async function(data) {
        if (!this.db) return null;
        const docRef = await addDoc(collection(this.db, 'liveSupportRequests'), {
            ...data, status: 'waiting', timestamp: new Date().toISOString(), messages: []
        });
        return { id: docRef.id, ...data };
    },
    
    getSupportRequests: async function() {
        if (!this.db) return [];
        const snapshot = await getDocs(collection(this.db, 'liveSupportRequests'));
        const requests = [];
        snapshot.forEach(doc => requests.push({ id: doc.id, ...doc.data() }));
        return requests;
    },
    
    getUserSupportRequests: async function(userId) {
        if (!this.db) return [];
        const q = query(collection(this.db, 'liveSupportRequests'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        const requests = [];
        snapshot.forEach(doc => requests.push({ id: doc.id, ...doc.data() }));
        return requests;
    },
    
    updateSupportRequest: async function(id, updates) {
        if (!this.db) return false;
        await updateDoc(doc(this.db, 'liveSupportRequests', id), { ...updates, updatedAt: new Date().toISOString() });
        return true;
    },
    
    addSupportMessage: async function(requestId, message, from, adminName) {
        if (!this.db) return false;
        const docRef = doc(this.db, 'liveSupportRequests', requestId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const currentMessages = docSnap.data().messages || [];
            currentMessages.push({ from, message, timestamp: new Date().toISOString(), adminName });
            await updateDoc(docRef, { messages: currentMessages, lastMessage: message, lastActivity: new Date().toISOString() });
        }
        return true;
    },
    
    createNotification: async function(notification) {
        if (!this.db) return null;
        const docRef = await addDoc(collection(this.db, 'adminNotifications'), {
            ...notification, timestamp: new Date().toISOString(), read: false
        });
        return { id: docRef.id, ...notification };
    }
};
window.AIChatbotFirebase = AIChatbotFirebase;

// Only initialize if not on admin pages
if (!isAdminPage) {
    document.addEventListener('DOMContentLoaded', async function() {
        // Wait for Firebase to be initialized
        let attempts = 0;
        const waitForFirebase = setInterval(() => {
            if (window.db && window.auth) {
                clearInterval(waitForFirebase);
                console.log('🔥 Firebase detected, initializing chatbot...');
                window.AIChatbotFirebase.init(window.db, window.auth);
                if (window.WigHubAI && typeof window.WigHubAI.init === 'function') {
                    window.WigHubAI.init();
                }
            }
            attempts++;
            if (attempts > 50) {
                clearInterval(waitForFirebase);
                console.error('Firebase not initialized after 5 seconds');
            }
        }, 100);
    });
}

// ===== GLOBAL CHATBOT OBJECT =====
window.WigHubAI = {
    // Core properties
    version: '2.0',
    initialized: false,
    currentUser: null,
    userType: 'guest',
    currentPage: window.location.pathname,
    
    // Chat history for current session
    sessionHistory: [],
    
    // Learning data
    learningData: {
        unansweredQuestions: [],
        popularKeywords: {},
        userFeedback: []
    },
    
    // Knowledge base
    knowledgeBase: null,
    
    // Live support properties
    liveChatMode: false,
    currentSupportRequest: null,
    supportAgent: null,
    pendingCancellation: null,

    escapeHtml: function(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    saveLearningData: function() {
        // REMOVED: No longer using localStorage
        console.log('Learning data would save to Firebase');
    },

    trackQuestion: function(question) {
        if (!this.learningData.popularKeywords) {
            this.learningData.popularKeywords = {};
        }
        const words = question.toLowerCase().split(/\s+/);
        words.forEach(word => {
            if (word.length > 3) {
                this.learningData.popularKeywords[word] = (this.learningData.popularKeywords[word] || 0) + 1;
            }
        });
    },
    
    // ===== INITIALIZATION =====
    init: async function() {
        console.log('🤖 WigHub AI Initializing...');
        
        // Load knowledge base from Firebase
        if (window.AIChatbotFirebase.db) {
            const fbKnowledge = await window.AIChatbotFirebase.getAllKnowledgeBase();
            if (fbKnowledge && Object.values(fbKnowledge).flat().length > 0) {
                this.knowledgeBase = fbKnowledge;
                console.log('✅ Knowledge base loaded from Firebase:', Object.values(this.knowledgeBase).flat().length, 'entries');
            } else {
                this.knowledgeBase = window.KNOWLEDGE_BASE || { faq: [], products: [], braiders: [], affiliate: [] };
                // Save default knowledge to Firebase
                for (const category in this.knowledgeBase) {
                    for (const item of this.knowledgeBase[category]) {
                        await window.AIChatbotFirebase.addKnowledgeEntry(item);
                    }
                }
                console.log('✅ Default knowledge base saved to Firebase');
            }
        } else {
            console.error('❌ Firebase not initialized');
            this.knowledgeBase = window.KNOWLEDGE_BASE || { faq: [], products: [], braiders: [], affiliate: [] };
        }
        
        this.detectUser();
        this.injectChatbot();
        
        this.initialized = true;
        console.log('✅ WigHub AI Ready - User:', this.userType, this.currentUser?.username || 'Guest');
        
        return this;
    },

    getDeviceInfo: function() {
        return {
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            language: navigator.language,
            screen: `${screen.width}x${screen.height}`,
            timestamp: new Date().toISOString()
        };
    },

    endSession: function() {
        // REMOVED: No longer using localStorage
        console.log('Session ended');
    },

    // ===== USER DETECTION =====
    detectUser: function() {
        try {
            const clientUser = localStorage.getItem('clientUser');
            if (clientUser) {
                this.currentUser = JSON.parse(clientUser);
                this.userType = 'client';
                console.log('👤 Client logged in:', this.currentUser.username);
                return;
            }
            
            const braiderUser = localStorage.getItem('currentUser');
            if (braiderUser) {
                const user = JSON.parse(braiderUser);
                if (user.role === 'braider') {
                    this.currentUser = user;
                    this.userType = 'braider';
                    console.log('💇 Braider logged in:', this.currentUser.name);
                    return;
                }
            }
            
            // Check for Firebase auth user
            if (window.auth && window.auth.currentUser) {
                this.currentUser = {
                    id: window.auth.currentUser.uid,
                    email: window.auth.currentUser.email,
                    username: window.auth.currentUser.displayName || window.auth.currentUser.email.split('@')[0]
                };
                this.userType = 'client';
                console.log('👤 Firebase user logged in:', this.currentUser.username);
                return;
            }
            
            this.currentUser = null;
            this.userType = 'guest';
            console.log('👤 Guest user');
            
        } catch (e) {
            console.error('Error detecting user:', e);
            this.userType = 'guest';
        }
    },
       
    loadDynamicResponses: function() {
        // REMOVED: No longer using localStorage
        console.log('Loading knowledge from Firebase only');
    },
    
    // ===== CHATBOT UI INJECTION =====
    injectChatbot: function() {
        if (document.getElementById('wighub-ai-chatbot')) return;
        
        const html = `
            <div id="wighub-ai-chatbot" class="wighub-ai-container">
                <button class="ai-chat-toggle" id="aiChatToggle">
                    <i class="fas fa-robot"></i>
                    <span class="ai-status-dot"></span>
                </button>
                <div class="ai-chat-window" id="aiChatWindow">
                    <div class="ai-chat-header">
                        <div class="ai-header-left">
                            <i class="fas fa-robot"></i>
                            <div>
                                <h3>WigHub AI Assistant</h3>
                                <span class="ai-status">🟢 Online - 24/7</span>
                            </div>
                        </div>
                        <div class="ai-header-right">
                            <button class="ai-header-btn" id="aiMinimizeChat" title="Minimize">
                                <i class="fas fa-minus"></i>
                            </button>
                            <button class="ai-header-btn" id="aiCloseChat" title="Close">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div class="ai-chat-messages" id="aiChatMessages"></div>
                    <div class="ai-quick-actions" id="aiQuickActions"></div>
                    <div class="ai-chat-input-area">
                        <input type="text" id="aiChatInput" placeholder="Ask me anything..." autocomplete="off">
                        <button id="aiChatSend">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                    <div class="ai-powered-by">
                        Powered by WigHub AI v2.0
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', html);
        
        document.getElementById('aiChatToggle').addEventListener('click', () => this.toggleChat());
        document.getElementById('aiMinimizeChat').addEventListener('click', () => this.minimizeChat());
        document.getElementById('aiCloseChat').addEventListener('click', () => this.closeChat());
        document.getElementById('aiChatSend').addEventListener('click', () => this.sendMessage());
        document.getElementById('aiChatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        setTimeout(() => {
            this.showWelcomeMessage();
            this.showQuickActions();
        }, 500);
    },
    
    toggleChat: function() {
        const windowEl = document.getElementById('aiChatWindow');
        const toggle = document.getElementById('aiChatToggle');
        
        if (windowEl.classList.contains('open')) {
            windowEl.classList.remove('open');
            toggle.innerHTML = '<i class="fas fa-robot"></i><span class="ai-status-dot"></span>';
        } else {
            windowEl.classList.add('open');
            toggle.innerHTML = '<i class="fas fa-times"></i>';
            document.getElementById('aiChatInput').focus();
        }
    },
    
    minimizeChat: function() {
        document.getElementById('aiChatWindow').classList.remove('open');
        document.getElementById('aiChatToggle').innerHTML = '<i class="fas fa-robot"></i><span class="ai-status-dot"></span>';
    },
    
    closeChat: function() {
        document.getElementById('aiChatWindow').classList.remove('open');
        document.getElementById('aiChatToggle').innerHTML = '<i class="fas fa-robot"></i><span class="ai-status-dot"></span>';
    },
    
    showWelcomeMessage: function() {
        let welcome = "Hi there! 👋 I'm your WigHub AI assistant. ";
        
        if (this.userType === 'client') {
            welcome += `Welcome back, ${this.currentUser.username}! `;
        } else if (this.userType === 'braider') {
            welcome += `Hello ${this.currentUser.name}! I see you're logged in as a braider. `;
        }
        
        welcome += "How can I help you today?";
        
        this.addMessage(welcome, 'bot');
    },
    
    showQuickActions: function() {
        const container = document.getElementById('aiQuickActions');
        if (!container) return;
        
        let actions = [];
        
        if (this.userType === 'client') {
            actions = [
                { id: 'my_orders', text: '📦 My Orders', icon: 'fas fa-box' },
                { id: 'track', text: '📍 Track Order', icon: 'fas fa-map-marker-alt' },
                { id: 'wishlist', text: '❤️ Wishlist', icon: 'fas fa-heart' },
                { id: 'find_products', text: '🔍 Find Products', icon: 'fas fa-search' }
            ];
        } else if (this.userType === 'braider') {
            actions = [
                { id: 'my_uploads', text: '📸 My Uploads', icon: 'fas fa-images' },
                { id: 'profile', text: '👤 My Profile', icon: 'fas fa-user' },
                { id: 'earnings', text: '💰 Earnings', icon: 'fas fa-dollar-sign' }
            ];
        } else {
            actions = [
                { id: 'products', text: '🛍️ Browse Products', icon: 'fas fa-wig' },
                { id: 'braiders', text: '💇 Find Braiders', icon: 'fas fa-cut' },
                { id: 'shipping', text: '🚚 Shipping Info', icon: 'fas fa-truck' },
                { id: 'help', text: '❓ Help', icon: 'fas fa-question-circle' }
            ];
        }
        
        container.innerHTML = actions.map(a => `
            <button class="ai-quick-btn" onclick="WigHubAI.quickAction('${a.id}')">
                <i class="${a.icon}"></i> ${a.text}
            </button>
        `).join('');
    },
    
    quickAction: function(actionId) {
        const actions = {
            my_orders: () => this.handleMyOrders(),
            track: () => this.handleTrackOrder(),
            wishlist: () => this.handleWishlist(),
            find_products: () => this.handleFindProduct(""),
            my_uploads: () => this.handleMyUploads(),
            profile: () => this.handleBraiderProfile(),
            earnings: () => this.handleBraiderEarnings(),
            products: () => this.handleFindProduct(""),
            braiders: () => this.handleFindBraider(""),
            shipping: () => this.answerFromKnowledge('shipping'),
            help: () => this.showHelp()
        };
        
        if (actions[actionId]) {
            this.addMessage(this.getActionMessage(actionId), 'user');
            setTimeout(() => actions[actionId](), 500);
        }
    },
    
    getActionMessage: function(actionId) {
        const messages = {
            my_orders: "Show me my orders",
            track: "I want to track an order",
            wishlist: "Show my wishlist",
            find_products: "Help me find products",
            my_uploads: "Show my uploads",
            profile: "Show my profile",
            earnings: "Show my earnings",
            products: "Show me products",
            braiders: "Find braiders",
            shipping: "Tell me about shipping",
            help: "What can you do?"
        };
        return messages[actionId] || actionId;
    },
    
    // ===== MESSAGE PROCESSING ENGINE =====
    sendMessage: function() {
        const input = document.getElementById('aiChatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addMessage(message, 'user');
        input.value = '';
        
        if (this.liveChatMode) {
            this.sendLiveMessage(message);
            if (!this.messagePollingInterval) {
                this.messagePollingInterval = setInterval(() => {
                    this.checkForAdminMessages();
                }, 2000);
            }
            return;
        }
        
        this.trackQuestion(message);
        this.showTypingIndicator();
        
        setTimeout(() => {
            this.hideTypingIndicator();
            this.processMessage(message);
        }, 500 + Math.random() * 500);
    },
    
    sendLiveMessage: async function(message) {
        if (!this.currentSupportRequest || !window.AIChatbotFirebase.db) return;
        
        await window.AIChatbotFirebase.addSupportMessage(
            this.currentSupportRequest,
            message,
            'user'
        );
        
        setTimeout(() => {
            this.showTypingIndicator();
            setTimeout(() => this.hideTypingIndicator(), 1000);
        }, 500);
    },
    
    addMessage: function(text, sender, options = {}) {
        const messagesDiv = document.getElementById('aiChatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ai-${sender}`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (typeof text === 'string') {
            messageDiv.innerHTML = `
                <div class="ai-message-content">
                    ${this.formatMessage(text)}
                </div>
                <span class="ai-message-time">${time}</span>
            `;
        } else {
            messageDiv.appendChild(text);
            const timeSpan = document.createElement('span');
            timeSpan.className = 'ai-message-time';
            timeSpan.textContent = time;
            messageDiv.appendChild(timeSpan);
        }
        
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    },
    
    formatMessage: function(text) {
        text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        text = text.replace(/\n/g, '<br>');
        return text;
    },
    
    showTypingIndicator: function() {
        const messagesDiv = document.getElementById('aiChatMessages');
        const indicator = document.createElement('div');
        indicator.className = 'ai-message ai-bot ai-typing';
        indicator.id = 'aiTypingIndicator';
        indicator.innerHTML = '<span></span><span></span><span></span>';
        messagesDiv.appendChild(indicator);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    },
    
    hideTypingIndicator: function() {
        const indicator = document.getElementById('aiTypingIndicator');
        if (indicator) indicator.remove();
    },
    
    // ===== PROCESS MESSAGE - THE BRAIN =====
    processMessage: async function(message) {
        const lowerMessage = message.toLowerCase();
        
        const supportPatterns = /\b(support|help|assistance|need help|i need help|can you help|help me|how to get help)\b/i;
        if (supportPatterns.test(message)) {
            console.log('🟢 Support intent detected');
            this.showLiveSupportOption(message);
            return;
        }
        
        const knowledgeMatch = this.searchKnowledgeBase(message);
        if (knowledgeMatch) {
            this.addMessage(knowledgeMatch.answer, 'bot');
            await this.updateKnowledgeUsage(knowledgeMatch.id);
            return;
        }
        
        const orderMatch = message.match(/#?(ORD[A-Z0-9]{4,}|[A-Z0-9]{6,})/i);
        if (orderMatch) {
            this.handleOrderQuery(orderMatch[1]);
            return;
        }
        
        const braiderMatch = message.match(/#?(BRD\d+)/i);
        if (braiderMatch) {
            this.handleBraiderQuery(braiderMatch[1]);
            return;
        }
        
        const intent = this.recognizeIntent(message);
        if (intent && intent !== 'support') {
            this.executeIntent(intent, message);
            return;
        }
        
        const dataResponse = this.queryLocalStorage(message);
        if (dataResponse) {
            this.addMessage(dataResponse, 'bot');
            return;
        }
        
        await this.logUnansweredQuestion(message);
        
        const suggestions = this.findSimilarQuestions(message);
        if (suggestions.length > 0) {
            let response = "I'm not sure about that. Did you mean one of these?\n\n";
            suggestions.forEach(s => {
                response += `• ${s.question}\n`;
            });
            this.addMessage(response, 'bot');
        } else {
            this.showLiveSupportOption(message);
        }
    },
    
    // ===== LIVE SUPPORT FUNCTIONS =====
    showLiveSupportOption: function(question) {
        this.pendingSupportQuestion = question;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'ai-message ai-bot';
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="ai-message-content">
                <p>🙋 I want to help you with: <strong>"${this.escapeHtml(question.substring(0, 100))}"</strong></p>
                <p>Would you like to speak with a live support agent?</p>
                <div style="display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
                    <button class="ai-quick-btn" onclick="WigHubAI.requestLiveSupport()" style="background: #28a745; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer;">
                        <i class="fas fa-headset"></i> Yes, Connect to Live Support
                    </button>
                    <button class="ai-quick-btn" onclick="WigHubAI.showContactOptions()" style="background: #3498db; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer;">
                        <i class="fas fa-envelope"></i> Contact via Email/Phone
                    </button>
                    <button class="ai-quick-btn" onclick="WigHubAI.closeLiveSupportPrompt()" style="background: #6c757d; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer;">
                        <i class="fas fa-times"></i> Not Now
                    </button>
                </div>
            </div>
            <span class="ai-message-time">${time}</span>
        `;
        
        const messagesDiv = document.getElementById('aiChatMessages');
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    },
    
    closeLiveSupportPrompt: function() {
        this.addMessage("Okay! If you need help later, just type 'support' or click the chat button again. 😊", 'bot');
    },
    
    checkForAdminMessages: async function() {
        if (!this.liveChatMode || !this.currentSupportRequest || !window.AIChatbotFirebase.db) return;
        
        const supportRequests = await window.AIChatbotFirebase.getUserSupportRequests(
            this.currentUser?.id || 'guest'
        );
        const currentChat = supportRequests.find(r => r.id === this.currentSupportRequest);
        
        if (!currentChat) return;
        
        if (currentChat.status === 'ended' && this.liveChatMode === true) {
            this.addMessage("👋 The support agent has ended this chat. I'm still here to help you.", 'bot');
            this.liveChatMode = false;
            this.currentSupportRequest = null;
            this.supportAgent = null;
            if (this.messagePollingInterval) clearInterval(this.messagePollingInterval);
            const headerLeft = document.querySelector('.ai-chat-header .ai-header-left div');
            if (headerLeft) {
                headerLeft.innerHTML = `<h3 style="margin:0;">WigHub AI Assistant</h3><span class="ai-status">🟢 Online - 24/7</span>`;
            }
            this.showQuickActions();
            return;
        }
        
        if (this.liveChatMode && currentChat.messages && currentChat.messages.length > 0) {
            const lastMessageTime = this.lastAdminMessageTime || 0;
            currentChat.messages.forEach(msg => {
                const msgTime = new Date(msg.timestamp).getTime();
                if (msg.from === 'admin' && msgTime > lastMessageTime) {
                    this.addMessage(msg.message, 'bot');
                    this.lastAdminMessageTime = msgTime;
                }
            });
        }
    },
    
    requestLiveSupport: async function(question) {
        if (!window.AIChatbotFirebase.db) {
            this.addMessage("❌ Unable to connect to support. Please try again later.", 'bot');
            return;
        }
        
        if (!question && this.pendingSupportQuestion) question = this.pendingSupportQuestion;
        if (!question) question = "General support request";
        
        this.addMessage("🟢 Connecting you to live support... Please wait.", 'bot');
        
        const supportRequest = {
            userId: this.currentUser?.id || this.currentUser?.email || 'guest_' + Date.now(),
            username: this.currentUser?.username || this.currentUser?.name || 'Guest',
            userType: this.userType || 'guest',
            question: question,
            page: this.currentPage || window.location.pathname,
            deviceInfo: this.getDeviceInfo(),
            userAvatar: this.currentUser?.avatar || null
        };
        
        const result = await window.AIChatbotFirebase.createSupportRequest(supportRequest);
        
        if (result) {
            console.log('📋 Support request saved to Firebase:', result.id);
            await window.AIChatbotFirebase.createNotification({
                type: 'live_support_request',
                title: 'New Live Support Request',
                message: `🟢 ${supportRequest.username} (${supportRequest.userType}) requested live support`,
                requestId: result.id,
                priority: 'high'
            });
            this.checkForAgentAssignment(result.id);
        } else {
            this.addMessage("❌ Failed to connect to support. Please try again later.", 'bot');
        }
        
        this.pendingSupportQuestion = null;
    },
    
    checkForAgentAssignment: function(requestId) {
        if (this.assignmentCheckInterval) clearInterval(this.assignmentCheckInterval);
        console.log('🔍 Checking for agent assignment for:', requestId);
        
        this.assignmentCheckInterval = setInterval(async () => {
            if (!window.AIChatbotFirebase.db) return;
            
            const requests = await window.AIChatbotFirebase.getUserSupportRequests(
                this.currentUser?.id || 'guest'
            );
            const request = requests.find(r => r.id === requestId);
            
            if (!request) {
                clearInterval(this.assignmentCheckInterval);
                this.assignmentCheckInterval = null;
                this.addMessage("Your support request was cancelled.", 'bot');
                return;
            }
            
            if (request.status === 'ended') {
                clearInterval(this.assignmentCheckInterval);
                this.assignmentCheckInterval = null;
                this.addMessage("The support request was closed.", 'bot');
                return;
            }
            
            if (request && (request.status === 'active' || request.assignedTo)) {
                clearInterval(this.assignmentCheckInterval);
                this.assignmentCheckInterval = null;
                const agentName = request.assignedTo || 'Support Agent';
                this.enableLiveChat(requestId, agentName);
                try { this.playNotificationSound(); } catch(e) {}
            }
        }, 2000);
        
        setTimeout(() => {
            if (this.assignmentCheckInterval) {
                clearInterval(this.assignmentCheckInterval);
                this.assignmentCheckInterval = null;
                this.addMessage("⏱️ Still waiting? Contact us: 📞 0768832415 or 📧 support@wighub.com", 'bot');
            }
        }, 180000);
    },
    
    enableLiveChat: function(requestId, agentName) {
        this.liveChatMode = true;
        this.currentSupportRequest = requestId;
        this.supportAgent = agentName;
        this.lastAdminMessageTime = Date.now();
        
        const headerLeft = document.querySelector('.ai-chat-header .ai-header-left div');
        if (headerLeft) {
            headerLeft.innerHTML = `
                <h3 style="margin:0;">Live Support</h3>
                <span class="ai-status" style="color: #ffd700;">💬 Chatting with ${agentName}</span>
            `;
        }
        
        const headerTitle = document.querySelector('.ai-chat-header .ai-header-left h3');
        if (headerTitle) headerTitle.textContent = 'Live Support';
        
        if (this.messagePollingInterval) clearInterval(this.messagePollingInterval);
        this.messagePollingInterval = setInterval(() => {
            this.checkForAdminMessages();
        }, 2000);
        
        this.addMessage(`✅ You are now connected with support agent ${agentName}. They will assist you shortly.`, 'bot');
        
        const quickActions = document.getElementById('aiQuickActions');
        if (quickActions) {
            quickActions.innerHTML = `
                <button class="ai-quick-btn" onclick="WigHubAI.endLiveChat()" style="background: #dc3545; color: white;">
                    <i class="fas fa-times-circle"></i> End Chat
                </button>
                <button class="ai-quick-btn" onclick="WigHubAI.showContactOptions()">
                    <i class="fas fa-envelope"></i> Contact Support
                </button>
            `;
        }
        
        document.getElementById('aiChatInput').focus();
    },
    
    playNotificationSound: function() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            console.log('Sound notification not supported');
        }
    },
    
    showContactOptions: function() {
        this.addMessage(
            "📞 Contact Options\n\n" +
            "• Phone: 0768832415 (24/7)\n" +
            "• Email: support@wighub.com\n" +
            "• WhatsApp: +254768832415\n" +
            "• Support Tickets: Available in your dashboard\n\n" +
            "Our team typically responds within 1 hour during business hours.",
            'bot'
        );
    },
    
    endLiveChat: async function() {
        if (!this.currentSupportRequest || !window.AIChatbotFirebase.db) {
            this.addMessage("No active chat to end.", 'bot');
            return;
        }
        
        this.addMessage("Chat ended. Thank you for contacting WigHub support!", 'bot');
        
        await window.AIChatbotFirebase.updateSupportRequest(this.currentSupportRequest, {
            status: 'ended',
            endedAt: new Date().toISOString()
        });
        
        await window.AIChatbotFirebase.addSupportMessage(
            this.currentSupportRequest,
            'User ended the chat',
            'system'
        );
        
        this.liveChatMode = false;
        this.currentSupportRequest = null;
        this.supportAgent = null;
        
        if (this.messagePollingInterval) clearInterval(this.messagePollingInterval);
        
        const headerLeft = document.querySelector('.ai-chat-header .ai-header-left div');
        if (headerLeft) {
            headerLeft.innerHTML = `<h3 style="margin:0;">WigHub AI Assistant</h3><span class="ai-status">🟢 Online - 24/7</span>`;
        }
        this.showQuickActions();
    },
    
    searchKnowledgeBase: function(message) {
        const lowerMessage = message.toLowerCase().trim();
        const words = lowerMessage.split(/\s+/).filter(w => w.length > 2);
        
        let bestMatch = null;
        let bestScore = 0;
        
        if (!this.knowledgeBase) {
            this.knowledgeBase = { faq: [], products: [], braiders: [], affiliate: [], orders: [] };
        }
        
        for (const category in this.knowledgeBase) {
            const items = this.knowledgeBase[category];
            if (!Array.isArray(items)) continue;
            
            items.forEach(item => {
                let score = 0;
                
                if (!item.question || !item.answer) return;
                
                if (item.question.toLowerCase() === lowerMessage) {
                    score = 100;
                }
                
                if (item.keywords && Array.isArray(item.keywords)) {
                    item.keywords.forEach(keyword => {
                        if (lowerMessage.includes(keyword.toLowerCase())) {
                            score += 15;
                        }
                    });
                }
                
                const greetings = ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
                if (greetings.some(g => lowerMessage.includes(g))) {
                    const greetingItem = items.find(i => i.id === 'greeting_1');
                    if (greetingItem && greetingItem === item) {
                        score += 25;
                    }
                }
                
                const qWords = item.question.toLowerCase().split(/\s+/);
                words.forEach(word => {
                    if (qWords.some(qw => qw.includes(word) || word.includes(qw))) {
                        score += 5;
                    }
                });
                
                const matchingWords = words.filter(w => item.question.toLowerCase().includes(w)).length;
                if (matchingWords > 1) {
                    score += matchingWords * 4;
                }
                
                if (item.keywords && item.keywords.length > 0) {
                    const matchedKeywords = item.keywords.filter(k => lowerMessage.includes(k.toLowerCase())).length;
                    if (matchedKeywords >= 2) {
                        score += matchedKeywords * 6;
                    }
                }
                
                if (score > bestScore && score > 3) {
                    bestScore = score;
                    bestMatch = item;
                }
            });
        }
        
        if (bestMatch) {
            console.log('✅ Found match:', bestMatch.question);
        } else {
            console.log('❌ No match found for:', message);
            return {
                question: 'default',
                answer: "I'm not sure I understand that question. Could you rephrase it?\n\nHere are some things I can help with:\n• Product information\n• Finding braiders\n• Order tracking\n• Shipping and returns\n• Affiliate program\n\nTry asking: 'What products do you sell?' or 'How do I find a braider?'",
                id: 'default_response',
                keywords: []
            };
        }
        
        return bestMatch;
    },
    
    updateKnowledgeUsage: async function(id) {
        if (window.AIChatbotFirebase.db) {
            await window.AIChatbotFirebase.updateKnowledgeUsage(id);
        }
    },
    
    // ===== INTENT RECOGNITION =====
    recognizeIntent: function(message) {
        const patterns = {
            order_status: /\b(order|where is|track|status).*?(order|purchase|shipment)/i,
            cancel_order: /\b(cancel|cancellation).*?(order|purchase)/i,
            my_orders: /\b(my|recent|all).*?orders?\b/i,
            support: /\b(support|help|assistance|need help|i need help|can you help|help me|how to get help)\b/i,
            find_product: /\b(find|search|looking for|have|get).*?(wig|product|braid|serum|lipstick)/i,
            product_stock: /\b(in stock|available|stock|when).*?(wig|product)/i,
            product_price: /\b(price|cost|how much).*?(wig|product)/i,
            find_braider: /\b(find|book|hire).*?braider/i,
            braider_location: /\b(braider|stylist).*?(in|at|near).*?(nairobi|eldoret|mombasa|nakuru|kisumu)/i,
            top_braiders: /\b(best|top|highest rated).*?braider/i,
            commission: /\b(commission|earnings|how much.*?earned)/i,
            referral_link: /\b(referral|share.*?link|invite)/i,
            change_password: /\b(change|reset|update).*?password/i,
            profile_info: /\b(my|view).*?(profile|info|details)/i,
            wishlist: /\b(my|view).*?wishlist/i,
            whats_on_page: /\b(what|show|tell).*?(on this|this page|current)/i,
            who_am_i: /\b(who am i|my account|my details)/i,
            help: /\b(help|what can you do|support|assist)/i,
            contact: /\b(contact|email|phone|call|reach)/i,
            policy: /\b(return|shipping|payment|policy|terms)/i
        };
        
        for (const [intent, pattern] of Object.entries(patterns)) {
            if (pattern.test(message)) {
                return intent;
            }
        }
        return null;
    },
    
    executeIntent: function(intent, message) {
        const handlers = {
            order_status: () => this.handleOrderStatus(message),
            cancel_order: () => this.handleCancelOrder(message),
            my_orders: () => this.handleMyOrders(),
            support: () => this.handleSupportRequest(),
            find_product: () => this.handleFindProduct(message),
            product_stock: () => this.handleProductStock(message),
            product_price: () => this.handleProductPrice(message),
            find_braider: () => this.handleFindBraider(message),
            braider_location: () => this.handleBraiderLocation(message),
            top_braiders: () => this.handleTopBraiders(),
            commission: () => this.handleCommission(),
            referral_link: () => this.handleReferralLink(),
            change_password: () => this.handleChangePassword(),
            profile_info: () => this.handleProfileInfo(),
            wishlist: () => this.handleWishlist(),
            whats_on_page: () => this.handleWhatsonPage(),
            who_am_i: () => this.handleWhoAmI(),
            help: () => this.showHelp(),
            contact: () => this.handleContact(),
            policy: () => this.handlePolicy(message)
        };
        
        if (handlers[intent]) {
            handlers[intent]();
        } else {
            this.answerFromKnowledge('general');
        }
    },
    
    // ===== LOCAL STORAGE QUERY ENGINE =====
    queryLocalStorage: function(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('how many') && lowerMessage.includes('product')) {
            const products = JSON.parse(localStorage.getItem('wigProducts') || '[]');
            return `We currently have **${products.length} products** available across all categories.`;
        }
        
        if (lowerMessage.includes('how many') && lowerMessage.includes('braider')) {
            const braiders = JSON.parse(localStorage.getItem('braiders') || '[]');
            const activeBraiders = braiders.filter(b => b.role === 'braider').length;
            return `We have **${activeBraiders} active braiders** in our network.`;
        }
        
        if (lowerMessage.includes('how many') && lowerMessage.includes('order') && this.currentUser) {
            const ordersKey = `orders_${this.currentUser.email}`;
            const orders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
            return `You have placed **${orders.length} orders** with us.`;
        }
        
        if (lowerMessage.includes('store credit') || lowerMessage.includes('balance')) {
            if (!this.currentUser) return null;
            const earningsKey = `affiliate_earnings_${this.currentUser.email}`;
            const earnings = JSON.parse(localStorage.getItem(earningsKey) || '[]');
            const total = earnings.reduce((sum, e) => sum + e.amount, 0);
            const used = earnings.filter(e => e.status === 'used').reduce((sum, e) => sum + e.amount, 0);
            const available = total - used;
            return `💰 Your store credit balance is **$${available.toFixed(2)}**. Total earned: $${total.toFixed(2)}.`;
        }
        
        return null;
    },
    
    // ===== FIND SIMILAR QUESTIONS =====
    findSimilarQuestions: function(message) {
        const lowerMessage = message.toLowerCase();
        const words = lowerMessage.split(/\s+/).filter(w => w.length > 3);
        const suggestions = [];
        
        for (const category in this.knowledgeBase) {
            const items = this.knowledgeBase[category];
            if (!Array.isArray(items)) continue;
            
            items.forEach(item => {
                let score = 0;
                words.forEach(word => {
                    if (item.question?.toLowerCase().includes(word)) score++;
                });
                if (score > 1) {
                    suggestions.push({ question: item.question, score: score });
                }
            });
        }
        
        suggestions.sort((a, b) => b.score - a.score);
        return suggestions.slice(0, 3);
    },
    
    logUnansweredQuestion: async function(question) {
        console.log('📝 Logging unanswered question to Firebase:', question);
        
        if (window.AIChatbotFirebase.db) {
            await window.AIChatbotFirebase.logUnansweredQuestion(
                question,
                this.userType,
                this.currentUser?.id || this.currentUser?.email || 'guest',
                this.currentPage
            );
            
            await window.AIChatbotFirebase.createNotification({
                type: 'unanswered_question',
                message: `❓ New unanswered question: "${question.substring(0, 50)}..."`,
                question: question
            });
        }
    },
    
    // ===== HANDLER FUNCTIONS =====
    handleOrderStatus: function(message) {
        const orderMatch = message.match(/#?(ORD[A-Z0-9]{4,}|[A-Z0-9]{6,})/i);
        if (orderMatch) {
            this.getOrderDetails(orderMatch[1]);
        } else {
            this.addMessage("Please provide your order ID (e.g., ORD12345)", 'bot');
        }
    },
    
    getOrderDetails: function(orderId) {
        let foundOrder = null;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('orders_')) {
                const orders = JSON.parse(localStorage.getItem(key) || '[]');
                const order = orders.find(o => o.id === orderId || o.id === orderId.replace('#', ''));
                if (order) {
                    foundOrder = order;
                    break;
                }
            }
        }
        
        if (!foundOrder) {
            const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
            foundOrder = guestOrders.find(o => o.id === orderId || o.id === orderId.replace('#', ''));
        }
        
        if (foundOrder) {
            const date = new Date(foundOrder.date).toLocaleDateString();
            const status = foundOrder.status || 'processing';
            const statusEmoji = {
                'processing': '⏳',
                'verification': '✓',
                'packaging': '📦',
                'out_for_delivery': '🚚',
                'completed': '✅',
                'cancelled': '❌'
            }[status] || '⏳';
            
            let response = `📦 **Order ${foundOrder.id}**\n`;
            response += `${statusEmoji} Status: **${status}**\n`;
            response += `📅 Date: ${date}\n`;
            response += `💰 Total: $${(foundOrder.total || 0).toFixed(2)}\n`;
            response += `📦 Items: ${foundOrder.items?.length || 0}\n\n`;
            this.addMessage(response, 'bot');
        } else {
            this.addMessage("I couldn't find an order with that ID. Please check and try again.", 'bot');
        }
    },
    
    handleSupportRequest: function() {
        this.showLiveSupportOption("support request");
    },
    
    handleOrderQuery: function(orderId) {
        this.getOrderDetails(orderId);
    },
    
    handleBraiderQuery: function(braiderId) {
        const braiders = JSON.parse(localStorage.getItem('braiders') || '[]');
        const braider = braiders.find(b => b.id === braiderId || b.braiderId === braiderId);
        
        if (braider) {
            let response = `👤 **Braider Profile**\n\n`;
            response += `**${braider.name}**\n`;
            response += `📍 ${braider.profile?.location || 'N/A'}\n`;
            response += `💇 ${braider.profile?.speciality || 'N/A'}\n`;
            response += `⭐ ${braider.profile?.rating || 0} stars\n`;
            response += `📸 ${braider.uploads?.filter(u => u.status === 'approved').length || 0} works`;
            this.addMessage(response, 'bot');
        } else {
            this.addMessage("Braider not found.", 'bot');
        }
    },
    
    handleMyOrders: function() {
        if (!this.currentUser || this.userType !== 'client') {
            this.addMessage("Please login as a client to view your orders.", 'bot');
            return;
        }
        
        const email = this.currentUser.email;
        const ordersKey = `orders_${email}`;
        const orders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
        
        if (orders.length === 0) {
            this.addMessage("You haven't placed any orders yet. Ready to start shopping?", 'bot');
        } else {
            let message = "📋 **Your Recent Orders:**\n\n";
            orders.slice(0, 5).forEach(order => {
                const date = new Date(order.date).toLocaleDateString();
                const statusEmoji = order.status === 'completed' ? '✅' : order.status === 'cancelled' ? '❌' : '⏳';
                message += `${statusEmoji} **#${order.id}** - $${(order.total || 0).toFixed(2)} (${order.status})\n`;
                message += `   📅 ${date}\n\n`;
            });
            if (orders.length > 5) message += `... and ${orders.length - 5} more orders.`;
            this.addMessage(message, 'bot');
        }
    },
    
    handleCancelOrder: function(message) {
        if (!this.currentUser) {
            this.addMessage("Please login to cancel an order.", 'bot');
            return;
        }
        
        const orderMatch = message.match(/#?(ORD[A-Z0-9]{4,}|[A-Z0-9]{6,})/i);
        if (orderMatch) {
            const orderId = orderMatch[1];
            const email = this.currentUser.email;
            const ordersKey = `orders_${email}`;
            const orders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
            const order = orders.find(o => o.id === orderId);
            
            if (order) {
                this.addMessage(`Are you sure you want to cancel order #${orderId}? Type 'yes' to confirm.`, 'bot');
                this.pendingCancellation = { orderId, email };
            } else {
                this.addMessage("Order not found. Please check the order ID.", 'bot');
            }
        } else {
            this.addMessage("Please provide the order ID you'd like to cancel.", 'bot');
        }
    },
    
    handleFindProduct: function(message) {
        const products = JSON.parse(localStorage.getItem('wigProducts') || '[]');
        const searchTerms = message.toLowerCase()
            .replace(/(find|search|looking for|have|get|show|products)/gi, '')
            .trim().split(/\s+/).filter(term => term.length > 2);
        
        if (searchTerms.length === 0) {
            const categories = [...new Set(products.map(p => p.category))].filter(Boolean);
            let response = "What type of product are you looking for?\n\n";
            categories.slice(0, 8).forEach(cat => response += `• **${cat}**\n`);
            this.addMessage(response, 'bot');
            return;
        }
        
        const matches = products.filter(p => {
            const searchText = `${p.name} ${p.category} ${p.description} ${p.productType || ''}`.toLowerCase();
            return searchTerms.some(term => searchText.includes(term));
        }).slice(0, 5);
        
        if (matches.length === 0) {
            this.addMessage("I couldn't find any products matching your search. Try different keywords?", 'bot');
        } else {
            let response = `🔍 Found **${matches.length}** products:\n\n`;
            matches.forEach(product => {
                const stockEmoji = product.stock > 0 ? '✅' : '❌';
                response += `${stockEmoji} **${product.name}**\n`;
                response += `   💰 $${product.price.toFixed(2)} | 📦 ${product.stock} in stock\n\n`;
            });
            this.addMessage(response, 'bot');
        }
    },
    
    handleProductStock: function(message) {
        const products = JSON.parse(localStorage.getItem('wigProducts') || '[]');
        const productName = message.replace(/(in stock|stock|available)/gi, '').trim();
        
        if (productName.length < 3) {
            this.addMessage("Which product are you asking about?", 'bot');
            return;
        }
        
        const match = products.find(p => p.name.toLowerCase().includes(productName.toLowerCase()));
        if (match) {
            const status = match.stock > 0 
                ? `✅ **${match.name}** is in stock! We have **${match.stock} units** available.` 
                : `❌ Sorry, **${match.name}** is currently out of stock.`;
            this.addMessage(status, 'bot');
        } else {
            this.addMessage("I couldn't find that product. Try checking the name?", 'bot');
        }
    },
    
    handleProductPrice: function(message) {
        const products = JSON.parse(localStorage.getItem('wigProducts') || '[]');
        const productName = message.replace(/(price|cost|how much)/gi, '').trim();
        
        if (productName.length < 3) {
            this.addMessage("Which product's price would you like to know?", 'bot');
            return;
        }
        
        const match = products.find(p => p.name.toLowerCase().includes(productName.toLowerCase()));
        if (match) {
            this.addMessage(`💰 **${match.name}**\nPrice: $${match.price.toFixed(2)}\nCategory: ${match.category}\nStock: ${match.stock} available`, 'bot');
        } else {
            this.addMessage("I couldn't find that product. Try checking the name?", 'bot');
        }
    },
    
    handleFindBraider: function(message) {
        const braiders = JSON.parse(localStorage.getItem('braiders') || '[]');
        const approvedBraiders = braiders.filter(b => b.role === 'braider' && b.profile);
        
        if (approvedBraiders.length === 0) {
            this.addMessage("We're currently onboarding braiders. Check back soon!", 'bot');
            return;
        }
        
        const locations = ['nairobi', 'eldoret', 'mombasa', 'nakuru', 'kisumu'];
        let location = null;
        for (const loc of locations) {
            if (message.toLowerCase().includes(loc)) { location = loc; break; }
        }
        
        let filtered = approvedBraiders;
        if (location) filtered = filtered.filter(b => b.profile?.location?.toLowerCase() === location);
        const matches = filtered.slice(0, 5);
        
        if (matches.length === 0) {
            this.addMessage(location ? `No braiders found in ${location} yet. Try another location?` : "I couldn't find braiders matching your criteria.", 'bot');
        } else {
            let response = `Found **${filtered.length}** braider(s)${location ? ' in ' + location : ''}:\n\n`;
            matches.forEach(b => {
                const rating = b.profile?.rating || 0;
                const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
                const uploads = b.uploads?.filter(u => u.status === 'approved').length || 0;
                response += `**${b.name}**\n   📍 ${b.profile.location}\n   💇 ${b.profile.speciality}\n   ⭐ ${stars} (${rating})\n   📸 ${uploads} works\n\n`;
            });
            this.addMessage(response, 'bot');
        }
    },
    
    handleBraiderLocation: function(message) {
        this.handleFindBraider(message);
    },
    
    handleTopBraiders: function() {
        const braiders = JSON.parse(localStorage.getItem('braiders') || '[]');
        const topBraiders = braiders.filter(b => b.role === 'braider' && b.profile?.rating > 0)
            .sort((a, b) => (b.profile?.rating || 0) - (a.profile?.rating || 0)).slice(0, 5);
        
        if (topBraiders.length === 0) {
            this.addMessage("No rated braiders yet. Be the first to leave a review!", 'bot');
        } else {
            let message = "🏆 **Top Rated Braiders**\n\n";
            topBraiders.forEach((b, i) => {
                message += `${i+1}. **${b.name}** - ${b.profile.rating}⭐\n   📍 ${b.profile.location} | 💇 ${b.profile.speciality}\n\n`;
            });
            this.addMessage(message, 'bot');
        }
    },
    
    handleCommission: function() {
        if (!this.currentUser) {
            this.addMessage("Please login to check your affiliate earnings.", 'bot');
            return;
        }
        
        const email = this.currentUser.email;
        const earningsKey = `affiliate_earnings_${email}`;
        const earnings = JSON.parse(localStorage.getItem(earningsKey) || '[]');
        const total = earnings.reduce((sum, e) => sum + e.amount, 0);
        const available = earnings.filter(e => e.status === 'available').reduce((sum, e) => sum + e.amount, 0);
        
        this.addMessage(`💰 **Your Affiliate Summary**\n\nTotal Earnings: **$${total.toFixed(2)}**\nAvailable Balance: **$${available.toFixed(2)}**\nTotal Transactions: **${earnings.length}**\n\n${available > 0 ? "You have store credit available!" : "Keep sharing your referral link to earn more!"}`, 'bot');
    },
    
    handleReferralLink: function() {
        if (!this.currentUser) {
            this.addMessage("Please login to get your referral link.", 'bot');
            return;
        }
        
        const email = this.currentUser.email;
        let referralCode = localStorage.getItem(`referral_code_${email}`);
        
        if (!referralCode) {
            const username = this.currentUser.username.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            referralCode = username + Math.floor(1000 + Math.random() * 9000);
            localStorage.setItem(`referral_code_${email}`, referralCode);
        }
        
        const referralLink = `${window.location.origin}/client-login.html?ref=${referralCode}`;
        this.addMessage(`🔗 **Your Referral Link**\n\n${referralLink}\n\nShare this link with friends! When they sign up and make a purchase, you'll earn commission.`, 'bot');
    },
    
    handleProfileInfo: function() {
        if (!this.currentUser) {
            this.addMessage("Please login to view your profile.", 'bot');
            return;
        }
        
        const user = this.currentUser;
        const email = user.email;
        const orders = JSON.parse(localStorage.getItem(`orders_${email}`) || '[]');
        const wishlist = JSON.parse(localStorage.getItem(`wishlist_${email}`) || '[]');
        
        this.addMessage(`👤 **Your Profile**\n\nUsername: **${user.username}**\nEmail: **${user.email}**\nUser Type: **${this.userType}**\nOrders: **${orders.length}**\nWishlist: **${wishlist.length}** items\nMember since: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}`, 'bot');
    },
    
    handleWishlist: function() {
        if (!this.currentUser) {
            this.addMessage("Please login to view your wishlist.", 'bot');
            return;
        }
        
        const email = this.currentUser.email;
        const wishlist = JSON.parse(localStorage.getItem(`wishlist_${email}`) || '[]');
        
        if (wishlist.length === 0) {
            this.addMessage("Your wishlist is empty. Start adding items you love!", 'bot');
        } else {
            let message = `❤️ **Your Wishlist (${wishlist.length} items)**\n\n`;
            wishlist.slice(0, 5).forEach((item, i) => {
                message += `${i+1}. **${item.name}** - $${(item.price || 0).toFixed(2)}\n`;
            });
            if (wishlist.length > 5) message += `\n... and ${wishlist.length - 5} more items.`;
            this.addMessage(message, 'bot');
        }
    },
    
    handleChangePassword: function() {
        if (!this.currentUser) {
            this.addMessage("Please login to change your password.", 'bot');
            return;
        }
        this.addMessage("🔐 **To change your password:**\n\n1. Go to your Profile section\n2. Click on 'Change Password'\n3. Enter your current password\n4. Enter and confirm new password", 'bot');
    },
    
    handleWhatsonPage: function() {
        const page = this.currentPage;
        let response = `📄 You're currently on **${page}**.\n\n`;
        
        if (page.includes('index')) {
            response += "This is our **home page**. Here you can:\n• Browse featured products\n• View our hero carousel\n• Navigate to other sections\n";
        } else if (page.includes('client')) {
            response += "This is your **client dashboard**. Here you can:\n• Browse all products\n• Manage your cart\n• View your orders\n• Update your profile\n";
        } else if (page.includes('braiders')) {
            response += "This is the **braiders directory**. Here you can:\n• Find professional braiders\n• Filter by location and specialty\n• View braider profiles and portfolios\n";
        }
        this.addMessage(response, 'bot');
    },
    
    handleWhoAmI: function() {
        if (!this.currentUser) {
            this.addMessage("👤 You're currently browsing as a **guest**.\n\nSign up for free to:\n• Save items to wishlist\n• Track your orders\n• Get personalized recommendations\n• Earn affiliate commissions", 'bot');
        } else {
            this.addMessage(`👤 You're logged in as **${this.currentUser.username}**\nUser Type: **${this.userType}**\nEmail: **${this.currentUser.email}**`, 'bot');
        }
    },
    
    handleMyUploads: function() {
        if (this.userType !== 'braider') {
            this.addMessage("This feature is for braiders only.", 'bot');
            return;
        }
        
        const braiderId = this.currentUser.id;
        const braiders = JSON.parse(localStorage.getItem('braiders') || '[]');
        const braider = braiders.find(b => b.id === braiderId) || this.currentUser;
        const uploads = braider.uploads || [];
        const approved = uploads.filter(u => u.status === 'approved').length;
        const pending = uploads.filter(u => u.status === 'pending').length;
        
        this.addMessage(`📸 **Your Uploads**\n\nTotal: **${uploads.length}**\n✅ Approved: **${approved}**\n⏳ Pending: **${pending}**\n\n`, 'bot');
    },
    
    handleBraiderProfile: function() {
        if (this.userType !== 'braider') {
            this.addMessage("Please login as a braider to view your profile.", 'bot');
            return;
        }
        
        const braider = this.currentUser;
        this.addMessage(`👤 **Your Braider Profile**\n\nName: **${braider.name}**\nEmail: **${braider.email}**\nLocation: **${braider.profile?.location || 'Not set'}**\nSpeciality: **${braider.profile?.speciality || 'Not set'}**\nExperience: **${braider.profile?.experience || 0} years**\nRating: **${braider.profile?.rating || 0}⭐**`, 'bot');
    },
    
    handleBraiderEarnings: function() {
        if (this.userType !== 'braider') {
            this.addMessage("This feature is for braiders only.", 'bot');
            return;
        }
        this.addMessage("💰 Braider Earnings\n\nThis feature is coming soon! Braiders will be able to track earnings from bookings.", 'bot');
    },
    
    handleTrackOrder: function() {
        this.addMessage("Please enter your order ID (e.g., ORD12345)", 'bot');
    },
    
    answerFromKnowledge: function(topic) {
        let response = "";
        switch(topic) {
            case 'shipping':
                response = "🚚 Shipping Information\n\n• Free shipping on orders over $100\n• Standard: 3-5 business days ($5.99)\n• Express: 1-2 business days ($12.99)\n• We ship to all major cities in Kenya\n• Tracking provided via email";
                break;
            case 'returns':
                response = "↩️ Returns & Refunds\n\n• 30-day return window\n• Items must be unworn with tags\n• Refunds processed in 3-5 business days\n• Return shipping is customer's responsibility";
                break;
            case 'payment':
                response = "💳 Payment Methods\n\n• M-Pesa (instant)\n• Credit/Debit Cards (Visa, Mastercard)\n• PayPal\n• Store Credit (for affiliates)\n• All payments are encrypted & secure";
                break;
            default:
                response = "I can help with shipping, returns, payments, products, braiders, and more!";
        }
        this.addMessage(response, 'bot');
    },
    
    showHelp: function() {
        let response = "🤖 **I can help you with:**\n\n";
        if (this.userType === 'client') {
            response += "• 📦 Orders - Track, cancel, view history\n• 🛍️ Products - Find, check stock, prices\n• 💇 Braiders - Find by location, top rated\n• 👤 Account - Profile, wishlist, password\n• 💰 Affiliate - Earnings, referral links\n";
        } else if (this.userType === 'braider') {
            response += "• 📸 Uploads - Manage your work\n• 👤 Profile - Update your info\n• 💰 Earnings - Track payments\n";
        } else {
            response += "• 🛍️ Products - Browse our collection\n• 💇 Braiders - Find professional stylists\n• 📦 Orders - Track your purchases\n• ❓ FAQ - Shipping, returns, payments\n";
        }
        response += "\nJust ask me anything!";
        this.addMessage(response, 'bot');
    },
    
    handleContact: function() {
        this.addMessage("📞 Contact Us \n\n📧 Email: support@wighub.com\n📱 Phone: 0768832415\n💬 Live Chat: Available 24/7\n⏰ Hours: 24/7 Customer Support", 'bot');
    },
    
    handlePolicy: function(message) {
        if (message.includes('return')) {
            this.answerFromKnowledge('returns');
        } else if (message.includes('shipping')) {
            this.answerFromKnowledge('shipping');
        } else if (message.includes('payment')) {
            this.answerFromKnowledge('payment');
        } else {
            this.answerFromKnowledge('general');
        }
    }
};

// ===== STYLES =====
(function addStyles() {
    if (!document.getElementById('chatbotStyles')) {
        const style = document.createElement('style');
        style.id = 'chatbotStyles';
        style.textContent = `
            #wighub-ai-chatbot { position: fixed; z-index: 9999; pointer-events: none; }
            #wighub-ai-chatbot .ai-chat-toggle, #wighub-ai-chatbot .ai-chat-window { pointer-events: auto; }
            .ai-chat-toggle { position: fixed !important; bottom: 30px !important; right: 30px !important; left: auto !important; width: 65px; height: 65px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(102,126,234,0.4); display: flex; align-items: center; justify-content: center; font-size: 28px; transition: all 0.3s ease; z-index: 10000 !important; pointer-events: auto; }
            .ai-chat-toggle:hover { transform: scale(1.1); box-shadow: 0 4px 30px rgba(102,126,234,0.8); }
            .ai-status-dot { position: absolute; top: 5px; right: 5px; width: 12px; height: 12px; background: #4caf50; border-radius: 50%; border: 2px solid white; animation: pulse 2s infinite; }
            @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }
            .ai-chat-window { position: fixed !important; bottom: 100px !important; right: 30px !important; left: auto !important; width: 380px; height: 550px; background: white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); z-index: 9998 !important; display: none; flex-direction: column; overflow: hidden; animation: slideUp 0.3s ease; pointer-events: auto; }
            .ai-chat-window.open { display: flex; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            .ai-chat-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 18px 20px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
            .ai-header-left { display: flex; align-items: center; gap: 12px; }
            .ai-header-left i { font-size: 28px; }
            .ai-header-left h3 { margin: 0; font-size: 16px; }
            .ai-status { font-size: 11px; opacity: 0.8; display: block; }
            .ai-header-right { display: flex; gap: 8px; }
            .ai-header-btn { background: rgba(255,255,255,0.2); border: none; color: white; width: 30px; height: 30px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
            .ai-header-btn:hover { background: rgba(255,255,255,0.3); transform: scale(1.1); }
            .ai-chat-messages { flex: 1; padding: 20px; overflow-y: auto; background: #f8f9fa; display: flex; flex-direction: column; gap: 12px; min-height: 0; }
            .ai-message { max-width: 85%; padding: 12px 15px; border-radius: 15px; font-size: 14px; line-height: 1.5; animation: fadeIn 0.3s ease; position: relative; word-wrap: break-word; }
            .ai-message.ai-bot { align-self: flex-start; background: white; border-bottom-left-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
            .ai-message.ai-user { align-self: flex-end; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-bottom-right-radius: 5px; }
            .ai-message-time { font-size: 10px; opacity: 0.7; margin-top: 5px; display: block; text-align: right; }
            .ai-message.ai-user .ai-message-time { color: rgba(255,255,255,0.8); }
            .ai-typing { background: white; padding: 12px 15px; border-radius: 15px; border-bottom-left-radius: 5px; display: flex; gap: 5px; max-width: 70px; }
            .ai-typing span { width: 8px; height: 8px; background: #999; border-radius: 50%; animation: typing 1.4s infinite; }
            .ai-typing span:nth-child(2) { animation-delay: 0.2s; }
            .ai-typing span:nth-child(3) { animation-delay: 0.4s; }
            @keyframes typing { 0%,60%,100% { transform: translateY(0); opacity: 0.6; } 30% { transform: translateY(-5px); opacity: 1; } }
            .ai-quick-actions { display: flex; flex-wrap: wrap; gap: 8px; padding: 15px; border-top: 1px solid #e2e8f0; background: white; flex-shrink: 0; }
            .ai-quick-btn { padding: 8px 12px; background: #f0f0f0; border: none; border-radius: 20px; font-size: 12px; cursor: pointer; transition: all 0.3s; color: #495057; display: flex; align-items: center; gap: 5px; }
            .ai-quick-btn:hover { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
            .ai-chat-input-area { padding: 15px; background: white; border-top: 1px solid #e2e8f0; display: flex; gap: 10px; flex-shrink: 0; }
            .ai-chat-input-area input { flex: 1; padding: 12px 15px; border: 2px solid #e2e8f0; border-radius: 25px; font-size: 14px; transition: all 0.3s; }
            .ai-chat-input-area input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,0.1); }
            .ai-chat-input-area button { width: 45px; height: 45px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center; }
            .ai-chat-input-area button:hover { transform: scale(1.05); box-shadow: 0 5px 15px rgba(102,126,234,0.4); }
            .ai-powered-by { text-align: center; padding: 8px; background: #f0f0f0; font-size: 10px; color: #999; flex-shrink: 0; }
            @media (max-width: 768px) { .ai-chat-window { width: 90%; height: 500px; right: 5% !important; left: auto !important; bottom: 80px !important; } .ai-chat-toggle { width: 55px; height: 55px; bottom: 20px !important; right: 20px !important; left: auto !important; } .ai-chat-toggle i { font-size: 24px; } }
            @media (max-width: 480px) { .ai-chat-window { width: 95%; right: 2.5% !important; left: auto !important; } }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `;
        document.head.appendChild(style);
    }
})();