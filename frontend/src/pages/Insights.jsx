import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Activity, Calendar, Zap, HeartPulse } from 'lucide-react';
import api from '../utils/api';

const Insights = () => {
    const [behavior, setBehavior] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                // We're reusing the dashboard endpoint to get the behavior object
                // In a fuller app, we'd have a dedicated detailed /insights endpoint
                const resp = await api.get('/transactions/dashboard');
                setBehavior(resp.data.behavior);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, []);

    if (loading || !behavior) {
        return <div className="container text-center" style={{ paddingTop: '80px' }}>Loading Insights...</div>;
    }

    // Mocking computed insights that would come from an advanced backend analysis
    const healthScore = behavior.personality === 'Weekend Splurger' ? 58 : 84;

    return (
        <div className="container" style={{ padding: '40px 24px' }}>
            <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px', color: 'var(--text-secondary)' }}>
                <ArrowLeft size={18} /> Back to Dashboard
            </Link>

            <h1 className="mb-8">Behavioral Insights</h1>

            <div className="grid grid-cols-3 mb-8">
                {/* Health Score Component */}
                <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <HeartPulse size={48} className={healthScore > 70 ? 'text-safe' : 'text-warning'} style={{ marginBottom: '16px' }} />
                    <p className="text-secondary mb-2">Financial Health Score</p>
                    <div style={{ fontSize: '4rem', fontWeight: '800', lineHeight: 1, color: healthScore > 70 ? 'var(--accent-safe)' : 'var(--accent-warning)' }}>
                        {healthScore}
                        <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>/100</span>
                    </div>
                </div>

                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <h3 className="mb-4">Score Breakdown</h3>

                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>Budget Discipline</span>
                            <span className={healthScore > 70 ? 'text-safe' : 'text-warning'}>{healthScore > 70 ? 'High' : 'Moderate'}</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${healthScore > 70 ? 80 : 50}%`, height: '100%', backgroundColor: healthScore > 70 ? 'var(--accent-safe)' : 'var(--accent-warning)' }}></div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>Savings Ratio (Projected)</span>
                            <span className="text-safe">Excellent</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: '90%', height: '100%', backgroundColor: 'var(--accent-safe)' }}></div>
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>Stability</span>
                            <span className="text-safe">Stable</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: '75%', height: '100%', backgroundColor: 'var(--accent-safe)' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <h3 className="mb-4">Pattern Detection</h3>
            <div className="grid grid-cols-3">
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-warning)' }}>
                            <Calendar size={24} />
                        </div>
                        <h4 className="mb-0">Weekend Bias</h4>
                    </div>
                    <p style={{ fontSize: '0.95rem' }}>{behavior.insights}</p>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-safe)' }}>
                            <Zap size={24} />
                        </div>
                        <h4 className="mb-0">Habit Detection</h4>
                    </div>
                    <p style={{ fontSize: '0.95rem' }}>You frequent <strong>Swiggy</strong> approximately 3 times a week. Bulk cooking on Sundays might save you ₹4,500/month.</p>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-critical)' }}>
                            <Activity size={24} />
                        </div>
                        <h4 className="mb-0">Volatility Analysis</h4>
                    </div>
                    <p style={{ fontSize: '0.95rem' }}>Your daily spending variance is high. Try flattening your expenses to avoid end-of-month cash crunches.</p>
                </div>
            </div>

        </div>
    );
};

export default Insights;
