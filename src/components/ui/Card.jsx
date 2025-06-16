import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`card ${className}`}
      style={{
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.5rem',
        boxShadow: 'var(--shadow)',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={(e) => {
        e.target.style.boxShadow = 'var(--shadow)';
      }}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => {
  return (
    <div 
      className={className}
      style={{
        padding: '1.5rem 1.5rem 1rem 1.5rem',
        borderBottom: '1px solid var(--border-color)'
      }}
    >
      {children}
    </div>
  );
};

const CardContent = ({ children, className = '' }) => {
  return (
    <div 
      className={className}
      style={{
        padding: '1.5rem'
      }}
    >
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = '' }) => {
  return (
    <h3 
      className={className}
      style={{
        fontSize: '1.125rem',
        fontWeight: '600',
        color: 'var(--text-primary)',
        margin: 0
      }}
    >
      {children}
    </h3>
  );
};

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Title = CardTitle;

export default Card;