// Notifications system for SkillSwap platform

// Initialize notifications system
function initNotifications() {
    if (!isAuthenticated) return;
    
    const notificationsBtn = document.getElementById('notifications-btn');
    const notificationsModal = document.getElementById('notifications-modal');
    const markAllReadBtn = document.getElementById('mark-all-read');
    
    // Notifications button click
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', () => {
            openNotificationsModal();
        });
    }
    
    // Mark all as read button
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', () => {
            markAllNotificationsAsRead();
        });
    }
    
    // Update notification indicators
    updateNotificationIndicators();
    
    // Auto-update notifications
    setInterval(() => {
        updateNotificationIndicators();
    }, 30000); // Check every 30 seconds
}

// Open notifications modal
function openNotificationsModal() {
    if (!requireAuth()) return;
    
    const modal = document.getElementById('notifications-modal');
    loadNotifications();
    openModal(modal);
}

// Load notifications list
function loadNotifications() {
    if (!currentUser) return;
    
    const notificationsList = document.getElementById('notifications-list');
    const noNotifications = document.getElementById('no-notifications');
    
    // Get user's notifications
    const userNotifications = notifications.filter(notif => 
        notif.userId === currentUser.id
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (userNotifications.length === 0) {
        notificationsList.style.display = 'none';
        noNotifications.style.display = 'block';
        return;
    }
    
    notificationsList.style.display = 'block';
    noNotifications.style.display = 'none';
    
    notificationsList.innerHTML = userNotifications.map(notification => 
        createNotificationHTML(notification)
    ).join('');
    
    // Add click listeners
    notificationsList.addEventListener('click', (e) => {
        const notificationItem = e.target.closest('.notification-item');
        if (notificationItem) {
            const notificationId = notificationItem.dataset.notificationId;
            handleNotificationClick(notificationId);
        }
    });
}

// Create notification HTML
function createNotificationHTML(notification) {
    const typeIcons = {
        'exchange_request': 'fas fa-handshake',
        'exchange_accepted': 'fas fa-check-circle',
        'exchange_completed': 'fas fa-trophy',
        'review_received': 'fas fa-star',
        'message': 'fas fa-comment',
        'system': 'fas fa-info-circle',
        'skill_approved': 'fas fa-check',
        'skill_rejected': 'fas fa-times',
        'welcome': 'fas fa-wave-hand'
    };
    
    const typeColors = {
        'exchange_request': '#2563eb',
        'exchange_accepted': '#059669',
        'exchange_completed': '#7c3aed',
        'review_received': '#d97706',
        'message': '#2563eb',
        'system': '#6b7280',
        'skill_approved': '#059669',
        'skill_rejected': '#dc2626',
        'welcome': '#2563eb'
    };
    
    const icon = typeIcons[notification.type] || 'fas fa-bell';
    const color = typeColors[notification.type] || '#6b7280';
    const timeAgo = getRelativeTime(notification.createdAt);
    const readClass = notification.isRead ? 'read' : 'unread';
    
    return `
        <div class="notification-item ${readClass}" data-notification-id="${notification.id}">
            <div class="notification-icon" style="color: ${color};">
                <i class="${icon}"></i>
            </div>
            <div class="notification-content">
                <h5>${notification.title}</h5>
                <p>${notification.message}</p>
                <span class="notification-time">${timeAgo}</span>
            </div>
            ${!notification.isRead ? '<div class="notification-unread-dot"></div>' : ''}
        </div>
    `;
}

// Handle notification click
function handleNotificationClick(notificationId) {
    const notification = notifications.find(notif => notif.id === notificationId);
    if (!notification) return;
    
    // Mark as read
    notification.isRead = true;
    
    // Handle different notification types
    switch (notification.type) {
        case 'exchange_request':
            closeModal(document.getElementById('notifications-modal'));
            showPage('exchanges');
            break;
            
        case 'exchange_accepted':
        case 'exchange_completed':
            closeModal(document.getElementById('notifications-modal'));
            showPage('exchanges');
            break;
            
        case 'message':
            closeModal(document.getElementById('notifications-modal'));
            if (notification.conversationId) {
                openMessagesModal();
                setTimeout(() => {
                    selectConversation(notification.conversationId);
                }, 100);
            } else {
                openMessagesModal();
            }
            break;
            
        case 'review_received':
            closeModal(document.getElementById('notifications-modal'));
            showPage('profile');
            break;
            
        case 'skill_approved':
        case 'skill_rejected':
            closeModal(document.getElementById('notifications-modal'));
            showPage('profile');
            break;
            
        case 'system':
        case 'welcome':
            // Just mark as read, no action needed
            break;
    }
    
    // Update indicators
    updateNotificationIndicators();
    
    // Refresh notifications list
    loadNotifications();
}

// Mark all notifications as read
function markAllNotificationsAsRead() {
    if (!currentUser) return;
    
    notifications.forEach(notification => {
        if (notification.userId === currentUser.id) {
            notification.isRead = true;
        }
    });
    
    updateNotificationIndicators();
    loadNotifications();
    
    showNotification('All notifications marked as read', 'success');
}

// Update notification indicators
function updateNotificationIndicators() {
    if (!currentUser) return;
    
    const notificationsDot = document.getElementById('notifications-dot');
    const unreadCount = getUnreadNotificationCount();
    
    if (notificationsDot) {
        notificationsDot.style.display = unreadCount > 0 ? 'block' : 'none';
    }
}

// Get unread notification count
function getUnreadNotificationCount() {
    if (!currentUser) return 0;
    
    return notifications.filter(notification => 
        notification.userId === currentUser.id && !notification.isRead
    ).length;
}

// Create notification
function createNotification(userId, type, title, message, data = {}) {
    const notification = {
        id: generateId(),
        userId: userId,
        type: type,
        title: title,
        message: message,
        isRead: false,
        createdAt: new Date().toISOString(),
        ...data
    };
    
    notifications.push(notification);
    
    // Update indicators if it's for current user
    if (userId === currentUser?.id) {
        updateNotificationIndicators();
        
        // Show toast notification for important types
        if (['exchange_request', 'message', 'exchange_accepted'].includes(type)) {
            showNotification(message, 'info');
        }
    }
    
    return notification;
}

// Send welcome notification to new users
function sendWelcomeNotification(userId) {
    createNotification(
        userId,
        'welcome',
        'Welcome to SkillSwap!',
        'Complete your profile and start exchanging skills with professionals worldwide.',
        { priority: 'high' }
    );
}

// Send exchange request notification
function sendExchangeRequestNotification(providerId, requesterName, skillOffered, skillWanted) {
    createNotification(
        providerId,
        'exchange_request',
        'New Exchange Request',
        `${requesterName} wants to exchange ${skillOffered} for ${skillWanted}`,
        { priority: 'high' }
    );
}

// Send exchange accepted notification
function sendExchangeAcceptedNotification(requesterId, providerName) {
    createNotification(
        requesterId,
        'exchange_accepted',
        'Exchange Request Accepted!',
        `${providerName} has accepted your exchange request. You can now start your skill exchange!`,
        { priority: 'high' }
    );
}

// Send exchange completed notification
function sendExchangeCompletedNotification(userId, partnerName) {
    createNotification(
        userId,
        'exchange_completed',
        'Exchange Completed!',
        `Your skill exchange with ${partnerName} has been completed. Don't forget to leave a review!`,
        { priority: 'medium' }
    );
}

// Send review received notification
function sendReviewReceivedNotification(userId, reviewerName, rating) {
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    createNotification(
        userId,
        'review_received',
        'New Review Received',
        `${reviewerName} left you a ${rating}-star review ${stars}`,
        { priority: 'medium' }
    );
}

// Send skill approved notification
function sendSkillApprovedNotification(userId, skillName) {
    createNotification(
        userId,
        'skill_approved',
        'Skill Approved!',
        `Your skill "${skillName}" has been approved and is now visible to other users.`,
        { priority: 'medium' }
    );
}

// Send skill rejected notification
function sendSkillRejectedNotification(userId, skillName, reason = '') {
    const message = reason ? 
        `Your skill "${skillName}" was not approved. Reason: ${reason}` :
        `Your skill "${skillName}" was not approved. Please review our community guidelines.`;
    
    createNotification(
        userId,
        'skill_rejected',
        'Skill Not Approved',
        message,
        { priority: 'medium' }
    );
}

// Send system notification
function sendSystemNotification(userId, title, message) {
    createNotification(
        userId,
        'system',
        title,
        message,
        { priority: 'low' }
    );
}

// Send notification to all users
function sendBroadcastNotification(type, title, message) {
    const activeUsers = users.filter(user => user.status === 'active');
    
    activeUsers.forEach(user => {
        createNotification(user.id, type, title, message);
    });
    
    // Also add to admin if exists
    if (userDatabase.find(u => u.role === 'admin')) {
        const adminUser = userDatabase.find(u => u.role === 'admin');
        createNotification(adminUser.id, type, title, message);
    }
}

// Clean up old notifications (keep last 50 per user)
function cleanupNotifications() {
    const userNotificationMap = new Map();
    
    // Group notifications by user
    notifications.forEach(notification => {
        if (!userNotificationMap.has(notification.userId)) {
            userNotificationMap.set(notification.userId, []);
        }
        userNotificationMap.get(notification.userId).push(notification);
    });
    
    // Keep only last 50 notifications per user
    const cleanedNotifications = [];
    
    userNotificationMap.forEach((userNotifications, userId) => {
        userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        cleanedNotifications.push(...userNotifications.slice(0, 50));
    });
    
    // Update global notifications array
    notifications.splice(0, notifications.length, ...cleanedNotifications);
}

// Cleanup old notifications periodically
setInterval(() => {
    cleanupNotifications();
}, 60000); // Every minute