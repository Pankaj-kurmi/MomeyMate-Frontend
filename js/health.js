name=js/health.js
// ==================== FINANCIAL HEALTH ====================

async function loadHealth() {
    try {
        showLoading(true);
        
        // Load health score
        const healthScore = await api.getHealthScore();
        displayHealthScore(healthScore);
        
        // Load health indicators
        const indicators = await api.getHealthIndicators();
        displayHealthIndicators(indicators);
    } catch (error) {
        console.error('Error loading health data:', error);
        showAlert('Error loading financial health data', 'danger');
    } finally {
        showLoading(false);
    }
}

function displayHealthScore(health) {
    const container = document.getElementById('health-score-detail');
    
    if (!health) {
        container.innerHTML = '<p class="empty-state">No health score data available</p>';
        return;
    }
    
    const score = health.score || 0;
    const status = health.status || 'N/A';
    const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
    
    container.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="width: 160px; height: 160px; margin: 0 auto 20px; border-radius: 50%; background: linear-gradient(135deg, ${scoreColor}, ${scoreColor}99); display: flex; align-items: center; justify-content: center; color: white; font-size: 56px; font-weight: 700; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                ${score}
            </div>
            <p style="font-size: 20px; font-weight: 600; margin-bottom: 8px; color: #1f2937;">${status}</p>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                Your financial health is ${score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement'}
            </p>
            <div style="text-align: left; background-color: #f9fafb; padding: 16px; border-radius: 8px; font-size: 13px; color: #6b7280; line-height: 1.8;">
                <p><strong>💡 What does this score mean?</strong></p>
                <p style="margin-top: 8px;">
                    ${score >= 80 ? 'Excellent financial health! Keep maintaining your spending habits and savings goals.' : 
                      score >= 60 ? 'Good financial health. Consider improving your savings rate and reducing debt.' : 
                      'Your finances need attention. Focus on budgeting and reducing unnecessary expenses.'}
                </p>
            </div>
        </div>
    `;
}

function displayHealthIndicators(indicators) {
    const container = document.getElementById('health-indicators');
    
    if (!indicators || Object.keys(indicators).length === 0) {
        container.innerHTML = '<p class="empty-state">No indicators available</p>';
        return;
    }
    
    const indicatorsList = Array.isArray(indicators) ? indicators : Object.entries(indicators).map(([name, value]) => ({ name, value }));
    
    container.innerHTML = indicatorsList.map(indicator => {
        const value = typeof indicator.value === 'number' ? indicator.value.toFixed(2) : indicator.value;
        const isPositive = indicator.value >= 0;
        const color = isPositive ? '#10b981' : '#ef4444';
        
        return `
            <div class="indicator-item">
                <div>
                    <p class="indicator-name">${indicator.name}</p>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="indicator-value" style="color: ${color};">
                        ${isPositive ? '✓' : '✗'} ${value}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}