import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Bio } from "@/types";

export async function getBio(): Promise<Bio | null> {
  const db = getDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, "bio", "main"));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Bio;
}

export async function updateBio(data: Omit<Bio, "id">): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase not initialized");
  await setDoc(doc(db, "bio", "main"), data, { merge: true });
}
