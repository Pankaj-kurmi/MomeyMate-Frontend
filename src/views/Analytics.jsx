import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/format';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area 
} from 'recharts';
import { TrendingUp, TrendingDown, Award, PieChart as PieIcon, Activity, AlertCircle } from 'lucide-react';

const COLORS = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6'];

const Analytics = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Performance stats
  const [stats, setStats] = useState({
    avgSavingsRate: 0,
    highestCategory: 'N/A',
    highestAmount: 0,
    netWorthChange: 0
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const [monthlySummary, catBreakdown] = await Promise.all([
          api.getMonthlySummary(),
          api.getCategoryBreakdown()
        ]);

        // Transform monthly summary map to array
        const monthlyArray = Object.entries(monthlySummary).map(([month, val]) => ({
          name: month,
          Income: val.income,
          Expense: val.expense,
          Savings: Math.max(0, val.income - val.expense)
        }));
        setMonthlyData(monthlyArray);

        // Transform category breakdown to array for pie chart
        const catArray = Object.entries(catBreakdown)
          .map(([category, amount]) => ({
            name: category,
            value: amount
          }))
          .filter(c => c.value > 0);
        setCategoryData(catArray);

        // Calculations
        let totalIncome = 0;
        let totalExpense = 0;
        monthlyArray.forEach(m => {
          totalIncome += m.Income;
          totalExpense += m.Expense;
        });

        const avgSavingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

        let maxCat = 'N/A';
        let maxAmt = 0;
        catArray.forEach(c => {
          if (c.value > maxAmt) {
            maxAmt = c.value;
            maxCat = c.name;
          }
        });

        setStats({
          avgSavingsRate,
          highestCategory: maxCat,
          highestAmount: maxAmt,
          netWorthChange: totalIncome - totalExpense
        });

      } catch (err) {
        console.error('Failed to load analytics data:', err);
        setError('Failed to fetch analytics metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Analyzing transactions & generating insights...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', animation: 'fadeIn 0.4s ease' }}>
      {error && (
        <div style={{ 
          backgroundColor: 'var(--danger-glow)', 
          border: '1px solid var(--danger)', 
          color: 'var(--danger)', 
          padding: '16px', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px' 
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Analytics Insights Dashboard cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            backgroundColor: 'var(--success-glow)', 
            width: '44px', 
            height: '44px', 
            borderRadius: 'var(--radius-md)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'var(--success)' 
          }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>Overall Net Savings</p>
            <h4 style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px', color: 'var(--text-primary)' }}>
              {formatCurrency(stats.netWorthChange)}
            </h4>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            backgroundColor: 'var(--brand-primary-glow)', 
            width: '44px', 
            height: '44px', 
            borderRadius: 'var(--radius-md)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'var(--brand-primary)' 
          }}>
            <Award size={20} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>Average Savings Rate</p>
            <h4 style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px', color: 'var(--text-primary)' }}>
              {stats.avgSavingsRate.toFixed(1)}%
            </h4>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            backgroundColor: 'var(--danger-glow)', 
            width: '44px', 
            height: '44px', 
            borderRadius: 'var(--radius-md)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'var(--danger)' 
          }}>
            <TrendingDown size={20} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>Peak Spending Group</p>
            <h4 style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }} title={stats.highestCategory}>
              {stats.highestCategory}
            </h4>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Monthly Income vs Expense BarChart */}
        <div className="glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>Income vs Expenses</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Last 5 Months</span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '8px', 
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Savings Trend AreaChart */}
        <div className="glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>Monthly Net Savings Trend</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Accumulation Rate</span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '8px', 
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="Savings" stroke="var(--brand-primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSavings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Category Breakdown PieChart */}
        <div className="glass-card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>Category Breakdown</h3>
            <PieIcon size={16} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            {categoryData.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>
                No expenses logged to visualize.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-secondary)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '8px', 
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px'
                    }} 
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ fontSize: 10 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Categories Share Table */}
        <div className="glass-card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>Expense Volume</h3>
            <Activity size={16} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            {categoryData.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>
                No category details available.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {categoryData.map((cat, idx) => {
                  const totalExpSum = categoryData.reduce((s, c) => s + c.value, 0);
                  const percentage = totalExpSum > 0 ? (cat.value / totalExpSum) * 100 : 0;
                  return (
                    <div key={cat.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                        <span style={{ fontWeight: '500', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            width: '8px', 
                            height: '8px', 
                            borderRadius: '50%', 
                            backgroundColor: COLORS[idx % COLORS.length],
                            display: 'inline-block' 
                          }}></span>
                          {cat.name}
                        </span>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                          {formatCurrency(cat.value)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        height: '6px', 
                        backgroundColor: 'var(--bg-tertiary)', 
                        borderRadius: 'var(--radius-full)', 
                        overflow: 'hidden' 
                      }}>
                        <div style={{ 
                          width: `${percentage}%`, 
                          height: '100%', 
                          backgroundColor: COLORS[idx % COLORS.length],
                          borderRadius: 'var(--radius-full)' 
                        }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
