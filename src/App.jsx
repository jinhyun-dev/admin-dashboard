import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import DashboardOverview from './components/dashboard/DashboardOverview';
import LoginPage from './components/auth/LoginPage';
import { useAuth } from './hooks/useAuth';
import { canAccessPage } from './utils/permissions';
import { migrateInitialUsers } from './utils/migrateData';

function App() {
  // 로그인된 사용자만 localStorage에서 페이지 정보를 가져옴
  const [currentPage, setCurrentPage] = useState('dashboard'); // 기본값은 dashboard
  const { currentUser, isLoading } = useAuth();

  // 로그인된 사용자에 대해서만 localStorage 페이지 복원
  useEffect(() => {
    if (currentUser) {
      const savedPage = localStorage.getItem('currentPage');
      if (savedPage) {
        setCurrentPage(savedPage);
      }
    }
  }, [currentUser]);

  // 페이지가 변경될 때마다 localStorage에 저장 (로그인된 상태에서만)
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentPage', currentPage);
    }
  }, [currentPage, currentUser]);

  // 마이그레이션 실행 (한 번만)
  useEffect(() => {
    if (currentUser) {
      migrateInitialUsers();
    }
  }, [currentUser]);

  const renderPage = () => {
    // 권한 체크
    if (!canAccessPage(currentUser?.role, currentPage)) {
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          backgroundColor: 'var(--bg-secondary)',
          minHeight: '50vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h2 style={{ 
            color: 'var(--text-primary)',
            marginBottom: '1rem',
            fontSize: '1.5rem'
          }}>
            Access Denied
          </h2>
          <p style={{ 
            color: 'var(--text-secondary)',
            marginBottom: '1.5rem'
          }}>
            You don't have permission to access this page.
          </p>
          <p style={{ 
            color: 'var(--text-secondary)',
            fontSize: '0.875rem'
          }}>
            Current role: <strong>{currentUser?.role}</strong>
          </p>
          <button
            onClick={() => setCurrentPage('dashboard')}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Go to Dashboard
          </button>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'users':
        return <Users />;
      default:
        return <DashboardOverview />;
    }
  };

  // 로딩 중일 때만 로딩 화면 표시
  if (isLoading) {
    return (
      <ThemeProvider>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <div style={{ 
            textAlign: 'center',
            color: 'var(--text-primary)' 
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid var(--border-color)',
              borderTop: '4px solid var(--color-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem auto'
            }}></div>
            <p>Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // 로그인하지 않은 경우 - 항상 로그인 페이지 표시
  if (!currentUser) {
    return (
      <ThemeProvider>
        <LoginPage />
      </ThemeProvider>
    );
  }

  // 로그인된 사용자 UI
  return (
    <ThemeProvider>
      <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
        {renderPage()}
      </Layout>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </ThemeProvider>
  );
}

export default App;