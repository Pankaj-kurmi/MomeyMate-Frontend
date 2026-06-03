import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  TrendingDown, 
  TrendingUp, 
  Tags, 
  BarChart3, 
  CreditCard, 
  HeartPulse, 
  Bell, 
  User, 
  LogOut,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/expenses', label: 'Expenses', icon: TrendingDown },
    { to: '/income', label: 'Income', icon: TrendingUp },
    { to: '/categories', label: 'Categories', icon: Tags },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/credit', label: 'Credit', icon: CreditCard },
    { to: '/health', label: 'Financial Health', icon: HeartPulse },
    { to: '/alerts', label: 'Alerts', icon: Bell },
    { to: '/profile', label: 'Profile', icon: User }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header" style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '18px', boxShadow: 'var(--shadow-glow)' }}>
          M
        </div>
        <h2 className="text-gradient" style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '800' }}>MoneyMate</h2>
      </div>

      <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontWeight: isActive ? '600' : '500',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                borderLeft: isActive ? '3px solid var(--brand-primary)' : '3px solid transparent',
              })}
            >
              <Icon size={18} style={{ color: 'inherit' }} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer" style={{ padding: '16px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={toggleTheme}
          className="btn btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '10px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <button
          onClick={handleLogout}
          className="btn btn-logout"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--danger)',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
