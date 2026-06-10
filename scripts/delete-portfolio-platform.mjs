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
  const docId = "hkl4JM0Twntpy30bpU6g"; // Portfolio Platform

  try {
    console.log(`Deleting Portfolio Platform work item: ${docId}`);
    await db.collection("workItems").doc(docId).delete();
    console.log("✓ Portfolio Platform deleted successfully");
    process.exit(0);
  } catch (error) {
    console.error("Delete failed:", error);
    process.exit(1);
  }
}

deleteWorkItem();
