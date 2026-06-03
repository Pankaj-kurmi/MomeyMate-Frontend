import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  
  const { login, register, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (isLogin) {
      try {
        await login(email, password);
        navigate('/dashboard');
      } catch (err) {
        // Handled by context error
      }
    } else {
      if (password !== confirmPassword) {
        setValidationError("Passwords do not match!");
        return;
      }
      try {
        await register(name, email, password);
        navigate('/dashboard');
      } catch (err) {
        // Handled by context error
      }
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setValidationError('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 40%), var(--bg-primary)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background shapes */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
        filter: 'blur(120px)',
        opacity: 0.15,
        zIndex: 0
      }}></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '450px',
          zIndex: 1,
          padding: '40px 32px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          background: 'rgba(17, 24, 39, 0.8)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#fff',
              boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
            }}
          >
            <Sparkles size={28} />
          </motion.div>
          <h1 className="text-gradient" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '32px',
            fontWeight: '800',
            letterSpacing: '-0.5px',
            marginBottom: '8px'
          }}>MoneyMate</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            {isLogin ? 'Your Personal Financial Companion' : 'Create an account to get started'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={isLogin ? 'login' : 'register'}
            initial={{ opacity: 0, x: isLogin ? -15 : 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isLogin ? 15 : -15 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* Error notifications */}
            {(error || validationError) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--danger)',
                  fontSize: '13px'
                }}
              >
                <ShieldAlert size={16} style={{ flexShrink: 0 }} />
                <span>{validationError || error}</span>
              </motion.div>
            )}

            {!isLogin && (
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ paddingLeft: '38px', width: '100%' }}
                  />
                </div>
              </div>
            )}

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '38px', width: '100%' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '38px', width: '100%' }}
                />
              </div>
            </div>

            {!isLogin && (
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ paddingLeft: '38px', width: '100%' }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                fontSize: '15px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                marginTop: '10px',
                cursor: 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 12px var(--brand-primary-glow)'
              }}
            >
              <span>{loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </motion.form>
        </AnimatePresence>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={switchMode}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--brand-primary)',
              fontWeight: '600',
              padding: 0,
              cursor: 'pointer'
            }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
