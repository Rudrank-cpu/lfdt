import React from 'react';

export const CapacityBar = ({ maxCapacity, confirmedCount, showDetails = true }) => {
  const max = Number(maxCapacity) || 1;
  const count = Number(confirmedCount) || 0;
  const percentage = Math.min(100, Math.round((count / max) * 100));
  const remaining = Math.max(0, max - count);

  // Dynamic bar color based on fullness
  let barColor = 'var(--status-success)';
  if (percentage >= 100) {
    barColor = 'var(--status-danger)';
  } else if (percentage >= 75) {
    barColor = 'var(--status-warning)';
  }

  return (
    <div className="capacity-container">
      {showDetails && (
        <div className="capacity-labels">
          <span>
            {percentage >= 100 ? (
              <strong style={{ color: 'var(--status-danger)' }}>Sold Out</strong>
            ) : (
              <span><strong>{remaining}</strong> spots remaining</span>
            )}
          </span>
          <span>{count} / {max} filled</span>
        </div>
      )}
      <div className="capacity-track">
        <div
          className="capacity-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor
          }}
        />
      </div>
    </div>
  );
};
