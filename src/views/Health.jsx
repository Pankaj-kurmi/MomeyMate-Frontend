import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { motion } from 'framer-motion';
import { HeartPulse, ShieldCheck, AlertTriangle, Lightbulb, RefreshCw, BarChart2, ShieldAlert } from 'lucide-react';

const Health = () => {
  const [health, setHealth] = useState(null);
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      setError('');
      const [scoreData, indData] = await Promise.all([
        api.getHealthScore(),
        api.getHealthIndicators()
      ]);
      setHealth(scoreData);
      setIndicators(indData || []);
    } catch (err) {
      console.error('Failed to load health metrics', err);
      setError('Error loading financial health metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  const getHealthColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getIndicatorStatus = (name, value) => {
    if (name.includes('Savings')) {
      if (value >= 20) return { label: 'Excellent', color: 'var(--success)' };
      if (value >= 10) return { label: 'Fair', color: 'var(--warning)' };
      return { label: 'Needs Action', color: 'var(--danger)' };
    }
    if (name.includes('Debt')) {
      if (value < 36) return { label: 'Excellent', color: 'var(--success)' };
      if (value <= 50) return { label: 'Moderate', color: 'var(--warning)' };
      return { label: 'High Risk', color: 'var(--danger)' };
    }
    if (name.includes('Utilization')) {
      if (value < 30) return { label: 'Healthy', color: 'var(--success)' };
      if (value <= 50) return { label: 'Caution', color: 'var(--warning)' };
      return { label: 'High Utilization', color: 'var(--danger)' };
    }
    if (name.includes('Liquid')) {
      if (value >= 3.0) return { label: 'Adequate', color: 'var(--success)' };
      if (value >= 1.5) return { label: 'Vulnerable', color: 'var(--warning)' };
      return { label: 'Critical', color: 'var(--danger)' };
    }
    return { label: 'Good', color: 'var(--success)' };
  };

  const generateRecommendations = () => {
    const recs = [];
    if (!health) return recs;

    const savings = indicators.find(i => i.name.includes('Savings'))?.value || 0;
    const dti = indicators.find(i => i.name.includes('Debt'))?.value || 0;
    const util = indicators.find(i => i.name.includes('Utilization'))?.value || 0;
    const liquid = indicators.find(i => i.name.includes('Liquid'))?.value || 0;

    if (savings < 20) {
      recs.push({
        id: 1,
        title: 'Increase monthly savings rate',
        desc: `Your current savings rate is ${savings.toFixed(1)}%. Try cutting discretionary expenditures by 10% to achieve the recommended 20% target.`
      });
    }
    if (dti > 36) {
      recs.push({
        id: 2,
        title: 'Focus on high-interest debt payoff',
        desc: `Your debt-to-income ratio is ${dti.toFixed(1)}%. Prioritize paying off debts using the snowball or avalanche method.`
      });
    }
    if (util > 30) {
      recs.push({
        id: 3,
        title: 'Reduce credit card spending',
        desc: `Utilization is at ${util.toFixed(1)}%. Try to pay off credit card balances twice per month or request a limit increase to bring utilization below 30%.`
      });
    }
    if (liquid < 3.0) {
      recs.push({
        id: 4,
        title: 'Build an emergency buffer',
        desc: `Your emergency savings covers only ${liquid.toFixed(1)} months of expenses. Set up automatic transfers to a high-yield savings account until you have a 3-6 month reserve.`
      });
    }

    if (recs.length === 0) {
      recs.push({
        id: 5,
        title: 'Maintain your current structure',
        desc: 'Congratulations! All of your indicators meet or exceed benchmark standards. Keep automating your investments and tracking monthly cashflow.'
      });
    }

    return recs;
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
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: '500' }}>Evaluating financial health indices...</p>
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

  const recommendations = generateRecommendations();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto', padding: '16px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>Financial Health</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Smart analysis of cash flow, liquidity, and leverage ratios</p>
        </div>
        <button
          onClick={fetchHealthData}
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
          <span>Refresh Analysis</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Score gauge card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            {/* SVG circular track */}
            <svg style={{ transform: 'rotate(-90deg)', width: '160px', height: '160px' }}>
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="var(--border-color)"
                strokeWidth="10"
                fill="transparent"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                stroke={getHealthColor(health.score)}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={440}
                initial={{ strokeDashoffset: 440 }}
                animate={{ strokeDashoffset: 440 - (440 * health.score) / 100 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                strokeLinecap="round"
              />
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{health.score}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Out of 100</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <HeartPulse size={20} style={{ color: getHealthColor(health.score) }} />
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>{health.status}</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '280px', margin: '0 auto' }}>
            Your financial behavior indices demonstrate a {health.status.toLowerCase()} position. Keep refining parameters.
          </p>
        </div>

        {/* Indicators list */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart2 size={18} style={{ color: 'var(--brand-primary)' }} />
            <span>Health Metrics</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {indicators.map((ind, idx) => {
              const status = getIndicatorStatus(ind.name, ind.value);
              const isMonths = ind.name.includes('Months') || ind.name.includes('Liquid');
              const displayVal = isMonths ? `${ind.value.toFixed(1)} mo` : `${ind.value.toFixed(1)}%`;
              
              // Normalize progress for rendering
              let pct = ind.value;
              if (isMonths) pct = Math.min(100, (ind.value / 6.0) * 100); // Scale 6 months to 100%
              else pct = Math.min(100, ind.value);

              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{ind.name}</span>
                    <span style={{ color: status.color, fontWeight: '700' }}>{displayVal} ({status.label})</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '999px', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                      style={{ height: '100%', background: status.color, borderRadius: '999px' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recommendations card */}
      <div className="glass-card" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Lightbulb size={20} style={{ color: 'var(--warning)' }} />
          <span>Smart Insights & Recommendations</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{rec.title}</h4>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5' }}>
                {rec.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Health;
