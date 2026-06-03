import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Edit3, Trash2, Tag, AlertCircle, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter state
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, EXPENSE, INCOME

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'EXPENSE',
    icon: '📌'
  });
  const [formError, setFormError] = useState('');

  // Popular emojis list for easy picking
  const EMOJIS = [
    '🍔', '🚗', '🛍️', '🎬', '💡', '🏥', '📚', '📌', '💼', '💻', 
    '📈', '🏠', '✈️', '🏋️', '☕', '🥦', '🎁', '🐶', '🔌', '💰'
  ];

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await api.getAllCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Error fetching categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setCurrentCategory(null);
    setFormData({
      name: '',
      type: 'EXPENSE',
      icon: '📌'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setCurrentCategory(cat);
    setFormData({
      name: cat.name,
      type: cat.type,
      icon: cat.icon || '📌'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    try {
      setLoading(true);
      if (currentCategory) {
        await api.updateCategory(currentCategory.id, formData);
      } else {
        await api.createCategory(formData);
      }
      setIsModalOpen(false);
      await loadCategories();
    } catch (err) {
      setFormError(err.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? Any transactions in this category will remain, but the category association might be broken.')) return;
    try {
      setLoading(true);
      await api.deleteCategory(id);
      await loadCategories();
    } catch (err) {
      setError('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(c => {
    if (typeFilter === 'ALL') return true;
    return c.type === typeFilter;
  });

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

      {/* Control bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '16px', 
        marginBottom: '24px' 
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'EXPENSE', 'INCOME'].map(filter => (
            <button
              key={filter}
              onClick={() => setTypeFilter(filter)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
                backgroundColor: typeFilter === filter ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                color: typeFilter === filter ? '#fff' : 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: typeFilter === filter ? 'var(--shadow-glow)' : 'none'
              }}
            >
              {filter === 'ALL' ? 'All Types' : filter === 'EXPENSE' ? 'Expenses' : 'Income'}
            </button>
          ))}
        </div>

        <button 
          onClick={openAddModal}
          style={{
            padding: '10px 20px',
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
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* Grid of Categories */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
        gap: '20px' 
      }}>
        {filteredCategories.length === 0 ? (
          <div style={{ 
            gridColumn: '1 / -1', 
            padding: '60px', 
            textAlign: 'center', 
            color: 'var(--text-secondary)' 
          }} className="glass-card">
            No categories found. Create a new one to get started!
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <motion.div
              layout
              key={cat.id}
              className="gradient-border-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '140px',
                padding: '20px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '32px' }}>{cat.icon || '📌'}</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: cat.type === 'EXPENSE' ? 'var(--danger-glow)' : 'var(--success-glow)',
                  color: cat.type === 'EXPENSE' ? 'var(--danger)' : 'var(--success)'
                }}>
                  {cat.type}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px' }}>
                <div>
                  <h4 style={{ fontWeight: '600', fontSize: '16px', color: 'var(--text-primary)' }}>{cat.name}</h4>
                </div>
                
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => openEditModal(cat)}
                    style={{
                      border: 'none',
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-secondary)',
                      padding: '6px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                    title="Edit"
                    className="btn-icon"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    style={{
                      border: 'none',
                      background: 'var(--bg-tertiary)',
                      color: 'var(--danger)',
                      padding: '6px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                    title="Delete"
                    className="btn-icon"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
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
                maxWidth: '440px',
                padding: '30px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {currentCategory ? 'Edit Category' : 'Create Category'}
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
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Category Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Travel, Gym, Dividends"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    style={{ height: '40px' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Type</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {['EXPENSE', 'INCOME'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type }))}
                        style={{
                          flex: 1,
                          height: '40px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          backgroundColor: formData.type === type ? 'var(--brand-primary)' : 'var(--bg-primary)',
                          color: formData.type === type ? '#fff' : 'var(--text-secondary)',
                          fontWeight: '600',
                          fontSize: '13px'
                        }}
                      >
                        {type === 'EXPENSE' ? 'Expense' : 'Income'}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Select Icon / Emoji</label>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(7, 1fr)', 
                    gap: '8px', 
                    padding: '10px', 
                    backgroundColor: 'var(--bg-primary)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: 'var(--radius-sm)',
                    maxHeight: '120px',
                    overflowY: 'auto'
                  }}>
                    {EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon: emoji }))}
                        style={{
                          fontSize: '22px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '40px',
                          border: '1px solid ' + (formData.icon === emoji ? 'var(--brand-primary)' : 'transparent'),
                          backgroundColor: formData.icon === emoji ? 'var(--brand-primary-glow)' : 'transparent',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
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
                    <Save size={16} /> Save Category
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

export default Categories;
