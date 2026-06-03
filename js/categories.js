
// ==================== CATEGORIES ====================

let allCategories = [];

async function loadCategories() {
    try {
        showLoading(true);
        
        const categories = await api.getAllCategories();
        allCategories = categories || [];
        
        displayCategories(allCategories);
    } catch (error) {
        console.error('Error loading categories:', error);
        showAlert('Error loading categories', 'danger');
    } finally {
        showLoading(false);
    }
}

function displayCategories(categories) {
    const grid = document.getElementById('categories-grid');
    
    if (!categories || categories.length === 0) {
        grid.innerHTML = '<p class="empty-state">No categories found</p>';
        return;
    }
    
    grid.innerHTML = categories.map(cat => `
        <div class="card" style="text-align: center; padding: 20px;">
            <div style="font-size: 40px; margin-bottom: 12px;">${cat.icon || '📌'}</div>
            <h4>${cat.name}</h4>
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 16px;">${cat.type}</p>
            <div style="display: flex; gap: 8px; justify-content: center;">
                <button class="btn btn-sm" onclick="editCategory(${cat.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteCategory(${cat.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function openCategoryModal(category = null) {
    const form = document.getElementById('category-form');
    
    if (category) {
        document.getElementById('category-name').value = category.name;
        document.getElementById('category-type').value = category.type;
        document.getElementById('category-icon').value = category.icon;
        form.dataset.categoryId = category.id;
    } else {
        form.reset();
        form.dataset.categoryId = '';
    }
    
    openModal('category-modal');
}

function editCategory(id) {
    const category = allCategories.find(c => c.id === id);
    if (category) {
        openCategoryModal(category);
    }
}

async function deleteCategory(id) {
    if (confirm('Are you sure you want to delete this category?')) {
        try {
            showLoading(true);
            await api.deleteCategory(id);
            showAlert('Category deleted successfully', 'success');
            await loadCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            showAlert('Error deleting category', 'danger');
        } finally {
            showLoading(false);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const categoryForm = document.getElementById('category-form');
    if (categoryForm) {
        categoryForm.addEventListener('submit', handleCategoryFormSubmit);
    }
});

async function handleCategoryFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('category-name').value;
    const type = document.getElementById('category-type').value;
    const icon = document.getElementById('category-icon').value;
    const categoryId = e.target.dataset.categoryId;
    
    if (!name || !type) {
        showAlert('Please fill all required fields', 'warning');
        return;
    }
    
    try {
        showLoading(true);
        
        const categoryData = { name, type, icon };
        
        if (categoryId) {
            await api.updateCategory(categoryId, categoryData);
            showAlert('Category updated successfully', 'success');
        } else {
            await api.createCategory(categoryData);
            showAlert('Category created successfully', 'success');
        }
        
        closeModal('category-modal');
        await loadCategories();
    } catch (error) {
        console.error('Error saving category:', error);
        showAlert('Error saving category', 'danger');
    } finally {
        showLoading(false);
    }
}