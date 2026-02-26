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
import type { Experiment } from "@/types";

export async function getExperiments(userId: string): Promise<Experiment[]> {
  const db = getDb();
  if (!db) return [];
  const q = query(collection(db, "experiments"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Experiment));
}

export async function addExperiment(
  userId: string,
  data: Omit<Experiment, "id" | "userId">
): Promise<string> {
  const db = getDb();
  if (!db) throw new Error("Firebase not initialized");
  const ref = await addDoc(collection(db, "experiments"), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateExperiment(
  id: string,
  data: Partial<Omit<Experiment, "id" | "userId">>
): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase not initialized");
  await updateDoc(doc(db, "experiments", id), data);
}

export async function deleteExperiment(id: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase not initialized");
  await deleteDoc(doc(db, "experiments", id));
}
