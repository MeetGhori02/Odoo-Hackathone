// Enhanced utility functions for the SkillSwap platform

// Format date to readable string
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format date to short string
function formatDateShort(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Format date and time
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get relative time (e.g., "2 hours ago")
function getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

// Truncate text to specified length
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Generate unique ID
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Filter users based on search criteria
function filterUsers(users, searchQuery, categoryFilter, levelFilter, availabilityFilter) {
    return users.filter(user => {
        // Only show public profiles and active users
        if (!user.isPublic || user.status !== 'active') return false;
        
        // Search filter
        const matchesSearch = !searchQuery || 
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.skillsOffered.some(skill => 
                skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                skill.description.toLowerCase().includes(searchQuery.toLowerCase())
            );

        // Category filter
        const matchesCategory = !categoryFilter ||
            user.skillsOffered.some(skill => skill.category === categoryFilter);

        // Level filter
        const matchesLevel = !levelFilter ||
            user.skillsOffered.some(skill => skill.level === levelFilter);

        // Availability filter
        const matchesAvailability = !availabilityFilter ||
            user.availability.includes(availabilityFilter);

        return matchesSearch && matchesCategory && matchesLevel && matchesAvailability;
    });
}

// Filter exchanges based on status
function filterExchanges(exchanges, status) {
    if (!currentUser) return [];
    
    // Filter exchanges where current user is involved
    const userExchanges = exchanges.filter(exchange => 
        exchange.requester.id === currentUser.id || exchange.provider.id === currentUser.id
    );
    
    if (status === 'pending') {
        return userExchanges.filter(exchange => exchange.status === 'pending');
    }
    if (status === 'active') {
        return userExchanges.filter(exchange => 
            ['accepted', 'in-progress'].includes(exchange.status)
        );
    }
    if (status === 'completed') {
        return userExchanges.filter(exchange => 
            ['completed', 'cancelled'].includes(exchange.status)
        );
    }
    return userExchanges; // 'all'
}

// Get status icon class
function getStatusIcon(status) {
    switch (status) {
        case 'pending':
            return 'fas fa-clock';
        case 'accepted':
        case 'in-progress':
            return 'fas fa-handshake';
        case 'completed':
            return 'fas fa-check-circle';
        case 'cancelled':
            return 'fas fa-times-circle';
        default:
            return 'fas fa-clock';
    }
}

// Get status text
function getStatusText(status) {
    switch (status) {
        case 'pending':
            return 'Pending';
        case 'accepted':
            return 'Accepted';
        case 'in-progress':
            return 'In Progress';
        case 'completed':
            return 'Completed';
        case 'cancelled':
            return 'Cancelled';
        default:
            return status;
    }
}

// Enhanced notification system
function showNotification(message, type = 'info', duration = 5000) {
    const toast = document.getElementById('notification-toast');
    const icon = toast.querySelector('.toast-icon');
    const messageEl = toast.querySelector('.toast-message');
    
    // Set message
    messageEl.textContent = message;
    
    // Set type and icon
    toast.className = `notification-toast show ${type}`;
    
    switch (type) {
        case 'success':
            icon.className = 'toast-icon success fas fa-check-circle';
            break;
        case 'error':
            icon.className = 'toast-icon error fas fa-exclamation-circle';
            break;
        case 'warning':
            icon.className = 'toast-icon warning fas fa-exclamation-triangle';
            break;
        default:
            icon.className = 'toast-icon info fas fa-info-circle';
    }
    
    // Auto hide
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
    
    // Close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.onclick = () => {
        toast.classList.remove('show');
    };
}

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate required fields
function validateRequired(value) {
    return value && value.trim().length > 0;
}

// Validate skill description for spam/inappropriate content
function validateSkillDescription(description) {
    const spamKeywords = ['spam', 'click here', 'buy now', 'free money', 'get rich quick'];
    const inappropriateKeywords = ['inappropriate', 'offensive', 'hate'];
    
    const lowerDesc = description.toLowerCase();
    
    const hasSpam = spamKeywords.some(keyword => lowerDesc.includes(keyword));
    const hasInappropriate = inappropriateKeywords.some(keyword => lowerDesc.includes(keyword));
    
    return !hasSpam && !hasInappropriate;
}

// Check if user is admin
function isAdmin(user = currentUser) {
    return user && user.role === 'admin';
}

// Local storage helpers
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

function loadFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
    }
}

function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
}

// Data export helpers
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        showNotification('No data to export', 'warning');
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header];
                // Escape commas and quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        )
    ].join('\n');
    
    downloadFile(csvContent, filename, 'text/csv');
}

function exportToJSON(data, filename) {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, filename, 'application/json');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Image upload helper
function handleImageUpload(file, callback) {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file', 'error');
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size must be less than 5MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        callback(e.target.result);
    };
    reader.readAsDataURL(file);
}

// Platform message helpers
function showPlatformMessage(message) {
    const banner = document.getElementById('platform-message-banner');
    const text = document.getElementById('platform-message-text');
    
    if (banner && text) {
        text.textContent = message.content;
        banner.style.display = 'block';
        
        // Set banner color based on message type
        banner.className = `platform-message-banner ${message.type}`;
    }
}

function hidePlatformMessage() {
    const banner = document.getElementById('platform-message-banner');
    if (banner) {
        banner.style.display = 'none';
    }
}

// URL helpers
function updateURL(params) {
    const url = new URL(window.location);
    Object.keys(params).forEach(key => {
        if (params[key]) {
            url.searchParams.set(key, params[key]);
        } else {
            url.searchParams.delete(key);
        }
    });
    window.history.replaceState({}, '', url);
}

function getURLParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
}