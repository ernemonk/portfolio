import { collection, getDocs, query, where } from "firebase/firestore";
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
