import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Activity, Calendar, Zap, HeartPulse } from 'lucide-react';
import api from '../utils/api';

const Insights = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const resp = await api.get('/transactions/insights');
                setData(resp.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, []);

    if (loading || !data) {
        return <div className="container text-center" style={{ paddingTop: '80px' }}>Analyzing your financial patterns...</div>;
    }

    const { behavior, metrics, stats, aiInsights } = data;
    const healthScore = metrics.healthScore;

    return (
        <div className="container" style={{ padding: '40px 24px' }}>
            <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px', color: 'var(--text-secondary)' }}>
                <ArrowLeft size={18} /> Back to Dashboard
            </Link>

            <h1 className="mb-2">Your Financial Mindset</h1>
            <p className="text-secondary mb-8">Personalized analysis based on this month's activity.</p>

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
                            <span className={healthScore > 70 ? 'text-safe' : 'text-warning'}>{healthScore > 85 ? 'Excellent' : (healthScore > 70 ? 'Good' : 'Needs Work')}</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${healthScore}%`, height: '100%', backgroundColor: healthScore > 70 ? 'var(--accent-safe)' : 'var(--accent-warning)' }}></div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>Spending Stability</span>
                            <span className={stats?.volatility < 1000 ? 'text-safe' : 'text-warning'}>{stats?.volatility < 1000 ? 'High' : 'Moderate'}</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.max(30, 100 - (stats?.volatility / 50))}%`, height: '100%', backgroundColor: stats?.volatility < 1000 ? 'var(--accent-safe)' : 'var(--accent-warning)' }}></div>
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>Savings Potential</span>
                            <span className="text-safe">Analyzing...</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: '75%', height: '100%', backgroundColor: 'var(--accent-safe)' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>AI Behavioral Analysis</h3>
                <span className="badge badge-safe">LIVE</span>
            </div>

            <div className="grid grid-cols-3 mb-8">
                <div className="card" style={{ borderLeft: '4px solid var(--accent-warning)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-warning)' }}>
                            <Calendar size={24} />
                        </div>
                        <h4 className="mb-0">Habit Detection</h4>
                    </div>
                    <p style={{ fontSize: '0.95rem' }}>{aiInsights.habitInsight}</p>
                </div>

                <div className="card" style={{ borderLeft: '4px solid var(--accent-safe)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-safe)' }}>
                            <Zap size={24} />
                        </div>
                        <h4 className="mb-0">Actionable Tip</h4>
                    </div>
                    <p style={{ fontSize: '0.95rem' }}>{aiInsights.actionableTip}</p>
                </div>

                <div className="card" style={{ borderLeft: '4px solid var(--accent-critical)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-critical)' }}>
                            <Activity size={24} />
                        </div>
                        <h4 className="mb-0">Volatility Analysis</h4>
                    </div>
                    <p style={{ fontSize: '0.95rem' }}>{aiInsights.volatilityInsight}</p>
                </div>
            </div>

            {stats && (
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="card">
                        <h3 className="mb-4">Top Merchants This Month</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {stats.topMerchants.map((m, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)' }}>
                                    <span style={{ fontWeight: '600' }}>{m.name}</span>
                                    <span className="text-safe">₹{m.amount.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="mb-4">Spending Distribution</h3>
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', height: '40px', borderRadius: '20px', overflow: 'hidden', marginBottom: '20px' }}>
                                <div style={{ width: `${stats.weekendVsWeekday.weekend}%`, backgroundColor: 'var(--accent-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '0.8rem', fontWeight: '700' }}>
                                    {stats.weekendVsWeekday.weekend}% Weekend
                                </div>
                                <div style={{ width: `${stats.weekendVsWeekday.weekday}%`, backgroundColor: 'var(--accent-safe)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '0.8rem', fontWeight: '700' }}>
                                    {stats.weekendVsWeekday.weekday}% Weekday
                                </div>
                            </div>
                            <p className="text-secondary">Your favorite day to spend is <strong>{stats.favoriteDay}</strong>.</p>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Insights;
