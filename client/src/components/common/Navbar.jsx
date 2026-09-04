import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Calendar, User, LogOut, Shield, Ticket, Plus,
  ChevronDown, Sparkles, Menu, X
} from 'lucide-react';

export const Navbar = ({ onOpenCreateEvent }) => {
  const { user, isAuthenticated, isHead, isViewer, logout, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDemoDropdown, setShowDemoDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleQuickLogin = async (email, password, roleName) => {
    try {
      await login({ email, password });
      setShowDemoDropdown(false);
      setMobileMenuOpen(false);
      toast.success(`Switched to ${roleName}!`);
      if (roleName.includes('Head')) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error('Quick login failed: ' + err.message);
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully');
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/events')) return true;
    return location.pathname.startsWith(path) && path !== '/';
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(8, 12, 21, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-glass)'
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '72px'
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--brand-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--brand-glow)'
            }}
          >
            <Calendar size={20} color="#FFFFFF" />
          </div>
          <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Event<span className="gradient-text">Flow</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="nav-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link
            to="/"
            style={{
              background: isActive('/') ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              color: isActive('/') ? 'var(--text-main)' : 'var(--text-muted)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.925rem',
              fontWeight: 500,
              textDecoration: 'none'
            }}
          >
            Explore Events
          </Link>

          {isAuthenticated && (
            <Link
              to="/my-registrations"
              style={{
                background: isActive('/my-registrations') ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: isActive('/my-registrations') ? 'var(--text-main)' : 'var(--text-muted)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.925rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none'
              }}
            >
              <Ticket size={16} />
              My Bookings
            </Link>
          )}

          {isHead && (
            <Link
              to="/admin/dashboard"
              style={{
                background: isActive('/admin') ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: isActive('/admin') ? '#C7D2FE' : 'var(--text-muted)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.925rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: isActive('/admin') ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                textDecoration: 'none'
              }}
            >
              <Shield size={16} color="#818CF8" />
              Organizer Studio
            </Link>
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
              <span>Create Event</span>
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
              <span style={{ display: 'none', minWidth: '0' }} className="demo-label">Demo</span>
              <span className="demo-full-label">Demo Roles</span>
              <ChevronDown size={12} />
            </button>

            {showDemoDropdown && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '42px',
                  width: '240px',
                  background: 'var(--bg-modal)',
                  border: '1px solid var(--border-glass-strong)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-hover)',
                  padding: '8px',
                  zIndex: 200
                }}
              >
                <div
                  style={{
                    fontSize: '0.725rem',
                    color: 'var(--text-dim)',
                    padding: '4px 8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Instant Role Switcher
                </div>
                <button
                  onClick={() => handleQuickLogin('sarah.head@eventflow.dev', 'Password123!', 'Sarah (Head User)')}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 8px',
                    borderRadius: '6px',
                    background: isHead ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    color: 'var(--text-main)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: isHead ? '#A5B4FC' : 'var(--text-main)' }}>
                    Sarah (Head User) {isHead && '✓'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Organizer & Admin Studio
                  </span>
                </button>
                <button
                  onClick={() => handleQuickLogin('john.viewer@eventflow.dev', 'Password123!', 'John (Viewer)')}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 8px',
                    borderRadius: '6px',
                    background: isViewer ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    color: 'var(--text-main)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: isViewer ? '#6EE7B7' : 'var(--text-main)' }}>
                    John (Viewer) {isViewer && '✓'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Public Attendee Portal
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* User Profile or Login/Register */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: isHead
                      ? 'linear-gradient(135deg, #4F46E5, #9333EA)'
                      : 'linear-gradient(135deg, #059669, #10B981)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}
                >
                  {user.fullName?.charAt(0) || 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.fullName}</span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: isHead ? '#818CF8' : '#34D399',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}
                  >
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
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
              <Link to="/login" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'transparent',
              color: 'var(--text-main)',
              padding: '6px'
            }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            background: 'var(--bg-modal)',
            borderBottom: '1px solid var(--border-glass)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: 'var(--text-main)', textDecoration: 'none', padding: '8px 0', fontWeight: 600 }}
          >
            Explore Events
          </Link>
          {isAuthenticated && (
            <Link
              to="/my-registrations"
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: 'var(--text-main)', textDecoration: 'none', padding: '8px 0' }}
            >
              My Bookings
            </Link>
          )}
          {isHead && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: '#A5B4FC', textDecoration: 'none', padding: '8px 0', fontWeight: 600 }}
            >
              Organizer Studio
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
