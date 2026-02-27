import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddTransactionModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        amount: '',
        merchant: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onAdd(formData);
        setLoading(false);
        setFormData({ amount: '', merchant: '', category: 'Food', date: new Date().toISOString().split('T')[0] });
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(14, 14, 16, 0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', animation: 'slideUp 0.3s ease-out' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 className="mb-0">Add Expense</h3>
                    <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Amount (₹)</label>
                        <input
                            type="number"
                            className="form-input"
                            required
                            autoFocus
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Merchant</label>
                        <input
                            type="text"
                            className="form-input"
                            required
                            placeholder="e.g., Swiggy, Starbucks"
                            value={formData.merchant}
                            onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 mb-4">
                        <div className="form-group mb-0">
                            <label className="form-label">Category</label>
                            <select
                                className="form-input"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="Food">Food & Dining</option>
                                <option value="Transport">Transport</option>
                                <option value="Shopping">Shopping</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group mb-0">
                            <label className="form-label">Date</label>
                            <input
                                type="date"
                                className="form-input"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Processing...' : 'Add & Recalculate'}
                    </button>
                </form>
            </div>

            <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
        </div>
    );
};

export default AddTransactionModal;
