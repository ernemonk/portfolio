import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Experiment } from "@/types";

export async function getExperiments(): Promise<Experiment[]> {
  const db = getDb();
  if (!db) return [];
  const snap = await getDocs(collection(db, "experiments"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Experiment));
}

export async function addExperiment(
  data: Omit<Experiment, "id">
): Promise<string> {
  const db = getDb();
  if (!db) throw new Error("Firebase not initialized");
  const ref = await addDoc(collection(db, "experiments"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateExperiment(
  id: string,
  data: Partial<Omit<Experiment, "id">>
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
