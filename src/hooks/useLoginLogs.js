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

  // 월별 로그인 수 계산
  const getMonthlyLogins = () => {
    const monthlyData = {};
    
    loginLogs.forEach(log => {
      if (log.timestamp) {
        const date = new Date(log.timestamp);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM 형식으로 수정
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      }
    });

    console.log('Monthly logins data:', monthlyData); // 디버깅용
    return monthlyData;
  };

  // 최근 N개월 로그인 수 가져오기
  const getRecentMonthsLogins = (months = 6) => {
    const result = [];
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM 형식으로 수정
      const monthName = date.toLocaleDateString('en', { month: 'short' });
      
      const monthlyLogins = getMonthlyLogins();
      
      result.push({
        month: monthName,
        monthKey: monthKey,
        logins: monthlyLogins[monthKey] || 0
      });
    }
    
    console.log('Recent months logins:', result); // 디버깅용
    return result;
  };

  // 일별 로그인 수 계산
  const getDailyLogins = () => {
    const dailyData = {};
    
    loginLogs.forEach(log => {
      const date = log.date; // YYYY-MM-DD 형식
      dailyData[date] = (dailyData[date] || 0) + 1;
    });

    return dailyData;
  };

  // 총 로그인 수
  const getTotalLogins = () => {
    return loginLogs.length;
  };

  // 오늘 로그인 수
  const getTodayLogins = () => {
    const today = new Date().toISOString().split('T')[0];
    return loginLogs.filter(log => log.date === today).length;
  };

  // 이번 달 로그인 수
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