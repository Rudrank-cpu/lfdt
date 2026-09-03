import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { StatusBadge } from '../components/common/StatusBadge';
import { Ticket, CalendarCheck, Clock, CheckCircle2, XCircle } from 'lucide-react';

export const MyRegistrationsPage = ({ onViewEvent }) => {
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMyRegistrations();
      setRegistrations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRegistrations(); }, []);

  const handleCancel = async (eventId, eventTitle) => {
    if (!window.confirm(`Cancel your RSVP for "${eventTitle}"?`)) return;
    setCancellingId(eventId);
    try {
      await api.cancelRegistration(eventId);
      await fetchRegistrations();
    } catch (err) {
      alert(err.message || 'Cancellation failed.');
    } finally {
      setCancellingId(null);
    }
  };

  const upcoming = registrations.filter(r => r.registration_status !== 'CANCELLED');
  const past = registrations.filter(r => r.registration_status === 'CANCELLED');

  const RegCard = ({ reg }) => {
    const startDate = new Date(reg.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const isCancelled = reg.registration_status === 'CANCELLED';
    return (
      <div className="glass-card" style={{ padding: '22px', display: 'flex', gap: '18px', opacity: isCancelled ? 0.6 : 1 }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #312E81, #4338CA)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '1.2rem',
          fontWeight: 800,
          color: '#C7D2FE'
        }}>
          <span style={{ fontSize: '1.3rem' }}>{new Date(reg.start_time).getDate()}</span>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {new Date(reg.start_time).toLocaleString('en-US', { month: 'short' })}
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '6px' }}>
            <h3 style={{ fontSize: '1.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {reg.event_title}
            </h3>
            <StatusBadge status={reg.registration_status} />
          </div>

          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CalendarCheck size={14} color="#818CF8" /> {startDate}
            </span>
            {reg.ticket_code && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'monospace', color: '#818CF8' }}>
                <Ticket size={14} /> {reg.ticket_code}
              </span>
            )}
          </div>
        </div>

        {!isCancelled && (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
            <button
              onClick={() => onViewEvent({ id: reg.event_id })}
              className="btn btn-secondary btn-sm"
            >
              View Event
            </button>
            <button
              onClick={() => handleCancel(reg.event_id, reg.event_title)}
              className="btn btn-danger btn-sm"
              disabled={cancellingId === reg.event_id}
            >
              {cancellingId === reg.event_id ? '...' : 'Cancel'}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Ticket size={30} color="#818CF8" />
            My Bookings
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Your upcoming confirmed RSVPs and waitlisted events.</p>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-dim)' }}>Loading your bookings...</div>
        ) : registrations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
            <Ticket size={56} strokeWidth={1.5} style={{ display: 'block', margin: '0 auto 16px', color: 'var(--text-dim)' }} />
            <h3 style={{ marginBottom: '8px' }}>No bookings yet</h3>
            <p style={{ color: 'var(--text-dim)' }}>Explore events and RSVP to get started!</p>
          </div>
        ) : (
          <>
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <section style={{ marginBottom: '48px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <CheckCircle2 size={20} color="var(--status-success)" />
                  <h2 style={{ fontSize: '1.2rem' }}>Active RSVPs ({upcoming.length})</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {upcoming.map(reg => <RegCard key={reg.event_id} reg={reg} />)}
                </div>
              </section>
            )}

            {/* Past / Cancelled */}
            {past.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <XCircle size={20} color="var(--text-dim)" />
                  <h2 style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Cancelled ({past.length})</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {past.map(reg => <RegCard key={reg.event_id + '-cancelled'} reg={reg} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};
