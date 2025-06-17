import React, { useState, useEffect } from 'react';
import { Menu, Sun, Moon, Bell, Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Header = ({ onMenuClick, sidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      setIsSmallScreen(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header style={{
      backgroundColor: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      height: '64px'
    }}>
      <div className="container">
        <div className="flex items-center justify-between" style={{ height: '64px' }}>
          <div className="flex items-center">
            {/* 모바일에서만 햄버거 메뉴 표시 */}
            {isMobile && (
              <button
                onClick={onMenuClick}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  marginRight: '1rem'
                }}
              >
                <Menu size={20} />
              </button>
            )}
            
            <div className="flex items-center">
              <h1 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: 'var(--text-primary)',
                margin: 0
              }}>
                Admin Dashboard
              </h1>
            </div>
          </div>

          {/* 작은 화면에서는 검색창 숨김 */}
          {!isSmallScreen && (
            <div className="flex items-center" style={{ gap: '1rem', flex: 1, maxWidth: '400px', margin: '0 2rem' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search 
                  size={20} 
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)'
                  }}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  className="form-input"
                  style={{
                    paddingLeft: '2.5rem',
                    backgroundColor: 'var(--bg-secondary)',
                    width: '100%'
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center" style={{ gap: '1rem' }}>
            <button 
              style={{
                padding: '0.5rem',
                borderRadius: '0.375rem',
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <Bell size={20} />
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: 'var(--color-error)',
                color: 'white',
                fontSize: '0.75rem',
                borderRadius: '50%',
                height: '20px',
                width: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                3
              </span>
            </button>

            <button
              onClick={toggleTheme}
              style={{
                padding: '0.5rem',
                borderRadius: '0.375rem',
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <div className="flex items-center" style={{ gap: '0.75rem' }}>
              <div style={{
                height: '32px',
                width: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'white'
                }}>
                  A
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;