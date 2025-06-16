import React from 'react';
import { Users, UserCheck, UserX, Activity } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import Card from '../components/ui/Card';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { INITIAL_USERS } from '../utils/constants';

const Dashboard = () => {
  const [users] = useLocalStorage('users', INITIAL_USERS);

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(user => user.status === 'active').length,
    inactiveUsers: users.filter(user => user.status === 'inactive').length,
    adminUsers: users.filter(user => user.role === 'Admin').length
  };

  const recentActivity = [
    { id: 1, action: 'User John Doe logged in', time: '2 minutes ago', type: 'login' },
    { id: 2, action: 'New user Jane Smith registered', time: '1 hour ago', type: 'register' },
    { id: 3, action: 'User Mike Johnson updated profile', time: '3 hours ago', type: 'update' },
    { id: 4, action: 'Admin Sarah Wilson created new role', time: '5 hours ago', type: 'admin' },
    { id: 5, action: 'System backup completed', time: '1 day ago', type: 'system' }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'login': return '🔐';
      case 'register': return '👤';
      case 'update': return '✏️';
      case 'admin': return '⚙️';
      case 'system': return '💾';
      default: return '📝';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: 'var(--text-primary)',
          marginBottom: '0.5rem'
        }}>
          Dashboard
        </h1>
        <p style={{
          color: 'var(--text-secondary)'
        }}>
          Welcome back! Here's what's happening with your application today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid" style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem'
      }}>
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="blue"
          trend={{ type: 'increase', value: '+12%' }}
        />
        <StatsCard
          title="Active Users"
          value={stats.activeUsers}
          icon={UserCheck}
          color="green"
          trend={{ type: 'increase', value: '+8%' }}
        />
        <StatsCard
          title="Inactive Users"
          value={stats.inactiveUsers}
          icon={UserX}
          color="yellow"
          trend={{ type: 'decrease', value: '-3%' }}
        />
        <StatsCard
          title="Admin Users"
          value={stats.adminUsers}
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Recent Activity and Quick Stats */}
      <div className="grid" style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem'
      }}>
        <Card>
          <Card.Header>
            <Card.Title>Recent Activity</Card.Title>
          </Card.Header>
          <Card.Content>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentActivity.map((activity) => (
                <div key={activity.id} style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '0.75rem' 
                }}>
                  <span style={{ fontSize: '1.125rem' }}>{getActivityIcon(activity.type)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      margin: 0
                    }}>
                      {activity.action}
                    </p>
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      margin: 0
                    }}>
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>User Distribution</Card.Title>
          </Card.Header>
          <Card.Content>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'var(--text-secondary)'
                }}>
                  Admin
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '96px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '9999px',
                    height: '8px'
                  }}>
                    <div 
                      style={{
                        backgroundColor: '#8b5cf6',
                        height: '8px',
                        borderRadius: '9999px',
                        width: `${(stats.adminUsers / stats.totalUsers) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-primary)'
                  }}>
                    {stats.adminUsers}
                  </span>
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'var(--text-secondary)'
                }}>
                  Moderator
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '96px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '9999px',
                    height: '8px'
                  }}>
                    <div 
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        height: '8px',
                        borderRadius: '9999px',
                        width: `${(users.filter(u => u.role === 'Moderator').length / stats.totalUsers) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-primary)'
                  }}>
                    {users.filter(u => u.role === 'Moderator').length}
                  </span>
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'var(--text-secondary)'
                }}>
                  User
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '96px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '9999px',
                    height: '8px'
                  }}>
                    <div 
                      style={{
                        backgroundColor: 'var(--color-success)',
                        height: '8px',
                        borderRadius: '9999px',
                        width: `${(users.filter(u => u.role === 'User').length / stats.totalUsers) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-primary)'
                  }}>
                    {users.filter(u => u.role === 'User').length}
                  </span>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <Card.Header>
          <Card.Title>Quick Actions</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid" style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              padding: '1rem',
              border: '1px solid var(--border-color)',
              borderRadius: '0.5rem',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--bg-secondary)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  padding: '0.5rem',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '0.5rem'
                }}>
                  <Users size={20} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <h3 style={{
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    margin: 0
                  }}>
                    Manage Users
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0
                  }}>
                    Add, edit, or remove users
                  </p>
                </div>
              </div>
            </div>
            
            <div style={{
              padding: '1rem',
              border: '1px solid var(--border-color)',
              borderRadius: '0.5rem',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--bg-secondary)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  padding: '0.5rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '0.5rem'
                }}>
                  <Activity size={20} style={{ color: 'var(--color-success)' }} />
                </div>
                <div>
                  <h3 style={{
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    margin: 0
                  }}>
                    View Reports
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0
                  }}>
                    Check system analytics
                  </p>
                </div>
              </div>
            </div>
            
            <div style={{
              padding: '1rem',
              border: '1px solid var(--border-color)',
              borderRadius: '0.5rem',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--bg-secondary)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  padding: '0.5rem',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  borderRadius: '0.5rem'
                }}>
                  <UserCheck size={20} style={{ color: '#8b5cf6' }} />
                </div>
                <div>
                  <h3 style={{
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    margin: 0
                  }}>
                    User Permissions
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0
                  }}>
                    Configure access levels
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default Dashboard;