import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Mail, Lock, User, Eye, EyeOff, AlertCircle, Shield, Users } from 'lucide-react';

export const RegisterPage = ({ onNavigate }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'VIEWER' });
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setIsLoading(true);
    try {
      const result = await register(form);
      if (result.user.role === 'HEAD') {
        onNavigate('organizer-dashboard');
      } else {
        onNavigate('catalog');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
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
          <h1 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Join EventFlow</h1>
          <p style={{ color: 'var(--text-muted)' }}>Create your account and start exploring events</p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: '36px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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

            {/* Role Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Account Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { value: 'VIEWER', label: 'Event Attendee', desc: 'Browse & RSVP for events', Icon: Users, color: '#10B981' },
                  { value: 'HEAD', label: 'Organizer', desc: 'Create & manage events', Icon: Shield, color: '#6366F1' }
                ].map(({ value, label, desc, Icon, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, role: value }))}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${form.role === value ? color : 'var(--border-glass)'}`,
                      background: form.role === value ? `${color}15` : 'var(--bg-input)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Icon size={20} color={form.role === value ? color : 'var(--text-dim)'} style={{ marginBottom: '8px' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: form.role === value ? 'var(--text-main)' : 'var(--text-muted)' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--status-danger-bg)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--status-danger)', fontSize: '0.875rem' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading} style={{ width: '100%', justifyContent: 'center' }}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <button onClick={() => onNavigate('login')} style={{ background: 'transparent', color: '#818CF8', fontWeight: 600 }}>
            Sign in →
          </button>
        </p>
      </div>
    </div>
  );
};
