import React from 'react';
import { TrendingUp, Users, Calendar, Zap } from 'lucide-react';

export const StatMetricCard = ({ label, value, icon: Icon, color, subLabel }) => {
  return (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '18px', alignItems: 'center' }}>
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '14px',
        background: `${color}20`,
        border: `1px solid ${color}40`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>{label}</div>
        {subLabel && (
          <div style={{ fontSize: '0.775rem', color: color, marginTop: '2px', fontWeight: 600 }}>{subLabel}</div>
        )}
      </div>
    </div>
  );
};
