import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatMetricCard } from '../components/organizer/StatMetricCard';
import { EventFormModal } from '../components/organizer/EventFormModal';
import { AttendeeRosterModal } from '../components/organizer/AttendeeRosterModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { StatusBadge } from '../components/common/StatusBadge';
import { CapacityBar } from '../components/common/CapacityBar';
import {
  Calendar, Users, TrendingUp, Plus,
  Edit2, Trash2, Eye, BarChart3, Shield, Search
} from 'lucide-react';

export const OrganizerDashboardPage = ({ onCreateEventRef }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [rosterEvent, setRosterEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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
      toast.error('Failed to load events.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const handleCreate = async (payload) => {
    try {
      await api.createEvent(payload);
      toast.success('Event published successfully!');
      await fetchEvents();
    } catch (err) {
      toast.error('Failed to create event: ' + err.message);
    }
  };

  const handleUpdate = async (payload) => {
    try {
      await api.updateEvent(editingEvent.id, payload);
      toast.success('Event updated successfully!');
      setEditingEvent(null);
      await fetchEvents();
    } catch (err) {
      toast.error('Failed to update event: ' + err.message);
    }
  };

  const handleStatusChange = async (event, newStatus) => {
    try {
      await api.updateEventStatus(event.id, newStatus);
      toast.info(`Event status updated to ${newStatus}`);
      await fetchEvents();
    } catch (err) {
      toast.error('Status change failed: ' + err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingEvent) return;
    setIsDeleting(true);
    try {
      await api.deleteEvent(deletingEvent.id);
      toast.info(`Event "${deletingEvent.title}" deleted.`);
      setDeletingEvent(null);
      await fetchEvents();
    } catch (err) {
      toast.error('Delete failed: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Compute Metrics
  const totalAttendees = events.reduce((sum, e) => sum + (e.confirmedAttendees || 0), 0);
  const publishedEvents = events.filter(e => e.status === 'PUBLISHED');
  const totalCapacity = events.reduce((sum, e) => sum + (e.maxCapacity || 0), 0);
  const fillRate = totalCapacity > 0 ? Math.round((totalAttendees / totalCapacity) * 100) : 0;

  const STATUS_OPTIONS = ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'];

  // Filtered event list
  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    return e.status === statusFilter;
  });

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <Shield size={22} color="#818CF8" />
              <span style={{ fontSize: '0.85rem', color: '#818CF8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Organizer Studio
              </span>
            </div>
            <h1 style={{ fontSize: '2rem' }}>Welcome back, {user?.fullName?.split(' ')[0]}!</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
              Monitor attendee turnout, manage lifecycle states, and oversee registrations.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
            style={{ gap: '8px', whiteSpace: 'nowrap' }}
          >
            <Plus size={18} /> Create Event
          </button>
        </div>

        {/* Metrics Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginBottom: '44px' }}>
          <StatMetricCard
            label="Total Events"
            value={events.length}
            icon={Calendar}
            color="#6366F1"
            subLabel={`${publishedEvents.length} published`}
          />
          <StatMetricCard
            label="Total Attendees"
            value={totalAttendees}
            icon={Users}
            color="#10B981"
            subLabel="Confirmed RSVPs"
          />
          <StatMetricCard
            label="Capacity Fill Rate"
            value={`${fillRate}%`}
            icon={TrendingUp}
            color="#F59E0B"
            subLabel="Across all events"
          />
          <StatMetricCard
            label="Published Events"
            value={publishedEvents.length}
            icon={BarChart3}
            color="#EC4899"
            subLabel="Live in catalog"
          />
        </div>

        {/* Search & Status Filter Bar for Table */}
        <div
          style={{
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
            <Search
              size={16}
              color="var(--text-dim)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              className="input-field"
              placeholder="Search your events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '38px', height: '40px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-main)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Statuses ({events.length})</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Events Table Container */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-dim)' }}>
            Loading organizer dashboard...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
            <Calendar size={56} strokeWidth={1.5} color="var(--text-dim)" style={{ display: 'block', margin: '0 auto 16px' }} />
            <h3 style={{ marginBottom: '8px' }}>No events found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              {events.length === 0
                ? 'Create your first event to start accepting registrations.'
                : 'No events match your search or filter.'}
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
              style={{ gap: '8px' }}
            >
              <Plus size={16} /> Create New Event
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredEvents.map(event => (
              <div
                key={event.id}
                className="glass-card"
                style={{
                  padding: '20px',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '20px',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', minWidth: 0 }}>
                  {/* Date Badge */}
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '12px',
                      flexShrink: 0,
                      background: 'linear-gradient(135deg, #1E1B4B, #312E81)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#C7D2FE',
                      fontWeight: 700
                    }}
                  >
                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>
                      {new Date(event.startTime).getDate()}
                    </span>
                    <span style={{ fontSize: '0.6rem', textTransform: 'uppercase' }}>
                      {new Date(event.startTime).toLocaleString('en-US', { month: 'short' })}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '1.05rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer'
                        }}
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        {event.title}
                      </span>
                      <StatusBadge status={event.status} />
                      <span className="badge badge-brand">{event.category}</span>
                    </div>

                    <div style={{ maxWidth: '480px' }}>
                      <CapacityBar
                        maxCapacity={event.maxCapacity}
                        confirmedCount={event.confirmedAttendees || 0}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
                  {/* Lifecycle Status Switcher */}
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
                    title="Change event lifecycle status"
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setRosterEvent(event)}
                    title="View Attendees Roster"
                    style={{ gap: '6px' }}
                  >
                    <Users size={15} /> Roster
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/events/${event.id}`)}
                    title="View Public Catalog Page"
                  >
                    <Eye size={15} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditingEvent(event)}
                    title="Edit Event"
                  >
                    <Edit2 size={15} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => setDeletingEvent(event)}
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

      {/* Create Event Modal */}
      <EventFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
      />

      {/* Edit Event Modal */}
      <EventFormModal
        isOpen={Boolean(editingEvent)}
        onClose={() => setEditingEvent(null)}
        onSubmit={handleUpdate}
        existingEvent={editingEvent}
      />

      {/* Attendee Roster Modal */}
      <AttendeeRosterModal
        isOpen={Boolean(rosterEvent)}
        onClose={() => setRosterEvent(null)}
        event={rosterEvent}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingEvent)}
        onClose={() => setDeletingEvent(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Event"
        message={`Permanently delete "${deletingEvent?.title}"? All existing attendee registrations will also be removed.`}
        confirmText="Yes, Delete Event"
        cancelText="Cancel"
        isDanger={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
