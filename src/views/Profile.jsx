import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Globe, Check, AlertCircle, Save, Key } from 'lucide-react';

const Profile = () => {
  const { user, updateProfileState } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    currency: 'INR'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await api.getProfile();
        setProfile(data);
      } catch (err) {
        console.error('Failed to fetch profile', err);
        setMessage({ type: 'error', text: 'Failed to load profile details.' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const updated = await api.updateProfile(profile);
      setProfile(updated);
      updateProfileState(updated);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      console.error('Failed to update profile', err);
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
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
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: '500' }}>Loading profile details...</p>
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
      style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto', padding: '16px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '32px',
          fontWeight: 'bold',
          boxShadow: 'var(--shadow-glow)'
        }}>
          {profile.name ? profile.name.charAt(0).toUpperCase() : <User size={40} />}
        </div>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{profile.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Manage your account and preferences</p>
        </div>
      </div>

      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 18px',
            backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            borderRadius: 'var(--radius-md)',
            color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </motion.div>
      )}

      <div className="glass-card" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          Personal Information
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  name="name"
                  required
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  style={{ paddingLeft: '38px', width: '100%' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  name="email"
                  required
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  style={{ paddingLeft: '38px', width: '100%' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone || ''}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  style={{ paddingLeft: '38px', width: '100%' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Preferred Currency</label>
              <div style={{ position: 'relative' }}>
                <Globe size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <select
                  name="currency"
                  value={profile.currency}
                  onChange={handleChange}
                  style={{ paddingLeft: '38px', width: '100%', WebkitAppearance: 'none', appearance: 'none' }}
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                opacity: saving ? 0.7 : 1,
                boxShadow: '0 4px 12px var(--brand-primary-glow)'
              }}
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="glass-card" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
          Security & Password
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
          To change your security credentials or delete your account, please connect with the support team.
        </p>
        <button
          className="btn btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            cursor: 'not-allowed',
            opacity: 0.6
          }}
          disabled
        >
          <Key size={16} />
          <span>Change Password</span>
        </button>
      </div>
    </motion.div>
  );
};

export default Profile;
