/**
 * Server-side Firestore helpers for public pages.
 *
 * These run inside async Server Components at build time (output: "export"),
 * so the resulting static HTML already contains the real Firestore data —
 * making every public page fully SEO-compatible.
 *
 * Data is always scoped to OWNER_UID (the portfolio owner's account).
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore/lite";
import { getServerDb } from "@/lib/firebase-server";
import { OWNER_UID } from "@/lib/owner";
import type { Bio, Venture, Project, Experiment } from "@/types";

export async function fetchOwnerBio(): Promise<Bio | null> {
  try {
    const snap = await getDoc(doc(getServerDb(), "bio", OWNER_UID));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Bio;
  } catch (e) {
    console.warn("[server] getOwnerBio failed:", e);
    return null;
  }
}

export async function fetchOwnerVentures(): Promise<Venture[]> {
  try {
    const q = query(
      collection(getServerDb(), "ventures"),
      where("userId", "==", OWNER_UID)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Venture));
  } catch (e) {
    console.warn("[server] getOwnerVentures failed:", e);
    return [];
  }
}

export async function fetchOwnerProjects(): Promise<Project[]> {
  try {
    const q = query(
      collection(getServerDb(), "projects"),
      where("userId", "==", OWNER_UID)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
  } catch (e) {
    console.warn("[server] getOwnerProjects failed:", e);
    return [];
  }
}

export async function fetchOwnerExperiments(): Promise<Experiment[]> {
  try {
    const q = query(
      collection(getServerDb(), "experiments"),
      where("userId", "==", OWNER_UID)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Experiment));
  } catch (e) {
    console.warn("[server] getOwnerExperiments failed:", e);
    return [];
  }
}
