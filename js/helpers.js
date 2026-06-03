/**
 * ==================== HELPER FUNCTIONS ====================
 * Common utility functions used throughout the application
 */

// ==================== UI HELPERS ====================

/**
 * Show alert message
 */
function showAlert(message, type = 'info') {
    const container = document.getElementById('alert-container');
    if (!container) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    const styles = {
        'success': { bg: '#4caf50', border: '#45a049' },
        'danger': { bg: '#f44336', border: '#da190b' },
        'warning': { bg: '#ff9800', border: '#e68900' },
        'info': { bg: '#2196f3', border: '#0b7dda' }
    };

    const style = styles[type] || styles.info;
    alert.style.cssText = `
        padding: 12px 16px;
        margin-bottom: 10px;
        border-radius: 4px;
        background-color: ${style.bg};
        color: white;
        border-left: 4px solid ${style.border};
        animation: slideIn 0.3s ease-in-out;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;

    container.appendChild(alert);

    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease-in-out';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

/**
 * Show/hide loading indicator
 */
function showLoading(show = true) {
    const loader = document.getElementById('loading-indicator');
    if (loader) {
        if (show) {
            loader.classList.remove('hidden');
        } else {
            loader.classList.add('hidden');
        }
    }
}

// ==================== FORM VALIDATION ====================

/**
 * Validate email format
 */
function validateEmail(email) {
    return VALIDATION.EMAIL_REGEX.test(email);
}

/**
 * Validate password
 */
function validatePassword(password) {
    return password && password.length >= VALIDATION.PASSWORD_MIN_LENGTH;
}

/**
 * Validate phone number
 */
function validatePhone(phone) {
    return VALIDATION.PHONE_REGEX.test(phone);
}

/**
 * Validate amount
 */
function validateAmount(amount) {
    const num = parseFloat(amount);
    return !isNaN(num) && num >= VALIDATION.AMOUNT_MIN && num <= VALIDATION.AMOUNT_MAX;
}

// ==================== STORAGE HELPERS ====================

/**
 * Get user info from storage
 */
function getUserInfo() {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
}

/**
 * Set user info in storage
 */
function setUserInfo(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

/**
 * Clear all user data
 */
function clearUserData() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
}

// ==================== FORMATTING HELPERS ====================

/**
 * Format currency
 */
function formatCurrency(amount, currency = 'INR') {
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return formatter.format(amount || 0);
}

/**
 * Format date
 */
function formatDate(dateString) {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Format date and time
 */
function formatDateTime(dateString) {
    if (!dateString) return '--';
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
 * Format number with commas
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ==================== PAGE NAVIGATION ====================

/**
 * Switch between auth pages
 */
function switchAuthPage(page) {
    const loginPage = document.getElementById('login-page');
    const registerPage = document.getElementById('register-page');

    if (page === 'register') {
        loginPage?.classList.remove('active');
        registerPage?.classList.add('active');
    } else {
        registerPage?.classList.remove('active');
        loginPage?.classList.add('active');
    }
}

/**
 * Navigate to different dashboard page
 */
function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(p => {
        p.classList.remove('active');
    });

    // Show selected page
    const selectedPage = document.getElementById(page + '-page');
    if (selectedPage) {
        selectedPage.classList.add('active');
    }

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-page="${page}"]`)?.classList.add('active');

    // Update page title
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        const titles = {
            'dashboard': 'Dashboard',
            'expenses': 'Expense Management',
            'income': 'Income Management',
            'categories': 'Category Management',
            'analytics': 'Financial Analytics',
            'credit': 'Credit Management',
            'health': 'Financial Health',
            'alerts': 'Financial Alerts',
            'profile': 'User Profile'
        };
        pageTitle.textContent = titles[page] || page;
    }
}

// ==================== MODAL HELPERS ====================

/**
 * Open modal
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

/**
 * Close modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Close all modals
 */
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
}

// ==================== ERROR HANDLING ====================

/**
 * Handle API errors gracefully
 */
function handleApiError(error) {
    console.error('API Error:', error);

    if (error.message === 'Request timeout') {
        showAlert('Request timeout. Please check your connection.', 'warning');
    } else if (error.message.includes('401')) {
        showAlert('Session expired. Please login again.', 'warning');
        setTimeout(() => {
            api.clearToken();
            showAuthPage();
        }, 1500);
    } else if (error.message.includes('403')) {
        showAlert('You do not have permission to perform this action.', 'warning');
    } else if (error.message.includes('404')) {
        showAlert('Resource not found.', 'warning');
    } else if (error.message.includes('500')) {
        showAlert('Server error. Please try again later.', 'danger');
    } else {
        showAlert(error.message || 'An error occurred. Please try again.', 'danger');
    }
}

// ==================== DATA FORMATTING ====================

/**
 * Format transaction data for display
 */
function formatTransaction(transaction) {
    return {
        ...transaction,
        formattedDate: formatDate(transaction.date),
        formattedAmount: formatCurrency(transaction.amount)
    };
}

/**
 * Format list of transactions
 */
function formatTransactionList(transactions) {
    return (transactions || []).map(formatTransaction);
}
