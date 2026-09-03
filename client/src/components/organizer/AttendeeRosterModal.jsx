import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { api } from '../../api/client';
import { Download, Users, Search } from 'lucide-react';

export const AttendeeRosterModal = ({ isOpen, onClose, event }) => {
  const [attendees, setAttendees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && event?.id) {
      setIsLoading(true);
      api.getEventAttendees(event.id)
        .then(data => setAttendees(data.attendees || []))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, event]);

  const handleExportCsv = () => {
    const token = api.getToken();
    const url = api.getExportCsvUrl(event.id);
    // Create a link that includes authorization header (via temp fetch blob)
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${event.title.replace(/\s+/g, '_')}_attendees.csv`;
        a.click();
      });
  };

  const filtered = attendees.filter(a =>
    a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const confirmed = attendees.filter(a => a.status === 'CONFIRMED').length;
  const waitlisted = attendees.filter(a => a.status === 'WAITLISTED').length;
  const cancelled = attendees.filter(a => a.status === 'CANCELLED').length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`👥 Attendee Roster`} maxWidth="780px">
      {/* Event Summary */}
      <div style={{
        padding: '14px',
        background: 'rgba(99, 102, 241, 0.08)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        marginBottom: '20px',
        fontSize: '0.9rem',
        color: 'var(--text-muted)'
      }}>
        <strong style={{ color: 'var(--text-main)' }}>{event?.title}</strong>
        <span style={{ marginLeft: '12px' }}>
          {confirmed} Confirmed · {waitlisted} Waitlisted · {cancelled} Cancelled
        </span>
      </div>

      {/* Search + Export Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            className="input-field"
            placeholder="Search attendees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '38px', height: '40px' }}
          />
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleExportCsv} style={{ gap: '8px', whiteSpace: 'nowrap' }}>
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)' }}>
              {['Name', 'Email', 'Status', 'RSVP Date', 'Ticket'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                  Loading attendees...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                  <Users size={32} strokeWidth={1.5} style={{ display: 'block', margin: '0 auto 8px' }} />
                  No attendees found.
                </td>
              </tr>
            ) : (
              filtered.map((attendee, idx) => (
                <tr
                  key={attendee.id || idx}
                  style={{
                    borderBottom: '1px solid var(--border-glass)',
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'
                  }}
                >
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{attendee.name}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{attendee.email}</td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={attendee.status} /></td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-dim)' }}>
                    {new Date(attendee.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#818CF8' }}>
                    {attendee.ticketCode || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Modal>
  );
};
