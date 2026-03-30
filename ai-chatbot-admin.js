// ai-chatbot-admin.js - FIREBASE VERSION
// Add this import at the VERY TOP
import { 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Removed all session tracking, uses Firestore only

// ===== GLOBAL DATA =====
let knowledgeBase = { faq: [], products: [], braiders: [], affiliate: [] };
let unansweredQuestions = [];
let activeLiveChats = [];
let currentLiveChatId = null;
let currentChatWith = null;

// ===== FIREBASE SERVICE (to match ai-chatbot.js) =====
const AIChatbotFirebase = window.AIChatbotFirebase || {
    db: null,
    auth: null,
    
    init: function(db, auth) {
        this.db = db;
        this.auth = auth;
        console.log('🔥 Firebase service initialized for admin');
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
    
    updateKnowledgeEntry: async function(id, updates) {
        if (!this.db) return false;
        await updateDoc(doc(this.db, 'aiKnowledge', id), { ...updates, updatedAt: new Date().toISOString() });
        return true;
    },
    
    deleteKnowledgeEntry: async function(id) {
        if (!this.db) return false;
        await deleteDoc(doc(this.db, 'aiKnowledge', id));
        return true;
    },
    
    getUnansweredQuestions: async function() {
        if (!this.db) return [];
        const q = query(collection(this.db, 'aiUnanswered'), orderBy('timestamp', 'desc'), limit(200));
        const snapshot = await getDocs(q);
        const questions = [];
        snapshot.forEach(doc => questions.push({ id: doc.id, ...doc.data() }));
        return questions;
    },
    
    deleteUnansweredQuestion: async function(id) {
        if (!this.db) return false;
        await deleteDoc(doc(this.db, 'aiUnanswered', id));
        return true;
    },
    
    getSupportRequests: async function() {
        if (!this.db) return [];
        const snapshot = await getDocs(collection(this.db, 'liveSupportRequests'));
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
    
    deleteSupportRequest: async function(id) {
        if (!this.db) return false;
        await deleteDoc(doc(this.db, 'liveSupportRequests', id));
        return true;
    }
};

// Make it available globally if not already
if (!window.AIChatbotFirebase) window.AIChatbotFirebase = AIChatbotFirebase;

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🤖 AI Chatbot Admin Initializing (Firebase)...');
    
    if (!checkAdminLogin()) return;
    
    // Initialize Firebase service
    if (window.db && window.auth) {
        window.AIChatbotFirebase.init(window.db, window.auth);
        console.log('✅ Firebase connected for admin');
    }
    
    await loadAllData();
    showAITab('knowledge');
    setupSearchDebounce();
    
    setInterval(checkLiveSupportQueue, 5000);
    setInterval(updateLiveSupportStats, 10000);
});

function checkAdminLogin() {
    const adminUser = localStorage.getItem('adminUser');
    const adminToken = localStorage.getItem('adminToken');
    
    if (!adminToken || !adminUser) {
        window.location.href = 'admin-login.html';
        return false;
    }
    
    try {
        const admin = JSON.parse(adminUser);
        document.getElementById('adminName').textContent = admin.name || 'Administrator';
    } catch (e) {}
    
    return true;
}

// ===== LOAD DATA FROM FIRESTORE =====
async function loadAllData() {
    console.log('📚 Loading chatbot data from Firestore...');
    
    // Load knowledge base from Firestore
    if (window.AIChatbotFirebase.db) {
        const firebaseKB = await window.AIChatbotFirebase.getAllKnowledgeBase();
        if (firebaseKB) {
            knowledgeBase = firebaseKB;
            console.log('✅ Knowledge base loaded from Firestore:', Object.values(knowledgeBase).flat().length, 'entries');
        }
    }
    
    // Load unanswered questions from Firestore
    if (window.AIChatbotFirebase.db) {
        unansweredQuestions = await window.AIChatbotFirebase.getUnansweredQuestions();
        console.log('✅ Unanswered questions loaded from Firestore:', unansweredQuestions.length);
    }
    
    updateStats();
    
    const activeTab = document.querySelector('.ai-tab-btn.active');
    if (activeTab) {
        const onclick = activeTab.getAttribute('onclick');
        if (onclick) {
            const match = onclick.match(/'([^']+)'/);
            if (match) showAITab(match[1]);
        }
    }
    
    showNotification('Chatbot data loaded from Firestore', 'success');
}

function updateStats() {
    const unansweredEl = document.getElementById('unansweredCount');
    const knowledgeEl = document.getElementById('knowledgeCount');
    
    if (unansweredEl) unansweredEl.textContent = unansweredQuestions.length;
    
    const knowledgeCount = Object.values(knowledgeBase).flat().length;
    if (knowledgeEl) knowledgeEl.textContent = knowledgeCount;
}

function showAITab(tabId) {
    document.querySelectorAll('.ai-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.ai-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabId + 'Tab').classList.add('active');
    document.querySelector(`.ai-tab-btn[onclick*="${tabId}"]`).classList.add('active');
    
    switch(tabId) {
        case 'knowledge':
            renderKnowledgeBase();
            break;
        case 'unanswered':
            renderUnanswered();
            break;
        case 'teach':
            renderQuickTeachList();
            break;
        case 'analytics':
            renderAnalytics();
            break;
        case 'live':
            renderLiveSupportTab();
            break;
    }
}

// ===== KNOWLEDGE BASE TAB =====
function renderKnowledgeBase() {
    const container = document.getElementById('knowledgeBaseContainer');
    if (!container) return;
    
    const allItems = [];
    for (const category in knowledgeBase) {
        if (Array.isArray(knowledgeBase[category])) {
            knowledgeBase[category].forEach(item => {
                allItems.push({ ...item, category });
            });
        }
    }
    
    if (allItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-database" style="font-size: 64px; color: #ddd; margin-bottom: 20px;"></i>
                <h3>No Knowledge Base Entries</h3>
                <p>Teach the AI something to get started!</p>
                <button class="btn btn-primary" onclick="showAITab('teach')" style="margin-top: 15px;">
                    <i class="fas fa-graduation-cap"></i> Teach AI
                </button>
            </div>
        `;
        return;
    }
    
    allItems.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    
    let html = '<div class="knowledge-grid">';
    allItems.forEach(item => {
        const lastUsed = item.lastUsed ? new Date(item.lastUsed).toLocaleDateString() : 'Never';
        const categoryColors = {
            faq: '#3498db',
            products: '#2ecc71',
            braiders: '#e74c3c',
            affiliate: '#f39c12',
            orders: '#9b59b6'
        };
        const categoryColor = categoryColors[item.category] || '#667eea';
        
        html += `
            <div class="knowledge-card" style="border-left: 4px solid ${categoryColor};">
                <div class="knowledge-card-header">
                    <span class="knowledge-category" style="background: ${categoryColor};">${item.category}</span>
                    <span class="knowledge-usage">🎯 Used ${item.usageCount || 0} times</span>
                </div>
                <div class="knowledge-question">
                    <i class="fas fa-question-circle" style="color: ${categoryColor};"></i>
                    ${escapeHtml(item.question)}
                </div>
                <div class="knowledge-answer">
                    <i class="fas fa-reply" style="color: ${categoryColor};"></i>
                    ${escapeHtml(item.answer.substring(0, 150))}${item.answer.length > 150 ? '...' : ''}
                </div>
                <div class="knowledge-footer">
                    <span class="knowledge-date"><i class="far fa-clock"></i> Last used: ${lastUsed}</span>
                    <div class="knowledge-actions">
                        <button class="btn-icon edit" onclick="editKnowledge('${item.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="deleteKnowledge('${item.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

function filterKnowledge() {
    const searchTerm = document.getElementById('knowledgeSearch')?.value.toLowerCase() || '';
    const category = document.getElementById('categoryFilter')?.value || '';
    
    const allItems = [];
    for (const cat in knowledgeBase) {
        if (Array.isArray(knowledgeBase[cat])) {
            knowledgeBase[cat].forEach(item => {
                if (!category || cat === category) {
                    allItems.push({ ...item, category: cat });
                }
            });
        }
    }
    
    const filtered = allItems.filter(item => {
        return !searchTerm || 
            (item.question && item.question.toLowerCase().includes(searchTerm)) ||
            (item.answer && item.answer.toLowerCase().includes(searchTerm));
    });
    
    const container = document.getElementById('knowledgeBaseContainer');
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state" style="text-align: center; padding: 40px;">No matching entries found</div>';
        return;
    }
    
    let html = '<div class="knowledge-grid">';
    filtered.forEach(item => {
        const categoryColors = { faq: '#3498db', products: '#2ecc71', braiders: '#e74c3c', affiliate: '#f39c12', orders: '#9b59b6' };
        const categoryColor = categoryColors[item.category] || '#667eea';
        
        html += `
            <div class="knowledge-card" style="border-left: 4px solid ${categoryColor};">
                <div class="knowledge-card-header">
                    <span class="knowledge-category" style="background: ${categoryColor};">${item.category}</span>
                </div>
                <div class="knowledge-question">
                    <i class="fas fa-question-circle" style="color: ${categoryColor};"></i>
                    ${escapeHtml(item.question)}
                </div>
                <div class="knowledge-answer">${escapeHtml(item.answer.substring(0, 100))}...</div>
                <div class="knowledge-footer">
                    <button class="btn-icon edit" onclick="editKnowledge('${item.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-icon delete" onclick="deleteKnowledge('${item.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

function editKnowledge(itemId) {
    let item = null;
    let category = null;
    
    for (const cat in knowledgeBase) {
        const found = knowledgeBase[cat]?.find(i => i.id === itemId);
        if (found) {
            item = found;
            category = cat;
            break;
        }
    }
    
    if (!item) return;
    
    document.getElementById('teachQuestion').value = item.question;
    document.getElementById('teachAnswer').value = item.answer;
    document.getElementById('teachCategory').value = category;
    document.getElementById('teachKeywords').value = item.keywords?.join(', ') || '';
    
    showAITab('teach');
    
    const teachBtn = document.querySelector('.save-teach-btn');
    teachBtn.innerHTML = '<i class="fas fa-save"></i> Update Knowledge';
    teachBtn.onclick = () => updateKnowledge(itemId);
}

async function updateKnowledge(itemId) {
    const question = document.getElementById('teachQuestion').value.trim();
    const answer = document.getElementById('teachAnswer').value.trim();
    const category = document.getElementById('teachCategory').value;
    const keywordsInput = document.getElementById('teachKeywords').value;
    
    if (!question || !answer) {
        alert('Please fill in question and answer');
        return;
    }
    
    const keywords = keywordsInput.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
    
    // Update in Firestore
    if (window.AIChatbotFirebase.db) {
        await window.AIChatbotFirebase.updateKnowledgeEntry(itemId, { question, answer, keywords, category });
    }
    
    // Update local knowledgeBase
    for (const cat in knowledgeBase) {
        const index = knowledgeBase[cat]?.findIndex(i => i.id === itemId);
        if (index !== -1 && knowledgeBase[cat]) {
            knowledgeBase[cat][index] = {
                ...knowledgeBase[cat][index],
                question,
                answer,
                keywords,
                updatedAt: new Date().toISOString()
            };
            break;
        }
    }
    
    document.getElementById('teachQuestion').value = '';
    document.getElementById('teachAnswer').value = '';
    document.getElementById('teachKeywords').value = '';
    
    const teachBtn = document.querySelector('.save-teach-btn');
    teachBtn.innerHTML = '<i class="fas fa-save"></i> Save to Knowledge Base';
    teachBtn.onclick = teachAI;
    
    showNotification('Knowledge updated in Firestore!', 'success');
    renderKnowledgeBase();
}

async function deleteKnowledge(itemId) {
    if (!confirm('Delete this knowledge entry?')) return;
    
    // Delete from Firestore
    if (window.AIChatbotFirebase.db) {
        await window.AIChatbotFirebase.deleteKnowledgeEntry(itemId);
    }
    
    // Delete from local knowledgeBase
    for (const cat in knowledgeBase) {
        if (Array.isArray(knowledgeBase[cat])) {
            knowledgeBase[cat] = knowledgeBase[cat].filter(i => i.id !== itemId);
        }
    }
    
    renderKnowledgeBase();
    showNotification('Knowledge deleted from Firestore', 'success');
}

// ===== UNANSWERED QUESTIONS TAB =====
function renderUnanswered() {
    const container = document.getElementById('unansweredContainer');
    if (!container) return;
    
    if (unansweredQuestions.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-check-circle" style="font-size: 64px; color: #28a745; margin-bottom: 20px;"></i>
                <h3>No Unanswered Questions!</h3>
                <p>The AI is answering all questions correctly. Great job!</p>
            </div>
        `;
        return;
    }
    
    const grouped = {};
    unansweredQuestions.forEach(q => {
        const key = q.question.toLowerCase();
        if (!grouped[key]) {
            grouped[key] = {
                id: q.id,
                question: q.question,
                count: q.count || 1,
                firstAsked: q.timestamp,
                lastAsked: q.lastAsked || q.timestamp,
                users: [q.userType]
            };
        } else {
            grouped[key].count += (q.count || 1);
            grouped[key].lastAsked = q.lastAsked || q.timestamp;
            if (!grouped[key].users.includes(q.userType)) grouped[key].users.push(q.userType);
        }
    });
    
    const sorted = Object.values(grouped).sort((a, b) => b.count - a.count);
    
    let html = '<div class="unanswered-grid">';
    sorted.forEach(item => {
        const first = item.firstAsked ? new Date(item.firstAsked).toLocaleDateString() : 'Unknown';
        const last = item.lastAsked ? new Date(item.lastAsked).toLocaleDateString() : 'Unknown';
        
        html += `
            <div class="unanswered-card">
                <div class="unanswered-count">Asked ${item.count} time${item.count !== 1 ? 's' : ''}</div>
                <div class="unanswered-question">
                    <i class="fas fa-question-circle"></i>
                    ${escapeHtml(item.question)}
                </div>
                <div class="unanswered-meta">
                    <span><i class="far fa-calendar"></i> First: ${first}</span>
                    <span><i class="far fa-clock"></i> Last: ${last}</span>
                    <span><i class="fas fa-users"></i> ${item.users.join(', ')}</span>
                </div>
                <div class="unanswered-actions">
                    <button class="btn-teach" onclick="teachFromUnanswered('${escapeHtml(item.question).replace(/'/g, "\\'")}')">
                        <i class="fas fa-graduation-cap"></i> Teach Answer
                    </button>
                    <button class="btn-ignore" onclick="ignoreUnanswered('${escapeHtml(item.question).replace(/'/g, "\\'")}')">
                        <i class="fas fa-times"></i> Ignore
                    </button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

function filterUnanswered() {
    const searchTerm = document.getElementById('unansweredSearch')?.value.toLowerCase() || '';
    const filtered = unansweredQuestions.filter(q => q.question.toLowerCase().includes(searchTerm));
    
    const temp = unansweredQuestions;
    unansweredQuestions = filtered;
    renderUnanswered();
    unansweredQuestions = temp;
}

function teachFromUnanswered(question) {
    document.getElementById('teachQuestion').value = question;
    document.getElementById('teachAnswer').value = '';
    document.getElementById('teachCategory').value = 'faq';
    showAITab('teach');
    showNotification('Now teach the AI how to answer this question!', 'info');
}

async function ignoreUnanswered(question) {
    if (!confirm('Mark this question as ignored?')) return;
    
    const questionObj = unansweredQuestions.find(q => q.question.toLowerCase() === question.toLowerCase());
    
    if (questionObj && window.AIChatbotFirebase.db) {
        await window.AIChatbotFirebase.deleteUnansweredQuestion(questionObj.id);
    }
    
    unansweredQuestions = unansweredQuestions.filter(q => q.question.toLowerCase() !== question.toLowerCase());
    renderUnanswered();
    updateStats();
}

// ===== TEACH TAB =====
function renderQuickTeachList() {
    const container = document.getElementById('quickTeachList');
    if (!container) return;
    
    if (unansweredQuestions.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No unanswered questions to teach</p>';
        return;
    }
    
    const unique = [];
    const seen = new Set();
    unansweredQuestions.slice(0, 10).forEach(q => {
        if (!seen.has(q.question.toLowerCase())) {
            seen.add(q.question.toLowerCase());
            unique.push(q);
        }
    });
    
    let html = '<div class="quick-teach-list">';
    unique.forEach(q => {
        html += `
            <div class="quick-teach-item" onclick="document.getElementById('teachQuestion').value = '${q.question.replace(/'/g, "\\'")}';">
                <i class="fas fa-question-circle"></i>
                <span>${escapeHtml(q.question.substring(0, 60))}${q.question.length > 60 ? '...' : ''}</span>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

async function teachAI() {
    const question = document.getElementById('teachQuestion').value.trim();
    const answer = document.getElementById('teachAnswer').value.trim();
    const category = document.getElementById('teachCategory').value;
    const keywordsInput = document.getElementById('teachKeywords').value;
    
    if (!question || !answer) {
        alert('Please fill in question and answer');
        return;
    }
    
    const keywords = keywordsInput.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
    
    const newEntry = {
        question: question,
        answer: answer,
        keywords: keywords,
        category: category,
        usageCount: 0,
        lastUsed: null,
        createdBy: document.getElementById('adminName').textContent,
        createdAt: new Date().toISOString()
    };
    
    // Save to Firestore
    let savedEntry = null;
    if (window.AIChatbotFirebase.db) {
        savedEntry = await window.AIChatbotFirebase.addKnowledgeEntry(newEntry);
    }
    
    // Add to local knowledgeBase
    if (!knowledgeBase[category]) knowledgeBase[category] = [];
    knowledgeBase[category].push(savedEntry || { id: 'temp_' + Date.now(), ...newEntry });
    
    // Remove from unanswered questions
    const questionToRemove = unansweredQuestions.find(q => q.question.toLowerCase() === question.toLowerCase());
    if (questionToRemove && window.AIChatbotFirebase.db) {
        await window.AIChatbotFirebase.deleteUnansweredQuestion(questionToRemove.id);
    }
    unansweredQuestions = unansweredQuestions.filter(q => q.question.toLowerCase() !== question.toLowerCase());
    
    document.getElementById('teachQuestion').value = '';
    document.getElementById('teachAnswer').value = '';
    document.getElementById('teachKeywords').value = '';
    
    showNotification('✅ AI learned! Saved to Firestore', 'success');
    updateStats();
    renderQuickTeachList();
    renderUnanswered();
}

// ===== ANALYTICS TAB =====
function renderAnalytics() {
    renderPopularKeywords();
    renderPageStats();
    renderKnowledgeAnalytics();
}

function renderPopularKeywords() {
    const container = document.getElementById('popularKeywords');
    if (!container) return;
    
    const keywords = {};
    unansweredQuestions.forEach(q => {
        const words = q.question.toLowerCase().split(/\s+/);
        words.forEach(word => {
            if (word.length > 3) keywords[word] = (keywords[word] || 0) + 1;
        });
    });
    
    const sorted = Object.entries(keywords).sort((a, b) => b[1] - a[1]).slice(0, 20);
    
    if (sorted.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center;">No keywords recorded yet</p>';
        return;
    }
    
    let html = '<div class="keywords-cloud">';
    sorted.forEach(([keyword, count]) => {
        const size = Math.min(28, 12 + Math.floor(count / 2));
        html += `<span class="keyword-tag" style="font-size: ${size}px;">${keyword} (${count})</span>`;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

function renderPageStats() {
    const container = document.getElementById('pageStats');
    if (!container) return;
    
    const pageCounts = {};
    unansweredQuestions.forEach(q => {
        const page = q.page || 'Unknown';
        pageCounts[page] = (pageCounts[page] || 0) + 1;
    });
    
    const sorted = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]);
    
    if (sorted.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center;">No page data recorded</p>';
        return;
    }
    
    let html = '<table class="stats-table"><thead>汽<th>Page</th><th>Unanswered Questions</th> </thead><tbody>';
    sorted.forEach(([page, count]) => {
        html += `汽<td>${escapeHtml(page)}</td><td><strong>${count}</strong></td> </tr>`;
    });
    html += '</tbody> </table>';
    
    container.innerHTML = html;
}

function renderKnowledgeAnalytics() {
    const container = document.getElementById('performanceCharts');
    if (!container) return;
    
    const categoryCounts = {};
    for (const category in knowledgeBase) {
        if (Array.isArray(knowledgeBase[category])) {
            knowledgeBase[category].forEach(item => {
                categoryCounts[category] = (categoryCounts[category] || 0) + (item.usageCount || 0);
            });
        }
    }
    
    const totalUnanswered = unansweredQuestions.length;
    const totalKnowledge = Object.values(knowledgeBase).flat().length;
    
    let html = `
        <div class="stats-cards">
            <div class="stat-card unanswered">
                <div class="stat-icon"><i class="fas fa-question-circle"></i></div>
                <div class="stat-value">${totalUnanswered}</div>
                <div class="stat-label">Unanswered Questions</div>
            </div>
            <div class="stat-card knowledge">
                <div class="stat-icon"><i class="fas fa-database"></i></div>
                <div class="stat-value">${totalKnowledge}</div>
                <div class="stat-label">Knowledge Base Entries</div>
            </div>
        </div>
    `;
    
    if (Object.keys(categoryCounts).length > 0) {
        html += '<h4 style="margin: 30px 0 15px;">Knowledge Base Usage by Category</h4>';
        html += '<div class="category-usage">';
        
        const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'];
        let i = 0;
        
        for (const [category, count] of Object.entries(categoryCounts)) {
            const percent = totalKnowledge > 0 ? ((count / totalKnowledge) * 100).toFixed(1) : 0;
            html += `
                <div class="category-item">
                    <div class="category-header">
                        <span class="category-name" style="background: ${colors[i % colors.length]};">${category}</span>
                        <span class="category-count">${count} uses (${percent}%)</span>
                    </div>
                    <div class="category-bar">
                        <div class="category-fill" style="width: ${percent}%; background: ${colors[i % colors.length]};"></div>
                    </div>
                </div>
            `;
            i++;
        }
        
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// ===== LIVE SUPPORT =====
async function checkLiveSupportQueue() {
    if (!window.AIChatbotFirebase.db) return;
    
    const supportQueue = await window.AIChatbotFirebase.getSupportRequests();
    const waitingRequests = supportQueue.filter(r => r.status === 'waiting');
    
    const liveSupportTab = document.querySelector('.ai-tab-btn[onclick*="live"]');
    if (liveSupportTab) {
        let badge = liveSupportTab.querySelector('.notification-badge');
        if (waitingRequests.length > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'notification-badge';
                badge.textContent = waitingRequests.length;
                liveSupportTab.appendChild(badge);
            } else {
                badge.textContent = waitingRequests.length;
                badge.style.display = 'inline-block';
            }
        } else if (badge) {
            badge.style.display = 'none';
        }
    }
    
    const liveTab = document.getElementById('liveTab');
    if (liveTab && liveTab.classList.contains('active')) renderLiveSupportTab();
}

async function renderLiveSupportTab() {
    const container = document.getElementById('liveSupportContainer');
    if (!container || !window.AIChatbotFirebase.db) return;
    
    const supportQueue = await window.AIChatbotFirebase.getSupportRequests();
    
    if (supportQueue.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-headset" style="font-size: 64px; color: #ddd; margin-bottom: 20px;"></i>
                <h3>No Support Requests</h3>
                <p>All customers are currently being helped</p>
            </div>
        `;
        return;
    }
    
    const waiting = supportQueue.filter(r => r.status === 'waiting');
    const active = supportQueue.filter(r => r.status === 'active');
    const ended = supportQueue.filter(r => r.status === 'ended');
    
    document.getElementById('totalLiveRequests').textContent = supportQueue.length;
    document.getElementById('activeLiveChats').textContent = active.length;
    document.getElementById('waitingLiveChats').textContent = waiting.length;
    
    let html = '<div class="live-support-list">';
    
    if (waiting.length > 0) {
        html += '<h3 class="section-title">⏳ Waiting for Support</h3>';
        waiting.forEach(req => {
            const time = new Date(req.timestamp);
            const minutesAgo = Math.floor((Date.now() - time) / 60000);
            const waitTime = minutesAgo < 1 ? 'Just now' : `${minutesAgo} min ago`;
            
            html += `
                <div class="support-card waiting">
                    <div class="support-card-header">
                        <div class="support-user">
                            <i class="fas fa-user-circle"></i>
                            <strong>${escapeHtml(req.username)}</strong>
                            <span class="user-badge badge-${req.userType || 'guest'}">${req.userType || 'guest'}</span>
                        </div>
                        <button class="btn-join" onclick="joinLiveChat('${req.id}')">
                            <i class="fas fa-headset"></i> Join Chat
                        </button>
                    </div>
                    <div class="support-question">"${escapeHtml(req.question.substring(0, 100))}${req.question.length > 100 ? '...' : ''}"</div>
                    <div class="support-meta">
                        <span><i class="far fa-clock"></i> ${waitTime}</span>
                        <span><i class="fas fa-globe"></i> ${escapeHtml(req.page || 'Unknown')}</span>
                    </div>
                </div>
            `;
        });
    }
    
    if (active.length > 0) {
        html += '<h3 class="section-title">💬 Active Chats</h3>';
        active.forEach(chat => {
            const time = new Date(chat.timestamp);
            const messageCount = chat.messages ? chat.messages.length : 0;
            
            html += `
                <div class="support-card active">
                    <div class="support-card-header">
                        <div class="support-user">
                            <i class="fas fa-user-circle"></i>
                            <strong>${escapeHtml(chat.username)}</strong>
                            <span class="user-badge badge-${chat.userType || 'guest'}">${chat.userType || 'guest'}</span>
                            ${chat.assignedTo ? `<span class="agent-badge">👤 ${chat.assignedTo}</span>` : ''}
                        </div>
                        <button class="btn-open" onclick="openLiveChat('${chat.id}')">
                            <i class="fas fa-comment"></i> Open Chat
                        </button>
                    </div>
                    <div class="support-question">"${escapeHtml(chat.question.substring(0, 100))}${chat.question.length > 100 ? '...' : ''}"</div>
                    <div class="support-meta">
                        <span><i class="far fa-calendar"></i> ${time.toLocaleString()}</span>
                        <span><i class="fas fa-comment-dots"></i> ${messageCount} messages</span>
                    </div>
                </div>
            `;
        });
    }
    
    if (ended.length > 0) {
        html += '<h3 class="section-title">📋 Ended Chats</h3>';
        ended.forEach(chat => {
            const time = new Date(chat.timestamp);
            const endedTime = chat.endedAt ? new Date(chat.endedAt).toLocaleString() : 'Unknown';
            const messageCount = chat.messages ? chat.messages.length : 0;
            
            html += `
                <div class="support-card" style="border-left: 4px solid #6c757d; opacity: 0.8;">
                    <div class="support-card-header">
                        <div class="support-user">
                            <i class="fas fa-user-circle"></i>
                            <strong>${escapeHtml(chat.username)}</strong>
                            <span class="user-badge badge-${chat.userType || 'guest'}">${chat.userType || 'guest'}</span>
                            <span class="agent-badge" style="background: #6c757d; color: white;">✓ Ended</span>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn-open" onclick="openLiveChat('${chat.id}')" style="background: #6c757d;">
                                <i class="fas fa-eye"></i> View
                            </button>
                            <button class="btn-ignore" onclick="deleteEndedChat('${chat.id}')" style="background: #dc3545; color: white;">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                    <div class="support-question">"${escapeHtml(chat.question.substring(0, 100))}${chat.question.length > 100 ? '...' : ''}"</div>
                    <div class="support-meta">
                        <span><i class="far fa-calendar"></i> Started: ${time.toLocaleString()}</span>
                        <span><i class="fas fa-flag-checkered"></i> Ended: ${endedTime}</span>
                        <span><i class="fas fa-comment-dots"></i> ${messageCount} messages</span>
                    </div>
                </div>
            `;
        });
    }
    
    html += '</div>';
    container.innerHTML = html;
}

async function deleteEndedChat(requestId) {
    if (!confirm('Permanently delete this chat? This action cannot be undone.')) return;
    
    if (window.AIChatbotFirebase.db) {
        await window.AIChatbotFirebase.deleteSupportRequest(requestId);
        showNotification('Chat deleted from Firestore', 'success');
        renderLiveSupportTab();
    }
}

async function joinLiveChat(requestId) {
    if (!window.AIChatbotFirebase.db) return;
    
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    
    await window.AIChatbotFirebase.updateSupportRequest(requestId, {
        status: 'active',
        assignedTo: adminUser.name || 'Support Agent',
        assignedAt: new Date().toISOString()
    });
    
    await window.AIChatbotFirebase.addSupportMessage(
        requestId,
        `${adminUser.name || 'Support Agent'} has joined the chat`,
        'system'
    );
    
    showNotification('Joined chat successfully', 'success');
    checkLiveSupportQueue();
    openLiveChat(requestId);
}

async function openLiveChat(requestId) {
    if (!window.AIChatbotFirebase.db) return;
    
    const supportQueue = await window.AIChatbotFirebase.getSupportRequests();
    const chat = supportQueue.find(r => r.id === requestId);
    if (!chat) return;
    
    currentLiveChatId = requestId;
    currentChatWith = chat.username;
    
    const modal = document.getElementById('sessionModal');
    const modalBody = document.getElementById('sessionModalBody');
    
    let messagesHtml = '';
    if (chat.messages && chat.messages.length > 0) {
        messagesHtml = chat.messages.map(msg => {
            const isAdmin = msg.from === 'admin';
            const isSystem = msg.from === 'system';
            return `
                <div class="chat-message ${isAdmin ? 'admin' : isSystem ? 'system' : 'user'}">
                    <div class="chat-message-header">
                        <strong>${isSystem ? 'System' : (isAdmin ? 'You' : chat.username)}</strong>
                        <small>${new Date(msg.timestamp).toLocaleTimeString()}</small>
                    </div>
                    <div class="chat-message-content">${escapeHtml(msg.message)}</div>
                </div>
            `;
        }).join('');
    }
    
    modalBody.innerHTML = `
        <div class="live-chat-container">
            <div class="live-chat-header">
                <h3>Chat with ${escapeHtml(chat.username)}</h3>
                <div class="chat-info">
                    <span><i class="fas fa-tag"></i> ${chat.userType || 'guest'}</span>
                    <span><i class="far fa-clock"></i> ${new Date(chat.timestamp).toLocaleString()}</span>
                </div>
            </div>
            <div class="live-chat-messages" id="chatMessages">
                ${messagesHtml || '<p class="no-messages">No messages yet</p>'}
            </div>
            <div class="live-chat-input">
                <input type="text" id="adminReplyMessage" placeholder="Type your response..." autocomplete="off">
                <button onclick="sendLiveChatMessage()">
                    <i class="fas fa-paper-plane"></i> Send
                </button>
                <button class="btn-end" onclick="endLiveChat()">
                    <i class="fas fa-times"></i> End Chat
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    
    if (window.chatRefreshInterval) clearInterval(window.chatRefreshInterval);
    window.chatRefreshInterval = setInterval(() => refreshLiveChat(requestId), 3000);
}

async function refreshLiveChat(requestId) {
    if (!requestId || requestId !== currentLiveChatId || !window.AIChatbotFirebase.db) {
        if (window.chatRefreshInterval) clearInterval(window.chatRefreshInterval);
        return;
    }
    
    const supportQueue = await window.AIChatbotFirebase.getSupportRequests();
    const chat = supportQueue.find(r => r.id === requestId);
    
    if (!chat) {
        if (window.chatRefreshInterval) clearInterval(window.chatRefreshInterval);
        return;
    }
    
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    let messagesHtml = '';
    if (chat.messages && chat.messages.length > 0) {
        messagesHtml = chat.messages.map(msg => {
            const isAdmin = msg.from === 'admin';
            const isSystem = msg.from === 'system';
            return `
                <div class="chat-message ${isAdmin ? 'admin' : isSystem ? 'system' : 'user'}">
                    <div class="chat-message-header">
                        <strong>${isSystem ? 'System' : (isAdmin ? 'You' : chat.username)}</strong>
                        <small>${new Date(msg.timestamp).toLocaleTimeString()}</small>
                    </div>
                    <div class="chat-message-content">${escapeHtml(msg.message)}</div>
                </div>
            `;
        }).join('');
    }
    
    messagesContainer.innerHTML = messagesHtml;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function sendLiveChatMessage() {
    if (!currentLiveChatId || !window.AIChatbotFirebase.db) return;
    
    const message = document.getElementById('adminReplyMessage')?.value.trim();
    if (!message) return;
    
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    
    await window.AIChatbotFirebase.addSupportMessage(
        currentLiveChatId,
        message,
        'admin',
        adminUser.name
    );
    
    document.getElementById('adminReplyMessage').value = '';
    refreshLiveChat(currentLiveChatId);
    showNotification('Message sent to Firestore', 'success');
}

async function endLiveChat() {
    if (!currentLiveChatId || !window.AIChatbotFirebase.db) return;
    if (!confirm('End this chat session? The client will be notified that you left.')) return;
    
    await window.AIChatbotFirebase.updateSupportRequest(currentLiveChatId, {
        status: 'ended',
        endedAt: new Date().toISOString(),
        endedBy: 'admin'
    });
    
    await window.AIChatbotFirebase.addSupportMessage(
        currentLiveChatId,
        'Support agent has left the chat. You can continue asking questions to the AI assistant.',
        'system'
    );
    
    showNotification('Chat ended. Client has been notified.', 'success');
    
    if (window.chatRefreshInterval) {
        clearInterval(window.chatRefreshInterval);
        window.chatRefreshInterval = null;
    }
    
    closeSessionModal();
    currentLiveChatId = null;
    currentChatWith = null;
    renderLiveSupportTab();
}

async function updateLiveSupportStats() {
    if (!window.AIChatbotFirebase.db) return;
    
    const supportQueue = await window.AIChatbotFirebase.getSupportRequests();
    
    document.getElementById('totalLiveRequests').textContent = supportQueue.length;
    document.getElementById('activeLiveChats').textContent = supportQueue.filter(r => r.status === 'active').length;
    document.getElementById('waitingLiveChats').textContent = supportQueue.filter(r => r.status === 'waiting').length;
    
    const liveTab = document.getElementById('liveTab');
    if (liveTab && liveTab.classList.contains('active')) renderLiveSupportTab();
}

function closeSessionModal() {
    const modal = document.getElementById('sessionModal');
    if (modal) modal.classList.remove('active');
}

// ===== UTILITY FUNCTIONS =====
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i> ${message}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function setupSearchDebounce() {
    let timeout;
    ['knowledgeSearch', 'unansweredSearch'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    if (id === 'knowledgeSearch') filterKnowledge();
                    if (id === 'unansweredSearch') filterUnanswered();
                }, 300);
            });
        }
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

window.showAITab = showAITab;
window.filterKnowledge = filterKnowledge;
window.editKnowledge = editKnowledge;
window.deleteKnowledge = deleteKnowledge;
window.filterUnanswered = filterUnanswered;
window.teachFromUnanswered = teachFromUnanswered;
window.ignoreUnanswered = ignoreUnanswered;
window.teachAI = teachAI;
window.joinLiveChat = joinLiveChat;
window.openLiveChat = openLiveChat;
window.sendLiveChatMessage = sendLiveChatMessage;
window.endLiveChat = endLiveChat;
window.deleteEndedChat = deleteEndedChat;
window.closeSessionModal = closeSessionModal;
window.refreshUnansweredQuestions = refreshUnansweredQuestions;
window.refreshLiveSupport = refreshLiveSupport;

console.log('✅ All admin functions exposed globally');