/**
 * Server-side Firebase initialisation using firebase/firestore/lite.
 *
 * `firebase/firestore/lite` has no browser dependencies (no persistence,
 * no real-time listeners) and is safe to run inside Next.js server components
 * at static-export build time.
 *
 * We use a separate named app ("server") so this never collides with the
 * client-side "[DEFAULT]" Firebase instance that lives in the browser.
 */
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore/lite";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

const SERVER_APP_NAME = "server";

let _db: Firestore | null = null;

export function getServerDb(): Firestore {
  if (_db) return _db;
  const existing = getApps().find((a) => a.name === SERVER_APP_NAME);
  const app = existing ?? initializeApp(firebaseConfig, SERVER_APP_NAME);
  _db = getFirestore(app);
  return _db;
}
