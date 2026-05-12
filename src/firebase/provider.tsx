
'use client';

import React, { createContext, useContext } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';

interface FirebaseContextValue {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

const FirebaseContext = createContext<FirebaseContextValue | undefined>(undefined);

export function FirebaseProvider({
  children,
  firebaseApp,
  firestore,
  auth,
}: {
  children: React.ReactNode;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}) {
  return (
    <FirebaseContext.Provider value={{ firebaseApp, firestore, auth }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export function useFirebaseApp() {
  const app = useFirebase().firebaseApp;
  if (!app) throw new Error('FirebaseApp is not initialized. Check your configuration.');
  return app;
}

export function useFirestore() {
  const db = useFirebase().firestore;
  if (!db) throw new Error('Firestore is not initialized. Check your configuration.');
  return db;
}

export function useAuth() {
  const auth = useFirebase().auth;
  if (!auth) throw new Error('Auth is not initialized. Check your configuration.');
  return auth;
}
