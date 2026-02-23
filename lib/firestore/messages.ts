import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Message } from "@/types";

export async function addMessage(
  data: Pick<Message, "name" | "email" | "message">
): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase not initialized");
  await addDoc(collection(db, "messages"), {
    ...data,
    createdAt: serverTimestamp(),
    read: false,
    reply: "",
  });
}

export async function getMessages(): Promise<Message[]> {
  const db = getDb();
  if (!db) return [];
  const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
}

export function subscribeToMessages(
  cb: (messages: Message[]) => void
): Unsubscribe {
  const db = getDb();
  if (!db) return () => {};
  const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)));
  });
}

export async function markMessageRead(id: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await updateDoc(doc(db, "messages", id), { read: true });
}

export async function saveReply(id: string, reply: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await updateDoc(doc(db, "messages", id), {
    reply,
    repliedAt: serverTimestamp(),
    read: true,
  });
}

export async function deleteMessage(id: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await deleteDoc(doc(db, "messages", id));
}
