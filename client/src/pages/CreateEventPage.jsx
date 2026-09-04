import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { EventCard } from '../components/events/EventCard';
import {
  CalendarDays, MapPin, Video, Users,
  AlignLeft, Sparkles, ArrowLeft, Check, Save
} from 'lucide-react';

const CATEGORIES = ['Technology', 'Workshops', 'Business', 'Healthcare', 'Design', 'Education', 'Networking'];

const STOCK_BANNERS = [
  { id: 'tech', label: 'AI & Tech', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80' },
  { id: 'workshop', label: 'Workshop', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80' },
  { id: 'design', label: 'Design', url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80' },
  { id: 'network', label: 'Networking', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80' },
  { id: 'business', label: 'Business', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80' },
  { id: 'cultural', label: 'Cultural', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80' }
];

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const pad = n => String(n).padStart(2, '0');
  const startStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T10:00`;
  const endStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T17:00`;

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Technology',
    bannerUrl: STOCK_BANNERS[0].url,
    locationType: 'IN_PERSON',
    venueOrUrl: '',
    startTime: startStr,
    endTime: endStr,
    maxCapacity: 100,
    status: 'PUBLISHED'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Form validations adhering to frontend.md Section 8
    if (form.title.trim().length < 5) {
      setError('Event title must be at least 5 characters.');
      return;
    }

    if (new Date(form.startTime) <= new Date()) {
      setError('Start date must be set in the future.');
      return;
    }

    if (new Date(form.endTime) <= new Date(form.startTime)) {
      setError('End time must be after start time.');
      return;
    }

    if (Number(form.maxCapacity) < 1) {
      setError('Maximum capacity must be at least 1 seat.');
      return;
    }

    if (!form.venueOrUrl.trim()) {
      setError(form.locationType === 'VIRTUAL' ? 'Please provide the virtual meeting link.' : 'Please provide the physical venue address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createEvent({
        ...form,
        maxCapacity: Number(form.maxCapacity)
      });
      toast.success('Event created and published successfully!');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create event.');
      toast.error('Failed to create event: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Construct preview event object for the EventCard
  const previewEvent = {
    id: 'preview',
    title: form.title || 'Untitled Event Preview',
    description: form.description || 'Event description will appear here as you type in the form...',
    category: form.category,
    bannerUrl: form.bannerUrl,
    locationType: form.locationType,
    venueOrUrl: form.venueOrUrl || (form.locationType === 'VIRTUAL' ? 'https://meet.google.com/xyz' : 'Venue Hall / Room'),
    startTime: form.startTime,
    endTime: form.endTime,
    maxCapacity: Number(form.maxCapacity) || 100,
    confirmedAttendees: 0,
    remainingSeats: Number(form.maxCapacity) || 100,
    status: form.status,
    organizer: { name: 'You (Organizer)' }
  };

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
        <div style={{ marginBottom: '32px' }}>
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
            Organizer Event Studio
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            Create New Event
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '6px' }}>
            Fill in the event details with instant live card preview as attendees will see it in the catalog.
          </p>
        </div>

        {/* Form & Live Preview Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '36px',
            alignItems: 'start'
          }}
        >
          {/* Form Column */}
          <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '32px' }}>
            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#F87171',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  marginBottom: '20px'
                }}
              >
                {error}
              </div>
            )}

            {/* Basic Info */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                Event Title *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Distributed Systems & AI Masterclass"
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                required
              />
            </div>

            {/* Category & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                  Category *
                </label>
                <select
                  className="input-field"
                  value={form.category}
                  onChange={e => handleChange('category', e.target.value)}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                  Publish Status
                </label>
                <select
                  className="input-field"
                  value={form.status}
                  onChange={e => handleChange('status', e.target.value)}
                >
                  <option value="PUBLISHED">Published (Active)</option>
                  <option value="DRAFT">Draft (Unlisted)</option>
                </select>
              </div>
            </div>

            {/* Schedule */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  className="input-field"
                  value={form.startTime}
                  onChange={e => handleChange('startTime', e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  className="input-field"
                  value={form.endTime}
                  onChange={e => handleChange('endTime', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Location Type & Venue/URL */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                Event Format *
              </label>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => handleChange('locationType', 'IN_PERSON')}
                  className={form.locationType === 'IN_PERSON' ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ flex: 1, padding: '10px' }}
                >
                  <MapPin size={16} /> In-Person Venue
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('locationType', 'VIRTUAL')}
                  className={form.locationType === 'VIRTUAL' ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ flex: 1, padding: '10px' }}
                >
                  <Video size={16} /> Virtual Meeting
                </button>
              </div>

              <input
                type="text"
                className="input-field"
                placeholder={form.locationType === 'VIRTUAL' ? 'e.g. https://meet.google.com/abc-defg-hij' : 'e.g. Tech Park, Auditorium 3B, New York'}
                value={form.venueOrUrl}
                onChange={e => handleChange('venueOrUrl', e.target.value)}
                required
              />
            </div>

            {/* Max Capacity */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                Seat Capacity Limit *
              </label>
              <input
                type="number"
                min="1"
                className="input-field"
                value={form.maxCapacity}
                onChange={e => handleChange('maxCapacity', e.target.value)}
                required
              />
              <span style={{ fontSize: '0.775rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                ACID transactional locks guarantee that capacity is never oversold under high concurrency.
              </span>
            </div>

            {/* Stock Banner Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                Banner Poster
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
                {STOCK_BANNERS.map(b => (
                  <div
                    key={b.id}
                    onClick={() => handleChange('bannerUrl', b.url)}
                    style={{
                      border: form.bannerUrl === b.url ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <img src={b.url} alt={b.label} style={{ width: '100%', height: '56px', objectFit: 'cover' }} />
                    <div style={{ padding: '4px 6px', fontSize: '0.75rem', color: 'var(--text-main)', textAlign: 'center', background: 'var(--bg-surface)' }}>
                      {b.label}
                    </div>
                  </div>
                ))}
              </div>
              <input
                type="url"
                className="input-field"
                placeholder="Or paste custom image banner URL..."
                value={form.bannerUrl}
                onChange={e => handleChange('bannerUrl', e.target.value)}
              />
            </div>

            {/* Detailed Description */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                Event Description & Agenda
              </label>
              <textarea
                className="input-field"
                rows={5}
                placeholder="Provide details about the agenda, speakers, prerequisites, and learning outcomes..."
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
              />
            </div>

            {/* Submit Bar */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Link to="/admin/dashboard" className="btn btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                <Save size={16} />
                {isSubmitting ? 'Publishing Event...' : 'Create & Publish Event'}
              </button>
            </div>
          </form>

          {/* Live Preview Column */}
          <div>
            <div
              style={{
                position: 'sticky',
                top: '90px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Live Catalog Card Preview
                </span>
                <span style={{ fontSize: '0.75rem', color: '#A5B4FC' }}>
                  Auto-syncing with form
                </span>
              </div>

              <EventCard event={previewEvent} />

              <div
                style={{
                  padding: '16px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.825rem',
                  color: 'var(--text-dim)',
                  lineHeight: 1.5
                }}
              >
                💡 <strong>Tip:</strong> Once published, attendees will be able to discover this event in the public catalog and reserve their seat immediately.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
