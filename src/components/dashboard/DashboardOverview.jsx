import React, { useState, useEffect, useMemo } from 'react';
import { Users, UserCheck, UserPlus, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useUsers } from '../../hooks/useFirestore';
import { useLoginLogs } from '../../hooks/useLoginLogs';

// Fully compatible date parsing for Safari (ignore timezone)
const parseDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    const normalized = String(dateString).trim();
    
    // Directly parse the YYYY-MM-DD format (completely avoid timezone issues)
    const dateMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      const year = parseInt(dateMatch[1], 10);
      const month = parseInt(dateMatch[2], 10) - 1; // starts from 0
      const day = parseInt(dateMatch[3], 10);
      
      // Create in UTC to completely avoid timezone issues
      const date = new Date(Date.UTC(year, month, day, 12, 0, 0)); // set to noon
      return date;
    }
    
    // Handle ISO format (remove timezone information)
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

// Convert date to YYYY-MM-DD format (ignore timezone)
const formatDateOnly = (date) => {
  if (!date || isNaN(date.getTime())) return null;
  
  // Format based on UTC to avoid timezone issues
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Convert date to YYYY-MM format (ignore timezone)
const formatDateToMonth = (date) => {
  if (!date || isNaN(date.getTime())) return null;
  
  // Format in UTC to avoid timezone issues
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// Calculate the date N days ago from today (based on UTC)
const getDaysAgo = (days) => {
  const now = new Date();
  // Set the current date to UTC noon
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12, 0, 0));
  const targetDate = new Date(today.getTime() - (days * 24 * 60 * 60 * 1000));
  return targetDate;
};

// Compare two dates (date only, ignore time)
const isSameOrAfter = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  // Compare dates only (ignore time)
  const d1 = new Date(Date.UTC(date1.getUTCFullYear(), date1.getUTCMonth(), date1.getUTCDate()));
  const d2 = new Date(Date.UTC(date2.getUTCFullYear(), date2.getUTCMonth(), date2.getUTCDate()));
  
  return d1.getTime() >= d2.getTime();
};

// Compare two dates (date only, ignore time)
const isSameOrBefore = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  // Compare only the dates (ignore time)
  const d1 = new Date(Date.UTC(date1.getUTCFullYear(), date1.getUTCMonth(), date1.getUTCDate()));
  const d2 = new Date(Date.UTC(date2.getUTCFullYear(), date2.getUTCMonth(), date2.getUTCDate()));
  
  return d1.getTime() <= d2.getTime();
};

// Convert month name
const getMonthName = (monthIndex) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return monthNames[monthIndex] || 'Unknown';
};

const DashboardOverview = () => {
  const { users, loading } = useUsers();
  const { loginLogs, loading: logsLoading, getRecentMonthsLogins, getTotalLogins } = useLoginLogs();
  
  const [roleDistribution, setRoleDistribution] = useState([]);
  const [monthlyActivity, setMonthlyActivity] = useState([]);

  // Current date information (based on UTC)
  const currentDate = new Date();
  const currentUTC = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate(), 12, 0, 0));
  const thirtyDaysAgo = getDaysAgo(30);

  console.log('=== Date Debug Info ===');
  console.log('Current date:', currentDate);
  console.log('Current UTC:', currentUTC);
  console.log('30 days ago:', thirtyDaysAgo);
  console.log('30 days ago formatted:', formatDateOnly(thirtyDaysAgo));

  // Calculate basic statistics (fully Safari compatible)
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
    
    // Calculate new users in the last 30 days (fully Safari compatible)
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
      
      // Check within 30 days (completely avoid timezone issues)
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

  // Calculate user growth trend (fully Safari compatible)
  const userGrowthData = useMemo(() => {
    if (!users || users.length === 0) return [];

    console.log('=== User Growth Calculation Debug ===');
    
    // Generate recent 6 months information (based on UTC)
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

    // Calculate data for each month
    const growthData = months.map((monthInfo) => {
      console.log(`\n--- Processing ${monthInfo.monthName} (${monthInfo.monthKey}) ---`);
      
      // Calculate end of month date (based on UTC)
      const monthEndDate = new Date(Date.UTC(monthInfo.year, monthInfo.month + 1, 0, 23, 59, 59)); // next month's day 0 = last day of current month
      console.log(`Month end date for ${monthInfo.monthName}:`, formatDateOnly(monthEndDate));

      let activeUsersAtMonthEnd = 0;
      let newUsersInMonth = 0;

      users.forEach((user, userIndex) => {
        if (!user.createdAt) return;

        const userDate = parseDate(user.createdAt);
        if (!userDate) return;

        // Check if user joined by this month (completely avoid timezone issues)
        const isJoinedByThisMonth = isSameOrBefore(userDate, monthEndDate);
        
        // Check active status
        const isStillActive = user.status === 'active' && 
          (!user.deletedAt || isSameOrAfter(parseDate(user.deletedAt) || new Date(), monthEndDate));

        // Count active users who joined by this month
        if (isJoinedByThisMonth && isStillActive) {
          activeUsersAtMonthEnd++;
        }

        // Count new users who joined in this month
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

  // Calculate month-over-month changes (fully Safari compatible)
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

    // Current month and previous month (based on UTC)
    const thisMonth = formatDateToMonth(currentUTC);
    const lastMonthDate = new Date(Date.UTC(currentUTC.getUTCFullYear(), currentUTC.getUTCMonth() - 1, 1, 12, 0, 0));
    const lastMonth = formatDateToMonth(lastMonthDate);

    console.log('Comparing months:', { thisMonth, lastMonth });

    // This month's data
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

    // Last month's data
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

    // Monthly statistics
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

    // Calculate change percentage function
    const calculateChange = (current, previous) => {
      if (previous === 0) {
        return current > 0 ? null : 0; // null means "NEW" indicator
      }
      return parseFloat(((current - previous) / previous * 100).toFixed(1));
    };

    // Total Users is cumulative so calculate differently
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

  // Final statistics data
  const statsWithChanges = useMemo(() => ({
    ...calculatedStats,
    ...monthOverMonthChanges
  }), [calculatedStats, monthOverMonthChanges]);

  // Calculate role distribution
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

  // Calculate monthly activity (fully Safari compatible)
  const calculatedMonthlyActivity = useMemo(() => {
    if (!users || users.length === 0 || logsLoading) return [];

    const recentMonthsLogins = getRecentMonthsLogins(6);
    
    // Calculate registrations by month (fully Safari compatible)
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

  // Update state
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