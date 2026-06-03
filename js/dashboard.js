
// ==================== DASHBOARD ====================

async function loadDashboard() {
    try {
        showLoading(true);
        
        // Load summary data
        const summary = await api.getDashboardSummary();
        updateDashboardSummary(summary);
        
        // Load recent transactions
        const transactions = await api.getRecentTransactions();
        displayRecentTransactions(transactions);
        
        // Load credit score
        try {
            const creditData = await api.getCreditScore();
            updateCreditScore(creditData);
        } catch (error) {
            console.log('Credit score not available');
        }
        
        // Load financial health
        try {
            const health = await api.getHealthScore();
            updateHealthScore(health);
        } catch (error) {
            console.log('Health score not available');
        }
        
        // Load category breakdown
        try {
            const breakdown = await api.getCategoryBreakdown();
            displayCategoryBreakdown(breakdown);
        } catch (error) {
            console.log('Category breakdown not available');
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showAlert('Error loading dashboard data', 'danger');
    } finally {
        showLoading(false);
    }
}

function updateDashboardSummary(summary) {
    if (!summary) return;
    
    const balance = summary.totalBalance || 0;
    const monthExpense = summary.monthExpense || 0;
    const monthIncome = summary.monthIncome || 0;
    
    document.getElementById('total-balance').textContent = formatCurrency(balance);
    document.getElementById('month-expense').textContent = formatCurrency(monthExpense);
    document.getElementById('month-income').textContent = formatCurrency(monthIncome);
}

function displayRecentTransactions(transactions) {
    const container = document.getElementById('recent-transactions');
    
    if (!transactions || transactions.length === 0) {
        container.innerHTML = '<p class="empty-state">No transactions yet</p>';
        return;
    }
    
    container.innerHTML = transactions.slice(0, 5).map(tx => `
        <div class="transaction-item">
            <div class="transaction-info">
                <p class="transaction-desc">${tx.description || 'Transaction'}</p>
                <p class="transaction-category">${tx.category || 'Other'} • ${formatDate(tx.date)}</p>
            </div>
            <p class="transaction-amount ${tx.type === 'EXPENSE' ? 'expense' : 'income'}">
                ${tx.type === 'EXPENSE' ? '-' : '+'} ${formatCurrency(tx.amount)}
            </p>
        </div>
    `).join('');
}

function updateCreditScore(creditData) {
    if (!creditData) return;
    
    const score = creditData.score || 0;
    const status = creditData.status || 'N/A';
    
    document.getElementById('credit-score').textContent = score;
    document.getElementById('credit-status').textContent = status;
}

function updateHealthScore(health) {
    if (!health) return;
    
    const score = health.score || 0;
    const status = health.status || 'N/A';
    
    document.getElementById('health-value').textContent = score;
    document.getElementById('health-status').textContent = status;
}

function displayCategoryBreakdown(breakdown) {
    const container = document.getElementById('category-chart');
    
    if (!breakdown || Object.keys(breakdown).length === 0) {
        container.innerHTML = '<p class="empty-state">No data available</p>';
        return;
    }
    
    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
    
    container.innerHTML = Object.entries(breakdown).map(([category, amount]) => {
        const percentage = calculatePercentage(amount, total);
        return `
            <div class="category-item">
                <div class="category-info">
                    <span class="category-name">${category}</span>
                </div>
                <div class="category-bar">
                    <div class="category-bar-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="category-percentage">${percentage}%</span>
            </div>
        `;
    }).join('');
}