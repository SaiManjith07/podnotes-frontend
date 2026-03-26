import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId,
);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let analytics: Analytics | undefined;

if (isFirebaseConfigured) {
  app = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);
  auth = getAuth(app);

  // Multi-tab IndexedDB cache via FirestoreSettings-style API (replaces enableMultiTabIndexedDbPersistence).
  if (typeof window !== "undefined") {
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } catch {
      // Hot reload or Firestore already initialized — reuse default instance.
      db = getFirestore(app);
    }
  } else {
    db = getFirestore(app);
  }

  // Analytics calls Google on every load; skip in dev to avoid extra timeouts when the network blocks googleapis.
  if (typeof window !== "undefined" && firebaseConfig.measurementId && import.meta.env.PROD) {
    analytics = getAnalytics(app);
  }
}

export { app as firebaseApp, auth as firebaseAuth, db as firebaseDb, analytics as firebaseAnalytics };
