import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', onClick }) {
  return (
    <div 
      className={`stat-card stat-card-${color}`} 
      onClick={onClick}
      style={onClick ? { cursor: 'pointer', transition: 'transform 0.2s' } : {}}
      onMouseOver={(e) => onClick && (e.currentTarget.style.transform = 'scale(1.02)')}
      onMouseOut={(e) => onClick && (e.currentTarget.style.transform = 'scale(1)')}
    >
      <div className="stat-card-body">
        <div className="stat-card-info">
          <p className="stat-card-title">{title}</p>
          <h3 className="stat-card-value">{value}</h3>
          {subtitle && <p className="stat-card-subtitle">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`stat-card-icon-wrap icon-bg-${color}`}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
}
