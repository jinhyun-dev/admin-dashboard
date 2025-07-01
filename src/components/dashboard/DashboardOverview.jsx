import React, { useState, useEffect, useMemo } from 'react';
import { Users, UserCheck, UserPlus, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useUsers } from '../../hooks/useFirestore';
import { useLoginLogs } from '../../hooks/useLoginLogs';

// Safari 완전 호환 날짜 파싱 (시간대 무시)
const parseDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    const normalized = String(dateString).trim();
    
    // YYYY-MM-DD 형식 직접 파싱 (시간대 문제 완전 회피)
    const dateMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      const year = parseInt(dateMatch[1], 10);
      const month = parseInt(dateMatch[2], 10) - 1; // 0부터 시작
      const day = parseInt(dateMatch[3], 10);
      
      // UTC 기준으로 생성하여 시간대 문제 완전 회피
      const date = new Date(Date.UTC(year, month, day, 12, 0, 0)); // 정오로 설정
      return date;
    }
    
    // ISO 형식 처리 (시간대 정보 제거)
    if (normalized.includes('T') || normalized.includes('Z')) {
      const isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (isoMatch) {
        const year = parseInt(isoMatch[1], 10);
        const month = parseInt(isoMatch[2], 10) - 1;
        const day = parseInt(isoMatch[3], 10);
        return new Date(Date.UTC(year, month, day, 12, 0, 0));
      }
    }
    
    console.warn(`Unable to parse date: ${dateString}`);
    return null;
  } catch (error) {
    console.error(`Date parsing error for: ${dateString}`, error);
    return null;
  }
};

// 날짜를 YYYY-MM-DD 형식으로 변환 (시간대 무시)
const formatDateOnly = (date) => {
  if (!date || isNaN(date.getTime())) return null;
  
  // UTC 기준으로 형식화하여 시간대 문제 회피
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 날짜를 YYYY-MM 형식으로 변환 (시간대 무시)
const formatDateToMonth = (date) => {
  if (!date || isNaN(date.getTime())) return null;
  
  // UTC 기준으로 형식화하여 시간대 문제 회피
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// 현재 날짜 기준 N일 전 날짜 계산 (UTC 기준)
const getDaysAgo = (days) => {
  const now = new Date();
  // 현재 날짜를 UTC 정오로 설정
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12, 0, 0));
  const targetDate = new Date(today.getTime() - (days * 24 * 60 * 60 * 1000));
  return targetDate;
};

// 두 날짜를 비교 (일자만, 시간 무시)
const isSameOrAfter = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  // 날짜만 비교 (시간 무시)
  const d1 = new Date(Date.UTC(date1.getUTCFullYear(), date1.getUTCMonth(), date1.getUTCDate()));
  const d2 = new Date(Date.UTC(date2.getUTCFullYear(), date2.getUTCMonth(), date2.getUTCDate()));
  
  return d1.getTime() >= d2.getTime();
};

// 두 날짜를 비교 (일자만, 시간 무시)
const isSameOrBefore = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  // 날짜만 비교 (시간 무시)
  const d1 = new Date(Date.UTC(date1.getUTCFullYear(), date1.getUTCMonth(), date1.getUTCDate()));
  const d2 = new Date(Date.UTC(date2.getUTCFullYear(), date2.getUTCMonth(), date2.getUTCDate()));
  
  return d1.getTime() <= d2.getTime();
};

// 월 이름 변환
const getMonthName = (monthIndex) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return monthNames[monthIndex] || 'Unknown';
};

const DashboardOverview = () => {
  const { users, loading } = useUsers();
  const { loginLogs, loading: logsLoading, getRecentMonthsLogins, getTotalLogins } = useLoginLogs();
  
  const [roleDistribution, setRoleDistribution] = useState([]);
  const [monthlyActivity, setMonthlyActivity] = useState([]);

  // 현재 날짜 정보 (UTC 기준)
  const currentDate = new Date();
  const currentUTC = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate(), 12, 0, 0));
  const thirtyDaysAgo = getDaysAgo(30);

  console.log('=== Date Debug Info ===');
  console.log('Current date:', currentDate);
  console.log('Current UTC:', currentUTC);
  console.log('30 days ago:', thirtyDaysAgo);
  console.log('30 days ago formatted:', formatDateOnly(thirtyDaysAgo));

  // 기본 통계 계산 (완전 Safari 호환)
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

    console.log('=== Stats Calculation Debug ===');
    console.log('Total users array:', users.length);
    console.log('Sample user data:', users.slice(0, 3));
    console.log('30 days ago threshold:', formatDateOnly(thirtyDaysAgo));

    const total = users.length;
    const active = users.filter(user => user.status === 'active').length;
    const inactive = total - active;
    
    // 최근 30일 신규 사용자 계산 (완전 Safari 호환)
    let newUsersCount = 0;
    users.forEach((user, index) => {
      if (!user.createdAt) {
        console.log(`User ${index} has no createdAt:`, user);
        return;
      }
      
      const userDate = parseDate(user.createdAt);
      if (!userDate) {
        console.log(`User ${index} - failed to parse date:`, user.createdAt);
        return;
      }
      
      // 30일 이내 체크 (시간대 문제 완전 회피)
      const isWithin30Days = isSameOrAfter(userDate, thirtyDaysAgo);
      
      console.log(`User ${index} (${user.name || user.displayName}):`, {
        createdAt: user.createdAt,
        parsedDate: formatDateOnly(userDate),
        thirtyDaysAgo: formatDateOnly(thirtyDaysAgo),
        isWithin30Days: isWithin30Days
      });
      
      if (isWithin30Days) {
        newUsersCount++;
      }
    });

    const totalLogins = getTotalLogins();
    const userActivity = total + totalLogins;

    const result = {
      totalUsers: total,
      activeUsers: active,
      newUsers: newUsersCount,
      inactiveUsers: inactive,
      userActivity: userActivity
    };

    console.log('Final calculated stats:', result);
    return result;
  }, [users, getTotalLogins, thirtyDaysAgo]);

  // 사용자 성장 트렌드 계산 (완전 Safari 호환)
  const userGrowthData = useMemo(() => {
    if (!users || users.length === 0) return [];

    console.log('=== User Growth Calculation Debug ===');
    
    // 최근 6개월 정보 생성 (UTC 기준)
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(Date.UTC(currentUTC.getUTCFullYear(), currentUTC.getUTCMonth() - i, 1, 12, 0, 0));
      const monthKey = formatDateToMonth(targetDate);
      const monthName = getMonthName(targetDate.getUTCMonth());
      months.push({ 
        monthKey, 
        monthName, 
        year: targetDate.getUTCFullYear(), 
        month: targetDate.getUTCMonth(),
        date: targetDate
      });
    }

    console.log('Target months:', months);

    // 각 월별 데이터 계산
    const growthData = months.map((monthInfo) => {
      console.log(`\n--- Processing ${monthInfo.monthName} (${monthInfo.monthKey}) ---`);
      
      // 해당 월 말일 계산 (UTC 기준)
      const monthEndDate = new Date(Date.UTC(monthInfo.year, monthInfo.month + 1, 0, 23, 59, 59)); // 다음 달 0일 = 현재 월 마지막 날
      console.log(`Month end date for ${monthInfo.monthName}:`, formatDateOnly(monthEndDate));

      let activeUsersAtMonthEnd = 0;
      let newUsersInMonth = 0;

      users.forEach((user, userIndex) => {
        if (!user.createdAt) return;

        const userDate = parseDate(user.createdAt);
        if (!userDate) return;

        // 해당 월까지 가입한 사용자인지 확인 (시간대 문제 완전 회피)
        const isJoinedByThisMonth = isSameOrBefore(userDate, monthEndDate);
        
        // 활성 상태 확인
        const isStillActive = user.status === 'active' && 
          (!user.deletedAt || isSameOrAfter(parseDate(user.deletedAt) || new Date(), monthEndDate));

        // 해당 월까지 가입한 활성 사용자 카운트
        if (isJoinedByThisMonth && isStillActive) {
          activeUsersAtMonthEnd++;
        }

        // 해당 월에 새로 가입한 사용자 카운트
        const userMonth = formatDateToMonth(userDate);
        if (userMonth === monthInfo.monthKey) {
          newUsersInMonth++;
          console.log(`User ${userIndex} (${user.name || user.displayName}) joined in ${monthInfo.monthName}`);
        }
      });

      const monthResult = {
        month: monthInfo.monthName,
        users: activeUsersAtMonthEnd,
        newUsers: newUsersInMonth
      };

      console.log(`Result for ${monthInfo.monthName}:`, monthResult);
      return monthResult;
    });

    console.log('Complete growth data:', growthData);
    return growthData;
  }, [users, currentUTC]);

  // 월간 대비 증감률 계산 (완전 Safari 호환)
  const monthOverMonthChanges = useMemo(() => {
    if (!users || users.length === 0 || !loginLogs) {
      return {
        totalUsersChange: null,
        activeUsersChange: null,
        newUsersChange: null,
        userActivityChange: null
      };
    }

    console.log('=== Month over Month Changes Debug ===');

    // 현재 월과 이전 월 (UTC 기준)
    const thisMonth = formatDateToMonth(currentUTC);
    const lastMonthDate = new Date(Date.UTC(currentUTC.getUTCFullYear(), currentUTC.getUTCMonth() - 1, 1, 12, 0, 0));
    const lastMonth = formatDateToMonth(lastMonthDate);

    console.log('Comparing months:', { thisMonth, lastMonth });

    // 이번 달 데이터
    const thisMonthUsers = users.filter(user => {
      if (!user.createdAt) return false;
      const userDate = parseDate(user.createdAt);
      if (!userDate) return false;
      const userMonth = formatDateToMonth(userDate);
      return userMonth === thisMonth;
    });

    const thisMonthLogins = loginLogs.filter(log => {
      if (!log.timestamp) return false;
      const logDate = parseDate(log.timestamp);
      if (!logDate) return false;
      const logMonth = formatDateToMonth(logDate);
      return logMonth === thisMonth;
    });

    // 지난 달 데이터
    const lastMonthUsers = users.filter(user => {
      if (!user.createdAt) return false;
      const userDate = parseDate(user.createdAt);
      if (!userDate) return false;
      const userMonth = formatDateToMonth(userDate);
      return userMonth === lastMonth;
    });

    const lastMonthLogins = loginLogs.filter(log => {
      if (!log.timestamp) return false;
      const logDate = parseDate(log.timestamp);
      if (!logDate) return false;
      const logMonth = formatDateToMonth(logDate);
      return logMonth === lastMonth;
    });

    // 월별 통계
    const thisMonthStats = {
      newUsers: thisMonthUsers.length,
      activeUsers: thisMonthUsers.filter(user => user.status === 'active').length,
      userActivity: thisMonthUsers.length + thisMonthLogins.length
    };

    const lastMonthStats = {
      newUsers: lastMonthUsers.length,
      activeUsers: lastMonthUsers.filter(user => user.status === 'active').length,
      userActivity: lastMonthUsers.length + lastMonthLogins.length
    };

    console.log('This month stats:', thisMonthStats);
    console.log('Last month stats:', lastMonthStats);

    // 증감률 계산 함수
    const calculateChange = (current, previous) => {
      if (previous === 0) {
        return current > 0 ? null : 0; // null은 "NEW" 표시
      }
      return parseFloat(((current - previous) / previous * 100).toFixed(1));
    };

    // Total Users는 누적이므로 다른 방식으로 계산
    const totalUsersChange = users.length > 0 ? 
      calculateChange(users.length, Math.max(users.length - thisMonthUsers.length, 1)) : 0;

    const result = {
      totalUsersChange: totalUsersChange,
      activeUsersChange: calculateChange(thisMonthStats.activeUsers, lastMonthStats.activeUsers),
      newUsersChange: calculateChange(thisMonthStats.newUsers, lastMonthStats.newUsers),
      userActivityChange: calculateChange(thisMonthStats.userActivity, lastMonthStats.userActivity)
    };

    console.log('Month over month changes:', result);
    return result;
  }, [users, loginLogs, currentUTC]);

  // 최종 통계 데이터
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

  // 월별 활동 계산 (완전 Safari 호환)
  const calculatedMonthlyActivity = useMemo(() => {
    if (!users || users.length === 0 || logsLoading) return [];

    const recentMonthsLogins = getRecentMonthsLogins(6);
    
    // 월별 등록 수 계산 (완전 Safari 호환)
    const registrationsByMonth = {};
    users.forEach(user => {
      if (user.createdAt) {
        const date = parseDate(user.createdAt);
        if (date) {
          const monthKey = formatDateToMonth(date);
          if (monthKey) {
            registrationsByMonth[monthKey] = (registrationsByMonth[monthKey] || 0) + 1;
          }
        }
      }
    });

    console.log('Safari-compatible monthly registrations:', registrationsByMonth);

    const monthlyData = recentMonthsLogins.map(monthData => ({
      month: monthData.month,
      logins: monthData.logins,
      registrations: registrationsByMonth[monthData.monthKey] || 0
    }));

    console.log('Safari-compatible monthly activity data:', monthlyData);
    return monthlyData;
  }, [users, getRecentMonthsLogins, logsLoading]);

  // 상태 업데이트
  useEffect(() => {
    setRoleDistribution(calculatedRoleDistribution);
  }, [calculatedRoleDistribution]);

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

  console.log('=== Final Render Debug ===');
  console.log('Final stats with changes:', statsWithChanges);
  console.log('User growth data:', userGrowthData);
  console.log('Monthly activity:', monthlyActivity);

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