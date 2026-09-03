import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { SearchFilterBar } from '../components/events/SearchFilterBar';
import { EventGrid } from '../components/events/EventGrid';
import { Sparkles } from 'lucide-react';

export const CatalogPage = ({ onSelectEvent }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const data = await api.listEvents({ search: debouncedSearch, category, status: 'PUBLISHED' });
        setEvents(data);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [debouncedSearch, category]);

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '9999px',
            padding: '6px 16px',
            fontSize: '0.8rem',
            color: '#A5B4FC',
            fontWeight: 600,
            marginBottom: '24px'
          }}>
            <Sparkles size={14} />
            Discover Events Near You
          </div>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '16px'
          }}>
            Find Your Next<br />
            <span className="gradient-text">Unforgettable Experience</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '560px', margin: '0 auto' }}>
            Conferences, workshops, and networking events curated for curious minds and ambitious professionals.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ marginBottom: '40px' }}>
          <SearchFilterBar
            onSearch={setSearch}
            onCategory={setCategory}
            selectedCategory={category}
            searchValue={search}
          />
        </div>

        {/* Results Count */}
        {!isLoading && (
          <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', marginBottom: '20px' }}>
            {events.length} event{events.length !== 1 ? 's' : ''} found
            {category !== 'All' ? ` in "${category}"` : ''}
            {debouncedSearch ? ` matching "${debouncedSearch}"` : ''}
          </p>
        )}

        {/* Events Grid */}
        <EventGrid
          events={events}
          onSelectEvent={onSelectEvent}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
