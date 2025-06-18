// hooks/useAuth.js (수정된 버전)
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

  // 기존 인터페이스와 호환성 유지
  const currentUser = user ? {
    id: user.uid,  // 기존: id, Firebase: uid
    name: user.displayName || 'Unknown User',
    email: user.email,
    role: user.role,
    avatar: user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U',
    photoURL: user.photoURL
  } : null;

  return {
    currentUser,
    isLoading: loading,
    error, // 새로 추가된 기능
    signUp, // 새로 추가된 기능
    signIn, // 새로 추가된 기능
    signInWithGoogle, // 새로 추가된 기능
    logout, // 기존 기능과 동일한 이름
    updateUserRole: (newRole) => updateUserRole(user?.uid, newRole), // 기존 기능 유지
    clearError // 새로 추가된 기능
  };
};