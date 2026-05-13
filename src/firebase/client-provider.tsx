
'use client';

import React, { useMemo } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const { firebaseApp, firestore, auth, googleProvider } = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider 
      firebaseApp={firebaseApp} 
      firestore={firestore} 
      auth={auth} 
      googleProvider={googleProvider}
    >
      {children}
    </FirebaseProvider>
  );
}
