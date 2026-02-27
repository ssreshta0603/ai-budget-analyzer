import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../utils/api';

const Settings = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        monthlyIncome: '',
        foodBudget: '',
        alertThreshold: '80',
        coachStyle: 'Balanced'
    });
    const [saving, setSaving] = useState(false);
    const [clearing, setClearing] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                monthlyIncome: user.monthlyIncome || '',
                foodBudget: user.foodBudget || '',
                alertThreshold: user.alertThreshold || '80',
                coachStyle: user.coachStyle || 'Balanced'
            });
        }
    }, [user]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await api.put('/users/profile', formData);
            updateUser(data);
            alert('Settings updated automatically. Your LLM Coach has been notified.');
        } catch (error) {
            console.error(error);
            alert('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const handleClearTransactions = async () => {
        if (window.confirm("Are you sure you want to clear all transactions for this month? This cannot be undone.")) {
            setClearing(true);
            try {
                await api.delete('/transactions/all');
                alert('Transactions cleared successfully.');
            } catch (error) {
                console.error(error);
            } finally {
                setClearing(false);
            }
        }
    };

    return (
        <div className="container" style={{ padding: '40px 24px', maxWidth: '800px' }}>
            <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px', color: 'var(--text-secondary)' }}>
                <ArrowLeft size={18} /> Back to Dashboard
            </Link>

            <h1 className="mb-8">Application Settings</h1>

            <div className="card mb-8">
                <h3 className="mb-4">Budget Parameters</h3>
                <form onSubmit={handleSave}>
                    <div className="grid grid-cols-2 mb-4">
                        <div className="form-group mb-0">
                            <label className="form-label">Monthly Income (₹)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.monthlyIncome}
                                onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                            />
                        </div>
                        <div className="form-group mb-0">
                            <label className="form-label">Monthly Food Budget (₹)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.foodBudget}
                                onChange={(e) => setFormData({ ...formData, foodBudget: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 mb-6">
                        <div className="form-group mb-0">
                            <label className="form-label">Alert Threshold %</label>
                            <select
                                className="form-input"
                                value={formData.alertThreshold}
                                onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
                            >
                                <option value="60">60% (Strict)</option>
                                <option value="70">70% (Moderate)</option>
                                <option value="80">80% (Relaxed)</option>
                                <option value="90">90% (Risky)</option>
                            </select>
                        </div>
                        <div className="form-group mb-0">
                            <label className="form-label">Coach Style</label>
                            <select
                                className="form-input"
                                value={formData.coachStyle}
                                onChange={(e) => setFormData({ ...formData, coachStyle: e.target.value })}
                            >
                                <option value="Friendly">Friendly</option>
                                <option value="Balanced">Balanced</option>
                                <option value="Strict">Strict</option>
                                <option value="Sarcastic">Sarcastic</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                    <p className="mt-2 text-muted" style={{ fontSize: '0.85rem' }}>
                        Updating these values will immediately recalculate your dashboard projections.
                    </p>
                </form>
            </div>

            <div className="card" style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <h3 className="mb-2 text-critical">Danger Zone</h3>
                <p className="mb-4 text-secondary">Reset your month or clear all spending history.</p>
                <button
                    onClick={handleClearTransactions}
                    className="btn btn-outline"
                    style={{ borderColor: 'var(--accent-critical)', color: 'var(--accent-critical)' }}
                    disabled={clearing}
                >
                    <Trash2 size={18} /> {clearing ? 'Clearing...' : 'Clear All Transactions'}
                </button>
            </div>
        </div>
    );
};

export default Settings;
