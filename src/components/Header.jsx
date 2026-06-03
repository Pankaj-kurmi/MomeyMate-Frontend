import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User } from 'lucide-react';

const Header = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/expenses':
        return 'Expenses';
      case '/income':
        return 'Income';
      case '/categories':
        return 'Categories';
      case '/analytics':
        return 'Analytics';
      case '/credit':
        return 'Credit Score & Accounts';
      case '/health':
        return 'Financial Health';
      case '/alerts':
        return 'Alerts';
      case '/profile':
        return 'Profile';
      default:
        return 'MoneyMate';
    }
  };

  return (
    <header className="top-header" style={{
      height: 'var(--header-height)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'var(--bg-secondary)',
      zIndex: 10
    }}>
      <div className="header-left">
        <h1 id="page-title" style={{
          fontFamily: 'var(--font-display)',
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--text-primary)'
        }}>
          {getPageTitle(location.pathname)}
        </h1>
      </div>
      <div className="header-right">
        {user && (
          <div className="user-profile" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '6px 12px',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-color)'
          }}>
            <span id="user-name" style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              {user.name}
            </span>
            <div className="avatar" style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {user.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
