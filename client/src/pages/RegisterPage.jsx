import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Calendar, Mail, Lock, User, Eye, EyeOff,
  AlertCircle, Shield, Users, ArrowLeft
} from 'lucide-react';

export const RegisterPage = ({ onNavigate }) => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'VIEWER' });
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSuccessfulAuth = (user) => {
    toast.success(`Account created! Welcome to EventFlow, ${user.fullName}.`);
    if (onNavigate) {
      onNavigate(user.role === 'HEAD' ? 'organizer-dashboard' : 'catalog');
    } else {
      navigate(user.role === 'HEAD' ? '/admin/dashboard' : '/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setIsLoading(true);
    try {
      const result = await register(form);
      handleSuccessfulAuth(result.user);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      toast.error(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

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
      <div style={{ width: '100%', maxWidth: '460px' }}>
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
          <h1 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Join EventFlow</h1>
          <p style={{ color: 'var(--text-muted)' }}>Choose your role and start your journey</p>
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

            {/* Role Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Select Your Account Role
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div
                  onClick={() => setForm(p => ({ ...p, role: 'VIEWER' }))}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: form.role === 'VIEWER' ? '2px solid var(--brand-primary)' : '1px solid var(--border-glass)',
                    background: form.role === 'VIEWER' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Users size={20} color={form.role === 'VIEWER' ? 'var(--brand-primary)' : 'var(--text-dim)'} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: form.role === 'VIEWER' ? '#C7D2FE' : 'var(--text-main)' }}>
                    Viewer
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Discover & RSVP
                  </span>
                </div>

                <div
                  onClick={() => setForm(p => ({ ...p, role: 'HEAD' }))}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: form.role === 'HEAD' ? '2px solid var(--brand-secondary)' : '1px solid var(--border-glass)',
                    background: form.role === 'HEAD' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Shield size={20} color={form.role === 'HEAD' ? '#A78BFA' : 'var(--text-dim)'} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: form.role === 'HEAD' ? '#DDD6FE' : 'var(--text-main)' }}>
                    Head User
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Organize & Host
                  </span>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} /> Full Name
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Jane Smith"
                value={form.fullName}
                onChange={set('fullName')}
                required
              />
            </div>

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
                onChange={set('email')}
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
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={set('password')}
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

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ width: '100%', marginTop: '6px', justifyContent: 'center' }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Switch to Login */}
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: '#818CF8', fontWeight: 600, textDecoration: 'none' }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
