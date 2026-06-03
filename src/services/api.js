// API Service with Auto-Fallback Mock Mode for MoneyMate Frontend

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9090/api/v1.0';

const STORAGE_KEYS = {
  TOKEN: 'mm_auth_token',
  USER: 'mm_user_info',
  PREFERENCES: 'mm_preferences',
  EXPENSES: 'mm_mock_expenses',
  INCOME: 'mm_mock_income',
  CATEGORIES: 'mm_mock_categories',
  CREDIT_ACCOUNTS: 'mm_mock_credit_accounts',
  CREDIT_PAYMENTS: 'mm_mock_credit_payments',
  PROFILE: 'mm_mock_profile'
};

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Food & Dining', type: 'EXPENSE', icon: '🍔' },
  { id: 2, name: 'Transportation', type: 'EXPENSE', icon: '🚗' },
  { id: 3, name: 'Shopping', type: 'EXPENSE', icon: '🛍️' },
  { id: 4, name: 'Entertainment', type: 'EXPENSE', icon: '🎬' },
  { id: 5, name: 'Utilities', type: 'EXPENSE', icon: '💡' },
  { id: 6, name: 'Healthcare', type: 'EXPENSE', icon: '🏥' },
  { id: 7, name: 'Education', type: 'EXPENSE', icon: '📚' },
  { id: 8, name: 'Other', type: 'EXPENSE', icon: '📌' },
  { id: 9, name: 'Salary', type: 'INCOME', icon: '💼' },
  { id: 10, name: 'Freelance', type: 'INCOME', icon: '💻' },
  { id: 11, name: 'Investment', type: 'INCOME', icon: '📈' }
];

// Seed initial mock data if not present in localStorage
const getLocalStorageItem = (key, defaultValue) => {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(item);
};

const setLocalStorageItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize mock DB
const mockDB = {
  getExpenses: () => getLocalStorageItem(STORAGE_KEYS.EXPENSES, [
    { id: 1, date: '2026-05-10', description: 'Weekly groceries at SuperMart', category: 'Food & Dining', amount: 3450 },
    { id: 2, date: '2026-05-12', description: 'Uber Ride to office', category: 'Transportation', amount: 480 },
    { id: 3, date: '2026-05-15', description: 'Netflix Monthly Premium', category: 'Entertainment', amount: 649 },
    { id: 4, date: '2026-05-18', description: 'Electric Bill', category: 'Utilities', amount: 4200 },
    { id: 5, date: '2026-05-20', description: 'New Summer Sneakers', category: 'Shopping', amount: 5999 },
    { id: 6, date: '2026-05-22', description: 'Dentist Checkup', category: 'Healthcare', amount: 1500 }
  ]),
  setExpenses: (data) => setLocalStorageItem(STORAGE_KEYS.EXPENSES, data),

  getIncome: () => getLocalStorageItem(STORAGE_KEYS.INCOME, [
    { id: 1, date: '2026-05-01', source: 'Monthly Tech Salary', category: 'Salary', amount: 95000 },
    { id: 2, date: '2026-05-15', source: 'Web Design Freelance Gig', category: 'Freelance', amount: 18000 },
    { id: 3, date: '2026-05-20', source: 'Stock Dividends payout', category: 'Investment', amount: 3200 }
  ]),
  setIncome: (data) => setLocalStorageItem(STORAGE_KEYS.INCOME, data),

  getCategories: () => getLocalStorageItem(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES),
  setCategories: (data) => setLocalStorageItem(STORAGE_KEYS.CATEGORIES, data),

  getCreditAccounts: () => getLocalStorageItem(STORAGE_KEYS.CREDIT_ACCOUNTS, [
    { id: 1, name: 'HDFC Regalia Credit Card', type: 'CREDIT_CARD', limit: 300000, balance: 42000 },
    { id: 2, name: 'SBI SimplyClick Card', type: 'CREDIT_CARD', limit: 150000, balance: 18500 },
    { id: 3, name: 'ICICI Personal Car Loan', type: 'PERSONAL_LOAN', limit: 800000, balance: 520000 }
  ]),
  setCreditAccounts: (data) => setLocalStorageItem(STORAGE_KEYS.CREDIT_ACCOUNTS, data),

  getCreditPayments: () => getLocalStorageItem(STORAGE_KEYS.CREDIT_PAYMENTS, [
    { id: 1, date: '2026-05-02', accountName: 'HDFC Regalia Credit Card', amount: 18500, type: 'PAYMENT' },
    { id: 2, date: '2026-05-05', accountName: 'ICICI Personal Car Loan', amount: 14500, type: 'EMI' }
  ]),
  setCreditPayments: (data) => setLocalStorageItem(STORAGE_KEYS.CREDIT_PAYMENTS, data),

  getProfile: () => getLocalStorageItem(STORAGE_KEYS.PROFILE, {
    name: 'Pankaj Kumar',
    email: 'pankaj.kumar@example.com',
    phone: '9876543210',
    currency: 'INR'
  }),
  setProfile: (data) => setLocalStorageItem(STORAGE_KEYS.PROFILE, data)
};

class APIHandler {
  constructor() {
    this.baseURL = BASE_URL;
    this.timeout = 8000;
    this.cache = new Map();
    this.cacheDuration = 5 * 60 * 1000; // 5 mins
    this.onUnauthorized = null;
    this.useMock = false; // Will set to true dynamically if backend is unreachable
  }

  /**
   * Generic request helper
   */
  async request(endpoint, options = {}) {
    if (this.useMock) {
      return this.handleMockRequest(endpoint, options);
    }

    const url = `${this.baseURL}${endpoint}`;
    const method = options.method || 'GET';

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      // Cache handler for GET requests
      if (method === 'GET' && options.useCache) {
        const cached = this.getFromCache(url);
        if (cached) return cached;
      }

      const response = await Promise.race([
        fetch(url, config),
        this.createTimeout(this.timeout)
      ]);

      if (!response.ok) {
        if (response.status === 401) {
          this.handleUnauthorized();
          throw new Error('Session expired. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access Forbidden');
        } else if (response.status === 404) {
          throw new Error('Resource not found');
        } else if (response.status === 500) {
          throw new Error('Server error occurred on the backend.');
        }
        throw new Error(`HTTP Error ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      let data = {};
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }

      if (method === 'GET' && options.useCache) {
        this.saveToCache(url, data);
      }

      return data;
    } catch (error) {
      console.warn(`Backend connection failed for ${method} ${endpoint}. Activating Auto-Fallback Mock Mode.`, error);
      this.useMock = true; // Switch to mock database dynamically
      return this.handleMockRequest(endpoint, options);
    }
  }

  createTimeout(ms) {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), ms)
    );
  }

  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  setToken(token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  }

  clearToken() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  }

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
      expiry: Date.now() + this.cacheDuration
    });
  }

  clearCache() {
    this.cache.clear();
  }

  handleUnauthorized() {
    this.clearToken();
    localStorage.removeItem(STORAGE_KEYS.USER);
    this.clearCache();
    if (this.onUnauthorized) {
      this.onUnauthorized();
    }
  }

  // ==================== LOCAL MOCK INTERCEPTOR ====================
  async handleMockRequest(endpoint, options) {
    // Artificial latency for premium feel of loading states
    await new Promise(resolve => setTimeout(resolve, 400));
    const method = options.method || 'GET';

    // 1. Auth Interceptors
    if (endpoint === '/auth/login') {
      const { email, password } = options.body;
      if (email && password) {
        this.setToken('mock-jwt-token-xyz-123');
        const user = { name: mockDB.getProfile().name, email, role: 'USER' };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        return { token: 'mock-jwt-token-xyz-123', user };
      }
      throw new Error('Invalid email or password');
    }

    if (endpoint === '/auth/register') {
      const { name, email } = options.body;
      const profile = mockDB.getProfile();
      mockDB.setProfile({ ...profile, name, email });
      this.setToken('mock-jwt-token-xyz-123');
      const user = { name, email, role: 'USER' };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return { token: 'mock-jwt-token-xyz-123', user };
    }

    // 2. Profile Interceptors
    if (endpoint === '/profile') {
      if (method === 'GET') return mockDB.getProfile();
      if (method === 'PUT') {
        mockDB.setProfile(options.body);
        return options.body;
      }
    }

    // 3. Expense Interceptors
    if (endpoint === '/expenses') {
      if (method === 'GET') return mockDB.getExpenses();
      if (method === 'POST') {
        const list = mockDB.getExpenses();
        const newExpense = { id: Date.now(), ...options.body };
        list.unshift(newExpense);
        mockDB.setExpenses(list);
        return newExpense;
      }
    }
    if (endpoint.startsWith('/expenses/')) {
      const id = parseInt(endpoint.split('/').pop());
      if (method === 'PUT') {
        let list = mockDB.getExpenses();
        list = list.map(item => item.id === id ? { ...item, ...options.body } : item);
        mockDB.setExpenses(list);
        return options.body;
      }
      if (method === 'DELETE') {
        let list = mockDB.getExpenses();
        list = list.filter(item => item.id !== id);
        mockDB.setExpenses(list);
        return { success: true };
      }
    }
    if (endpoint === '/expenses/filter') {
      const { category, fromDate, toDate } = options.body;
      let list = mockDB.getExpenses();
      if (category) list = list.filter(item => item.category === category);
      if (fromDate) list = list.filter(item => item.date >= fromDate);
      if (toDate) list = list.filter(item => item.date <= toDate);
      return list;
    }

    // 4. Income Interceptors
    if (endpoint === '/income') {
      if (method === 'GET') return mockDB.getIncome();
      if (method === 'POST') {
        const list = mockDB.getIncome();
        const newIncome = { id: Date.now(), ...options.body };
        list.unshift(newIncome);
        mockDB.setIncome(list);
        return newIncome;
      }
    }
    if (endpoint.startsWith('/income/')) {
      const id = parseInt(endpoint.split('/').pop());
      if (method === 'PUT') {
        let list = mockDB.getIncome();
        list = list.map(item => item.id === id ? { ...item, ...options.body } : item);
        mockDB.setIncome(list);
        return options.body;
      }
      if (method === 'DELETE') {
        let list = mockDB.getIncome();
        list = list.filter(item => item.id !== id);
        mockDB.setIncome(list);
        return { success: true };
      }
    }

    // 5. Category Interceptors
    if (endpoint === '/categories') {
      if (method === 'GET') return mockDB.getCategories();
      if (method === 'POST') {
        const list = mockDB.getCategories();
        const newCat = { id: Date.now(), ...options.body };
        list.push(newCat);
        mockDB.setCategories(list);
        return newCat;
      }
    }
    if (endpoint.startsWith('/categories/')) {
      const id = parseInt(endpoint.split('/').pop());
      if (method === 'PUT') {
        let list = mockDB.getCategories();
        list = list.map(item => item.id === id ? { ...item, ...options.body } : item);
        mockDB.setCategories(list);
        return options.body;
      }
      if (method === 'DELETE') {
        let list = mockDB.getCategories();
        list = list.filter(item => item.id !== id);
        mockDB.setCategories(list);
        return { success: true };
      }
    }

    // 6. Credit Interceptors
    if (endpoint === '/credit/accounts') {
      if (method === 'GET') return mockDB.getCreditAccounts();
      if (method === 'POST') {
        const list = mockDB.getCreditAccounts();
        const newAccount = { id: Date.now(), balance: 0, ...options.body };
        list.push(newAccount);
        mockDB.setCreditAccounts(list);
        return newAccount;
      }
    }
    if (endpoint === '/credit/score') {
      // Calculate credit score based on account utilization
      const accounts = mockDB.getCreditAccounts().filter(a => a.type === 'CREDIT_CARD');
      if (accounts.length === 0) return { score: 710, status: 'Good' };
      
      const totalLimit = accounts.reduce((acc, a) => acc + a.limit, 0);
      const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);
      const utilRate = totalLimit > 0 ? (totalBalance / totalLimit) : 0;
      
      let baseScore = 750;
      if (utilRate > 0.7) baseScore -= 80;
      else if (utilRate > 0.5) baseScore -= 40;
      else if (utilRate > 0.3) baseScore -= 15;
      else baseScore += 25; // Good utilization

      return { score: Math.min(850, Math.max(300, baseScore)), status: baseScore >= 750 ? 'Excellent' : baseScore >= 650 ? 'Good' : 'Fair' };
    }
    if (endpoint === '/credit/payments') {
      if (method === 'GET') return mockDB.getCreditPayments();
      if (method === 'POST') {
        const list = mockDB.getCreditPayments();
        const newPayment = { id: Date.now(), type: 'PAYMENT', ...options.body };
        list.unshift(newPayment);
        mockDB.setCreditPayments(list);

        // Deduct from accounts
        let accounts = mockDB.getCreditAccounts();
        accounts = accounts.map(a => {
          if (a.name === options.body.accountName) {
            return { ...a, balance: Math.max(0, a.balance - options.body.amount) };
          }
          return a;
        });
        mockDB.setCreditAccounts(accounts);

        return newPayment;
      }
    }
    if (endpoint === '/credit/simulator') {
      const { type, creditLimit, paymentAmount } = options.body;
      const currentScore = (await this.handleMockRequest('/credit/score', { method: 'GET' })).score;
      let change = 0;
      let message = '';

      if (type === 'NEW_CARD') {
        change = -18;
        message = 'Applying for new credit leads to a hard inquiry and lowers your average credit history length.';
      } else if (type === 'PAY_BALANCE') {
        const reduction = parseFloat(paymentAmount) || 0;
        change = Math.round(Math.min(45, (reduction / 10000) * 12));
        message = `Reducing your outstanding credit balance improves your debt-to-credit utilization ratio.`;
      } else if (type === 'MISSED_PAYMENT') {
        change = -95;
        message = 'Payment history is the largest factor (35%) in your credit score. A missed payment has a severe negative impact.';
      }

      return {
        newScore: Math.min(850, Math.max(300, currentScore + change)),
        change,
        message
      };
    }

    // 7. Health Interceptors
    if (endpoint === '/financial-health/score') {
      const expenses = mockDB.getExpenses();
      const income = mockDB.getIncome();
      const accounts = mockDB.getCreditAccounts();

      const totalExp = expenses.reduce((acc, e) => acc + e.amount, 0);
      const totalInc = income.reduce((acc, i) => acc + i.amount, 0);
      const totalDebt = accounts.reduce((acc, a) => acc + a.balance, 0);

      // Compute simple health score
      let score = 75;
      if (totalInc > 0) {
        const savingsRate = (totalInc - totalExp) / totalInc;
        if (savingsRate > 0.3) score += 10;
        else if (savingsRate < 0.1) score -= 15;
      }
      if (totalDebt > 500000) score -= 10;
      if (totalDebt === 0) score += 5;

      const finalScore = Math.min(100, Math.max(0, score));
      return {
        score: finalScore,
        status: finalScore >= 80 ? 'Excellent' : finalScore >= 60 ? 'Good' : 'Needs Improvement'
      };
    }
    if (endpoint === '/financial-health/indicators') {
      const expenses = mockDB.getExpenses();
      const income = mockDB.getIncome();
      const accounts = mockDB.getCreditAccounts();

      const totalExp = expenses.reduce((acc, e) => acc + e.amount, 0);
      const totalInc = income.reduce((acc, i) => acc + i.amount, 0);
      const totalDebt = accounts.reduce((acc, a) => acc + a.balance, 0);

      const savingsRate = totalInc > 0 ? ((totalInc - totalExp) / totalInc) * 100 : 0;
      const dti = totalInc > 0 ? (totalExp / totalInc) * 100 : 0;
      const creditUtilization = (() => {
        const cards = accounts.filter(a => a.type === 'CREDIT_CARD');
        const limit = cards.reduce((acc, c) => acc + c.limit, 0);
        const bal = cards.reduce((acc, c) => acc + c.balance, 0);
        return limit > 0 ? (bal / limit) * 100 : 0;
      })();

      return [
        { name: 'Savings Rate (Target > 20%)', value: savingsRate },
        { name: 'Debt-to-Income Ratio (Target < 36%)', value: dti },
        { name: 'Credit Card Utilization (Target < 30%)', value: creditUtilization },
        { name: 'Liquid Asset Ratio (Emergency Savings)', value: totalInc > 0 ? (totalInc - totalExp) > 0 ? 3.5 : 0.8 : 0 }
      ];
    }

    // 8. Alerts Interceptors
    if (endpoint === '/alerts') {
      const expenses = mockDB.getExpenses();
      const list = [];

      const foodExp = expenses.filter(e => e.category === 'Food & Dining').reduce((acc, e) => acc + e.amount, 0);
      if (foodExp > 4000) {
        list.push({ id: 1, type: 'warning', message: `Food & Dining expense (₹${foodExp}) has exceeded 80% of your ₹5,000 monthly limit.`, date: '2026-05-24' });
      }
      
      const accounts = mockDB.getCreditAccounts();
      accounts.forEach(a => {
        const util = a.limit > 0 ? (a.balance / a.limit) * 100 : 0;
        if (util > 70) {
          list.push({ id: a.id + 10, type: 'danger', message: `High credit utilization alert: ${a.name} is at ${util.toFixed(1)}% of limit.`, date: '2026-05-23' });
        }
      });

      if (list.length === 0) {
        list.push({ id: 99, type: 'info', message: 'All financial parameters are within normal thresholds.', date: '2026-05-25' });
      }

      return list;
    }

    // 9. Dashboard Interceptors
    if (endpoint === '/dashboard/summary') {
      const expenses = mockDB.getExpenses();
      const income = mockDB.getIncome();
      const credit = await this.handleMockRequest('/credit/score', { method: 'GET' });
      const health = await this.handleMockRequest('/financial-health/score', { method: 'GET' });

      // Monthly aggregates
      const currentYearMonth = '2026-05';
      const monthExp = expenses.filter(e => e.date.startsWith(currentYearMonth)).reduce((acc, e) => acc + e.amount, 0);
      const monthInc = income.filter(i => i.date.startsWith(currentYearMonth)).reduce((acc, i) => acc + i.amount, 0);
      
      const totalExp = expenses.reduce((acc, e) => acc + e.amount, 0);
      const totalInc = income.reduce((acc, i) => acc + i.amount, 0);
      const totalBalance = totalInc - totalExp;

      return {
        totalBalance,
        monthExpense: monthExp,
        monthIncome: monthInc,
        creditScore: credit.score,
        creditStatus: credit.status,
        healthScore: health.score,
        healthStatus: health.status
      };
    }

    if (endpoint === '/dashboard/recent-transactions') {
      const expenses = mockDB.getExpenses().map(e => ({ ...e, type: 'EXPENSE' }));
      const income = mockDB.getIncome().map(i => ({ ...i, type: 'INCOME', description: i.source }));
      const combined = [...expenses, ...income];
      combined.sort((a, b) => new Date(b.date) - new Date(a.date));
      return combined.slice(0, 5);
    }

    // 10. Analytics Interceptors
    if (endpoint === '/analytics/monthly-summary') {
      // Return summaries for Jan, Feb, Mar, Apr, May 2026
      const expenses = mockDB.getExpenses();
      const income = mockDB.getIncome();

      const getSum = (list, yrMo, field = 'amount') => {
        return list.filter(item => item.date.startsWith(yrMo)).reduce((acc, item) => acc + item[field], 0);
      };

      return {
        'Jan 2026': { income: 85000, expense: 52000 },
        'Feb 2026': { income: 88000, expense: 48000 },
        'Mar 2026': { income: 90000, expense: 62000 },
        'Apr 2026': { income: 95000, expense: 41000 },
        'May 2026': { income: getSum(income, '2026-05', 'amount'), expense: getSum(expenses, '2026-05', 'amount') }
      };
    }

    if (endpoint === '/analytics/category-breakdown') {
      const expenses = mockDB.getExpenses();
      const breakdown = {};
      expenses.forEach(e => {
        breakdown[e.category] = (breakdown[e.category] || 0) + e.amount;
      });
      return breakdown;
    }

    throw new Error(`Mock endpoint ${endpoint} not implemented`);
  }

  // ==================== AUTHENTICATION ====================
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData
    });
  }

  // ==================== DASHBOARD ====================
  async getDashboardSummary() {
    return this.request('/dashboard/summary', { useCache: false });
  }

  async getRecentTransactions() {
    return this.request('/dashboard/recent-transactions', { useCache: false });
  }

  // ==================== EXPENSES ====================
  async getAllExpenses() {
    return this.request('/expenses', { useCache: false });
  }

  async createExpense(expenseData) {
    const response = await this.request('/expenses', {
      method: 'POST',
      body: expenseData
    });
    this.clearCache();
    return response;
  }

  async updateExpense(id, expenseData) {
    const response = await this.request(`/expenses/${id}`, {
      method: 'PUT',
      body: expenseData
    });
    this.clearCache();
    return response;
  }

  async deleteExpense(id) {
    const response = await this.request(`/expenses/${id}`, {
      method: 'DELETE'
    });
    this.clearCache();
    return response;
  }

  async filterExpenses(filters) {
    return this.request('/expenses/filter', {
      method: 'POST',
      body: filters
    });
  }

  // ==================== INCOME ====================
  async getAllIncome() {
    return this.request('/income', { useCache: false });
  }

  async createIncome(incomeData) {
    const response = await this.request('/income', {
      method: 'POST',
      body: incomeData
    });
    this.clearCache();
    return response;
  }

  async updateIncome(id, incomeData) {
    const response = await this.request(`/income/${id}`, {
      method: 'PUT',
      body: incomeData
    });
    this.clearCache();
    return response;
  }

  async deleteIncome(id) {
    const response = await this.request(`/income/${id}`, {
      method: 'DELETE'
    });
    this.clearCache();
    return response;
  }

  // ==================== CATEGORIES ====================
  async getAllCategories() {
    return this.request('/categories', { useCache: false });
  }

  async createCategory(categoryData) {
    const response = await this.request('/categories', {
      method: 'POST',
      body: categoryData
    });
    this.clearCache();
    return response;
  }

  async updateCategory(id, categoryData) {
    const response = await this.request(`/categories/${id}`, {
      method: 'PUT',
      body: categoryData
    });
    this.clearCache();
    return response;
  }

  async deleteCategory(id) {
    const response = await this.request(`/categories/${id}`, {
      method: 'DELETE'
    });
    this.clearCache();
    return response;
  }

  // ==================== ANALYTICS ====================
  async getMonthlySummary() {
    return this.request('/analytics/monthly-summary', { useCache: false });
  }

  async getCategoryBreakdown() {
    return this.request('/analytics/category-breakdown', { useCache: false });
  }

  // ==================== CREDIT ====================
  async getCreditAccounts() {
    return this.request('/credit/accounts', { useCache: false });
  }

  async createCreditAccount(accountData) {
    const response = await this.request('/credit/accounts', {
      method: 'POST',
      body: accountData
    });
    this.clearCache();
    return response;
  }

  async getCreditScore() {
    return this.request('/credit/score', { useCache: false });
  }

  async getCreditPayments() {
    return this.request('/credit/payments', { useCache: false });
  }

  async createCreditPayment(paymentData) {
    const response = await this.request('/credit/payments', {
      method: 'POST',
      body: paymentData
    });
    this.clearCache();
    return response;
  }

  async runCreditSimulator(simulatorData) {
    return this.request('/credit/simulator', {
      method: 'POST',
      body: simulatorData
    });
  }

  // ==================== FINANCIAL HEALTH ====================
  async getHealthScore() {
    return this.request('/financial-health/score', { useCache: false });
  }

  async getHealthIndicators() {
    return this.request('/financial-health/indicators', { useCache: false });
  }

  // ==================== ALERTS ====================
  async getAllAlerts() {
    return this.request('/alerts', { useCache: false });
  }

  // ==================== PROFILE ====================
  async getProfile() {
    return this.request('/profile', { useCache: false });
  }

  async updateProfile(profileData) {
    const response = await this.request('/profile', {
      method: 'PUT',
      body: profileData
    });
    this.clearCache();
    return response;
  }
}

const api = new APIHandler();
export { api, STORAGE_KEYS, DEFAULT_CATEGORIES };
