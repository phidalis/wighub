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

// Only initialize if not on admin pages
if (!isAdminPage) {
    document.addEventListener('DOMContentLoaded', function() {
        // Ensure KNOWLEDGE_BASE exists (it does, but double-check)
        if (typeof window.KNOWLEDGE_BASE === 'undefined') {
            console.warn('KNOWLEDGE_BASE not found, using empty object');
            window.KNOWLEDGE_BASE = { faq: [], products: [], braiders: [], affiliate: [] };
        }
        
        // Initialize the chatbot
        setTimeout(() => {
            if (window.WigHubAI && typeof window.WigHubAI.init === 'function') {
                window.WigHubAI.init();
            } else {
                console.error('WigHubAI not properly initialized');
            }
        }, 1000);
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
    
    // Knowledge base with fallback
    knowledgeBase: null, // Will be set in init
    
    // Live support properties
    liveChatMode: false,
    currentSupportRequest: null,
    supportAgent: null,
    pendingCancellation: null,
    
    // ===== INITIALIZATION =====
    init: function() {
        console.log('🤖 WigHub AI Initializing...');
        
        // Set knowledge base from global
        this.knowledgeBase = window.KNOWLEDGE_BASE || { faq: [], products: [], braiders: [], affiliate: [] };
        
        // Detect user type and current user
        this.detectUser();
        
        // Load learning data
        this.loadLearningData();
        
        // Load dynamic responses
        this.loadDynamicResponses();
        
        // Inject chatbot UI
        this.injectChatbot();
        
        // Track page clicks
        this.trackUserActivity();

        // START SESSION TRACKING FOR ADMIN
        this.startSession();
        
        this.initialized = true;
        console.log('✅ WigHub AI Ready - User:', this.userType, this.currentUser?.username || 'Guest');
        
        return this;
    },

    // ===== SESSION MANAGEMENT =====
    startSession: function() {
        // Create session object
        this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.sessionStartTime = new Date().toISOString();
        this.sessionActivities = [];
        this.questionCount = 0;
        
        // Get all sessions or initialize empty array
        let allSessions = JSON.parse(localStorage.getItem('ai_chatbot_sessions') || '[]');
        
        // Create new session
        const newSession = {
            id: this.sessionId,
            username: this.currentUser?.username || this.currentUser?.name || 'Guest',
            userId: this.currentUser?.email || this.currentUser?.id || 'guest',
            userType: this.userType,
            page: this.currentPage,
            startTime: this.sessionStartTime,
            questionCount: 0,
            activities: [],
            deviceInfo: this.getDeviceInfo()
        };
        
        allSessions.push(newSession);
        
        // Keep only last 100 sessions
        if (allSessions.length > 100) {
            allSessions = allSessions.slice(-100);
        }
        
        localStorage.setItem('ai_chatbot_sessions', JSON.stringify(allSessions));
        
        console.log('📊 Session started for admin tracking:', this.sessionId);
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

    trackQuestion: function(question) {
        this.questionCount++;
        
        const activity = {
            type: 'question',
            question: question,
            timestamp: new Date().toISOString(),
            page: this.currentPage,
            userType: this.userType,
            userId: this.currentUser?.id || this.currentUser?.email || 'guest'
        };
        
        this.sessionActivities.push(activity);
        
        // Update session in localStorage
        this.updateSessionActivity(activity);
        
        // Update keyword popularity
        const words = question.toLowerCase().split(/\s+/);
        words.forEach(word => {
            if (word.length > 3) {
                this.learningData.popularKeywords[word] = (this.learningData.popularKeywords[word] || 0) + 1;
            }
        });
        
        this.saveLearningData();
    },

    updateSessionActivity: function(activity) {
        let allSessions = JSON.parse(localStorage.getItem('ai_chatbot_sessions') || '[]');
        const sessionIndex = allSessions.findIndex(s => s.id === this.sessionId);
        
        if (sessionIndex !== -1) {
            if (!allSessions[sessionIndex].activities) {
                allSessions[sessionIndex].activities = [];
            }
            allSessions[sessionIndex].activities.push(activity);
            allSessions[sessionIndex].questionCount = this.questionCount;
            allSessions[sessionIndex].lastActivity = new Date().toISOString();
            
            localStorage.setItem('ai_chatbot_sessions', JSON.stringify(allSessions));
        }
    },

    endSession: function() {
        if (!this.sessionId) return;
        
        let allSessions = JSON.parse(localStorage.getItem('ai_chatbot_sessions') || '[]');
        const sessionIndex = allSessions.findIndex(s => s.id === this.sessionId);
        
        if (sessionIndex !== -1) {
            allSessions[sessionIndex].endTime = new Date().toISOString();
            localStorage.setItem('ai_chatbot_sessions', JSON.stringify(allSessions));
        }
    },

    // ===== USER DETECTION =====
    detectUser: function() {
        // Check for client user
        try {
            const clientUser = localStorage.getItem('clientUser');
            if (clientUser) {
                this.currentUser = JSON.parse(clientUser);
                this.userType = 'client';
                console.log('👤 Client logged in:', this.currentUser.username);
                return;
            }
            
            // Check for braider user
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
            
            // Guest user
            this.currentUser = null;
            this.userType = 'guest';
            console.log('👤 Guest user');
            
        } catch (e) {
            console.error('Error detecting user:', e);
            this.userType = 'guest';
        }
    },
    
    // ===== PAGE & ACTIVITY TRACKING =====
    trackUserActivity: function() {
        // Track all clicks on the page
        document.addEventListener('click', (e) => {
            const target = e.target;
            const activity = {
                type: 'click',
                element: target.tagName,
                id: target.id || null,
                class: target.className || null,
                text: target.innerText?.substring(0, 50) || null,
                href: target.href || null,
                timestamp: new Date().toISOString(),
                page: this.currentPage,
                userType: this.userType,
                userId: this.currentUser?.id || this.currentUser?.email || 'guest'
            };
            
            // Store in session
            this.sessionHistory.push(activity);
            
            // Log to console (for debugging)
            if (activity.element === 'BUTTON' || activity.element === 'A') {
                console.log('📊 User clicked:', activity.text || activity.href);
            }
        });
        
        // Track page views
        const pageView = {
            type: 'pageview',
            page: this.currentPage,
            timestamp: new Date().toISOString(),
            userType: this.userType,
            userId: this.currentUser?.id || this.currentUser?.email || 'guest'
        };
        this.sessionHistory.push(pageView);
    },
    
    // ===== LOAD LEARNING DATA =====
    loadLearningData: function() {
        try {
            const saved = localStorage.getItem('ai_chatbot_learning');
            if (saved) {
                this.learningData = JSON.parse(saved);
            }
        } catch (e) {
            console.log('No learning data yet');
        }
    },
    
    saveLearningData: function() {
        localStorage.setItem('ai_chatbot_learning', JSON.stringify(this.learningData));
    },
    
    loadDynamicResponses: function() {
        try {
            // Try to load from localStorage first
            const savedKnowledge = localStorage.getItem('ai_chatbot_knowledge');
            if (savedKnowledge) {
                try {
                    const saved = JSON.parse(savedKnowledge);
                    // Merge saved data
                    for (const category in saved) {
                        if (saved[category] && Array.isArray(saved[category])) {
                            if (!this.knowledgeBase[category]) {
                                this.knowledgeBase[category] = [];
                            }
                            // Add only if not already present (avoid duplicates)
                            saved[category].forEach(item => {
                                const exists = this.knowledgeBase[category].some(existing => existing.id === item.id);
                                if (!exists) {
                                    this.knowledgeBase[category].push(item);
                                }
                            });
                        }
                    }
                    console.log('✅ Loaded knowledge from localStorage');
                } catch (e) {
                    console.warn('Error parsing saved knowledge:', e);
                }
            }
            
            // Load from global KNOWLEDGE_BASE
            if (window.KNOWLEDGE_BASE) {
                for (const category in window.KNOWLEDGE_BASE) {
                    if (window.KNOWLEDGE_BASE[category] && Array.isArray(window.KNOWLEDGE_BASE[category])) {
                        if (!this.knowledgeBase[category]) {
                            this.knowledgeBase[category] = [];
                        }
                        // Add default knowledge base entries
                        window.KNOWLEDGE_BASE[category].forEach(item => {
                            const exists = this.knowledgeBase[category].some(existing => existing.id === item.id);
                            if (!exists) {
                                this.knowledgeBase[category].push(item);
                            }
                        });
                    }
                }
                console.log('✅ Loaded default knowledge base with', 
                    Object.values(this.knowledgeBase).flat().length, 'entries');
            } else {
                console.warn('⚠️ KNOWLEDGE_BASE not found, using empty knowledge base');
            }
            
            // Save merged knowledge base for persistence
            localStorage.setItem('ai_chatbot_knowledge', JSON.stringify(this.knowledgeBase));
            
        } catch (e) {
            console.error('Error loading dynamic responses:', e);
        }
    },
    
    // ===== CHATBOT UI INJECTION =====
    injectChatbot: function() {
        // Check if already exists
        if (document.getElementById('wighub-ai-chatbot')) return;
        
        const html = `
            <div id="wighub-ai-chatbot" class="wighub-ai-container">
                <!-- Toggle Button -->
                <button class="ai-chat-toggle" id="aiChatToggle">
                    <i class="fas fa-robot"></i>
                    <span class="ai-status-dot"></span>
                </button>
                
                <!-- Chat Window -->
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
                    
                    <div class="ai-chat-messages" id="aiChatMessages">
                        <!-- Welcome message will be added here -->
                    </div>
                    
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
        
        // Attach events
        document.getElementById('aiChatToggle').addEventListener('click', () => this.toggleChat());
        document.getElementById('aiMinimizeChat').addEventListener('click', () => this.minimizeChat());
        document.getElementById('aiCloseChat').addEventListener('click', () => this.closeChat());
        document.getElementById('aiChatSend').addEventListener('click', () => this.sendMessage());
        document.getElementById('aiChatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        // Show welcome message
        setTimeout(() => {
            this.showWelcomeMessage();
            this.showQuickActions();
        }, 500);
    },
    
    toggleChat: function() {
        const window = document.getElementById('aiChatWindow');
        const toggle = document.getElementById('aiChatToggle');
        
        if (window.classList.contains('open')) {
            window.classList.remove('open');
            toggle.innerHTML = '<i class="fas fa-robot"></i><span class="ai-status-dot"></span>';
        } else {
            window.classList.add('open');
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
            // Client actions
            my_orders: () => this.handleMyOrders(),
            track: () => this.handleTrackOrder(),
            wishlist: () => this.handleWishlist(),
            find_products: () => this.handleFindProduct(""),
            
            // Braider actions
            my_uploads: () => this.handleMyUploads(),
            profile: () => this.handleBraiderProfile(),
            earnings: () => this.handleBraiderEarnings(),
            
            // Guest actions
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
        
        // Add user message
        this.addMessage(message, 'user');
        input.value = '';
        
        // Check if in live chat mode
        if (this.liveChatMode) {
            this.sendLiveMessage(message);
            
            // Set up polling for admin messages (every 2 seconds)
            if (!this.messagePollingInterval) {
                this.messagePollingInterval = setInterval(() => {
                    this.checkForAdminMessages();
                }, 2000);
            }
            return;
        }
        
        // Track question
        this.trackQuestion(message);
        
        // Show typing
        this.showTypingIndicator();
        
        // Process
        setTimeout(() => {
            this.hideTypingIndicator();
            this.processMessage(message);
        }, 500 + Math.random() * 500);
    },
    
    sendLiveMessage: function(message) {
        if (!this.currentSupportRequest) return;
        
        const supportQueue = JSON.parse(localStorage.getItem('live_support_queue') || '[]');
        const chatIndex = supportQueue.findIndex(r => r.id === this.currentSupportRequest);
        
        if (chatIndex === -1) return;
        
        // Initialize messages array if it doesn't exist
        if (!supportQueue[chatIndex].messages) {
            supportQueue[chatIndex].messages = [];
        }
        
        // Add message to queue
        supportQueue[chatIndex].messages.push({
            from: 'user',
            message: message,
            timestamp: new Date().toISOString()
        });
        supportQueue[chatIndex].lastMessage = message;
        supportQueue[chatIndex].lastActivity = new Date().toISOString();
        
        localStorage.setItem('live_support_queue', JSON.stringify(supportQueue));
        
        // Show typing indicator while waiting for response
        setTimeout(() => {
            this.showTypingIndicator();
            setTimeout(() => {
                this.hideTypingIndicator();
            }, 1000);
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
            // For complex content
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
        // Convert URLs to links
        text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        // Convert line breaks
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
processMessage: function(message) {
    const lowerMessage = message.toLowerCase();
    
    // FIRST: Check for support intent - PRIORITIZE THIS
    const supportPatterns = /\b(support|help|assistance|need help|i need help|can you help|help me|how to get help)\b/i;
    if (supportPatterns.test(message)) {
        console.log('🟢 Support intent detected, showing live support option');
        this.showLiveSupportOption(message);
        return;
    }
    
    // Check if we have a perfect match in knowledge base
    const knowledgeMatch = this.searchKnowledgeBase(message);
    if (knowledgeMatch) {
        this.addMessage(knowledgeMatch.answer, 'bot');
        this.updateKnowledgeUsage(knowledgeMatch.id);
        return;
    }
    
    // Check for order ID pattern
    const orderMatch = message.match(/#?(ORD[A-Z0-9]{4,}|[A-Z0-9]{6,})/i);
    if (orderMatch) {
        this.handleOrderQuery(orderMatch[1]);
        return;
    }
    
    // Check for braider ID
    const braiderMatch = message.match(/#?(BRD\d+)/i);
    if (braiderMatch) {
        this.handleBraiderQuery(braiderMatch[1]);
        return;
    }
    
    // Intent recognition for other intents
    const intent = this.recognizeIntent(message);
    if (intent && intent !== 'support') {
        this.executeIntent(intent, message);
        return;
    }
    
    // Check if we can get data from localStorage
    const dataResponse = this.queryLocalStorage(message);
    if (dataResponse) {
        this.addMessage(dataResponse, 'bot');
        return;
    }
    
    // Log unanswered question for learning
    this.logUnansweredQuestion(message);
    
    // Suggest similar questions
    const suggestions = this.findSimilarQuestions(message);
    if (suggestions.length > 0) {
        let response = "I'm not sure about that. Did you mean one of these?\n\n";
        suggestions.forEach(s => {
            response += `• ${s.question}\n`;
        });
        this.addMessage(response, 'bot');
    } else {
        // Show live support option
        this.showLiveSupportOption(message);
    }
},


    
    // ===== LIVE SUPPORT FUNCTIONS =====
    showLiveSupportOption: function(question) {
        // Create interactive buttons
        const messageDiv = document.createElement('div');
        messageDiv.className = 'ai-message ai-bot';
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="ai-message-content">
                <p> 🤗 WELCOME .</p>
                <p>Would you like to speak with a live support agent?</p>
                <div style="display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
                    <button class="ai-quick-btn" onclick="WigHubAI.requestLiveSupport('${question.replace(/'/g, "\\'")}')" style="background: #28a745; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer;">
                        <i class="fas fa-headset"></i> Yes, Connect to Live Support
                    </button>
                    <button class="ai-quick-btn" onclick="WigHubAI.showContactOptions()" style="background: #3498db; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer;">
                        <i class="fas fa-envelope"></i> Contact via Email/Phone
                    </button>
                    <button class="ai-quick-btn" onclick="WigHubAI.minimizeChat()" style="background: #6c757d; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer;">
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

    checkForAdminMessages: function() {
        if (!this.liveChatMode || !this.currentSupportRequest) return;
        
        const supportQueue = JSON.parse(localStorage.getItem('live_support_queue') || '[]');
        const currentChat = supportQueue.find(r => r.id === this.currentSupportRequest);
        
        if (!currentChat) return;
        
        // Check for new messages from admin
        if (currentChat.messages && currentChat.messages.length > 0) {
            // Get last message in session history
            const lastMessageTime = this.lastAdminMessageTime || 0;
            
            currentChat.messages.forEach(msg => {
                const msgTime = new Date(msg.timestamp).getTime();
                
                // If this is an admin message and we haven't seen it
                if (msg.from === 'admin' && msgTime > lastMessageTime) {
                    // Add to chat
                    this.addMessage(msg.message, 'bot');
                    
                    // Update the last seen time
                    this.lastAdminMessageTime = msgTime;
                }
            });
        }
    },

    requestLiveSupport: function(question) {
        this.addMessage("Connecting you to live support... Please wait.", 'bot');
        
        // Create support request with ALL necessary fields
        const supportRequest = {
            id: 'SUP_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            userId: this.currentUser?.email || this.currentUser?.id || 'guest_' + Date.now(),
            username: this.currentUser?.username || this.currentUser?.name || 'Guest',
            userType: this.userType || 'guest',
            question: question,
            timestamp: new Date().toISOString(),
            page: this.currentPage || window.location.pathname,
            status: 'waiting',
            deviceInfo: this.getDeviceInfo(),
            messages: [] // Initialize messages array
        };
        
        console.log('📤 Creating support request:', supportRequest);
        
        // Save to localStorage for admin
        let supportQueue = JSON.parse(localStorage.getItem('live_support_queue') || '[]');
        supportQueue.push(supportRequest);
        localStorage.setItem('live_support_queue', JSON.stringify(supportQueue));
        
        // Create admin notification with proper structure
        const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
        const notification = {
            id: 'LIVE_' + Date.now(),
            type: 'live_support_request',
            title: 'New Live Support Request',
            message: `🟢 ${supportRequest.username} (${supportRequest.userType}) requested live support`,
            question: question,
            requestId: supportRequest.id,
            timestamp: new Date().toISOString(),
            read: false,
            priority: 'high'
        };
        
        notifications.push(notification);
        
        // Keep only last 100 notifications
        if (notifications.length > 100) {
            notifications.shift();
        }
        
        localStorage.setItem('adminNotifications', JSON.stringify(notifications));
        
        console.log('📋 Support request saved:', supportRequest.id);
        console.log('🔔 Notification created');
        
        // Show waiting message
        this.addMessage(
            "⏳ Your request has been sent to our support team. You'll be connected when an agent is available.\n\n" +
            "• Current wait time: 2-5 minutes\n" +
            "• You can continue browsing while you wait\n" +
            "• We'll notify you here when an agent joins",
            'bot'
        );
        
        // Start checking for agent assignment
        this.checkForAgentAssignment(supportRequest.id);
    },

    checkForAgentAssignment: function(requestId) {
        // Clear any existing interval
        if (this.assignmentCheckInterval) {
            clearInterval(this.assignmentCheckInterval);
        }
        
        // Check every 3 seconds for agent assignment
        this.assignmentCheckInterval = setInterval(() => {
            const supportQueue = JSON.parse(localStorage.getItem('live_support_queue') || '[]');
            const request = supportQueue.find(r => r.id === requestId);
            
            if (request && request.assignedTo) {
                // Agent has joined
                clearInterval(this.assignmentCheckInterval);
                
                this.addMessage(
                    `✅ **${request.assignedTo}** has joined the chat and will assist you now.`,
                    'bot'
                );
                
                // Enable live chat mode
                this.enableLiveChat(requestId, request.assignedTo);
            }
        }, 3000);
        
        // Auto-clear after 2 minutes if no agent joins
        setTimeout(() => {
            if (this.assignmentCheckInterval) {
                clearInterval(this.assignmentCheckInterval);
                this.assignmentCheckInterval = null;
                
                // Check if still not assigned
                const supportQueue = JSON.parse(localStorage.getItem('live_support_queue') || '[]');
                const request = supportQueue.find(r => r.id === requestId);
                
                if (request && !request.assignedTo) {
                    this.addMessage(
                        "⏱️ Still waiting for an agent? You can also contact us at:\n\n" +
                        "📞 Phone: 0768832415\n" +
                        "📧 Email: support@wighub.com\n\n" +
                        "We'll keep looking for an agent and notify you when one is available.",
                        'bot'
                    );
                    
                    // Keep checking but less frequently
                    this.assignmentCheckInterval = setInterval(() => {
                        const updatedRequest = supportQueue.find(r => r.id === requestId);
                        if (updatedRequest && updatedRequest.assignedTo) {
                            clearInterval(this.assignmentCheckInterval);
                            this.addMessage(
                                `✅ **${updatedRequest.assignedTo}** has joined the chat!`,
                                'bot'
                            );
                            this.enableLiveChat(requestId, updatedRequest.assignedTo);
                        }
                    }, 10000);
                }
            }
        }, 120000); // 2 minutes
    },

    checkForActiveSupport: function(requestId) {
        const supportQueue = JSON.parse(localStorage.getItem('live_support_queue') || '[]');
        const request = supportQueue.find(r => r.id === requestId);
        
        if (request && request.assignedTo) {
            // Support agent has joined
            this.addMessage(
                `✅ **${request.assignedTo}** has joined the chat and will assist you shortly.`,
                'bot'
            );
            // Enable live chat mode
            this.enableLiveChat(requestId, request.assignedTo);
        } else {
            // Still waiting
            this.addMessage(
                "⏳ All support agents are currently busy. You've been added to the queue. We'll notify you when an agent is available.",
                'bot'
            );
            
            // Check again in 30 seconds
            setTimeout(() => {
                this.checkForActiveSupport(requestId);
            }, 30000);
        }
    },

    enableLiveChat: function(requestId, agentName) {
        // Change to live chat mode
        this.liveChatMode = true;
        this.currentSupportRequest = requestId;
        this.supportAgent = agentName;
        this.lastAdminMessageTime = Date.now();
        
        // Add special indicator
        const header = document.querySelector('.ai-chat-header .ai-header-left div');
        if (header) {
            header.innerHTML = `
                <h3 style="margin:0;">Live Support</h3>
                <span class="ai-status" style="color: #ffd700;">💬 Chatting with ${agentName}</span>
            `;
        }
        
        // Start polling for messages
        if (this.messagePollingInterval) {
            clearInterval(this.messagePollingInterval);
        }
        this.messagePollingInterval = setInterval(() => {
            this.checkForAdminMessages();
        }, 2000);
        
        // Add a special system message
        this.addMessage(`✅ You are now connected with support agent ${agentName}. They will assist you shortly.`, 'bot');
    },

    playNotificationSound: function() {
        // Create silent audio context for notification
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
    
    searchKnowledgeBase: function(message) {
        const lowerMessage = message.toLowerCase().trim();
        const words = lowerMessage.split(/\s+/).filter(w => w.length > 2);
        
        let bestMatch = null;
        let bestScore = 0;
        
        // Make sure knowledgeBase exists
        if (!this.knowledgeBase) {
            this.knowledgeBase = { faq: [], products: [], braiders: [], affiliate: [], orders: [] };
        }
        
        const totalEntries = Object.values(this.knowledgeBase).flat().length;
        console.log('🔍 Searching knowledge base for:', message);
        console.log('📚 Total entries:', totalEntries);
        
        // Search all categories
        for (const category in this.knowledgeBase) {
            const items = this.knowledgeBase[category];
            if (!Array.isArray(items)) continue;
            
            items.forEach(item => {
                let score = 0;
                
                // Skip if no question or answer
                if (!item.question || !item.answer) return;
                
                // EXACT MATCH (highest priority)
                if (item.question.toLowerCase() === lowerMessage) {
                    score = 100;
                    console.log('✅ Exact match found:', item.question);
                }
                
                // KEYWORD MATCHING (each keyword gives 15 points)
                if (item.keywords && Array.isArray(item.keywords)) {
                    item.keywords.forEach(keyword => {
                        if (lowerMessage.includes(keyword.toLowerCase())) {
                            score += 15;
                            console.log(`✅ Keyword match: "${keyword}"`);
                        }
                    });
                }
                
                // Check if the message is a greeting
                const greetings = ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
                if (greetings.some(g => lowerMessage.includes(g))) {
                    const greetingItem = items.find(i => i.id === 'greeting_1');
                    if (greetingItem && greetingItem === item) {
                        score += 25;
                    }
                }
                
                // QUESTION SIMILARITY
                const qWords = item.question.toLowerCase().split(/\s+/);
                words.forEach(word => {
                    if (qWords.some(qw => qw.includes(word) || word.includes(qw))) {
                        score += 5;
                    }
                });
                
                // Boost score for multiple matching words
                const matchingWords = words.filter(w => 
                    item.question.toLowerCase().includes(w)
                ).length;
                if (matchingWords > 1) {
                    score += matchingWords * 4;
                }
                
                // Check if message contains multiple keywords
                if (item.keywords && item.keywords.length > 0) {
                    const matchedKeywords = item.keywords.filter(k => 
                        lowerMessage.includes(k.toLowerCase())
                    ).length;
                    if (matchedKeywords >= 2) {
                        score += matchedKeywords * 6;
                    }
                }
                
                if (score > bestScore && score > 3) {  // Lowered threshold for greetings
                    bestScore = score;
                    bestMatch = item;
                    console.log(`🏆 Best match: "${item.question}" (score: ${score})`);
                }
            });
        }
        
        if (bestMatch) {
            console.log('✅ Found match:', bestMatch.question, 'Score:', bestScore);
        } else {
            console.log('❌ No match found for:', message);
            // Log unanswered question
            this.logUnansweredQuestion(message);
            // Return a default helpful response instead of null
            return {
                question: 'default',
                answer: "I'm not sure I understand that question. Could you rephrase it?\n\nHere are some things I can help with:\n• Product information\n• Finding braiders\n• Order tracking\n• Shipping and returns\n• Affiliate program\n\nTry asking: 'What products do you sell?' or 'How do I find a braider?'",
                id: 'default_response',
                keywords: []
            };
        }
        
        return bestMatch;
    },
    
    updateKnowledgeUsage: function(id) {
        for (const category in this.knowledgeBase) {
            const items = this.knowledgeBase[category];
            if (!Array.isArray(items)) continue;
            
            const item = items.find(i => i.id === id);
            if (item) {
                item.usageCount = (item.usageCount || 0) + 1;
                item.lastUsed = new Date().toISOString();
                break;
            }
        }
        
        // Save to localStorage
        localStorage.setItem('ai_chatbot_knowledge', JSON.stringify(this.knowledgeBase));
    },
    
    // ===== INTENT RECOGNITION =====
    recognizeIntent: function(message) {
        const patterns = {
            // Order related
            order_status: /\b(order|where is|track|status).*?(order|purchase|shipment)/i,
            cancel_order: /\b(cancel|cancellation).*?(order|purchase)/i,
            my_orders: /\b(my|recent|all).*?orders?\b/i,

            // ADD THIS LINE - This will catch "support", "help", "need assistance" etc.
           support: /\b(support|help|assistance|need help|i need help|can you help|help me|how to get help)\b/i,
            
            // Product related
            find_product: /\b(find|search|looking for|have|get).*?(wig|product|braid|serum|lipstick)/i,
            product_stock: /\b(in stock|available|stock|when).*?(wig|product)/i,
            product_price: /\b(price|cost|how much).*?(wig|product)/i,
            
            // Braider related
            find_braider: /\b(find|book|hire).*?braider/i,
            braider_location: /\b(braider|stylist).*?(in|at|near).*?(nairobi|eldoret|mombasa|nakuru|kisumu)/i,
            top_braiders: /\b(best|top|highest rated).*?braider/i,
            
            // Affiliate related
            commission: /\b(commission|earnings|how much.*?earned)/i,
            referral_link: /\b(referral|share.*?link|invite)/i,
            
            // Account related
            change_password: /\b(change|reset|update).*?password/i,
            profile_info: /\b(my|view).*?(profile|info|details)/i,
            wishlist: /\b(my|view).*?wishlist/i,
            
            // Context aware
            whats_on_page: /\b(what|show|tell).*?(on this|this page|current)/i,
            who_am_i: /\b(who am i|my account|my details)/i,
            
            // General
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
        
        // Check for product count
        if (lowerMessage.includes('how many') && lowerMessage.includes('product')) {
            const products = JSON.parse(localStorage.getItem('wigProducts') || '[]');
            return `We currently have **${products.length} products** available across all categories.`;
        }
        
        // Check for braider count
        if (lowerMessage.includes('how many') && lowerMessage.includes('braider')) {
            const braiders = JSON.parse(localStorage.getItem('braiders') || '[]');
            const activeBraiders = braiders.filter(b => b.role === 'braider').length;
            return `We have **${activeBraiders} active braiders** in our network.`;
        }
        
        // Check for orders count (if logged in)
        if (lowerMessage.includes('how many') && lowerMessage.includes('order') && this.currentUser) {
            const ordersKey = `orders_${this.currentUser.email}`;
            const orders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
            return `You have placed **${orders.length} orders** with us.`;
        }
        
        // Check for store credit
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
                    suggestions.push({
                        question: item.question,
                        score: score
                    });
                }
            });
        }
        
        // Sort by relevance
        suggestions.sort((a, b) => b.score - a.score);
        
        return suggestions.slice(0, 3);
    },
    
    logUnansweredQuestion: function(question) {
        // Add to learning data
        this.learningData.unansweredQuestions.push({
            question: question,
            timestamp: new Date().toISOString(),
            userType: this.userType,
            userId: this.currentUser?.id || this.currentUser?.email || 'guest',
            page: this.currentPage
        });
        
        // Keep only last 100 unanswered
        if (this.learningData.unansweredQuestions.length > 100) {
            this.learningData.unansweredQuestions.shift();
        }
        
        this.saveLearningData();
        
        // Also save to separate unanswered questions for admin
        let unanswered = JSON.parse(localStorage.getItem('ai_chatbot_unanswered') || '[]');
        unanswered.push({
            id: 'UNANS_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            question: question,
            timestamp: new Date().toISOString(),
            userType: this.userType,
            userId: this.currentUser?.id || this.currentUser?.email || 'guest',
            page: this.currentPage,
            answered: false
        });
        
        // Keep last 200 unanswered
        if (unanswered.length > 200) {
            unanswered = unanswered.slice(-200);
        }
        
        localStorage.setItem('ai_chatbot_unanswered', JSON.stringify(unanswered));
        
        // Create admin notification
        const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
        notifications.push({
            id: 'NOTIF_' + Date.now(),
            type: 'unanswered_question',
            message: `New unanswered question: "${question.substring(0, 50)}..."`,
            question: question,
            timestamp: new Date().toISOString(),
            read: false
        });
        
        // Keep last 50 notifications
        if (notifications.length > 50) {
            notifications.shift();
        }
        
        localStorage.setItem('adminNotifications', JSON.stringify(notifications));
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
        // Search through all orders
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
        
        // Check guest orders
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
    // This calls the same live support option that appears when no answer is found
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
                const statusEmoji = order.status === 'completed' ? '✅' : 
                                    order.status === 'cancelled' ? '❌' : '⏳';
                message += `${statusEmoji} **#${order.id}** - $${(order.total || 0).toFixed(2)} (${order.status})\n`;
                message += `   📅 ${date}\n\n`;
            });
            
            if (orders.length > 5) {
                message += `... and ${orders.length - 5} more orders.`;
            }
            
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
                this.addMessage(
                    `Are you sure you want to cancel order #${orderId}? Type 'yes' to confirm.`,
                    'bot'
                );
                
                // Store pending cancellation
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
        
        // Extract search terms
        const searchTerms = message.toLowerCase()
            .replace(/(find|search|looking for|have|get|show|products)/gi, '')
            .trim()
            .split(/\s+/)
            .filter(term => term.length > 2);
        
        if (searchTerms.length === 0) {
            // Show categories instead
            const categories = [...new Set(products.map(p => p.category))].filter(Boolean);
            let response = "What type of product are you looking for?\n\n";
            categories.slice(0, 8).forEach(cat => {
                response += `• **${cat}**\n`;
            });
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
        
        const match = products.find(p => 
            p.name.toLowerCase().includes(productName.toLowerCase())
        );
        
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
        
        const match = products.find(p => 
            p.name.toLowerCase().includes(productName.toLowerCase())
        );
        
        if (match) {
            this.addMessage(
                `💰 **${match.name}**\n` +
                `Price: $${match.price.toFixed(2)}\n` +
                `Category: ${match.category}\n` +
                `Stock: ${match.stock} available`,
                'bot'
            );
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
        
        // Extract location from message
        const locations = ['nairobi', 'eldoret', 'mombasa', 'nakuru', 'kisumu'];
        let location = null;
        
        for (const loc of locations) {
            if (message.toLowerCase().includes(loc)) {
                location = loc;
                break;
            }
        }
        
        let filtered = approvedBraiders;
        if (location) {
            filtered = filtered.filter(b => 
                b.profile?.location?.toLowerCase() === location
            );
        }
        
        const matches = filtered.slice(0, 5);
        
        if (matches.length === 0) {
            this.addMessage(location 
                ? `No braiders found in ${location} yet. Try another location?`
                : "I couldn't find braiders matching your criteria.", 'bot');
        } else {
            let response = `Found **${filtered.length}** braider(s)${location ? ' in ' + location : ''}:\n\n`;
            
            matches.forEach(b => {
                const rating = b.profile?.rating || 0;
                const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
                const uploads = b.uploads?.filter(u => u.status === 'approved').length || 0;
                
                response += `**${b.name}**\n`;
                response += `   📍 ${b.profile.location}\n`;
                response += `   💇 ${b.profile.speciality}\n`;
                response += `   ⭐ ${stars} (${rating})\n`;
                response += `   📸 ${uploads} works\n\n`;
            });
            
            this.addMessage(response, 'bot');
        }
    },
    
    handleBraiderLocation: function(message) {
        this.handleFindBraider(message);
    },
    
    handleTopBraiders: function() {
        const braiders = JSON.parse(localStorage.getItem('braiders') || '[]');
        const topBraiders = braiders
            .filter(b => b.role === 'braider' && b.profile?.rating > 0)
            .sort((a, b) => (b.profile?.rating || 0) - (a.profile?.rating || 0))
            .slice(0, 5);
        
        if (topBraiders.length === 0) {
            this.addMessage("No rated braiders yet. Be the first to leave a review!", 'bot');
        } else {
            let message = "🏆 **Top Rated Braiders**\n\n";
            topBraiders.forEach((b, i) => {
                message += `${i+1}. **${b.name}** - ${b.profile.rating}⭐\n`;
                message += `   📍 ${b.profile.location} | 💇 ${b.profile.speciality}\n\n`;
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
        
        this.addMessage(
            `💰 **Your Affiliate Summary**\n\n` +
            `Total Earnings: **$${total.toFixed(2)}**\n` +
            `Available Balance: **$${available.toFixed(2)}**\n` +
            `Total Transactions: **${earnings.length}**\n\n` +
            (available > 0 ? "You have store credit available!" : "Keep sharing your referral link to earn more!"),
            'bot'
        );
    },
    
    handleReferralLink: function() {
        if (!this.currentUser) {
            this.addMessage("Please login to get your referral link.", 'bot');
            return;
        }
        
        const email = this.currentUser.email;
        let referralCode = localStorage.getItem(`referral_code_${email}`);
        
        if (!referralCode) {
            // Generate new code
            const username = this.currentUser.username.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            referralCode = username + Math.floor(1000 + Math.random() * 9000);
            localStorage.setItem(`referral_code_${email}`, referralCode);
        }
        
        const baseUrl = window.location.origin;
        const referralLink = `${baseUrl}/client-login.html?ref=${referralCode}`;
        
        this.addMessage(
            `🔗 **Your Referral Link**\n\n` +
            `${referralLink}\n\n` +
            `Share this link with friends! When they sign up and make a purchase, you'll earn commission.`,
            'bot'
        );
    },
    
    handleProfileInfo: function() {
        if (!this.currentUser) {
            this.addMessage("Please login to view your profile.", 'bot');
            return;
        }
        
        const user = this.currentUser;
        const email = user.email;
        
        // Get orders count
        const ordersKey = `orders_${email}`;
        const orders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
        
        // Get wishlist count
        const wishlistKey = `wishlist_${email}`;
        const wishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
        
        this.addMessage(
            `👤 **Your Profile**\n\n` +
            `Username: **${user.username}**\n` +
            `Email: **${user.email}**\n` +
            `User Type: **${this.userType}**\n` +
            `Orders: **${orders.length}**\n` +
            `Wishlist: **${wishlist.length}** items\n` +
            `Member since: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}`,
            'bot'
        );
    },
    
    handleWishlist: function() {
        if (!this.currentUser) {
            this.addMessage("Please login to view your wishlist.", 'bot');
            return;
        }
        
        const email = this.currentUser.email;
        const wishlistKey = `wishlist_${email}`;
        const wishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
        
        if (wishlist.length === 0) {
            this.addMessage("Your wishlist is empty. Start adding items you love!", 'bot');
        } else {
            let message = `❤️ **Your Wishlist (${wishlist.length} items)**\n\n`;
            
            wishlist.slice(0, 5).forEach((item, i) => {
                message += `${i+1}. **${item.name}** - $${(item.price || 0).toFixed(2)}\n`;
            });
            
            if (wishlist.length > 5) {
                message += `\n... and ${wishlist.length - 5} more items.`;
            }
            
            this.addMessage(message, 'bot');
        }
    },
    
    handleChangePassword: function() {
        if (!this.currentUser) {
            this.addMessage("Please login to change your password.", 'bot');
            return;
        }
        
        this.addMessage(
            "🔐 **To change your password:**\n\n" +
            "1. Go to your Profile section\n" +
            "2. Click on 'Change Password'\n" +
            "3. Enter your current password\n" +
            "4. Enter and confirm new password",
            'bot'
        );
    },
    
    handleWhatsonPage: function() {
        const page = this.currentPage;
        let response = `📄 You're currently on **${page}**.\n\n`;
        
        if (page.includes('index')) {
            response += "This is our **home page**. Here you can:\n";
            response += "• Browse featured products\n";
            response += "• View our hero carousel\n";
            response += "• Navigate to other sections\n";
        } else if (page.includes('client')) {
            response += "This is your **client dashboard**. Here you can:\n";
            response += "• Browse all products\n";
            response += "• Manage your cart\n";
            response += "• View your orders\n";
            response += "• Update your profile\n";
        } else if (page.includes('braiders')) {
            response += "This is the **braiders directory**. Here you can:\n";
            response += "• Find professional braiders\n";
            response += "• Filter by location and specialty\n";
            response += "• View braider profiles and portfolios\n";
        }
        
        this.addMessage(response, 'bot');
    },
    
    handleWhoAmI: function() {
        if (!this.currentUser) {
            this.addMessage(
                "👤 You're currently browsing as a **guest**.\n\n" +
                "Sign up for free to:\n" +
                "• Save items to wishlist\n" +
                "• Track your orders\n" +
                "• Get personalized recommendations\n" +
                "• Earn affiliate commissions",
                'bot'
            );
        } else {
            this.addMessage(
                `👤 You're logged in as **${this.currentUser.username}**\n` +
                `User Type: **${this.userType}**\n` +
                `Email: **${this.currentUser.email}**`,
                'bot'
            );
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
        
        this.addMessage(
            `📸 **Your Uploads**\n\n` +
            `Total: **${uploads.length}**\n` +
            `✅ Approved: **${approved}**\n` +
            `⏳ Pending: **${pending}**\n\n`,
            'bot'
        );
    },
    
    handleBraiderProfile: function() {
        if (this.userType !== 'braider') {
            this.addMessage("Please login as a braider to view your profile.", 'bot');
            return;
        }
        
        const braider = this.currentUser;
        
        this.addMessage(
            `👤 **Your Braider Profile**\n\n` +
            `Name: **${braider.name}**\n` +
            `Email: **${braider.email}**\n` +
            `Location: **${braider.profile?.location || 'Not set'}**\n` +
            `Speciality: **${braider.profile?.speciality || 'Not set'}**\n` +
            `Experience: **${braider.profile?.experience || 0} years**\n` +
            `Rating: **${braider.profile?.rating || 0}⭐**`,
            'bot'
        );
    },
    
    handleBraiderEarnings: function() {
        if (this.userType !== 'braider') {
            this.addMessage("This feature is for braiders only.", 'bot');
            return;
        }
        
        this.addMessage(
            "💰 Braider Earnings\n\n" +
            "This feature is coming soon! Braiders will be able to track earnings from bookings.",
            'bot'
        );
    },
    
    handleTrackOrder: function() {
        this.addMessage("Please enter your order ID (e.g., ORD12345)", 'bot');
    },
    
    answerFromKnowledge: function(topic) {
        let response = "";
        
        switch(topic) {
            case 'shipping':
                response = "🚚 Shipping Information\n\n" +
                          "• Free shipping on orders over $100\n" +
                          "• Standard: 3-5 business days ($5.99)\n" +
                          "• Express: 1-2 business days ($12.99)\n" +
                          "• We ship to all major cities in Kenya\n" +
                          "• Tracking provided via email";
                break;
            case 'returns':
                response = "↩️ Returns & Refunds\n\n" +
                          "• 30-day return window\n" +
                          "• Items must be unworn with tags\n" +
                          "• Refunds processed in 3-5 business days\n" +
                          "• Return shipping is customer's responsibility";
                break;
            case 'payment':
                response = "💳 Payment Methods\n\n" +
                          "• M-Pesa (instant)\n" +
                          "• Credit/Debit Cards (Visa, Mastercard)\n" +
                          "• PayPal\n" +
                          "• Store Credit (for affiliates)\n" +
                          "• All payments are encrypted & secure";
                break;
            default:
                response = "I can help with shipping, returns, payments, products, braiders, and more!";
        }
        
        this.addMessage(response, 'bot');
    },
    
    showHelp: function() {
        let response = "🤖 **I can help you with:**\n\n";
        
        if (this.userType === 'client') {
            response += "• 📦 Orders - Track, cancel, view history\n";
            response += "• 🛍️ Products - Find, check stock, prices\n";
            response += "• 💇 Braiders - Find by location, top rated\n";
            response += "• 👤 Account - Profile, wishlist, password\n";
            response += "• 💰 Affiliate - Earnings, referral links\n";
        } else if (this.userType === 'braider') {
            response += "• 📸 Uploads - Manage your work\n";
            response += "• 👤 Profile - Update your info\n";
            response += "• 💰 Earnings - Track payments\n";
        } else {
            response += "• 🛍️ Products - Browse our collection\n";
            response += "• 💇 Braiders - Find professional stylists\n";
            response += "• 📦 Orders - Track your purchases\n";
            response += "• ❓ FAQ - Shipping, returns, payments\n";
        }
        
        response += "\nJust ask me anything!";
        
        this.addMessage(response, 'bot');
    },
    
    handleContact: function() {
        this.addMessage(
            "📞 Contact Us \n\n" +
            "📧 Email: support@wighub.com\n" +
            "📱 Phone: 0768832415\n" +
            "💬 Live Chat: Available 24/7\n" +
            "⏰ Hours: 24/7 Customer Support",
            'bot'
        );
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

// Add animation styles
(function addStyles() {
    if (!document.getElementById('chatbotStyles')) {
        const style = document.createElement('style');
        style.id = 'chatbotStyles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            .ai-chat-toggle {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 65px;
                height: 65px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28px;
                position: relative;
                transition: all 0.3s ease;
                z-index: 9999;
            }
            
            .ai-chat-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 4px 30px rgba(102, 126, 234, 0.8);
            }
            
            .ai-status-dot {
                position: absolute;
                top: 5px;
                right: 5px;
                width: 12px;
                height: 12px;
                background: #4caf50;
                border-radius: 50%;
                border: 2px solid white;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(1.2); }
            }
            
            .ai-chat-window {
                position: fixed;
                bottom: 100px;
                right: 30px;
                width: 380px;
                height: 550px;
                background: white;
                border-radius: 20px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                z-index: 9998;
                display: none;
                flex-direction: column;
                overflow: hidden;
                animation: slideUp 0.3s ease;
            }
            
            .ai-chat-window.open {
                display: flex;
            }
            
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .ai-chat-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 18px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .ai-header-left {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .ai-header-left i {
                font-size: 28px;
            }
            
            .ai-header-left h3 {
                margin: 0;
                font-size: 16px;
            }
            
            .ai-status {
                font-size: 11px;
                opacity: 0.8;
                display: block;
            }
            
            .ai-header-right {
                display: flex;
                gap: 8px;
            }
            
            .ai-header-btn {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 30px;
                height: 30px;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }
            
            .ai-header-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.1);
            }
            
            .ai-chat-messages {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                background: #f8f9fa;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .ai-message {
                max-width: 85%;
                padding: 12px 15px;
                border-radius: 15px;
                font-size: 14px;
                line-height: 1.5;
                animation: fadeIn 0.3s ease;
                position: relative;
                word-wrap: break-word;
            }
            
            .ai-message.ai-bot {
                align-self: flex-start;
                background: white;
                border-bottom-left-radius: 5px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            }
            
            .ai-message.ai-user {
                align-self: flex-end;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-bottom-right-radius: 5px;
            }
            
            .ai-message-time {
                font-size: 10px;
                opacity: 0.7;
                margin-top: 5px;
                display: block;
                text-align: right;
            }
            
            .ai-message.ai-user .ai-message-time {
                color: rgba(255,255,255,0.8);
            }
            
            .ai-typing {
                background: white;
                padding: 12px 15px;
                border-radius: 15px;
                border-bottom-left-radius: 5px;
                display: flex;
                gap: 5px;
                max-width: 70px;
            }
            
            .ai-typing span {
                width: 8px;
                height: 8px;
                background: #999;
                border-radius: 50%;
                animation: typing 1.4s infinite;
            }
            
            .ai-typing span:nth-child(2) { animation-delay: 0.2s; }
            .ai-typing span:nth-child(3) { animation-delay: 0.4s; }
            
            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); opacity: 0.6; }
                30% { transform: translateY(-5px); opacity: 1; }
            }
            
            .ai-quick-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                padding: 15px;
                border-top: 1px solid #e2e8f0;
                background: white;
            }
            
            .ai-quick-btn {
                padding: 8px 12px;
                background: #f0f0f0;
                border: none;
                border-radius: 20px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.3s;
                color: #495057;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .ai-quick-btn:hover {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            
            .ai-chat-input-area {
                padding: 15px;
                background: white;
                border-top: 1px solid #e2e8f0;
                display: flex;
                gap: 10px;
            }
            
            .ai-chat-input-area input {
                flex: 1;
                padding: 12px 15px;
                border: 2px solid #e2e8f0;
                border-radius: 25px;
                font-size: 14px;
                transition: all 0.3s;
            }
            
            .ai-chat-input-area input:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            
            .ai-chat-input-area button {
                width: 45px;
                height: 45px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .ai-chat-input-area button:hover {
                transform: scale(1.05);
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
            }
            
            .ai-powered-by {
                text-align: center;
                padding: 8px;
                background: #f0f0f0;
                font-size: 10px;
                color: #999;
            }
            
            @media (max-width: 768px) {
                .ai-chat-window {
                    width: 90%;
                    height: 500px;
                    right: 5%;
                    bottom: 80px;
                }
                
                .ai-chat-toggle {
                    width: 55px;
                    height: 55px;
                    bottom: 20px;
                    right: 20px;
                }
                
                .ai-chat-toggle i {
                    font-size: 24px;
                }
            }
        `;
        document.head.appendChild(style);
    }
})();