
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ""
};

/**
 * Validates if the Firebase configuration is valid.
 * Throws an explicit error if the API Key is missing on the client side.
 */
export const validateFirebaseConfig = () => {
  if (typeof window !== 'undefined') {
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "") {
      console.error("Firebase Configuration Error: NEXT_PUBLIC_FIREBASE_API_KEY is missing. Check your Vercel Environment Variables.");
    }
  }
  return !!firebaseConfig.apiKey && !!firebaseConfig.projectId;
};

export const isFirebaseConfigValid = validateFirebaseConfig();
