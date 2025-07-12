// Authentication system for SkillSwap platform

// Authentication state
let authToken = null;

// Mock user database (in a real app, this would be on the server)
const userDatabase = [
    {
        id: '1',
        name: 'Sarah Chen',
        email: 'sarah@example.com',
        password: 'password123', // In reality, this would be hashed
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        bio: 'Full-stack developer passionate about React and UX design.',
        location: 'San Francisco, CA',
        role: 'user',
        status: 'active',
        joinedDate: '2023-01-15',
        isPublic: true,
        showLocation: true,
        emailNotifications: true,
        skillsOffered: [
            {
                id: '1',
                name: 'React Development',
                category: 'Programming',
                level: 'Advanced',
                description: 'Building modern web applications with React and TypeScript',
                status: 'approved'
            },
            {
                id: '2',
                name: 'UI/UX Design',
                category: 'Design',
                level: 'Expert',
                description: 'Creating beautiful and intuitive user interfaces',
                status: 'approved'
            }
        ],
        skillsWanted: [
            {
                id: '3',
                name: 'Spanish Conversation',
                category: 'Languages',
                level: 'Beginner',
                description: 'Want to learn conversational Spanish for travel',
                status: 'approved'
            },
            {
                id: '4',
                name: 'Photography',
                category: 'Photography',
                level: 'Beginner',
                description: 'Interested in portrait and landscape photography',
                status: 'approved'
            }
        ],
        rating: 4.9,
        exchangesCompleted: 15,
        availability: ['Weekends', 'Evenings'],
        lastActive: new Date().toISOString(),
        reviews: [
            {
                id: '1',
                reviewerId: '2',
                reviewerName: 'Miguel Rodriguez',
                rating: 5,
                comment: 'Excellent React teacher! Very patient and knowledgeable.',
                exchangeId: '2',
                createdAt: '2024-01-21T10:00:00Z'
            }
        ]
    },
    {
        id: 'admin',
        name: 'Admin User',
        email: 'admin@skillswap.com',
        password: 'admin123',
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        role: 'admin',
        status: 'active',
        joinedDate: '2023-01-01',
        isPublic: false,
        skillsOffered: [],
        skillsWanted: [],
        rating: 5.0,
        exchangesCompleted: 0,
        availability: [],
        lastActive: new Date().toISOString(),
        reviews: []
    }
];

// Initialize authentication system
function initAuth() {
    // Check for existing session
    const savedAuth = loadFromStorage('auth');
    if (savedAuth && savedAuth.token && savedAuth.userId) {
        const user = userDatabase.find(u => u.id === savedAuth.userId);
        if (user && isSessionValid()) {
            isAuthenticated = true;
            authToken = savedAuth.token;
            currentUser = { ...user };
            delete currentUser.password; // Remove password from memory
            updateAuthUI();
        }
    }
    
    // Set up auth form listeners
    setupAuthForms();
    setupAuthButtons();
}

// Set up authentication forms
function setupAuthForms() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const switchToSignup = document.getElementById('switch-to-signup');
    const switchToLogin = document.getElementById('switch-to-login');
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // Switch between login and signup
    if (switchToSignup) {
        switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(document.getElementById('login-modal'));
            openModal(document.getElementById('signup-modal'));
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(document.getElementById('signup-modal'));
            openModal(document.getElementById('login-modal'));
        });
    }
}

// Set up authentication buttons
function setupAuthButtons() {
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            openModal(document.getElementById('login-modal'));
        });
    }
    
    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            openModal(document.getElementById('signup-modal'));
        });
    }
    
    // Handle auth-required elements
    document.addEventListener('click', (e) => {
        const authRequired = e.target.closest('.auth-required');
        if (authRequired && !isAuthenticated) {
            e.preventDefault();
            e.stopPropagation();
            showNotification('Please login to access this feature.', 'warning');
            openModal(document.getElementById('login-modal'));
        }
    });
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    // Validate input
    if (!validateRequired(email) || !validateRequired(password)) {
        showNotification('Please fill in all fields.', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    submitBtn.disabled = true;
    
    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Find user in mock database
        const user = userDatabase.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && 
            u.password === password
        );
        
        if (!user) {
            throw new Error('Invalid email or password');
        }
        
        if (user.status === 'banned') {
            throw new Error('Account has been suspended. Please contact support.');
        }
        
        // Successful login
        await loginUser(user, rememberMe);
        
        // Close modal and reset form
        closeModal(document.getElementById('login-modal'));
        document.getElementById('login-form').reset();
        
        showNotification(`Welcome back, ${user.name}!`, 'success');
        
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Handle signup form submission
async function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const location = document.getElementById('signup-location').value;
    const agreeTerms = document.getElementById('agree-terms').checked;
    
    // Validate input
    if (!validateRequired(name) || !validateRequired(email) || !validateRequired(password)) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long.', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match.', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showNotification('Please agree to the Terms of Service and Privacy Policy.', 'error');
        return;
    }
    
    // Check if email already exists
    if (userDatabase.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        showNotification('An account with this email already exists.', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    submitBtn.disabled = true;
    
    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Create new user
        const newUser = {
            id: generateId(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: password, // In reality, this would be hashed
            avatar: `https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`,
            bio: 'New SkillSwap member ready to learn and share!',
            location: location.trim() || '',
            role: 'user',
            status: 'active',
            joinedDate: new Date().toISOString().split('T')[0],
            isPublic: true,
            showLocation: !!location,
            emailNotifications: true,
            skillsOffered: [],
            skillsWanted: [],
            availability: [],
            rating: 0,
            exchangesCompleted: 0,
            reviews: [],
            lastActive: new Date().toISOString()
        };
        
        // Add to mock database
        userDatabase.push(newUser);
        users.push(newUser);
        
        // Auto-login the new user
        await loginUser(newUser, false);
        
        // Close modal and reset form
        closeModal(document.getElementById('signup-modal'));
        document.getElementById('signup-form').reset();
        
        showNotification(`Welcome to SkillSwap, ${newUser.name}! Your account has been created successfully.`, 'success');
        
        // Send welcome notification
        sendWelcomeNotification(newUser.id);
        
        // Show profile page to complete setup
        setTimeout(() => {
            showPage('profile');
            showNotification('Complete your profile to start exchanging skills!', 'info');
        }, 2000);
        
    } catch (error) {
        showNotification(error.message || 'Failed to create account. Please try again.', 'error');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Login user and set up session
async function loginUser(user, rememberMe = false) {
    // Generate auth token (in reality, this would come from the server)
    authToken = generateAuthToken();
    isAuthenticated = true;
    
    // Set current user (remove password)
    currentUser = { ...user };
    delete currentUser.password;
    
    // Update last active timestamp
    currentUser.lastActive = new Date().toISOString();
    
    // Save authentication state
    const authData = {
        token: authToken,
        userId: user.id,
        rememberMe: rememberMe,
        expiresAt: rememberMe ? 
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : // 30 days
            new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 1 day
    };
    
    saveToStorage('auth', authData);
    saveToStorage('currentUser', currentUser);
    
    // Update UI
    updateAuthUI();
    
    // Update stats if user joined users array
    const existingUser = users.find(u => u.id === user.id);
    if (!existingUser && user.role !== 'admin') {
        users.push(currentUser);
        platformStats.totalUsers = users.length;
        platformStats.activeUsers = users.filter(u => u.status === 'active').length;
    }
}

// Logout user
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear authentication state
        isAuthenticated = false;
        authToken = null;
        currentUser = null;
        
        // Clear stored data
        removeFromStorage('auth');
        removeFromStorage('currentUser');
        
        // Update UI
        updateAuthUI();
        
        // Redirect to home page
        showPage('home');
        
        showNotification('You have been logged out successfully.', 'info');
    }
}

// Update authentication UI
function updateAuthUI() {
    const authSection = document.getElementById('auth-section');
    const userSection = document.getElementById('user-section');
    const userAvatar = document.getElementById('user-avatar');
    const authRequiredElements = document.querySelectorAll('.auth-required');
    
    if (isAuthenticated && currentUser) {
        // Show user section, hide auth buttons
        if (authSection) authSection.style.display = 'none';
        if (userSection) userSection.style.display = 'flex';
        
        // Set user avatar
        if (userAvatar) {
            if (currentUser.avatar) {
                userAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            } else {
                userAvatar.innerHTML = currentUser.name.charAt(0).toUpperCase();
            }
        }
        
        // Show auth-required elements
        authRequiredElements.forEach(el => {
            el.style.display = '';
            el.style.opacity = '1';
            el.style.pointerEvents = 'auto';
        });
        
        // Check user role for admin elements
        checkUserRole();
        
        // Initialize messaging and notifications
        initMessaging();
        initNotifications();
        
    } else {
        // Show auth buttons, hide user section
        if (authSection) authSection.style.display = 'flex';
        if (userSection) userSection.style.display = 'none';
        
        // Hide auth-required elements
        authRequiredElements.forEach(el => {
            el.style.opacity = '0.5';
            el.style.pointerEvents = 'none';
        });
        
        // Hide admin elements
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.display = 'none';
            el.classList.remove('show');
        });
    }
}

// Generate mock auth token
function generateAuthToken() {
    return 'auth_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// Check if current session is valid
function isSessionValid() {
    const savedAuth = loadFromStorage('auth');
    if (!savedAuth || !savedAuth.expiresAt) return false;
    
    return new Date(savedAuth.expiresAt) > new Date();
}

// Refresh authentication session
function refreshSession() {
    if (!isSessionValid()) {
        logout();
        showNotification('Your session has expired. Please login again.', 'warning');
    }
}

// Get current user
function getCurrentUser() {
    return isAuthenticated ? currentUser : null;
}

// Check if user has permission
function hasPermission(permission) {
    if (!isAuthenticated || !currentUser) return false;
    
    switch (permission) {
        case 'admin':
            return currentUser.role === 'admin';
        case 'exchange':
            return currentUser.status === 'active';
        case 'message':
            return currentUser.status === 'active';
        default:
            return true;
    }
}

// Require authentication for action
function requireAuth(action, errorMessage = 'Please login to continue') {
    if (!isAuthenticated) {
        showNotification(errorMessage, 'warning');
        openModal(document.getElementById('login-modal'));
        return false;
    }
    return true;
}

// Auto-refresh session periodically
setInterval(() => {
    if (isAuthenticated) {
        refreshSession();
    }
}, 5 * 60 * 1000); // Check every 5 minutes

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    let feedback = [];
    
    if (password.length >= 8) strength++;
    else feedback.push('Use at least 8 characters');
    
    if (/[a-z]/.test(password)) strength++;
    else feedback.push('Include lowercase letters');
    
    if (/[A-Z]/.test(password)) strength++;
    else feedback.push('Include uppercase letters');
    
    if (/[0-9]/.test(password)) strength++;
    else feedback.push('Include numbers');
    
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    else feedback.push('Include special characters');
    
    const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return {
        score: strength,
        level: levels[Math.min(strength, 4)],
        feedback: feedback
    };
}

// Password reset simulation
function resetPassword(email) {
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }
    
    // Simulate sending reset email
    setTimeout(() => {
        showNotification('Password reset instructions have been sent to your email.', 'success');
    }, 1000);
}