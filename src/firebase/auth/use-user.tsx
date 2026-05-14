
'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useFirebase } from '../provider';

/**
 * Hook personnalisé pour suivre l'état de l'utilisateur Firebase.
 * user === undefined : Chargement initial en cours
 * user === null : Utilisateur déconnecté
 * user === User : Utilisateur connecté
 */
export function useUser() {
  const { auth } = useFirebase();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    if (!auth) {
      setUser(null);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('État Auth actuel (Firebase) :', currentUser ? `Connecté: ${currentUser.email}` : 'Déconnecté');
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading: user === undefined };
}
