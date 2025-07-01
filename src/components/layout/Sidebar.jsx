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
    console.log('Navigation clicked:', pageId); // 디버깅용
    setCurrentPage(pageId);
    onClose();
  };

  // 오버레이 클릭 핸들러 (사이드바 외부 클릭 시 닫기)
  const handleOverlayClick = (e) => {
    // 오버레이 자체를 클릭했을 때만 닫기 (사이드바 내부 클릭은 무시)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay - z-index 수정 및 클릭 이벤트 개선 */}
      {isOpen && !isDesktop && (
        <div 
          onClick={handleOverlayClick}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 39, // 사이드바보다 낮게 설정
            cursor: 'pointer'
          }}
        />
      )}

      {/* Sidebar - z-index 높게 설정 */}
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
        zIndex: 50, // 오버레이보다 높게 설정
        overflowY: 'auto',
        boxShadow: isOpen && !isDesktop ? 'var(--shadow-lg)' : 'none' // 모바일에서 그림자 추가
      }}>
        {/* Mobile header - 모바일에서만 표시 */}
        {!isDesktop && (
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              borderBottom: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)' // 배경색 명시
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
                console.log('Close button clicked'); // 디버깅용
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
          backgroundColor: 'var(--bg-primary)' // 배경색 명시
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
                    console.log('Menu item clicked:', item.id); // 디버깅용
                    handleNavigation(item.id);
                  }}
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
                    position: 'relative', // 클릭 영역 확보
                    zIndex: 1, // 클릭 가능하도록 z-index 설정
                    // 터치 디바이스에서 더 나은 클릭 경험을 위한 스타일
                    minHeight: '44px', // iOS 권장 최소 터치 영역
                    WebkitTapHighlightColor: 'rgba(0, 0, 0, 0.1)' // 터치 하이라이트
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
                  // 터치 이벤트도 추가 (모바일 호환성)
                  onTouchStart={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = 'var(--bg-secondary)';
                    }
                  }}
                  onTouchEnd={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon size={20} style={{ marginRight: '0.75rem', flexShrink: 0 }} />
                  <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
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
          right: '1rem',
          backgroundColor: 'var(--bg-primary)' // 배경색 명시
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