import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Insights from './pages/Insights';
import Settings from './pages/Settings';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

const OnboardingCheck = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return null;
    if (user && !user.onboardingComplete) return <Navigate to="/onboarding" />;
    return children;
};

function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                <Route path="/onboarding" element={
                    <PrivateRoute>
                        <Onboarding />
                    </PrivateRoute>
                } />

                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <OnboardingCheck>
                            <Dashboard />
                        </OnboardingCheck>
                    </PrivateRoute>
                } />

                <Route path="/insights" element={
                    <PrivateRoute>
                        <OnboardingCheck>
                            <Insights />
                        </OnboardingCheck>
                    </PrivateRoute>
                } />

                <Route path="/settings" element={
                    <PrivateRoute>
                        <Settings />
                    </PrivateRoute>
                } />
            </Routes>
        </Router>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;
