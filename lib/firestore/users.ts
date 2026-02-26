import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { User as FirebaseUser } from "firebase/auth";

export async function getUserDoc(uid: string) {
  const db = getDb();
  if (!db) return null;
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function ensureUserDoc(user: FirebaseUser) {
  const db = getDb();
  if (!db) return;
  const uid = user.uid;
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email || "",
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
      createdAt: serverTimestamp(),
    });
  }
}
