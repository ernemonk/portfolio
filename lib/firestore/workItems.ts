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
import type { WorkItem } from "@/types";

export async function getWorkItems(userId: string): Promise<WorkItem[]> {
  const db = getDb();
  if (!db) return [];
  const q = query(collection(db, "workItems"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as WorkItem))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export async function getWorkItemsByType(
  userId: string,
  type: WorkItem["type"]
): Promise<WorkItem[]> {
  const db = getDb();
  if (!db) return [];
  const q = query(
    collection(db, "workItems"),
    where("userId", "==", userId),
    where("type", "==", type)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as WorkItem))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export async function addWorkItem(
  userId: string,
  data: Omit<WorkItem, "id" | "userId">
): Promise<string> {
  const db = getDb();
  if (!db) throw new Error("Firebase not initialized");
  const ref = await addDoc(collection(db, "workItems"), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateWorkItem(
  id: string,
  data: Partial<Omit<WorkItem, "id" | "userId">>
): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase not initialized");
  await updateDoc(doc(db, "workItems", id), data);
}

export async function deleteWorkItem(id: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase not initialized");
  await deleteDoc(doc(db, "workItems", id));
}
