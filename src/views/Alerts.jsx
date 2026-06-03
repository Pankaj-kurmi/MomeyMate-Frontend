import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { motion } from 'framer-motion';
import { AlertTriangle, AlertOctagon, Info, CheckCircle2, Bell, RefreshCw, Calendar } from 'lucide-react';
import { formatDate } from '../utils/format';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getAllAlerts();
      setAlerts(data || []);
    } catch (err) {
      console.error('Failed to load alerts', err);
      setError('Could not retrieve active system alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'danger':
        return <AlertOctagon size={22} style={{ color: 'var(--danger)' }} />;
      case 'warning':
        return <AlertTriangle size={22} style={{ color: 'var(--warning)' }} />;
      case 'info':
      default:
        return <Info size={22} style={{ color: 'var(--info)' }} />;
    }
  };

  const getAlertBg = (type) => {
    switch (type) {
      case 'danger':
        return 'rgba(239, 68, 68, 0.08)';
      case 'warning':
        return 'rgba(245, 158, 11, 0.08)';
      case 'info':
      default:
        return 'rgba(59, 130, 246, 0.08)';
    }
  };

  const getAlertBorder = (type) => {
    switch (type) {
      case 'danger':
        return 'rgba(239, 68, 68, 0.2)';
      case 'warning':
        return 'rgba(245, 158, 11, 0.2)';
      case 'info':
      default:
        return 'rgba(59, 130, 246, 0.2)';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '15px' }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--brand-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: '500' }}>Checking for active alerts...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto', padding: '16px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>System Alerts</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Real-time warnings, limits monitor, and critical financial anomalies</p>
        </div>
        <button
          onClick={fetchAlerts}
          className="btn btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderColor: 'rgba(239,68,68,0.2)', color: 'var(--danger)', padding: '18px' }}>
          <AlertOctagon size={20} />
          <span>{error}</span>
        </div>
      )}

      {!error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {alerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px',
                textAlign: 'center',
                gap: '16px',
                borderStyle: 'dashed'
              }}
            >
              <CheckCircle2 size={48} style={{ color: 'var(--success)' }} />
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>All parameters normal</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '380px' }}>
                  Great job! You haven't triggered any limit breaches or high utilization alerts today.
                </p>
              </div>
            </motion.div>
          ) : (
            alerts.map((alert, idx) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '20px',
                  backgroundColor: getAlertBg(alert.type),
                  border: `1px solid ${getAlertBorder(alert.type)}`,
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ padding: '4px' }}>
                  {getAlertIcon(alert.type)}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <p style={{
                    fontSize: '15px',
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    lineHeight: '1.5'
                  }}>
                    {alert.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
                    <Calendar size={12} />
                    <span>Triggered on {formatDate(alert.date)}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Bell size={20} style={{ color: 'var(--brand-primary)' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>Notification Preferences</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          Alerts are automatically triggered based on your transactions and account limits. Make sure to define accurate limits on the categories page and card profile page to get the most out of smart insights.
        </p>
      </div>
    </motion.div>
  );
};

export default Alerts;
