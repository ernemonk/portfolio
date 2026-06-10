#!/usr/bin/env node

import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.dirname(__dirname);
const serviceAccountPath = path.join(projectRoot, "service_account.json");

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

async function deleteWorkItem() {
  const docId = "vXfIsxmAxQK6NHrVQmGq"; // Portfolio Site duplicate

  try {
    console.log(`Deleting work item: ${docId}`);
    await db.collection("workItems").doc(docId).delete();
    console.log("✓ Work item deleted successfully");
    process.exit(0);
  } catch (error) {
    console.error("Delete failed:", error);
    process.exit(1);
  }
}

deleteWorkItem();
