
// ==================== AUTHENTICATION ====================

document.addEventListener('DOMContentLoaded', () => {
    initializeAuth();
});

function initializeAuth() {
    // Check if user is already logged in
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
        showDashboard();
    } else {
        showAuthPage();
    }
    
    // Setup event listeners
    setupAuthListeners();
}

function setupAuthListeners() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Validate inputs
    if (!validateEmail(email)) {
        showAlert('Please enter a valid email', 'warning');
        return;
    }
    
    if (!validatePassword(password)) {
        showAlert('Password must be at least 6 characters', 'warning');
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await api.login(email, password);
        
        if (response.token) {
            // Save token and user info
            api.setToken(response.token);
            setUserInfo(response.user || { email });
            
            showAlert('Login successful!', 'success');
            setTimeout(() => {
                showDashboard();
            }, 1000);
        } else {
            showAlert('Login failed. Please try again.', 'danger');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert(error.message || 'Login failed', 'danger');
    } finally {
        showLoading(false);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    
    // Validate inputs
    if (!name || name.length < 2) {
        showAlert('Name must be at least 2 characters', 'warning');
        return;
    }
    
    if (!validateEmail(email)) {
        showAlert('Please enter a valid email', 'warning');
        return;
    }
    
    if (!validatePassword(password)) {
        showAlert('Password must be at least 6 characters', 'warning');
        return;
    }
    
    if (password !== confirm) {
        showAlert('Passwords do not match', 'warning');
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await api.register({
            name,
            email,
            password
        });
        
        showAlert('Registration successful! Please login.', 'success');
        setTimeout(() => {
            switchAuthPage('login');
        }, 1500);
    } catch (error) {
        console.error('Registration error:', error);
        showAlert(error.message || 'Registration failed', 'danger');
    } finally {
        showLoading(false);
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        api.clearToken();
        localStorage.removeItem(STORAGE_KEYS.USER);
        api.clearCache();
        showAuthPage();
        showAlert('Logged out successfully', 'info');
    }
}

function showAuthPage() {
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    
    authContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
    
    switchAuthPage('login');
}

function showDashboard() {
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    
    authContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');
    
    // Update user name if available
    const userInfo = getUserInfo();
    if (userInfo && userInfo.name) {
        document.getElementById('user-name').textContent = userInfo.name;
    }
    
    // Load dashboard
    navigateTo('dashboard');
}