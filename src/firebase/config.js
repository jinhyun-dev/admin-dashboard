import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDSz39TNFlL3kzRCthriAMWV_e4IuLh5EA",
  authDomain: "admin-dashboard-fa4e2.firebaseapp.com",
  projectId: "admin-dashboard-fa4e2",
  storageBucket: "admin-dashboard-fa4e2.firebasestorage.app",
  messagingSenderId: "1052103704005",
  appId: "1:1052103704005:web:9bb9024b0b7b1b7cb41fac"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth Instance
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Firestore Instance
export const db = getFirestore(app);

export default app;