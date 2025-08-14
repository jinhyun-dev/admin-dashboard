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
  // Get page information from localStorage only for logged-in users
  const [currentPage, setCurrentPage] = useState('dashboard'); // Default is dashboard
  const { currentUser, isLoading } = useAuth();

  // Restore localStorage page only for logged-in users
  useEffect(() => {
    if (currentUser) {
      const savedPage = localStorage.getItem('currentPage');
      if (savedPage) {
        setCurrentPage(savedPage);
      }
    }
  }, [currentUser]);

  // Save to localStorage whenever page changes (only when logged in)
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentPage', currentPage);
    }
  }, [currentPage, currentUser]);

  // Run migration (only once)
  useEffect(() => {
    if (currentUser) {
      migrateInitialUsers();
    }
  }, [currentUser]);

  const renderPage = () => {
    // Permission check
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

  // Show loading screen only while loading
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

  // If not logged in - always show login page
  if (!currentUser) {
    return (
      <ThemeProvider>
        <LoginPage />
      </ThemeProvider>
    );
  }

  // Logged-in user UI
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