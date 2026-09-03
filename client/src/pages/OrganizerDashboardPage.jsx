import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatMetricCard } from '../components/organizer/StatMetricCard';
import { EventFormModal } from '../components/organizer/EventFormModal';
import { AttendeeRosterModal } from '../components/organizer/AttendeeRosterModal';
import { StatusBadge } from '../components/common/StatusBadge';
import { CapacityBar } from '../components/common/CapacityBar';
import {
  Calendar, Users, TrendingUp, Plus,
  Edit2, Trash2, Eye, BarChart3, Shield
} from 'lucide-react';

export const OrganizerDashboardPage = ({ onCreateEventRef }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [rosterEvent, setRosterEvent] = useState(null);

  // Expose create modal opener to Navbar via ref callback
  useEffect(() => {
    if (onCreateEventRef) {
      onCreateEventRef(() => setShowCreateModal(true));
    }
  }, [onCreateEventRef]);

  const fetchEvents = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await api.listEvents({ headUserId: user.id, status: 'ALL' });
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [user]);

  const handleCreate = async (payload) => {
    await api.createEvent(payload);
    await fetchEvents();
  };

  const handleUpdate = async (payload) => {
    await api.updateEvent(editingEvent.id, payload);
    setEditingEvent(null);
    await fetchEvents();
  };

  const handleStatusChange = async (event, newStatus) => {
    try {
      await api.updateEventStatus(event.id, newStatus);
      await fetchEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (event) => {
    if (!window.confirm(`Permanently delete "${event.title}"?`)) return;
    try {
      await api.deleteEvent(event.id);
      await fetchEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  // Compute Metrics
  const totalAttendees = events.reduce((sum, e) => sum + (e.confirmedAttendees || 0), 0);
  const publishedEvents = events.filter(e => e.status === 'PUBLISHED');
  const totalCapacity = events.reduce((sum, e) => sum + (e.maxCapacity || 0), 0);
  const fillRate = totalCapacity > 0 ? Math.round((totalAttendees / totalCapacity) * 100) : 0;

  const STATUS_OPTIONS = ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'];

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <Shield size={22} color="#818CF8" />
              <span style={{ fontSize: '0.85rem', color: '#818CF8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Organizer Studio
              </span>
            </div>
            <h1 style={{ fontSize: '2rem' }}>Welcome back, {user?.fullName?.split(' ')[0]}!</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Manage your events and track attendance in real-time.</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
            style={{ gap: '8px', whiteSpace: 'nowrap' }}
          >
            <Plus size={18} /> Create Event
          </button>
        </div>

        {/* Metrics Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginBottom: '44px' }}>
          <StatMetricCard label="Total Events" value={events.length} icon={Calendar} color="#6366F1" subLabel={`${publishedEvents.length} published`} />
          <StatMetricCard label="Total Attendees" value={totalAttendees} icon={Users} color="#10B981" subLabel="Confirmed RSVPs" />
          <StatMetricCard label="Capacity Fill Rate" value={`${fillRate}%`} icon={TrendingUp} color="#F59E0B" subLabel="Across all events" />
          <StatMetricCard label="Published Events" value={publishedEvents.length} icon={BarChart3} color="#EC4899" subLabel="Live right now" />
        </div>

        {/* Events Table */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.3rem' }}>Your Events</h2>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>{events.length} total</span>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-dim)' }}>Loading events...</div>
        ) : events.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
            <Calendar size={56} strokeWidth={1.5} color="var(--text-dim)" style={{ display: 'block', margin: '0 auto 16px' }} />
            <h3 style={{ marginBottom: '8px' }}>No events yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Create your first event to get started.</p>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} /> Create First Event
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {events.map(event => (
              <div key={event.id} className="glass-card" style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', minWidth: 0 }}>
                  {/* Date Badge */}
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '12px', flexShrink: 0,
                    background: 'linear-gradient(135deg, #1E1B4B, #312E81)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    color: '#C7D2FE', fontWeight: 700
                  }}>
                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{new Date(event.startTime).getDate()}</span>
                    <span style={{ fontSize: '0.6rem', textTransform: 'uppercase' }}>
                      {new Date(event.startTime).toLocaleString('en-US', { month: 'short' })}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.05rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {event.title}
                      </span>
                      <StatusBadge status={event.status} />
                      <span className="badge badge-brand">{event.category}</span>
                    </div>
                    <div style={{ maxWidth: '500px' }}>
                      <CapacityBar maxCapacity={event.maxCapacity} confirmedCount={event.confirmedAttendees} />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                  {/* Status Switcher */}
                  <select
                    value={event.status}
                    onChange={(e) => handleStatusChange(event, e.target.value)}
                    style={{
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-muted)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px 10px',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setRosterEvent(event)}
                    title="View Attendees"
                    style={{ gap: '6px' }}
                  >
                    <Eye size={15} /> Roster
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditingEvent(event)}
                    title="Edit Event"
                  >
                    <Edit2 size={15} />
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(event)}
                    title="Delete Event"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <EventFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
      />
      <EventFormModal
        isOpen={Boolean(editingEvent)}
        onClose={() => setEditingEvent(null)}
        onSubmit={handleUpdate}
        existingEvent={editingEvent}
      />
      <AttendeeRosterModal
        isOpen={Boolean(rosterEvent)}
        onClose={() => setRosterEvent(null)}
        event={rosterEvent}
      />
    </div>
  );
};
