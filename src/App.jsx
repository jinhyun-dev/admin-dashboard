import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import DashboardOverview from './components/dashboard/DashboardOverview';
import { useAuth } from './hooks/useAuth';
import { canAccessPage } from './utils/permissions';
import { useLocalStorage } from './hooks/useLocalStorage';
import { INITIAL_USERS } from './utils/constants';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { currentUser, isLoading } = useAuth();
  const [users] = useLocalStorage('users', INITIAL_USERS);

  const renderPage = () => {
    // 로딩 중일 때
    if (isLoading) {
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '50vh',
          color: 'var(--text-secondary)'
        }}>
          Loading...
        </div>
      );
    }

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
        return <DashboardOverview users={users} />;
      case 'users':
        return <Users currentUserRole={currentUser?.role} />;
      default:
        return <DashboardOverview users={users} />;
    }
  };

  return (
    <ThemeProvider>
      <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
        {renderPage()}
      </Layout>
    </ThemeProvider>
  );
}

export default App;