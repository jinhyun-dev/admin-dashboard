import React from 'react';
import Card from '../ui/Card';

const StatsCard = ({ title, value, icon: Icon, color = 'blue', trend }) => {
  const colorClasses = {
    blue: { color: 'var(--color-primary)', backgroundColor: 'rgba(59, 130, 246, 0.1)' },
    green: { color: 'var(--color-success)', backgroundColor: 'rgba(16, 185, 129, 0.1)' },
    yellow: { color: 'var(--color-warning)', backgroundColor: 'rgba(245, 158, 11, 0.1)' },
    red: { color: 'var(--color-error)', backgroundColor: 'rgba(239, 68, 68, 0.1)' },
    purple: { color: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.1)' }
  };

  return (
    <Card style={{
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    }}>
      <Card.Content style={{ padding: '1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <p style={{
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'var(--text-secondary)',
              marginBottom: '0.25rem'
            }}>
              {title}
            </p>
            <p style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'var(--text-primary)',
              margin: 0
            }}>
              {value}
            </p>
            {trend && (
              <p style={{
                fontSize: '0.875rem',
                marginTop: '0.25rem',
                color: trend.type === 'increase' 
                  ? 'var(--color-success)' 
                  : 'var(--color-error)',
                margin: '0.25rem 0 0 0'
              }}>
                {trend.type === 'increase' ? '↗' : '↘'} {trend.value}
              </p>
            )}
          </div>
          <div style={{
            padding: '0.75rem',
            borderRadius: '50%',
            ...colorClasses[color]
          }}>
            <Icon size={24} />
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};

export default StatsCard;