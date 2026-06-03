
// ==================== API CLASS ====================
class APIHandler {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.timeout = API_CONFIG.TIMEOUT;
        this.cache = new Map();
    }

    /**
     * Generic fetch wrapper with error handling
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const method = options.method || 'GET';
        
        // Build request config
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            timeout: this.timeout
        };

        // Add authorization token
        const token = this.getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Add body for non-GET requests
        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        try {
            // Check cache for GET requests
            if (method === 'GET' && options.useCache) {
                const cached = this.getFromCache(url);
                if (cached) {
                    return cached;
                }
            }

            const response = await Promise.race([
                fetch(url, config),
                this.createTimeout(this.timeout)
            ]);

            if (!response.ok) {
                // Handle specific error codes
                if (response.status === 401) {
                    this.handleUnauthorized();
                } else if (response.status === 403) {
                    throw new Error('Access Forbidden');
                } else if (response.status === 404) {
                    throw new Error('Resource not found');
                } else if (response.status === 500) {
                    throw new Error('Server Error');
                }
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const data = await response.json();

            // Cache successful GET responses
            if (method === 'GET' && options.useCache) {
                this.saveToCache(url, data);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * Create timeout promise
     */
    createTimeout(ms) {
        return new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), ms)
        );
    }

    /**
     * Get auth token from localStorage
     */
    getToken() {
        return localStorage.getItem(STORAGE_KEYS.TOKEN);
    }

    /**
     * Set auth token in localStorage
     */
    setToken(token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    }

    /**
     * Clear auth token
     */
    clearToken() {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }

    /**
     * Cache management
     */
    getFromCache(key) {
        const item = this.cache.get(key);
        if (item && item.expiry > Date.now()) {
            return item.data;
        }
        this.cache.delete(key);
        return null;
    }

    saveToCache(key, data) {
        this.cache.set(key, {
            data,
            expiry: Date.now() + API_CONFIG.CACHE_DURATION
        });
    }

    clearCache() {
        this.cache.clear();
    }

    /**
     * Handle unauthorized access
     */
    handleUnauthorized() {
        this.clearToken();
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = '/';
        showAlert('Session expired. Please login again.', 'warning');
    }

    // ==================== AUTHENTICATION ====================
    async login(email, password) {
        return this.request(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
            method: 'POST',
            body: { email, password }
        });
    }

    async register(userData) {
        return this.request(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
            method: 'POST',
            body: userData
        });
    }

    // ==================== DASHBOARD ====================
    async getDashboardSummary() {
        return this.request(API_CONFIG.ENDPOINTS.DASHBOARD.SUMMARY, {
            useCache: true
        });
    }

    async getRecentTransactions() {
        return this.request(API_CONFIG.ENDPOINTS.DASHBOARD.RECENT_TRANSACTIONS, {
            useCache: true
        });
    }

    // ==================== EXPENSES ====================
    async getAllExpenses() {
        return this.request(API_CONFIG.ENDPOINTS.EXPENSES.GET_ALL, {
            useCache: true
        });
    }

    async createExpense(expenseData) {
        const response = await this.request(API_CONFIG.ENDPOINTS.EXPENSES.CREATE, {
            method: 'POST',
            body: expenseData
        });
        this.clearCache();
        return response;
    }

    async updateExpense(id, expenseData) {
        const endpoint = API_CONFIG.ENDPOINTS.EXPENSES.UPDATE.replace(':id', id);
        const response = await this.request(endpoint, {
            method: 'PUT',
            body: expenseData
        });
        this.clearCache();
        return response;
    }

    async deleteExpense(id) {
        const endpoint = API_CONFIG.ENDPOINTS.EXPENSES.DELETE.replace(':id', id);
        const response = await this.request(endpoint, {
            method: 'DELETE'
        });
        this.clearCache();
        return response;
    }

    async filterExpenses(filters) {
        return this.request(API_CONFIG.ENDPOINTS.EXPENSES.FILTER, {
            method: 'POST',
            body: filters
        });
    }

    // ==================== INCOME ====================
    async getAllIncome() {
        return this.request(API_CONFIG.ENDPOINTS.INCOME.GET_ALL, {
            useCache: true
        });
    }

    async createIncome(incomeData) {
        const response = await this.request(API_CONFIG.ENDPOINTS.INCOME.CREATE, {
            method: 'POST',
            body: incomeData
        });
        this.clearCache();
        return response;
    }

    async updateIncome(id, incomeData) {
        const endpoint = API_CONFIG.ENDPOINTS.INCOME.UPDATE.replace(':id', id);
        const response = await this.request(endpoint, {
            method: 'PUT',
            body: incomeData
        });
        this.clearCache();
        return response;
    }

    async deleteIncome(id) {
        const endpoint = API_CONFIG.ENDPOINTS.INCOME.DELETE.replace(':id', id);
        const response = await this.request(endpoint, {
            method: 'DELETE'
        });
        this.clearCache();
        return response;
    }

    // ==================== CATEGORIES ====================
    async getAllCategories() {
        return this.request(API_CONFIG.ENDPOINTS.CATEGORIES.GET_ALL, {
            useCache: true
        });
    }

    async createCategory(categoryData) {
        const response = await this.request(API_CONFIG.ENDPOINTS.CATEGORIES.CREATE, {
            method: 'POST',
            body: categoryData
        });
        this.clearCache();
        return response;
    }

    async updateCategory(id, categoryData) {
        const endpoint = API_CONFIG.ENDPOINTS.CATEGORIES.UPDATE.replace(':id', id);
        const response = await this.request(endpoint, {
            method: 'PUT',
            body: categoryData
        });
        this.clearCache();
        return response;
    }

    async deleteCategory(id) {
        const endpoint = API_CONFIG.ENDPOINTS.CATEGORIES.DELETE.replace(':id', id);
        const response = await this.request(endpoint, {
            method: 'DELETE'
        });
        this.clearCache();
        return response;
    }

    // ==================== ANALYTICS ====================
    async getMonthlySummary() {
        return this.request(API_CONFIG.ENDPOINTS.ANALYTICS.MONTHLY_SUMMARY, {
            useCache: true
        });
    }

    async getCategoryBreakdown() {
        return this.request(API_CONFIG.ENDPOINTS.ANALYTICS.CATEGORY_BREAKDOWN, {
            useCache: true
        });
    }

    // ==================== CREDIT ====================
    async getCreditAccounts() {
        return this.request(API_CONFIG.ENDPOINTS.CREDIT.ACCOUNTS, {
            useCache: true
        });
    }

    async createCreditAccount(accountData) {
        const response = await this.request(API_CONFIG.ENDPOINTS.CREDIT.CREATE_ACCOUNT, {
            method: 'POST',
            body: accountData
        });
        this.clearCache();
        return response;
    }

    async getCreditScore() {
        return this.request(API_CONFIG.ENDPOINTS.CREDIT.GET_SCORE, {
            useCache: true
        });
    }

    async getCreditPayments() {
        return this.request(API_CONFIG.ENDPOINTS.CREDIT.PAYMENTS, {
            useCache: true
        });
    }

    async createCreditPayment(paymentData) {
        const response = await this.request(API_CONFIG.ENDPOINTS.CREDIT.CREATE_PAYMENT, {
            method: 'POST',
            body: paymentData
        });
        this.clearCache();
        return response;
    }

    async runCreditSimulator(simulatorData) {
        return this.request(API_CONFIG.ENDPOINTS.CREDIT.SIMULATOR, {
            method: 'POST',
            body: simulatorData
        });
    }

    // ==================== FINANCIAL HEALTH ====================
    async getHealthScore() {
        return this.request(API_CONFIG.ENDPOINTS.HEALTH.SCORE, {
            useCache: true
        });
    }

    async getHealthIndicators() {
        return this.request(API_CONFIG.ENDPOINTS.HEALTH.INDICATORS, {
            useCache: true
        });
    }

    // ==================== ALERTS ====================
    async getAllAlerts() {
        return this.request(API_CONFIG.ENDPOINTS.ALERTS.GET_ALL, {
            useCache: true
        });
    }

    // ==================== PROFILE ====================
    async getProfile() {
        return this.request(API_CONFIG.ENDPOINTS.PROFILE.GET, {
            useCache: true
        });
    }

    async updateProfile(profileData) {
        const response = await this.request(API_CONFIG.ENDPOINTS.PROFILE.UPDATE, {
            method: 'PUT',
            body: profileData
        });
        this.clearCache();
        return response;
    }
}

// Create global API instance
const api = new APIHandler();