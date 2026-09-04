import React from 'react';
import { Modal } from '../common/Modal';
import { generateQrSvg } from '../../utils/qr';
import { downloadIcsFile, getGoogleCalendarUrl } from '../../utils/calendar';
import { StatusBadge } from '../common/StatusBadge';
import {
  Calendar, MapPin, Video, Ticket, Download,
  ExternalLink, Printer, CheckCircle
} from 'lucide-react';

export const TicketModal = ({ isOpen, onClose, registration, event }) => {
  if (!isOpen || !registration || !event) return null;

  const qrSvg = generateQrSvg(
    `EVENTFLOW-TICKET:${registration.ticket_code || 'DEMO'}|EVENT:${event.id}|USER:${registration.user_id || 'ATTENDEE'}`,
    170
  );

  const formattedStart = new Date(event.startTime).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = `${new Date(event.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🎟️ EventFlow Digital Pass" maxWidth="540px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Ticket Canvas */}
        <div
          style={{
            background: 'linear-gradient(135deg, #111827 0%, #1E293B 100%)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: '0 16px 36px rgba(0,0,0,0.6)'
          }}
        >
          {/* Header Strip */}
          <div
            style={{
              background: 'var(--brand-gradient)',
              padding: '14px 22px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#FFFFFF'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ticket size={20} />
              <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>
                EventFlow Pass
              </span>
            </div>
            <StatusBadge status={registration.status || registration.registration_status || 'CONFIRMED'} />
          </div>

          {/* Ticket Body */}
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <span className="badge badge-brand" style={{ marginBottom: '8px' }}>
                {event.category || 'Event'}
              </span>
              <h3 style={{ fontSize: '1.35rem', lineHeight: 1.3, color: '#FFFFFF', marginTop: '4px' }}>
                {event.title}
              </h3>
            </div>

            {/* Event Time & Venue */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={18} color="#818CF8" style={{ flexShrink: 0 }} />
                <span>{formattedStart} · {formattedTime}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {event.locationType === 'VIRTUAL' ? (
                  <>
                    <Video size={18} color="#38BDF8" style={{ flexShrink: 0 }} />
                    <span style={{ color: '#38BDF8' }}>Virtual Online Access</span>
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
            <div
              style={{
                borderBottom: '2px dashed rgba(255, 255, 255, 0.15)',
                margin: '6px 0'
              }}
            />

            {/* QR Code & Passcode Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Ticket Code
                </div>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    color: '#A5B4FC',
                    background: 'rgba(99, 102, 241, 0.12)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    display: 'inline-block'
                  }}
                >
                  {registration.ticket_code || registration.ticketCode || 'EF-PASS'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <CheckCircle size={14} color="var(--status-success)" />
                  Authorized Entrance Pass
                </div>
              </div>

              {/* Visual QR Code Container */}
              <div
                style={{
                  background: '#FFFFFF',
                  padding: '8px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  flexShrink: 0
                }}
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            </div>
          </div>
        </div>

        {/* Actions Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
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
              Google Cal
            </a>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handlePrint}
            style={{ gap: '6px' }}
          >
            <Printer size={14} />
            Print Pass
          </button>
        </div>
      </div>
    </Modal>
  );
};
