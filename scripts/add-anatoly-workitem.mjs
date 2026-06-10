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

async function addWorkItem() {
  const userId = "naYXUw6EACQMwPTsJZSscTL1NDx1";

  const workItem = {
    userId,
    name: "Anatoly & Sons — Bespoke Tailoring Atelier",
    description: "Custom website for a private tailoring atelier in Oakland, California. Full-stack Next.js application showcasing bespoke garments, made-to-measure services, and expert alterations with appointment booking and client portfolio.",
    type: "venture",
    category: "founder",
    tags: ["Next.js", "React", "TypeScript", "Firebase", "Tailwind CSS", "Web Design"],
    status: "completed",
    owned: true,
    role: "Full Stack Developer",
    website: "https://anatoly-and-sons.web.app",
    logoURL: "",
    techStack: ["Next.js", "React", "TypeScript", "Firebase Hosting", "Tailwind CSS"],
    metrics: "Live and in production",
    images: [],
    featured: true,
    order: 3,
    createdAt: new Date(),
  };

  try {
    console.log("Adding Anatoly & Sons work item...");
    const docRef = await db.collection("workItems").add(workItem);
    console.log(`✓ Work item added successfully with ID: ${docRef.id}`);
    console.log(`Website: ${workItem.website}`);
    process.exit(0);
  } catch (error) {
    console.error("Add failed:", error);
    process.exit(1);
  }
}

addWorkItem();
