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
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { currentUser, isLoading } = useAuth();

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
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'users':
        return <Users currentUserRole={currentUser?.role} />;
      default:
        return <DashboardOverview />;
    }
  };

  // 로딩 중
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
          <div style={{ color: 'var(--text-primary)' }}>Loading...</div>
        </div>
      </ThemeProvider>
    );
  }

  // 로그인하지 않은 경우
  if (!currentUser) {
    return (
      <ThemeProvider>
        <LoginPage />
      </ThemeProvider>
    );
  }

  // 기존 로그인된 사용자 UI
  return (
    <ThemeProvider>
      <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
        {renderPage()}
      </Layout>
    </ThemeProvider>
  );
}

export default App;