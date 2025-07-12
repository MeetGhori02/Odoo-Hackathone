// Admin-specific functionality for the SkillSwap platform

// Initialize admin panel
function initAdminPage() {
    // Check if user is admin
    if (!isAuthenticated || !isAdmin(currentUser)) {
        showNotification('Access denied. Admin privileges required.', 'error');
        showPage('home');
        return;
    }
    
    // Update admin statistics
    updateAdminStats();
    
    // Initialize admin tabs
    initAdminTabs();
    
    // Load initial tab content
    loadAdminUsersTab();
}

// Update admin statistics
function updateAdminStats() {
    const totalUsersEl = document.getElementById('admin-total-users');
    const totalSwapsEl = document.getElementById('admin-total-swaps');
    const pendingReportsEl = document.getElementById('admin-pending-reports');
    const bannedUsersEl = document.getElementById('admin-banned-users');
    
    if (totalUsersEl) totalUsersEl.textContent = platformStats.totalUsers;
    if (totalSwapsEl) totalSwapsEl.textContent = platformStats.totalExchanges;
    if (pendingReportsEl) pendingReportsEl.textContent = userReports.filter(r => r.status === 'pending').length;
    if (bannedUsersEl) bannedUsersEl.textContent = platformStats.bannedUsers;
}

// Initialize admin tabs
function initAdminTabs() {
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active tab
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Hide all tab contents
            document.querySelectorAll('.admin-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show selected tab content
            const tabId = btn.dataset.tab;
            const tabContent = document.getElementById(`admin-${tabId}-tab`);
            if (tabContent) {
                tabContent.classList.add('active');
                
                // Load tab-specific content
                switch (tabId) {
                    case 'users':
                        loadAdminUsersTab();
                        break;
                    case 'swaps':
                        loadAdminSwapsTab();
                        break;
                    case 'skills':
                        loadAdminSkillsTab();
                        break;
                    case 'messages':
                        loadAdminMessagesTab();
                        break;
                    case 'reports':
                        loadAdminReportsTab();
                        break;
                }
            }
        });
    });
}

// Load admin users tab
function loadAdminUsersTab() {
    const usersList = document.getElementById('admin-users-list');
    const userSearch = document.getElementById('user-search');
    const userStatusFilter = document.getElementById('user-status-filter');
    const exportUsersBtn = document.getElementById('export-users-btn');
    
    function updateUsersList() {
        const searchQuery = userSearch?.value.toLowerCase() || '';
        const statusFilter = userStatusFilter?.value || '';
        
        let filteredUsers = users.filter(user => {
            const matchesSearch = !searchQuery || 
                user.name.toLowerCase().includes(searchQuery) ||
                user.email.toLowerCase().includes(searchQuery);
            
            const matchesStatus = !statusFilter || user.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
        
        usersList.innerHTML = filteredUsers.map(createAdminUserCard).join('');
        
        // Add event listeners
        addAdminUserListeners(usersList);
    }
    
    // Search and filter functionality
    if (userSearch) {
        userSearch.addEventListener('input', debounce(updateUsersList, 300));
    }
    
    if (userStatusFilter) {
        userStatusFilter.addEventListener('change', updateUsersList);
    }
    
    // Export functionality
    if (exportUsersBtn) {
        exportUsersBtn.addEventListener('click', () => {
            const exportData = users.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                status: user.status,
                joinedDate: user.joinedDate,
                exchangesCompleted: user.exchangesCompleted,
                rating: user.rating,
                lastActive: user.lastActive
            }));
            
            exportToCSV(exportData, `users_export_${formatDateShort(new Date().toISOString())}.csv`);
            showNotification('Users data exported successfully!', 'success');
        });
    }
    
    // Initial load
    updateUsersList();
}

// Add admin user event listeners
function addAdminUserListeners(container) {
    container.addEventListener('click', (e) => {
        const viewBtn = e.target.closest('.view-user-btn');
        const banBtn = e.target.closest('.ban-user-btn');
        const unbanBtn = e.target.closest('.unban-user-btn');
        
        if (viewBtn) {
            const userId = viewBtn.dataset.userId;
            const user = users.find(u => u.id === userId);
            if (user) {
                showUserModal(user);
            }
        }
        
        if (banBtn) {
            const userId = banBtn.dataset.userId;
            showBanUserModal(userId);
        }
        
        if (unbanBtn) {
            const userId = unbanBtn.dataset.userId;
            unbanUser(userId);
        }
    });
}

// Load admin swaps tab
function loadAdminSwapsTab() {
    const swapsList = document.getElementById('admin-swaps-list');
    const swapStatusFilter = document.getElementById('swap-status-filter');
    const swapDateFrom = document.getElementById('swap-date-from');
    const swapDateTo = document.getElementById('swap-date-to');
    const exportSwapsBtn = document.getElementById('export-swaps-btn');
    
    function updateSwapsList() {
        const statusFilter = swapStatusFilter?.value || '';
        const dateFrom = swapDateFrom?.value || '';
        const dateTo = swapDateTo?.value || '';
        
        let filteredSwaps = exchanges.filter(exchange => {
            const matchesStatus = !statusFilter || exchange.status === statusFilter;
            
            const exchangeDate = new Date(exchange.createdAt);
            const matchesDateFrom = !dateFrom || exchangeDate >= new Date(dateFrom);
            const matchesDateTo = !dateTo || exchangeDate <= new Date(dateTo);
            
            return matchesStatus && matchesDateFrom && matchesDateTo;
        });
        
        swapsList.innerHTML = filteredSwaps.map(createAdminSwapCard).join('');
        
        // Add event listeners
        addAdminSwapListeners(swapsList);
    }
    
    // Filter functionality
    if (swapStatusFilter) {
        swapStatusFilter.addEventListener('change', updateSwapsList);
    }
    
    if (swapDateFrom) {
        swapDateFrom.addEventListener('change', updateSwapsList);
    }
    
    if (swapDateTo) {
        swapDateTo.addEventListener('change', updateSwapsList);
    }
    
    // Export functionality
    if (exportSwapsBtn) {
        exportSwapsBtn.addEventListener('click', () => {
            const exportData = exchanges.map(exchange => ({
                id: exchange.id,
                requesterName: exchange.requester.name,
                providerName: exchange.provider.name,
                skillOffered: exchange.skillOffered.name,
                skillWanted: exchange.skillWanted.name,
                status: exchange.status,
                createdAt: exchange.createdAt,
                completedAt: exchange.completedAt || ''
            }));
            
            exportToCSV(exportData, `swaps_export_${formatDateShort(new Date().toISOString())}.csv`);
            showNotification('Swaps data exported successfully!', 'success');
        });
    }
    
    // Initial load
    updateSwapsList();
}

// Add admin swap event listeners
function addAdminSwapListeners(container) {
    container.addEventListener('click', (e) => {
        const viewBtn = e.target.closest('.view-exchange-btn');
        
        if (viewBtn) {
            const exchangeId = viewBtn.dataset.exchangeId;
            const exchange = exchanges.find(ex => ex.id === exchangeId);
            if (exchange) {
                showExchangeDetailsModal(exchange);
            }
        }
    });
}

// Load admin skills tab
function loadAdminSkillsTab() {
    const skillsList = document.getElementById('admin-skills-list');
    const skillSearch = document.getElementById('skill-search');
    const skillStatusFilter = document.getElementById('skill-status-filter');
    const exportSkillsBtn = document.getElementById('export-skills-btn');
    
    function updateSkillsList() {
        const searchQuery = skillSearch?.value.toLowerCase() || '';
        const statusFilter = skillStatusFilter?.value || '';
        
        let filteredSkills = skills.filter(skill => {
            const matchesSearch = !searchQuery || 
                skill.name.toLowerCase().includes(searchQuery) ||
                skill.description.toLowerCase().includes(searchQuery);
            
            const matchesStatus = !statusFilter || skill.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
        
        skillsList.innerHTML = filteredSkills.map(createAdminSkillCard).join('');
        
        // Add event listeners
        addAdminSkillListeners(skillsList);
    }
    
    // Search and filter functionality
    if (skillSearch) {
        skillSearch.addEventListener('input', debounce(updateSkillsList, 300));
    }
    
    if (skillStatusFilter) {
        skillStatusFilter.addEventListener('change', updateSkillsList);
    }
    
    // Export functionality
    if (exportSkillsBtn) {
        exportSkillsBtn.addEventListener('click', () => {
            const exportData = skills.map(skill => ({
                id: skill.id,
                name: skill.name,
                category: skill.category,
                level: skill.level,
                description: skill.description,
                status: skill.status,
                createdAt: skill.createdAt
            }));
            
            exportToCSV(exportData, `skills_export_${formatDateShort(new Date().toISOString())}.csv`);
            showNotification('Skills data exported successfully!', 'success');
        });
    }
    
    // Initial load
    updateSkillsList();
}

// Add admin skill event listeners
function addAdminSkillListeners(container) {
    container.addEventListener('click', (e) => {
        const approveBtn = e.target.closest('.approve-skill-btn');
        const rejectBtn = e.target.closest('.reject-skill-btn');
        
        if (approveBtn) {
            const skillId = approveBtn.dataset.skillId;
            approveSkill(skillId);
        }
        
        if (rejectBtn) {
            const skillId = rejectBtn.dataset.skillId;
            rejectSkill(skillId);
        }
    });
}

// Load admin messages tab
function loadAdminMessagesTab() {
    const messagesList = document.getElementById('admin-messages-list');
    const createMessageBtn = document.getElementById('create-message-btn');
    
    function updateMessagesList() {
        messagesList.innerHTML = platformMessages.map(createAdminMessageCard).join('');
        
        // Add event listeners
        addAdminMessageListeners(messagesList);
    }
    
    // Create message functionality
    if (createMessageBtn) {
        createMessageBtn.addEventListener('click', () => {
            showPlatformMessageModal();
        });
    }
    
    // Initial load
    updateMessagesList();
}

// Add admin message event listeners
function addAdminMessageListeners(container) {
    container.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-message-btn');
        const deleteBtn = e.target.closest('.delete-message-btn');
        
        if (editBtn) {
            const messageId = editBtn.dataset.messageId;
            const message = platformMessages.find(m => m.id === messageId);
            if (message) {
                showPlatformMessageModal(message);
            }
        }
        
        if (deleteBtn) {
            const messageId = deleteBtn.dataset.messageId;
            deletePlatformMessage(messageId);
        }
    });
}

// Load admin reports tab
function loadAdminReportsTab() {
    const reportsContainer = document.getElementById('admin-reports-tab');
    
    // Add download report listeners
    const downloadUserActivity = document.getElementById('download-user-activity');
    const downloadSwapStats = document.getElementById('download-swap-stats');
    const downloadFeedbackAnalysis = document.getElementById('download-feedback-analysis');
    const downloadPlatformHealth = document.getElementById('download-platform-health');
    
    if (downloadUserActivity) {
        downloadUserActivity.addEventListener('click', () => {
            generateUserActivityReport();
        });
    }
    
    if (downloadSwapStats) {
        downloadSwapStats.addEventListener('click', () => {
            generateSwapStatsReport();
        });
    }
    
    if (downloadFeedbackAnalysis) {
        downloadFeedbackAnalysis.addEventListener('click', () => {
            generateFeedbackAnalysisReport();
        });
    }
    
    if (downloadPlatformHealth) {
        downloadPlatformHealth.addEventListener('click', () => {
            generatePlatformHealthReport();
        });
    }
}

// Show ban user modal
function showBanUserModal(userId) {
    const modal = document.getElementById('ban-user-modal');
    const confirmBanBtn = document.getElementById('confirm-ban');
    
    confirmBanBtn.onclick = () => {
        const reason = document.getElementById('ban-reason').value;
        const details = document.getElementById('ban-details').value;
        const duration = document.getElementById('ban-duration').value;
        
        if (!reason) {
            showNotification('Please select a reason for the ban.', 'error');
            return;
        }
        
        banUser(userId, reason, details, duration);
        closeModal(modal);
        
        // Clear form
        document.getElementById('ban-reason').value = '';
        document.getElementById('ban-details').value = '';
        document.getElementById('ban-duration').value = '7';
    };
    
    openModal(modal);
}

// Ban user function
function banUser(userId, reason, details, duration) {
    const user = users.find(u => u.id === userId);
    if (user) {
        user.status = 'banned';
        user.banReason = reason;
        user.banDetails = details;
        user.banDuration = duration;
        user.banDate = new Date().toISOString();
        
        // Log the action
        activityLogs.push({
            id: generateId(),
            userId: 'admin',
            action: 'user_banned',
            details: `Banned user ${user.name} for ${reason}`,
            timestamp: new Date().toISOString()
        });
        
        updateAdminStats();
        loadAdminUsersTab();
        showNotification(`User ${user.name} has been banned.`, 'success');
    }
}

// Unban user function
function unbanUser(userId) {
    if (confirm('Are you sure you want to unban this user?')) {
        const user = users.find(u => u.id === userId);
        if (user) {
            user.status = 'active';
            delete user.banReason;
            delete user.banDetails;
            delete user.banDuration;
            delete user.banDate;
            
            // Log the action
            activityLogs.push({
                id: generateId(),
                userId: 'admin',
                action: 'user_unbanned',
                details: `Unbanned user ${user.name}`,
                timestamp: new Date().toISOString()
            });
            
            updateAdminStats();
            loadAdminUsersTab();
            showNotification(`User ${user.name} has been unbanned.`, 'success');
        }
    }
}

// Approve skill function
function approveSkill(skillId) {
    const skill = skills.find(s => s.id === skillId);
    if (skill) {
        skill.status = 'approved';
        
        // Find user who owns this skill and send notification
        const skillOwner = users.find(user => 
            user.skillsOffered.some(s => s.id === skillId) || 
            user.skillsWanted.some(s => s.id === skillId)
        );
        
        if (skillOwner) {
            sendSkillApprovedNotification(skillOwner.id, skill.name);
        }
        
        // Log the action
        activityLogs.push({
            id: generateId(),
            userId: 'admin',
            action: 'skill_approved',
            details: `Approved skill: ${skill.name}`,
            timestamp: new Date().toISOString()
        });
        
        loadAdminSkillsTab();
        showNotification(`Skill "${skill.name}" has been approved.`, 'success');
    }
}

// Reject skill function
function rejectSkill(skillId) {
    const skill = skills.find(s => s.id === skillId);
    if (skill) {
        skill.status = 'rejected';
        
        // Find user who owns this skill and send notification
        const skillOwner = users.find(user => 
            user.skillsOffered.some(s => s.id === skillId) || 
            user.skillsWanted.some(s => s.id === skillId)
        );
        
        if (skillOwner) {
            sendSkillRejectedNotification(skillOwner.id, skill.name, 'Inappropriate or spam content detected');
        }
        
        // Log the action
        activityLogs.push({
            id: generateId(),
            userId: 'admin',
            action: 'skill_rejected',
            details: `Rejected skill: ${skill.name}`,
            timestamp: new Date().toISOString()
        });
        
        loadAdminSkillsTab();
        showNotification(`Skill "${skill.name}" has been rejected.`, 'success');
    }
}

// Show platform message modal
function showPlatformMessageModal(message = null) {
    const modal = document.getElementById('platform-message-modal');
    const sendBtn = document.getElementById('send-platform-message');
    
    // Pre-fill form if editing
    if (message) {
        document.getElementById('message-type').value = message.type;
        document.getElementById('message-title').value = message.title;
        document.getElementById('message-content').value = message.content;
        document.getElementById('message-duration').value = message.duration || '7';
    }
    
    sendBtn.onclick = () => {
        const type = document.getElementById('message-type').value;
        const title = document.getElementById('message-title').value;
        const content = document.getElementById('message-content').value;
        const duration = document.getElementById('message-duration').value;
        
        if (!validateRequired(title) || !validateRequired(content)) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }
        
        if (message) {
            // Update existing message
            message.type = type;
            message.title = title;
            message.content = content;
            message.duration = duration;
        } else {
            // Create new message
            const newMessage = {
                id: generateId(),
                type,
                title,
                content,
                duration,
                createdAt: new Date().toISOString(),
                expiresAt: duration === 'permanent' ? null : 
                    new Date(Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000).toISOString(),
                isActive: true,
                createdBy: 'admin'
            };
            
            platformMessages.push(newMessage);
            
            // Show message immediately
            showPlatformMessage(newMessage);
        }
        
        closeModal(modal);
        loadAdminMessagesTab();
        showNotification('Platform message saved successfully!', 'success');
        
        // Clear form
        document.getElementById('message-type').value = 'info';
        document.getElementById('message-title').value = '';
        document.getElementById('message-content').value = '';
        document.getElementById('message-duration').value = '7';
    };
    
    openModal(modal);
}

// Delete platform message
function deletePlatformMessage(messageId) {
    if (confirm('Are you sure you want to delete this message?')) {
        const messageIndex = platformMessages.findIndex(m => m.id === messageId);
        if (messageIndex !== -1) {
            platformMessages.splice(messageIndex, 1);
            loadAdminMessagesTab();
            showNotification('Platform message deleted successfully!', 'success');
        }
    }
}

// Generate user activity report
function generateUserActivityReport() {
    const reportData = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
        joinedDate: user.joinedDate,
        lastActive: user.lastActive,
        exchangesCompleted: user.exchangesCompleted,
        rating: user.rating,
        skillsOffered: user.skillsOffered.length,
        skillsWanted: user.skillsWanted.length,
        isPublic: user.isPublic
    }));
    
    exportToCSV(reportData, `user_activity_report_${formatDateShort(new Date().toISOString())}.csv`);
    showNotification('User activity report downloaded successfully!', 'success');
}

// Generate swap statistics report
function generateSwapStatsReport() {
    const reportData = exchanges.map(exchange => ({
        id: exchange.id,
        requesterName: exchange.requester.name,
        providerName: exchange.provider.name,
        skillOffered: exchange.skillOffered.name,
        skillWanted: exchange.skillWanted.name,
        status: exchange.status,
        createdAt: exchange.createdAt,
        acceptedAt: exchange.acceptedAt || '',
        completedAt: exchange.completedAt || '',
        duration: exchange.completedAt ? 
            Math.ceil((new Date(exchange.completedAt) - new Date(exchange.createdAt)) / (1000 * 60 * 60 * 24)) : ''
    }));
    
    exportToCSV(reportData, `swap_statistics_report_${formatDateShort(new Date().toISOString())}.csv`);
    showNotification('Swap statistics report downloaded successfully!', 'success');
}

// Generate feedback analysis report
function generateFeedbackAnalysisReport() {
    const allReviews = [];
    
    users.forEach(user => {
        if (user.reviews) {
            user.reviews.forEach(review => {
                allReviews.push({
                    reviewId: review.id,
                    reviewerName: review.reviewerName,
                    reviewedUserName: user.name,
                    rating: review.rating,
                    comment: review.comment,
                    exchangeId: review.exchangeId,
                    createdAt: review.createdAt
                });
            });
        }
    });
    
    exportToCSV(allReviews, `feedback_analysis_report_${formatDateShort(new Date().toISOString())}.csv`);
    showNotification('Feedback analysis report downloaded successfully!', 'success');
}

// Generate platform health report
function generatePlatformHealthReport() {
    const healthData = [{
        totalUsers: platformStats.totalUsers,
        activeUsers: platformStats.activeUsers,
        bannedUsers: platformStats.bannedUsers,
        totalExchanges: platformStats.totalExchanges,
        completedExchanges: platformStats.completedExchanges,
        pendingExchanges: platformStats.pendingExchanges,
        totalSkills: platformStats.totalSkills,
        approvedSkills: platformStats.approvedSkills,
        pendingSkills: platformStats.pendingSkills,
        rejectedSkills: platformStats.rejectedSkills,
        averageRating: platformStats.averageRating,
        successRate: platformStats.successRate,
        reportGeneratedAt: new Date().toISOString()
    }];
    
    exportToJSON(healthData, `platform_health_report_${formatDateShort(new Date().toISOString())}.json`);
    showNotification('Platform health report downloaded successfully!', 'success');
}

// Show exchange details modal (for admin)
function showExchangeDetailsModal(exchange) {
    // Create a simple modal for exchange details
    const modalContent = `
        <div class="modal active" id="exchange-details-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Exchange Details</h2>
                    <button class="modal-close" onclick="closeModal(document.getElementById('exchange-details-modal'))">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="exchange-details-admin">
                        <p><strong>Exchange ID:</strong> ${exchange.id}</p>
                        <p><strong>Requester:</strong> ${exchange.requester.name} (${exchange.requester.email})</p>
                        <p><strong>Provider:</strong> ${exchange.provider.name} (${exchange.provider.email})</p>
                        <p><strong>Skill Offered:</strong> ${exchange.skillOffered.name}</p>
                        <p><strong>Skill Wanted:</strong> ${exchange.skillWanted.name}</p>
                        <p><strong>Status:</strong> ${getStatusText(exchange.status)}</p>
                        <p><strong>Created:</strong> ${formatDateTime(exchange.createdAt)}</p>
                        ${exchange.acceptedAt ? `<p><strong>Accepted:</strong> ${formatDateTime(exchange.acceptedAt)}</p>` : ''}
                        ${exchange.completedAt ? `<p><strong>Completed:</strong> ${formatDateTime(exchange.completedAt)}</p>` : ''}
                        ${exchange.message ? `<p><strong>Message:</strong> "${exchange.message}"</p>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body temporarily
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = modalContent;
    document.body.appendChild(tempDiv);
    
    // Remove modal when closed
    const modal = document.getElementById('exchange-details-modal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.closest('.modal-close')) {
            document.body.removeChild(tempDiv);
        }
    });
}