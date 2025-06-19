import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { INITIAL_USERS } from './constants';

// 초기 사용자 데이터를 Firestore로 마이그레이션
export const migrateInitialUsers = async () => {
  try {
    // 이미 사용자가 있는지 확인
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    if (usersSnapshot.empty) {
      console.log('마이그레이션 시작: 초기 사용자 데이터 추가');
      
      for (const user of INITIAL_USERS) {
        await addDoc(collection(db, 'users'), {
          email: user.email,
          displayName: user.name,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt
        });
      }
      
      console.log('마이그레이션 완료: 초기 사용자 데이터 추가됨');
    } else {
      console.log('사용자 데이터가 이미 존재함 - 마이그레이션 건너뜀');
    }
  } catch (error) {
    console.error('마이그레이션 실패:', error);
  }
};