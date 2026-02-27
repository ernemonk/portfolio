#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const prompts = require('prompts');
const admin = require('firebase-admin');

// Auto-load .env.local so NEXT_PUBLIC_OWNER_UID is always available
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
}

// Load service account — path is resolved relative to cwd so both absolute
// and relative paths (e.g. ../service_account.json) work correctly.
const rawSvcPath = process.env.SERVICE_ACCOUNT_PATH
  || path.join(__dirname, '..', '..', 'service_account.json'); // repo root default
const svcPath = path.resolve(process.cwd(), rawSvcPath);
if (!fs.existsSync(svcPath)) {
  console.error('Service account file not found at', svcPath);
  console.error('Set SERVICE_ACCOUNT_PATH env or place service_account.json at the repo root (/Users/user/Projects/Portfolio/service_account.json).');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(fs.readFileSync(svcPath, 'utf8'))),
});

const db = admin.firestore();

const args = process.argv.slice(2);
const type = args[0];
if (!type || (type !== 'venture' && type !== 'project')) {
  console.error('Usage: node scripts/add-item.js <venture|project> [--file path/to/file.json|csv]');
  process.exit(1);
}
const fileArgIndex = args.indexOf('--file');
const filePath = fileArgIndex !== -1 ? args[fileArgIndex + 1] : null;

async function addVenture() {
  const response = await prompts([
    { name: 'name', type: 'text', message: 'Venture name*' },
    { name: 'website', type: 'text', message: 'Website (https://...)', initial: '' },
    { name: 'description', type: 'text', message: 'Description', initial: '' },
    { name: 'logo', type: 'text', message: 'Logo URL', initial: '' },
    { name: 'role', type: 'text', message: 'Role (Founder, Advisor, etc.)', initial: '' },
    { name: 'category', type: 'text', message: 'Category', initial: '' },
    { name: 'owned', type: 'confirm', message: 'Owned by you?', initial: true },
    { name: 'status', type: 'select', message: 'Status', choices: [ { title: 'Active', value: 'active' }, { title: 'Inactive', value: 'inactive' }, { title: 'Archived', value: 'archived' } ], initial: 0 },
    { name: 'tags', type: 'text', message: 'Tags (comma-separated)', initial: '' },
    { name: 'featured', type: 'confirm', message: 'Show on homepage?', initial: false },
  ]);

  const doc = {
    name: response.name,
    website: response.website || null,
    description: response.description || null,
    logo: response.logo || null,
    role: response.role || null,
    category: response.category || null,
    owned: !!response.owned,
    status: response.status || 'active',
    tags: response.tags ? response.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    featured: !!response.featured,
    userId: process.env.NEXT_PUBLIC_OWNER_UID || '1lUDhgCStvPddp1hcriXDGR6Ds43',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const ref = await db.collection('ventures').add(doc);
  console.log('Venture saved with id:', ref.id);
}

async function addProject() {
  const response = await prompts([
    { name: 'title', type: 'text', message: 'Project title*' },
    { name: 'link', type: 'text', message: 'Link (https://...)', initial: '' },
    { name: 'summary', type: 'text', message: 'Summary', initial: '' },
    { name: 'problem', type: 'text', message: 'Problem', initial: '' },
    { name: 'solution', type: 'text', message: 'Solution', initial: '' },
    { name: 'tech', type: 'text', message: 'Tech Stack (comma-separated)', initial: '' },
    { name: 'metrics', type: 'text', message: 'Metrics (e.g. 10k users)', initial: '' },
    { name: 'featured', type: 'confirm', message: 'Show on homepage?', initial: false },
  ]);

  const doc = {
    title: response.title,
    link: response.link || null,
    summary: response.summary || null,
    problem: response.problem || null,
    solution: response.solution || null,
    tech: response.tech ? response.tech.split(',').map((t) => t.trim()).filter(Boolean) : [],
    metrics: response.metrics || null,
    featured: !!response.featured,
    userId: process.env.NEXT_PUBLIC_OWNER_UID || '1lUDhgCStvPddp1hcriXDGR6Ds43',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const ref = await db.collection('projects').add(doc);
  console.log('Project saved with id:', ref.id);
}

function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = lines.slice(1).map((l) => {
    const cols = l.split(',');
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (cols[i] || '').trim();
    });
    return obj;
  });
  return rows;
}

async function processFile(type, filePath) {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  if (!fs.existsSync(abs)) throw new Error('File not found: ' + abs);
  const content = fs.readFileSync(abs, 'utf8');
  let items = [];
  if (filePath.toLowerCase().endsWith('.json')) {
    items = JSON.parse(content);
  } else if (filePath.toLowerCase().endsWith('.csv')) {
    items = parseCSV(content);
  } else {
    throw new Error('Unsupported file type. Use .json or .csv');
  }

  if (!Array.isArray(items)) items = [items];

  for (const it of items) {
    if (type === 'venture') {
      const doc = {
        name: it.name || it.title || '',
        website: it.website || it.link || null,
        description: it.description || it.summary || null,
        logo: it.logo || it.logoUrl || null,
        role: it.role || null,
        category: it.category || null,
        owned: it.owned === 'true' || it.owned === true || !!it.owned,
        status: it.status || 'active',
        tags: it.tags ? String(it.tags).split(',').map((t) => t.trim()).filter(Boolean) : [],
        featured: it.featured === 'true' || it.featured === true || !!it.featured,
        userId: process.env.NEXT_PUBLIC_OWNER_UID || '1lUDhgCStvPddp1hcriXDGR6Ds43',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      const ref = await db.collection('ventures').add(doc);
      console.log('Venture saved with id:', ref.id);
    }
    if (type === 'project') {
      const doc = {
        title: it.title || it.name || '',
        link: it.link || it.website || null,
        summary: it.summary || it.description || null,
        problem: it.problem || null,
        solution: it.solution || null,
        tech: it.tech ? String(it.tech).split(',').map((t) => t.trim()).filter(Boolean) : [],
        metrics: it.metrics || null,
        featured: it.featured === 'true' || it.featured === true || !!it.featured,
        userId: process.env.NEXT_PUBLIC_OWNER_UID || '1lUDhgCStvPddp1hcriXDGR6Ds43',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      const ref = await db.collection('projects').add(doc);
      console.log('Project saved with id:', ref.id);
    }
  }
}

(async () => {
  try {
    if (filePath) {
      await processFile(type, filePath);
    } else {
      if (type === 'venture') await addVenture();
      if (type === 'project') await addProject();
    }
    process.exit(0);
  } catch (e) {
    console.error('Error adding item:', e);
    process.exit(1);
  }
})();
