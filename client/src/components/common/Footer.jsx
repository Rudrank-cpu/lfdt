import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Footer = () => {
  const { isAuthenticated, isHead } = useAuth();

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(11, 15, 25, 0.95)',
        padding: '48px 0 28px',
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
        marginTop: 'auto'
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '36px',
            marginBottom: '40px'
          }}
        >
          {/* Brand Col */}
          <div>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                color: 'var(--text-main)',
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: '1.25rem',
                letterSpacing: '-0.02em',
                marginBottom: '14px'
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: 'var(--brand-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF'
                }}
              >
                <Ticket size={18} />
              </div>
              <span>Event<span className="gradient-text">Flow</span></span>
            </Link>
            <p style={{ lineHeight: 1.6, color: 'var(--text-muted)', maxWidth: '280px', fontSize: '0.875rem' }}>
              Streamlined role-based event organization, real-time capacity tracking, and frictionless RSVPs.
            </p>
          </div>

          {/* Attendee Navigation */}
          <div>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px' }}>
              Explore Platform
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                  Live Event Catalog
                </Link>
              </li>
              {isAuthenticated && (
                <li>
                  <Link to="/my-registrations" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                    My Bookings & Passes
                  </Link>
                </li>
              )}
              {!isAuthenticated && (
                <>
                  <li>
                    <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                      Create Account
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Organizer Studio */}
          <div>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px' }}>
              Organizer Studio
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {isHead ? (
                <>
                  <li>
                    <Link to="/admin/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                      Studio Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/events/new" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                      Create New Event
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/register" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                      Become an Organizer (Head)
                    </Link>
                  </li>
                  <li>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                      Strict Role Isolation (RBAC)
                    </span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Status & Tech */}
          <div>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px' }}>
              System Reliability
            </h4>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '6px 12px',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                color: '#34D399',
                fontWeight: 600,
                marginBottom: '12px'
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
              Operational · Concurrency Protected
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
              ACID transactional seat locking ensures zero overbooking under peak attendee demand.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.825rem',
            color: 'var(--text-dim)'
          }}
        >
          <div>
            © {new Date().getFullYear()} EventFlow Platform. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Built with modern React, Vite, and modular architecture.
          </div>
        </div>
      </div>
    </footer>
  );
};
