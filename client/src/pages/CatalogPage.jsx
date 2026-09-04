import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { SearchFilterBar } from '../components/events/SearchFilterBar';
import { EventGrid } from '../components/events/EventGrid';
import { Sparkles, CalendarCheck, Compass } from 'lucide-react';

export const CatalogPage = ({ onSelectEvent }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [locationType, setLocationType] = useState('ALL');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const data = await api.listEvents({
          search: debouncedSearch,
          category: category !== 'All' ? category : undefined,
          status: 'PUBLISHED'
        });
        setEvents(data);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [debouncedSearch, category]);

  // Client-side date and location type filtering
  const filteredEvents = events.filter(e => {
    // 1. Location type filter
    if (locationType !== 'ALL' && e.locationType !== locationType) {
      return false;
    }

    // 2. Date filter
    if (dateFilter === 'ALL') return true;

    const eventDate = new Date(e.startTime);
    const now = new Date();

    if (dateFilter === 'TODAY') {
      return (
        eventDate.getFullYear() === now.getFullYear() &&
        eventDate.getMonth() === now.getMonth() &&
        eventDate.getDate() === now.getDate()
      );
    }

    if (dateFilter === 'WEEK') {
      const inOneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return eventDate >= now && eventDate <= inOneWeek;
    }

    if (dateFilter === 'MONTH') {
      const inOneMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      return eventDate >= now && eventDate <= inOneMonth;
    }

    if (dateFilter === 'UPCOMING') {
      return eventDate >= now;
    }

    return true;
  });

  const handleClearFilters = () => {
    setSearch('');
    setCategory('All');
    setDateFilter('ALL');
    setLocationType('ALL');
  };

  const isFiltering = search || category !== 'All' || dateFilter !== 'ALL' || locationType !== 'ALL';

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '9999px',
              padding: '6px 16px',
              fontSize: '0.825rem',
              color: '#A5B4FC',
              fontWeight: 600,
              marginBottom: '20px'
            }}
          >
            <Compass size={15} />
            Explore Live & Upcoming Events
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '16px'
            }}
          >
            Find Your Next<br />
            <span className="gradient-text">Unforgettable Experience</span>
          </h1>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '1.1rem',
              maxWidth: '560px',
              margin: '0 auto',
              lineHeight: 1.6
            }}
          >
            Conferences, workshops, and meetups curated for curious minds, creators, and ambitious builders.
          </p>
        </div>

        {/* Search & Multi-Filter Bar */}
        <div style={{ marginBottom: '32px' }}>
          <SearchFilterBar
            onSearch={setSearch}
            onCategory={setCategory}
            onDateFilter={setDateFilter}
            onLocationType={setLocationType}
            selectedCategory={category}
            selectedDateFilter={dateFilter}
            selectedLocationType={locationType}
            searchValue={search}
          />
        </div>

        {/* Results Bar */}
        {!isLoading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              fontSize: '0.875rem',
              color: 'var(--text-dim)'
            }}
          >
            <span>
              Showing <strong style={{ color: 'var(--text-main)' }}>{filteredEvents.length}</strong> event{filteredEvents.length !== 1 ? 's' : ''}
              {category !== 'All' ? ` in ${category}` : ''}
              {dateFilter !== 'ALL' ? ` · ${dateFilter.toLowerCase()}` : ''}
              {debouncedSearch ? ` matching "${debouncedSearch}"` : ''}
            </span>

            {isFiltering && (
              <button
                type="button"
                onClick={handleClearFilters}
                style={{
                  background: 'transparent',
                  color: 'var(--brand-primary)',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Event Grid */}
        <EventGrid
          events={filteredEvents}
          onSelectEvent={onSelectEvent}
          isLoading={isLoading}
          onClearFilters={isFiltering ? handleClearFilters : null}
        />
      </div>
    </div>
  );
};
