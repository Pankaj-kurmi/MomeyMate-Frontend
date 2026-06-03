name=js/alerts.js
// ==================== FINANCIAL ALERTS ====================

async function loadAlerts() {
    try {
        showLoading(true);
        
        const alerts = await api.getAllAlerts();
        displayAlerts(alerts);
    } catch (error) {
        console.error('Error loading alerts:', error);
        showAlert('Error loading alerts', 'danger');
    } finally {
        showLoading(false);
    }
}

function displayAlerts(alerts) {
    const container = document.getElementById('alerts-list');
    
    if (!alerts || alerts.length === 0) {
        container.innerHTML = '<p class="empty-state">No alerts. Everything looks good! ✨</p>';
        return;
    }
    
    container.innerHTML = alerts.map(alert => {
        const severity = alert.severity || 'info';
        const severityColors = {
            'critical': { bg: '#fee2e2', border: '#dc2626', icon: '🔴' },
            'warning': { bg: '#fef3c7', border: '#f59e0b', icon: '🟡' },
            'info': { bg: '#dbeafe', border: '#0284c7', icon: '🔵' }
        };
        
        const colors = severityColors[severity] || severityColors.info;
        
        return `
            <div class="alert-item" style="background-color: ${colors.bg}; border-left: 4px solid ${colors.border}; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                    <span style="font-size: 20px; margin-top: 2px;">${colors.icon}</span>
                    <div style="flex: 1;">
                        <p class="alert-item-title" style="color: #1f2937; margin: 0 0 6px 0;">${alert.title || 'Alert'}</p>
                        <p class="alert-item-message" style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">${alert.message || ''}</p>
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">${formatDate(alert.createdAt)}</p>
                    </div>
                    ${alert.actionUrl ? `<a href="${alert.actionUrl}" class="btn btn-sm" style="white-space: nowrap;">Take Action</a>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Add real-time alert notification
 */
function addRealtimeAlert(title, message, severity = 'info') {
    showAlert(`${title}: ${message}`, severity);
}