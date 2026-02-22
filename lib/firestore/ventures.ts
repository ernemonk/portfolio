import { collection, getDocs, query, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Venture } from "@/types";

export async function getVentures(): Promise<Venture[]> {
  const db = getDb();
  if (!db) return [];
  const snap = await getDocs(collection(db, "ventures"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Venture));
}

export async function getFeaturedVentures(): Promise<Venture[]> {
  const db = getDb();
  if (!db) return [];
  const q = query(
    collection(db, "ventures"),
    where("featured", "==", true),
    where("status", "==", "active")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Venture));
}
