// Enhanced mock data for the SkillSwap platform with admin features

const categories = [
    'Programming', 'Design', 'Marketing', 'Business', 'Languages', 
    'Music', 'Photography', 'Writing', 'Cooking', 'Fitness',
    'Data Science', 'Finance', 'Education', 'Healthcare', 'Engineering'
];

const skills = [
    {
        id: '1',
        name: 'React Development',
        category: 'Programming',
        level: 'Advanced',
        description: 'Building modern web applications with React and TypeScript',
        status: 'approved',
        createdAt: '2024-01-15T10:00:00Z'
    },
    {
        id: '2',
        name: 'UI/UX Design',
        category: 'Design',
        level: 'Expert',
        description: 'Creating beautiful and intuitive user interfaces',
        status: 'approved',
        createdAt: '2024-01-16T10:00:00Z'
    },
    {
        id: '3',
        name: 'Digital Marketing',
        category: 'Marketing',
        level: 'Intermediate',
        description: 'Social media strategy and content marketing',
        status: 'approved',
        createdAt: '2024-01-17T10:00:00Z'
    },
    {
        id: '4',
        name: 'Spanish Conversation',
        category: 'Languages',
        level: 'Expert',
        description: 'Native Spanish speaker offering conversation practice',
        status: 'approved',
        createdAt: '2024-01-18T10:00:00Z'
    },
    {
        id: '5',
        name: 'Photography',
        category: 'Photography',
        level: 'Advanced',
        description: 'Portrait and landscape photography techniques',
        status: 'approved',
        createdAt: '2024-01-19T10:00:00Z'
    },
    {
        id: '6',
        name: 'Python Programming',
        category: 'Programming',
        level: 'Expert',
        description: 'Data science and machine learning with Python',
        status: 'approved',
        createdAt: '2024-01-20T10:00:00Z'
    },
    {
        id: '7',
        name: 'Inappropriate Skill',
        category: 'Programming',
        level: 'Beginner',
        description: 'This is spam content that should be rejected',
        status: 'pending',
        createdAt: '2024-01-21T10:00:00Z'
    }
];

const users = [
    {
        id: '1',
        name: 'Sarah Chen',
        email: 'sarah@example.com',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        bio: 'Full-stack developer passionate about React and UX design. Love sharing knowledge!',
        location: 'San Francisco, CA',
        skillsOffered: [skills[0], skills[1]],
        skillsWanted: [skills[3], skills[4]],
        rating: 4.9,
        exchangesCompleted: 15,
        joinedDate: '2023-01-15',
        availability: ['Weekends', 'Evenings'],
        isPublic: true,
        showLocation: true,
        emailNotifications: true,
        status: 'active',
        lastActive: '2024-01-25T10:00:00Z',
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
        id: '2',
        name: 'Miguel Rodriguez',
        email: 'miguel@example.com',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        bio: 'Marketing specialist and native Spanish speaker. Always eager to learn new skills!',
        location: 'Barcelona, Spain',
        skillsOffered: [skills[2], skills[3]],
        skillsWanted: [skills[0], skills[5]],
        rating: 4.8,
        exchangesCompleted: 12,
        joinedDate: '2023-03-20',
        availability: ['Weekdays', 'Evenings'],
        isPublic: true,
        showLocation: true,
        emailNotifications: true,
        status: 'active',
        lastActive: '2024-01-24T15:30:00Z',
        reviews: []
    },
    {
        id: '3',
        name: 'Alex Thompson',
        email: 'alex@example.com',
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        bio: 'Professional photographer and Python enthusiast. Love capturing moments and solving problems!',
        location: 'London, UK',
        skillsOffered: [skills[4], skills[5]],
        skillsWanted: [skills[1], skills[2]],
        rating: 4.7,
        exchangesCompleted: 8,
        joinedDate: '2023-06-10',
        availability: ['Weekends'],
        isPublic: true,
        showLocation: true,
        emailNotifications: false,
        status: 'active',
        lastActive: '2024-01-23T09:15:00Z',
        reviews: []
    },
    {
        id: '4',
        name: 'Spam User',
        email: 'spam@example.com',
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        bio: 'This is a spam account with inappropriate content',
        location: 'Unknown',
        skillsOffered: [],
        skillsWanted: [],
        rating: 1.0,
        exchangesCompleted: 0,
        joinedDate: '2024-01-20',
        availability: [],
        isPublic: false,
        showLocation: false,
        emailNotifications: false,
        status: 'banned',
        lastActive: '2024-01-20T12:00:00Z',
        banReason: 'Spam and inappropriate content',
        banDate: '2024-01-21T10:00:00Z',
        banDuration: 'permanent',
        reviews: []
    }
];

let exchanges = [
    {
        id: '1',
        requester: users[0],
        provider: users[1],
        skillOffered: skills[0],
        skillWanted: skills[3],
        status: 'in-progress',
        createdAt: '2024-01-15T10:00:00Z',
        acceptedAt: '2024-01-16T14:30:00Z',
        message: 'Hi! I would love to learn Spanish from you. I can help you with React development in return.'
    },
    {
        id: '2',
        requester: users[2],
        provider: users[0],
        skillOffered: skills[4],
        skillWanted: skills[1],
        status: 'completed',
        createdAt: '2024-01-10T14:30:00Z',
        acceptedAt: '2024-01-11T09:00:00Z',
        completedAt: '2024-01-20T16:00:00Z',
        message: 'Looking forward to learning UI/UX design from you!'
    },
    {
        id: '3',
        requester: users[1],
        provider: users[2],
        skillOffered: skills[2],
        skillWanted: skills[5],
        status: 'pending',
        createdAt: '2024-01-22T11:00:00Z',
        message: 'Interested in learning Python for data analysis. Can teach digital marketing strategies.'
    },
    {
        id: '4',
        requester: users[0],
        provider: users[2],
        skillOffered: skills[1],
        skillWanted: skills[4],
        status: 'cancelled',
        createdAt: '2024-01-05T09:00:00Z',
        cancelledAt: '2024-01-08T12:00:00Z',
        message: 'Would like to improve my photography skills.'
    }
];

// Current user profile (starts as null, set after login)
let currentUser = null;
let isAuthenticated = false;

// Platform messages
const platformMessages = [
    {
        id: '1',
        type: 'info',
        title: 'Welcome to SkillSwap!',
        content: 'Start exchanging skills with professionals worldwide.',
        createdAt: '2024-01-01T00:00:00Z',
        expiresAt: '2024-12-31T23:59:59Z',
        isActive: true,
        createdBy: 'admin'
    },
    {
        id: '2',
        type: 'maintenance',
        title: 'Scheduled Maintenance',
        content: 'Platform will be under maintenance on Sunday 2AM-4AM UTC.',
        createdAt: '2024-01-20T10:00:00Z',
        expiresAt: '2024-01-28T23:59:59Z',
        isActive: false,
        createdBy: 'admin'
    }
];

// User reports and feedback
const userReports = [
    {
        id: '1',
        reporterId: '2',
        reportedUserId: '4',
        reason: 'spam',
        description: 'User is posting inappropriate content and spam messages',
        status: 'resolved',
        createdAt: '2024-01-20T15:00:00Z',
        resolvedAt: '2024-01-21T10:00:00Z',
        resolvedBy: 'admin'
    }
];

// Platform statistics
const platformStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    bannedUsers: users.filter(u => u.status === 'banned').length,
    totalExchanges: exchanges.length,
    completedExchanges: exchanges.filter(e => e.status === 'completed').length,
    pendingExchanges: exchanges.filter(e => e.status === 'pending').length,
    totalSkills: skills.length,
    approvedSkills: skills.filter(s => s.status === 'approved').length,
    pendingSkills: skills.filter(s => s.status === 'pending').length,
    rejectedSkills: skills.filter(s => s.status === 'rejected').length,
    averageRating: 4.8,
    successRate: 95
};

// Activity logs
const activityLogs = [
    {
        id: '1',
        userId: '1',
        action: 'profile_updated',
        details: 'Updated bio and availability',
        timestamp: '2024-01-25T10:00:00Z'
    },
    {
        id: '2',
        userId: '2',
        action: 'exchange_created',
        details: 'Created exchange request for Python programming',
        timestamp: '2024-01-22T11:00:00Z'
    },
    {
        id: '3',
        userId: 'admin',
        action: 'user_banned',
        details: 'Banned user for spam and inappropriate content',
        timestamp: '2024-01-21T10:00:00Z'
    }
];

// Notification system
let notifications = [
    {
        id: '1',
        userId: '1',
        type: 'exchange_request',
        title: 'New Exchange Request',
        message: 'Miguel Rodriguez wants to exchange Digital Marketing for React Development',
        isRead: false,
        createdAt: '2024-01-22T11:00:00Z'
    },
    {
        id: '2',
        userId: '1',
        type: 'review_received',
        title: 'New Review',
        message: 'You received a 5-star review from Alex Thompson',
        isRead: false,
        createdAt: '2024-01-21T16:00:00Z'
    }
];

// Conversations for messaging
let conversations = [
    {
        id: '1',
        participants: ['1', '2'],
        lastMessage: {
            id: 'msg1',
            senderId: '2',
            content: 'Hi! I\'d love to learn React from you. When would be a good time to start?',
            timestamp: '2024-01-25T14:30:00Z',
            read: false
        },
        messages: [
            {
                id: 'msg1',
                senderId: '2',
                content: 'Hi! I\'d love to learn React from you. When would be a good time to start?',
                timestamp: '2024-01-25T14:30:00Z',
                read: false
            }
        ],
        exchangeId: '1',
        createdAt: '2024-01-25T14:30:00Z'
    },
    {
        id: '2',
        participants: ['1', '3'],
        lastMessage: {
            id: 'msg2',
            senderId: '1',
            content: 'Thank you for the great photography session!',
            timestamp: '2024-01-24T16:45:00Z',
            read: true
        },
        messages: [
            {
                id: 'msg2',
                senderId: '1',
                content: 'Thank you for the great photography session!',
                timestamp: '2024-01-24T16:45:00Z',
                read: true
            },
            {
                id: 'msg3',
                senderId: '3',
                content: 'You\'re welcome! Happy to help anytime.',
                timestamp: '2024-01-24T17:00:00Z',
                read: true
            }
        ],
        exchangeId: '2',
        createdAt: '2024-01-24T16:45:00Z'
    }
];

// Skill moderation queue
const skillModerationQueue = skills.filter(skill => skill.status === 'pending');