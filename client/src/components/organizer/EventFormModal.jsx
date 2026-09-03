import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { CalendarDays, MapPin, Video, Users, DollarSign, AlignLeft } from 'lucide-react';

const CATEGORIES = ['Technology', 'Workshops', 'Business', 'Healthcare', 'Design', 'Education', 'Networking'];

const defaultForm = {
  title: '',
  description: '',
  category: 'Technology',
  bannerUrl: '',
  locationType: 'VIRTUAL',
  venueOrUrl: '',
  startTime: '',
  endTime: '',
  maxCapacity: 100,
  status: 'DRAFT'
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
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };
      setForm({
        title: existingEvent.title || '',
        description: existingEvent.description || '',
        category: existingEvent.category || 'Technology',
        bannerUrl: existingEvent.bannerUrl || '',
        locationType: existingEvent.locationType || 'VIRTUAL',
        venueOrUrl: existingEvent.venueOrUrl || '',
        startTime: toLocalInput(existingEvent.startTime),
        endTime: toLocalInput(existingEvent.endTime),
        maxCapacity: existingEvent.maxCapacity || 100,
        status: existingEvent.status || 'DRAFT'
      });
    } else {
      setForm(defaultForm);
    }
    setError('');
  }, [existingEvent, isOpen]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (new Date(form.endTime) <= new Date(form.startTime)) {
      setError('End time must be after start time.');
      return;
    }
    if (form.maxCapacity < 1) {
      setError('Capacity must be at least 1.');
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
      setError(err.message || 'Failed to save event. Please try again.');
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
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Title */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Event Title *</label>
          <input
            className="input-field"
            type="text"
            placeholder="e.g. Full-Stack AI Summit 2026"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div style={fieldStyle}>
          <label style={labelStyle}><AlignLeft size={14} /> Description *</label>
          <textarea
            className="input-field"
            rows={4}
            placeholder="What will attendees experience? Describe your event..."
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            required
            style={{ resize: 'vertical', lineHeight: 1.6 }}
          />
        </div>

        {/* Category + Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Category *</label>
            <select
              className="input-field"
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Status</label>
            <select
              className="input-field"
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Banner URL */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Banner Image URL</label>
          <input
            className="input-field"
            type="url"
            placeholder="https://images.unsplash.com/photo-..."
            value={form.bannerUrl}
            onChange={(e) => handleChange('bannerUrl', e.target.value)}
          />
        </div>

        {/* Start & End Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={fieldStyle}>
            <label style={labelStyle}><CalendarDays size={14} /> Start Date & Time *</label>
            <input
              className="input-field"
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => handleChange('startTime', e.target.value)}
              required
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}><CalendarDays size={14} /> End Date & Time *</label>
            <input
              className="input-field"
              type="datetime-local"
              value={form.endTime}
              onChange={(e) => handleChange('endTime', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Location Type & Venue */}
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '16px' }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Location Type *</label>
            <select
              className="input-field"
              value={form.locationType}
              onChange={(e) => handleChange('locationType', e.target.value)}
            >
              <option value="VIRTUAL">Virtual</option>
              <option value="IN_PERSON">In-Person</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>
              {form.locationType === 'VIRTUAL' ? <Video size={14} /> : <MapPin size={14} />}
              {form.locationType === 'VIRTUAL' ? 'Meeting URL *' : 'Venue Address *'}
            </label>
            <input
              className="input-field"
              type="text"
              placeholder={form.locationType === 'VIRTUAL' ? 'https://meet.google.com/...' : '123 Conference Center, Mumbai'}
              value={form.venueOrUrl}
              onChange={(e) => handleChange('venueOrUrl', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Max Capacity */}
        <div style={fieldStyle}>
          <label style={labelStyle}><Users size={14} /> Maximum Capacity *</label>
          <input
            className="input-field"
            type="number"
            min={1}
            max={100000}
            value={form.maxCapacity}
            onChange={(e) => handleChange('maxCapacity', e.target.value)}
            required
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '12px 16px',
            background: 'var(--status-danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--status-danger)',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        {/* Submit Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : existingEvent ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
