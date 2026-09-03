import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CapacityBar } from '../components/common/CapacityBar';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Calendar, MapPin, Video, Users, ArrowLeft,
  CheckCircle, Clock, AlertCircle, ExternalLink
} from 'lucide-react';

export const EventDetailPage = ({ event: initialEvent, onBack }) => {
  const { isAuthenticated, isHead } = useAuth();
  const [event, setEvent] = useState(initialEvent);
  const [rsvpState, setRsvpState] = useState({ status: null, ticketCode: null });
  const [myReg, setMyReg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Reload event data for fresh capacity
  useEffect(() => {
    api.getEvent(initialEvent.id).then(setEvent).catch(() => {});
  }, [initialEvent.id]);

  // Load personal registration if logged in
  useEffect(() => {
    if (!isAuthenticated || isHead) return;
    api.getMyRegistrations().then(regs => {
      const myReg = regs.find(r => r.event_id === event.id);
      if (myReg) {
        setMyReg(myReg);
        setRsvpState({ status: myReg.registration_status, ticketCode: myReg.ticket_code });
      }
    }).catch(() => {});
  }, [isAuthenticated, isHead, event.id]);

  const handleRsvp = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const data = await api.registerForEvent(event.id);
      setRsvpState({ status: data.status, ticketCode: data.ticketCode });
      setMessage({ type: 'success', text: data.status === 'CONFIRMED' ? `🎉 You're in! Ticket: ${data.ticketCode}` : '⏳ Added to waitlist! You\'ll be notified if a spot opens.' });
      // Refresh event
      const updated = await api.getEvent(event.id);
      setEvent(updated);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'RSVP failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your RSVP?')) return;
    setIsLoading(true);
    setMessage(null);
    try {
      await api.cancelRegistration(event.id);
      setRsvpState({ status: null, ticketCode: null });
      setMyReg(null);
      setMessage({ type: 'success', text: 'Your RSVP has been cancelled.' });
      const updated = await api.getEvent(event.id);
      setEvent(updated);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const formattedStart = new Date(event.startTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = `${new Date(event.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} — ${new Date(event.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  const defaultBanner = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80';

  const hasRsvp = rsvpState.status === 'CONFIRMED' || rsvpState.status === 'WAITLISTED';

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Hero Banner */}
      <div style={{ position: 'relative', height: '380px', overflow: 'hidden' }}>
        <img
          src={event.bannerUrl || defaultBanner}
          alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(8,12,21,0.4) 0%, rgba(8,12,21,0.92) 100%)'
        }} />
        <div className="container" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '36px' }}>
          <button
            onClick={onBack}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', background: 'transparent', marginBottom: '20px', fontSize: '0.9rem' }}
          >
            <ArrowLeft size={18} /> Back to Events
          </button>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span className="badge badge-brand">{event.category}</span>
            <StatusBadge status={event.status} />
            {event.isFull && <StatusBadge status="SOLD OUT" />}
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', maxWidth: '800px', lineHeight: 1.2 }}>{event.title}</h1>
        </div>
      </div>

      {/* Main Content + Sticky Sidebar */}
      <div className="container" style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px', alignItems: 'start' }}>
        {/* Left: Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Key Info Chips */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: 'var(--text-muted)' }}>
              <Calendar size={20} color="#818CF8" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{formattedStart}</div>
                <div style={{ fontSize: '0.875rem' }}>{formattedTime}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: 'var(--text-muted)' }}>
              {event.locationType === 'VIRTUAL' ? <Video size={20} color="#38BDF8" style={{ flexShrink: 0 }} /> : <MapPin size={20} color="#F43F5E" style={{ flexShrink: 0 }} />}
              <div>
                <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{event.locationType === 'VIRTUAL' ? 'Online Event' : 'In-Person'}</div>
                {event.locationType === 'VIRTUAL' ? (
                  <a href={event.venueOrUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#38BDF8', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Join Meeting Link <ExternalLink size={12} />
                  </a>
                ) : (
                  <div style={{ fontSize: '0.875rem' }}>{event.venueOrUrl}</div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Users size={20} color="#10B981" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--text-main)', fontWeight: 600, marginBottom: '8px' }}>
                  {event.confirmedAttendees} / {event.maxCapacity} attending
                  {event.waitlistedAttendees > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--status-warning)', marginLeft: '10px' }}>+{event.waitlistedAttendees} waitlisted</span>}
                </div>
                <CapacityBar maxCapacity={event.maxCapacity} confirmedCount={event.confirmedAttendees} showDetails={false} />
              </div>
            </div>
          </div>

          {/* About This Event */}
          <div>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '16px' }}>About This Event</h2>
            <div style={{ color: 'var(--text-muted)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{event.description}</div>
          </div>

          {/* Organizer Card */}
          {event.organizer && (
            <div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '16px' }}>Organized by</h2>
              <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4F46E5, #9333EA)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FFFFFF', fontWeight: 700, fontSize: '1.1rem'
                }}>
                  {event.organizer.name?.charAt(0) || 'O'}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{event.organizer.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{event.organizer.email}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: RSVP Sticky Card */}
        <div style={{ position: 'sticky', top: '96px' }}>
          <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.2rem' }}>RSVP for this Event</h3>

            {/* Current RSVP Status */}
            {hasRsvp && (
              <div style={{
                padding: '14px',
                background: rsvpState.status === 'CONFIRMED' ? 'var(--status-success-bg)' : 'var(--status-warning-bg)',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${rsvpState.status === 'CONFIRMED' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  {rsvpState.status === 'CONFIRMED' ? <CheckCircle size={18} color="var(--status-success)" /> : <Clock size={18} color="var(--status-warning)" />}
                  <span style={{ color: rsvpState.status === 'CONFIRMED' ? 'var(--status-success)' : 'var(--status-warning)' }}>
                    {rsvpState.status === 'CONFIRMED' ? "You're Confirmed!" : "You're Waitlisted"}
                  </span>
                </div>
                {rsvpState.ticketCode && (
                  <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    Ticket: <strong style={{ color: 'var(--text-main)' }}>{rsvpState.ticketCode}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Message */}
            {message && (
              <div style={{
                padding: '12px',
                background: message.type === 'success' ? 'var(--status-success-bg)' : 'var(--status-danger-bg)',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: message.type === 'success' ? 'var(--status-success)' : 'var(--status-danger)',
                fontSize: '0.875rem'
              }}>
                {message.text}
              </div>
            )}

            <CapacityBar maxCapacity={event.maxCapacity} confirmedCount={event.confirmedAttendees} />

            {!isAuthenticated ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '12px 0' }}>
                <AlertCircle size={20} style={{ display: 'block', margin: '0 auto 8px' }} />
                Sign in to RSVP for this event
              </div>
            ) : isHead ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>
                You are the organizer of this event.
              </div>
            ) : hasRsvp ? (
              <button
                className="btn btn-danger"
                onClick={handleCancel}
                disabled={isLoading}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {isLoading ? 'Cancelling...' : 'Cancel My RSVP'}
              </button>
            ) : (
              <button
                className="btn btn-primary btn-lg"
                onClick={handleRsvp}
                disabled={isLoading}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {isLoading ? 'Processing...' : event.isFull ? 'Join Waitlist' : '🎟️ Reserve My Spot'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
