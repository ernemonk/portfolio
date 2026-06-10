# Portfolio Architecture & Design System Analysis

**Date:** June 9, 2026  
**Project:** Ernesto Monge Portfolio Website  
**Status:** Complete Analysis & Refactoring Plan Ready

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Current Tech Stack](#current-tech-stack)
3. [Firestore Data Architecture](#firestore-data-architecture)
4. [Page Structure & Routes](#page-structure--routes)
5. [Component Hierarchy](#component-hierarchy)
6. [Current Design System Analysis](#current-design-system-analysis)
7. [Issues & Inconsistencies](#issues--inconsistencies)
8. [Proposed Design System](#proposed-design-system)
9. [Refactoring Strategy](#refactoring-strategy)
10. [Implementation Roadmap](#implementation-roadmap)

---

## Project Overview

### Purpose
A professional portfolio website showcasing:
- Expertise in full-stack engineering (10+ years)
- Multiple work items: ventures, projects, experiments, consulting
- Personal bio and professional narrative
- Contact channel for inquiries
- Protected portal for internal dashboard (future)

### Key Characteristics
- **Type:** Static Site with Dynamic Content (Next.js 14 with SSR/SSG)
- **CMS:** Firestore (Firebase)
- **Hosting:** Firebase (implied by configuration)
- **Authentication:** Firebase Auth (with portal protection)
- **Design:** Dark mode, glassmorphic UI with gradients
- **Performance Focus:** SEO-optimized (metadata, static generation)

---

## Current Tech Stack

### Frontend Framework
- **Next.js 14.2.20** - App Router (React 18.3.1)
- **TypeScript 5** - Type safety
- **Tailwind CSS 3.4.4** - Utility-first styling
- **Framer Motion 12.35.1** - Animations
- **React Markdown 10.1.0** - Content rendering (with rehype-raw, remark-gfm)

### Backend & Data
- **Firebase 10.12.2** - Client SDK
- **Firebase Admin 13.7.0** - Server SDK
- **Firestore** - NoSQL database
- **Firebase Auth** - Authentication
- **Firebase Storage** - File storage
- **Firebase Analytics** - Telemetry

### UI & Icons
- **Lucide React 1.7.0** - Icon library
- **Sonner 2.0.7** - Toast notifications
- **@tailwindcss/typography** - Prose styling
- **@xyflow/react 12.10.1** - Graph/flow visualization (currently unused)

### Utilities
- **jsPDF 4.2.1** - PDF generation (resume export?)
- **html2pdf.js 0.14.0** - HTML to PDF conversion

### Build & Dev
- **PostCSS 8.4.38** - CSS transformation
- **Autoprefixer** - Browser compatibility
- **ESLint 8** - Code quality

---

## Firestore Data Architecture

### Collections & Documents

#### 1. **`sections/`** Collection
Stores homepage structural content—single documents per section:

```
sections/hero
├── name: string
├── tagline: string
├── subtext: string
├── cta1Label: string
├── cta1Href: string
├── cta2Label: string
└── cta2Href: string

sections/capabilities
├── blocks[]: array
│   ├── title: string
│   └── description: string

sections/currentFocus
├── title: string
└── items[]: array[string]
```

**Status:** Used in `fetchHeroSection()`, `fetchCapabilities()`, `fetchCurrentFocus()`

#### 2. **`bio/`** Collection
Owner biographical information:

```
bio/{OWNER_UID}
├── name: string
├── headline: string
├── shortIntro: string
├── longBio: string
└── photos[]: array[string] (image URLs)
```

**Status:** Used in About page, metadata fallback

#### 3. **`workItems/`** Collection
Unified collection replacing legacy Ventures, Projects, Experiments:

```
workItems/{id}
├── userId: string (OWNER_UID)
├── name: string
├── description: string
├── type: "venture" | "project" | "experiment" | "client"
├── category: string
├── tags: string[]
├── status: "active" | "in-development" | "completed" | "archived" | "building" | "scaling" | "research" | "exited"
├── owned: boolean
├── role: string
├── website: string (URL)
├── logoURL: string
├── techStack: string[]
├── metrics: string
├── images: string[] (URLs)
├── featured: boolean
├── order: number (sort order)
└── createdAt: timestamp
```

**Status:** Used in homepage (featured items), work page, portfolio display

#### 4. **`siteMetrics/`** Collection
Performance/achievement statistics for homepage bar:

```
siteMetrics/{id}
├── userId: string
├── label: string
├── value: string
└── order: number
```

**Status:** Used in `MetricsBar` component

#### 5. **`messages/`** Collection
Contact form submissions (portal-access only):

```
messages/{id}
├── userId: string (owner)
├── name: string
├── email: string
├── message: string
├── createdAt: timestamp
├── read: boolean
├── reply: string (optional)
└── repliedAt: timestamp (optional)
```

**Status:** Used in Contact page

#### 6. **`users/`** Collection
User accounts (for future portal/multi-user):

```
users/{uid}
├── email: string
├── displayName: string
├── photoURL: string
├── role: string
└── createdAt: timestamp
```

**Status:** Created by `ensureUserDoc()` on auth

---

## Page Structure & Routes

### Public Pages

| Route | File | Component | Data Source | Status |
|-------|------|-----------|-------------|--------|
| `/` | `app/page.tsx` | Hero, Capabilities, SelectedWork, MetricsBar, CurrentFocus | Firestore (sections, workItems, metrics) | ✅ Active |
| `/about` | `app/about/page.tsx` | Bio, principles grid | Firestore (bio) | ✅ Active |
| `/work` | `app/work/page.tsx` | WorkGrid (all items) | Firestore (workItems) | ✅ Active |
| `/resume` | `app/resume/page.tsx` | PDF/markdown resume | TBD | ❓ Unclear |
| `/contact` | `app/contact/page.tsx` | ContactForm | Firestore (messages) | ✅ Active |
| `/privacy` | `app/privacy/page.tsx` | Privacy policy text | Static HTML | ✅ Active |

### Protected Portal Routes (Future)

| Route | File | Component | Purpose |
|-------|------|-----------|---------|
| `/portal` | `app/portal/layout.tsx` | PortalShell layout | Auth wrapper |
| `/portal/dashboard` | `app/portal/dashboard/page.tsx` | Dashboard | Owner dashboard |
| `/portal/bio` | `app/portal/bio/page.tsx` | Bio editor | Edit bio section |
| `/portal/messages` | `app/portal/messages/page.tsx` | Message viewer | Read/reply to messages |
| `/portal/work` | `app/portal/work/page.tsx` | Work editor | Manage work items |
| `/portal/login` | `app/portal/login/page.tsx` | Login form | Firebase auth |
| `/portal/signup` | `app/portal/signup/page.tsx` | Signup form | Registration (disabled?) |

---

## Component Hierarchy

### Layout Components

```
RootLayout (app/layout.tsx)
├── Nav (Header + mobile menu)
├── main (children)
└── Footer
```

### Page-Level Components

#### Homepage (`app/page.tsx`)
- **Hero** - Hero section with name, tagline, CTA buttons
- **CapabilityBlocks** - 3-column grid of capabilities
- **SelectedWork** - Work items grouped by type with cards
- **MetricsBar** - Statistics display (achievements)
- **CurrentFocus** - Current focus areas list

#### About (`app/about/page.tsx`)
- Photo gallery (if photos available)
- Principles grid (4-item grid, 2 columns on desktop)
- Bio text sections

#### Work (`app/work/page.tsx`)
- **WorkGrid** - Grid of all work items (grouped by type)

#### Contact (`app/contact/page.tsx`)
- **ContactForm** - Form with name, email, message fields

### Reusable Components

| Component | Location | Purpose | Props |
|-----------|----------|---------|-------|
| **Nav** | `components/Nav.tsx` | Navigation bar | None |
| **Footer** | `components/Footer.tsx` | Footer | None |
| **Hero** | `components/Hero.tsx` | Hero section | `{ data: HeroSection \| null }` |
| **CapabilityBlocks** | `components/CapabilityBlocks.tsx` | Capability grid | `{ data: CapabilitiesSection \| null }` |
| **SelectedWork** | `components/SelectedWork.tsx` | Work grid (featured) | `{ items: WorkItem[] }` |
| **MetricsBar** | `components/MetricsBar.tsx` | Metrics display | `{ metrics: SiteMetric[] }` |
| **CurrentFocus** | `components/CurrentFocus.tsx` | Focus list | `{ data: CurrentFocusSection \| null }` |
| **WorkCard** | `components/WorkCard.tsx` | Individual work item | `{ item: WorkItem }` |
| **WorkGrid** | `components/WorkGrid.tsx` | All work items grid | `{ items: WorkItem[] }` |
| **VentureCard** | `components/VentureCard.tsx` | Legacy venture display | TBD |
| **ContactForm** | `app/contact/ContactForm.tsx` | Contact form | None |
| **PortalShell** | `components/portal/PortalShell.tsx` | Portal layout wrapper | `{ children }` |

---

## Current Design System Analysis

### Color Palette

#### Backgrounds
- **Primary Background:** `#0a0a0a` (near-black)
- **Secondary:** `#0a0a0a/80` (with opacity)
- **Tertiary (Glass):** `rgba(255, 255, 255, 0.03)` + blur

#### Text Colors
- **Primary Text:** `#ffffff` (white)
- **Secondary Text:** `#ffffff/70` or `#ffffff/60`
- **Tertiary Text:** `#ffffff/40` or `#ffffff/30`
- **Muted:** `#ffffff/20`

#### Accent Colors
- **Primary Accent:** Sky blue - `#38bdf8` (Tailwind `sky-400`)
- **Secondary Accent:** Indigo - `#818cf8` (Tailwind `indigo-500`)
- **Tertiary Accent:** Purple - `#c084fc` (Tailwind `purple-400`)
- **Success/Owned:** Emerald - `#34d399` (Tailwind `emerald-400`)
- **Green (Resume):** `#4ade80` (Tailwind `green-500`)
- **Warm Gradient:** Orange → Red → Pink

#### Border/Divider Colors
- **Primary Border:** `rgba(255, 255, 255, 0.06)` or `rgba(255, 255, 255, 0.10)`
- **Hover Border:** `rgba(255, 255, 255, 0.20)`
- **Accent Border:** `rgba(56, 189, 248, 0.3)` (sky-500 @ 30%)

### Typography

#### Font Family
- **Primary:** Inter (system-ui, sans-serif)
- **Size Scale:** 
  - Large headings: `text-8xl` / `text-9xl` (Hero)
  - Section titles: `text-5xl` / `text-6xl`
  - Card titles: `text-lg`
  - Body text: `text-base` / `text-sm`
  - Labels: `text-xs`

#### Font Weights
- **Bold:** 700 (`font-bold`)
- **Semibold:** 600 (`font-semibold`)
- **Medium:** 500 (`font-medium`)
- **Regular:** 400 (default)

#### Line Heights
- **Tight:** `leading-none` (headings)
- **Relaxed:** `leading-relaxed` (body)

### Component Patterns

#### Glass Card Pattern
```css
.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
```

#### Gradient Text
```css
.text-gradient {
  background: linear-gradient(135deg, #38bdf8, #818cf8, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

#### Glow Effects
```css
.glow-sm { box-shadow: 0 0 20px -5px rgba(56, 189, 248, 0.15); }
.glow-hover:hover { box-shadow: 0 0 30px -5px rgba(56, 189, 248, 0.25); }
```

#### Animations
- **Fade Up:** Custom `@keyframes fadeUp` (0.6s ease-out)
- **Stagger:** `animation-delay` by child index (80ms increments)
- **Hover Transitions:** `duration-300` / `duration-500`

#### Border Radius
- Cards: `rounded-2xl` (16px)
- Pills/Buttons: `rounded-full`
- Small elements: `rounded-xl` (12px)

### Utilities Present
- `.dot-grid` - Dotted background pattern
- `.gradient-line` - Horizontal gradient line divider
- `.tab-active::after` - Underline indicator (incomplete in current CSS)
- `.stagger > *` - Child stagger animation setup

---

## Issues & Inconsistencies

### 1. **Color Scheme Problems**
- ❌ **Monotonous Accents:** Over-reliance on sky-blue (#38bdf8)
- ❌ **Limited Palette:** Only 3 primary accent colors (sky, indigo, purple) + emerald/green
- ❌ **Contrast Issues:** White/70 on dark background passes WCAG AA, but white/40 on dark is risky
- ❌ **No Secondary Colors:** Lack of supporting colors for alerts, warnings, states
- ❌ **Warm Gradient Unused:** `.text-gradient-warm` defined but not used anywhere

### 2. **Component Inconsistencies**
- ❌ **WorkCard vs VentureCard:** Duplicated logic, different implementations
- ❌ **Form Inputs:** ContactForm has custom styling that differs from portal forms
- ❌ **Button Styles:** CTA buttons in Hero hardcoded, not using component
- ❌ **Spacing:** Inconsistent padding/margin across sections (some `px-6`, some inline)
- ❌ **Card Styling:** Glass cards used inconsistently (CapabilityBlocks vs SelectedWork)

### 3. **Typography Issues**
- ❌ **No Type Scale Defined:** Font sizes scattered across components
- ❌ **Inconsistent Font Weights:** Some titles use bold, others semibold
- ❌ **Line Height Variations:** No standard line-height system
- ❌ **No Heading Hierarchy:** h1-h6 not semantically used

### 4. **Layout Problems**
- ❌ **Max-width Not Consistent:** Most use `max-w-6xl`, but some use `max-w-4xl`
- ❌ **Padding Inconsistency:** Desktop uses `px-6`, but no clear mobile breakpoint strategy
- ❌ **Section Spacing:** `py-28` used everywhere; no variation for visual hierarchy
- ❌ **No Grid System:** Manual grid definitions in each component

### 5. **Accessibility Issues**
- ⚠️ **Contrast:** `text-white/40` is below WCAG AA standards
- ⚠️ **Focus States:** No visible focus indicators on interactive elements
- ⚠️ **Semantic HTML:** Some buttons are divs, links styled as buttons
- ⚠️ **Skip Links:** No skip-to-content link
- ⚠️ **Keyboard Navigation:** No trap management in modals

### 6. **Animation & Performance**
- ⚠️ **Overuse of Animations:** Every component has `.animate-fade-up`, may cause layout thrashing
- ⚠️ **No Reduced Motion:** No `prefers-reduced-motion` support
- ⚠️ **Stagger Delays:** Hard-coded to 9 children; breaks with more items

### 7. **Page-Level Issues**
- ❌ **Resume Page:** Implementation unclear (PDF export? Markdown?)
- ❌ **Work Page:** No filtering/sorting; flat grid
- ❌ **Portal Pages:** Mostly structure, no content/functionality
- ❌ **Privacy Page:** No content shown in analysis

### 8. **Firestore & Data Issues**
- ⚠️ **Legacy Types Coexist:** Venture, Project, Experiment types alongside WorkItem (migration incomplete)
- ⚠️ **No Validation:** No schema validation in Firestore
- ⚠️ **Order Field:** Only in workItems, but other collections may need ordering
- ⚠️ **Optional Fields:** Too many optional fields; unclear required schema

---

## Proposed Design System

### 1. **New Color Palette**

#### Neutral Scale (Background & Text)
```
Neutrals:
- bg-neutral-950: #0a0a0a (darkest)
- bg-neutral-900: #121212
- bg-neutral-800: #1a1a1a
- text-neutral-50: #f9fafb
- text-neutral-100: #f3f4f6
- text-neutral-400: #9ca3af
- text-neutral-500: #6b7280
```

#### Accent System (Primary)
```
Primary (Blue) - Main CTA & Highlights:
- primary-50:  #f0f9ff
- primary-400: #38bdf8 ← Main
- primary-500: #0ea5e9
- primary-600: #0284c7

Secondary (Purple) - Complementary:
- secondary-400: #a78bfa
- secondary-500: #8b5cf6 ← Main

Tertiary (Teal) - Accents & Highlights:
- tertiary-400: #2dd4bf ← New!
- tertiary-500: #14b8a6

Warm (for CTAs & Energy):
- warm-400: #f59e0b
- warm-500: #f97316
```

#### Semantic Colors
```
Success (Green):
- success-400: #4ade80 ← Keep
- success-500: #22c55e

Warning (Orange):
- warning-400: #fb923c
- warning-500: #f97316

Error (Red):
- error-400: #f87171
- error-500: #ef4444

Info (Blue):
- info-400: #38bdf8
- info-500: #0ea5e9
```

### 2. **Design Tokens**

#### Spacing Scale
```
xs: 4px    (0.25rem)
sm: 8px    (0.5rem)
md: 16px   (1rem)
lg: 24px   (1.5rem)
xl: 32px   (2rem)
2xl: 48px  (3rem)
3xl: 64px  (4rem)
```

#### Border Radius
```
sm: 4px (0.25rem)
md: 8px (0.5rem)
lg: 12px (0.75rem)
xl: 16px (1rem)
full: 9999px (rounded-full)
```

#### Typography Scale
```
Headings:
- h1: 3.5rem / 56px (font-bold, line-height 1.2)
- h2: 2.25rem / 36px (font-bold, line-height 1.3)
- h3: 1.875rem / 30px (font-semibold, line-height 1.4)
- h4: 1.5rem / 24px (font-semibold, line-height 1.4)

Body:
- lg: 1.125rem / 18px (line-height 1.5)
- base: 1rem / 16px (line-height 1.5)
- sm: 0.875rem / 14px (line-height 1.5)
- xs: 0.75rem / 12px (line-height 1.4)

Mono (for labels, code):
- mono-base: 0.875rem / 14px (font-mono, letter-spacing 0.05em)
- mono-sm: 0.75rem / 12px (font-mono, letter-spacing 0.075em)
```

#### Shadow Scale
```
sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
glow-sm: 0 0 20px -5px rgba(56, 189, 248, 0.15)
glow-md: 0 0 30px -5px rgba(56, 189, 248, 0.25)
```

#### Animation Tokens
```
Durations:
- fast: 150ms
- normal: 300ms
- slow: 500ms
- slower: 700ms

Easing:
- ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
- ease-out: cubic-bezier(0, 0, 0.2, 1)
```

### 3. **Component Design Specs**

#### Cards
```
- Background: bg-neutral-900 with optional glass effect
- Border: 1px border-neutral-800 (default) or border-primary-500/20 (hover)
- Radius: rounded-lg (12px)
- Padding: p-6 (24px)
- Hover: scale-105, border-primary-400/30, shadow-lg
- Transition: duration-300 ease-out
```

#### Buttons
```
Primary Button:
- Background: bg-primary-500
- Text: text-white font-semibold
- Padding: px-6 py-3 (24px x 12px)
- Radius: rounded-lg
- Hover: bg-primary-600
- Focus: ring-2 ring-primary-400 ring-offset-2

Secondary Button:
- Background: transparent
- Border: border border-neutral-700
- Text: text-neutral-100
- Hover: border-primary-400 text-primary-400
```

#### Form Inputs
```
- Background: bg-neutral-800
- Border: border border-neutral-700
- Text: text-neutral-50
- Focus: border-primary-400 ring-primary-400/10
- Placeholder: text-neutral-500
- Padding: px-4 py-3
```

#### Typography
```
Headings:
- Color: text-neutral-50
- Font-weight: font-bold (h1, h2), font-semibold (h3, h4)
- Margin-bottom: varies by size (h1: mb-8, h2: mb-6, h3: mb-4)

Body:
- Color: text-neutral-300 (primary), text-neutral-500 (secondary)
- Line-height: leading-relaxed
```

---

## Refactoring Strategy

### Phase 1: Design System Foundation
**Duration:** 1-2 hours
1. Update `tailwind.config.ts` with new color palette & design tokens
2. Create `styles/design-tokens.css` for custom properties
3. Update `globals.css` with new component classes
4. Define `.btn-primary`, `.btn-secondary`, `.card`, `.input` base classes

### Phase 2: Global CSS Overhaul
**Duration:** 1-2 hours
1. Refactor `globals.css` for consistency
2. Update all utility classes with new colors
3. Add accessibility patterns (focus states, reduced motion)
4. Remove unused utilities; consolidate duplicates

### Phase 3: Component Refactoring
**Duration:** 3-4 hours
1. Create reusable component library:
   - `Button.tsx` (primary, secondary, tertiary variants)
   - `Card.tsx` (base card with optional glass effect)
   - `Input.tsx` (form input wrapper)
   - `Badge.tsx` (tag/status display)
   - `Heading.tsx` (h1-h6 with consistent styling)

2. Refactor existing components:
   - **Nav.tsx** - Update button styles, add focus states
   - **Hero.tsx** - Consolidate button logic, use Button component
   - **CapabilityBlocks.tsx** - Use Card component
   - **SelectedWork.tsx** - Refactor cards, add Badge for status
   - **ContactForm.tsx** - Use Input component, new Button styles

3. Consolidate:
   - Merge WorkCard + VentureCard → unified WorkCard
   - Extract common form patterns

### Phase 4: Page Refactoring
**Duration:** 2-3 hours
1. Audit all pages for consistency
2. Update spacing/padding to use token scale
3. Fix accessibility (heading hierarchy, focus indicators)
4. Ensure metadata consistency

### Phase 5: Testing & Validation
**Duration:** 1-2 hours
1. Test all pages for visual consistency
2. Check responsive behavior (mobile, tablet, desktop)
3. Validate accessibility (WCAG AA)
4. Performance check (no layout shifts)

---

## Implementation Roadmap

### Immediate Actions (This Session)

1. ✅ Create architecture document (this file)
2. ⏳ **Update tailwind.config.ts** with new palette
3. ⏳ **Refactor globals.css** with new design system
4. ⏳ **Create base components** (Button, Card, Input, Badge, Heading)
5. ⏳ **Refactor Nav & Footer** to use new system
6. ⏳ **Refactor Hero component** with new colors/styles
7. ⏳ **Refactor all cards** (Capabilities, SelectedWork, Contact)
8. ⏳ **Update all pages** for consistency

### Key Principles

- ✅ **One source of truth:** Tailwind + design tokens
- ✅ **Component-first:** Reusable, tested components
- ✅ **Accessibility first:** WCAG AA compliance from start
- ✅ **Performance:** No layout shifts, optimized animations
- ✅ **Mobile-first:** Responsive by default
- ✅ **Dark mode ready:** Current dark mode extended with new palette

---

## Success Metrics

- ✅ All pages use consistent color palette
- ✅ No hardcoded colors in components (only Tailwind classes)
- ✅ All cards/buttons follow unified design
- ✅ WCAG AA contrast compliance across entire site
- ✅ Reduced code duplication (components vs repeated logic)
- ✅ Consistent spacing/sizing across all sections
- ✅ No visual breaks in responsive design
- ✅ Smooth animations without layout thrashing

---

## Appendix: File Inventory

### Components to Refactor
```
components/
├── Nav.tsx (header) - UPDATE
├── Footer.tsx - UPDATE
├── Hero.tsx - REFACTOR
├── CapabilityBlocks.tsx - REFACTOR
├── SelectedWork.tsx - REFACTOR
├── MetricsBar.tsx - UPDATE
├── CurrentFocus.tsx - UPDATE
├── WorkCard.tsx - CONSOLIDATE
├── WorkGrid.tsx - UPDATE
├── VentureCard.tsx - CONSOLIDATE
└── portal/
    └── PortalShell.tsx - CREATE
```

### Pages to Audit
```
app/
├── page.tsx (home) - AUDIT
├── about/page.tsx - UPDATE
├── contact/ContactForm.tsx - REFACTOR
├── contact/page.tsx - UPDATE
├── work/page.tsx - UPDATE
├── resume/page.tsx - CLARIFY
└── privacy/page.tsx - AUDIT
```

### Styles to Create
```
app/
├── globals.css - REFACTOR (large overhaul)

styles/ (NEW)
├── design-tokens.css (NEW)
└── components.css (NEW)
```

### New Components to Create
```
components/
├── Button.tsx (NEW)
├── Card.tsx (NEW)
├── Input.tsx (NEW)
├── Badge.tsx (NEW)
└── Heading.tsx (NEW)
```

---

**Document Generated:** June 9, 2026  
**Next Steps:** Begin with Phase 1 - Design System Foundation
