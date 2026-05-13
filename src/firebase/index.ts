
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
  if (typeof window === 'undefined' || !isFirebaseConfigValid) {
    return { firebaseApp: null, firestore: null, auth: null, googleProvider: null };
  }

  const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  
  let firestore: Firestore;
  try {
    // Enable persistent local cache for better offline support
    firestore = initializeFirestore(firebaseApp, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });
  } catch (e) {
    // If already initialized (e.g. during HMR), use existing instance
    firestore = getFirestore(firebaseApp);
  }

  const auth = getAuth(firebaseApp);
  const googleProvider = new GoogleAuthProvider();

  return { firebaseApp, firestore, auth, googleProvider };
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
