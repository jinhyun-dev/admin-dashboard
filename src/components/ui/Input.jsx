import React from 'react';

const Input = ({ 
  label, 
  error, 
  className = '', 
  type = 'text',
  required = false,
  ...props 
}) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <label 
          className="form-label"
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: 'var(--text-primary)'
          }}
        >
          {label}
          {required && (
            <span style={{ color: 'var(--color-error)', marginLeft: '0.25rem' }}>*</span>
          )}
        </label>
      )}
      <input
        type={type}
        className={`form-input ${className}`}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          border: `1px solid ${error ? 'var(--color-error)' : 'var(--border-color)'}`,
          borderRadius: '0.5rem',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          fontSize: '0.875rem',
          transition: 'border-color 0.2s ease',
          outline: 'none'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = error ? 'var(--color-error)' : 'var(--color-primary)';
          e.target.style.boxShadow = error 
            ? '0 0 0 3px rgba(239, 68, 68, 0.1)' 
            : '0 0 0 3px rgba(59, 130, 246, 0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? 'var(--color-error)' : 'var(--border-color)';
          e.target.style.boxShadow = 'none';
        }}
        {...props}
      />
      {error && (
        <p style={{
          marginTop: '0.25rem',
          fontSize: '0.875rem',
          color: 'var(--color-error)'
        }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;