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

async function exportAllCollections() {
  console.log("Starting Firestore export...");
  const exportData = {};

  try {
    const collections = await db.listCollections();
    console.log(`Found ${collections.length} collection(s)\n`);

    for (const collection of collections) {
      console.log(`Exporting collection: ${collection.id}`);
      const docs = await collection.get();

      const collectionData = {};
      let docCount = 0;

      for (const doc of docs.docs) {
        collectionData[doc.id] = {
          ...doc.data(),
          __metadata: {
            docId: doc.id,
            createdAt: doc.createTime?.toDate?.()?.toISOString?.() || null,
            updatedAt: doc.updateTime?.toDate?.()?.toISOString?.() || null,
          },
        };
        docCount++;
      }

      exportData[collection.id] = collectionData;
      console.log(`  ✓ Exported ${docCount} document(s)\n`);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const outputPath = path.join(projectRoot, `firestore-export-${timestamp}.json`);

    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

    console.log(`\n✓ Export complete!`);
    console.log(`Data saved to: ${outputPath}`);
    console.log(`Total size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);

    process.exit(0);
  } catch (error) {
    console.error("Export failed:", error);
    process.exit(1);
  }
}

exportAllCollections();
