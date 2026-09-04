import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Download, Users, Search, Ticket, Mail, User } from 'lucide-react';

export const AttendeeRosterModal = ({ isOpen, onClose, event }) => {
  const [attendees, setAttendees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const toast = useToast();

  useEffect(() => {
    if (isOpen && event?.id) {
      setIsLoading(true);
      api.getEventAttendees(event.id)
        .then(data => setAttendees(data.attendees || []))
        .catch(err => {
          console.error(err);
          toast.error('Failed to load attendee roster: ' + err.message);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, event]);

  const handleExportCsv = () => {
    const token = api.getToken();
    const url = api.getExportCsvUrl(event.id);

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => {
        if (!r.ok) throw new Error('Export failed');
        return r.blob();
      })
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${event.title.replace(/\s+/g, '_')}_attendees.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
        toast.success('Attendee roster exported to CSV!');
      })
      .catch(err => toast.error('CSV export failed: ' + err.message));
  };

  const filtered = attendees.filter(a => {
    const matchesSearch =
      a.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.ticket_code?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    return a.status === statusFilter;
  });

  const confirmed = attendees.filter(a => a.status === 'CONFIRMED').length;
  const waitlisted = attendees.filter(a => a.status === 'WAITLISTED').length;
  const cancelled = attendees.filter(a => a.status === 'CANCELLED').length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="👥 Attendee Roster" maxWidth="820px">
      {/* Event Summary Banner */}
      <div
        style={{
          padding: '16px 20px',
          background: 'rgba(99, 102, 241, 0.08)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
            {event?.title}
          </div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Capacity Limit: {event?.maxCapacity} seats · {Math.max(0, (event?.maxCapacity || 0) - confirmed)} remaining
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-success">{confirmed} Confirmed</span>
          {waitlisted > 0 && <span className="badge badge-warning">{waitlisted} Waitlisted</span>}
          {cancelled > 0 && <span className="badge badge-draft">{cancelled} Cancelled</span>}
        </div>
      </div>

      {/* Search + Filter Tabs + Export Row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={16}
              color="var(--text-dim)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              className="input-field"
              placeholder="Search by participant name, email, or ticket code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '38px', height: '40px' }}
            />
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleExportCsv}
            style={{ gap: '8px', whiteSpace: 'nowrap', height: '40px' }}
            title="Download CSV roster"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['ALL', 'CONFIRMED', 'WAITLISTED', 'CANCELLED'].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 600,
                background: statusFilter === s ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: statusFilter === s ? '1px solid var(--brand-primary)' : '1px solid var(--border-glass)',
                color: statusFilter === s ? '#C7D2FE' : 'var(--text-dim)',
                cursor: 'pointer'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Attendee Roster Table */}
      <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)' }}>
              {['Participant', 'Email', 'Status', 'Ticket Pass', 'Registered Date'].map(h => (
                <th
                  key={h}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    color: 'var(--text-dim)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                  Loading attendee records...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No participants matched the criteria.
                </td>
              </tr>
            ) : (
              filtered.map((a, idx) => (
                <tr
                  key={a.registration_id || idx}
                  style={{
                    borderBottom: '1px solid var(--border-glass)',
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'
                  }}
                >
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: 'rgba(99, 102, 241, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          color: '#C7D2FE',
                          fontWeight: 700
                        }}
                      >
                        {a.full_name?.charAt(0) || 'U'}
                      </div>
                      <span>{a.full_name}</span>
                    </div>
                  </td>

                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                    {a.email}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <StatusBadge status={a.status} />
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    {a.ticket_code ? (
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                          color: '#A5B4FC',
                          background: 'rgba(99, 102, 241, 0.12)',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        {a.ticket_code}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td style={{ padding: '12px 16px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                    {new Date(a.registered_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
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
