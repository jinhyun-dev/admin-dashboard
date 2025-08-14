import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getOriginalRole } from './permissions';

// Sample user data
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

// Migrate initial user data to Firestore
export const migrateInitialUsers = async () => {
  try {
    console.log('Migration started: Checking sample user data');
    
    // Check if each sample user already exists and add if not
    for (const sampleUser of SAMPLE_USERS) {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const existingUser = usersSnapshot.docs.find(doc =>
        doc.data().email === sampleUser.email
      );

      if (!existingUser) {
        // Calculate Original Role (based on email)
        const originalRole = getOriginalRole(sampleUser.email);
        
        // Generate unique ID (based on email)
        const userId = sampleUser.email.replace(/[@.]/g, '_');
        
        await setDoc(doc(db, 'users', userId), {
          ...sampleUser,
          role: originalRole,
          originalRole: originalRole,
          updatedAt: new Date().toISOString()
        });
        
        console.log(`Sample user added: ${sampleUser.displayName} (${originalRole})`);
      } else {
        console.log(`Sample user already exists: ${sampleUser.displayName}`);
      }
    }
    
    console.log('Migration completed: Sample user data processed');
  } catch (error) {
    console.error('Migration failed:', error);
  }
};