name=js/analytics.js
// ==================== ANALYTICS ====================

async function loadAnalytics() {
    try {
        showLoading(true);
        
        // Load monthly summary
        const monthlySummary = await api.getMonthlySummary();
        displayMonthlySummary(monthlySummary);
        
        // Load category breakdown
        const categoryBreakdown = await api.getCategoryBreakdown();
        displayCategoryBreakdown(categoryBreakdown);
    } catch (error) {
        console.error('Error loading analytics:', error);
        showAlert('Error loading analytics data', 'danger');
    } finally {
        showLoading(false);
    }
}

function displayMonthlySummary(summary) {
    const container = document.getElementById('monthly-summary');
    
    if (!summary || Object.keys(summary).length === 0) {
        container.innerHTML = '<p class="empty-state">No data available</p>';
        return;
    }
    
    let html = '<table style="width: 100%; border-collapse: collapse;">';
    html += '<thead><tr style="background-color: #f9fafb;">';
    html += '<th style="text-align: left; padding: 12px; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Month</th>';
    html += '<th style="text-align: right; padding: 12px; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Income</th>';
    html += '<th style="text-align: right; padding: 12px; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Expense</th>';
    html += '<th style="text-align: right; padding: 12px; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Balance</th>';
    html += '</tr></thead><tbody>';
    
    Object.entries(summary).forEach(([month, data]) => {
        const balance = (data.income || 0) - (data.expense || 0);
        const balanceColor = balance >= 0 ? '#10b981' : '#ef4444';
        
        html += '<tr style="border-bottom: 1px solid #e5e7eb;">';
        html += `<td style="padding: 12px; font-weight: 500;">${month}</td>`;
        html += `<td style="text-align: right; padding: 12px; color: #10b981; font-weight: 500;">${formatCurrency(data.income || 0)}</td>`;
        html += `<td style="text-align: right; padding: 12px; color: #ef4444; font-weight: 500;">${formatCurrency(data.expense || 0)}</td>`;
        html += `<td style="text-align: right; padding: 12px; font-weight: 600; color: ${balanceColor};">${formatCurrency(balance)}</td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function displayCategoryBreakdown(breakdown) {
    const container = document.getElementById('category-breakdown');
    
    if (!breakdown || Object.keys(breakdown).length === 0) {
        container.innerHTML = '<p class="empty-state">No data available</p>';
        return;
    }
    
    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
    
    let html = '<div style="display: flex; flex-direction: column; gap: 16px;">';
    
    Object.entries(breakdown)
        .sort(([, a], [, b]) => b - a)
        .forEach(([category, amount]) => {
            const percentage = calculatePercentage(amount, total);
            html += `
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 500; color: #1f2937;">${category}</span>
                        <span style="font-weight: 600; color: #6366f1;">${formatCurrency(amount)}</span>
                    </div>
                    <div style="width: 100%; height: 8px; background-color: #f3f4f6; border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${percentage}%; background: linear-gradient(90deg, #6366f1, #818cf8); border-radius: 4px; transition: all 0.3s ease;"></div>
                    </div>
                    <div style="text-align: right; font-size: 12px; color: #9ca3af; margin-top: 4px;">${percentage}%</div>
                </div>
            `;
        });
    
    html += '</div>';
    container.innerHTML = html;
}