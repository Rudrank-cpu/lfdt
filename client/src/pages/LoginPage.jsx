import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const LoginPage = ({ onNavigate }) => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await login(form);
      // After login, navigate based on role
      if (result.user.role === 'HEAD') {
        onNavigate('organizer-dashboard');
      } else {
        onNavigate('catalog');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (email, password) => {
    setForm({ email, password });
    setError('');
    setIsLoading(true);
    try {
      const result = await login({ email, password });
      if (result.user.role === 'HEAD') {
        onNavigate('organizer-dashboard');
      } else {
        onNavigate('catalog');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '14px',
            background: 'var(--brand-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: 'var(--brand-glow)'
          }}>
            <Calendar size={26} color="#FFFFFF" />
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-muted)' }}>Sign in to your EventFlow account</p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: '36px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} /> Email Address
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} /> Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input-field"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                  style={{ paddingRight: '46px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', color: 'var(--text-dim)' }}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--status-danger-bg)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--status-danger)', fontSize: '0.875rem' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading} style={{ width: '100%', justifyContent: 'center' }}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Or use demo accounts</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }} />
          </div>

          {/* Quick Demo Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => quickLogin('sarah.head@eventflow.dev', 'Password123!')}
              style={{ justifyContent: 'flex-start', gap: '10px' }}
              disabled={isLoading}
            >
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #4F46E5, #9333EA)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>S</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Sarah — Head Organizer</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>sarah.head@eventflow.dev</div>
              </div>
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => quickLogin('john.viewer@eventflow.dev', 'Password123!')}
              style={{ justifyContent: 'flex-start', gap: '10px' }}
              disabled={isLoading}
            >
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #059669, #10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>J</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>John — Event Viewer</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>john.viewer@eventflow.dev</div>
              </div>
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <button onClick={() => onNavigate('register')} style={{ background: 'transparent', color: '#818CF8', fontWeight: 600 }}>
            Create one →
          </button>
        </p>
      </div>
    </div>
  );
};
