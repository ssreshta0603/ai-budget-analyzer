import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px' }}>

            {/* Hero Section */}
            <div className="text-center mb-8" style={{ maxWidth: '800px', margin: '0 auto 80px auto' }}>
                <h1 style={{ fontSize: '3.5rem', marginBottom: '24px' }}>
                    AI Budget Coach That Understands Your <span className="text-gradient">Spending Behavior</span>
                </h1>
                <p style={{ fontSize: '1.25rem', marginBottom: '40px', color: 'var(--text-secondary)' }}>
                    Predict overspending before it happens with dynamic nudges tailored to your financial personality.
                </p>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <Link to="/signup" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
                        Start Free Analysis &rarr;
                    </Link>
                    <Link to="/login" className="btn btn-secondary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
                        Login
                    </Link>
                </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-3 mb-8">
                <div className="card">
                    <h3 className="mb-2" style={{ color: 'var(--accent-safe)' }}>Behavioral Forecasting</h3>
                    <p>We analyze your daily habits to predict end-of-month shortfalls before you even open your wallet.</p>
                </div>
                <div className="card">
                    <h3 className="mb-2" style={{ color: 'var(--accent-safe)' }}>AI Personality Nudges</h3>
                    <p>Choose your coach style—from friendly guidance to sarcastic reality checks—to keep you on track.</p>
                </div>
                <div className="card">
                    <h3 className="mb-2" style={{ color: 'var(--accent-safe)' }}>Overspending Risk Detection</h3>
                    <p>Instantly know if a purchase pushes you across the threshold of your customized alert metrics.</p>
                </div>
            </div>

            {/* Mini Dashboard Preview */}
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h4 className="text-center mb-4 text-secondary">See It In Action</h4>
                <div className="card" style={{ border: '1px solid var(--accent-warning)', boxShadow: 'var(--glow-warning)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <span className="badge badge-warning">WARNING</span>
                        <span style={{ color: 'var(--text-secondary)' }}>Projected: <strong className="text-primary">₹8,950</strong> / ₹8,000</span>
                    </div>
                    <h2 className="mb-2 text-warning">"You're trending 12% above target. Maybe skip the latte today?"</h2>
                    <p style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                        <span>Current Spend: ₹6,240</span>
                        <span style={{ color: 'var(--accent-safe)' }}>Safe limit: ₹5,600 by today</span>
                    </p>
                </div>
            </div>

        </div>
    );
};

export default Landing;
