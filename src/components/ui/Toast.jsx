import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return { toasts, addToast, removeToast };
};

const Toast = ({ toast, onRemove }) => {
  const isSuccess = toast.type === 'success';
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem',
      backgroundColor: 'var(--bg-primary)',
      border: `1px solid ${isSuccess ? 'var(--color-success)' : 'var(--color-error)'}`,
      borderRadius: '0.5rem',
      boxShadow: 'var(--shadow-lg)',
      marginBottom: '0.5rem',
      minWidth: '300px'
    }}>
      {isSuccess ? (
        <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />
      ) : (
        <AlertCircle size={20} style={{ color: 'var(--color-error)' }} />
      )}
      
      <span style={{
        color: 'var(--text-primary)',
        fontSize: '0.875rem',
        flex: 1
      }}>
        {toast.message}
      </span>
      
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          padding: '0.25rem'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      zIndex: 1000
    }}>
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};