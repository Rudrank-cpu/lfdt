import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { generateQrSvg } from '../utils/qr';
import { downloadIcsFile, getGoogleCalendarUrl } from '../utils/calendar';
import {
  Ticket, Calendar, MapPin, Video, Download,
  ExternalLink, Printer, ArrowLeft, CheckCircle, Sparkles
} from 'lucide-react';

export const MyTicketsPage = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    setIsLoading(true);

    Promise.all([
      api.getEvent(eventId),
      api.getMyRegistrations()
    ])
      .then(([evData, regs]) => {
        setEvent(evData);
        const found = regs.find(r => r.event_id === eventId);
        if (!found) {
          toast.error('You do not have an active booking for this event.');
          navigate('/my-registrations');
          return;
        }
        setRegistration(found);
      })
      .catch(err => {
        toast.error('Failed to load ticket pass: ' + err.message);
        navigate('/my-registrations');
      })
      .finally(() => setIsLoading(false));
  }, [eventId]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        Generating your digital pass...
      </div>
    );
  }

  if (!event || !registration) return null;

  const qrSvg = generateQrSvg(
    `EVENTFLOW-TICKET:${registration.ticket_code || 'DEMO'}|EVENT:${event.id}|USER:${registration.user_id || user?.id}`,
    200
  );

  const formattedStart = new Date(event.startTime).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = `${new Date(event.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <div style={{ padding: '36px 0 80px' }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '24px' }}>
          <Link
            to="/my-registrations"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500
            }}
          >
            <ArrowLeft size={16} />
            Back to My Bookings
          </Link>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '9999px',
              padding: '6px 14px',
              fontSize: '0.8rem',
              color: '#A5B4FC',
              fontWeight: 600,
              marginBottom: '12px'
            }}
          >
            <Sparkles size={14} />
            Verified Digital Admission
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            Official Event Pass
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
            Present this QR code at the venue entrance or save to your calendar.
          </p>
        </div>

        {/* Pass Card */}
        <div
          style={{
            background: 'linear-gradient(145deg, #111827 0%, #1E293B 100%)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.7)',
            marginBottom: '24px'
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              background: 'var(--brand-gradient)',
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#FFFFFF'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Ticket size={22} />
              <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
                EventFlow Admission Pass
              </span>
            </div>
            <StatusBadge status={registration.registration_status || registration.status} />
          </div>

          {/* Pass Body */}
          <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <span className="badge badge-brand" style={{ marginBottom: '8px' }}>
                {event.category}
              </span>
              <h2 style={{ fontSize: '1.5rem', lineHeight: 1.3, color: '#FFFFFF', marginTop: '6px' }}>
                {event.title}
              </h2>
            </div>

            {/* Event Time & Venue */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.925rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={18} color="#818CF8" style={{ flexShrink: 0 }} />
                <span>{formattedStart} · {formattedTime}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {event.locationType === 'VIRTUAL' ? (
                  <>
                    <Video size={18} color="#38BDF8" style={{ flexShrink: 0 }} />
                    <span style={{ color: '#38BDF8' }}>Online Virtual Access</span>
                  </>
                ) : (
                  <>
                    <MapPin size={18} color="#F43F5E" style={{ flexShrink: 0 }} />
                    <span>{event.venueOrUrl}</span>
                  </>
                )}
              </div>
            </div>

            {/* Dashed Separator */}
            <div style={{ borderBottom: '2px dashed rgba(255, 255, 255, 0.15)', margin: '4px 0' }} />

            {/* QR Code Section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '12px 0' }}>
              <div
                style={{
                  background: '#FFFFFF',
                  padding: '16px',
                  borderRadius: '16px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  display: 'inline-block'
                }}
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>
                  Verification Ticket Code
                </div>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    color: '#818CF8',
                    marginTop: '4px'
                  }}
                >
                  {registration.ticket_code}
                </div>
              </div>
            </div>

            {/* Attendee Info Row */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.85rem'
              }}
            >
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem' }}>Attendee</span>
                <strong style={{ color: 'var(--text-main)' }}>{user?.fullName || 'Participant'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem' }}>Email</span>
                <span style={{ color: 'var(--text-muted)' }}>{user?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          <button
            type="button"
            onClick={() => downloadIcsFile(event)}
            className="btn btn-secondary"
            style={{ justifyContent: 'center' }}
          >
            <Download size={16} />
            Download .ICS
          </button>

          <a
            href={getGoogleCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ justifyContent: 'center', textDecoration: 'none' }}
          >
            <ExternalLink size={16} />
            Google Calendar
          </a>

          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-primary"
            style={{ justifyContent: 'center' }}
          >
            <Printer size={16} />
            Print Pass
          </button>
        </div>
      </div>
    </div>
  );
};
