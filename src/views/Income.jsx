import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import { Plus, Edit3, Trash2, Calendar, Filter, X, Save, AlertCircle, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Income = () => {
  const [incomeList, setIncomeList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIncome, setCurrentIncome] = useState(null); // Null for add, object for edit
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    source: '',
    category: '', 
    amount: ''
  });
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [incList, catList] = await Promise.all([
        api.getAllIncome(),
        api.getAllCategories()
      ]);
      setIncomeList(incList || []);
      setCategories((catList || []).filter(c => c.type === 'INCOME'));
    } catch (err) {
      console.error('Error fetching income:', err);
      setError('Failed to load income data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
  };

  const getFilteredIncome = () => {
    return incomeList.filter(item => {
      const matchCategory = !filterCategory || item.category === filterCategory;
      const matchFrom = !filterFrom || item.date >= filterFrom;
      const matchTo = !filterTo || item.date <= filterTo;
      return matchCategory && matchFrom && matchTo;
    });
  };

  const resetFilters = () => {
    setFilterCategory('');
    setFilterFrom('');
    setFilterTo('');
  };

  const openAddModal = () => {
    setCurrentIncome(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      source: '',
      category: categories[0]?.name || 'Salary',
      amount: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (income) => {
    setCurrentIncome(income);
    setFormData({
      date: income.date,
      source: income.source,
      category: income.category,
      amount: income.amount.toString()
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const { date, source, category, amount } = formData;
    if (!date || !source || !category || !amount) {
      setFormError('Please fill in all fields.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid amount greater than 0.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        date,
        source,
        category,
        amount: numAmount
      };

      if (currentIncome) {
        await api.updateIncome(currentIncome.id, payload);
      } else {
        await api.createIncome(payload);
      }
      
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setFormError(err.message || 'Failed to save income log');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income record?')) return;
    try {
      setLoading(true);
      await api.deleteIncome(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete income log');
    } finally {
      setLoading(false);
    }
  };

  const filteredIncome = getFilteredIncome();
  const totalIncome = filteredIncome.reduce((acc, item) => acc + item.amount, 0);

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

      {/* Header Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            backgroundColor: 'var(--success-glow)', 
            width: '48px', 
            height: '48px', 
            borderRadius: 'var(--radius-md)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'var(--success)' 
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Filtered Total Income</p>
            <h3 className="text-gradient-success" style={{ fontSize: '28px', fontWeight: '700', marginTop: '4px' }}>
              {formatCurrency(totalIncome)}
            </h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            backgroundColor: 'var(--brand-primary-glow)', 
            width: '48px', 
            height: '48px', 
            borderRadius: 'var(--radius-md)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'var(--brand-primary)' 
          }}>
            <Calendar size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Transactions Count</p>
            <h3 style={{ fontSize: '28px', fontWeight: '700', marginTop: '4px', color: 'var(--text-primary)' }}>
              {filteredIncome.length}
            </h3>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="glass-card" style={{ marginBottom: '24px', padding: '20px' }}>
        <form onSubmit={handleFilterSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Category</label>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ width: '100%', height: '40px', cursor: 'pointer' }}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>From Date</label>
            <input 
              type="date" 
              value={filterFrom} 
              onChange={(e) => setFilterFrom(e.target.value)}
              style={{ width: '100%', height: '40px' }}
            />
          </div>

          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>To Date</label>
            <input 
              type="date" 
              value={filterTo} 
              onChange={(e) => setFilterTo(e.target.value)}
              style={{ width: '100%', height: '40px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {(filterCategory || filterFrom || filterTo) && (
              <button 
                type="button" 
                onClick={resetFilters}
                className="btn"
                style={{ 
                  height: '40px', 
                  padding: '0 16px', 
                  backgroundColor: 'var(--bg-tertiary)', 
                  border: '1px solid var(--border-color)', 
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <X size={16} /> Reset
              </button>
            )}

            <button 
              type="button"
              onClick={openAddModal}
              className="btn"
              style={{ 
                height: '40px', 
                padding: '0 20px', 
                backgroundColor: 'var(--brand-primary)', 
                border: 'none', 
                color: '#fff',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              <Plus size={18} /> Add Income
            </button>
          </div>
        </form>
      </div>

      {/* Income List Table */}
      <div className="glass-card" style={{ padding: '0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>DATE</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>SOURCE</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>CATEGORY</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>AMOUNT</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncome.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '15px' }}>
                  No income transactions found matching the selected filters.
                </td>
              </tr>
            ) : (
              filteredIncome.map((item) => (
                <tr 
                  key={item.id} 
                  style={{ 
                    borderBottom: '1px solid var(--border-color)', 
                    transition: 'background-color 0.2s ease'
                  }}
                  className="table-row-hover"
                >
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-primary)' }}>{formatDate(item.date)}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{item.source}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px' }}>
                    <span style={{ 
                      backgroundColor: 'var(--success-glow)', 
                      color: 'var(--success)', 
                      padding: '4px 10px', 
                      borderRadius: 'var(--radius-full)', 
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {item.category}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '15px', fontWeight: '600', color: 'var(--success)' }}>
                    {formatCurrency(item.amount)}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button 
                        onClick={() => openEditModal(item)}
                        style={{ 
                          border: 'none', 
                          background: 'none', 
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px'
                        }}
                        title="Edit"
                        className="btn-icon"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        style={{ 
                          border: 'none', 
                          background: 'none', 
                          color: 'var(--danger)',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px'
                        }}
                        title="Delete"
                        className="btn-icon"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Popup */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="glass-card"
              style={{
                width: '100%',
                maxWidth: '480px',
                padding: '30px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {currentIncome ? 'Edit Income Log' : 'Add Income Log'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  style={{ border: 'none', background: 'none', color: 'var(--text-secondary)' }}
                >
                  <X size={20} />
                </button>
              </div>

              {formError && (
                <div style={{ 
                  backgroundColor: 'var(--danger-glow)', 
                  border: '1px solid var(--danger)', 
                  color: 'var(--danger)', 
                  padding: '12px', 
                  borderRadius: 'var(--radius-sm)', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px'
                }}>
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Date</label>
                  <input 
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    style={{ height: '40px' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Source / Description</label>
                  <input 
                    type="text"
                    name="source"
                    placeholder="e.g. Monthly salary, Freelance, etc."
                    value={formData.source}
                    onChange={handleInputChange}
                    style={{ height: '40px' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Category</label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    style={{ height: '40px', cursor: 'pointer' }}
                    required
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Amount (₹)</label>
                  <input 
                    type="number"
                    name="amount"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleInputChange}
                    style={{ height: '40px' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    style={{ 
                      flex: 1,
                      height: '42px', 
                      backgroundColor: 'var(--bg-tertiary)', 
                      border: '1px solid var(--border-color)', 
                      color: 'var(--text-primary)',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: '600'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    style={{ 
                      flex: 1,
                      height: '42px', 
                      backgroundColor: 'var(--brand-primary)', 
                      border: 'none', 
                      color: '#fff',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: 'var(--shadow-glow)'
                    }}
                  >
                    <Save size={16} /> Save Log
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Income;
