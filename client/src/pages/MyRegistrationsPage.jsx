import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { TicketModal } from '../components/events/TicketModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { downloadIcsFile } from '../utils/calendar';
import {
  Ticket, CalendarCheck, CheckCircle2, XCircle,
  QrCode, Download, Compass
} from 'lucide-react';

export const MyRegistrationsPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancellingEvent, setCancellingEvent] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE' | 'CANCELLED'

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMyRegistrations();
      setRegistrations(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your registrations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancellingEvent) return;
    setIsCancelling(true);
    try {
      await api.cancelRegistration(cancellingEvent.event_id);
      toast.info(`Cancelled registration for "${cancellingEvent.event_title}".`);
      setCancellingEvent(null);
      await fetchRegistrations();
    } catch (err) {
      toast.error(err.message || 'Cancellation failed.');
    } finally {
      setIsCancelling(false);
    }
  };

  const upcoming = registrations.filter(r => r.registration_status !== 'CANCELLED');
  const past = registrations.filter(r => r.registration_status === 'CANCELLED');
  const currentList = activeTab === 'ACTIVE' ? upcoming : past;

  const RegCard = ({ reg }) => {
    const startDate = new Date(reg.start_time).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const isCancelled = reg.registration_status === 'CANCELLED';

    // Build partial event object for ticket and calendar sync
    const eventObj = {
      id: reg.event_id,
      title: reg.event_title,
      description: reg.event_description,
      startTime: reg.start_time,
      endTime: reg.end_time,
      venueOrUrl: reg.venue_or_url,
      locationType: reg.location_type,
      category: reg.event_category
    };

    return (
      <div
        className="glass-card"
        style={{
          padding: '24px',
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          opacity: isCancelled ? 0.6 : 1
        }}
      >
        {/* Date Badge */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '12px',
            background: isCancelled
              ? 'rgba(255, 255, 255, 0.05)'
              : 'linear-gradient(135deg, #312E81, #4338CA)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontWeight: 800,
            color: isCancelled ? 'var(--text-dim)' : '#C7D2FE'
          }}
        >
          <span style={{ fontSize: '1.35rem', lineHeight: 1 }}>
            {new Date(reg.start_time).getDate()}
          </span>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {new Date(reg.start_time).toLocaleString('en-US', { month: 'short' })}
          </span>
        </div>

        {/* Details Body */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <h3
              style={{
                fontSize: '1.15rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/events/${reg.event_id}`)}
            >
              {reg.event_title}
            </h3>
            <StatusBadge status={reg.registration_status} />
            <span className="badge badge-brand">{reg.event_category}</span>
          </div>

          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              alignItems: 'center'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <CalendarCheck size={14} color="#818CF8" /> {startDate}
            </span>

            {reg.ticket_code && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontFamily: 'monospace',
                  color: '#A5B4FC',
                  background: 'rgba(99, 102, 241, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}
              >
                <Ticket size={13} /> {reg.ticket_code}
              </span>
            )}
          </div>
        </div>

        {/* Actions Button Group */}
        {!isCancelled ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => navigate(`/tickets/${reg.event_id}`)}
              className="btn btn-primary btn-sm"
              style={{ gap: '6px' }}
            >
              <QrCode size={15} />
              View Pass
            </button>

            <button
              type="button"
              onClick={() => downloadIcsFile(eventObj)}
              className="btn btn-secondary btn-sm"
              title="Download .ics calendar"
              style={{ gap: '4px' }}
            >
              <Download size={14} />
              .ics
            </button>

            <button
              type="button"
              onClick={() => navigate(`/events/${reg.event_id}`)}
              className="btn btn-secondary btn-sm"
            >
              Details
            </button>

            <button
              type="button"
              onClick={() => setCancellingEvent(reg)}
              className="btn btn-danger btn-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div>
            <button
              type="button"
              onClick={() => navigate(`/events/${reg.event_id}`)}
              className="btn btn-secondary btn-sm"
            >
              View Event
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: '2.2rem',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <Ticket size={32} color="#818CF8" />
            My Bookings & Passes
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Manage your event registrations, access digital entry passes, or sync with your calendar.
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '28px',
            borderBottom: '1px solid var(--border-glass)',
            paddingBottom: '12px'
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('ACTIVE')}
            style={{
              background: activeTab === 'ACTIVE' ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
              border: activeTab === 'ACTIVE' ? '1px solid var(--brand-primary)' : '1px solid transparent',
              color: activeTab === 'ACTIVE' ? '#C7D2FE' : 'var(--text-muted)',
              padding: '8px 18px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <CheckCircle2 size={16} color="var(--status-success)" />
            Active Passes ({upcoming.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CANCELLED')}
            style={{
              background: activeTab === 'CANCELLED' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              border: activeTab === 'CANCELLED' ? '1px solid var(--border-glass-strong)' : '1px solid transparent',
              color: activeTab === 'CANCELLED' ? 'var(--text-main)' : 'var(--text-muted)',
              padding: '8px 18px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <XCircle size={16} color="var(--text-dim)" />
            Cancelled ({past.length})
          </button>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-dim)' }}>
            Loading your bookings...
          </div>
        ) : currentList.length === 0 ? (
          <div
            className="glass-card"
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              color: 'var(--text-muted)'
            }}
          >
            <Ticket size={56} strokeWidth={1.5} color="var(--text-dim)" style={{ display: 'block', margin: '0 auto 16px' }} />
            <h3 style={{ marginBottom: '8px', color: 'var(--text-main)' }}>
              {activeTab === 'ACTIVE' ? 'No Active Registrations' : 'No Cancelled Registrations'}
            </h3>
            <p style={{ color: 'var(--text-dim)', marginBottom: '24px' }}>
              {activeTab === 'ACTIVE'
                ? 'You have not RSVPed to any upcoming events yet.'
                : 'You have no cancelled tickets on record.'}
            </p>
            {activeTab === 'ACTIVE' && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/')}
                style={{ gap: '8px' }}
              >
                <Compass size={16} />
                Explore Events Catalog
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {currentList.map(reg => (
              <RegCard key={reg.registration_id || reg.event_id} reg={reg} />
            ))}
          </div>
        )}
      </div>

      {/* Ticket Pass Modal */}
      {selectedTicket && (
        <TicketModal
          isOpen={Boolean(selectedTicket)}
          onClose={() => setSelectedTicket(null)}
          registration={selectedTicket.reg}
          event={selectedTicket.event}
        />
      )}

      {/* Cancel RSVP Confirmation Dialog */}
      <ConfirmModal
        isOpen={Boolean(cancellingEvent)}
        onClose={() => setCancellingEvent(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Registration"
        message={`Are you sure you want to cancel your booking for "${cancellingEvent?.event_title}"? Your ticket will be released immediately.`}
        confirmText="Yes, Cancel Booking"
        cancelText="Keep Booking"
        isDanger={true}
        isLoading={isCancelling}
      />
    </div>
  );
};
