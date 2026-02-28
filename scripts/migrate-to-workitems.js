/**
 * Migrate ventures, projects, experiments, siteProjects → unified workItems collection.
 * Run: node scripts/migrate-to-workitems.js
 */
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

/* ── Bootstrap ── */
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
}

const svcPath = process.env.SERVICE_ACCOUNT_PATH || path.join(__dirname, '..', '..', 'service_account.json');
if (!fs.existsSync(svcPath)) { console.error('service_account.json not found at', svcPath); process.exit(1); }
const svc = JSON.parse(fs.readFileSync(svcPath, 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(svc) });
const db = admin.firestore();
const uid = process.env.NEXT_PUBLIC_OWNER_UID || 'naYXUw6EACQMwPTsJZSscTL1NDx1';

async function migrate() {
  const batch = db.batch();
  let count = 0;

  /* ── Ventures → workItems ── */
  const ventSnap = await db.collection('ventures').where('userId', '==', uid).get();
  ventSnap.forEach((doc) => {
    const d = doc.data();
    const ref = db.collection('workItems').doc();
    batch.set(ref, {
      userId: uid,
      name: d.name || '',
      description: d.description || '',
      type: 'venture',
      category: d.category || 'owned',
      tags: d.tags || [],
      status: d.status || 'active',
      owned: d.category === 'owned' || d.owned === true,
      role: d.role || 'Founder',
      website: d.website || '',
      logoURL: d.logoURL || '',
      techStack: d.techStack || [],
      metrics: d.metrics || '',
      images: d.images || [],
      featured: d.featured || false,
      order: count,
      createdAt: d.createdAt || admin.firestore.FieldValue.serverTimestamp(),
    });
    count++;
  });
  console.log(`Mapped ${ventSnap.size} ventures`);

  /* ── Projects → workItems ── */
  const projSnap = await db.collection('projects').where('userId', '==', uid).get();
  projSnap.forEach((doc) => {
    const d = doc.data();
    const ref = db.collection('workItems').doc();
    batch.set(ref, {
      userId: uid,
      name: d.title || d.name || '',
      description: d.summary || d.description || '',
      type: 'project',
      category: 'enterprise',
      tags: d.techStack || [],
      status: 'completed',
      owned: false,
      role: d.role || 'Lead Engineer',
      website: d.link || '',
      logoURL: '',
      techStack: d.techStack || [],
      metrics: d.metrics || '',
      images: d.images || [],
      featured: d.featured || false,
      order: count,
      createdAt: d.createdAt || admin.firestore.FieldValue.serverTimestamp(),
    });
    count++;
  });
  console.log(`Mapped ${projSnap.size} projects`);

  /* ── Experiments → workItems ── */
  const expSnap = await db.collection('experiments').where('userId', '==', uid).get();
  expSnap.forEach((doc) => {
    const d = doc.data();
    const ref = db.collection('workItems').doc();
    batch.set(ref, {
      userId: uid,
      name: d.title || d.name || '',
      description: d.summary || d.description || '',
      type: 'experiment',
      category: d.type || 'R&D',
      tags: d.tags || [],
      status: d.status || 'building',
      owned: true,
      role: 'Creator',
      website: d.link || '',
      logoURL: '',
      techStack: d.techStack || [],
      metrics: '',
      images: [],
      featured: false,
      order: count,
      createdAt: d.createdAt || admin.firestore.FieldValue.serverTimestamp(),
    });
    count++;
  });
  console.log(`Mapped ${expSnap.size} experiments`);

  /* ── siteProjects → workItems (if not already covered) ── */
  const siteSnap = await db.collection('siteProjects').where('userId', '==', uid).get();
  siteSnap.forEach((doc) => {
    const d = doc.data();
    const typeMap = { enterprise: 'project', founder: 'venture', consulting: 'client' };
    const ref = db.collection('workItems').doc();
    batch.set(ref, {
      userId: uid,
      name: d.title || d.name || '',
      description: d.description || '',
      type: typeMap[d.category] || 'project',
      category: d.category || 'enterprise',
      tags: d.techStack || [],
      status: 'completed',
      owned: d.category === 'founder',
      role: d.category === 'founder' ? 'Founder' : 'Lead Engineer',
      website: d.link || '',
      logoURL: '',
      techStack: d.techStack || [],
      metrics: d.metrics || '',
      images: [],
      featured: d.featured || false,
      order: d.order ?? count,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    count++;
  });
  console.log(`Mapped ${siteSnap.size} siteProjects`);

  /* ── Commit ── */
  await batch.commit();
  console.log(`\n✅ Migrated ${count} total documents into workItems.`);
}

migrate().catch((err) => { console.error(err); process.exit(1); });
