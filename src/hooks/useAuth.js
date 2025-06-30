// hooks/useAuth.js (수정된 버전)
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useFirebaseAuth } from './useFirebaseAuth';
import { ROLES, getOriginalRole, canSwitchToRole } from '../utils/permissions'; 

// Firebase 인증을 사용하는 useAuth 훅
export const useAuth = () => {
  const {
    user,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    updateUserRole,
    clearError
  } = useFirebaseAuth();

  // Current Role 상태 (임시 역할)
  const [currentRole, setCurrentRole] = useState(null);

  // Original Role 계산 (이메일 기반 고정값)
  const originalRole = useMemo(() => {
    if (!user?.email) return null;
    return getOriginalRole(user.email);
  }, [user?.email]);

  // 사용자 로그인/로그아웃 시 Current Role 관리
  useEffect(() => {
    if (user && originalRole) {
      // 로그인 시: localStorage에서 저장된 역할 확인
      const savedCurrentRole = localStorage.getItem(`currentRole_${user.uid}`);
      
      if (savedCurrentRole && canSwitchToRole(originalRole, savedCurrentRole)) {
        // 저장된 역할이 유효하면 사용
        console.log('useAuth - Using saved currentRole:', savedCurrentRole);
        setCurrentRole(savedCurrentRole);
      } else {
        // 저장된 역할이 없거나 유효하지 않으면 originalRole 사용
        console.log('useAuth - Setting currentRole to originalRole:', originalRole);
        setCurrentRole(originalRole);
        localStorage.setItem(`currentRole_${user.uid}`, originalRole);
      }
    } else if (!user) {
      // 로그아웃 시: Current Role 초기화
      setCurrentRole(null);
      console.log('useAuth - User logged out, clearing currentRole');
    }
  }, [user?.uid, originalRole]);

  // currentRole이 변경될 때마다 localStorage에 저장 (사용자별로)
  useEffect(() => {
    if (currentRole && user?.uid) {
      localStorage.setItem(`currentRole_${user.uid}`, currentRole);
      console.log('useAuth - Saved currentRole to localStorage:', currentRole);
    }
  }, [currentRole, user?.uid]);

  // useMemo를 사용하여 currentUser 객체 생성
  const currentUser = useMemo(() => {
    if (!user || !originalRole || !currentRole) return null;
    
    const userObj = {
      id: user.uid,
      name: user.displayName || 'Unknown User',
      email: user.email,
      originalRole: originalRole, // 고정값
      role: currentRole, // 현재 역할 (임시)
      avatar: user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U',
      photoURL: user.photoURL
    };
    
    console.log('useAuth - currentUser created:', userObj);
    return userObj;
  }, [user?.uid, user?.displayName, user?.email, user?.photoURL, originalRole, currentRole]);

  // 역할 전환 함수 (임시 역할 변경)
  const switchRole = useCallback((newRole) => {
    if (!originalRole) {
      console.error('useAuth - Cannot switch role: originalRole not set');
      return false;
    }

    if (!canSwitchToRole(originalRole, newRole)) {
      console.error('useAuth - Cannot switch to role:', newRole, 'from originalRole:', originalRole);
      return false;
    }

    console.log('useAuth - Switching role from', currentRole, 'to', newRole);
    setCurrentRole(newRole);
    return true;
  }, [originalRole, currentRole]);

  // Firebase 사용자 역할 업데이트 함수 (실제 DB 업데이트)
  const handleUpdateUserRole = useCallback(async (userId, newRole) => {
    console.log('useAuth - updateUserRole called with:', userId, newRole);
    await updateUserRole(userId, newRole);
    console.log('useAuth - updateUserRole completed');
  }, [updateUserRole]);

  // 로그아웃 시 currentRole 초기화
  const handleLogout = useCallback(async () => {
    try {
      // 사용자별 localStorage 클리어
      if (user?.uid) {
        localStorage.removeItem(`currentRole_${user.uid}`);
      }
      
      // 로그아웃 실행
      await logout();
      
      console.log('useAuth - Logout completed, currentRole cleared');
    } catch (error) {
      console.error('useAuth - Logout error:', error);
      throw error;
    }
  }, [logout, user?.uid]);

  // 디버깅을 위한 콘솔 로그
  console.log('useAuth - currentUser:', currentUser);
  console.log('useAuth - originalRole:', originalRole);
  console.log('useAuth - currentRole:', currentRole);

  return {
    currentUser,
    originalRole,
    currentRole,
    isLoading: loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    logout: handleLogout, // 수정된 로그아웃 함수 사용
    switchRole,
    updateUserRole: handleUpdateUserRole,
    clearError
  };
};