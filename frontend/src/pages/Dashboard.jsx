import React, { useState, useEffect, useContext } from 'react';
import { LogOut, Plus, Settings as SettingsIcon, PieChart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../utils/api';
import AddTransactionModal from '../components/AddTransactionModal';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Filler, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const resp = await api.get('/transactions/dashboard');
            setData(resp.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleAddTransaction = async (formData) => {
        try {
            const resp = await api.post('/transactions', formData);
            setData(resp.data.dashboardUpdate);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error adding transaction:', error);
            alert('Failed to add transaction.');
        }
    };

    if (loading || !data) {
        return <div className="container" style={{ paddingTop: '80px', textAlign: 'center' }}>Loading your financial data...</div>;
    }

    const { metrics, behavior, nudge } = data;

    const glowClass = metrics.severity === 'Critical' ? 'var(--glow-critical)' :
        metrics.severity === 'Warning' ? 'var(--glow-warning)' : 'var(--glow-safe)';
    const borderClass = metrics.severity === 'Critical' ? 'var(--accent-critical)' :
        metrics.severity === 'Warning' ? 'var(--accent-warning)' : 'var(--accent-safe)';
    const textClass = metrics.severity === 'Critical' ? 'text-critical' :
        metrics.severity === 'Warning' ? 'text-warning' : 'text-safe';

    // Mock chart data - x axis is days, y is spend
    const chartData = {
        labels: Array.from({ length: metrics.daysInMonth }, (_, i) => i + 1),
        datasets: [
            {
                label: 'Cumulative Spend (₹)',
                data: Array.from({ length: metrics.activeDays }, (_, i) => (metrics.totalFoodSpend / metrics.activeDays) * (i + 1)),
                borderColor: borderClass,
                backgroundColor: `${borderClass.replace('var(--', '').replace(')', '')}20`, // pseudo transparency
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Projected',
                data: Array.from({ length: metrics.daysInMonth }, (_, i) => {
                    if (i < metrics.activeDays - 1) return null;
                    const base = (metrics.totalFoodSpend / metrics.activeDays) * metrics.activeDays;
                    const remaining = metrics.daysInMonth - metrics.activeDays;
                    const dailyProj = (metrics.projectedSpend - base) / remaining || 0;
                    return base + (dailyProj * (i - metrics.activeDays + 1));
                }),
                borderColor: 'rgba(161, 161, 170, 0.5)',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
            }
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { mode: 'index', intersect: false }
        },
        scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#71717A' } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#71717A' }, beginAtZero: true }
        }
    };

    return (
        <div className="container" style={{ padding: '40px 24px', position: 'relative', minHeight: '100vh' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h2>Welcome back, {user?.name.split(' ')[0]}</h2>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Link to="/insights" className="btn btn-secondary" style={{ padding: '8px 16px' }}><PieChart size={18} /> Insights</Link>
                    <Link to="/settings" className="btn btn-secondary" style={{ padding: '8px 16px' }}><SettingsIcon size={18} /> Settings</Link>
                    <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '8px 16px', color: 'var(--text-muted)' }}><LogOut size={18} /></button>
                </div>
            </div>

            {/* A) AI NUDGE HERO */}
            <div className="card mb-4" style={{
                border: `1px solid ${borderClass}`,
                boxShadow: glowClass,
                padding: '40px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                        <span className={`badge badge-${metrics.severity.toLowerCase()} mb-2`}>{metrics.severity.toUpperCase()}</span>
                        <h1 className={textClass} style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
                            {nudge}
                        </h1>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Projected Month-End</p>
                        <p style={{ fontSize: '2rem', fontWeight: '700' }}>₹{metrics.projectedSpend.toLocaleString()}</p>
                        <p className={textClass} style={{ fontSize: '0.9rem', marginTop: '4px' }}>
                            Risk: {metrics.severity.toUpperCase()} OVERSHOOT PROBABILITY
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '32px' }}>
                    <div>
                        <p className="text-secondary mb-1">Current Food Spend</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: '600' }}>₹{metrics.totalFoodSpend.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-secondary mb-1">Budget Limit</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: '600' }}>₹{metrics.budget.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* B) SUMMARY METRICS ROW */}
            <div className="grid grid-cols-4 mb-4">
                <div className="card">
                    <p className="text-secondary mb-1">Total Monthly Spend</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>₹{metrics.totalSpend.toLocaleString()}</p>
                </div>
                <div className="card">
                    <p className="text-secondary mb-1">Food Spend</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-safe)' }}>₹{metrics.totalFoodSpend.toLocaleString()}</p>
                </div>
                <div className="card">
                    <p className="text-secondary mb-1">Budget Used</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{metrics.budgetUsedPercent}%</p>
                </div>
                <div className="card">
                    <p className="text-secondary mb-1">Projected Overshoot</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: metrics.projectedSpend > metrics.budget ? 'var(--accent-critical)' : 'var(--text-primary)' }}>
                        {metrics.projectedSpend > metrics.budget ? `+₹${(metrics.projectedSpend - metrics.budget).toLocaleString()}` : '₹0'}
                    </p>
                </div>
            </div>

            {/* C & D) CHART AND PERSONALITY */}
            <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                <div className="card">
                    <h3 className="mb-4">Spending Trend</h3>
                    <div style={{ height: '300px' }}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                        <span style={{ fontSize: '2rem' }}>🧠</span>
                    </div>
                    <h3 className="mb-2 text-safe">{behavior.personality}</h3>
                    <p>{behavior.insights}</p>
                </div>
            </div>

            {/* FLOATING ACTION BUTTON */}
            <button
                onClick={() => setIsModalOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '40px',
                    right: '40px',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-safe)',
                    color: '#0E0E10',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--glow-safe)',
                    transition: 'transform 0.2s',
                    cursor: 'pointer',
                    zIndex: 100
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <Plus size={32} />
            </button>

            <AddTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddTransaction}
            />

        </div>
    );
};

export default Dashboard;
