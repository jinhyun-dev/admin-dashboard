import React, { useState, useEffect } from 'react';
import { BarChart3, Users, X } from 'lucide-react';
import { NAVIGATION_ITEMS } from '../../utils/constants';

const iconMap = {
  BarChart3,
  Users
};

const Sidebar = ({ currentPage, setCurrentPage, isOpen, onClose }) => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavigation = (pageId) => {
    console.log('Navigation clicked:', pageId);
    setCurrentPage(pageId);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && !isDesktop && (
        <div 
          onClick={handleOverlayClick}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 39,
            cursor: 'pointer'
          }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        top: '64px',
        left: 0,
        bottom: 0,
        width: '256px',
        backgroundColor: 'var(--bg-primary)',
        borderRight: '1px solid var(--border-color)',
        transform: (isDesktop || isOpen) ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out',
        zIndex: 50,
        overflowY: 'auto',
        boxShadow: isOpen && !isDesktop ? 'var(--shadow-lg)' : 'none'
      }}>
        {/* Mobile header */}
        {!isDesktop && (
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              borderBottom: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)'
            }}
          >
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              margin: 0
            }}>
              Menu
            </h2>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              style={{
                padding: '0.5rem',
                borderRadius: '0.375rem',
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ 
          padding: '1rem',
          backgroundColor: 'var(--bg-primary)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {NAVIGATION_ITEMS.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNavigation(item.id);
                  }}
                  className={`sidebar-nav-button ${isActive ? 'active' : ''}`}
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
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    zIndex: 1,
                    minHeight: '44px',
                    WebkitTapHighlightColor: 'transparent', // Remove touch highlight
                    outline: 'none', // Remove focus outline
                    textDecoration: 'none' // Remove text decoration
                  }}
                >
                  <Icon 
                    size={20} 
                    style={{ 
                      marginRight: '0.75rem', 
                      flexShrink: 0,
                      color: isActive ? 'white' : 'var(--text-primary)' // Explicit icon color
                    }} 
                  />
                  <span 
                    style={{ 
                      flex: 1, 
                      textAlign: 'left',
                      color: isActive ? 'white' : 'var(--text-primary)', // Explicit text color
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Version info */}
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          right: '1rem',
          backgroundColor: 'var(--bg-primary)'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '0.5rem',
            padding: '1rem'
          }}>
            <p style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.25rem',
              margin: 0
            }}>
              Version 1.0.0
            </p>
            <p style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              margin: 0
            }}>
              Built with React
            </p>
          </div>
        </div>
      </div>

      {/* Add CSS styles */}
      <style jsx>{`
        .sidebar-nav-button:hover:not(.active) {
          background-color: var(--bg-secondary) !important;
        }
        
        .sidebar-nav-button:hover:not(.active) span,
        .sidebar-nav-button:hover:not(.active) svg {
          color: var(--text-primary) !important;
        }
        
        .sidebar-nav-button.active {
          background-color: var(--color-primary) !important;
        }
        
        .sidebar-nav-button.active span,
        .sidebar-nav-button.active svg {
          color: white !important;
        }
        
        .sidebar-nav-button:focus {
          outline: none !important;
          box-shadow: none !important;
        }

        /* Additional styles for touch devices */
        @media (hover: none) {
          .sidebar-nav-button:hover {
            background-color: inherit !important;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;