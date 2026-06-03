
// ==================== EXPENSES ====================

let allExpenses = [];

async function loadExpenses() {
    try {
        showLoading(true);
        
        // Load all expenses
        const expenses = await api.getAllExpenses();
        allExpenses = expenses || [];
        
        // Load categories for filter
        await populateCategoryFilter();
        
        // Display expenses
        displayExpenses(allExpenses);
    } catch (error) {
        console.error('Error loading expenses:', error);
        showAlert('Error loading expenses', 'danger');
    } finally {
        showLoading(false);
    }
}

async function populateCategoryFilter() {
    try {
        const categories = await api.getAllCategories();
        const filterSelect = document.getElementById('expense-filter-category');
        
        if (categories) {
            const expenseCategories = categories.filter(c => c.type === 'EXPENSE');
            const options = expenseCategories.map(cat => 
                `<option value="${cat.id}">${cat.name}</option>`
            ).join('');
            filterSelect.innerHTML = '<option value="">All Categories</option>' + options;
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function displayExpenses(expenses) {
    const tbody = document.getElementById('expenses-tbody');
    
    if (!expenses || expenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No expenses found</td></tr>';
        return;
    }
    
    tbody.innerHTML = expenses.map(expense => `
        <tr>
            <td>${formatDate(expense.date)}</td>
            <td>${expense.description || '-'}</td>
            <td>${expense.category || '-'}</td>
            <td>${formatCurrency(expense.amount)}</td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-sm" onclick="editExpense(${expense.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteExpenseItem(${expense.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openExpenseModal(expense = null) {
    const modal = document.getElementById('expense-modal');
    const title = document.getElementById('expense-modal-title');
    const form = document.getElementById('expense-form');
    
    if (expense) {
        title.textContent = 'Edit Expense';
        document.getElementById('expense-date').value = expense.date;
        document.getElementById('expense-description').value = expense.description;
        document.getElementById('expense-category').value = expense.categoryId;
        document.getElementById('expense-amount').value = expense.amount;
        form.dataset.expenseId = expense.id;
    } else {
        title.textContent = 'Add Expense';
        form.reset();
        form.dataset.expenseId = '';
        document.getElementById('expense-date').value = getTodayDate();
    }
    
    // Load categories
    loadCategoriesForExpense();
    
    openModal('expense-modal');
}

async function loadCategoriesForExpense() {
    try {
        const categories = await api.getAllCategories();
        const select = document.getElementById('expense-category');
        
        if (categories) {
            const expenseCategories = categories.filter(c => c.type === 'EXPENSE');
            select.innerHTML = expenseCategories.map(cat => 
                `<option value="${cat.id}">${cat.name}</option>`
            ).join('');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function editExpense(id) {
    const expense = allExpenses.find(e => e.id === id);
    if (expense) {
        openExpenseModal(expense);
    }
}

async function deleteExpenseItem(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        try {
            showLoading(true);
            await api.deleteExpense(id);
            showAlert('Expense deleted successfully', 'success');
            await loadExpenses();
        } catch (error) {
            console.error('Error deleting expense:', error);
            showAlert('Error deleting expense', 'danger');
        } finally {
            showLoading(false);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expense-form');
    if (expenseForm) {
        expenseForm.addEventListener('submit', handleExpenseFormSubmit);
    }
});

async function handleExpenseFormSubmit(e) {
    e.preventDefault();
    
    const date = document.getElementById('expense-date').value;
    const description = document.getElementById('expense-description').value;
    const categoryId = document.getElementById('expense-category').value;
    const amount = document.getElementById('expense-amount').value;
    const expenseId = e.target.dataset.expenseId;
    
    // Validate
    if (!date || !description || !categoryId || !amount) {
        showAlert('Please fill all fields', 'warning');
        return;
    }
    
    if (!validateAmount(amount)) {
        showAlert('Please enter a valid amount', 'warning');
        return;
    }
    
    try {
        showLoading(true);
        
        const expenseData = {
            date,
            description,
            categoryId: parseInt(categoryId),
            amount: parseFloat(amount)
        };
        
        if (expenseId) {
            await api.updateExpense(expenseId, expenseData);
            showAlert('Expense updated successfully', 'success');
        } else {
            await api.createExpense(expenseData);
            showAlert('Expense created successfully', 'success');
        }
        
        closeModal('expense-modal');
        await loadExpenses();
    } catch (error) {
        console.error('Error saving expense:', error);
        showAlert('Error saving expense', 'danger');
    } finally {
        showLoading(false);
    }
}

async function filterExpenses() {
    const categoryId = document.getElementById('expense-filter-category').value;
    const fromDate = document.getElementById('expense-filter-from').value;
    const toDate = document.getElementById('expense-filter-to').value;
    
    try {
        showLoading(true);
        
        const filters = {};
        if (categoryId) filters.categoryId = parseInt(categoryId);
        if (fromDate) filters.fromDate = fromDate;
        if (toDate) filters.toDate = toDate;
        
        const filtered = await api.filterExpenses(filters);
        displayExpenses(filtered);
    } catch (error) {
        console.error('Error filtering expenses:', error);
        showAlert('Error filtering expenses', 'danger');
    } finally {
        showLoading(false);
    }
}