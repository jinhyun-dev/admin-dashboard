// hooks/useAuth.js (modified version)
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useFirebaseAuth } from './useFirebaseAuth';
import { ROLES, getOriginalRole, canSwitchToRole } from '../utils/permissions'; 

// useAuth hook using Firebase authentication
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

  // Current Role state (temporary role)
  const [currentRole, setCurrentRole] = useState(null);

  // Original Role calculation (fixed value based on email)
  const originalRole = useMemo(() => {
    if (!user?.email) return null;
    return getOriginalRole(user.email);
  }, [user?.email]);

  // Manage Current Role on user login/logout
  useEffect(() => {
    if (user && originalRole) {
      // On login: check saved role from localStorage
      const savedCurrentRole = localStorage.getItem(`currentRole_${user.uid}`);
      
      if (savedCurrentRole && canSwitchToRole(originalRole, savedCurrentRole)) {
        // Use saved role if valid
        console.log('useAuth - Using saved currentRole:', savedCurrentRole);
        setCurrentRole(savedCurrentRole);
      } else {
        // Use originalRole if no saved role or invalid
        console.log('useAuth - Setting currentRole to originalRole:', originalRole);
        setCurrentRole(originalRole);
        localStorage.setItem(`currentRole_${user.uid}`, originalRole);
      }
    } else if (!user) {
      // On logout: reset Current Role
      setCurrentRole(null);
      console.log('useAuth - User logged out, clearing currentRole');
    }
  }, [user?.uid, originalRole]);

  // Save to localStorage whenever currentRole changes (per user)
  useEffect(() => {
    if (currentRole && user?.uid) {
      localStorage.setItem(`currentRole_${user.uid}`, currentRole);
      console.log('useAuth - Saved currentRole to localStorage:', currentRole);
    }
  }, [currentRole, user?.uid]);

  // Create currentUser object using useMemo
  const currentUser = useMemo(() => {
    if (!user || !originalRole || !currentRole) return null;
    
    const userObj = {
      id: user.uid,
      name: user.displayName || 'Unknown User',
      email: user.email,
      originalRole: originalRole, // fixed value
      role: currentRole, // current role (temporary)
      avatar: user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U',
      photoURL: user.photoURL
    };
    
    console.log('useAuth - currentUser created:', userObj);
    return userObj;
  }, [user?.uid, user?.displayName, user?.email, user?.photoURL, originalRole, currentRole]);

  // Role switching function (temporary role change)
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

  // Firebase user role update function (actual DB update)
  const handleUpdateUserRole = useCallback(async (userId, newRole) => {
    console.log('useAuth - updateUserRole called with:', userId, newRole);
    await updateUserRole(userId, newRole);
    console.log('useAuth - updateUserRole completed');
  }, [updateUserRole]);

  // Reset currentRole on logout
  const handleLogout = useCallback(async () => {
    try {
      // Clear user-specific localStorage
      if (user?.uid) {
        localStorage.removeItem(`currentRole_${user.uid}`);
      }
      
      // Execute logout
      await logout();
      
      console.log('useAuth - Logout completed, currentRole cleared');
    } catch (error) {
      console.error('useAuth - Logout error:', error);
      throw error;
    }
  }, [logout, user?.uid]);

  // Console logs for debugging
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
    logout: handleLogout, // use modified logout function
    switchRole,
    updateUserRole: handleUpdateUserRole,
    clearError
  };
};