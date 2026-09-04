import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import {
  CalendarDays, MapPin, Video, Users,
  AlignLeft, ArrowLeft, Save, Trash2
} from 'lucide-react';

const CATEGORIES = ['Technology', 'Workshops', 'Business', 'Healthcare', 'Design', 'Education', 'Networking'];

export const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Technology',
    bannerUrl: '',
    locationType: 'IN_PERSON',
    venueOrUrl: '',
    startTime: '',
    endTime: '',
    maxCapacity: 100,
    status: 'PUBLISHED'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    api.getEvent(id)
      .then(event => {
        const toLocalInput = (isoString) => {
          if (!isoString) return '';
          const d = new Date(isoString);
          const pad = n => String(n).padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };

        setForm({
          title: event.title || '',
          description: event.description || '',
          category: event.category || 'Technology',
          bannerUrl: event.bannerUrl || '',
          locationType: event.locationType || 'IN_PERSON',
          venueOrUrl: event.venueOrUrl || '',
          startTime: toLocalInput(event.startTime),
          endTime: toLocalInput(event.endTime),
          maxCapacity: event.maxCapacity || 100,
          status: event.status || 'PUBLISHED'
        });
      })
      .catch(err => {
        toast.error('Failed to load event: ' + err.message);
        navigate('/admin/dashboard');
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.title.trim().length < 5) {
      setError('Event title must be at least 5 characters.');
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

    setIsSubmitting(true);
    try {
      await api.updateEvent(id, {
        ...form,
        maxCapacity: Number(form.maxCapacity)
      });
      toast.success('Event updated successfully!');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to update event.');
      toast.error('Failed to update event: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        Loading event details...
      </div>
    );
  }

  return (
    <div style={{ padding: '36px 0 80px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
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
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            Edit Event Details
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
            Modify event metadata, schedule, capacity, and lifecycle status.
          </p>
        </div>

        {/* Form Container */}
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

          {/* Event Title */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
              Event Title *
            </label>
            <input
              type="text"
              className="input-field"
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
                Lifecycle Status *
              </label>
              <select
                className="input-field"
                value={form.status}
                onChange={e => handleChange('status', e.target.value)}
              >
                <option value="PUBLISHED">Published (Active)</option>
                <option value="DRAFT">Draft (Unlisted)</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
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
              placeholder={form.locationType === 'VIRTUAL' ? 'Meeting URL' : 'Venue address'}
              value={form.venueOrUrl}
              onChange={e => handleChange('venueOrUrl', e.target.value)}
              required
            />
          </div>

          {/* Max Capacity */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
              Maximum Capacity *
            </label>
            <input
              type="number"
              min="1"
              className="input-field"
              value={form.maxCapacity}
              onChange={e => handleChange('maxCapacity', e.target.value)}
              required
            />
          </div>

          {/* Banner URL */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
              Banner Image URL
            </label>
            <input
              type="url"
              className="input-field"
              value={form.bannerUrl}
              onChange={e => handleChange('bannerUrl', e.target.value)}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
              Event Description & Agenda
            </label>
            <textarea
              className="input-field"
              rows={5}
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Link to="/admin/dashboard" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <Save size={16} />
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
