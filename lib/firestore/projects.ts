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
import type { Project } from "@/types";

export async function getProjects(): Promise<Project[]> {
  const db = getDb();
  if (!db) return [];
  const snap = await getDocs(collection(db, "projects"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const db = getDb();
  if (!db) return [];
  const q = query(collection(db, "projects"), where("featured", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
}

export async function addProject(
  data: Omit<Project, "id">
): Promise<string> {
  const db = getDb();
  if (!db) throw new Error("Firebase not initialized");
  const ref = await addDoc(collection(db, "projects"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, "id">>
): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase not initialized");
  await updateDoc(doc(db, "projects", id), data);
}

export async function deleteProject(id: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase not initialized");
  await deleteDoc(doc(db, "projects", id));
}
