// Enhanced component functions for rendering UI elements

// Create user card HTML with enhanced features
function createUserCard(user) {
    const skillsOfferedHtml = user.skillsOffered.slice(0, 3).map(skill => 
        `<span class="skill-tag offered">${skill.name}</span>`
    ).join('');
    
    const moreOfferedCount = user.skillsOffered.length - 3;
    const moreOfferedHtml = moreOfferedCount > 0 ? 
        `<span class="skill-tag more">+${moreOfferedCount} more</span>` : '';
    
    const skillsWantedHtml = user.skillsWanted.slice(0, 3).map(skill => 
        `<span class="skill-tag wanted">${skill.name}</span>`
    ).join('');
    
    const moreWantedCount = user.skillsWanted.length - 3;
    const moreWantedHtml = moreWantedCount > 0 ? 
        `<span class="skill-tag more">+${moreWantedCount} more</span>` : '';

    const statusClass = user.isPublic ? 'public' : 'private';
    const statusText = user.isPublic ? 'Public Profile' : 'Private Profile';
    const locationDisplay = user.showLocation ? user.location : 'Location hidden';

    return `
        <div class="user-card" data-user-id="${user.id}">
            <div class="user-card-content">
                <div class="user-header">
                    <img src="${user.avatar}" alt="${user.name}" class="user-avatar">
                    <div class="user-info">
                        <h3 class="user-name">${user.name}</h3>
                        <div class="user-rating">
                            <i class="fas fa-star"></i>
                            <span>${user.rating}</span>
                            <span class="user-rating-text">(${user.exchangesCompleted} exchanges)</span>
                        </div>
                        <div class="user-location">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${locationDisplay}</span>
                        </div>
                        <div class="user-status ${statusClass}">
                            <i class="fas fa-circle"></i>
                            <span>${statusText}</span>
                        </div>
                    </div>
                </div>
                
                <p class="user-bio">${truncateText(user.bio, 120)}</p>
                
                <div class="skills-section-card">
                    <h4 class="skills-section-title">Skills Offered</h4>
                    <div class="skills-tags">
                        ${skillsOfferedHtml}
                        ${moreOfferedHtml}
                    </div>
                </div>
                
                <div class="skills-section-card">
                    <h4 class="skills-section-title">Looking to Learn</h4>
                    <div class="skills-tags">
                        ${skillsWantedHtml}
                        ${moreWantedHtml}
                    </div>
                </div>
                
                <div class="user-actions">
                    <button class="btn btn-outline view-profile-btn" data-user-id="${user.id}">
                        View Profile
                    </button>
                    <button class="btn btn-primary start-exchange-btn auth-required" data-user-id="${user.id}">
                        Start Exchange
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Create category card HTML
function createCategoryCard(category) {
    return `
        <div class="category-card" data-category="${category}">
            <div class="category-name">${category}</div>
        </div>
    `;
}

// Create enhanced exchange card HTML
function createExchangeCard(exchange) {
    const statusIcon = getStatusIcon(exchange.status);
    const statusText = getStatusText(exchange.status);
    const statusClass = exchange.status.replace('-', '');
    
    // Determine if current user is requester or provider
    const isRequester = currentUser && exchange.requester.id === currentUser.id;
    const partner = isRequester ? exchange.provider : exchange.requester;
    
    let actionsHtml = `
        <button class="btn btn-primary message-partner-btn" data-partner-id="${partner.id}" data-exchange-id="${exchange.id}">
            <i class="fas fa-comment"></i>
            <span>Message</span>
        </button>
    `;
    
    if (exchange.status === 'pending') {
        if (!isRequester) {
            // Provider can accept/decline
            actionsHtml += `
                <button class="btn btn-success accept-exchange-btn" data-exchange-id="${exchange.id}">
                    <i class="fas fa-check"></i>
                    <span>Accept</span>
                </button>
                <button class="btn btn-outline decline-exchange-btn" data-exchange-id="${exchange.id}">
                    <i class="fas fa-times"></i>
                    <span>Decline</span>
                </button>
            `;
        } else {
            // Requester can delete
            actionsHtml += `
                <button class="btn delete-exchange-btn" data-exchange-id="${exchange.id}">
                    <i class="fas fa-trash"></i>
                    <span>Delete</span>
                </button>
            `;
        }
    } else if (exchange.status === 'accepted' || exchange.status === 'in-progress') {
        actionsHtml += `
            <button class="btn btn-outline">
                <i class="fas fa-calendar"></i>
                <span>Schedule Session</span>
            </button>
            <button class="btn btn-success complete-exchange-btn" data-exchange-id="${exchange.id}">
                <i class="fas fa-check-circle"></i>
                <span>Mark Complete</span>
            </button>
        `;
    } else if (exchange.status === 'completed') {
        actionsHtml += `
            <button class="btn btn-primary leave-review-btn" data-exchange-id="${exchange.id}" style="background: #7c3aed;">
                <i class="fas fa-star"></i>
                <span>Leave Review</span>
            </button>
        `;
    }

    const messageHtml = exchange.message ? `
        <div class="exchange-message">
            <h5>Message:</h5>
            <p>"${exchange.message}"</p>
        </div>
    ` : '';

    return `
        <div class="exchange-card" data-exchange-id="${exchange.id}">
            <div class="exchange-content">
                <div class="exchange-header">
                    <div class="exchange-status">
                        <i class="${statusIcon} status-icon ${statusClass}"></i>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                    <div class="exchange-date">${formatDateShort(exchange.createdAt)}</div>
                </div>
                
                <div class="exchange-details">
                    <div class="exchange-partner">
                        <img src="${partner.avatar}" alt="${partner.name}" class="partner-avatar">
                        <div class="partner-info">
                            <h3>${partner.name}</h3>
                            <p>${partner.location}</p>
                            <p class="last-active">Last active: ${getRelativeTime(partner.lastActive)}</p>
                        </div>
                    </div>
                    
                    <div class="exchange-skills">
                        <div class="skill-exchange-item">
                            <span>You offer:</span>
                            <span class="skill-tag offered">${exchange.skillOffered.name}</span>
                        </div>
                        <div class="skill-exchange-item">
                            <span>You learn:</span>
                            <span class="skill-tag wanted">${exchange.skillWanted.name}</span>
                        </div>
                    </div>
                </div>
                
                ${messageHtml}
                
                <div class="exchange-actions">
                    ${actionsHtml}
                </div>
            </div>
        </div>
    `;
}

// Create enhanced skill item HTML
function createSkillItem(skill, type, isEditing = false) {
    const levelBadge = type === 'offered' ? 
        `<span class="skill-level-badge">${skill.level}</span>` : 
        `<span class="skill-level-badge skill-wanted-badge">Want to learn</span>`;
    
    const statusBadge = skill.status && skill.status !== 'approved' ? 
        `<span class="skill-status-badge ${skill.status}">${skill.status}</span>` : '';
    
    const removeButton = isEditing ? 
        `<button class="remove-skill-btn" data-skill-id="${skill.id}" data-type="${type}">
            <i class="fas fa-trash"></i>
        </button>` : '';

    const skillItemClass = skill.status && skill.status !== 'approved' ? 
        `skill-item ${skill.status}` : 'skill-item';

    return `
        <div class="${skillItemClass}" data-skill-id="${skill.id}">
            <div class="skill-item-header">
                <div class="skill-item-info">
                    <div class="skill-item-title">
                        <span class="skill-item-name">${skill.name}</span>
                        ${levelBadge}
                        <span class="skill-category-badge">${skill.category}</span>
                        ${statusBadge}
                    </div>
                    <p class="skill-description">${skill.description}</p>
                </div>
                ${removeButton}
            </div>
        </div>
    `;
}

// Create add skill form HTML
function createAddSkillForm(type) {
    const categoriesOptions = categories.map(category => 
        `<option value="${category}">${category}</option>`
    ).join('');
    
    const levelOptions = type === 'offered' ? 
        ['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(level => 
            `<option value="${level}">${level}</option>`
        ).join('') : '';
    
    const levelField = type === 'offered' ? `
        <div class="form-group">
            <label>Skill Level</label>
            <select id="new-skill-level">
                ${levelOptions}
            </select>
        </div>
    ` : '';

    return `
        <div class="form-group">
            <label>Skill Name</label>
            <input type="text" id="new-skill-name" placeholder="Enter skill name">
        </div>
        <div class="form-group">
            <label>Category</label>
            <select id="new-skill-category">
                <option value="">Select category</option>
                ${categoriesOptions}
            </select>
        </div>
        ${levelField}
        <div class="form-group">
            <label>Description</label>
            <textarea id="new-skill-description" placeholder="Describe your ${type === 'offered' ? 'expertise in' : 'interest in learning'} this skill" rows="3"></textarea>
        </div>
        <div class="form-actions">
            <button class="btn btn-primary" id="save-skill-btn" data-type="${type}">Add Skill</button>
            <button class="btn btn-secondary" id="cancel-skill-btn">Cancel</button>
        </div>
    `;
}

// Create enhanced user modal content HTML
function createUserModalContent(user) {
    const skillsOfferedHtml = user.skillsOffered.map(skill => 
        `<div class="skill-item">
            <div class="skill-item-info">
                <div class="skill-item-title">
                    <span class="skill-item-name">${skill.name}</span>
                    <span class="skill-level-badge">${skill.level}</span>
                    <span class="skill-category-badge">${skill.category}</span>
                </div>
                <p class="skill-description">${skill.description}</p>
            </div>
        </div>`
    ).join('');
    
    const skillsWantedHtml = user.skillsWanted.map(skill => 
        `<div class="skill-item">
            <div class="skill-item-info">
                <div class="skill-item-title">
                    <span class="skill-item-name">${skill.name}</span>
                    <span class="skill-level-badge skill-wanted-badge">Want to learn</span>
                    <span class="skill-category-badge">${skill.category}</span>
                </div>
                <p class="skill-description">${skill.description}</p>
            </div>
        </div>`
    ).join('');

    const locationDisplay = user.showLocation ? user.location : 'Location hidden';
    const joinedDate = formatDate(user.joinedDate);
    const lastActive = getRelativeTime(user.lastActive);

    return `
        <div class="user-header" style="margin-bottom: 1.5rem;">
            <img src="${user.avatar}" alt="${user.name}" class="user-avatar">
            <div class="user-info">
                <h3 class="user-name">${user.name}</h3>
                <div class="user-rating">
                    <i class="fas fa-star"></i>
                    <span>${user.rating}</span>
                    <span class="user-rating-text">(${user.exchangesCompleted} exchanges)</span>
                </div>
                <div class="user-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${locationDisplay}</span>
                </div>
                <div class="user-meta">
                    <p><strong>Joined:</strong> ${joinedDate}</p>
                    <p><strong>Last active:</strong> ${lastActive}</p>
                </div>
            </div>
        </div>
        
        <p class="user-bio" style="margin-bottom: 1.5rem;">${user.bio}</p>
        
        <div style="margin-bottom: 1.5rem;">
            <h4 style="margin-bottom: 0.75rem; font-weight: 600;">Availability</h4>
            <div class="skills-tags">
                ${user.availability.map(time => `<span class="skill-tag" style="background: #fef3c7; color: #92400e;">${time}</span>`).join('')}
            </div>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <h4 style="margin-bottom: 0.75rem; font-weight: 600;">Skills Offered</h4>
            <div class="skills-list">
                ${skillsOfferedHtml}
            </div>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <h4 style="margin-bottom: 0.75rem; font-weight: 600;">Looking to Learn</h4>
            <div class="skills-list">
                ${skillsWantedHtml}
            </div>
        </div>
        
        <div class="user-actions">
            <button class="btn btn-primary start-exchange-btn auth-required" data-user-id="${user.id}">
                Start Exchange
            </button>
        </div>
    `;
}

// Create admin user card HTML
function createAdminUserCard(user) {
    const statusClass = user.status === 'banned' ? 'banned' : '';
    const statusText = user.status === 'banned' ? 'Banned' : 'Active';
    const joinedDate = formatDate(user.joinedDate);
    const lastActive = getRelativeTime(user.lastActive);

    let actionsHtml = '';
    if (user.status === 'active') {
        actionsHtml = `
            <button class="btn btn-warning ban-user-btn" data-user-id="${user.id}">
                <i class="fas fa-ban"></i>
                <span>Ban User</span>
            </button>
        `;
    } else if (user.status === 'banned') {
        actionsHtml = `
            <button class="btn btn-success unban-user-btn" data-user-id="${user.id}">
                <i class="fas fa-check"></i>
                <span>Unban User</span>
            </button>
        `;
    }

    return `
        <div class="admin-user-card ${statusClass}" data-user-id="${user.id}">
            <div class="admin-card-header">
                <div class="admin-card-info">
                    <h4>${user.name}</h4>
                    <p>Email: ${user.email}</p>
                    <p>Status: ${statusText}</p>
                    <p>Joined: ${joinedDate}</p>
                    <p>Last active: ${lastActive}</p>
                    <p>Exchanges: ${user.exchangesCompleted}</p>
                    <p>Rating: ${user.rating}</p>
                </div>
                <div class="admin-card-actions">
                    <button class="btn btn-outline view-user-btn" data-user-id="${user.id}">
                        <i class="fas fa-eye"></i>
                        <span>View</span>
                    </button>
                    ${actionsHtml}
                </div>
            </div>
        </div>
    `;
}

// Create admin swap card HTML
function createAdminSwapCard(exchange) {
    const statusIcon = getStatusIcon(exchange.status);
    const statusText = getStatusText(exchange.status);
    const statusClass = exchange.status.replace('-', '');
    const createdDate = formatDateTime(exchange.createdAt);

    return `
        <div class="admin-swap-card" data-exchange-id="${exchange.id}">
            <div class="admin-card-header">
                <div class="admin-card-info">
                    <h4>Exchange #${exchange.id}</h4>
                    <p><strong>Requester:</strong> ${exchange.requester.name}</p>
                    <p><strong>Provider:</strong> ${exchange.provider.name}</p>
                    <p><strong>Skill Offered:</strong> ${exchange.skillOffered.name}</p>
                    <p><strong>Skill Wanted:</strong> ${exchange.skillWanted.name}</p>
                    <p><strong>Status:</strong> <span class="status-badge ${statusClass}">${statusText}</span></p>
                    <p><strong>Created:</strong> ${createdDate}</p>
                </div>
                <div class="admin-card-actions">
                    <button class="btn btn-outline view-exchange-btn" data-exchange-id="${exchange.id}">
                        <i class="fas fa-eye"></i>
                        <span>View Details</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Create admin skill card HTML
function createAdminSkillCard(skill) {
    const statusClass = skill.status || 'approved';
    const statusText = skill.status || 'Approved';
    const createdDate = formatDateTime(skill.createdAt);

    let actionsHtml = '';
    if (skill.status === 'pending') {
        actionsHtml = `
            <button class="btn btn-success approve-skill-btn" data-skill-id="${skill.id}">
                <i class="fas fa-check"></i>
                <span>Approve</span>
            </button>
            <button class="btn btn-danger reject-skill-btn" data-skill-id="${skill.id}">
                <i class="fas fa-times"></i>
                <span>Reject</span>
            </button>
        `;
    } else if (skill.status === 'rejected') {
        actionsHtml = `
            <button class="btn btn-success approve-skill-btn" data-skill-id="${skill.id}">
                <i class="fas fa-check"></i>
                <span>Approve</span>
            </button>
        `;
    }

    return `
        <div class="admin-skill-card" data-skill-id="${skill.id}">
            <div class="admin-card-header">
                <div class="admin-card-info">
                    <h4>${skill.name}</h4>
                    <p><strong>Category:</strong> ${skill.category}</p>
                    <p><strong>Level:</strong> ${skill.level}</p>
                    <p><strong>Description:</strong> ${skill.description}</p>
                    <p><strong>Status:</strong> <span class="status-badge ${statusClass}">${statusText}</span></p>
                    <p><strong>Created:</strong> ${createdDate}</p>
                </div>
                <div class="admin-card-actions">
                    ${actionsHtml}
                </div>
            </div>
        </div>
    `;
}

// Create admin message card HTML
function createAdminMessageCard(message) {
    const createdDate = formatDateTime(message.createdAt);
    const expiresDate = message.expiresAt ? formatDateTime(message.expiresAt) : 'Never';
    const statusText = message.isActive ? 'Active' : 'Inactive';

    return `
        <div class="admin-message-card" data-message-id="${message.id}">
            <div class="admin-card-header">
                <div class="admin-card-info">
                    <h4>${message.title}</h4>
                    <p><strong>Type:</strong> ${message.type}</p>
                    <p><strong>Content:</strong> ${message.content}</p>
                    <p><strong>Status:</strong> ${statusText}</p>
                    <p><strong>Created:</strong> ${createdDate}</p>
                    <p><strong>Expires:</strong> ${expiresDate}</p>
                </div>
                <div class="admin-card-actions">
                    <button class="btn btn-outline edit-message-btn" data-message-id="${message.id}">
                        <i class="fas fa-edit"></i>
                        <span>Edit</span>
                    </button>
                    <button class="btn btn-danger delete-message-btn" data-message-id="${message.id}">
                        <i class="fas fa-trash"></i>
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Create review item HTML
function createReviewItem(review) {
    const reviewDate = formatDateShort(review.createdAt);
    const starsHtml = Array.from({length: 5}, (_, i) => 
        `<i class="fas fa-star" style="color: ${i < review.rating ? '#fbbf24' : '#e5e7eb'}"></i>`
    ).join('');

    return `
        <div class="review-item">
            <div class="review-header">
                <span class="review-author">${review.reviewerName}</span>
                <div class="review-rating">
                    ${starsHtml}
                </div>
            </div>
            <p class="review-comment">${review.comment}</p>
            <div class="review-date">${reviewDate}</div>
        </div>
    `;
}

// Create loading spinner HTML
function createLoadingSpinner(text = 'Loading...') {
    return `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>${text}</span>
        </div>
    `;
}

// Create empty state HTML
function createEmptyState(icon, title, description, actionButton = '') {
    return `
        <div class="no-results">
            <div class="no-results-icon">
                <i class="${icon}"></i>
            </div>
            <h3>${title}</h3>
            <p>${description}</p>
            ${actionButton}
        </div>
    `;
}