import React from 'react';
import { BarChart3, Users, X } from 'lucide-react';
import { NAVIGATION_ITEMS } from '../../utils/constants';

const iconMap = {
  BarChart3,
  Users
};

const Sidebar = ({ currentPage, setCurrentPage, isOpen, onClose }) => {
  const handleNavigation = (pageId) => {
    setCurrentPage(pageId);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40
          }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        insetY: 0,
        left: 0,
        zIndex: 50,
        width: '256px',
        backgroundColor: 'var(--bg-primary)',
        borderRight: '1px solid var(--border-color)',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out'
      }}>
        <div 
          className="flex items-center justify-between p-4"
          style={{
            borderBottom: '1px solid var(--border-color)',
            display: 'none'
          }}
        >
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: 'var(--text-primary)'
          }}>
            Menu
          </h2>
          <button
            onClick={onClose}
            className="btn"
            style={{
              padding: '0.5rem',
              borderRadius: '0.375rem',
              color: 'var(--text-secondary)',
              backgroundColor: 'transparent'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <nav style={{ marginTop: '2rem', padding: '0 1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {NAVIGATION_ITEMS.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className="btn"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    borderRadius: '0.5rem',
                    justifyContent: 'flex-start',
                    backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                    color: isActive ? 'white' : 'var(--text-primary)',
                    border: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = 'var(--bg-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon size={20} style={{ marginRight: '0.75rem' }} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        <div style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          right: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '0.5rem',
            padding: '1rem'
          }}>
            <p style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.5rem'
            }}>
              Version 1.0.0
            </p>
            <p style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)'
            }}>
              Built with React
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .flex:first-child {
            display: flex !important;
          }
        }
        @media (min-width: 1024px) {
          div[style*="position: fixed"] {
            position: static !important;
            transform: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;