import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserPlus, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const DashboardOverview = ({ users }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    inactiveUsers: 0
  });

  const [chartData, setChartData] = useState({
    userGrowth: [],
    roleDistribution: [],
    monthlyActivity: []
  });

  useEffect(() => {
    if (users && users.length > 0) {
      calculateStats();
      generateChartData();
    }
  }, [users]);

  const calculateStats = () => {
    const total = users.length;
    const active = users.filter(user => user.status === 'active').length;
    const inactive = total - active;
    
    // 최근 30일 신규 사용자 (시뮬레이션)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsersCount = users.filter(user => {
      const createdDate = new Date(user.createdAt);
      return createdDate >= thirtyDaysAgo;
    }).length;

    setStats({
      totalUsers: total,
      activeUsers: active,
      newUsers: newUsersCount,
      inactiveUsers: inactive
    });
  };

  const generateChartData = () => {
    // 사용자 증가 추이 (최근 6개월)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const userGrowthData = months.map((month, index) => ({
      month,
      users: Math.floor(Math.random() * 50) + (index * 10) + 20,
      newUsers: Math.floor(Math.random() * 15) + 5
    }));

    // 역할별 분포
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    const roleDistributionData = Object.entries(roleCounts).map(([role, count]) => ({
      name: role,
      value: count,
      percentage: ((count / users.length) * 100).toFixed(1)
    }));

    // 월별 활동 현황
    const monthlyActivityData = [
      { month: 'Jan', logins: 245, registrations: 12 },
      { month: 'Feb', logins: 289, registrations: 18 },
      { month: 'Mar', logins: 334, registrations: 15 },
      { month: 'Apr', logins: 398, registrations: 22 },
      { month: 'May', logins: 445, registrations: 19 },
      { month: 'Jun', logins: 478, registrations: 25 }
    ];

    setChartData({
      userGrowth: userGrowthData,
      roleDistribution: roleDistributionData,
      monthlyActivity: monthlyActivityData
    });
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const KPICard = ({ title, value, change, icon: Icon, trend }) => (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      border: '1px solid var(--border-color)',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            margin: '0 0 0.5rem 0'
          }}>
            {title}
          </p>
          <p style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            {value.toLocaleString()}
          </p>
          {change && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              marginTop: '0.5rem'
            }}>
              {trend === 'up' ? (
                <TrendingUp size={16} style={{ color: 'var(--color-success)' }} />
              ) : (
                <TrendingDown size={16} style={{ color: 'var(--color-error)' }} />
              )}
              <span style={{
                fontSize: '0.875rem',
                color: trend === 'up' ? 'var(--color-success)' : 'var(--color-error)'
              }}>
                {change}%
              </span>
            </div>
          )}
        </div>
        <div style={{
          padding: '1rem',
          borderRadius: '0.5rem',
          backgroundColor: 'rgba(59, 130, 246, 0.1)'
        }}>
          <Icon size={24} style={{ color: 'var(--color-primary)' }} />
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: 'var(--text-primary)',
          margin: '0 0 0.5rem 0'
        }}>
          Dashboard Overview
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          margin: 0
        }}>
          Welcome back! Here's what's happening with your users.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <KPICard
          title="Total Users"
          value={stats.totalUsers}
          change={12.5}
          trend="up"
          icon={Users}
        />
        <KPICard
          title="Active Users"
          value={stats.activeUsers}
          change={8.2}
          trend="up"
          icon={UserCheck}
        />
        <KPICard
          title="New Users (30d)"
          value={stats.newUsers}
          change={-2.4}
          trend="down"
          icon={UserPlus}
        />
        <KPICard
          title="User Activity"
          value={478}
          change={15.3}
          trend="up"
          icon={Activity}
        />
      </div>

      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* User Growth Chart */}
        <div style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '0.5rem',
          padding: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: '0 0 1rem 0'
          }}>
            User Growth Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="newUsers" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Role Distribution */}
        <div style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '0.5rem',
          padding: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: '0 0 1rem 0'
          }}>
            User Role Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.roleDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percentage }) => `${name} ${percentage}%`}
              >
                {chartData.roleDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Activity */}
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.5rem',
        padding: '1.5rem'
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: 'var(--text-primary)',
          margin: '0 0 1rem 0'
        }}>
          Monthly Activity Overview
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData.monthlyActivity}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="logins" fill="#3B82F6" />
            <Bar dataKey="registrations" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardOverview;