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
    setCurrentPage(pageId);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && !isDesktop && (
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
        top: '64px', // 헤더 높이만큼 아래에서 시작
        left: 0,
        bottom: 0,
        width: '256px',
        backgroundColor: 'var(--bg-primary)',
        borderRight: '1px solid var(--border-color)',
        transform: (isDesktop || isOpen) ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out',
        zIndex: 30,
        overflowY: 'auto'
      }}>
        {/* Mobile header - 모바일에서만 표시 */}
        {!isDesktop && (
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              borderBottom: '1px solid var(--border-color)'
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
              onClick={onClose}
              style={{
                padding: '0.5rem',
                borderRadius: '0.375rem',
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {NAVIGATION_ITEMS.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
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

        {/* Version info - 하단 고정 */}
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
    </>
  );
};

export default Sidebar;