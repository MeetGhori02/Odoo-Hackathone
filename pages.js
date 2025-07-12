// Enhanced page-specific functionality with admin features

// Home page functionality
function initHomePage() {
    // Update platform statistics
    updatePlatformStats();
    
    // Populate categories
    const categoriesGrid = document.getElementById('categories-grid');
    if (categoriesGrid) {
        categoriesGrid.innerHTML = categories.map(createCategoryCard).join('');
        
        // Add click handlers for categories
        categoriesGrid.addEventListener('click', (e) => {
            const categoryCard = e.target.closest('.category-card');
            if (categoryCard) {
                const category = categoryCard.dataset.category;
                // Set category filter and switch to browse page
                showPage('browse');
                setTimeout(() => {
                    const categoryFilter = document.getElementById('category-filter');
                    if (categoryFilter) {
                        categoryFilter.value = category;
                        updateBrowseResults();
                    }
                }, 100);
            }
        });
    }
    
    // Populate featured users (only active, public users)
    const featuredUsersGrid = document.getElementById('featured-users-grid');
    if (featuredUsersGrid) {
        const activeUsers = users.filter(user => user.status === 'active' && user.isPublic);
        featuredUsersGrid.innerHTML = activeUsers.map(createUserCard).join('');
        addUserCardListeners(featuredUsersGrid);
    }
    
    // Check for platform messages
    checkPlatformMessages();
}

// Update platform statistics on home page
function updatePlatformStats() {
    const totalUsersEl = document.getElementById('total-users');
    const totalExchangesEl = document.getElementById('total-exchanges');
    const successRateEl = document.getElementById('success-rate');
    const averageRatingEl = document.getElementById('average-rating');
    
    if (totalUsersEl) totalUsersEl.textContent = `${platformStats.activeUsers}+`;
    if (totalExchangesEl) totalExchangesEl.textContent = `${platformStats.completedExchanges}+`;
    if (successRateEl) successRateEl.textContent = `${platformStats.successRate}%`;
    if (averageRatingEl) averageRatingEl.textContent = platformStats.averageRating;
}

// Check and display platform messages
function checkPlatformMessages() {
    const activeMessage = platformMessages.find(msg => 
        msg.isActive && new Date(msg.expiresAt) > new Date()
    );
    
    if (activeMessage) {
        showPlatformMessage(activeMessage);
    }
}

// Browse page functionality
function initBrowsePage() {
    // Populate category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.innerHTML = '<option value="">All Categories</option>' + 
            categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    }
    
    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        const debouncedSearch = debounce(() => {
            updateBrowseResults();
        }, 300);
        
        searchInput.addEventListener('input', debouncedSearch);
    }
    
    // Filter functionality
    const categoryFilterEl = document.getElementById('category-filter');
    const levelFilter = document.getElementById('level-filter');
    const availabilityFilter = document.getElementById('availability-filter');
    
    if (categoryFilterEl) {
        categoryFilterEl.addEventListener('change', updateBrowseResults);
    }
    
    if (levelFilter) {
        levelFilter.addEventListener('change', updateBrowseResults);
    }
    
    if (availabilityFilter) {
        availabilityFilter.addEventListener('change', updateBrowseResults);
    }
    
    // Mobile filter toggle
    const filterToggle = document.querySelector('.filter-toggle');
    const filters = document.querySelector('.filters');
    
    if (filterToggle && filters) {
        filterToggle.addEventListener('click', () => {
            filters.classList.toggle('active');
        });
    }
    
    // Clear filters
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            document.getElementById('search-input').value = '';
            document.getElementById('category-filter').value = '';
            document.getElementById('level-filter').value = '';
            document.getElementById('availability-filter').value = '';
            updateBrowseResults();
        });
    }
    
    // Initial load
    updateBrowseResults();
}

// Update browse results with enhanced filtering
function updateBrowseResults() {
    const searchQuery = document.getElementById('search-input')?.value || '';
    const categoryFilter = document.getElementById('category-filter')?.value || '';
    const levelFilter = document.getElementById('level-filter')?.value || '';
    const availabilityFilter = document.getElementById('availability-filter')?.value || '';
    
    // Only show active, public users
    const activeUsers = users.filter(user => user.status === 'active' && user.isPublic);
    const filteredUsers = filterUsers(activeUsers, searchQuery, categoryFilter, levelFilter, availabilityFilter);
    
    // Update results count
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        resultsCount.textContent = `${filteredUsers.length} ${filteredUsers.length === 1 ? 'Result' : 'Results'}`;
    }
    
    // Show/hide clear filters button
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        const hasFilters = searchQuery || categoryFilter || levelFilter || availabilityFilter;
        clearFiltersBtn.style.display = hasFilters ? 'block' : 'none';
    }
    
    // Update users grid
    const usersGrid = document.getElementById('browse-users-grid');
    const noResults = document.getElementById('no-results');
    
    if (filteredUsers.length > 0) {
        usersGrid.innerHTML = filteredUsers.map(createUserCard).join('');
        usersGrid.style.display = 'grid';
        noResults.style.display = 'none';
        addUserCardListeners(usersGrid);
    } else {
        usersGrid.style.display = 'none';
        noResults.style.display = 'block';
    }
    
    // Update URL with current filters
    updateURL({
        search: searchQuery,
        category: categoryFilter,
        level: levelFilter,
        availability: availabilityFilter
    });
}

// Exchanges page functionality
function initExchangesPage() {
    if (!isAuthenticated) {
        showNotification('Please login to view your exchanges.', 'warning');
        return;
    }

    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    let activeTab = 'pending';
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active tab
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            activeTab = btn.dataset.tab;
            updateExchangesList();
        });
    });
    
    // Update counts
    updateExchangeCounts();
    
    // Initial load
    updateExchangesList();
    
    function updateExchangesList() {
        const filteredExchanges = filterExchanges(exchanges, activeTab);
        const exchangesList = document.getElementById('exchanges-list');
        const noExchanges = document.getElementById('no-exchanges');
        const noExchangesText = document.getElementById('no-exchanges-text');
        
        if (filteredExchanges.length > 0) {
            exchangesList.innerHTML = filteredExchanges.map(createExchangeCard).join('');
            exchangesList.style.display = 'flex';
            noExchanges.style.display = 'none';
            
            // Add exchange action listeners
            addExchangeActionListeners(exchangesList);
        } else {
            exchangesList.style.display = 'none';
            noExchanges.style.display = 'block';
            
            if (activeTab === 'pending') {
                noExchangesText.textContent = "You don't have any pending exchange requests.";
            } else if (activeTab === 'active') {
                noExchangesText.textContent = "You don't have any active exchanges.";
            } else if (activeTab === 'completed') {
                noExchangesText.textContent = "You don't have any completed exchanges.";
            } else {
                noExchangesText.textContent = "You don't have any exchanges yet. Start by browsing available skills!";
            }
        }
    }
    
    function addExchangeActionListeners(container) {
        container.addEventListener('click', (e) => {
            const acceptBtn = e.target.closest('.accept-exchange-btn');
            const declineBtn = e.target.closest('.decline-exchange-btn');
            const deleteBtn = e.target.closest('.delete-exchange-btn');
            const completeBtn = e.target.closest('.complete-exchange-btn');
            const reviewBtn = e.target.closest('.leave-review-btn');
            const messageBtn = e.target.closest('.message-partner-btn');
            
            if (acceptBtn) {
                const exchangeId = acceptBtn.dataset.exchangeId;
                acceptExchange(exchangeId);
            }
            
            if (declineBtn) {
                const exchangeId = declineBtn.dataset.exchangeId;
                declineExchange(exchangeId);
            }
            
            if (deleteBtn) {
                const exchangeId = deleteBtn.dataset.exchangeId;
                deleteExchange(exchangeId);
            }
            
            if (completeBtn) {
                const exchangeId = completeBtn.dataset.exchangeId;
                completeExchange(exchangeId);
            }
            
            if (reviewBtn) {
                const exchangeId = reviewBtn.dataset.exchangeId;
                showReviewModal(exchangeId);
            }

            if (messageBtn) {
                const partnerId = messageBtn.dataset.partnerId;
                const exchangeId = messageBtn.dataset.exchangeId;
                startConversationFromExchange(exchangeId, partnerId);
            }
        });
    }
    
    function acceptExchange(exchangeId) {
        const exchange = exchanges.find(ex => ex.id === exchangeId);
        if (exchange) {
            exchange.status = 'accepted';
            exchange.acceptedAt = new Date().toISOString();
            
            // Send notification to requester
            sendExchangeAcceptedNotification(exchange.requester.id, currentUser.name);
            
            updateExchangeCounts();
            updateExchangesList();
            showNotification('Exchange request accepted!', 'success');
        }
    }
    
    function declineExchange(exchangeId) {
        if (confirm('Are you sure you want to decline this exchange request?')) {
            const exchange = exchanges.find(ex => ex.id === exchangeId);
            if (exchange) {
                exchange.status = 'cancelled';
                exchange.cancelledAt = new Date().toISOString();
                updateExchangeCounts();
                updateExchangesList();
                showNotification('Exchange request declined.', 'info');
            }
        }
    }
    
    function deleteExchange(exchangeId) {
        if (confirm('Are you sure you want to delete this exchange request?')) {
            const exchangeIndex = exchanges.findIndex(ex => ex.id === exchangeId);
            if (exchangeIndex !== -1) {
                exchanges.splice(exchangeIndex, 1);
                updateExchangeCounts();
                updateExchangesList();
                showNotification('Exchange request deleted successfully!', 'success');
            }
        }
    }
    
    function completeExchange(exchangeId) {
        if (confirm('Mark this exchange as completed?')) {
            const exchange = exchanges.find(ex => ex.id === exchangeId);
            if (exchange) {
                exchange.status = 'completed';
                exchange.completedAt = new Date().toISOString();
                
                // Update user exchange counts
                exchange.requester.exchangesCompleted++;
                exchange.provider.exchangesCompleted++;
                
                // Send completion notifications
                sendExchangeCompletedNotification(exchange.requester.id, exchange.provider.name);
                sendExchangeCompletedNotification(exchange.provider.id, exchange.requester.name);
                
                updateExchangeCounts();
                updateExchangesList();
                showNotification('Exchange marked as completed!', 'success');
            }
        }
    }
}

// Update exchange counts
function updateExchangeCounts() {
    if (!isAuthenticated) return;
    
    const pendingCount = filterExchanges(exchanges, 'pending').length;
    const activeCount = filterExchanges(exchanges, 'active').length;
    const completedCount = filterExchanges(exchanges, 'completed').length;
    const allCount = filterExchanges(exchanges, 'all').length;
    
    const pendingCountEl = document.getElementById('pending-count');
    const activeCountEl = document.getElementById('active-count');
    const completedCountEl = document.getElementById('completed-count');
    const allCountEl = document.getElementById('all-count');
    
    if (pendingCountEl) pendingCountEl.textContent = pendingCount;
    if (activeCountEl) activeCountEl.textContent = activeCount;
    if (completedCountEl) completedCountEl.textContent = completedCount;
    if (allCountEl) allCountEl.textContent = allCount;
}

// Profile page functionality
function initProfilePage() {
    if (!isAuthenticated) {
        showNotification('Please login to view your profile.', 'warning');
        return;
    }

    let isEditing = false;
    
    // Load current user data
    loadProfileData();
    
    // Edit profile functionality
    const editBtn = document.getElementById('edit-profile-btn');
    const saveBtn = document.getElementById('save-profile-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            isEditing = true;
            toggleEditMode(true);
        });
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveProfileData();
            isEditing = false;
            toggleEditMode(false);
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            loadProfileData(); // Reset to original data
            isEditing = false;
            toggleEditMode(false);
        });
    }
    
    // Avatar upload functionality
    const avatarUploadBtn = document.getElementById('avatar-upload-btn');
    const avatarInput = document.getElementById('avatar-input');
    
    if (avatarUploadBtn && avatarInput) {
        avatarUploadBtn.addEventListener('click', () => {
            avatarInput.click();
        });
        
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleImageUpload(file, (dataUrl) => {
                    document.getElementById('profile-avatar').src = dataUrl;
                    currentUser.avatar = dataUrl;
                });
            }
        });
    }
    
    // Add skill functionality
    const addOfferedBtn = document.getElementById('add-offered-skill');
    const addWantedBtn = document.getElementById('add-wanted-skill');
    
    if (addOfferedBtn) {
        addOfferedBtn.addEventListener('click', () => {
            showAddSkillForm('offered');
        });
    }
    
    if (addWantedBtn) {
        addWantedBtn.addEventListener('click', () => {
            showAddSkillForm('wanted');
        });
    }
    
    function toggleEditMode(editing) {
        // Toggle buttons
        editBtn.style.display = editing ? 'none' : 'flex';
        saveBtn.style.display = editing ? 'flex' : 'none';
        cancelBtn.style.display = editing ? 'flex' : 'none';
        
        // Toggle avatar upload button
        const avatarUploadBtn = document.getElementById('avatar-upload-btn');
        if (avatarUploadBtn) {
            avatarUploadBtn.style.display = editing ? 'flex' : 'none';
        }
        
        // Toggle add skill buttons
        if (addOfferedBtn) addOfferedBtn.style.display = editing ? 'flex' : 'none';
        if (addWantedBtn) addWantedBtn.style.display = editing ? 'flex' : 'none';
        
        // Toggle edit fields
        const nameText = document.getElementById('profile-name');
        const nameEdit = document.getElementById('edit-name');
        const locationText = document.getElementById('profile-location');
        const locationEdit = document.getElementById('edit-location');
        const bioText = document.getElementById('profile-bio-text');
        const bioEdit = document.getElementById('edit-bio');
        const availabilityDisplay = document.getElementById('availability-display');
        const availabilityEdit = document.getElementById('availability-edit');
        
        if (editing) {
            nameText.style.display = 'none';
            nameEdit.style.display = 'block';
            locationText.style.display = 'none';
            locationEdit.style.display = 'inline-block';
            bioText.style.display = 'none';
            bioEdit.style.display = 'block';
            availabilityDisplay.style.display = 'none';
            availabilityEdit.style.display = 'block';
            
            // Set availability checkboxes
            const checkboxes = document.querySelectorAll('#availability-edit input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = currentUser.availability.includes(cb.value);
            });
        } else {
            nameText.style.display = 'block';
            nameEdit.style.display = 'none';
            locationText.style.display = 'inline';
            locationEdit.style.display = 'none';
            bioText.style.display = 'block';
            bioEdit.style.display = 'none';
            availabilityDisplay.style.display = 'flex';
            availabilityEdit.style.display = 'none';
        }
        
        // Update skills lists
        updateSkillsList('offered', editing);
        updateSkillsList('wanted', editing);
    }
    
    function updateAvailabilityDisplay() {
        const availabilityDisplay = document.getElementById('availability-display');
        availabilityDisplay.innerHTML = currentUser.availability.map(time => 
            `<span class="availability-tag">${time}</span>`
        ).join('');
    }
    
    function updateProfileStatus() {
        const statusIcon = document.getElementById('profile-status-icon');
        const statusText = document.getElementById('profile-status-text');
        
        if (currentUser.isPublic) {
            statusIcon.className = 'fas fa-circle';
            statusIcon.style.color = '#10b981';
            statusText.textContent = 'Public Profile';
        } else {
            statusIcon.className = 'fas fa-circle';
            statusIcon.style.color = '#6b7280';
            statusText.textContent = 'Private Profile';
        }
    }
    
    function updateReviewsDisplay() {
        const reviewsList = document.getElementById('reviews-list');
        if (currentUser.reviews && currentUser.reviews.length > 0) {
            reviewsList.innerHTML = currentUser.reviews.map(createReviewItem).join('');
        } else {
            reviewsList.innerHTML = '<p style="color: #6b7280; text-align: center;">No reviews yet</p>';
        }
    }
    
    function loadProfileData() {
        document.getElementById('profile-name').textContent = currentUser.name;
        document.getElementById('edit-name').value = currentUser.name;
        document.getElementById('profile-location').textContent = currentUser.location || 'Location not set';
        document.getElementById('edit-location').value = currentUser.location || '';
        document.getElementById('profile-bio-text').textContent = currentUser.bio;
        document.getElementById('edit-bio').value = currentUser.bio;
        document.getElementById('profile-avatar').src = currentUser.avatar;
        document.getElementById('profile-rating').textContent = currentUser.rating;
        document.getElementById('profile-exchanges').textContent = currentUser.exchangesCompleted;
        document.getElementById('profile-public').checked = currentUser.isPublic;
        document.getElementById('show-location').checked = currentUser.showLocation;
        document.getElementById('email-notifications').checked = currentUser.emailNotifications;
        
        updateAvailabilityDisplay();
        updateProfileStatus();
        updateReviewsDisplay();
        updateSkillsList('offered', isEditing);
        updateSkillsList('wanted', isEditing);
    }
    
    function saveProfileData() {
        const name = document.getElementById('edit-name').value;
        const location = document.getElementById('edit-location').value;
        const bio = document.getElementById('edit-bio').value;
        
        if (!validateRequired(name) || !validateRequired(bio)) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }
        
        currentUser.name = name;
        currentUser.location = location;
        currentUser.bio = bio;
        currentUser.isPublic = document.getElementById('profile-public').checked;
        currentUser.showLocation = document.getElementById('show-location').checked;
        currentUser.emailNotifications = document.getElementById('email-notifications').checked;
        
        // Save availability
        const availabilityCheckboxes = document.querySelectorAll('#availability-edit input[type="checkbox"]:checked');
        currentUser.availability = Array.from(availabilityCheckboxes).map(cb => cb.value);
        
        // Update display
        document.getElementById('profile-name').textContent = currentUser.name;
        document.getElementById('profile-location').textContent = currentUser.location || 'Location not set';
        document.getElementById('profile-bio-text').textContent = currentUser.bio;
        
        updateAvailabilityDisplay();
        updateProfileStatus();
        
        // Save to localStorage
        saveToStorage('currentUser', currentUser);
        
        showNotification('Profile updated successfully!', 'success');
    }
    
    function updateSkillsList(type, editing) {
        const skillsList = document.getElementById(`${type}-skills`);
        const skills = type === 'offered' ? currentUser.skillsOffered : currentUser.skillsWanted;
        
        skillsList.innerHTML = skills.map(skill => createSkillItem(skill, type, editing)).join('');
        
        if (editing) {
            // Add remove skill listeners
            skillsList.addEventListener('click', (e) => {
                const removeBtn = e.target.closest('.remove-skill-btn');
                if (removeBtn) {
                    const skillId = removeBtn.dataset.skillId;
                    const skillType = removeBtn.dataset.type;
                    removeSkill(skillId, skillType);
                }
            });
        }
    }
    
    function showAddSkillForm(type) {
        const formContainer = document.getElementById(`add-${type}-form`);
        formContainer.innerHTML = createAddSkillForm(type);
        formContainer.style.display = 'block';
        
        // Add form listeners
        const saveBtn = document.getElementById('save-skill-btn');
        const cancelBtn = document.getElementById('cancel-skill-btn');
        
        saveBtn.addEventListener('click', () => {
            addSkill(type);
        });
        
        cancelBtn.addEventListener('click', () => {
            formContainer.style.display = 'none';
        });
    }
    
    function addSkill(type) {
        const name = document.getElementById('new-skill-name').value;
        const category = document.getElementById('new-skill-category').value;
        const description = document.getElementById('new-skill-description').value;
        const level = type === 'offered' ? document.getElementById('new-skill-level').value : 'Beginner';
        
        if (!validateRequired(name) || !validateRequired(category) || !validateRequired(description)) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }
        
        // Validate skill description for spam/inappropriate content
        if (!validateSkillDescription(description)) {
            showNotification('Skill description contains inappropriate content. Please revise.', 'error');
            return;
        }
        
        const newSkill = {
            id: generateId(),
            name,
            category,
            level,
            description,
            status: 'pending', // Skills need admin approval
            createdAt: new Date().toISOString()
        };
        
        if (type === 'offered') {
            currentUser.skillsOffered.push(newSkill);
        } else {
            currentUser.skillsWanted.push(newSkill);
        }
        
        // Add to global skills array for admin moderation
        skills.push(newSkill);
        
        updateSkillsList(type, true);
        document.getElementById(`add-${type}-form`).style.display = 'none';
        
        showNotification('Skill added and submitted for approval!', 'success');
    }
    
    function removeSkill(skillId, type) {
        if (confirm('Are you sure you want to remove this skill?')) {
            if (type === 'offered') {
                currentUser.skillsOffered = currentUser.skillsOffered.filter(skill => skill.id !== skillId);
            } else {
                currentUser.skillsWanted = currentUser.skillsWanted.filter(skill => skill.id !== skillId);
            }
            
            updateSkillsList(type, true);
            showNotification('Skill removed successfully!', 'success');
        }
    }
}

// Add user card event listeners
function addUserCardListeners(container) {
    container.addEventListener('click', (e) => {
        const viewBtn = e.target.closest('.view-profile-btn');
        const exchangeBtn = e.target.closest('.start-exchange-btn');
        
        if (viewBtn) {
            const userId = viewBtn.dataset.userId;
            const user = users.find(u => u.id === userId);
            if (user) {
                showUserModal(user);
            }
        }
        
        if (exchangeBtn) {
            if (!isAuthenticated) {
                showNotification('Please login to start an exchange.', 'warning');
                openModal(document.getElementById('login-modal'));
                return;
            }
            
            const userId = exchangeBtn.dataset.userId;
            const user = users.find(u => u.id === userId);
            if (user) {
                showExchangeModal(user);
            }
        }
    });
}

// Show review modal
function showReviewModal(exchangeId) {
    const modal = document.getElementById('review-modal');
    const starRating = document.getElementById('star-rating');
    const submitBtn = document.getElementById('submit-review');
    
    let selectedRating = 0;
    
    // Star rating functionality
    const stars = starRating.querySelectorAll('i');
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            selectedRating = index + 1;
            updateStarDisplay();
        });
        
        star.addEventListener('mouseenter', () => {
            highlightStars(index + 1);
        });
    });
    
    starRating.addEventListener('mouseleave', () => {
        updateStarDisplay();
    });
    
    function highlightStars(rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }
    
    function updateStarDisplay() {
        highlightStars(selectedRating);
    }
    
    // Submit review
    submitBtn.onclick = () => {
        const comment = document.getElementById('review-comment').value;
        
        if (selectedRating === 0) {
            showNotification('Please select a rating.', 'error');
            return;
        }
        
        if (!validateRequired(comment)) {
            showNotification('Please write a review comment.', 'error');
            return;
        }
        
        // Create review
        const review = {
            id: generateId(),
            reviewerId: currentUser.id,
            reviewerName: currentUser.name,
            rating: selectedRating,
            comment: comment,
            exchangeId: exchangeId,
            createdAt: new Date().toISOString()
        };
        
        // Find exchange and add review to partner's profile
        const exchange = exchanges.find(ex => ex.id === exchangeId);
        if (exchange) {
            const partner = exchange.requester.id === currentUser.id ? exchange.provider : exchange.requester;
            if (!partner.reviews) {
                partner.reviews = [];
            }
            partner.reviews.push(review);
            
            // Update partner's rating
            const totalRating = partner.reviews.reduce((sum, r) => sum + r.rating, 0);
            partner.rating = (totalRating / partner.reviews.length).toFixed(1);
            
            // Send notification to partner
            sendReviewReceivedNotification(partner.id, currentUser.name, selectedRating);
        }
        
        closeModal(modal);
        showNotification('Review submitted successfully!', 'success');
        
        // Clear form
        selectedRating = 0;
        updateStarDisplay();
        document.getElementById('review-comment').value = '';
    };
    
    openModal(modal);
}