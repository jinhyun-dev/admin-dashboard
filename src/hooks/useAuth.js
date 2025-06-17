import { useState, useEffect } from 'react';
import { ROLES } from '../utils/permissions';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 현재 사용자 정보 가져오기
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse user data:', error);
        // 기본 사용자 설정
        setDefaultUser();
      }
    } else {
      // 기본 사용자 설정
      setDefaultUser();
    }
    setIsLoading(false);
  }, []);

  const setDefaultUser = () => {
    const defaultUser = {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      role: ROLES.SUPER_ADMIN,
      avatar: 'A'
    };
    setCurrentUser(defaultUser);
    localStorage.setItem('currentUser', JSON.stringify(defaultUser));
  };

  const updateUserRole = (newRole) => {
    const updatedUser = { ...currentUser, role: newRole };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('users');
  };

  return {
    currentUser,
    isLoading,
    updateUserRole,
    logout
  };
};