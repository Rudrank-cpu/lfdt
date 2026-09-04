import React from 'react';
import { EventCard } from './EventCard';
import { CalendarX, RotateCcw } from 'lucide-react';

export const EventGrid = ({ events, onSelectEvent, isLoading, onClearFilters }) => {
  if (isLoading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '24px'
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="glass-card"
            style={{
              height: '420px',
              animation: 'pulse 1.5s ease-in-out infinite',
              background: 'rgba(18, 25, 41, 0.4)'
            }}
          />
        ))}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
        `}</style>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div
        className="glass-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 20px',
          color: 'var(--text-muted)',
          gap: '16px',
          textAlign: 'center'
        }}
      >
        <CalendarX size={56} color="var(--text-dim)" strokeWidth={1.5} />
        <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)' }}>No Events Found</h3>
        <p style={{ color: 'var(--text-dim)', maxWidth: '380px' }}>
          We couldn't find any events matching your current search or filter criteria.
        </p>
        {onClearFilters && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClearFilters}
            style={{ marginTop: '8px', gap: '8px' }}
          >
            <RotateCcw size={14} />
            Reset All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '24px'
      }}
    >
      {events.map(event => (
        <EventCard key={event.id} event={event} onSelect={onSelectEvent} />
      ))}
    </div>
  );
};
