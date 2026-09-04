import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CapacityBar } from '../components/common/CapacityBar';
import { StatusBadge } from '../components/common/StatusBadge';
import { TicketModal } from '../components/events/TicketModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { downloadIcsFile, getGoogleCalendarUrl } from '../utils/calendar';
import {
  Calendar, MapPin, Video, Users, ArrowLeft,
  CheckCircle, Clock, AlertCircle, ExternalLink,
  Share2, Download, QrCode, CalendarDays
} from 'lucide-react';

export const EventDetailPage = ({ event: initialEvent, onBack }) => {
  const { id: paramId } = useParams();
  const eventId = initialEvent?.id || paramId;
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated, isHead } = useAuth();

  const [event, setEvent] = useState(initialEvent || null);
  const [rsvpState, setRsvpState] = useState({ status: null, ticketCode: null });
  const [myReg, setMyReg] = useState(null);
  const [isLoading, setIsLoading] = useState(!initialEvent);
  const [isRsvping, setIsRsvping] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Fetch full event details if not present or to ensure freshness
  useEffect(() => {
    if (!eventId) return;
    setIsLoading(true);
    api.getEvent(eventId)
      .then(data => {
        setEvent(data);
      })
      .catch(err => {
        toast.error('Event not found: ' + err.message);
        navigate('/');
      })
      .finally(() => setIsLoading(false));
  }, [eventId]);

  // Load personal registration if logged in
  useEffect(() => {
    if (!isAuthenticated || isHead || !eventId) return;
    api.getMyRegistrations()
      .then(regs => {
        const found = regs.find(r => r.event_id === eventId);
        if (found) {
          setMyReg(found);
          setRsvpState({ status: found.registration_status, ticketCode: found.ticket_code });
        }
      })
      .catch(() => {});
  }, [isAuthenticated, isHead, eventId]);

  const handleRsvp = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsRsvping(true);
    try {
      const data = await api.registerForEvent(event.id);
      setRsvpState({ status: data.status, ticketCode: data.ticketCode });
      setMyReg({
        event_id: event.id,
        registration_status: data.status,
        ticket_code: data.ticketCode,
        event_title: event.title
      });

      if (data.status === 'CONFIRMED') {
        toast.success(`🎉 RSVP Confirmed! Ticket Code: ${data.ticketCode}`);
        setShowTicketModal(true);
      } else {
        toast.warning('⏳ Added to Waitlist! You will be notified if a spot opens.');
      }

      // Refresh event capacity
      const updated = await api.getEvent(event.id);
      setEvent(updated);
    } catch (err) {
      toast.error(err.message || 'RSVP failed. Please try again.');
    } finally {
      setIsRsvping(false);
    }
  };

  const handleCancelRsvp = async () => {
    setIsRsvping(true);
    try {
      await api.cancelRegistration(event.id);
      setRsvpState({ status: null, ticketCode: null });
      setMyReg(null);
      setShowCancelModal(false);
      toast.info('Your registration has been cancelled.');

      // Refresh event capacity
      const updated = await api.getEvent(event.id);
      setEvent(updated);
    } catch (err) {
      toast.error(err.message || 'Cancellation failed.');
    } finally {
      setIsRsvping(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Event link copied to clipboard!');
  };

  if (isLoading || !event) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 20px', color: 'var(--text-dim)' }}>
        Loading event details...
      </div>
    );
  }

  const formattedStart = new Date(event.startTime).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = `${new Date(event.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} — ${new Date(event.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  const defaultBanner = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80';

  const hasRsvp = rsvpState.status === 'CONFIRMED' || rsvpState.status === 'WAITLISTED';

  // Sample structured agenda based on event
  const agendaItems = [
    { time: 'Opening', title: 'Welcome & Keynote Address', desc: 'Introduction to the event theme and keynote presentation.' },
    { time: 'Deep Dive', title: 'Core Workshop & Practical Lab', desc: 'Interactive session exploring best practices and case studies.' },
    { time: 'Discussion', title: 'Open Q&A & Panel Discussion', desc: 'Engage with organizers, industry peers, and domain experts.' },
    { time: 'Closing', title: 'Networking & Community Wrap-up', desc: 'Connect with fellow participants and discuss future initiatives.' }
  ];

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Hero Banner Header */}
      <div style={{ position: 'relative', height: '360px', overflow: 'hidden' }}>
        <img
          src={event.bannerUrl || defaultBanner}
          alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(8,12,21,0.4) 0%, rgba(8,12,21,0.94) 100%)'
          }}
        />

        <div
          className="container"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            paddingBottom: '32px'
          }}
        >
          <button
            onClick={() => onBack ? onBack() : navigate('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text-muted)',
              background: 'transparent',
              marginBottom: '20px',
              fontSize: '0.9rem',
              width: 'fit-content',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={18} /> Back to Catalog
          </button>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span className="badge badge-brand">{event.category}</span>
            <StatusBadge status={event.status} />
            {event.isFull && <StatusBadge status="SOLD OUT" />}
          </div>

          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', maxWidth: '850px', lineHeight: 1.2 }}>
            {event.title}
          </h1>
        </div>
      </div>

      {/* Main 2-Column Content Layout */}
      <div
        className="container event-detail-grid"
        style={{
          marginTop: '40px',
          display: 'grid',
          gridTemplateColumns: '1fr 360px',
          gap: '40px',
          alignItems: 'start'
        }}
      >
        {/* Left Column (70%): Key Info, Description, Agenda, Speaker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Key Metadata Card */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: 'var(--text-muted)' }}>
              <Calendar size={22} color="#818CF8" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{formattedStart}</div>
                <div style={{ fontSize: '0.875rem' }}>{formattedTime}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: 'var(--text-muted)' }}>
              {event.locationType === 'VIRTUAL' ? (
                <Video size={22} color="#38BDF8" style={{ flexShrink: 0 }} />
              ) : (
                <MapPin size={22} color="#F43F5E" style={{ flexShrink: 0 }} />
              )}
              <div>
                <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                  {event.locationType === 'VIRTUAL' ? 'Online Virtual Event' : 'In-Person Venue'}
                </div>
                {event.locationType === 'VIRTUAL' ? (
                  <a
                    href={event.venueOrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#38BDF8', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    Direct Meeting Link <ExternalLink size={12} />
                  </a>
                ) : (
                  <div style={{ fontSize: '0.875rem' }}>{event.venueOrUrl}</div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Users size={22} color="#10B981" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--text-main)', fontWeight: 600, marginBottom: '8px' }}>
                  {event.confirmedAttendees || 0} / {event.maxCapacity} Attending
                  {event.waitlistedAttendees > 0 && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--status-warning)', marginLeft: '10px' }}>
                      +{event.waitlistedAttendees} waitlisted
                    </span>
                  )}
                </div>
                <CapacityBar
                  maxCapacity={event.maxCapacity}
                  confirmedCount={event.confirmedAttendees || 0}
                  showDetails={false}
                />
              </div>
            </div>
          </div>

          {/* About This Event */}
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>About This Event</h2>
            <div
              className="glass-card"
              style={{
                padding: '24px',
                color: 'var(--text-muted)',
                lineHeight: 1.8,
                whiteSpace: 'pre-line',
                fontSize: '0.975rem'
              }}
            >
              {event.description}
            </div>
          </div>

          {/* Schedule & Agenda Timeline */}
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarDays size={20} color="#818CF8" />
              Event Agenda
            </h2>
            <div className="glass-card" style={{ padding: '28px' }}>
              <div className="agenda-timeline">
                {agendaItems.map((item, idx) => (
                  <div key={idx} className="agenda-item">
                    <span style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {item.time}
                    </span>
                    <h4 style={{ fontSize: '1.05rem', margin: '4px 0 6px', color: 'var(--text-main)' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Organizer Card */}
          {event.organizer && (
            <div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Organizer Information</h2>
              <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4F46E5, #9333EA)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    flexShrink: 0
                  }}
                >
                  {event.organizer.name?.charAt(0) || 'O'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{event.organizer.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{event.organizer.email}</div>
                  <div style={{ fontSize: '0.78rem', color: '#818CF8', marginTop: '2px', fontWeight: 600 }}>
                    Verified EventFlow Organizer
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Share & Calendar Actions */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-dim)', marginRight: 'auto' }}>
              Sync or share this event:
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => downloadIcsFile(event)}
              style={{ gap: '6px' }}
            >
              <Download size={14} />
              Save .ics
            </button>
            <a
              href={getGoogleCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              <ExternalLink size={14} />
              Google Calendar
            </a>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleCopyLink}
              style={{ gap: '6px' }}
            >
              <Share2 size={14} />
              Copy Link
            </button>
          </div>
        </div>

        {/* Right Column (30%): Sticky RSVP Card */}
        <div style={{ position: 'sticky', top: '96px' }}>
          <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Reserve Your Seat</h3>

            {/* Current RSVP Status Highlight */}
            {hasRsvp && (
              <div
                style={{
                  padding: '16px',
                  background: rsvpState.status === 'CONFIRMED' ? 'var(--status-success-bg)' : 'var(--status-warning-bg)',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${rsvpState.status === 'CONFIRMED' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  {rsvpState.status === 'CONFIRMED' ? (
                    <CheckCircle size={18} color="var(--status-success)" />
                  ) : (
                    <Clock size={18} color="var(--status-warning)" />
                  )}
                  <span style={{ color: rsvpState.status === 'CONFIRMED' ? 'var(--status-success)' : 'var(--status-warning)' }}>
                    {rsvpState.status === 'CONFIRMED' ? "You're Confirmed!" : "You're on the Waitlist"}
                  </span>
                </div>

                {rsvpState.ticketCode && (
                  <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    Ticket: <strong style={{ color: 'var(--text-main)' }}>{rsvpState.ticketCode}</strong>
                  </div>
                )}

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowTicketModal(true)}
                  style={{ gap: '6px', justifyContent: 'center', marginTop: '4px' }}
                >
                  <QrCode size={15} />
                  View Digital Pass & QR
                </button>
              </div>
            )}

            {/* Live Capacity Meter */}
            <CapacityBar
              maxCapacity={event.maxCapacity}
              confirmedCount={event.confirmedAttendees || 0}
            />

            {/* Action Buttons */}
            {!isAuthenticated ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '12px 0' }}>
                <AlertCircle size={24} color="var(--brand-primary)" style={{ display: 'block', margin: '0 auto 8px' }} />
                <p style={{ marginBottom: '12px' }}>Sign in to reserve your spot</p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate('/login')}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Sign In to RSVP
                </button>
              </div>
            ) : isHead ? (
              <div
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem',
                  textAlign: 'center',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                You are managing this event as Organizer.
              </div>
            ) : hasRsvp ? (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setShowCancelModal(true)}
                disabled={isRsvping}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {isRsvping ? 'Cancelling...' : 'Cancel My Registration'}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={handleRsvp}
                disabled={isRsvping}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {isRsvping
                  ? 'Reserving...'
                  : event.isFull
                  ? '⏳ Join Waitlist'
                  : '🎟️ Reserve My Spot'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ticket QR Modal */}
      <TicketModal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        registration={myReg || { ticket_code: rsvpState.ticketCode, status: rsvpState.status }}
        event={event}
      />

      {/* Cancellation Confirmation Dialog */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelRsvp}
        title="Cancel Registration"
        message={`Are you sure you want to cancel your RSVP for "${event.title}"? Your spot will immediately be offered to attendees on the waitlist.`}
        confirmText="Yes, Cancel RSVP"
        cancelText="Keep My Spot"
        isDanger={true}
        isLoading={isRsvping}
      />
    </div>
  );
};
