// Messaging system for SkillSwap platform

// Current active conversation
let activeConversationId = null;

// Initialize messaging system
function initMessaging() {
    if (!isAuthenticated) return;
    
    const messagesBtn = document.getElementById('messages-btn');
    const messagesModal = document.getElementById('messages-modal');
    const sendMessageBtn = document.getElementById('send-message-btn');
    const messageInput = document.getElementById('message-input');
    const newMessageBtn = document.getElementById('new-message-btn');
    const conversationSearch = document.getElementById('conversation-search');
    
    // Messages button click
    if (messagesBtn) {
        messagesBtn.addEventListener('click', () => {
            openMessagesModal();
        });
    }
    
    // Send message functionality
    if (sendMessageBtn && messageInput) {
        sendMessageBtn.addEventListener('click', sendMessage);
        
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Auto-resize input
        messageInput.addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
        });
    }
    
    // New message button
    if (newMessageBtn) {
        newMessageBtn.addEventListener('click', () => {
            showNewMessageDialog();
        });
    }
    
    // Conversation search
    if (conversationSearch) {
        conversationSearch.addEventListener('input', debounce((e) => {
            filterConversations(e.target.value);
        }, 300));
    }
    
    // Update message indicators
    updateMessageIndicators();
}

// Open messages modal
function openMessagesModal() {
    if (!requireAuth()) return;
    
    const modal = document.getElementById('messages-modal');
    loadConversations();
    openModal(modal);
}

// Load conversations list
function loadConversations() {
    if (!currentUser) return;
    
    const conversationsList = document.getElementById('conversations-list');
    const userConversations = conversations.filter(conv => 
        conv.participants.includes(currentUser.id)
    );
    
    if (userConversations.length === 0) {
        conversationsList.innerHTML = `
            <div class="no-conversations">
                <div class="no-conversations-icon">
                    <i class="fas fa-comment"></i>
                </div>
                <p>No conversations yet</p>
                <button class="btn btn-primary btn-sm" onclick="showNewMessageDialog()">
                    Start a conversation
                </button>
            </div>
        `;
        return;
    }
    
    // Sort conversations by last message time
    userConversations.sort((a, b) => 
        new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
    );
    
    conversationsList.innerHTML = userConversations.map(conv => 
        createConversationItem(conv)
    ).join('');
    
    // Add click listeners
    conversationsList.addEventListener('click', (e) => {
        const conversationItem = e.target.closest('.conversation-item');
        if (conversationItem) {
            const conversationId = conversationItem.dataset.conversationId;
            selectConversation(conversationId);
        }
    });
}

// Create conversation list item HTML
function createConversationItem(conversation) {
    const otherParticipantId = conversation.participants.find(id => id !== currentUser.id);
    const otherParticipant = users.find(user => user.id === otherParticipantId) || 
                             userDatabase.find(user => user.id === otherParticipantId);
    
    if (!otherParticipant) return '';
    
    const lastMessage = conversation.lastMessage;
    const isUnread = !lastMessage.read && lastMessage.senderId !== currentUser.id;
    const timeAgo = getRelativeTime(lastMessage.timestamp);
    const isActive = activeConversationId === conversation.id;
    
    return `
        <div class="conversation-item ${isActive ? 'active' : ''} ${isUnread ? 'unread' : ''}" 
             data-conversation-id="${conversation.id}">
            <div class="conversation-avatar">
                <img src="${otherParticipant.avatar}" alt="${otherParticipant.name}">
                ${isUnread ? '<div class="unread-indicator"></div>' : ''}
            </div>
            <div class="conversation-info">
                <div class="conversation-header">
                    <h4>${otherParticipant.name}</h4>
                    <span class="conversation-time">${timeAgo}</span>
                </div>
                <p class="conversation-preview">${truncateText(lastMessage.content, 50)}</p>
            </div>
        </div>
    `;
}

// Select and load conversation
function selectConversation(conversationId) {
    activeConversationId = conversationId;
    const conversation = conversations.find(conv => conv.id === conversationId);
    
    if (!conversation) return;
    
    // Update UI
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeItem = document.querySelector(`[data-conversation-id="${conversationId}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
        activeItem.classList.remove('unread');
    }
    
    // Load conversation
    loadConversation(conversation);
    
    // Mark messages as read
    markConversationAsRead(conversationId);
}

// Load conversation messages
function loadConversation(conversation) {
    const chatPlaceholder = document.getElementById('chat-placeholder');
    const chatConversation = document.getElementById('chat-conversation');
    const chatUserName = document.getElementById('chat-user-name');
    const chatUserAvatar = document.getElementById('chat-user-avatar');
    const chatUserStatus = document.getElementById('chat-user-status');
    const chatMessages = document.getElementById('chat-messages');
    
    // Hide placeholder, show conversation
    chatPlaceholder.style.display = 'none';
    chatConversation.style.display = 'flex';
    
    // Get other participant
    const otherParticipantId = conversation.participants.find(id => id !== currentUser.id);
    const otherParticipant = users.find(user => user.id === otherParticipantId) || 
                             userDatabase.find(user => user.id === otherParticipantId);
    
    if (!otherParticipant) return;
    
    // Update chat header
    chatUserName.textContent = otherParticipant.name;
    chatUserAvatar.src = otherParticipant.avatar;
    chatUserAvatar.alt = otherParticipant.name;
    
    // Show online status (mock)
    const isOnline = Math.random() > 0.5; // Random for demo
    chatUserStatus.textContent = isOnline ? 'Online' : 'Last seen recently';
    chatUserStatus.className = `chat-user-status ${isOnline ? 'online' : 'offline'}`;
    
    // Load messages
    loadMessages(conversation.messages);
}

// Load messages in chat area
function loadMessages(messages) {
    const chatMessages = document.getElementById('chat-messages');
    
    chatMessages.innerHTML = messages.map(message => 
        createMessageHTML(message)
    ).join('');
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Create message HTML
function createMessageHTML(message) {
    const isOwn = message.senderId === currentUser.id;
    const sender = isOwn ? currentUser : 
                   users.find(user => user.id === message.senderId) ||
                   userDatabase.find(user => user.id === message.senderId);
    
    const timeFormatted = formatDateTime(message.timestamp);
    
    return `
        <div class="message ${isOwn ? 'own' : 'other'}">
            ${!isOwn ? `<div class="message-avatar">
                <img src="${sender?.avatar || ''}" alt="${sender?.name || 'User'}">
            </div>` : ''}
            <div class="message-content">
                <div class="message-bubble">
                    <p>${escapeHtml(message.content)}</p>
                </div>
                <div class="message-time">${timeFormatted}</div>
            </div>
        </div>
    `;
}

// Send message
function sendMessage() {
    if (!activeConversationId || !currentUser) return;
    
    const messageInput = document.getElementById('message-input');
    const content = messageInput.value.trim();
    
    if (!content) return;
    
    // Create new message
    const newMessage = {
        id: generateId(),
        senderId: currentUser.id,
        content: content,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    // Find conversation and add message
    const conversation = conversations.find(conv => conv.id === activeConversationId);
    if (conversation) {
        conversation.messages.push(newMessage);
        conversation.lastMessage = newMessage;
        
        // Update UI
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.innerHTML += createMessageHTML(newMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Clear input
        messageInput.value = '';
        messageInput.style.height = 'auto';
        
        // Update conversations list
        loadConversations();
        
        // Create notification for other participant
        const otherParticipantId = conversation.participants.find(id => id !== currentUser.id);
        createNotification(
            otherParticipantId,
            'message',
            'New Message',
            `${currentUser.name}: ${truncateText(content, 50)}`,
            { conversationId: conversation.id }
        );
        
        // Update message indicators
        updateMessageIndicators();
    }
}

// Mark conversation as read
function markConversationAsRead(conversationId) {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation && currentUser) {
        conversation.messages.forEach(message => {
            if (message.senderId !== currentUser.id) {
                message.read = true;
            }
        });
        
        // Update last message read status
        if (conversation.lastMessage.senderId !== currentUser.id) {
            conversation.lastMessage.read = true;
        }
        
        updateMessageIndicators();
    }
}

// Show new message dialog
function showNewMessageDialog() {
    // Create a simple prompt for demo
    const userInput = prompt('Enter the user name to start a conversation:');
    if (!userInput) return;
    
    // Find user
    const targetUser = users.find(user => 
        user.name.toLowerCase().includes(userInput.toLowerCase())
    ) || userDatabase.find(user => 
        user.name.toLowerCase().includes(userInput.toLowerCase())
    );
    
    if (!targetUser) {
        showNotification('User not found.', 'error');
        return;
    }
    
    if (targetUser.id === currentUser.id) {
        showNotification('You cannot message yourself.', 'error');
        return;
    }
    
    // Check if conversation already exists
    let existingConversation = conversations.find(conv => 
        conv.participants.includes(currentUser.id) && 
        conv.participants.includes(targetUser.id)
    );
    
    if (!existingConversation) {
        // Create new conversation
        existingConversation = {
            id: generateId(),
            participants: [currentUser.id, targetUser.id],
            messages: [],
            lastMessage: {
                id: 'placeholder',
                senderId: currentUser.id,
                content: 'Conversation started',
                timestamp: new Date().toISOString(),
                read: true
            },
            createdAt: new Date().toISOString()
        };
        
        conversations.push(existingConversation);
    }
    
    // Load conversations and select the new/existing one
    loadConversations();
    selectConversation(existingConversation.id);
    
    showNotification(`Started conversation with ${targetUser.name}`, 'success');
}

// Filter conversations
function filterConversations(searchQuery) {
    const conversationItems = document.querySelectorAll('.conversation-item');
    
    conversationItems.forEach(item => {
        const conversationId = item.dataset.conversationId;
        const conversation = conversations.find(conv => conv.id === conversationId);
        
        if (conversation) {
            const otherParticipantId = conversation.participants.find(id => id !== currentUser.id);
            const otherParticipant = users.find(user => user.id === otherParticipantId) || 
                                     userDatabase.find(user => user.id === otherParticipantId);
            
            const matchesSearch = !searchQuery || 
                (otherParticipant && otherParticipant.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                conversation.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase());
            
            item.style.display = matchesSearch ? 'flex' : 'none';
        }
    });
}

// Update message indicators
function updateMessageIndicators() {
    if (!currentUser) return;
    
    const messagesDot = document.getElementById('messages-dot');
    const unreadCount = getUnreadMessageCount();
    
    if (messagesDot) {
        messagesDot.style.display = unreadCount > 0 ? 'block' : 'none';
    }
}

// Get unread message count
function getUnreadMessageCount() {
    if (!currentUser) return 0;
    
    let unreadCount = 0;
    
    conversations.forEach(conversation => {
        if (conversation.participants.includes(currentUser.id)) {
            conversation.messages.forEach(message => {
                if (!message.read && message.senderId !== currentUser.id) {
                    unreadCount++;
                }
            });
        }
    });
    
    return unreadCount;
}

// Start conversation from exchange
function startConversationFromExchange(exchangeId, partnerId) {
    if (!requireAuth()) return;
    
    const partner = users.find(user => user.id === partnerId) ||
                    userDatabase.find(user => user.id === partnerId);
    
    if (!partner) return;
    
    // Check if conversation already exists
    let existingConversation = conversations.find(conv => 
        conv.participants.includes(currentUser.id) && 
        conv.participants.includes(partnerId)
    );
    
    if (!existingConversation) {
        // Create new conversation
        existingConversation = {
            id: generateId(),
            participants: [currentUser.id, partnerId],
            messages: [],
            lastMessage: {
                id: 'placeholder',
                senderId: currentUser.id,
                content: 'Conversation started',
                timestamp: new Date().toISOString(),
                read: true
            },
            exchangeId: exchangeId,
            createdAt: new Date().toISOString()
        };
        
        conversations.push(existingConversation);
    }
    
    // Open messages modal and select conversation
    openMessagesModal();
    setTimeout(() => {
        selectConversation(existingConversation.id);
    }, 100);
}

// Escape HTML for security
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Auto-refresh messages periodically
setInterval(() => {
    if (isAuthenticated && activeConversationId) {
        // In a real app, this would fetch new messages from server
        updateMessageIndicators();
    }
}, 30000); // Check every 30 seconds