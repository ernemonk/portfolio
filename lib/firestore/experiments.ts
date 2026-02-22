import { collection, getDocs } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Experiment } from "@/types";

export async function getExperiments(): Promise<Experiment[]> {
  const db = getDb();
  if (!db) return [];
  const snap = await getDocs(collection(db, "experiments"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Experiment));
}
