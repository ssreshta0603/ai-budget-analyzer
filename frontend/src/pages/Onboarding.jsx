import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../contexts/AuthContext';

const Onboarding = () => {
    const [formData, setFormData] = useState({
        monthlyIncome: '',
        savingsGoalPercent: '20',
        foodBudget: '',
        alertThreshold: '80',
        coachStyle: 'Balanced'
    });
    const [loading, setLoading] = useState(false);
    const { updateUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                monthlyIncome: Number(formData.monthlyIncome),
                savingsGoalPercent: Number(formData.savingsGoalPercent),
                foodBudget: Number(formData.foodBudget),
                alertThreshold: Number(formData.alertThreshold),
                coachStyle: formData.coachStyle,
                onboardingComplete: true
            };

            const { data } = await api.put('/users/profile', payload);
            updateUser(data);
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            alert('Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
            <div className="card" style={{ width: '100%', maxWidth: '600px' }}>
                <h2 className="mb-2 text-center">Personalize Your AI Coach</h2>
                <p className="mb-4 text-center">Tell us a bit about your finances so we can tailor our predictions.</p>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 mb-4">
                        <div className="form-group mb-0">
                            <label className="form-label">Monthly Income (₹)</label>
                            <input
                                type="number"
                                className="form-input"
                                required
                                placeholder="e.g., 50000"
                                value={formData.monthlyIncome}
                                onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                            />
                        </div>
                        <div className="form-group mb-0">
                            <label className="form-label">Savings Goal %</label>
                            <input
                                type="number"
                                className="form-input"
                                required
                                placeholder="20"
                                value={formData.savingsGoalPercent}
                                onChange={(e) => setFormData({ ...formData, savingsGoalPercent: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 mb-4">
                        <div className="form-group mb-0">
                            <label className="form-label text-warning">Food & Dining Budget (₹)</label>
                            <input
                                type="number"
                                className="form-input"
                                required
                                placeholder="e.g., 8000"
                                value={formData.foodBudget}
                                onChange={(e) => setFormData({ ...formData, foodBudget: e.target.value })}
                            />
                        </div>
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
                    </div>

                    <div className="form-group mb-8">
                        <label className="form-label">AI Coach Personality</label>
                        <div className="grid grid-cols-2" style={{ gap: '12px' }}>
                            {['Friendly', 'Balanced', 'Strict', 'Sarcastic'].map((style) => (
                                <button
                                    type="button"
                                    key={style}
                                    className={`btn ${formData.coachStyle === style ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ padding: '12px' }}
                                    onClick={() => setFormData({ ...formData, coachStyle: style })}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                        <p className="mt-2 text-muted" style={{ fontSize: '0.85rem', marginTop: '8px' }}>
                            {formData.coachStyle === 'Sarcastic' && "Expect to be roasted when you overspend."}
                            {formData.coachStyle === 'Strict' && "No nonsense. Just facts and immediate warnings."}
                            {formData.coachStyle === 'Friendly' && "Gentle nudges and encouragement."}
                            {formData.coachStyle === 'Balanced' && "A mix of encouragement and reality checks."}
                        </p>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Processing...' : 'Enter Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;
