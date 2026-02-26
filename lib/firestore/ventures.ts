import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Venture } from "@/types";

export async function getVentures(userId: string): Promise<Venture[]> {
  const db = getDb();
  if (!db) return [];
  const q = query(collection(db, "ventures"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Venture));
}

export async function getFeaturedVentures(userId: string): Promise<Venture[]> {
  const db = getDb();
  if (!db) return [];
  const q = query(
    collection(db, "ventures"),
    where("userId", "==", userId),
    where("featured", "==", true),
    where("status", "==", "active")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Venture));
}

export async function addVenture(
  userId: string,
  data: Omit<Venture, "id" | "userId">
): Promise<string> {
  const db = getDb();
  if (!db) throw new Error("Firebase not initialized");
  const ref = await addDoc(collection(db, "ventures"), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateVenture(
  id: string,
  data: Partial<Omit<Venture, "id" | "userId">>
): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase not initialized");
  await updateDoc(doc(db, "ventures", id), data);
}

export async function deleteVenture(id: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase not initialized");
  await deleteDoc(doc(db, "ventures", id));
}
