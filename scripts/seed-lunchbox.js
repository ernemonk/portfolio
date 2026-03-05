// REMOVED: one-time seed neutralized to prevent accidental DB writes
console.log('seed-lunchbox script removed.');
process.exit(0);
// This script was already executed on 2026-02-26.
// Running it again will create duplicate Firestore documents.
// To update data, use the admin portal or scripts/add-item.js.
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const svc = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'service_account.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(svc) });
const db = admin.firestore();
const uid = 'naYXUw6EACQMwPTsJZSscTL1NDx1';
const ts = admin.firestore.FieldValue.serverTimestamp();

async function run() {
  const v = await db.collection('ventures').add({
    name: 'Lunchbox',
    website: 'https://lunchbox-gen.web.app',
    description: 'AI-powered meal planning iOS app — turn ingredients you already have into personalized recipes in seconds. Supports Keto, Vegan, Carnivore and more, with fridge tracking, barcode scanning, and macro-aware suggestions.',
    logo: 'https://lunchbox-gen.web.app/static/avatar-8cd199dd94aa77c9ea26c803a92ce3e4.png',
    role: 'Founder',
    category: 'Consumer / AI',
    owned: true,
    status: 'active',
    tags: ['AI', 'iOS', 'Mobile', 'Food Tech', 'Consumer'],
    featured: true,
    userId: uid,
    createdAt: ts,
  });
  console.log('Venture saved:', v.id);

  const p = await db.collection('projects').add({
    title: 'Lunchbox — AI Meal Planner',
    link: 'https://lunchbox-gen.web.app',
    summary: 'AI-powered iOS app that generates personalized recipes from ingredients you already have, with fridge tracking, barcode scanning, and diet-aware meal planning.',
    problem: 'People waste food and struggle with "what to cook" every day — existing meal apps require manual recipe searches and ignore what is already in the fridge.',
    solution: 'Built an AI recipe engine that takes your fridge inventory, dietary preferences, and macros, then instantly generates step-by-step recipes. Ships with barcode scanning, favorites, and a fridge tracker.',
    tech: ['React Native', 'Firebase', 'OpenAI', 'Node.js', 'iOS'],
    metrics: 'Live on App Store (Lunchboxer)',
    featured: true,
    userId: uid,
    createdAt: ts,
  });
  console.log('Project saved:', p.id);

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
