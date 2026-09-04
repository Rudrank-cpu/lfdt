import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import {
  CalendarDays, MapPin, Video, Users, DollarSign,
  AlignLeft, Image as ImageIcon, Sparkles, Check
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

const defaultForm = {
  title: '',
  description: '',
  category: 'Technology',
  bannerUrl: STOCK_BANNERS[0].url,
  locationType: 'VIRTUAL',
  venueOrUrl: '',
  startTime: '',
  endTime: '',
  maxCapacity: 100,
  status: 'PUBLISHED'
};

export const EventFormModal = ({ isOpen, onClose, onSubmit, existingEvent = null }) => {
  const [form, setForm] = useState(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingEvent) {
      const toLocalInput = (isoString) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        const pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };

      setForm({
        title: existingEvent.title || '',
        description: existingEvent.description || '',
        category: existingEvent.category || 'Technology',
        bannerUrl: existingEvent.bannerUrl || STOCK_BANNERS[0].url,
        locationType: existingEvent.locationType || 'VIRTUAL',
        venueOrUrl: existingEvent.venueOrUrl || '',
        startTime: toLocalInput(existingEvent.startTime),
        endTime: toLocalInput(existingEvent.endTime),
        maxCapacity: existingEvent.maxCapacity || 100,
        status: existingEvent.status || 'PUBLISHED'
      });
    } else {
      // Default: start tomorrow at 10 AM, end tomorrow at 5 PM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const pad = n => String(n).padStart(2, '0');
      const startStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T10:00`;
      const endStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T17:00`;

      setForm({
        ...defaultForm,
        startTime: startStr,
        endTime: endStr
      });
    }
    setError('');
  }, [existingEvent, isOpen]);

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

    if (form.maxCapacity < 1) {
      setError('Capacity limit must be at least 1 attendee.');
      return;
    }

    if (!form.venueOrUrl.trim()) {
      setError(form.locationType === 'VIRTUAL' ? 'Please provide a virtual meeting URL.' : 'Please enter the physical venue address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        maxCapacity: Number(form.maxCapacity)
      };
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save event. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  };

  const labelStyle = {
    fontSize: '0.825rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingEvent ? '✏️ Edit Event' : '✨ Create New Event'}
      maxWidth="680px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {error && (
          <div
            style={{
              padding: '12px 16px',
              background: 'var(--status-danger-bg)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--status-danger)',
              fontSize: '0.875rem'
            }}
          >
            {error}
          </div>
        )}

        {/* Title */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Event Title *</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g., Full-Stack AI Summit 2026"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
          />
        </div>

        {/* Category & Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Category</label>
            <select
              className="input-field"
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Publication Status</label>
            <select
              className="input-field"
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="PUBLISHED">Published (Visible to Viewers)</option>
              <option value="DRAFT">Draft (Hidden)</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Stock Banner Gallery Selection */}
        <div style={fieldStyle}>
          <label style={labelStyle}>
            <ImageIcon size={14} /> Event Banner Poster
          </label>
          <div className="banner-gallery-grid">
            {STOCK_BANNERS.map(b => (
              <div
                key={b.id}
                className={`banner-preset-thumb ${form.bannerUrl === b.url ? 'active' : ''}`}
                onClick={() => handleChange('bannerUrl', b.url)}
              >
                <img
                  src={b.url}
                  alt={b.label}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#FFFFFF'
                  }}
                >
                  {form.bannerUrl === b.url && (
                    <Check size={14} color="var(--brand-primary)" style={{ marginRight: '4px' }} />
                  )}
                  {b.label}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '8px' }}>
            <input
              type="url"
              className="input-field"
              placeholder="Or paste custom image URL..."
              value={form.bannerUrl}
              onChange={(e) => handleChange('bannerUrl', e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Schedule: Start & End */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>
              <CalendarDays size={14} /> Start Time *
            </label>
            <input
              type="datetime-local"
              className="input-field"
              value={form.startTime}
              onChange={(e) => handleChange('startTime', e.target.value)}
              required
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>
              <CalendarDays size={14} /> End Time *
            </label>
            <input
              type="datetime-local"
              className="input-field"
              value={form.endTime}
              onChange={(e) => handleChange('endTime', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Location Type & Venue/URL */}
        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '16px' }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Format</label>
            <select
              className="input-field"
              value={form.locationType}
              onChange={(e) => handleChange('locationType', e.target.value)}
            >
              <option value="VIRTUAL">Virtual (URL)</option>
              <option value="IN_PERSON">In-Person</option>
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>
              {form.locationType === 'VIRTUAL' ? <Video size={14} /> : <MapPin size={14} />}
              {form.locationType === 'VIRTUAL' ? 'Meeting URL *' : 'Venue Address *'}
            </label>
            <input
              type="text"
              className="input-field"
              placeholder={form.locationType === 'VIRTUAL' ? 'https://meet.google.com/xyz' : 'Auditorium Hall B, Tech Park'}
              value={form.venueOrUrl}
              onChange={(e) => handleChange('venueOrUrl', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Capacity */}
        <div style={fieldStyle}>
          <label style={labelStyle}>
            <Users size={14} /> Maximum Attendee Capacity *
          </label>
          <input
            type="number"
            min="1"
            max="10000"
            className="input-field"
            value={form.maxCapacity}
            onChange={(e) => handleChange('maxCapacity', e.target.value)}
            required
          />
        </div>

        {/* Description & Agenda */}
        <div style={fieldStyle}>
          <label style={labelStyle}>
            <AlignLeft size={14} /> Description & Agenda Details
          </label>
          <textarea
            className="input-field"
            rows="4"
            placeholder="Share session agenda, speaker notes, and what attendees will learn..."
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            required
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving Event...' : existingEvent ? 'Save Changes' : 'Publish Event'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
