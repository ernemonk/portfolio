/**
 * Deduplicate workItems — keep one doc per unique name, prefer the one with more data.
 * Run: node scripts/dedupe-workitems.js
 */
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
}

const svcPath = process.env.SERVICE_ACCOUNT_PATH || path.join(__dirname, '..', '..', 'service_account.json');
const svc = JSON.parse(fs.readFileSync(svcPath, 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(svc) });
const db = admin.firestore();
const uid = process.env.NEXT_PUBLIC_OWNER_UID || 'naYXUw6EACQMwPTsJZSscTL1NDx1';

async function dedupe() {
  const snap = await db.collection('workItems').where('userId', '==', uid).get();
  const byName = {};

  snap.forEach((doc) => {
    const d = { id: doc.id, ...doc.data() };
    const key = d.name.toLowerCase().trim();
    if (!byName[key]) byName[key] = [];
    byName[key].push(d);
  });

  let deleted = 0;
  const batch = db.batch();

  for (const [name, docs] of Object.entries(byName)) {
    if (docs.length <= 1) continue;

    // Score: prefer featured, longer description, more techStack, has metrics
    const scored = docs.map((d) => ({
      ...d,
      score:
        (d.featured ? 10 : 0) +
        (d.description?.length || 0) +
        (d.techStack?.length || 0) * 5 +
        (d.metrics ? 5 : 0) +
        (d.website ? 3 : 0),
    }));
    scored.sort((a, b) => b.score - a.score);

    // Keep the best, delete the rest
    const [keep, ...remove] = scored;
    console.log(`"${name}": keeping (score=${keep.score}), removing ${remove.length} duplicate(s)`);
    for (const dup of remove) {
      batch.delete(db.collection('workItems').doc(dup.id));
      deleted++;
    }
  }

  if (deleted > 0) {
    await batch.commit();
    console.log(`\n✅ Deleted ${deleted} duplicates.`);
  } else {
    console.log('No duplicates found.');
  }

  // Print final count
  const final = await db.collection('workItems').where('userId', '==', uid).get();
  console.log(`Final workItems count: ${final.size}`);
}

dedupe().catch((err) => { console.error(err); process.exit(1); });
