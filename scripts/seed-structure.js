/**
 * ONE-TIME seed for the homepage structural overhaul.
 * Creates: /sections, /siteProjects, /siteMetrics
 * Cleans: duplicate ventures/projects
 */
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const svc = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'service_account.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(svc) });
const db = admin.firestore();
const ts = admin.firestore.FieldValue.serverTimestamp();
const uid = 'naYXUw6EACQMwPTsJZSscTL1NDx1';

async function seedSections() {
  const sections = {
    hero: {
      name: 'Ernesto Monge',
      tagline: 'Engineering scalable systems. Building real products.',
      subtext: '10+ years designing and shipping enterprise infrastructure, real-time platforms, and AI-powered applications.',
      cta1Label: 'View Work',
      cta1Href: '#selected-work',
      cta2Label: 'Work With Me',
      cta2Href: '/contact',
      order: 1,
    },
    capabilities: {
      blocks: [
        {
          title: 'Enterprise Engineering',
          description: 'Real-time systems, distributed infrastructure, integrations, cloud-native platforms.',
        },
        {
          title: 'Fractional CTO / Consulting',
          description: 'Architecture design, 0→1 product execution, scaling engineering teams, technical strategy.',
        },
        {
          title: 'Founder Projects',
          description: 'Products I design, build, and launch end-to-end.',
        },
      ],
      order: 2,
    },
    currentFocus: {
      title: 'Current Focus',
      items: [
        'Leading integrations engineering at AssetMark — Salesforce, DocuSign, gRPC pipelines.',
        'Scaling Lunchbox — AI-powered meal planning, live on the App Store.',
        'Advising early-stage startups on architecture and 0→1 execution.',
      ],
      order: 5,
    },
  };

  const batch = db.batch();
  for (const [id, data] of Object.entries(sections)) {
    batch.set(db.collection('sections').doc(id), { ...data, userId: uid, updatedAt: ts });
  }
  await batch.commit();
  console.log('sections seeded');
}

async function seedSiteProjects() {
  const projects = [
    {
      title: 'AssetMark — Integrations Platform',
      category: 'enterprise',
      description: 'Leading engineering for Salesforce integrations, DocuSign contract workflows, and gRPC-based real-time data sync across financial advisor platforms.',
      techStack: ['Node.js', '.NET', 'gRPC', 'Salesforce', 'DocuSign', 'Azure'],
      metrics: 'Current role — production at scale',
      link: '',
      featured: true,
      order: 1,
    },
    {
      title: 'GPS Tracking Infrastructure',
      category: 'enterprise',
      description: 'Designed and built a real-time GPS tracking backend with gRPC position streaming, map rendering pipelines, and alerting for 10k+ simultaneous fleet devices.',
      techStack: ['Node.js', 'gRPC', 'PostgreSQL', 'Redis', 'Google Maps'],
      metrics: '10k+ active devices',
      link: '',
      featured: true,
      order: 2,
    },
    {
      title: 'Data Migration Platform — JPMorgan Chase',
      category: 'enterprise',
      description: 'Built a configurable migration engine for moving legacy financial data to modern cloud systems — validation pipelines, audit trails, rollback support. 100M+ records.',
      techStack: ['Java', '.NET', 'SQL Server', 'Azure'],
      metrics: '100M+ records migrated',
      link: '',
      featured: true,
      order: 3,
    },
    {
      title: 'Treasury Dashboard — First Republic Bank',
      category: 'enterprise',
      description: 'Internal treasury and cash management dashboard with live data feeds, automated reconciliation, and drill-down reporting for daily cash position tracking.',
      techStack: ['React', 'Node.js', '.NET', 'SQL Server'],
      metrics: '',
      link: '',
      featured: false,
      order: 4,
    },
    {
      title: 'Audio Fingerprinting Pipeline',
      category: 'enterprise',
      description: 'Automated audio fingerprinting and content recognition pipeline using FFT processing and distributed job queues for media rights detection at scale.',
      techStack: ['Python', 'FFmpeg', 'Redis', 'PostgreSQL', 'AWS'],
      metrics: '',
      link: '',
      featured: false,
      order: 5,
    },
    {
      title: 'Lunchbox — AI Meal Planner',
      category: 'founder',
      description: 'End-to-end iOS app: AI recipe engine ingesting fridge inventory, dietary constraints, and macros. Barcode scanning, favorites system, and diet-aware generation. Shipped to the App Store.',
      techStack: ['React Native', 'Firebase', 'OpenAI', 'Node.js', 'iOS'],
      metrics: 'Live on App Store',
      link: 'https://lunchbox-gen.web.app',
      featured: true,
      order: 1,
    },
    {
      title: 'Portfolio Platform',
      category: 'founder',
      description: 'This site — statically exported Next.js app with Firebase Auth, Firestore-driven content, admin portal, and CI/CD via GitHub Actions to Firebase Hosting.',
      techStack: ['Next.js', 'React', 'TypeScript', 'Firebase', 'Tailwind CSS'],
      metrics: '',
      link: 'https://ernestomongesanchez.web.app',
      featured: true,
      order: 2,
    },
    {
      title: 'Ernesto Monge Consulting',
      category: 'consulting',
      description: 'Fractional CTO and architecture consulting — helping startups achieve architecture clarity, reduce infrastructure costs, execute MVPs, and build scaling foundations.',
      techStack: [],
      metrics: '',
      link: '',
      featured: true,
      order: 1,
    },
  ];

  const batch = db.batch();
  for (const p of projects) {
    const ref = db.collection('siteProjects').doc();
    batch.set(ref, { ...p, userId: uid, createdAt: ts });
  }
  await batch.commit();
  console.log('siteProjects seeded:', projects.length);
}

async function seedSiteMetrics() {
  const metrics = [
    { label: 'Years Experience', value: '10+', order: 1 },
    { label: 'Enterprise Clients', value: '7+', order: 2 },
    { label: 'Production Systems Deployed', value: '15+', order: 3 },
    { label: 'Real-Time Events / Month', value: '1M+', order: 4 },
  ];

  const batch = db.batch();
  for (const m of metrics) {
    const ref = db.collection('siteMetrics').doc();
    batch.set(ref, { ...m, userId: uid, updatedAt: ts });
  }
  await batch.commit();
  console.log('siteMetrics seeded:', metrics.length);
}

async function cleanDuplicates() {
  // Dedupe old projects collection
  for (const col of ['projects', 'ventures']) {
    const snap = await db.collection(col).get();
    const seen = {};
    const toDelete = [];
    const field = col === 'projects' ? 'title' : 'name';
    snap.docs.forEach(d => {
      const key = (d.data()[field] || '').toLowerCase().trim();
      if (seen[key]) toDelete.push(d.ref);
      else seen[key] = true;
    });
    if (toDelete.length > 0) {
      const batch = db.batch();
      toDelete.forEach(ref => batch.delete(ref));
      await batch.commit();
      console.log(col, `— deleted ${toDelete.length} duplicate(s)`);
    } else {
      console.log(col, '— no duplicates');
    }
  }
}

async function run() {
  await cleanDuplicates();
  await seedSections();
  await seedSiteProjects();
  await seedSiteMetrics();
  console.log('\n✅ Structural seed complete.');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
