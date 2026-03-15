// ai-chatbot-admin.js

// ===== GLOBAL DATA =====
let allSessions = [];
let knowledgeBase = { faq: [], products: [], braiders: [], affiliate: [] };
let unansweredQuestions = [];
let learningData = { unansweredQuestions: [], popularKeywords: {} };
let activeLiveChats = [];
let currentLiveChatId = null;
let currentChatWith = null;

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Chatbot Admin Initializing...');
    
    // Check admin login
    if (!checkAdminLogin()) return;
    
    // Load all data
    loadAllData();
    
    // Show sessions tab by default
    showAITab('sessions');
    
    // Set up search debounce
    setupSearchDebounce();

     // Start checking for live support requests
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
    
    // Display admin name
    try {
        const admin = JSON.parse(adminUser);
        document.getElementById('adminName').textContent = admin.name || 'Administrator';
    } catch (e) {}
    
    return true;
}

// In ai-chatbot-admin.js - Replace loadAllData function

function loadAllData() {
    console.log('Loading chatbot data for admin...');
    
    // Load sessions
    allSessions = JSON.parse(localStorage.getItem('ai_chatbot_sessions') || '[]');
    console.log('Loaded sessions:', allSessions.length);
    
    // Load knowledge base
    const savedKnowledge = localStorage.getItem('ai_chatbot_knowledge');
    if (savedKnowledge) {
        try {
            knowledgeBase = JSON.parse(savedKnowledge);
            console.log('Loaded knowledge base from localStorage');
        } catch (e) {
            console.error('Error parsing knowledge base:', e);
        }
    } else {
        // Try to get from global KNOWLEDGE_BASE
        if (typeof KNOWLEDGE_BASE !== 'undefined') {
            knowledgeBase = KNOWLEDGE_BASE;
            console.log('Loaded knowledge base from global variable');
            
            // Save to localStorage for persistence
            localStorage.setItem('ai_chatbot_knowledge', JSON.stringify(knowledgeBase));
        }
    }
    
    // Load unanswered questions
    unansweredQuestions = JSON.parse(localStorage.getItem('ai_chatbot_unanswered') || '[]');
    console.log('Loaded unanswered questions:', unansweredQuestions.length);
    
    // Load learning data
    const learningData = JSON.parse(localStorage.getItem('ai_chatbot_learning') || '{"unansweredQuestions":[],"popularKeywords":{}}');
    
    // If no unanswered in separate storage, use from learning data
    if (unansweredQuestions.length === 0 && learningData.unansweredQuestions) {
        unansweredQuestions = learningData.unansweredQuestions;
        localStorage.setItem('ai_chatbot_unanswered', JSON.stringify(unansweredQuestions));
    }
    
    // Update stats
    updateStats();
    
    // Render tabs based on active
    const activeTab = document.querySelector('.ai-tab-btn.active');
    if (activeTab) {
        const onclick = activeTab.getAttribute('onclick');
        if (onclick) {
            const match = onclick.match(/'([^']+)'/);
            if (match) {
                showAITab(match[1]);
            }
        }
    }
    
    // Show admin notification
    showNotification('Chatbot data loaded successfully', 'success');
}

// Add to ai-chatbot-admin.js

function refreshChatbotData() {
    loadAllData();
    showNotification('Data refreshed from localStorage', 'success');
}

function updateStats() {
    document.getElementById('totalSessions').textContent = allSessions.length;
    
    const totalQuestions = allSessions.reduce((sum, s) => sum + (s.questionCount || 0), 0);
    document.getElementById('totalQuestions').textContent = totalQuestions;
    
    document.getElementById('unansweredCount').textContent = unansweredQuestions.length;
    
    const knowledgeCount = Object.values(knowledgeBase).flat().length;
    document.getElementById('knowledgeCount').textContent = knowledgeCount;
}

function showAITab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.ai-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.ai-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabId + 'Tab').classList.add('active');
    
    // Activate corresponding button
    document.querySelector(`.ai-tab-btn[onclick*="${tabId}"]`).classList.add('active');
    
    // Load tab data
    switch(tabId) {
        case 'sessions':
            renderSessions();
            break;
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

// ===== SESSIONS TAB =====
function renderSessions() {
    const tbody = document.getElementById('sessionsTableBody');
    
    if (allSessions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-table">No sessions recorded yet</td></tr>';
        return;
    }
    
    // Sort by most recent
    const sorted = [...allSessions].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    
    let html = '';
    sorted.forEach(session => {
        const start = new Date(session.startTime);
        const end = session.endTime ? new Date(session.endTime) : new Date();
        const duration = Math.round((end - start) / 1000); // seconds
        
        const durationStr = duration < 60 ? `${duration}s` : 
                           duration < 3600 ? `${Math.floor(duration/60)}m ${duration%60}s` :
                           `${Math.floor(duration/3600)}h ${Math.floor((duration%3600)/60)}m`;
        
        const badgeClass = `badge-${session.userType || 'guest'}`;
        
        html += `
            <tr onclick="viewSession('${session.id}')">
                <td>
                    <strong>${session.username || 'Guest'}</strong><br>
                    <small style="color:#666;">${session.userId || ''}</small>
                </td>
                <td><span class="user-badge ${badgeClass}">${session.userType || 'guest'}</span></td>
                <td><small>${session.page || 'Unknown'}</small></td>
                <td><strong>${session.questionCount || 0}</strong></td>
                <td>${start.toLocaleString()}</td>
                <td>${durationStr}</td>
                <td onclick="event.stopPropagation()">
                    <button class="view-btn" onclick="viewSession('${session.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="delete-btn" onclick="deleteSession('${session.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function filterSessions() {
    const searchTerm = document.getElementById('sessionSearch').value.toLowerCase();
    const userType = document.getElementById('userTypeFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    const filtered = allSessions.filter(session => {
        // Search filter
        const matchesSearch = !searchTerm || 
            (session.username && session.username.toLowerCase().includes(searchTerm)) ||
            (session.userId && session.userId.toLowerCase().includes(searchTerm)) ||
            (session.page && session.page.toLowerCase().includes(searchTerm));
        
        // User type filter
        const matchesType = !userType || (session.userType || 'guest') === userType;
        
        // Date filter
        let matchesDate = true;
        if (dateFilter) {
            const sessionDate = new Date(session.startTime);
            const now = new Date();
            
            if (dateFilter === 'today') {
                matchesDate = sessionDate.toDateString() === now.toDateString();
            } else if (dateFilter === 'week') {
                const weekAgo = new Date(now.setDate(now.getDate() - 7));
                matchesDate = sessionDate >= weekAgo;
            } else if (dateFilter === 'month') {
                const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
                matchesDate = sessionDate >= monthAgo;
            }
        }
        
        return matchesSearch && matchesType && matchesDate;
    });
    
    // Temporarily replace allSessions for display
    const temp = allSessions;
    allSessions = filtered;
    renderSessions();
    allSessions = temp;
}

function viewSession(sessionId) {
    const session = allSessions.find(s => s.id === sessionId);
    if (!session) return;
    
    const modalBody = document.getElementById('sessionModalBody');
    const modal = document.getElementById('sessionModal');
    
    const start = new Date(session.startTime);
    const end = session.endTime ? new Date(session.endTime) : new Date();
    
    let activitiesHtml = '';
    if (session.activities && session.activities.length > 0) {
        session.activities.forEach(act => {
            const time = new Date(act.timestamp).toLocaleTimeString();
            const actClass = act.type || 'click';
            
            activitiesHtml += `
                <div class="activity-item ${actClass}">
                    <strong>${act.type}:</strong> ${act.question || act.element || act.page || '-'}
                    <div class="activity-time">${time} | Page: ${act.page || session.page}</div>
                </div>
            `;
        });
    } else {
        activitiesHtml = '<p>No detailed activity recorded for this session.</p>';
    }
    
    modalBody.innerHTML = `
        <h4>Session Overview</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div>
                <p><strong>User:</strong> ${session.username || 'Guest'}</p>
                <p><strong>Type:</strong> <span class="user-badge badge-${session.userType || 'guest'}">${session.userType || 'guest'}</span></p>
                <p><strong>User ID:</strong> ${session.userId || 'N/A'}</p>
            </div>
            <div>
                <p><strong>Start Time:</strong> ${start.toLocaleString()}</p>
                <p><strong>End Time:</strong> ${end.toLocaleString()}</p>
                <p><strong>Questions:</strong> ${session.questionCount || 0}</p>
            </div>
        </div>
        
        <h4>Device Info</h4>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p><strong>Platform:</strong> ${session.deviceInfo?.platform || 'Unknown'}</p>
            <p><strong>Screen:</strong> ${session.deviceInfo?.screen || 'Unknown'}</p>
            <p><strong>Language:</strong> ${session.deviceInfo?.language || 'Unknown'}</p>
            <p><strong>User Agent:</strong> <small>${session.deviceInfo?.userAgent || 'Unknown'}</small></p>
        </div>
        
        <h4>Activity Timeline</h4>
        <div class="activity-timeline">
            ${activitiesHtml}
        </div>
        
        <div style="margin-top: 20px; display: flex; gap: 10px;">
            <button class="delete-btn" onclick="deleteSession('${session.id}'); closeSessionModal();" style="flex:1;">
                <i class="fas fa-trash"></i> Delete This Session
            </button>
            <button class="view-btn" onclick="closeSessionModal()" style="flex:1;">
                Close
            </button>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeSessionModal() {
    document.getElementById('sessionModal').classList.remove('active');
}

function deleteSession(sessionId) {
    if (!confirm('Are you sure you want to delete this session?')) return;
    
    allSessions = allSessions.filter(s => s.id !== sessionId);
    localStorage.setItem('ai_chatbot_sessions', JSON.stringify(allSessions));
    
    updateStats();
    renderSessions();
    closeSessionModal();
    
    showNotification('Session deleted successfully', 'success');
}

function exportSessions() {
    const data = allSessions.map(s => ({
        username: s.username || 'Guest',
        userType: s.userType || 'guest',
        page: s.page,
        questions: s.questionCount || 0,
        startTime: s.startTime,
        endTime: s.endTime,
        device: s.deviceInfo?.platform || 'Unknown'
    }));
    
    const csv = convertToCSV(data);
    downloadCSV(csv, `chatbot-sessions-${new Date().toISOString().split('T')[0]}.csv`);
}

// ===== KNOWLEDGE BASE TAB =====
function renderKnowledgeBase() {
    const container = document.getElementById('knowledgeBaseContainer');
    
    const allItems = [];
    for (const category in knowledgeBase) {
        if (Array.isArray(knowledgeBase[category])) {
            knowledgeBase[category].forEach(item => {
                allItems.push({ ...item, category });
            });
        }
    }
    
    if (allItems.length === 0) {
        container.innerHTML = '<div class="empty-state">No knowledge base entries yet. Teach the AI something!</div>';
        return;
    }
    
    // Sort by usage count (most used first)
    allItems.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    
    let html = '';
    allItems.forEach(item => {
        const lastUsed = item.lastUsed ? new Date(item.lastUsed).toLocaleDateString() : 'Never';
        
        html += `
            <div class="knowledge-item">
                <div class="knowledge-question">
                    <i class="fas fa-question-circle"></i> ${item.question}
                </div>
                <div class="knowledge-answer">
                    <i class="fas fa-reply"></i> ${item.answer}
                </div>
                <div class="knowledge-meta">
                    <span><i class="fas fa-tag"></i> ${item.category}</span>
                    <span><i class="fas fa-chart-bar"></i> Used: ${item.usageCount || 0} times</span>
                    <span><i class="fas fa-clock"></i> Last: ${lastUsed}</span>
                </div>
                <div style="margin-top: 15px;">
                    <button class="edit-knowledge-btn" onclick="editKnowledge('${item.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="delete-knowledge-btn" onclick="deleteKnowledge('${item.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function filterKnowledge() {
    const searchTerm = document.getElementById('knowledgeSearch').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    
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
    
    // Temporarily render filtered
    const container = document.getElementById('knowledgeBaseContainer');
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">No matching entries</div>';
        return;
    }
    
    let html = '';
    filtered.forEach(item => {
        const lastUsed = item.lastUsed ? new Date(item.lastUsed).toLocaleDateString() : 'Never';
        
        html += `
            <div class="knowledge-item">
                <div class="knowledge-question">
                    <i class="fas fa-question-circle"></i> ${item.question}
                </div>
                <div class="knowledge-answer">
                    <i class="fas fa-reply"></i> ${item.answer}
                </div>
                <div class="knowledge-meta">
                    <span><i class="fas fa-tag"></i> ${item.category}</span>
                    <span><i class="fas fa-chart-bar"></i> Used: ${item.usageCount || 0} times</span>
                    <span><i class="fas fa-clock"></i> Last: ${lastUsed}</span>
                </div>
                <div style="margin-top: 15px;">
                    <button class="edit-knowledge-btn" onclick="editKnowledge('${item.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="delete-knowledge-btn" onclick="deleteKnowledge('${item.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function editKnowledge(itemId) {
    // Find the item
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
    
    // Pre-fill teach form
    document.getElementById('teachQuestion').value = item.question;
    document.getElementById('teachAnswer').value = item.answer;
    document.getElementById('teachCategory').value = category;
    document.getElementById('teachKeywords').value = item.keywords?.join(', ') || '';
    
    // Switch to teach tab
    showAITab('teach');
    
    // Change button text temporarily
    const teachBtn = document.querySelector('.save-teach-btn');
    teachBtn.innerHTML = '<i class="fas fa-save"></i> Update Knowledge';
    teachBtn.onclick = () => updateKnowledge(itemId);
}

function updateKnowledge(itemId) {
    const question = document.getElementById('teachQuestion').value.trim();
    const answer = document.getElementById('teachAnswer').value.trim();
    const category = document.getElementById('teachCategory').value;
    const keywordsInput = document.getElementById('teachKeywords').value;
    
    if (!question || !answer) {
        alert('Please fill in question and answer');
        return;
    }
    
    const keywords = keywordsInput.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
    
    // Find and update
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
    
    localStorage.setItem('ai_chatbot_knowledge', JSON.stringify(knowledgeBase));
    
    // Reset form
    document.getElementById('teachQuestion').value = '';
    document.getElementById('teachAnswer').value = '';
    document.getElementById('teachKeywords').value = '';
    
    // Reset button
    const teachBtn = document.querySelector('.save-teach-btn');
    teachBtn.innerHTML = '<i class="fas fa-save"></i> Save to Knowledge Base';
    teachBtn.onclick = teachAI;
    
    showNotification('Knowledge updated successfully!', 'success');
    
    // Refresh knowledge tab
    renderKnowledgeBase();
}

function deleteKnowledge(itemId) {
    if (!confirm('Are you sure you want to delete this knowledge entry?')) return;
    
    for (const cat in knowledgeBase) {
        if (Array.isArray(knowledgeBase[cat])) {
            knowledgeBase[cat] = knowledgeBase[cat].filter(i => i.id !== itemId);
        }
    }
    
    localStorage.setItem('ai_chatbot_knowledge', JSON.stringify(knowledgeBase));
    
    renderKnowledgeBase();
    showNotification('Knowledge deleted', 'success');
}

// ===== UNANSWERED QUESTIONS TAB =====
function renderUnanswered() {
    const container = document.getElementById('unansweredContainer');
    
    if (unansweredQuestions.length === 0) {
        container.innerHTML = '<div class="empty-state">No unanswered questions! 🎉</div>';
        return;
    }
    
    // Group by question
    const grouped = {};
    unansweredQuestions.forEach(q => {
        const key = q.question.toLowerCase();
        if (!grouped[key]) {
            grouped[key] = {
                question: q.question,
                count: 1,
                firstAsked: q.timestamp,
                lastAsked: q.timestamp,
                users: [q.userType]
            };
        } else {
            grouped[key].count++;
            grouped[key].lastAsked = q.timestamp;
            if (!grouped[key].users.includes(q.userType)) {
                grouped[key].users.push(q.userType);
            }
        }
    });
    
    // Sort by count
    const sorted = Object.values(grouped).sort((a, b) => b.count - a.count);
    
    let html = '';
    sorted.forEach(item => {
        const first = new Date(item.firstAsked).toLocaleDateString();
        const last = new Date(item.lastAsked).toLocaleDateString();
        
        html += `
            <div class="knowledge-item" style="border-left-color: #e74c3c;">
                <div class="knowledge-question">
                    <i class="fas fa-question-circle"></i> ${item.question}
                </div>
                <div class="knowledge-meta">
                    <span><i class="fas fa-chart-bar"></i> Asked ${item.count} times</span>
                    <span><i class="fas fa-users"></i> ${item.users.join(', ')}</span>
                    <span><i class="fas fa-clock"></i> First: ${first}</span>
                    <span><i class="fas fa-clock"></i> Last: ${last}</span>
                </div>
                <div style="margin-top: 15px;">
                    <button class="edit-knowledge-btn" onclick="teachFromUnanswered('${item.question}')">
                        <i class="fas fa-graduation-cap"></i> Teach Answer
                    </button>
                    <button class="delete-knowledge-btn" onclick="ignoreUnanswered('${item.question}')">
                        <i class="fas fa-times"></i> Ignore
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function filterUnanswered() {
    const searchTerm = document.getElementById('unansweredSearch').value.toLowerCase();
    
    const filtered = unansweredQuestions.filter(q => 
        q.question.toLowerCase().includes(searchTerm)
    );
    
    // Temporarily replace for display
    const temp = unansweredQuestions;
    unansweredQuestions = filtered;
    renderUnanswered();
    unansweredQuestions = temp;
}

function teachFromUnanswered(question) {
    // Pre-fill teach form
    document.getElementById('teachQuestion').value = question;
    document.getElementById('teachAnswer').value = '';
    document.getElementById('teachCategory').value = 'faq';
    
    // Switch to teach tab
    showAITab('teach');
    
    showNotification('Now teach the AI how to answer this!', 'info');
}

function ignoreUnanswered(question) {
    if (!confirm('Mark this question as ignored?')) return;
    
    unansweredQuestions = unansweredQuestions.filter(q => 
        q.question.toLowerCase() !== question.toLowerCase()
    );
    
    learningData.unansweredQuestions = unansweredQuestions;
    localStorage.setItem('ai_chatbot_learning', JSON.stringify(learningData));
    
    renderUnanswered();
    updateStats();
}

// ===== TEACH TAB =====
function renderQuickTeachList() {
    const container = document.getElementById('quickTeachList');
    
    if (unansweredQuestions.length === 0) {
        container.innerHTML = '<p>No unanswered questions to teach.</p>';
        return;
    }
    
    // Get unique recent questions
    const unique = [];
    const seen = new Set();
    
    unansweredQuestions.slice(0, 10).forEach(q => {
        if (!seen.has(q.question.toLowerCase())) {
            seen.add(q.question.toLowerCase());
            unique.push(q);
        }
    });
    
    let html = '';
    unique.forEach(q => {
        html += `
            <div style="padding: 8px; background: white; margin-bottom: 5px; border-radius: 5px; cursor: pointer;"
                 onclick="document.getElementById('teachQuestion').value = '${q.question.replace(/'/g, "\\'")}';">
                <i class="fas fa-question-circle"></i> ${q.question.substring(0, 50)}...
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function teachAI() {
    const question = document.getElementById('teachQuestion').value.trim();
    const answer = document.getElementById('teachAnswer').value.trim();
    const category = document.getElementById('teachCategory').value;
    const keywordsInput = document.getElementById('teachKeywords').value;
    
    if (!question || !answer) {
        alert('Please fill in question and answer');
        return;
    }
    
    const keywords = keywordsInput.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
    
    // Create new knowledge entry
    const newEntry = {
        id: 'learned_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        question: question,
        answer: answer,
        keywords: keywords,
        category: category,
        usageCount: 0,
        lastUsed: null,
        createdBy: document.getElementById('adminName').textContent,
        createdAt: new Date().toISOString()
    };
    
    if (!knowledgeBase[category]) {
        knowledgeBase[category] = [];
    }
    
    knowledgeBase[category].push(newEntry);
    localStorage.setItem('ai_chatbot_knowledge', JSON.stringify(knowledgeBase));
    
    // Remove from unanswered
    unansweredQuestions = unansweredQuestions.filter(q => 
        !q.question.toLowerCase().includes(question.toLowerCase())
    );
    learningData.unansweredQuestions = unansweredQuestions;
    localStorage.setItem('ai_chatbot_learning', JSON.stringify(learningData));
    
    // Clear form
    document.getElementById('teachQuestion').value = '';
    document.getElementById('teachAnswer').value = '';
    document.getElementById('teachKeywords').value = '';
    
    showNotification('✅ AI learned successfully!', 'success');
    
    // Update stats and refresh
    updateStats();
    renderQuickTeachList();
}

// ===== ANALYTICS TAB =====
function renderAnalytics() {
    renderPopularQuestions();
    renderPopularKeywords();
    renderPageStats();
    renderTimeStats(); 
    renderPerformanceCharts()
}

function renderPopularQuestions() {
    const container = document.getElementById('popularQuestions');
    
    // Count questions from sessions
    const questionCounts = {};
    
    allSessions.forEach(session => {
        if (session.activities) {
            session.activities.forEach(act => {
                if (act.type === 'question' && act.question) {
                    const q = act.question.toLowerCase();
                    questionCounts[q] = (questionCounts[q] || 0) + 1;
                }
            });
        }
    });
    
    const sorted = Object.entries(questionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    if (sorted.length === 0) {
        container.innerHTML = '<p>No questions recorded yet.</p>';
        return;
    }
    
    let html = '<ol style="padding-left: 20px;">';
    sorted.forEach(([q, count]) => {
        html += `<li><strong>${q.substring(0, 50)}...</strong> (${count} times)</li>`;
    });
    html += '</ol>';
    
    container.innerHTML = html;
}

function renderPopularKeywords() {
    const container = document.getElementById('popularKeywords');
    
    const keywords = learningData.popularKeywords || {};
    const sorted = Object.entries(keywords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);
    
    if (sorted.length === 0) {
        container.innerHTML = '<p>No keywords recorded yet.</p>';
        return;
    }
    
    let html = '<div style="display: flex; flex-wrap: wrap; gap: 10px;">';
    sorted.forEach(([keyword, count]) => {
        const size = Math.min(24, 14 + Math.floor(count / 2));
        html += `<span style="font-size: ${size}px; background: #e3f2fd; padding: 5px 10px; border-radius: 20px;">
                    ${keyword} (${count})
                </span>`;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

function renderPageStats() {
    const container = document.getElementById('pageStats');
    
    const pageCounts = {};
    
    allSessions.forEach(session => {
        const page = session.page || 'Unknown';
        pageCounts[page] = (pageCounts[page] || 0) + 1;
    });
    
    const sorted = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]);
    
    if (sorted.length === 0) {
        container.innerHTML = '<p>No page data recorded.</p>';
        return;
    }
    
    let html = '<table class="ai-sessions-table" style="margin-top: 10px;"><tr><th>Page</th><th>Sessions</th><th>%</th></tr>';
    const total = allSessions.length;
    
    sorted.forEach(([page, count]) => {
        const percent = ((count / total) * 100).toFixed(1);
        html += `<tr><td>${page}</td><td><strong>${count}</strong></td><td>${percent}%</td></tr>`;
    });
    
    html += '</table>';
    container.innerHTML = html;
}

function renderTimeStats() {
    const container = document.getElementById('timeStats');
    if (!container) {
        // Create container if it doesn't exist
        const analyticsTab = document.getElementById('analyticsTab');
        const timeDiv = document.createElement('div');
        timeDiv.id = 'timeStats';
        timeDiv.style.marginTop = '30px';
        analyticsTab.querySelector('div').appendChild(timeDiv);
    }
    
    // Group sessions by hour
    const hourCounts = {};
    for (let i = 0; i < 24; i++) {
        hourCounts[i] = 0;
    }
    
    allSessions.forEach(session => {
        const hour = new Date(session.startTime).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const hours = Object.keys(hourCounts);
    const counts = Object.values(hourCounts);
    
    let html = '<h3>User Activity by Hour</h3>';
    html += '<div style="display: flex; align-items: flex-end; height: 200px; gap: 5px; margin-top: 20px;">';
    
    const maxCount = Math.max(...counts, 1);
    
    hours.forEach((hour, i) => {
        const height = (counts[i] / maxCount) * 180;
        html += `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
                <div style="height: ${height}px; width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 5px 5px 0 0;"></div>
                <div style="margin-top: 5px; font-size: 11px;">${hour}:00</div>
                <div style="font-size: 10px; color: #666;">${counts[i]}</div>
            </div>
        `;
    });
    
    html += '</div>';
    
    document.getElementById('timeStats').innerHTML = html;
}

function renderPerformanceCharts() {
    const container = document.getElementById('performanceCharts');
    if (!container) {
        const analyticsTab = document.getElementById('analyticsTab');
        const perfDiv = document.createElement('div');
        perfDiv.id = 'performanceCharts';
        perfDiv.style.marginTop = '30px';
        analyticsTab.querySelector('div').appendChild(perfDiv);
    }
    
    // Calculate answer rate
    const totalQuestions = allSessions.reduce((sum, s) => sum + (s.questionCount || 0), 0);
    const answeredRate = totalQuestions > 0 
        ? ((totalQuestions - unansweredQuestions.length) / totalQuestions * 100).toFixed(1)
        : 0;
    
    // Calculate average response time (mock)
    const avgResponseTime = '2.5 seconds';
    
    // Get top categories
    const categoryCounts = {};
    knowledgeBase.forEach((items, category) => {
        if (Array.isArray(items)) {
            items.forEach(item => {
                const count = item.usageCount || 0;
                categoryCounts[category] = (categoryCounts[category] || 0) + count;
            });
        }
    });
    
    let html = `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0;">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #667eea;">${totalQuestions}</div>
                <div style="color: #666;">Total Questions</div>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #28a745;">${answeredRate}%</div>
                <div style="color: #666;">Answer Rate</div>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #17a2b8;">${avgResponseTime}</div>
                <div style="color: #666;">Avg Response</div>
            </div>
        </div>
    `;
    
    // Category usage chart
    if (Object.keys(categoryCounts).length > 0) {
        html += '<h4 style="margin-top: 30px;">Knowledge Base Usage by Category</h4>';
        html += '<div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">';
        
        const colors = ['#667eea', '#28a745', '#ffc107', '#dc3545', '#17a2b8'];
        let i = 0;
        
        for (const [category, count] of Object.entries(categoryCounts)) {
            html += `
                <div style="flex: 1; min-width: 150px; background: white; border-radius: 8px; padding: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <div style="font-weight: 600; color: ${colors[i % colors.length]};">${category}</div>
                    <div style="font-size: 24px; margin: 10px 0;">${count}</div>
                    <div style="font-size: 12px; color: #666;">times used</div>
                </div>
            `;
            i++;
        }
        
        html += '</div>';
    }
    
    document.getElementById('performanceCharts').innerHTML = html;
}

// ===== UTILITY FUNCTIONS =====
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#28a745' : '#17a2b8'};
        color: white;
        border-radius: 8px;
        z-index: 10001;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(h => JSON.stringify(obj[h] || '')).join(','));
    return [headers.join(','), ...rows].join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(blob);
}

function setupSearchDebounce() {
    let timeout;
    ['sessionSearch', 'knowledgeSearch', 'unansweredSearch'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    if (id === 'sessionSearch') filterSessions();
                    if (id === 'knowledgeSearch') filterKnowledge();
                    if (id === 'unansweredSearch') filterUnanswered();
                }, 300);
            });
        }
    });
}

// Add to ai-chatbot-admin.js - Live support management
// Replace your checkLiveSupportQueue function
function checkLiveSupportQueue() {
    const supportQueue = JSON.parse(localStorage.getItem('live_support_queue') || '[]');
    const waitingRequests = supportQueue.filter(r => r.status === 'waiting');
    
    console.log('🔍 Checking support queue - Waiting:', waitingRequests.length);
    
    // Update badge on Live Support tab
    const liveSupportTab = document.querySelector('.ai-tab-btn[onclick*="live"]');
    if (liveSupportTab) {
        let badge = liveSupportTab.querySelector('.notification-badge');
        
        if (waitingRequests.length > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'notification-badge';
                badge.style.cssText = `
                    background: #dc3545;
                    color: white;
                    margin-left: 8px;
                    padding: 2px 8px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    display: inline-block;
                    animation: pulse 1.5s infinite;
                `;
                liveSupportTab.appendChild(badge);
            }
            badge.textContent = waitingRequests.length;
            badge.style.display = 'inline-block';
            
            // Also update page title if this tab is open in background
            if (document.hidden) {
                document.title = `(${waitingRequests.length}) New Support Requests - WigHub AI Admin`;
            }
        } else {
            if (badge) {
                badge.style.display = 'none';
            }
            document.title = 'WigHub AI Admin';
        }
    }
    
    // Auto-refresh if live support tab is active
    const liveTab = document.getElementById('liveTab');
    if (liveTab && liveTab.classList.contains('active')) {
        renderLiveSupportTab();
    }
}

// Replace your renderLiveSupportTab function
function renderLiveSupportTab() {
    const container = document.getElementById('liveSupportContainer');
    if (!container) return;
    
    const supportQueue = JSON.parse(localStorage.getItem('live_support_queue') || '[]');
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    
    console.log('📊 Rendering live support tab - Total requests:', supportQueue.length);
    
    // Separate waiting and active chats
    const waiting = supportQueue.filter(r => r.status === 'waiting');
    const active = supportQueue.filter(r => r.status === 'active' && r.assignedTo === adminUser.name);
    const otherActive = supportQueue.filter(r => r.status === 'active' && r.assignedTo !== adminUser.name);
    
    let html = `
        <style>
            .support-request, .active-chat {
                transition: all 0.3s ease;
                margin-bottom: 15px;
                border-radius: 10px;
                animation: slideIn 0.3s ease;
            }
            .support-request:hover, .active-chat:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            @keyframes slideIn {
                from { opacity: 0; transform: translateX(-20px); }
                to { opacity: 1; transform: translateX(0); }
            }
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            .waiting-time {
                font-size: 11px;
                color: #666;
                margin-top: 5px;
            }
        </style>
    `;
    
    // Waiting requests section
    html += `
        <div style="margin-bottom: 30px;">
            <h3 style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                <i class="fas fa-clock" style="color: #ffc107;"></i>
                Waiting for Support (${waiting.length})
                ${waiting.length > 0 ? 
                    '<span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 20px; font-size: 12px;">New</span>' : 
                    ''}
            </h3>
    `;
    
    if (waiting.length === 0) {
        html += '<p class="empty-state" style="text-align: center; padding: 40px; color: #666;">No waiting requests</p>';
    } else {
        html += '<div style="display: grid; gap: 15px;">';
        waiting.forEach(req => {
            const time = new Date(req.timestamp);
            const now = new Date();
            const waitMinutes = Math.floor((now - time) / (1000 * 60));
            const waitDisplay = waitMinutes < 1 ? 'Just now' : 
                               waitMinutes < 60 ? `${waitMinutes} min${waitMinutes > 1 ? 's' : ''} ago` : 
                               'Over an hour ago';
            
            html += `
                <div class="support-request" style="background: #fff3cd; padding: 20px; border-radius: 10px; border-left: 4px solid #ffc107; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap;">
                                <strong style="font-size: 16px;">${req.username}</strong>
                                <span class="user-badge badge-${req.userType || 'guest'}" style="padding: 3px 10px; border-radius: 15px; font-size: 11px;">${req.userType || 'guest'}</span>
                                <span class="waiting-time"><i class="far fa-clock"></i> ${waitDisplay}</span>
                            </div>
                            <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                                <strong style="color: #333;">Question:</strong>
                                <p style="margin-top: 8px; color: #555;">"${req.question}"</p>
                            </div>
                            <div style="font-size: 12px; color: #666; margin-top: 10px;">
                                <i class="fas fa-globe"></i> Page: ${req.page || 'Unknown'} | 
                                <i class="fas fa-clock"></i> ${time.toLocaleString()}
                            </div>
                        </div>
                        <button class="view-btn" onclick="joinLiveChat('${req.id}')" style="background: #28a745; color: white; border: none; padding: 12px 25px; border-radius: 8px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.3s;">
                            <i class="fas fa-headset"></i> Join Chat
                        </button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    html += `</div>`;
    
    // Your active chats section
    html += `
        <div style="margin-top: 30px;">
            <h3 style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                <i class="fas fa-comments" style="color: #28a745;"></i>
                Your Active Chats (${active.length})
            </h3>
    `;
    
    if (active.length === 0) {
        html += '<p class="empty-state" style="text-align: center; padding: 40px; color: #666;">No active chats</p>';
    } else {
        html += '<div style="display: grid; gap: 15px;">';
        active.forEach(chat => {
            const time = new Date(chat.timestamp);
            const lastMessage = chat.messages && chat.messages.length > 0 ? 
                chat.messages[chat.messages.length - 1].message : 
                'No messages yet';
            
            html += `
                <div class="active-chat" style="background: #d4edda; padding: 20px; border-radius: 10px; border-left: 4px solid #28a745; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap;">
                                <strong style="font-size: 16px;">${chat.username}</strong>
                                <span class="user-badge badge-${chat.userType || 'guest'}">${chat.userType || 'guest'}</span>
                                <span style="font-size: 12px; color: #666;">
                                    <i class="far fa-clock"></i> Started: ${time.toLocaleTimeString()}
                                </span>
                            </div>
                            <div style="background: white; padding: 10px; border-radius: 5px; margin-top: 5px;">
                                <strong>Last message:</strong> 
                                <span style="color: #555;">${lastMessage.substring(0, 50)}${lastMessage.length > 50 ? '...' : ''}</span>
                            </div>
                            <div style="margin-top: 10px; font-size: 12px; color: #666;">
                                <i class="fas fa-comment-dots"></i> 
                                ${chat.messages ? chat.messages.length : 0} message(s)
                            </div>
                        </div>
                        <button class="view-btn" onclick="openLiveChat('${chat.id}')" style="background: #3498db; color: white; border: none; padding: 12px 25px; border-radius: 8px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.3s;">
                            <i class="fas fa-comment"></i> Open Chat
                        </button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    html += `</div>`;
    
    // Other active chats section
    if (otherActive.length > 0) {
        html += `
            <div style="margin-top: 30px;">
                <h3 style="color: #666; margin-bottom: 15px;">
                    <i class="fas fa-users"></i> Other Active Chats (${otherActive.length})
                </h3>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <p style="color: #666; margin: 0;">
                        ${otherActive.length} chat(s) assigned to other agents
                    </p>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// Replace your joinLiveChat function
function joinLiveChat(requestId) {
    console.log('🎯 Joining live chat:', requestId);
    
    const supportQueue = JSON.parse(localStorage.getItem('live_support_queue') || '[]');
    const requestIndex = supportQueue.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) {
        showNotification('❌ Request not found', 'error');
        return;
    }
    
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    
    // Update request
    supportQueue[requestIndex].status = 'active';
    supportQueue[requestIndex].assignedTo = adminUser.name || 'Support Agent';
    supportQueue[requestIndex].assignedAt = new Date().toISOString();
    
    // Initialize messages array if it doesn't exist
    if (!supportQueue[requestIndex].messages) {
        supportQueue[requestIndex].messages = [];
    }
    
    // Add system message
    supportQueue[requestIndex].messages.push({
        from: 'system',
        message: `${adminUser.name || 'Support Agent'} has joined the chat`,
        timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('live_support_queue', JSON.stringify(supportQueue));
    
    console.log('✅ Joined chat:', requestId);
    showNotification('✅ Joined chat successfully', 'success');
    
    // Update badge
    checkLiveSupportQueue();
    
    // Open chat window
    openLiveChat(requestId);
}

// Update sendLiveChatMessage function to ensure messages are saved
function sendLiveChatMessage() {
    if (!currentLiveChatId) return;
    
    const message = document.getElementById('adminReplyMessage').value.trim();
    if (!message) return;
    
    const supportQueue = JSON.parse(localStorage.getItem('live_support_queue') || '[]');
    const chatIndex = supportQueue.findIndex(r => r.id === currentLiveChatId);
    
    if (chatIndex === -1) return;
    
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    
    // Initialize messages array if needed
    if (!supportQueue[chatIndex].messages) {
        supportQueue[chatIndex].messages = [];
    }
    
    // Add admin message
    const newMessage = {
        from: 'admin',
        message: message,
        timestamp: new Date().toISOString(),
        adminName: adminUser.name
    };
    
    supportQueue[chatIndex].messages.push(newMessage);
    supportQueue[chatIndex].lastMessage = message;
    supportQueue[chatIndex].lastActivity = new Date().toISOString();
    
    localStorage.setItem('live_support_queue', JSON.stringify(supportQueue));
    
    console.log('📤 Admin message sent:', message);
    
    document.getElementById('adminReplyMessage').value = '';
    
    // Refresh chat immediately
    refreshLiveChat(currentLiveChatId);
    
    // Show confirmation
    showNotification('✅ Message sent', 'success');
}

function openLiveChat(requestId) {
    const supportQueue = JSON.parse(localStorage.getItem('live_support_queue') || '[]');
    const chat = supportQueue.find(r => r.id === requestId);
    
    if (!chat) return;
    
    currentLiveChatId = requestId;
    currentChatWith = chat.username;
    
    const modalBody = document.getElementById('sessionModalBody');
    const modal = document.getElementById('sessionModal');
    
    let messagesHtml = '';
    if (chat.messages && chat.messages.length > 0) {
        messagesHtml = chat.messages.map(msg => {
            let bgColor = '#f8f9fa';
            if (msg.from === 'admin') bgColor = '#e3f2fd';
            if (msg.from === 'user') bgColor = '#fff3cd';
            
            return `
                <div style="margin-bottom: 10px; padding: 10px; border-radius: 5px; background: ${bgColor};">
                    <strong>${msg.from === 'system' ? 'System' : (msg.from === 'admin' ? 'You' : chat.username)}:</strong>
                    <div style="margin-top: 5px;">${msg.message}</div>
                    <small style="color: #666;">${new Date(msg.timestamp).toLocaleTimeString()}</small>
                </div>
            `;
        }).join('');
    } else {
        messagesHtml = '<p style="color: #666; text-align: center;">No messages yet</p>';
    }
    
    modalBody.innerHTML = `
        <div style="padding: 20px;">
            <h3 style="margin-bottom: 15px;">Live Chat with ${chat.username}</h3>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p><strong>User:</strong> ${chat.username} (${chat.userType})</p>
                <p><strong>Initial Question:</strong> "${chat.question}"</p>
                <p><strong>Started:</strong> ${new Date(chat.timestamp).toLocaleString()}</p>
            </div>
            
            <div style="height: 300px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 5px; padding: 15px; margin-bottom: 20px; background: white;" id="chatMessages">
                ${messagesHtml}
            </div>
            
            <div style="display: flex; gap: 10px;">
                <input type="text" id="adminReplyMessage" placeholder="Type your response..." style="flex: 1; padding: 12px; border: 2px solid #e0e0e0; border-radius: 5px;">
                <button class="view-btn" onclick="sendLiveChatMessage()" style="background: #28a745; padding: 12px 20px;">
                    <i class="fas fa-paper-plane"></i> Send
                </button>
                <button class="delete-btn" onclick="endLiveChat()" style="background: #dc3545; padding: 12px 20px;">
                    <i class="fas fa-times"></i> End Chat
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    
    // Set up auto-refresh for messages
    if (window.chatRefreshInterval) clearInterval(window.chatRefreshInterval);
    window.chatRefreshInterval = setInterval(() => refreshLiveChat(requestId), 3000);
}

function refreshLiveChat(requestId) {
    if (!requestId || requestId !== currentLiveChatId) {
        if (window.chatRefreshInterval) {
            clearInterval(window.chatRefreshInterval);
        }
        return;
    }
    
    const supportQueue = JSON.parse(localStorage.getItem('live_support_queue') || '[]');
    const chat = supportQueue.find(r => r.id === requestId);
    
    if (!chat) {
        if (window.chatRefreshInterval) {
            clearInterval(window.chatRefreshInterval);
        }
        return;
    }
    
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    let messagesHtml = '';
    if (chat.messages && chat.messages.length > 0) {
        messagesHtml = chat.messages.map(msg => {
            let bgColor = '#f8f9fa';
            if (msg.from === 'admin') bgColor = '#e3f2fd';
            if (msg.from === 'user') bgColor = '#fff3cd';
            
            return `
                <div style="margin-bottom: 10px; padding: 10px; border-radius: 5px; background: ${bgColor};">
                    <strong>${msg.from === 'system' ? 'System' : (msg.from === 'admin' ? 'You' : chat.username)}:</strong>
                    <div style="margin-top: 5px;">${msg.message}</div>
                    <small style="color: #666;">${new Date(msg.timestamp).toLocaleTimeString()}</small>
                </div>
            `;
        }).join('');
    }
    
    messagesContainer.innerHTML = messagesHtml;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function endLiveChat() {
    if (!currentLiveChatId) return;
    
    if (!confirm('End this chat session?')) return;
    
    const supportQueue = JSON.parse(localStorage.getItem('live_support_queue') || '[]');
    const chatIndex = supportQueue.findIndex(r => r.id === currentLiveChatId);
    
    if (chatIndex !== -1) {
        supportQueue[chatIndex].status = 'ended';
        supportQueue[chatIndex].endedAt = new Date().toISOString();
        supportQueue[chatIndex].messages.push({
            from: 'system',
            message: 'Chat ended by support agent',
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('live_support_queue', JSON.stringify(supportQueue));
    }
    
    if (window.chatRefreshInterval) {
        clearInterval(window.chatRefreshInterval);
    }
    
    closeSessionModal();
    currentLiveChatId = null;
    
    showNotification('Chat ended', 'success');
}

function updateLiveSupportStats() {
    const supportQueue = JSON.parse(localStorage.getItem('live_support_queue') || '[]');
    
    const totalLive = document.getElementById('totalLiveRequests');
    const activeLive = document.getElementById('activeLiveChats');
    const waitingLive = document.getElementById('waitingLiveChats');
    
    if (totalLive) totalLive.textContent = supportQueue.length;
    if (activeLive) activeLive.textContent = supportQueue.filter(r => r.status === 'active').length;
    if (waitingLive) waitingLive.textContent = supportQueue.filter(r => r.status === 'waiting').length;
    
    // Auto-refresh if live support tab is active
    const liveTab = document.getElementById('liveTab');
    if (liveTab && liveTab.classList.contains('active')) {
        renderLiveSupportTab();
    }
}