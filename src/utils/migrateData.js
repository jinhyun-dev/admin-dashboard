import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getOriginalRole } from './permissions';

// 샘플 사용자 데이터 (요구사항에 맞게 수정)
const SAMPLE_USERS = [
  {
    email: 'john.doe@example.com',
    displayName: 'John Doe',
    status: 'active',
    createdAt: '2024-01-15',
    provider: 'sample'
  },
  {
    email: 'jane.smith@example.com',
    displayName: 'Jane Smith',
    status: 'active',
    createdAt: '2024-01-16',
    provider: 'sample'
  },
  {
    email: 'mike.johnson@example.com',
    displayName: 'Mike Johnson',
    status: 'inactive',
    createdAt: '2024-01-17',
    provider: 'sample'
  },
  {
    email: 'sarah.wilson@example.com',
    displayName: 'Sarah Wilson',
    status: 'active',
    createdAt: '2024-01-18',
    provider: 'sample'
  },
  {
    email: 'david.brown@example.com',
    displayName: 'David Brown',
    status: 'active',
    createdAt: '2024-01-19',
    provider: 'sample'
  }
];

// 초기 사용자 데이터를 Firestore로 마이그레이션
export const migrateInitialUsers = async () => {
  try {
    console.log('마이그레이션 시작: 샘플 사용자 데이터 확인');
    
    // 각 샘플 사용자가 이미 존재하는지 확인하고 없으면 추가
    for (const sampleUser of SAMPLE_USERS) {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const existingUser = usersSnapshot.docs.find(doc => 
        doc.data().email === sampleUser.email
      );
      
      if (!existingUser) {
        // Original Role 계산 (이메일 기반)
        const originalRole = getOriginalRole(sampleUser.email);
        
        // 고유 ID 생성 (이메일 기반)
        const userId = sampleUser.email.replace(/[@.]/g, '_');
        
        await setDoc(doc(db, 'users', userId), {
          ...sampleUser,
          role: originalRole,
          originalRole: originalRole,
          updatedAt: new Date().toISOString()
        });
        
        console.log(`샘플 사용자 추가됨: ${sampleUser.displayName} (${originalRole})`);
      } else {
        console.log(`샘플 사용자 이미 존재: ${sampleUser.displayName}`);
      }
    }
    
    console.log('마이그레이션 완료: 샘플 사용자 데이터 처리됨');
  } catch (error) {
    console.error('마이그레이션 실패:', error);
  }
};