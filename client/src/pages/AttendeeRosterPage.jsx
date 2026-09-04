import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Users, Download, Search, CheckCircle, Clock,
  XCircle, ArrowLeft, QrCode, Sparkles, Check, RefreshCw
} from 'lucide-react';

export const AttendeeRosterPage = () => {
  const { id } = useParams();
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Check-in state
  const [checkinCode, setCheckinCode] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [lastCheckinResult, setLastCheckinResult] = useState(null);

  const fetchRoster = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await api.getEventAttendees(id);
      setEvent(data.event);
      setAttendees(data.attendees || []);
    } catch (err) {
      toast.error('Failed to load attendee roster: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [id]);

  const handleCheckin = async (e) => {
    e.preventDefault();
    if (!checkinCode.trim()) return;

    setIsCheckingIn(true);
    setLastCheckinResult(null);
    try {
      const res = await api.checkinAttendee(id, checkinCode.trim());
      setLastCheckinResult(res);
      if (res.alreadyCheckedIn) {
        toast.warning(res.message);
      } else {
        toast.success(res.message);
      }
      setCheckinCode('');
      await fetchRoster();
    } catch (err) {
      toast.error(err.message || 'Check-in failed');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleExportCsv = () => {
    window.location.href = api.getExportCsvUrl(id);
    toast.info('Downloading attendee roster CSV...');
  };

  const filteredAttendees = attendees.filter(a => {
    const matchesSearch =
      a.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.ticket_code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading && !event) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        Loading attendee roster...
      </div>
    );
  }

  return (
    <div style={{ padding: '36px 0 80px' }}>
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '24px' }}>
          <Link
            to="/admin/dashboard"
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
            Back to Organizer Studio
          </Link>
        </div>

        {/* Page Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '32px'
          }}
        >
          <div>
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
              <Users size={14} />
              Attendee Oversight
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              {event?.title || 'Attendee Roster'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
              Capacity: {event?.confirmedCount} / {event?.maxCapacity} confirmed · {event?.waitlistedCount} on waitlist
            </p>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button type="button" onClick={fetchRoster} className="btn btn-secondary" title="Refresh Roster">
              <RefreshCw size={16} />
            </button>
            <button type="button" onClick={handleExportCsv} className="btn btn-primary">
              <Download size={16} />
              Export to CSV
            </button>
          </div>
        </div>

        {/* Check-in Bar for Venue Entrance */}
        <div
          className="glass-card"
          style={{
            padding: '24px',
            marginBottom: '32px',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <QrCode size={20} color="#818CF8" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Venue Entrance Check-in & Pass Verification
            </h3>
          </div>
          <form onSubmit={handleCheckin} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Enter or scan Ticket Code (e.g. EF-A91B2)..."
              value={checkinCode}
              onChange={e => setCheckinCode(e.target.value)}
              style={{ flex: 1, minWidth: '240px' }}
            />
            <button type="submit" className="btn btn-primary" disabled={isCheckingIn || !checkinCode.trim()}>
              <Check size={16} />
              {isCheckingIn ? 'Verifying...' : 'Check In Attendee'}
            </button>
          </form>

          {lastCheckinResult && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: lastCheckinResult.alreadyCheckedIn ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                border: lastCheckinResult.alreadyCheckedIn ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                color: lastCheckinResult.alreadyCheckedIn ? '#FBBF24' : '#34D399',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.9rem'
              }}
            >
              <CheckCircle size={18} />
              <span>
                <strong>{lastCheckinResult.attendee?.fullName}</strong> ({lastCheckinResult.attendee?.ticketCode}) — {lastCheckinResult.message}
              </span>
            </div>
          )}
        </div>

        {/* Search & Filter Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '20px'
          }}
        >
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search by participant name, email, or ticket code..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '42px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'CONFIRMED', 'WAITLISTED', 'CANCELLED'].map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={statusFilter === st ? 'btn btn-primary' : 'btn btn-secondary'}
                style={{ padding: '8px 14px', fontSize: '0.8rem' }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table Canvas */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(30, 41, 59, 0.4)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>#</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>NAME</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>EMAIL</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>TICKET CODE</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>RSVP DATE</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>CHECK-IN</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendees.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No attendees found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAttendees.map((a, idx) => (
                    <tr
                      key={a.registration_id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '14px 20px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>{idx + 1}</td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-main)', fontWeight: 600 }}>{a.full_name}</td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{a.email}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            background: 'rgba(255, 255, 255, 0.08)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            color: '#A5B4FC'
                          }}
                        >
                          {a.ticket_code}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                        {new Date(a.registered_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        {a.checked_in_at ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              color: '#34D399',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}
                          >
                            <CheckCircle size={14} />
                            Checked In
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Not Yet</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <StatusBadge status={a.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
