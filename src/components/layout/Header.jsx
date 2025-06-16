import React from 'react';
import { Menu, Sun, Moon, Bell, Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Header = ({ onMenuClick, sidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header style={{
      backgroundColor: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <div className="container">
        <div className="flex items-center justify-between" style={{ height: '64px' }}>
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="btn"
              style={{
                padding: '0.5rem',
                borderRadius: '0.375rem',
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent',
                display: 'none'
              }}
            >
              <Menu size={20} />
            </button>
            
            <div className="flex items-center" style={{ marginLeft: sidebarOpen ? '1rem' : '0' }}>
              <h1 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: 'var(--text-primary)'
              }}>
                Admin Dashboard
              </h1>
            </div>
          </div>

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
                  backgroundColor: 'var(--bg-secondary)'
                }}
              />
            </div>
          </div>

          <div className="flex items-center" style={{ gap: '1rem' }}>
            <button 
              className="btn"
              style={{
                padding: '0.5rem',
                borderRadius: '0.375rem',
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent',
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
              className="btn"
              style={{
                padding: '0.5rem',
                borderRadius: '0.375rem',
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent'
              }}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <div className="flex items-center" style={{ gap: '0.75rem' }}>
              <div className="text-center" style={{ display: 'none' }}>
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'var(--text-primary)'
                }}>
                  Admin User
                </p>
                <p style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)'
                }}>
                  admin@example.com
                </p>
              </div>
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

      <style jsx>{`
        @media (max-width: 1024px) {
          .btn:first-child {
            display: block !important;
          }
        }
        @media (min-width: 640px) {
          .text-center {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;