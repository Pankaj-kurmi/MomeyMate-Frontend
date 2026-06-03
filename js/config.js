
// ==================== API CONFIGURATION ====================
const API_CONFIG = {
    // Base URL - Update this to your backend URL
    BASE_URL: 'http://localhost:9090/api/v1.0',
    
    // API Endpoints
    ENDPOINTS: {
        // Authentication
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            REFRESH: '/auth/refresh'
        },
        
        // Dashboard
        DASHBOARD: {
            SUMMARY: '/dashboard/summary',
            RECENT_TRANSACTIONS: '/dashboard/recent-transactions'
        },
        
        // Expenses
        EXPENSES: {
            GET_ALL: '/expenses',
            CREATE: '/expenses',
            UPDATE: '/expenses/:id',
            DELETE: '/expenses/:id',
            FILTER: '/expenses/filter'
        },
        
        // Income
        INCOME: {
            GET_ALL: '/income',
            CREATE: '/income',
            UPDATE: '/income/:id',
            DELETE: '/income/:id'
        },
        
        // Categories
        CATEGORIES: {
            GET_ALL: '/categories',
            CREATE: '/categories',
            UPDATE: '/categories/:id',
            DELETE: '/categories/:id'
        },
        
        // Analytics
        ANALYTICS: {
            MONTHLY_SUMMARY: '/analytics/monthly-summary',
            CATEGORY_BREAKDOWN: '/analytics/category-breakdown'
        },
        
        // Credit
        CREDIT: {
            ACCOUNTS: '/credit/accounts',
            CREATE_ACCOUNT: '/credit/accounts',
            GET_SCORE: '/credit/score',
            PAYMENTS: '/credit/payments',
            CREATE_PAYMENT: '/credit/payments',
            SIMULATOR: '/credit/simulator'
        },
        
        // Financial Health
        HEALTH: {
            SCORE: '/financial-health/score',
            INDICATORS: '/financial-health/indicators'
        },
        
        // Alerts
        ALERTS: {
            GET_ALL: '/alerts'
        },
        
        // Profile
        PROFILE: {
            GET: '/profile',
            UPDATE: '/profile'
        }
    },
    
    // Timeout (in milliseconds)
    TIMEOUT: 30000,
    
    // Cache settings
    CACHE_DURATION: 5 * 60 * 1000 // 5 minutes
};

// ==================== STORAGE KEYS ====================
const STORAGE_KEYS = {
    TOKEN: 'mm_auth_token',
    USER: 'mm_user_info',
    PREFERENCES: 'mm_preferences',
    CACHE: 'mm_cache_'
};

// ==================== APP CONFIG ====================
const APP_CONFIG = {
    CURRENCY: {
        DEFAULT: 'INR',
        SYMBOL: {
            'INR': '₹',
            'USD': '$',
            'EUR': '€'
        }
    },
    
    DATE_FORMAT: 'dd-MM-yyyy',
    
    PAGINATION: {
        PAGE_SIZE: 10,
        MAX_PAGES: 5
    }
};

// ==================== VALIDATION RULES ====================
const VALIDATION = {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_MIN_LENGTH: 6,
    PHONE_REGEX: /^[0-9]{10}$/,
    AMOUNT_MIN: 0,
    AMOUNT_MAX: 999999999
};

// ==================== EXPENSE CATEGORIES ==================== 
const DEFAULT_CATEGORIES = [
    { name: 'Food & Dining', type: 'EXPENSE', icon: '🍔' },
    { name: 'Transportation', type: 'EXPENSE', icon: '🚗' },
    { name: 'Shopping', type: 'EXPENSE', icon: '🛍️' },
    { name: 'Entertainment', type: 'EXPENSE', icon: '🎬' },
    { name: 'Utilities', type: 'EXPENSE', icon: '💡' },
    { name: 'Healthcare', type: 'EXPENSE', icon: '🏥' },
    { name: 'Education', type: 'EXPENSE', icon: '📚' },
    { name: 'Other', type: 'EXPENSE', icon: '📌' },
    { name: 'Salary', type: 'INCOME', icon: '💼' },
    { name: 'Freelance', type: 'INCOME', icon: '💻' },
    { name: 'Investment', type: 'INCOME', icon: '📈' }
];