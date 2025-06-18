import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';
import { ROLES } from '../utils/permissions';

export const useFirebaseAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Firestore에서 사용자 추가 정보 가져오기
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: userData.role || ROLES.USER, // 기본 역할
          ...userData
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 이메일/비밀번호 회원가입
  const signUp = async (email, password, displayName, role = ROLES.USER) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // 프로필 업데이트
      await updateProfile(result.user, { displayName });
      
      // Firestore에 사용자 정보 저장
      await setDoc(doc(db, 'users', result.user.uid), {
        email,
        displayName,
        role,
        createdAt: new Date().toISOString(),
        status: 'active'
      });
      
      return result.user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 이메일/비밀번호 로그인
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Google 로그인
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await signInWithPopup(auth, googleProvider);
      
      // 처음 로그인하는 사용자라면 Firestore에 정보 저장
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          role: ROLES.USER, // 기본 역할
          createdAt: new Date().toISOString(),
          status: 'active',
          provider: 'google'
        });
      }
      
      return result.user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 사용자 역할 업데이트 (관리자 전용)
  const updateUserRole = async (userId, newRole) => {
    try {
      setError(null);
      
      await setDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      // 현재 사용자의 역할이 업데이트되었다면 상태 갱신
      if (userId === user?.uid) {
        setUser(prev => ({ ...prev, role: newRole }));
      }
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    updateUserRole,
    clearError: () => setError(null)
  };
};