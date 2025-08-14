import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const useLoginLogs = () => {
  const [loginLogs, setLoginLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'loginLogs'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const logs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLoginLogs(logs);
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Calculate monthly login count
  const getMonthlyLogins = () => {
    const monthlyData = {};
    loginLogs.forEach(log => {
      if (log.timestamp) {
        const date = new Date(log.timestamp);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // Modified to YYYY-MM format
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      }
    });

    console.log('Monthly logins data:', monthlyData); // For debugging
    return monthlyData;
  };

  // Get login count for recent N months
  const getRecentMonthsLogins = (months = 6) => {
    const result = [];
    const currentDate = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // Modified to YYYY-MM format
      const monthName = date.toLocaleDateString('en', { month: 'short' });
      
      const monthlyLogins = getMonthlyLogins();
      result.push({
        month: monthName,
        monthKey: monthKey,
        logins: monthlyLogins[monthKey] || 0
      });
    }

    console.log('Recent months logins:', result); // For debugging
    return result;
  };

  // Calculate daily login count
  const getDailyLogins = () => {
    const dailyData = {};
    loginLogs.forEach(log => {
      const date = log.date; // YYYY-MM-DD format
      dailyData[date] = (dailyData[date] || 0) + 1;
    });
    return dailyData;
  };

  // Total login count
  const getTotalLogins = () => {
    return loginLogs.length;
  };

  // Today's login count
  const getTodayLogins = () => {
    const today = new Date().toISOString().split('T')[0];
    return loginLogs.filter(log => log.date === today).length;
  };

  // This month's login count
  const getThisMonthLogins = () => {
    const thisMonth = new Date().toISOString().substr(0, 7);
    return loginLogs.filter(log => log.month === thisMonth).length;
  };

  return {
    loginLogs,
    loading,
    error,
    getMonthlyLogins,
    getRecentMonthsLogins,
    getDailyLogins,
    getTotalLogins,
    getTodayLogins,
    getThisMonthLogins
  };
};