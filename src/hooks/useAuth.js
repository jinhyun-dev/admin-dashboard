// hooks/useAuth.js (수정된 버전)
import { useMemo, useCallback } from 'react';
import { useFirebaseAuth } from './useFirebaseAuth';
import { ROLES } from '../utils/permissions'; 

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

  // useMemo를 사용하여 currentUser 객체가 role 변경 시 새로 생성되도록 함
  const currentUser = useMemo(() => {
    if (!user) return null;
    
    const userObj = {
      id: user.uid,
      name: user.displayName || 'Unknown User',
      email: user.email,
      role: user.role,
      avatar: user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U',
      photoURL: user.photoURL
    };
    
    console.log('useAuth - currentUser created with role:', userObj.role);
    return userObj;
  }, [user?.uid, user?.displayName, user?.email, user?.role, user?.photoURL]);

  // updateUserRole 함수를 useCallback으로 감싸기
  const handleUpdateUserRole = useCallback(async (newRole) => {
    console.log('useAuth - updateUserRole called with:', newRole);
    await updateUserRole(user?.uid, newRole);
    console.log('useAuth - updateUserRole completed');
  }, [updateUserRole, user?.uid]);

  // 디버깅을 위한 콘솔 로그
  console.log('useAuth - currentUser:', currentUser);
  console.log('useAuth - user.role:', user?.role);

  return {
    currentUser,
    isLoading: loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    updateUserRole: handleUpdateUserRole,
    clearError
  };
};