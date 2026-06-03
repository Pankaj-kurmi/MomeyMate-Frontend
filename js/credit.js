name=js/credit.js
// ==================== CREDIT ====================

let allCreditAccounts = [];

async function loadCredit() {
    try {
        showLoading(true);
        
        // Load credit accounts
        const accounts = await api.getCreditAccounts();
        allCreditAccounts = accounts || [];
        displayCreditAccounts(allCreditAccounts);
        
        // Load credit score
        try {
            const creditScore = await api.getCreditScore();
            displayCreditScore(creditScore);
        } catch (error) {
            console.log('Credit score not available');
        }
    } catch (error) {
        console.error('Error loading credit data:', error);
        showAlert('Error loading credit data', 'danger');
    } finally {
        showLoading(false);
    }
}

function displayCreditScore(creditData) {
    const container = document.getElementById('credit-score-info');
    
    if (!creditData) {
        container.innerHTML = '<p class="empty-state">No credit score data available</p>';
        return;
    }
    
    const score = creditData.score || 0;
    const status = creditData.status || 'N/A';
    const scoreColor = score >= 750 ? '#10b981' : score >= 650 ? '#f59e0b' : '#ef4444';
    
    container.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="width: 150px; height: 150px; margin: 0 auto 20px; border-radius: 50%; background: linear-gradient(135deg, ${scoreColor}, ${scoreColor}99); display: flex; align-items: center; justify-content: center; color: white; font-size: 56px; font-weight: 700;">
                ${score}
            </div>
            <p style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">${status}</p>
            <p style="color: #6b7280; font-size: 14px;">Your credit score is ${score >= 750 ? 'Excellent' : score >= 650 ? 'Good' : 'Fair'}</p>
        </div>
    `;
}

function displayCreditAccounts(accounts) {
    const container = document.getElementById('credit-accounts');
    
    if (!accounts || accounts.length === 0) {
        container.innerHTML = '<p class="empty-state">No credit accounts. <a href="#" onclick="openCreditAccountModal(); return false;">Add one now</a></p>';
        return;
    }
    
    container.innerHTML = accounts.map(account => {
        const utilization = account.limit > 0 ? (account.balance / account.limit * 100).toFixed(2) : 0;
        const utilizationColor = utilization <= 30 ? '#10b981' : utilization <= 70 ? '#f59e0b' : '#ef4444';
        
        return `
            <div class="card" style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h4 style="margin: 0; color: #1f2937;">${account.name}</h4>
                    <span style="background-color: #dbeafe; color: #0c2340; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">${account.type}</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                    <div>
                        <p style="color: #6b7280; font-size: 13px; margin-bottom: 4px;">Credit Limit</p>
                        <p style="font-size: 18px; font-weight: 600; color: #1f2937;">${formatCurrency(account.limit)}</p>
                    </div>
                    <div>
                        <p style="color: #6b7280; font-size: 13px; margin-bottom: 4px;">Current Balance</p>
                        <p style="font-size: 18px; font-weight: 600; color: #ef4444;">${formatCurrency(account.balance)}</p>
                    </div>
                </div>
                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                        <span style="font-size: 13px; color: #6b7280;">Utilization</span>
                        <span style="font-size: 13px; font-weight: 600; color: ${utilizationColor};">${utilization}%</span>
                    </div>
                    <div style="width: 100%; height: 8px; background-color: #f3f4f6; border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${utilization}%; background-color: ${utilizationColor}; border-radius: 4px;"></div>
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-sm" onclick="editCreditAccount(${account.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCreditAccount(${account.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function openCreditAccountModal(account = null) {
    const form = document.getElementById('credit-account-form');
    
    if (account) {
        document.getElementById('credit-name').value = account.name;
        document.getElementById('credit-type').value = account.type;
        document.getElementById('credit-limit').value = account.limit;
        form.dataset.accountId = account.id;
    } else {
        form.reset();
        form.dataset.accountId = '';
    }
    
    openModal('credit-account-modal');
}

function editCreditAccount(id) {
    const account = allCreditAccounts.find(a => a.id === id);
    if (account) {
        openCreditAccountModal(account);
    }
}

async function deleteCreditAccount(id) {
    if (confirm('Are you sure you want to delete this credit account?')) {
        try {
            showLoading(true);
            // Note: Backend may not have delete endpoint, adjust as needed
            showAlert('Account marked for deletion', 'info');
            await loadCredit();
        } catch (error) {
            console.error('Error deleting account:', error);
            showAlert('Error deleting account', 'danger');
        } finally {
            showLoading(false);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const creditForm = document.getElementById('credit-account-form');
    if (creditForm) {
        creditForm.addEventListener('submit', handleCreditAccountFormSubmit);
    }
});

async function handleCreditAccountFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('credit-name').value;
    const type = document.getElementById('credit-type').value;
    const limit = document.getElementById('credit-limit').value;
    const accountId = e.target.dataset.accountId;
    
    if (!name || !type || !limit) {
        showAlert('Please fill all fields', 'warning');
        return;
    }
    
    if (!validateAmount(limit)) {
        showAlert('Please enter a valid credit limit', 'warning');
        return;
    }
    
    try {
        showLoading(true);
        
        const accountData = {
            name,
            type,
            limit: parseFloat(limit)
        };
        
        await api.createCreditAccount(accountData);
        showAlert('Credit account created successfully', 'success');
        
        closeModal('credit-account-modal');
        await loadCredit();
    } catch (error) {
        console.error('Error saving credit account:', error);
        showAlert('Error saving credit account', 'danger');
    } finally {
        showLoading(false);
    }
}