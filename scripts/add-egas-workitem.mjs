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
    name: "E-gas Technology — IoT Propane Tank Monitoring",
    description: "End-to-end IoT product for monitoring propane tank levels. Designed and manufactured PCBs, developed C++ firmware for ESP8266 microcontrollers, built cloud data ingestion pipeline, and shipped mobile apps to App Store and Play Store.",
    type: "venture",
    category: "founder",
    tags: ["C++", "ESP8266", "IoT", "PCB Design", "Google IoT Core", "React.js", "Flutter", "Firebase"],
    status: "completed",
    owned: true,
    role: "Founder",
    website: "",
    logoURL: "",
    techStack: ["C++", "ESP8266", "PCB Design", "I2C/SPI", "MQTT", "Google IoT Core", "Pub/Sub", "Cloud Functions", "Python", "Django", "React.js", "Flutter", "Firebase"],
    metrics: "App Store + Play Store launch",
    images: [],
    featured: true,
    order: 2,
    createdAt: new Date(),
  };

  try {
    console.log("Adding E-gas Technology work item...");
    const docRef = await db.collection("workItems").add(workItem);
    console.log(`✓ Work item added successfully with ID: ${docRef.id}`);
    process.exit(0);
  } catch (error) {
    console.error("Add failed:", error);
    process.exit(1);
  }
}

addWorkItem();
