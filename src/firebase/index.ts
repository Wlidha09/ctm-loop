
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
import { getAuth, Auth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigValid } from './config';

export function initializeFirebase(): {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  googleProvider: GoogleAuthProvider | null;
} {
  // Never initialize on server-side or without a valid config
  if (typeof window === 'undefined' || !isFirebaseConfigValid) {
    return { firebaseApp: null, firestore: null, auth: null, googleProvider: null };
  }

  try {
    const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    
    let firestore: Firestore;
    try {
      firestore = initializeFirestore(firebaseApp, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
      });
    } catch (e) {
      firestore = getFirestore(firebaseApp);
    }

    const auth = getAuth(firebaseApp);
    
    // Explicitly set persistence to avoid session loss
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.error("Firebase Persistence Error:", err);
    });

    const googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });

    return { firebaseApp, firestore, auth, googleProvider };
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    return { firebaseApp: null, firestore: null, auth: null, googleProvider: null };
  }
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
