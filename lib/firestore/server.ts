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
import type {
  Bio,
  WorkItem,
  SiteMetric,
  HeroSection,
  CapabilitiesSection,
  CurrentFocusSection,
} from "@/types";

/* ─── Bio ─── */

export async function fetchOwnerBio(): Promise<Bio | null> {
  try {
    const snap = await getDoc(doc(getServerDb(), "bio", OWNER_UID));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Bio;
  } catch (e) {
    console.warn("[server] fetchOwnerBio failed:", e);
    return null;
  }
}

/* ─── Unified Work Items ─── */

export async function fetchWorkItems(): Promise<WorkItem[]> {
  try {
    const q = query(
      collection(getServerDb(), "workItems"),
      where("userId", "==", OWNER_UID)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as WorkItem))
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  } catch (e) {
    console.warn("[server] fetchWorkItems failed:", e);
    return [];
  }
}

export async function fetchFeaturedWorkItems(): Promise<WorkItem[]> {
  try {
    const q = query(
      collection(getServerDb(), "workItems"),
      where("userId", "==", OWNER_UID),
      where("featured", "==", true)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as WorkItem))
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  } catch (e) {
    console.warn("[server] fetchFeaturedWorkItems failed:", e);
    return [];
  }
}

/* ─── Homepage structural fetchers ─── */

export async function fetchHeroSection(): Promise<HeroSection | null> {
  try {
    const snap = await getDoc(doc(getServerDb(), "sections", "hero"));
    if (!snap.exists()) return null;
    return snap.data() as HeroSection;
  } catch (e) {
    console.warn("[server] fetchHeroSection failed:", e);
    return null;
  }
}

export async function fetchCapabilities(): Promise<CapabilitiesSection | null> {
  try {
    const snap = await getDoc(doc(getServerDb(), "sections", "capabilities"));
    if (!snap.exists()) return null;
    return snap.data() as CapabilitiesSection;
  } catch (e) {
    console.warn("[server] fetchCapabilities failed:", e);
    return null;
  }
}

export async function fetchCurrentFocus(): Promise<CurrentFocusSection | null> {
  try {
    const snap = await getDoc(doc(getServerDb(), "sections", "currentFocus"));
    if (!snap.exists()) return null;
    return snap.data() as CurrentFocusSection;
  } catch (e) {
    console.warn("[server] fetchCurrentFocus failed:", e);
    return null;
  }
}

export async function fetchSiteMetrics(): Promise<SiteMetric[]> {
  try {
    const q = query(
      collection(getServerDb(), "siteMetrics"),
      where("userId", "==", OWNER_UID)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as SiteMetric))
      .sort((a, b) => a.order - b.order);
  } catch (e) {
    console.warn("[server] fetchSiteMetrics failed:", e);
    return [];
  }
}
