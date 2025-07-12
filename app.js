// Enhanced main application functionality with authentication and messaging

// Global state
let currentPage = 'home';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initAuth();
    initNavigation();
    initModals();
    initUserMenu();
    initPlatformMessageBanner();
    loadStoredData();
    showPage('home');
});

// Navigation functionality
function initNavigation() {
    // Desktop and mobile navigation
    const navBtns = document.querySelectorAll('.nav-btn');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    
    // Navigation button clicks
    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = btn.dataset.page;
            if (page) {
                // Check if auth is required
                if (btn.classList.contains('auth-required') && !isAuthenticated) {
                    e.preventDefault();
                    showNotification('Please login to access this feature.', 'warning');
                    openModal(document.getElementById('login-modal'));
                    return;
                }
                
                showPage(page);
                
                // Close mobile menu if open
                if (mobileNav) {
                    mobileNav.classList.remove('active');
                }
            }
        });
    });
    
    // Mobile menu toggle
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
            
            // Toggle icon
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileNav.classList.contains('active')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });
    }
    
    // Hero and CTA button clicks
    document.addEventListener('click', (e) => {
        const pageBtn = e.target.closest('[data-page]');
        if (pageBtn && !pageBtn.classList.contains('nav-btn')) {
            const page = pageBtn.dataset.page;
            
            // Check if auth is required
            if (pageBtn.classList.contains('auth-required') && !isAuthenticated) {
                e.preventDefault();
                showNotification('Please login to access this feature.', 'warning');
                openModal(document.getElementById('login-modal'));
                return;
            }
            
            showPage(page);
        }
    });
}

// Initialize user menu
function initUserMenu() {
    const userAvatar = document.getElementById('user-avatar');
    const userDropdown = document.getElementById('user-dropdown');
    const viewProfileBtn = document.getElementById('view-profile');
    const settingsBtn = document.getElementById('settings');
    const adminDashboardBtn = document.getElementById('admin-dashboard');
    const logoutBtn = document.getElementById('logout');
    
    // Toggle dropdown
    if (userAvatar && userDropdown) {
        userAvatar.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            userDropdown.classList.remove('active');
        });
        
        userDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // Menu item actions
    if (viewProfileBtn) {
        viewProfileBtn.addEventListener('click', () => {
            showPage('profile');
            userDropdown.classList.remove('active');
        });
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            showPage('profile');
            userDropdown.classList.remove('active');
        });
    }
    
    if (adminDashboardBtn) {
        adminDashboardBtn.addEventListener('click', () => {
            showPage('admin');
            userDropdown.classList.remove('active');
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
            userDropdown.classList.remove('active');
        });
    }
}

// Initialize platform message banner
function initPlatformMessageBanner() {
    const closeBtn = document.getElementById('close-platform-message');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            hidePlatformMessage();
        });
    }
}

// Check user role and show/hide admin elements
function checkUserRole() {
    const adminElements = document.querySelectorAll('.admin-only');
    
    if (isAuthenticated && currentUser && isAdmin(currentUser)) {
        adminElements.forEach(el => {
            el.style.display = 'block';
            el.classList.add('show');
        });
    } else {
        adminElements.forEach(el => {
            el.style.display = 'none';
            el.classList.remove('show');
        });
    }
}

// Show specific page
function showPage(pageName) {
    // Check admin access
    if (pageName === 'admin' && (!isAuthenticated || !isAdmin(currentUser))) {
        showNotification('Access denied. Admin privileges required.', 'error');
        return;
    }
    
    // Check authentication for protected pages
    if (['exchanges', 'profile'].includes(pageName) && !isAuthenticated) {
        showNotification('Please login to access this feature.', 'warning');
        openModal(document.getElementById('login-modal'));
        return;
    }
    
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show target page
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage = pageName;
        
        // Update navigation
        updateNavigation(pageName);
        
        // Initialize page-specific functionality
        initPageFunctionality(pageName);
        
        // Scroll to top
        window.scrollTo(0, 0);
        
        // Update URL
        updateURL({ page: pageName });
    }
}

// Update navigation active state
function updateNavigation(activePage) {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        if (btn.dataset.page === activePage) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Initialize page-specific functionality
function initPageFunctionality(pageName) {
    switch (pageName) {
        case 'home':
            initHomePage();
            break;
        case 'browse':
            initBrowsePage();
            break;
        case 'exchanges':
            if (isAuthenticated) {
                initExchangesPage();
            }
            break;
        case 'profile':
            if (isAuthenticated) {
                initProfilePage();
            }
            break;
        case 'admin':
            if (isAuthenticated && isAdmin(currentUser)) {
                initAdminPage();
            }
            break;
    }
}

// Modal functionality
function initModals() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        // Close modal when clicking outside or on close button
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.closest('.modal-close')) {
                closeModal(modal);
            }
        });
        
        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal(modal);
            }
        });
    });
}

// Show user profile modal
function showUserModal(user) {
    const modal = document.getElementById('user-modal');
    const modalUserName = document.getElementById('modal-user-name');
    const modalUserContent = document.getElementById('modal-user-content');
    
    modalUserName.textContent = `${user.name}'s Profile`;
    modalUserContent.innerHTML = createUserModalContent(user);
    
    // Add exchange button listener
    const exchangeBtn = modalUserContent.querySelector('.start-exchange-btn');
    if (exchangeBtn) {
        exchangeBtn.addEventListener('click', () => {
            if (!isAuthenticated) {
                showNotification('Please login to start an exchange.', 'warning');
                closeModal(modal);
                openModal(document.getElementById('login-modal'));
                return;
            }
            
            closeModal(modal);
            showExchangeModal(user);
        });
    }
    
    openModal(modal);
}

// Show exchange request modal
function showExchangeModal(user) {
    if (!isAuthenticated) {
        showNotification('Please login to start an exchange.', 'warning');
        openModal(document.getElementById('login-modal'));
        return;
    }
    
    const modal = document.getElementById('exchange-modal');
    const skillWantedSelect = document.getElementById('skill-wanted');
    const skillOfferedSelect = document.getElementById('skill-offered');
    
    // Populate skill options (only approved skills)
    const approvedOfferedSkills = user.skillsOffered.filter(skill => skill.status === 'approved');
    const approvedUserSkills = currentUser.skillsOffered.filter(skill => skill.status === 'approved');
    
    skillWantedSelect.innerHTML = '<option value="">Select a skill</option>' +
        approvedOfferedSkills.map(skill => 
            `<option value="${skill.id}">${skill.name}</option>`
        ).join('');
    
    skillOfferedSelect.innerHTML = '<option value="">Select a skill</option>' +
        approvedUserSkills.map(skill => 
            `<option value="${skill.id}">${skill.name}</option>`
        ).join('');
    
    // Handle form submission
    const sendBtn = document.getElementById('send-exchange-request');
    const newHandler = () => {
        const skillWantedId = skillWantedSelect.value;
        const skillOfferedId = skillOfferedSelect.value;
        const message = document.getElementById('exchange-message').value;
        
        if (!skillWantedId || !skillOfferedId) {
            showNotification('Please select both skills for the exchange.', 'error');
            return;
        }
        
        // Create exchange request
        const skillWanted = approvedOfferedSkills.find(s => s.id === skillWantedId);
        const skillOffered = approvedUserSkills.find(s => s.id === skillOfferedId);
        
        const newExchange = {
            id: generateId(),
            requester: currentUser,
            provider: user,
            skillOffered: skillOffered,
            skillWanted: skillWanted,
            status: 'pending',
            createdAt: new Date().toISOString(),
            message: message
        };
        
        // Add to exchanges array
        exchanges.push(newExchange);
        
        // Send notification to provider
        sendExchangeRequestNotification(
            user.id,
            currentUser.name,
            skillOffered.name,
            skillWanted.name
        );
        
        // Update exchange counts if on exchanges page
        if (currentPage === 'exchanges') {
            updateExchangeCounts();
        }
        
        closeModal(modal);
        showNotification(`Exchange request sent to ${user.name}!`, 'success');
        
        // Clear form
        skillWantedSelect.value = '';
        skillOfferedSelect.value = '';
        document.getElementById('exchange-message').value = '';
        
        // Clear availability checkboxes
        const availabilityCheckboxes = document.querySelectorAll('#exchange-modal .availability-checkboxes input[type="checkbox"]');
        availabilityCheckboxes.forEach(cb => cb.checked = false);
    };
    
    // Remove existing listeners and add new one
    sendBtn.replaceWith(sendBtn.cloneNode(true));
    document.getElementById('send-exchange-request').addEventListener('click', newHandler);
    
    openModal(modal);
}

// Open modal
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus management for accessibility
    const focusableElements = modal.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length > 0) {
        focusableElements[0].focus();
    }
}

// Close modal
function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Load stored data
function loadStoredData() {
    // Authentication will handle loading user data
    
    const storedExchanges = loadFromStorage('exchanges');
    if (storedExchanges) {
        exchanges.splice(0, exchanges.length, ...storedExchanges);
    }
    
    // Load URL parameters
    const urlParams = getURLParams();
    if (urlParams.page && ['home', 'browse', 'exchanges', 'profile', 'admin'].includes(urlParams.page)) {
        currentPage = urlParams.page;
    }
}

// Update notification indicators
function updateNotificationIndicators() {
    if (!isAuthenticated || !currentUser) return;
    
    // Update notification count
    const unreadNotifications = getUnreadNotificationCount();
    const notificationsDot = document.getElementById('notifications-dot');
    if (notificationsDot) {
        notificationsDot.style.display = unreadNotifications > 0 ? 'block' : 'none';
    }
    
    // Update message count
    const unreadMessages = getUnreadMessageCount();
    const messagesDot = document.getElementById('messages-dot');
    if (messagesDot) {
        messagesDot.style.display = unreadMessages > 0 ? 'block' : 'none';
    }
}

// Handle window resize for responsive behavior
window.addEventListener('resize', () => {
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    
    // Close mobile menu on desktop
    if (window.innerWidth > 768 && mobileNav) {
        mobileNav.classList.remove('active');
        
        if (mobileMenuBtn) {
            const icon = mobileMenuBtn.querySelector('i');
            icon.className = 'fas fa-bars';
        }
    }
});

// Handle smooth scrolling for anchor links
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (link) {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Auto-save user data periodically
setInterval(() => {
    if (isAuthenticated && currentUser) {
        saveToStorage('currentUser', currentUser);
        saveToStorage('exchanges', exchanges);
    }
}, 30000); // Save every 30 seconds

// Update notification indicators periodically
setInterval(() => {
    updateNotificationIndicators();
}, 5000); // Check every 5 seconds

// Add loading states for better UX
function showLoading(element, text = 'Loading...') {
    element.innerHTML = createLoadingSpinner(text);
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    showNotification('An error occurred. Please refresh the page and try again.', 'error');
});

// Unhandled promise rejection handling
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    showNotification('An unexpected error occurred. Please try again.', 'error');
});

// Service worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker would be registered here for offline functionality
        console.log('Service worker support detected');
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput && currentPage === 'browse') {
            searchInput.focus();
        } else {
            showPage('browse');
            setTimeout(() => {
                const searchInput = document.getElementById('search-input');
                if (searchInput) searchInput.focus();
            }, 100);
        }
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            closeModal(activeModal);
        }
    }
});

// Initialize tooltips and other UI enhancements
function initUIEnhancements() {
    // Add hover effects and animations
    const cards = document.querySelectorAll('.user-card, .exchange-card, .category-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
}

// Call UI enhancements after page load
window.addEventListener('load', () => {
    initUIEnhancements();
    updateNotificationIndicators();
});

// Performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
            console.log('Page load time:', entry.loadEventEnd - entry.loadEventStart, 'ms');
        }
    }
});

if (typeof PerformanceObserver !== 'undefined') {
    performanceObserver.observe({ entryTypes: ['navigation'] });
}

// Add message button to exchange cards
document.addEventListener('click', (e) => {
    const messageBtn = e.target.closest('.message-partner-btn');
    if (messageBtn) {
        const partnerId = messageBtn.dataset.partnerId;
        const exchangeId = messageBtn.dataset.exchangeId;
        
        if (partnerId && isAuthenticated) {
            startConversationFromExchange(exchangeId, partnerId);
        }
    }
});