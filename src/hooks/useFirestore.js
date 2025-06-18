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

  // 실시간 데이터 구독
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

  // 문서 추가
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

  // 문서 업데이트
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

  // 문서 삭제
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

// 사용자 관리 전용 훅
export const useUsers = () => {
  const {
    data: users,
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument
  } = useFirestore('users');

  // 사용자 생성 (관리자용)
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

  // 사용자 정보 업데이트
  const updateUser = async (id, userData) => {
    const updateData = {
      displayName: userData.name,
      role: userData.role,
      status: userData.status
    };
    return await updateDocument(id, updateData);
  };

  // 사용자 삭제
  const deleteUser = async (id) => {
    return await deleteDocument(id);
  };

  // 포맷된 사용자 데이터 반환
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