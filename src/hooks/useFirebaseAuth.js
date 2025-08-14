import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, addDoc, collection } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';
import { getOriginalRole } from '../utils/permissions';

export const useFirebaseAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to add login log
  const addLoginLog = async (userId, loginMethod = 'email') => {
    try {
      await addDoc(collection(db, 'loginLogs'), {
        userId: userId,
        loginMethod: loginMethod, // 'email', 'google', etc.
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        month: new Date().toISOString().substr(0, 7), // YYYY-MM format
      });
      console.log('Login log added successfully');
    } catch (error) {
      console.error('Error adding login log:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Calculate Original Role (based on email)
        const originalRole = getOriginalRole(firebaseUser.email);
        
        // Get additional user information from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        
        const enrichedUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          originalRole: originalRole, // Email-based Original Role
          role: originalRole, // Initially same as Original Role
          ...userData
        };
        
        console.log('useFirebaseAuth - Setting user:', enrichedUser);
        setUser(enrichedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Email/password sign up
  const signUp = async (email, password, displayName) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile
      await updateProfile(result.user, { displayName });
      
      // Calculate Original Role (based on email)
      const originalRole = getOriginalRole(email);
      
      // Save user information to Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        email,
        displayName,
        role: originalRole, // Set as Original Role
        originalRole: originalRole, // Store Original Role
        createdAt: new Date().toISOString(),
        status: 'active'
      });
      
      // Add login log after automatic login post-signup
      await addLoginLog(result.user.uid, 'email');
      
      return result.user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Email/password sign in
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Add login log
      await addLoginLog(result.user.uid, 'email');
      
      return result.user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Google sign in
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await signInWithPopup(auth, googleProvider);
      
      // Calculate Original Role (based on email)
      const originalRole = getOriginalRole(result.user.email);
      
      // Save information to Firestore if first time login
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          role: originalRole, // Set as Original Role
          originalRole: originalRole, // Store Original Role
          createdAt: new Date().toISOString(),
          status: 'active',
          provider: 'google'
        });
      }
      
      // Add login log
      await addLoginLog(result.user.uid, 'google');
      
      return result.user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout
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

  // Update user role (admin only) - modified version
  const updateUserRole = async (userId, newRole) => {
    try {
      setError(null);
      console.log('updateUserRole called:', { userId, newRole, currentUserId: user?.uid });
      
      // Update Firestore
      await setDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      console.log('Firestore updated successfully');
      
      // Immediately update state if current user's role was updated
      if (userId === user?.uid) {
        console.log('Updating current user role from', user.role, 'to', newRole);
        setUser(prev => ({ 
          ...prev, 
          role: newRole,
          updatedAt: new Date().toISOString()
        }));
        console.log('User state updated');
      }
    } catch (error) {
      console.error('updateUserRole error:', error);
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