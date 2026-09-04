import React from 'react';
import { Search, SlidersHorizontal, Calendar, Globe, MapPin } from 'lucide-react';

const CATEGORIES = ['All', 'Technology', 'Workshops', 'Business', 'Healthcare', 'Design', 'Education', 'Networking'];
const DATE_FILTERS = [
  { id: 'ALL', label: 'All Dates' },
  { id: 'TODAY', label: 'Today' },
  { id: 'WEEK', label: 'This Week' },
  { id: 'MONTH', label: 'This Month' },
  { id: 'UPCOMING', label: 'Upcoming' }
];

export const SearchFilterBar = ({
  onSearch,
  onCategory,
  onDateFilter,
  onLocationType,
  selectedCategory,
  selectedDateFilter = 'ALL',
  selectedLocationType = 'ALL',
  searchValue
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Search & Filter Dropdown Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '12px' }}>
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search
            size={18}
            color="var(--text-dim)"
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            className="input-field"
            placeholder="Search events by title, description, or speaker..."
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            style={{ paddingLeft: '46px', paddingRight: '16px', fontSize: '0.95rem' }}
          />
        </div>

        {/* Date Filter Dropdown */}
        <div style={{ position: 'relative' }}>
          <select
            value={selectedDateFilter}
            onChange={(e) => onDateFilter(e.target.value)}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-main)',
              padding: '10px 14px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              height: '100%'
            }}
          >
            {DATE_FILTERS.map(df => (
              <option key={df.id} value={df.id}>{df.label}</option>
            ))}
          </select>
        </div>

        {/* Location Type Filter Dropdown */}
        <div style={{ position: 'relative' }}>
          <select
            value={selectedLocationType}
            onChange={(e) => onLocationType(e.target.value)}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-main)',
              padding: '10px 14px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              height: '100%'
            }}
          >
            <option value="ALL">All Formats</option>
            <option value="IN_PERSON">📍 In-Person</option>
            <option value="VIRTUAL">🌐 Virtual Online</option>
          </select>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <SlidersHorizontal size={15} color="var(--text-dim)" style={{ marginRight: '4px', flexShrink: 0 }} />
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 500,
              border: selectedCategory === cat
                ? '1px solid var(--brand-primary)'
                : '1px solid var(--border-glass)',
              background: selectedCategory === cat
                ? 'rgba(99, 102, 241, 0.2)'
                : 'rgba(255, 255, 255, 0.04)',
              color: selectedCategory === cat ? '#C7D2FE' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};
