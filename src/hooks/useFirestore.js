import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const useFirestore = (collectionName) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real-time data subscription
  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(items);
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName]);

  // Add document
  const addDocument = async (data) => {
    try {
      setError(null);
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Update document
  const updateDocument = async (id, data) => {
    try {
      setError(null);
      await updateDoc(doc(db, collectionName, id), {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Delete document
  const deleteDocument = async (id) => {
    try {
      setError(null);
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  return {
    data,
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument
  };
};

// User management specific hook
export const useUsers = () => {
  const {
    data: users,
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument
  } = useFirestore('users');

  // Create user (for admin)
  const createUser = async (userData) => {
    const userDoc = {
      email: userData.email,
      displayName: userData.name,
      role: userData.role,
      status: userData.status || 'active',
      createdAt: new Date().toISOString()
    };
    return await addDocument(userDoc);
  };

  // Update user information
  const updateUser = async (id, userData) => {
    const updateData = {
      displayName: userData.name,
      role: userData.role,
      status: userData.status
    };
    return await updateDocument(id, updateData);
  };

  // Delete user
  const deleteUser = async (id) => {
    return await deleteDocument(id);
  };

  // Return formatted user data
  const formattedUsers = users.map(user => ({
    id: user.id,
    name: user.displayName || 'Unknown User',
    email: user.email,
    role: user.role,
    status: user.status || 'active',
    createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'
  }));

  return {
    users: formattedUsers,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser
  };
};