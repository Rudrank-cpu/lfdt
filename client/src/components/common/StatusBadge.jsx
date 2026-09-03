import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toUpperCase();
  let badgeClass = 'badge-brand';
  let label = status;

  switch (normalized) {
    case 'PUBLISHED':
    case 'CONFIRMED':
    case 'ACTIVE':
      badgeClass = 'badge-success';
      label = normalized === 'PUBLISHED' ? 'Live Event' : 'Confirmed RSVP';
      break;
    case 'WAITLISTED':
    case 'FILLING FAST':
      badgeClass = 'badge-warning';
      label = normalized === 'WAITLISTED' ? 'Waitlist' : 'Filling Fast';
      break;
    case 'CANCELLED':
    case 'FULL':
    case 'SOLD OUT':
      badgeClass = 'badge-danger';
      label = normalized === 'CANCELLED' ? 'Cancelled' : 'Sold Out';
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
