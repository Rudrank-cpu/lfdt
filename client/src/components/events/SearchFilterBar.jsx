import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = ['All', 'Technology', 'Workshops', 'Business', 'Healthcare', 'Design', 'Education', 'Networking'];

export const SearchFilterBar = ({ onSearch, onCategory, selectedCategory, searchValue }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <Search
          size={18}
          color="var(--text-dim)"
          style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        />
        <input
          type="text"
          className="input-field"
          placeholder="Search events by name or topic..."
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          style={{ paddingLeft: '46px', paddingRight: '16px', fontSize: '1rem' }}
        />
      </div>

      {/* Category Chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <SlidersHorizontal size={16} color="var(--text-dim)" style={{ marginTop: '6px', flexShrink: 0 }} />
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => onCategory(cat)}
            style={{
              padding: '5px 14px',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 500,
              border: selectedCategory === cat ? '1px solid var(--brand-primary)' : '1px solid var(--border-glass)',
              background: selectedCategory === cat ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.04)',
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
