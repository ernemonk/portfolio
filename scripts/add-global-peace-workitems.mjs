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

async function addWorkItems() {
  const userId = "naYXUw6EACQMwPTsJZSscTL1NDx1";

  const workItems = [
    {
      userId,
      name: "Global Peace Yes — Voting Platform",
      description: "Full-stack voting platform and infrastructure for a modern peace movement. Enables millions of users to cast votes for global peace while building a community of peace advocates worldwide.",
      type: "venture",
      category: "founder",
      tags: ["Next.js", "React", "Node.js", "Firebase", "Voting System", "Cloud Infrastructure"],
      status: "completed",
      owned: true,
      role: "Full Stack Developer",
      website: "https://globalpeaceyes.org",
      logoURL: "",
      techStack: ["Next.js", "React", "Node.js", "Firebase", "PostgreSQL", "Cloud Infrastructure"],
      metrics: "Millions of votes processed",
      images: [],
      featured: true,
      order: 1,
      createdAt: new Date(),
    },
    {
      userId,
      name: "Peace Champion — Mobile App",
      description: "iOS mobile application for the Global Peace Yes movement. Allows users to champion peace through daily practices, voting, and community engagement on the go.",
      type: "venture",
      category: "founder",
      tags: ["React Native", "iOS", "Firebase", "Mobile App", "App Store"],
      status: "completed",
      owned: true,
      role: "Mobile Developer",
      website: "https://apps.apple.com/us/app/peace-champion/id6746622214",
      logoURL: "",
      techStack: ["React Native", "Firebase", "TypeScript", "iOS"],
      metrics: "Live on Apple App Store",
      images: [],
      featured: true,
      order: 2,
      createdAt: new Date(),
    },
  ];

  try {
    console.log("Adding Global Peace Yes work items...\n");

    for (const workItem of workItems) {
      const docRef = await db.collection("workItems").add(workItem);
      console.log(`✓ Added: ${workItem.name}`);
      console.log(`  ID: ${docRef.id}`);
      console.log(`  Website: ${workItem.website}\n`);
    }

    console.log("✓ All work items added successfully");
    process.exit(0);
  } catch (error) {
    console.error("Add failed:", error);
    process.exit(1);
  }
}

addWorkItems();
