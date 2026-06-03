
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <span>${message}</span>
    `;
    
    alertContainer.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        alertDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
}

/**
 * Show loading indicator
 */
function showLoading(show = true) {
    const indicator = document.getElementById('loading-indicator');
    if (show) {
        indicator.classList.remove('hidden');
    } else {
        indicator.classList.add('hidden');
    }
}

/**
 * Navigate to a page
 */
function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(el => {
        el.classList.remove('active');
    });
    
    // Remove active from nav items
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show selected page
    const pageEl = document.getElementById(`${page}-page`);
    if (pageEl) {
        pageEl.classList.add('active');
    }
    
    // Mark nav item as active
    const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        expenses: 'Expenses',
        income: 'Income',
        categories: 'Categories',
        analytics: 'Analytics',
        credit: 'Credit Management',
        health: 'Financial Health',
        alerts: 'Alerts',
        profile: 'Profile'
    };
    
    document.getElementById('page-title').textContent = titles[page] || 'Page';
    
    // Load page data
    loadPageData(page);
    
    // Close mobile menu
    document.getElementById('app-container').classList.remove('menu-open');
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.remove('open');
    }
}

/**
 * Load page-specific data
 */
async function loadPageData(page) {
    try {
        showLoading(true);
        
        switch(page) {
            case 'dashboard':
                await loadDashboard();
                break;
            case 'expenses':
                await loadExpenses();
                break;
            case 'income':
                await loadIncome();
                break;
            case 'categories':
                await loadCategories();
                break;
            case 'analytics':
                await loadAnalytics();
                break;
            case 'credit':
                await loadCredit();
                break;
            case 'health':
                await loadHealth();
                break;
            case 'alerts':
                await loadAlerts();
                break;
            case 'profile':
                await loadProfile();
                break;
        }
    } catch (error) {
        console.error('Error loading page data:', error);
        showAlert('Error loading page data', 'danger');
    } finally {
        showLoading(false);
    }
}

/**
 * Format currency
 */
function formatCurrency(amount, currency = 'INR') {
    const symbol = APP_CONFIG.CURRENCY.SYMBOL[currency] || '₹';
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
}

/**
 * Format date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Format date time
 */
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Validate email
 */
function validateEmail(email) {
    return VALIDATION.EMAIL_REGEX.test(email);
}

/**
 * Validate password
 */
function validatePassword(password) {
    return password.length >= VALIDATION.PASSWORD_MIN_LENGTH;
}

/**
 * Validate amount
 */
function validateAmount(amount) {
    const num = parseFloat(amount);
    return num >= VALIDATION.AMOUNT_MIN && num <= VALIDATION.AMOUNT_MAX;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

/**
 * Get first day of month
 */
function getFirstDayOfMonth() {
    const today = new Date();
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    return first.toISOString().split('T')[0];
}

/**
 * Get last day of month
 */
function getLastDayOfMonth() {
    const today = new Date();
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return last.toISOString().split('T')[0];
}

/**
 * Open modal
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Close modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        
        // Reset form if exists
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

/**
 * Switch auth page
 */
function switchAuthPage(page) {
    document.querySelectorAll('.auth-page').forEach(el => {
        el.classList.remove('active');
    });
    
    const pageEl = document.getElementById(`${page}-page`);
    if (pageEl) {
        pageEl.classList.add('active');
    }
}

/**
 * Get user info from localStorage
 */
function getUserInfo() {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
}

/**
 * Set user info in localStorage
 */
function setUserInfo(userInfo) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userInfo));
}

/**
 * Debounce function
 */
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

/**
 * Throttle function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Get month name
 */
function getMonthName(monthIndex) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthIndex];
}

/**
 * Calculate percentage
 */
function calculatePercentage(value, total) {
    if (total === 0) return 0;
    return (value / total * 100).toFixed(2);
}

/**
 * Toggle sidebar on mobile
 */
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
    
    // Close sidebar when clicking nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });
});
