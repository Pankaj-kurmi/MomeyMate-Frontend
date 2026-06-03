import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, ShieldCheck, AlertCircle, Plus, Info, RefreshCw, X, HelpCircle, Landmark, Calendar, ArrowUpRight } from 'lucide-react';

const Credit = () => {
  const [scoreData, setScoreData] = useState({ score: 750, status: 'Good' });
  const [accounts, setAccounts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  // Account Form
  const [accountForm, setAccountForm] = useState({
    name: '',
    type: 'CREDIT_CARD',
    limit: '',
    balance: ''
  });
  const [accountFormError, setAccountFormError] = useState('');

  // Payment Form
  const [paymentForm, setPaymentForm] = useState({
    accountName: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [paymentFormError, setPaymentFormError] = useState('');

  // Simulator State
  const [simType, setSimType] = useState('PAY_BALANCE');
  const [simAmount, setSimAmount] = useState('15000');
  const [simResult, setSimResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [score, accs, pmts] = await Promise.all([
        api.getCreditScore(),
        api.getCreditAccounts(),
        api.getCreditPayments()
      ]);
      setScoreData(score);
      setAccounts(accs || []);
      setPayments(pmts || []);
      
      if (accs && accs.length > 0) {
        setPaymentForm(prev => ({ ...prev, accountName: accs[0].name }));
      }
    } catch (err) {
      console.error('Failed to load credit center data', err);
      setError('Could not retrieve credit accounts and scores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setAccountFormError('');
    if (!accountForm.name || !accountForm.limit) {
      setAccountFormError('Please enter card/loan name and limit.');
      return;
    }

    try {
      const balanceVal = accountForm.balance ? parseFloat(accountForm.balance) : 0;
      await api.createCreditAccount({
        name: accountForm.name,
        type: accountForm.type,
        limit: parseFloat(accountForm.limit),
        balance: balanceVal
      });
      setIsAccountModalOpen(false);
      setAccountForm({ name: '', type: 'CREDIT_CARD', limit: '', balance: '' });
      loadData();
    } catch (err) {
      setAccountFormError('Failed to create account.');
    }
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    setPaymentFormError('');
    if (!paymentForm.accountName || !paymentForm.amount) {
      setPaymentFormError('Please fill all fields.');
      return;
    }

    const selectedAccount = accounts.find(a => a.name === paymentForm.accountName);
    if (selectedAccount && parseFloat(paymentForm.amount) > selectedAccount.balance) {
      setPaymentFormError(`Payment amount cannot exceed the current balance of ${formatCurrency(selectedAccount.balance)}.`);
      return;
    }

    try {
      await api.createCreditPayment({
        accountName: paymentForm.accountName,
        amount: parseFloat(paymentForm.amount),
        date: paymentForm.date
      });
      setIsPaymentModalOpen(false);
      setPaymentForm(prev => ({ ...prev, amount: '' }));
      loadData();
    } catch (err) {
      setPaymentFormError('Failed to log payment.');
    }
  };

  const handleRunSimulator = async () => {
    setSimulating(true);
    setSimResult(null);
    try {
      const res = await api.runCreditSimulator({
        type: simType,
        paymentAmount: simAmount
      });
      setSimResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 750) return 'var(--success)';
    if (score >= 650) return 'var(--warning)';
    return 'var(--danger)';
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
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: '500' }}>Fetching credit score profile...</p>
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
      style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto', padding: '16px' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>Credit Center</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Monitor credit score, simulate credit behaviors, and log EMI or card payments</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setIsAccountModalOpen(true)}
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '10px 20px',
              fontWeight: '600'
            }}
          >
            <Plus size={16} />
            <span>Add Account</span>
          </button>
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="btn btn-secondary"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 20px',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}
            disabled={accounts.length === 0}
          >
            <ArrowUpRight size={16} />
            <span>Log Payment</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Credit score summary meter */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <svg style={{ transform: 'rotate(-225deg)', width: '180px', height: '180px' }}>
              <circle
                cx="90"
                cy="90"
                r="75"
                stroke="var(--border-color)"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray="353 471"
                strokeLinecap="round"
              />
              <motion.circle
                cx="90"
                cy="90"
                r="75"
                stroke={getScoreColor(scoreData.score)}
                strokeWidth="12"
                fill="transparent"
                strokeDasharray="353 471"
                initial={{ strokeDashoffset: 353 }}
                animate={{ strokeDashoffset: 353 - (353 * (scoreData.score - 300)) / 550 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                strokeLinecap="round"
              />
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', top: '75px' }}>
              <span style={{ fontSize: '42px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{scoreData.score}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '6px' }}>Status</span>
              <span style={{ fontSize: '15px', fontWeight: '700', color: getScoreColor(scoreData.score) }}>{scoreData.status}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)', padding: '8px 16px', borderRadius: '999px', border: '1px solid var(--border-color)' }}>
            <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
            <span>Score monitored by MoneyMate Check</span>
          </div>
        </div>

        {/* Credit Simulator Card */}
        <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HelpCircle size={18} style={{ color: 'var(--brand-primary)' }} />
            <span>Credit Score Simulator</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: 0 }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Select Simulation Action</label>
              <select value={simType} onChange={(e) => setSimType(e.target.value)} style={{ width: '100%' }}>
                <option value="PAY_BALANCE">Pay Off Balance</option>
                <option value="NEW_CARD">Apply for a New Credit Card</option>
                <option value="MISSED_PAYMENT">Miss a Bill Payment</option>
              </select>
            </div>

            {simType === 'PAY_BALANCE' && (
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: 0 }}>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Repayment Amount (₹)</label>
                <input
                  type="number"
                  placeholder="Enter repayment amount"
                  value={simAmount}
                  onChange={(e) => setSimAmount(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            )}

            <button
              onClick={handleRunSimulator}
              disabled={simulating}
              className="btn btn-primary btn-full"
              style={{
                background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
                fontWeight: '600',
                border: 'none',
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              {simulating ? 'Simulating...' : 'Simulate Effect'}
            </button>

            {simResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginTop: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Simulated Score:</span>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: getScoreColor(simResult.newScore) }}>
                    {simResult.newScore} ({simResult.change >= 0 ? '+' : ''}{simResult.change})
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {simResult.message}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Credit Accounts List */}
      <div className="glass-card" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Landmark size={18} style={{ color: 'var(--brand-primary)' }} />
          <span>Active cards & loans</span>
        </h3>

        {accounts.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            No credit accounts registered. Click 'Add Account' to add a card or loan.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {accounts.map((acc) => {
              const utilRate = acc.limit > 0 ? (acc.balance / acc.limit) * 100 : 0;
              const isLoan = acc.type === 'PERSONAL_LOAN';
              
              return (
                <div
                  key={acc.id}
                  style={{
                    padding: '24px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{acc.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {isLoan ? 'Loan / EMI' : 'Credit Card'}
                      </span>
                    </div>
                    <CreditCard size={18} style={{ color: isLoan ? 'var(--brand-secondary)' : 'var(--brand-primary)' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Outstanding Balance</span>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{formatCurrency(acc.balance)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Total Credit Limit</span>
                      <span style={{ fontWeight: '500', color: 'var(--text-muted)' }}>{formatCurrency(acc.limit)}</span>
                    </div>
                  </div>

                  {!isLoan && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <span>Utilization</span>
                        <span style={{ fontWeight: '600', color: utilRate > 30 ? 'var(--warning)' : 'var(--success)' }}>
                          {utilRate.toFixed(0)}%
                        </span>
                      </div>
                      <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(100, utilRate)}%`,
                            background: utilRate > 50 ? 'var(--danger)' : utilRate > 30 ? 'var(--warning)' : 'var(--success)'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Previous payments list */}
      <div className="glass-card" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={18} style={{ color: 'var(--brand-primary)' }} />
          <span>Payment History</span>
        </h3>

        {payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
            No payment history recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {payments.map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{p.accountName}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Paid on {formatDate(p.date)}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--success)' }}>-{formatCurrency(p.amount)}</span>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', fontWeight: '600' }}>
                    {p.type || 'PAYMENT'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isAccountModalOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card"
              style={{ width: '100%', maxWidth: '480px', padding: '32px', position: 'relative' }}
            >
              <button
                onClick={() => setIsAccountModalOpen(false)}
                style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: 'var(--text-primary)' }}>Add Card or Loan</h3>

              {accountFormError && (
                <div style={{ padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={14} />
                  <span>{accountFormError}</span>
                </div>
              )}

              <form onSubmit={handleCreateAccount} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: 0 }}>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Account Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC Regalia Card"
                    value={accountForm.name}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: 0 }}>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Account Type</label>
                  <select
                    value={accountForm.type}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="PERSONAL_LOAN">Personal Loan / EMI</option>
                  </select>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: 0 }}>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Credit Limit / Loan Principal (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 150000"
                    value={accountForm.limit}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, limit: e.target.value }))}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: 0 }}>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Current Outstanding Balance (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 18500"
                    value={accountForm.balance}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, balance: e.target.value }))}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  style={{
                    background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '600',
                    marginTop: '8px'
                  }}
                >
                  Create Account
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {isPaymentModalOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card"
              style={{ width: '100%', maxWidth: '480px', padding: '32px', position: 'relative' }}
            >
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: 'var(--text-primary)' }}>Log Credit Payment</h3>

              {paymentFormError && (
                <div style={{ padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={14} />
                  <span>{paymentFormError}</span>
                </div>
              )}

              <form onSubmit={handleCreatePayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: 0 }}>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Select Credit Account</label>
                  <select
                    value={paymentForm.accountName}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, accountName: e.target.value }))}
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.name}>{acc.name} (Bal: {formatCurrency(acc.balance)})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: 0 }}>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Payment Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: 0 }}>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Payment Date</label>
                  <input
                    type="date"
                    required
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  style={{
                    background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '600',
                    marginTop: '8px'
                  }}
                >
                  Confirm Payment
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Credit;
