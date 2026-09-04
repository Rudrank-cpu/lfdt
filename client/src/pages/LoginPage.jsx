import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Calendar, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';

export const LoginPage = ({ onNavigate }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSuccessfulAuth = (user) => {
    toast.success(`Welcome back, ${user.fullName}!`);
    if (onNavigate) {
      onNavigate(user.role === 'HEAD' ? 'organizer-dashboard' : 'catalog');
    } else {
      navigate(user.role === 'HEAD' ? '/admin/dashboard' : '/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await login(form);
      handleSuccessfulAuth(result.user);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
      toast.error(err.message || 'Login failed');
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
      handleSuccessfulAuth(result.user);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Back Link */}
        <div style={{ marginBottom: '20px' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              textDecoration: 'none'
            }}
          >
            <ArrowLeft size={16} /> Back to Catalog
          </Link>
        </div>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'var(--brand-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: 'var(--brand-glow)'
            }}
          >
            <Calendar size={26} color="#FFFFFF" />
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-muted)' }}>Sign in to your EventFlow account</p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: '36px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {error && (
              <div
                style={{
                  padding: '12px 14px',
                  background: 'var(--status-danger-bg)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--status-danger)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

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
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    color: 'var(--text-dim)',
                    padding: '4px'
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ width: '100%', marginTop: '6px', justifyContent: 'center' }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-glass)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Sparkles size={12} color="#A78BFA" />
              Quick Demo Accounts
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => quickLogin('sarah.head@eventflow.dev', 'Password123!')}
                style={{ fontSize: '0.78rem' }}
              >
                Sarah (Head User)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => quickLogin('john.viewer@eventflow.dev', 'Password123!')}
                style={{ fontSize: '0.78rem' }}
              >
                John (Viewer)
              </button>
            </div>
          </div>

          {/* Switch to Register */}
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{ color: '#818CF8', fontWeight: 600, textDecoration: 'none' }}
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
