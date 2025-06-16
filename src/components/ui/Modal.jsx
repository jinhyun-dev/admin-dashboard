import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizes = {
    sm: '400px',
    md: '500px',
    lg: '600px',
    xl: '800px'
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      overflowY: 'auto'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '1rem',
        textAlign: 'center'
      }}>
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            transition: 'opacity 0.2s ease',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          onClick={onClose}
        />

        <div style={{
          display: 'inline-block',
          width: '100%',
          maxWidth: sizes[size],
          margin: '2rem 0',
          overflow: 'hidden',
          textAlign: 'left',
          verticalAlign: 'middle',
          transition: 'all 0.2s ease',
          backgroundColor: 'var(--bg-primary)',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: '0.5rem',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              margin: 0
            }}>
              {title}
            </h3>
            <button
              onClick={onClose}
              style={{
                padding: '0.25rem',
                borderRadius: '0.375rem',
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = 'var(--text-primary)';
                e.target.style.backgroundColor = 'var(--bg-secondary)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'var(--text-secondary)';
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <X size={20} />
            </button>
          </div>
          
          <div style={{ padding: '1.5rem' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;