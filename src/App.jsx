import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './App.css';

// Import views
import Auth from './views/Auth';
import Dashboard from './views/Dashboard';
import Expenses from './views/Expenses';
import Income from './views/Income';
import Categories from './views/Categories';
import Analytics from './views/Analytics';
import Credit from './views/Credit';
import Health from './views/Health';
import Alerts from './views/Alerts';
import Profile from './views/Profile';

const LoadingScreen = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    flexDirection: 'column',
    gap: '15px'
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '3px solid var(--border-color)',
      borderTopColor: 'var(--brand-primary)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: '500' }}>Loading MoneyMate...</p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

const DashboardLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            } />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/income" element={<Income />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/credit" element={<Credit />} />
                <Route path="/health" element={<Health />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
