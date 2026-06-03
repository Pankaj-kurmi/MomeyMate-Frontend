import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Activity, 
  ShieldAlert, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp as IconIncome,
  TrendingDown as IconExpense,
  HeartPulse,
  Award
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend 
} from 'recharts';

const COLORS = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6'];

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [breakdown, setBreakdown] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [summaryData, transData, breakdownData] = await Promise.all([
          api.getDashboardSummary(),
          api.getRecentTransactions(),
          api.getCategoryBreakdown()
        ]);
        setSummary(summaryData);
        setTransactions(transData);
        setBreakdown(breakdownData);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        setError('Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: '500' }}>Loading your dashboard data...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderColor: 'rgba(239,68,68,0.2)', color: 'var(--danger)' }}>
        <ShieldAlert size={20} />
        <span>{error}</span>
      </div>
    );
  }

  // Prep Recharts data
  const chartData = Object.entries(breakdown || {}).map(([name, value]) => ({
    name,
    value
  })).filter(item => item.value > 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
    >
      {/* Metrics Row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '20px' 
      }}>
        
        {/* Balance Card */}
        <motion.div variants={itemVariants} className="gradient-border-card" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '130px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(17, 24, 39, 0.6) 100%)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>TOTAL BALANCE</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--brand-primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
              <Wallet size={16} />
            </div>
          </div>
          <div>
            <h2 className="text-gradient" style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-display)', marginTop: '8px' }}>
              {formatCurrency(summary?.totalBalance)}
            </h2>
          </div>
        </motion.div>

        {/* Income Card */}
        <motion.div variants={itemVariants} className="gradient-border-card" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '130px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>MONTHLY INCOME</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--success)', marginTop: '8px' }}>
              {formatCurrency(summary?.monthIncome)}
            </h2>
          </div>
        </motion.div>

        {/* Expense Card */}
        <motion.div variants={itemVariants} className="gradient-border-card" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '130px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>MONTHLY EXPENSES</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
              <TrendingDown size={16} />
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--danger)', marginTop: '8px' }}>
              {formatCurrency(summary?.monthExpense)}
            </h2>
          </div>
        </motion.div>

        {/* Credit Card */}
        <motion.div variants={itemVariants} className="gradient-border-card" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '130px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>CREDIT SCORE</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--brand-primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
              <Award size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              {summary?.creditScore || 750}
            </h2>
            <span style={{ 
              fontSize: '12px', 
              fontWeight: '600', 
              color: summary?.creditStatus === 'Excellent' || summary?.creditStatus === 'Good' ? 'var(--success)' : 'var(--warning)',
              backgroundColor: summary?.creditStatus === 'Excellent' || summary?.creditStatus === 'Good' ? 'var(--success-glow)' : 'var(--warning-glow)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)'
            }}>
              {summary?.creditStatus || 'Good'}
            </span>
          </div>
        </motion.div>

        {/* Health Card */}
        <motion.div variants={itemVariants} className="gradient-border-card" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '130px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>FINANCIAL HEALTH</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)' }}>
              <HeartPulse size={16} />
            </div>
          </div>
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                {summary?.healthScore || 80}/100
              </h2>
              <span style={{ 
                fontSize: '11px', 
                fontWeight: '600', 
                color: summary?.healthScore >= 75 ? 'var(--success)' : 'var(--warning)',
              }}>
                {summary?.healthStatus || 'Good'}
              </span>
            </div>
            {/* Simple progress bar */}
            <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-color)', borderRadius: 'var(--radius-full)', marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ width: `${summary?.healthScore || 80}%`, height: '100%', backgroundColor: 'var(--info)', borderRadius: 'var(--radius-full)' }}></div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Analytics and Transactions Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '30px'
      }}>
        
        {/* Recent Transactions List */}
        <motion.div variants={itemVariants} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Recent Activity</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Your latest incoming and outgoing transactions</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {transactions.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                No recent transactions found
              </div>
            ) : (
              transactions.map((tx) => (
                <div 
                  key={tx.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    transition: 'transform 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: tx.type === 'EXPENSE' ? 'var(--danger-glow)' : 'var(--success-glow)',
                      color: tx.type === 'EXPENSE' ? 'var(--danger)' : 'var(--success)'
                    }}>
                      {tx.type === 'EXPENSE' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>
                        {tx.description}
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {tx.category} • {formatDate(tx.date)}
                      </p>
                    </div>
                  </div>
                  <span style={{ 
                    fontSize: '15px', 
                    fontWeight: '700', 
                    color: tx.type === 'EXPENSE' ? 'var(--danger)' : 'var(--success)'
                  }}>
                    {tx.type === 'EXPENSE' ? '-' : '+'} {formatCurrency(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Expense Category Breakdown Chart */}
        <motion.div variants={itemVariants} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Expense Distribution</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Breakdown of expenses by category</p>
          </div>

          <div style={{ height: '280px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {chartData.length === 0 ? (
              <div style={{ color: 'var(--text-muted)' }}>No expense data to analyze</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-secondary)', 
                      borderColor: 'var(--border-color)', 
                      borderRadius: 'var(--radius-md)', 
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [formatCurrency(value), 'Spent']}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconSize={10}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default Dashboard;
