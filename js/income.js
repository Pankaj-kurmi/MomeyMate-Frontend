
// ==================== INCOME ====================

let allIncome = [];

async function loadIncome() {
    try {
        showLoading(true);
        
        const income = await api.getAllIncome();
        allIncome = income || [];
        
        displayIncome(allIncome);
    } catch (error) {
        console.error('Error loading income:', error);
        showAlert('Error loading income', 'danger');
    } finally {
        showLoading(false);
    }
}

function displayIncome(income) {
    const tbody = document.getElementById('income-tbody');
    
    if (!income || income.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No income records found</td></tr>';
        return;
    }
    
    tbody.innerHTML = income.map(inc => `
        <tr>
            <td>${formatDate(inc.date)}</td>
            <td>${inc.source || '-'}</td>
            <td>${inc.category || '-'}</td>
            <td>${formatCurrency(inc.amount)}</td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-sm" onclick="editIncome(${inc.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteIncomeItem(${inc.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openIncomeModal(income = null) {
    const modal = document.getElementById('income-modal');
    const title = document.getElementById('income-modal-title');
    const form = document.getElementById('income-form');
    
    if (income) {
        title.textContent = 'Edit Income';
        document.getElementById('income-date').value = income.date;
        document.getElementById('income-source').value = income.source;
        document.getElementById('income-category').value = income.categoryId;
        document.getElementById('income-amount').value = income.amount;
        form.dataset.incomeId = income.id;
    } else {
        title.textContent = 'Add Income';
        form.reset();
        form.dataset.incomeId = '';
        document.getElementById('income-date').value = getTodayDate();
    }
    
    loadCategoriesForIncome();
    openModal('income-modal');
}

async function loadCategoriesForIncome() {
    try {
        const categories = await api.getAllCategories();
        const select = document.getElementById('income-category');
        
        if (categories) {
            const incomeCategories = categories.filter(c => c.type === 'INCOME');
            select.innerHTML = incomeCategories.map(cat => 
                `<option value="${cat.id}">${cat.name}</option>`
            ).join('');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function editIncome(id) {
    const income = allIncome.find(i => i.id === id);
    if (income) {
        openIncomeModal(income);
    }
}

async function deleteIncomeItem(id) {
    if (confirm('Are you sure you want to delete this income record?')) {
        try {
            showLoading(true);
            await api.deleteIncome(id);
            showAlert('Income deleted successfully', 'success');
            await loadIncome();
        } catch (error) {
            console.error('Error deleting income:', error);
            showAlert('Error deleting income', 'danger');
        } finally {
            showLoading(false);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const incomeForm = document.getElementById('income-form');
    if (incomeForm) {
        incomeForm.addEventListener('submit', handleIncomeFormSubmit);
    }
});

async function handleIncomeFormSubmit(e) {
    e.preventDefault();
    
    const date = document.getElementById('income-date').value;
    const source = document.getElementById('income-source').value;
    const categoryId = document.getElementById('income-category').value;
    const amount = document.getElementById('income-amount').value;
    const incomeId = e.target.dataset.incomeId;
    
    if (!date || !source || !categoryId || !amount) {
        showAlert('Please fill all fields', 'warning');
        return;
    }
    
    if (!validateAmount(amount)) {
        showAlert('Please enter a valid amount', 'warning');
        return;
    }
    
    try {
        showLoading(true);
        
        const incomeData = {
            date,
            source,
            categoryId: parseInt(categoryId),
            amount: parseFloat(amount)
        };
        
        if (incomeId) {
            await api.updateIncome(incomeId, incomeData);
            showAlert('Income updated successfully', 'success');
        } else {
            await api.createIncome(incomeData);
            showAlert('Income created successfully', 'success');
        }
        
        closeModal('income-modal');
        await loadIncome();
    } catch (error) {
        console.error('Error saving income:', error);
        showAlert('Error saving income', 'danger');
    } finally {
        showLoading(false);
    }
}