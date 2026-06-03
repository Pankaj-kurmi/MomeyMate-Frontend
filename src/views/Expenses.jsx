import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import { Plus, Edit3, Trash2, Calendar, Filter, X, Save, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null); // Null for add, object for edit
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: '', // category name string
    amount: ''
  });
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [expList, catList] = await Promise.all([
        api.getAllExpenses(),
        api.getAllCategories()
      ]);
      setExpenses(expList || []);
      setCategories((catList || []).filter(c => c.type === 'EXPENSE'));
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to load expenses data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFilterSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const filters = {};
      if (filterCategory) filters.category = filterCategory;
      if (filterFrom) filters.fromDate = filterFrom;
      if (filterTo) filters.toDate = filterTo;
      
      const filtered = await api.filterExpenses(filters);
      setExpenses(filtered || []);
    } catch (err) {
      console.error('Error filtering expenses:', err);
      setError('Failed to filter expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilterCategory('');
    setFilterFrom('');
    setFilterTo('');
    loadData();
  };

  const openAddModal = () => {
    const defaultCatName = categories.length > 0 ? categories[0].name : '';
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: defaultCatName,
      amount: ''
    });
    setFormError('');
    setCurrentExpense(null);
    setIsModalOpen(true);
  };

  const openEditModal = (expense) => {
    setFormData({
      date: expense.date,
      description: expense.description,
      category: expense.category,
      amount: expense.amount
    });
    setFormError('');
    setCurrentExpense(expense);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        setLoading(true);
        await api.deleteExpense(id);
        await loadData();
      } catch (err) {
        console.error('Failed to delete expense', err);
        setError('Failed to delete expense');
        setLoading(false);
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const { date, description, category, amount } = formData;
    if (!date || !description || !category || !amount) {
      setFormError('Please fill in all fields.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setFormError('Please enter a valid positive amount.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        date,
        description,
        category,
        amount: numericAmount
      };

      if (currentExpense) {
        await api.updateExpense(currentExpense.id, payload);
      } else {
        await api.createExpense(payload);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Error saving expense:', err);
      setFormError('Failed to save expense');
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>Expenses</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Manage and analyze your outward payments</p>
        </div>
        <button 
          onClick={openAddModal}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
        >
          <Plus size={16} />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Filter Form Card */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <form onSubmit={handleFilterSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Category</label>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>From Date</label>
            <input 
              type="date" 
              value={filterFrom} 
              onChange={(e) => setFilterFrom(e.target.value)}
              style={{ width: '100%', height: '42px', padding: '0 12px' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>To Date</label>
            <input 
              type="date" 
              value={filterTo} 
              onChange={(e) => setFilterTo(e.target.value)}
              style={{ width: '100%', height: '42px', padding: '0 12px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="submit" 
              className="btn btn-secondary" 
              style={{ height: '42px', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px' }}
            >
              <Filter size={16} />
              <span>Filter</span>
            </button>
            {(filterCategory || filterFrom || filterTo) && (
              <button 
                type="button" 
                onClick={handleResetFilters}
                className="btn btn-secondary" 
                style={{ height: '42px', padding: '0 14px', border: '1px solid transparent', backgroundColor: 'transparent' }}
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Main Expenses Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--brand-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : expenses.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <h3>No Expenses Found</h3>
          <p style={{ marginTop: '6px' }}>Try adjusting your filters or add a new expense transaction.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>DATE</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>DESCRIPTION</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>CATEGORY</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>AMOUNT</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr 
                    key={expense.id} 
                    style={{ borderBottom: '1px solid var(--border-color)' }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-primary)' }}>{formatDate(expense.date)}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500' }}>{expense.description}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px' }}>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        padding: '4px 10px', 
                        borderRadius: 'var(--radius-full)', 
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--brand-primary)',
                        border: '1px solid var(--border-color)'
                      }}>
                        {expense.category}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '15px', color: 'var(--danger)', fontWeight: '700' }}>
                      {formatCurrency(expense.amount)}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => openEditModal(expense)}
                          className="btn btn-secondary" 
                          style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(expense.id)}
                          className="btn btn-secondary" 
                          style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)' }}
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal - AnimatePresence */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card" 
              style={{ width: '100%', maxWidth: '500px', padding: '32px', border: '1px solid var(--border-color)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '850', color: 'var(--text-primary)' }}>
                  {currentExpense ? 'Edit Expense' : 'Add Expense'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {formError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontSize: '13px', backgroundColor: 'rgba(239,68,68,0.1)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Date</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.date} 
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Description</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Weekly grocery bills" 
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Category</label>
                  <select 
                    required 
                    value={formData.category} 
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Amount (₹)</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="0.00" 
                    value={formData.amount} 
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="btn btn-secondary" 
                    style={{ flex: 1, height: '44px' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ flex: 1, height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Save size={16} />
                    <span>Save Transaction</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .table-row-hover {
          transition: background-color 0.2s ease;
        }
        .table-row-hover:hover {
          background-color: var(--bg-secondary) !important;
        }
      `}</style>
    </div>
  );
};

export default Expenses;
