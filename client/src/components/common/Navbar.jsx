import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, User, LogOut, Shield, Ticket, Plus, ChevronDown, Sparkles } from 'lucide-react';

export const Navbar = ({ onNavigate, currentView, onOpenCreateEvent }) => {
  const { user, isAuthenticated, isHead, isViewer, logout, login } = useAuth();
  const [showDemoDropdown, setShowDemoDropdown] = useState(false);

  const handleQuickLogin = async (email, password) => {
    try {
      await login({ email, password });
      setShowDemoDropdown(false);
    } catch (err) {
      console.error('Quick login failed:', err);
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(8, 12, 21, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-glass)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('catalog')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--brand-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--brand-glow)'
          }}>
            <Calendar size={20} color="#FFFFFF" />
          </div>
          <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Event<span className="gradient-text">Flow</span>
          </span>
        </div>

        {/* Center Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => onNavigate('catalog')}
            style={{
              background: currentView === 'catalog' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              color: currentView === 'catalog' ? 'var(--text-main)' : 'var(--text-muted)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.925rem',
              fontWeight: 500
            }}
          >
            Explore Events
          </button>

          {isAuthenticated && (
            <button
              onClick={() => onNavigate('my-registrations')}
              style={{
                background: currentView === 'my-registrations' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: currentView === 'my-registrations' ? 'var(--text-main)' : 'var(--text-muted)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.925rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Ticket size={16} />
              My Bookings
            </button>
          )}

          {isHead && (
            <button
              onClick={() => onNavigate('organizer-dashboard')}
              style={{
                background: currentView === 'organizer-dashboard' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: currentView === 'organizer-dashboard' ? '#C7D2FE' : 'var(--text-muted)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.925rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: currentView === 'organizer-dashboard' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent'
              }}
            >
              <Shield size={16} color="#818CF8" />
              Organizer Studio
            </button>
          )}
        </nav>

        {/* Right Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isHead && (
            <button
              onClick={onOpenCreateEvent}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} />
              Create Event
            </button>
          )}

          {/* Quick Demo Switcher Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDemoDropdown(!showDemoDropdown)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-muted)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Quick Demo Role Switcher"
            >
              <Sparkles size={14} color="#A78BFA" />
              <span>Demo Roles</span>
              <ChevronDown size={12} />
            </button>

            {showDemoDropdown && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '40px',
                width: '230px',
                background: 'var(--bg-modal)',
                border: '1px solid var(--border-glass-strong)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-hover)',
                padding: '8px',
                zIndex: 200
              }}>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Instant Role Switcher
                </div>
                <button
                  onClick={() => handleQuickLogin('sarah.head@eventflow.dev', 'Password123!')}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px',
                    borderRadius: '6px',
                    background: 'transparent',
                    color: 'var(--text-main)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Sarah (Head User)</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Event Organizer & Admin</span>
                </button>
                <button
                  onClick={() => handleQuickLogin('john.viewer@eventflow.dev', 'Password123!')}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px',
                    borderRadius: '6px',
                    background: 'transparent',
                    color: 'var(--text-main)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>John (Viewer)</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Public Event Attendee</span>
                </button>
              </div>
            )}
          </div>

          {/* User Profile or Login/Register */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: isHead ? 'linear-gradient(135deg, #4F46E5, #9333EA)' : 'linear-gradient(135deg, #059669, #10B981)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>
                  {user.fullName.charAt(0)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.fullName}</span>
                  <span style={{ fontSize: '0.7rem', color: isHead ? '#818CF8' : '#34D399', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: 'var(--text-muted)',
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)'
                }}
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => onNavigate('login')}
                className="btn btn-secondary btn-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="btn btn-primary btn-sm"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
