import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';

function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@creditrisk.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const navigate = useNavigate();

  // Auto-login on mount
  useEffect(() => {
    autoLogin();
  }, []);

  const autoLogin = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', {
        email: 'admin@creditrisk.com',
        password: 'password'
      });
      const { token, role, userId, customerId } = response.data;
      localStorage.setItem('token', token);
      onLogin({ email: 'admin@creditrisk.com', role, userId, customerId });
      navigate('/dashboard');
    } catch (err) {
      // If auto-login fails, show the form
      setLoading(false);
      setDemoMode(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, role, userId, customerId } = response.data;
      localStorage.setItem('token', token);
      onLogin({ email, role, userId, customerId });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !demoMode) {
    return (
      <div className="login-container">
        <div className="login-card text-center">
          <div className="spinner-border mb-3" role="status" style={{ color: '#3498db' }} />
          <h3>CreditRisk AI</h3>
          <p className="subtitle">Signing you in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h3>CreditRisk AI</h3>
        <p className="subtitle">Sign in to your account</p>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              placeholder="admin@creditrisk.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn w-100"
            style={{ backgroundColor: '#1a2332', color: 'white' }}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" />
            ) : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center" style={{ fontSize: '0.8rem', color: '#6c757d' }}>
          <p className="mb-0">Demo: admin@creditrisk.com / password</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
