// ⚠️  UTILITY SCRIPT — run only when you need to remove duplicates.
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const svc = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'service_account.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(svc) });
const db = admin.firestore();

async function dedupe(col, titleField) {
  const snap = await db.collection(col).get();
  const seen = {};
  const toDelete = [];
  snap.docs.forEach(d => {
    const key = (d.data()[titleField] || '').toLowerCase().trim();
    if (seen[key]) {
      toDelete.push(d.ref);
    } else {
      seen[key] = true;
    }
  });
  if (toDelete.length === 0) {
    console.log(col, '— no duplicates found');
    return;
  }
  const batch = db.batch();
  toDelete.forEach(ref => batch.delete(ref));
  await batch.commit();
  console.log(col, `— deleted ${toDelete.length} duplicate(s)`);
}

async function run() {
  await dedupe('projects', 'title');
  await dedupe('ventures', 'name');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
