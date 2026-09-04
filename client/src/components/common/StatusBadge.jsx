import React from 'react';

export const StatusBadge = ({ status, isFillingFast = false, isHappeningToday = false }) => {
  if (!status && !isFillingFast && !isHappeningToday) return null;

  if (isHappeningToday) {
    return (
      <span className="badge badge-brand badge-pulse" style={{ background: 'rgba(236, 72, 153, 0.18)', borderColor: 'rgba(236, 72, 153, 0.45)', color: '#F472B6' }}>
        🔥 Happening Today
      </span>
    );
  }

  if (isFillingFast) {
    return (
      <span className="badge badge-warning badge-pulse">
        ⚡ Seats Filling Fast
      </span>
    );
  }

  const normalized = (status || '').toUpperCase();
  let badgeClass = 'badge-brand';
  let label = status;

  switch (normalized) {
    case 'PUBLISHED':
      badgeClass = 'badge-success';
      label = 'Live Event';
      break;
    case 'CONFIRMED':
    case 'ACTIVE':
      badgeClass = 'badge-success';
      label = 'Confirmed RSVP';
      break;
    case 'WAITLISTED':
      badgeClass = 'badge-warning';
      label = 'Waitlist';
      break;
    case 'FILLING FAST':
    case 'SEATS FILLING FAST':
      badgeClass = 'badge-warning badge-pulse';
      label = 'Seats Filling Fast';
      break;
    case 'CANCELLED':
      badgeClass = 'badge-danger';
      label = 'Cancelled';
      break;
    case 'FULL':
    case 'SOLD OUT':
      badgeClass = 'badge-danger';
      label = 'Sold Out';
      break;
    case 'DRAFT':
      badgeClass = 'badge-draft';
      label = 'Draft';
      break;
    case 'COMPLETED':
      badgeClass = 'badge-brand';
      label = 'Completed';
      break;
    default:
      badgeClass = 'badge-brand';
      label = status;
  }

  return <span className={`badge ${badgeClass}`}>{label}</span>;
};

