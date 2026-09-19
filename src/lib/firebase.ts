import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0164020885",
  appId: "1:816396415975:web:02269969f51a9a7d820342",
  apiKey: "AIzaSyAGIQqE3ORmmiAqNPWQW6XiMXx_cZGC0Cw",
  authDomain: "gen-lang-client-0164020885.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-remixultrafluidw-70bbea79-5f67-4526-8d70-d0e6504f5e30",
  storageBucket: "gen-lang-client-0164020885.firebasestorage.app",
  messagingSenderId: "816396415975",
  measurementId: "",
  oAuthClientId: "816396415975-dvlcqjc83s92hntg3enhpg0vhneq3b15.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

// Synchronous Instant Initialization
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export async function initFirebase(): Promise<{ app: FirebaseApp; auth: Auth; db: Firestore }> {
  return { app, auth, db };
}

export const getFirebaseAuth = async () => auth;
export const getFirebaseDb = async () => db;

