import React, { useState, useEffect, useMemo } from 'react';
import { Users, UserCheck, UserPlus, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useUsers } from '../../hooks/useFirestore';
import { useLoginLogs } from '../../hooks/useLoginLogs';

const DashboardOverview = () => {
  const { users, loading } = useUsers();
  const { loginLogs, loading: logsLoading, getRecentMonthsLogins, getTotalLogins } = useLoginLogs();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    inactiveUsers: 0,
    userActivity: 0,
    // 변화율 계산을 위한 이전 값들
    prevTotalUsers: 0,
    prevActiveUsers: 0,
    prevNewUsers: 0,
    prevUserActivity: 0
  });

  // 고정된 User Growth Trend 데이터 (요동치는 문제 방지)
  const userGrowthData = useMemo(() => [
    { month: 'Jan', users: 42, newUsers: 8 },
    { month: 'Feb', users: 58, newUsers: 12 },
    { month: 'Mar', users: 67, newUsers: 9 },
    { month: 'Apr', users: 78, newUsers: 11 },
    { month: 'May', users: 89, newUsers: 11 },
    { month: 'Jun', users: 95, newUsers: 6 }
  ], []);

  const [roleDistribution, setRoleDistribution] = useState([]);
  const [monthlyActivity, setMonthlyActivity] = useState([]);

  // 통계 계산 함수들을 useMemo로 최적화
  const calculatedStats = useMemo(() => {
    if (!users || users.length === 0) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        inactiveUsers: 0,
        userActivity: 0
      };
    }

    const total = users.length;
    const active = users.filter(user => user.status === 'active').length;
    const inactive = total - active;
    
    // 최근 30일 신규 사용자
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsersCount = users.filter(user => {
      const createdDate = new Date(user.createdAt);
      return createdDate >= thirtyDaysAgo;
    }).length;

    // User Activity = 총 등록 수 + 총 로그인 수
    const totalLogins = getTotalLogins();
    const userActivity = total + totalLogins; // registrations + logins

    return {
      totalUsers: total,
      activeUsers: active,
      newUsers: newUsersCount,
      inactiveUsers: inactive,
      userActivity: userActivity
    };
  }, [users, getTotalLogins]);

  // 역할 분포 계산
  const calculatedRoleDistribution = useMemo(() => {
    if (!users || users.length === 0) return [];

    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(roleCounts).map(([role, count]) => ({
      name: role,
      value: count,
      percentage: ((count / users.length) * 100).toFixed(1)
    }));
  }, [users]);

  // 월별 활동 계산
  const calculatedMonthlyActivity = useMemo(() => {
    if (!users || users.length === 0 || logsLoading) return [];

    // 실제 로그인 로그 데이터 사용
    const recentMonthsLogins = getRecentMonthsLogins(6);
    
    // 사용자 생성 날짜를 기반으로 월별 등록 수 계산
    const registrationsByMonth = {};
    users.forEach(user => {
      if (user.createdAt) {
        const date = new Date(user.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM 형식
        registrationsByMonth[monthKey] = (registrationsByMonth[monthKey] || 0) + 1;
      }
    });

    console.log('Registrations by month:', registrationsByMonth); // 디버깅용

    // 실제 데이터를 기반으로 월별 활동 데이터 생성
    const monthlyData = recentMonthsLogins.map(monthData => ({
      month: monthData.month,
      logins: monthData.logins, // 실제 로그인 로그 데이터
      registrations: registrationsByMonth[monthData.monthKey] || 0 // 실제 등록 데이터
    }));

    console.log('Monthly activity data:', monthlyData); // 디버깅용
    return monthlyData;
  }, [users, getRecentMonthsLogins, logsLoading]);

  // 변화율 계산
  const statsWithChanges = useMemo(() => {
    const totalUsersChange = stats.prevTotalUsers > 0 
      ? ((calculatedStats.totalUsers - stats.prevTotalUsers) / stats.prevTotalUsers * 100).toFixed(1)
      : 0;
    
    const activeUsersChange = stats.prevActiveUsers > 0 
      ? ((calculatedStats.activeUsers - stats.prevActiveUsers) / stats.prevActiveUsers * 100).toFixed(1)
      : 0;
    
    const newUsersChange = stats.prevNewUsers > 0 
      ? ((calculatedStats.newUsers - stats.prevNewUsers) / stats.prevNewUsers * 100).toFixed(1)
      : 0;
    
    const userActivityChange = stats.prevUserActivity > 0 
      ? ((calculatedStats.userActivity - stats.prevUserActivity) / stats.prevUserActivity * 100).toFixed(1)
      : 0;

    return {
      ...calculatedStats,
      totalUsersChange: parseFloat(totalUsersChange),
      activeUsersChange: parseFloat(activeUsersChange),
      newUsersChange: parseFloat(newUsersChange),
      userActivityChange: parseFloat(userActivityChange)
    };
  }, [calculatedStats, stats]);

  // 계산된 값들을 상태에 저장 (이전 값 추적용)
  useEffect(() => {
    setStats(prev => ({
      ...statsWithChanges,
      prevTotalUsers: prev.totalUsers || calculatedStats.totalUsers,
      prevActiveUsers: prev.activeUsers || calculatedStats.activeUsers,
      prevNewUsers: prev.newUsers || calculatedStats.newUsers,
      prevUserActivity: prev.userActivity || calculatedStats.userActivity
    }));
  }, [calculatedStats.totalUsers, calculatedStats.activeUsers, calculatedStats.newUsers, calculatedStats.userActivity]);

  // 역할 분포 상태 업데이트
  useEffect(() => {
    setRoleDistribution(calculatedRoleDistribution);
  }, [calculatedRoleDistribution]);

  // 월별 활동 상태 업데이트
  useEffect(() => {
    setMonthlyActivity(calculatedMonthlyActivity);
  }, [calculatedMonthlyActivity]);

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
          {change !== undefined && change !== 0 && (
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
                {Math.abs(change)}%
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

  if (loading || logsLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50vh',
        color: 'var(--text-secondary)'
      }}>
        Loading dashboard data...
      </div>
    );
  }

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
          value={statsWithChanges.totalUsers}
          change={statsWithChanges.totalUsersChange}
          trend={statsWithChanges.totalUsersChange >= 0 ? 'up' : 'down'}
          icon={Users}
        />
        <KPICard
          title="Active Users"
          value={statsWithChanges.activeUsers}
          change={statsWithChanges.activeUsersChange}
          trend={statsWithChanges.activeUsersChange >= 0 ? 'up' : 'down'}
          icon={UserCheck}
        />
        <KPICard
          title="New Users (30d)"
          value={statsWithChanges.newUsers}
          change={statsWithChanges.newUsersChange}
          trend={statsWithChanges.newUsersChange >= 0 ? 'up' : 'down'}
          icon={UserPlus}
        />
        <KPICard
          title="User Activity"
          value={statsWithChanges.userActivity}
          change={statsWithChanges.userActivityChange}
          trend={statsWithChanges.userActivityChange >= 0 ? 'up' : 'down'}
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
            <LineChart data={userGrowthData}>
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
                data={roleDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percentage }) => `${name} ${percentage}%`}
              >
                {roleDistribution.map((entry, index) => (
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
          <BarChart data={monthlyActivity}>
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