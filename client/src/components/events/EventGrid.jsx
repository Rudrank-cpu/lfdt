import React from 'react';
import { EventCard } from './EventCard';
import { CalendarX } from 'lucide-react';

export const EventGrid = ({ events, onSelectEvent, isLoading }) => {
  if (isLoading) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '24px'
      }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="glass-card"
            style={{ height: '420px', animation: 'pulse 1.5s ease-in-out infinite' }}
          />
        ))}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        color: 'var(--text-muted)',
        gap: '16px'
      }}>
        <CalendarX size={56} color="var(--text-dim)" strokeWidth={1.5} />
        <h3 style={{ fontSize: '1.3rem' }}>No Events Found</h3>
        <p style={{ color: 'var(--text-dim)', textAlign: 'center', maxWidth: '360px' }}>
          Try adjusting your search or category filters to discover more events.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
      gap: '24px'
    }}>
      {events.map(event => (
        <EventCard key={event.id} event={event} onSelect={onSelectEvent} />
      ))}
    </div>
  );
};
