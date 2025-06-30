import React, { useState, useEffect, useMemo } from 'react';
import { Users, UserCheck, UserPlus, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useUsers } from '../../hooks/useFirestore';
import { useLoginLogs } from '../../hooks/useLoginLogs';

// Safari 호환 날짜 파싱 함수
const safeDateParse = (dateString) => {
  if (!dateString) return new Date();
  
  // Safari 호환 날짜 파싱
  if (typeof dateString === 'string') {
    // YYYY-MM-DD 형식을 YYYY/MM/DD로 변환 (Safari 호환)
    const safeDateString = dateString.replace(/-/g, '/');
    const date = new Date(safeDateString);
    
    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateString);
      return new Date();
    }
    
    return date;
  }
  
  return new Date(dateString);
};

const DashboardOverview = () => {
  const { users, loading } = useUsers();
  const { loginLogs, loading: logsLoading, getRecentMonthsLogins, getTotalLogins } = useLoginLogs();
  
  const [roleDistribution, setRoleDistribution] = useState([]);
  const [monthlyActivity, setMonthlyActivity] = useState([]);

  // 실제 데이터 기반 User Growth Trend 계산 (탈퇴 고려) - Safari 호환 버전
  const userGrowthData = useMemo(() => {
    if (!users || users.length === 0) return [];

    // 최근 6개월 데이터 생성
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en', { month: 'short' });
      
      months.push({ monthKey, monthName });
    }

    // 월별 실제 활성 사용자 수 계산 (Safari 호환 버전)
    const growthData = months.map((month, index) => {
      // 해당 월 말일 설정
      const monthEndDate = new Date(
        parseInt(month.monthKey.split('-')[0]), 
        parseInt(month.monthKey.split('-')[1]), 
        0
      );

      // 해당 월 말까지 가입했고, 현재 활성 상태인 사용자
      const activeUsersAtMonthEnd = users.filter(user => {
        if (!user.createdAt) return false;
        
        // Safari 호환 날짜 파싱 사용
        const userDate = safeDateParse(user.createdAt);
        const isJoinedByThisMonth = userDate <= monthEndDate;
        
        // status가 'active'이고, 탈퇴일이 없거나 해당 월 이후인 사용자
        const isStillActive = user.status === 'active' && 
          (!user.deletedAt || safeDateParse(user.deletedAt) > monthEndDate);
        
        return isJoinedByThisMonth && isStillActive;
      }).length;

      // 해당 월의 신규 가입자 수 (Safari 호환 버전)
      const newUsersInMonth = users.filter(user => {
        if (!user.createdAt) return false;
        const userDate = safeDateParse(user.createdAt);
        const userMonth = `${userDate.getFullYear()}-${String(userDate.getMonth() + 1).padStart(2, '0')}`;
        return userMonth === month.monthKey;
      }).length;

      return {
        month: month.monthName,
        users: activeUsersAtMonthEnd, // 실제 활성 사용자 수
        newUsers: newUsersInMonth
      };
    });

    console.log('Safari-compatible user growth data:', growthData);
    return growthData;
  }, [users]);

  // 통계 계산 함수들을 useMemo로 최적화 - Safari 호환 버전
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
    
    // 최근 30일 신규 사용자 (Safari 호환 버전)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsersCount = users.filter(user => {
      if (!user.createdAt) return false;
      const createdDate = safeDateParse(user.createdAt); // Safari 호환 파싱 사용
      return createdDate >= thirtyDaysAgo;
    }).length;

    // User Activity = 총 등록 수 + 총 로그인 수
    const totalLogins = getTotalLogins();
    const userActivity = total + totalLogins; // registrations + logins

    console.log('Safari-compatible stats:', {
      totalUsers: total,
      activeUsers: active,
      newUsers: newUsersCount,
      inactiveUsers: inactive,
      userActivity: userActivity
    });

    return {
      totalUsers: total,
      activeUsers: active,
      newUsers: newUsersCount,
      inactiveUsers: inactive,
      userActivity: userActivity
    };
  }, [users, getTotalLogins]);

  // 월간 대비 증감률 계산 - Safari 호환 버전
  const monthOverMonthChanges = useMemo(() => {
    if (!users || users.length === 0 || !loginLogs) {
      return {
        totalUsersChange: 0,
        activeUsersChange: 0,
        newUsersChange: 0,
        userActivityChange: 0
      };
    }

    // 현재 월과 이전 월 설정
    const currentDate = new Date();
    const thisMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const lastMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

    // 이번 달 데이터 계산 (Safari 호환 버전)
    const thisMonthUsers = users.filter(user => {
      if (!user.createdAt) return false;
      const userDate = safeDateParse(user.createdAt); // Safari 호환 파싱
      const userMonth = `${userDate.getFullYear()}-${String(userDate.getMonth() + 1).padStart(2, '0')}`;
      return userMonth === thisMonth;
    });

    const thisMonthLogins = loginLogs.filter(log => {
      if (!log.timestamp) return false;
      const logDate = safeDateParse(log.timestamp); // Safari 호환 파싱
      const logMonth = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}`;
      return logMonth === thisMonth;
    });

    // 지난 달 데이터 계산 (Safari 호환 버전)
    const lastMonthUsers = users.filter(user => {
      if (!user.createdAt) return false;
      const userDate = safeDateParse(user.createdAt); // Safari 호환 파싱
      const userMonth = `${userDate.getFullYear()}-${String(userDate.getMonth() + 1).padStart(2, '0')}`;
      return userMonth === lastMonth;
    });

    const lastMonthLogins = loginLogs.filter(log => {
      if (!log.timestamp) return false;
      const logDate = safeDateParse(log.timestamp); // Safari 호환 파싱
      const logMonth = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}`;
      return logMonth === lastMonth;
    });

    // 이번 달 지표 (월별 증감률 계산용)
    const thisMonthStats = {
      newUsers: thisMonthUsers.length, // 이번 달 신규 가입자
      activeUsers: thisMonthUsers.filter(user => user.status === 'active').length, // 이번 달 활성 가입자
      userActivity: thisMonthUsers.length + thisMonthLogins.length // 이번 달 활동량
    };

    // 지난 달 지표 (월별 증감률 계산용)
    const lastMonthStats = {
      newUsers: lastMonthUsers.length, // 지난 달 신규 가입자
      activeUsers: lastMonthUsers.filter(user => user.status === 'active').length, // 지난 달 활성 가입자
      userActivity: lastMonthUsers.length + lastMonthLogins.length // 지난 달 활동량
    };

    console.log('Safari-compatible this month stats:', thisMonthStats);
    console.log('Safari-compatible last month stats:', lastMonthStats);

    // 개선된 증감률 계산 함수
    const calculateChange = (current, previous) => {
      if (previous === 0) {
        // 지난 달이 0이고 이번 달에 데이터가 있으면 null 반환 (NEW 표시용)
        return current > 0 ? null : 0;
      }
      return parseFloat(((current - previous) / previous * 100).toFixed(1));
    };

    // Total Users는 누적이므로 월별 증감률이 아닌 전체 증가율로 계산
    const totalUsersChange = users.length > 0 ? 
      calculateChange(users.length, Math.max(users.length - thisMonthUsers.length, 1)) : 0;

    return {
      totalUsersChange: totalUsersChange,
      activeUsersChange: calculateChange(thisMonthStats.activeUsers, lastMonthStats.activeUsers),
      newUsersChange: calculateChange(thisMonthStats.newUsers, lastMonthStats.newUsers),
      userActivityChange: calculateChange(thisMonthStats.userActivity, lastMonthStats.userActivity)
    };
  }, [users, loginLogs]);

  // 최종 통계 데이터 (누적 수치 + 월간 대비 증감률)
  const statsWithChanges = useMemo(() => ({
    ...calculatedStats,
    ...monthOverMonthChanges
  }), [calculatedStats, monthOverMonthChanges]);

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

  // 월별 활동 계산 - Safari 호환 버전
  const calculatedMonthlyActivity = useMemo(() => {
    if (!users || users.length === 0 || logsLoading) return [];

    // 실제 로그인 로그 데이터 사용
    const recentMonthsLogins = getRecentMonthsLogins(6);
    
    // 사용자 생성 날짜를 기반으로 월별 등록 수 계산 (Safari 호환 버전)
    const registrationsByMonth = {};
    users.forEach(user => {
      if (user.createdAt) {
        const date = safeDateParse(user.createdAt); // Safari 호환 파싱 사용
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM 형식
        registrationsByMonth[monthKey] = (registrationsByMonth[monthKey] || 0) + 1;
      }
    });

    console.log('Safari-compatible registrations by month:', registrationsByMonth); // 디버깅용

    // 실제 데이터를 기반으로 월별 활동 데이터 생성
    const monthlyData = recentMonthsLogins.map(monthData => ({
      month: monthData.month,
      logins: monthData.logins, // 실제 로그인 로그 데이터
      registrations: registrationsByMonth[monthData.monthKey] || 0 // 실제 등록 데이터
    }));

    console.log('Safari-compatible monthly activity data:', monthlyData); // 디버깅용
    return monthlyData;
  }, [users, getRecentMonthsLogins, logsLoading]);

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
          {/* change가 null이 아니고 0이 아닐 때만 표시 */}
          {change !== undefined && change !== null && change !== 0 && (
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
          {/* 신규 데이터인 경우 "NEW" 표시 */}
          {change === null && value > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              marginTop: '0.5rem'
            }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '500',
                color: 'var(--color-primary)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                padding: '0.25rem 0.5rem',
                borderRadius: '9999px'
              }}>
                NEW
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
          trend={statsWithChanges.totalUsersChange !== null && statsWithChanges.totalUsersChange >= 0 ? 'up' : 'down'}
          icon={Users}
        />
        <KPICard
          title="Active Users"
          value={statsWithChanges.activeUsers}
          change={statsWithChanges.activeUsersChange}
          trend={statsWithChanges.activeUsersChange !== null && statsWithChanges.activeUsersChange >= 0 ? 'up' : 'down'}
          icon={UserCheck}
        />
        <KPICard
          title="New Users (30d)"
          value={statsWithChanges.newUsers}
          change={statsWithChanges.newUsersChange}
          trend={statsWithChanges.newUsersChange !== null && statsWithChanges.newUsersChange >= 0 ? 'up' : 'down'}
          icon={UserPlus}
        />
        <KPICard
          title="User Activity"
          value={statsWithChanges.userActivity}
          change={statsWithChanges.userActivityChange}
          trend={statsWithChanges.userActivityChange !== null && statsWithChanges.userActivityChange >= 0 ? 'up' : 'down'}
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