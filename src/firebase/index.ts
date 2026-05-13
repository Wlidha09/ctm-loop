
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigValid } from './config';

export function initializeFirebase(): {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  googleProvider: GoogleAuthProvider | null;
} {
  // Debug Log for Vercel environment verification
  if (typeof window !== 'undefined') {
    console.log("Firebase Config Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  }

  if (typeof window === 'undefined' || !isFirebaseConfigValid) {
    return { firebaseApp: null, firestore: null, auth: null, googleProvider: null };
  }

  const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  
  let firestore: Firestore;
  try {
    // Enable persistent local cache for robust offline support (modern replacement for enableIndexedDbPersistence)
    firestore = initializeFirestore(firebaseApp, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });
  } catch (e) {
    firestore = getFirestore(firebaseApp);
  }

  const auth = getAuth(firebaseApp);
  const googleProvider = new GoogleAuthProvider();
  // Set custom parameters to help with COOP/COEP issues if needed
  googleProvider.setCustomParameters({ prompt: 'select_account' });

  return { firebaseApp, firestore, auth, googleProvider };
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
