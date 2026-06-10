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

async function fixHeroLinks() {
  try {
    console.log("Fixing hero section links with trailing slashes...\n");

    const heroRef = db.collection("sections").doc("hero");
    const heroDoc = await heroRef.get();

    if (!heroDoc.exists) {
      console.log("❌ Hero section not found");
      return;
    }

    const data = heroDoc.data();
    console.log("Current hero data:");
    console.log(JSON.stringify(data, null, 2));

    // Fix the hrefs to include trailing slashes
    const updated = {
      ...data,
      cta2Href: "/contact/",
    };

    await heroRef.update(updated);

    console.log("\n✅ Hero section updated successfully:");
    console.log("  - cta2Href: /contact → /contact/");
    console.log("\nUpdated hero data:");
    console.log(JSON.stringify(updated, null, 2));

    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating hero section:", error);
    process.exit(1);
  }
}

fixHeroLinks();
