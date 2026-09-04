import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Video, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { CapacityBar } from '../common/CapacityBar';

export const EventCard = ({ event, onSelect }) => {
  const navigate = useNavigate();

  const formattedDate = new Date(event.startTime).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = new Date(event.startTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const defaultBanner = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';

  // Capacity calculation
  const fillRatio = (event.confirmedAttendees || 0) / (event.maxCapacity || 1);
  const isFillingFast = fillRatio >= 0.8 && !event.isFull;

  // Check if today
  const eventDate = new Date(event.startTime);
  const today = new Date();
  const isHappeningToday =
    eventDate.getFullYear() === today.getFullYear() &&
    eventDate.getMonth() === today.getMonth() &&
    eventDate.getDate() === today.getDate();

  const handleClick = () => {
    if (onSelect) {
      onSelect(event);
    } else {
      navigate(`/events/${event.id}`);
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
      onClick={handleClick}
    >
      {/* Banner Image with Status Overlays */}
      <div style={{ position: 'relative', height: '180px', width: '100%', overflow: 'hidden' }}>
        <img
          src={event.bannerUrl || defaultBanner}
          alt={event.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 22, 36, 0.95) 0%, transparent 60%)'
          }}
        />

        {/* Top Badges */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <span className="badge badge-brand">{event.category}</span>
          {event.isFull && <StatusBadge status="SOLD OUT" />}
          {isHappeningToday && <StatusBadge isHappeningToday />}
          {isFillingFast && <StatusBadge isFillingFast />}
          {event.status === 'DRAFT' && <StatusBadge status="DRAFT" />}
        </div>

        {/* Location Type Indicator */}
        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          <span
            style={{
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(8px)',
              color: '#FFFFFF',
              fontSize: '0.75rem',
              padding: '4px 10px',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontWeight: 500
            }}
          >
            {event.locationType === 'VIRTUAL' ? <Video size={13} color="#38BDF8" /> : <MapPin size={13} color="#F43F5E" />}
            {event.locationType === 'VIRTUAL' ? 'Virtual' : 'In-Person'}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
          <Calendar size={14} color="#818CF8" />
          <span>{formattedDate} • {formattedTime}</span>
        </div>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', lineHeight: 1.35 }}>
          {event.title}
        </h3>

        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            marginBottom: '18px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.5
          }}
        >
          {event.description}
        </p>

        {/* Venue or Meeting URL */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '18px' }}>
          <MapPin size={14} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {event.venueOrUrl}
          </span>
        </div>

        {/* Capacity Bar */}
        <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-glass)' }}>
          <CapacityBar maxCapacity={event.maxCapacity} confirmedCount={event.confirmedAttendees} />
        </div>

        {/* Action Button */}
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className={`btn ${event.isFull ? 'btn-secondary' : 'btn-primary'} btn-sm`}
            style={{ width: '100%', justifyContent: 'space-between' }}
          >
            <span>{event.isFull ? 'Join Waitlist' : 'View & RSVP'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
