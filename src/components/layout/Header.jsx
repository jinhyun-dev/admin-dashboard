import React, { useState, useEffect } from 'react';
import { Menu, Sun, Moon, Bell, Search, User, Settings, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Header = ({ onMenuClick, sidebarOpen, onSearch, currentPage, setCurrentPage }) => {
  const { theme, toggleTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);
  const [searchValue, setSearchValue] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // 사용자 프로필 데이터
  const [userProfile, setUserProfile] = useState({
    name: 'Admin User',
    email: 'admin@example.com',
    avatar: 'A',
    role: 'Administrator',
    joinDate: '2024-01-01',
    lastLogin: new Date().toLocaleString()
  });

  // 설정 데이터 (Language 제거)
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    darkMode: theme === 'dark'
  });

  // 알림 데이터
  const notifications = [
    { id: 1, title: 'New user registered', message: 'Jane Smith joined the platform', time: '2 minutes ago', unread: true },
    { id: 2, title: 'System update', message: 'Server maintenance completed', time: '1 hour ago', unread: true },
    { id: 3, title: 'Weekly report', message: 'Analytics report is ready', time: '2 hours ago', unread: false }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      setIsSmallScreen(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
      if (!event.target.closest('.user-menu-dropdown')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      // Users 페이지로 이동
      if (currentPage !== 'users') {
        setCurrentPage('users');
      }
      
      // 검색 이벤트 발생 (약간의 지연을 두어 페이지 전환 후 검색 실행)
      setTimeout(() => {
        const searchEvent = new CustomEvent('globalSearch', {
          detail: { searchTerm: searchValue.trim() }
        });
        window.dispatchEvent(searchEvent);
      }, 100);
    }
  };

  // 실시간 검색 (입력할 때마다)
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    
    // Users 페이지에서만 실시간 검색 적용
    if (currentPage === 'users' && value.length > 0) {
      const searchEvent = new CustomEvent('globalSearch', {
        detail: { searchTerm: value }
      });
      window.dispatchEvent(searchEvent);
    } else if (value.length === 0) {
      // 검색어가 비어있으면 검색 초기화
      const searchEvent = new CustomEvent('globalSearch', {
        detail: { searchTerm: '' }
      });
      window.dispatchEvent(searchEvent);
    }
  };

  const handleNotificationClick = (notificationId) => {
    console.log('Notification clicked:', notificationId);
    setShowNotifications(false);
  };

  const handleUserMenuAction = (action) => {
    setShowUserMenu(false);
    
    switch (action) {
      case 'profile':
        setShowProfileModal(true);
        break;
      case 'settings':
        setShowSettingsModal(true);
        break;
      case 'logout':
        if (window.confirm('Are you sure you want to sign out?')) {
          // 로그아웃 로직
          localStorage.removeItem('users');
          window.location.reload();
        }
        break;
      default:
        break;
    }
  };

  const handleProfileSave = (updatedProfile) => {
    setUserProfile(updatedProfile);
    setShowProfileModal(false);
    alert('Profile updated successfully!');
  };

  const handleSettingsSave = (updatedSettings) => {
    setSettings(updatedSettings);
    
    // 다크모드 설정 변경 시 테마 업데이트
    if (updatedSettings.darkMode !== (theme === 'dark')) {
      toggleTheme();
    }
    
    setShowSettingsModal(false);
    alert('Settings saved successfully!');
  };

  return (
    <>
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
                <button
                    onClick={() => setCurrentPage('dashboard')}
                    style={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        color: 'var(--text-primary)',
                        margin: 0,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '0.375rem',
                        transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'var(--bg-secondary)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                    }}
                >
                    Admin Dashboard
                </button>
              </div>
            </div>

            {!isSmallScreen && (
              <div className="flex items-center" style={{ gap: '1rem', flex: 1, maxWidth: '400px', margin: '0 2rem' }}>
                <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%' }}>
                  <Search 
                    size={20} 
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-secondary)',
                      pointerEvents: 'none'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchValue}
                    onChange={handleSearchChange}
                    className="form-input"
                    style={{
                      paddingLeft: '2.5rem',
                      backgroundColor: 'var(--bg-secondary)',
                      width: '100%'
                    }}
                  />
                  {searchValue && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchValue('');
                        const searchEvent = new CustomEvent('globalSearch', {
                          detail: { searchTerm: '' }
                        });
                        window.dispatchEvent(searchEvent);
                      }}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '1.25rem',
                        lineHeight: 1
                      }}
                    >
                      ×
                    </button>
                  )}
                </form>
              </div>
            )}

            <div className="flex items-center" style={{ gap: '1rem' }}>
              {/* 알림 버튼 */}
              <div className="notification-dropdown" style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    color: 'var(--text-secondary)',
                    backgroundColor: showNotifications ? 'var(--bg-secondary)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
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
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    width: '320px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 50
                  }}>
                    <div style={{
                      padding: '1rem',
                      borderBottom: '1px solid var(--border-color)'
                    }}>
                      <h3 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        margin: 0
                      }}>
                        Notifications
                      </h3>
                    </div>
                    
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification.id)}
                          style={{
                            padding: '1rem',
                            borderBottom: '1px solid var(--border-color)',
                            cursor: 'pointer',
                            backgroundColor: notification.unread ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'var(--bg-secondary)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = notification.unread ? 'rgba(59, 130, 246, 0.05)' : 'transparent';
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '0.25rem'
                          }}>
                            <h4 style={{
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              color: 'var(--text-primary)',
                              margin: 0
                            }}>
                              {notification.title}
                            </h4>
                            {notification.unread && (
                              <div style={{
                                width: '8px',
                                height: '8px',
                                backgroundColor: 'var(--color-primary)',
                                borderRadius: '50%'
                              }} />
                            )}
                          </div>
                          <p style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                            margin: '0 0 0.25rem 0'
                          }}>
                            {notification.message}
                          </p>
                          <span style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)'
                          }}>
                            {notification.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

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

              {/* 사용자 메뉴 */}
              <div className="user-menu-dropdown" style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.25rem',
                    borderRadius: '0.5rem',
                    backgroundColor: showUserMenu ? 'var(--bg-secondary)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
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
                      {userProfile.avatar}
                    </span>
                  </div>
                  
                  {!isSmallScreen && (
                    <div style={{ textAlign: 'left' }}>
                      <p style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'var(--text-primary)',
                        margin: 0
                      }}>
                        {userProfile.name}
                      </p>
                      <p style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        margin: 0
                      }}>
                        {userProfile.email}
                      </p>
                    </div>
                  )}
                </button>

                {showUserMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    width: '200px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 50
                  }}>
                    <div style={{
                      padding: '1rem',
                      borderBottom: '1px solid var(--border-color)'
                    }}>
                      <p style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'var(--text-primary)',
                        margin: 0
                      }}>
                        {userProfile.name}
                      </p>
                      <p style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        margin: 0
                      }}>
                        {userProfile.email}
                      </p>
                    </div>
                    
                    <div style={{ padding: '0.5rem' }}>
                      <button
                        onClick={() => handleUserMenuAction('profile')}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-primary)',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'var(--bg-secondary)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        <User size={16} />
                        My Profile
                      </button>
                      
                      <button
                        onClick={() => handleUserMenuAction('settings')}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-primary)',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'var(--bg-secondary)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Settings size={16} />
                        Settings
                      </button>
                    </div>
                    
                    <div style={{
                      padding: '0.5rem',
                      borderTop: '1px solid var(--border-color)'
                    }}>
                      <button
                        onClick={() => handleUserMenuAction('logout')}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem',
                          fontSize: '0.875rem',
                          color: 'var(--color-error)',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'var(--bg-secondary)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
{/* Profile Modal */}
      {showProfileModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          overflow: 'auto',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '0.5rem',
            boxShadow: 'var(--shadow-lg)',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                margin: 0
              }}>
                My Profile
              </h2>
              <button
                onClick={() => setShowProfileModal(false)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                ✕
              </button>
            </div>
            
            <ProfileForm 
              profile={userProfile}
              onSave={handleProfileSave}
              onCancel={() => setShowProfileModal(false)}
            />
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          overflow: 'auto',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '0.5rem',
            boxShadow: 'var(--shadow-lg)',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                margin: 0
              }}>
                Settings
              </h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                ✕
              </button>
            </div>
            
            <SettingsForm 
              settings={settings}
              onSave={handleSettingsSave}
              onCancel={() => setShowSettingsModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

// Profile Form Component
const ProfileForm = ({ profile, onSave, onCancel }) => {
  const [formData, setFormData] = useState(profile);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: 'var(--text-primary)'
          }}>
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--border-color)',
              borderRadius: '0.375rem',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: 'var(--text-primary)'
          }}>
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--border-color)',
              borderRadius: '0.375rem',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: 'var(--text-primary)'
          }}>
            Role
          </label>
          <input
            type="text"
            value={formData.role}
            readOnly
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--border-color)',
              borderRadius: '0.375rem',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              cursor: 'not-allowed'
            }}
          />
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem',
        marginTop: '2rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-color)'
      }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

// Settings Form Component (Language 기능 제거)
const SettingsForm = ({ settings, onSave, onCancel }) => {
  const [formData, setFormData] = useState(settings);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '500',
            color: 'var(--text-primary)',
            marginBottom: '1rem'
          }}>
            Preferences
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={formData.notifications}
                onChange={(e) => setFormData({...formData, notifications: e.target.checked})}
              />
              <span style={{ color: 'var(--text-primary)' }}>Enable notifications</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={formData.emailAlerts}
                onChange={(e) => setFormData({...formData, emailAlerts: e.target.checked})}
              />
              <span style={{ color: 'var(--text-primary)' }}>Email alerts</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={formData.darkMode}
                onChange={(e) => setFormData({...formData, darkMode: e.target.checked})}
              />
              <span style={{ color: 'var(--text-primary)' }}>Dark mode</span>
            </label>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem',
        marginTop: '2rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-color)'
      }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Save Settings
        </button>
      </div>
    </form>
  );
};

export default Header;