import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  onClick,
  ...props 
}) => {
  const getButtonStyles = () => {
    let baseStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '500',
      borderRadius: '0.5rem',
      transition: 'all 0.2s ease',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      textDecoration: 'none'
    };

    // Size variants
    const sizes = {
      sm: { padding: '0.375rem 0.75rem', fontSize: '0.875rem', gap: '0.25rem' },
      md: { padding: '0.5rem 1rem', fontSize: '0.875rem', gap: '0.5rem' },
      lg: { padding: '0.75rem 1.5rem', fontSize: '1rem', gap: '0.5rem' }
    };

    // Color variants
    const variants = {
      primary: {
        backgroundColor: 'var(--color-primary)',
        color: 'white'
      },
      secondary: {
        backgroundColor: 'var(--bg-tertiary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-color)'
      },
      danger: {
        backgroundColor: 'var(--color-error)',
        color: 'white'
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'var(--text-primary)'
      }
    };

    return {
      ...baseStyle,
      ...sizes[size],
      ...variants[variant]
    };
  };

  const handleMouseEnter = (e) => {
    if (disabled) return;
    
    const hoverStyles = {
      primary: { backgroundColor: 'var(--color-primary-dark)' },
      secondary: { backgroundColor: 'var(--bg-secondary)' },
      danger: { backgroundColor: '#dc2626' },
      ghost: { backgroundColor: 'var(--bg-secondary)' }
    };

    Object.assign(e.target.style, hoverStyles[variant]);
  };

  const handleMouseLeave = (e) => {
    if (disabled) return;
    
    const originalStyles = {
      primary: { backgroundColor: 'var(--color-primary)' },
      secondary: { backgroundColor: 'var(--bg-tertiary)' },
      danger: { backgroundColor: 'var(--color-error)' },
      ghost: { backgroundColor: 'transparent' }
    };

    Object.assign(e.target.style, originalStyles[variant]);
  };

  return (
    <button
      style={getButtonStyles()}
      className={className}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;