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

  // 사용자 로그인/로그아웃 시 Current Role 초기화
  useEffect(() => {
    if (user && originalRole) {
      // 로그인 시 Original Role로 Current Role 설정
      setCurrentRole(originalRole);
      console.log('useAuth - User logged in, setting currentRole to originalRole:', originalRole);
    } else if (!user) {
      // 로그아웃 시 Current Role 초기화
      setCurrentRole(null);
      console.log('useAuth - User logged out, clearing currentRole');
    }
  }, [user, originalRole]);

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
    logout,
    switchRole,
    updateUserRole: handleUpdateUserRole,
    clearError
  };
};