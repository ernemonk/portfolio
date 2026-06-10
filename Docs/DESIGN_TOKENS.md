# Design System Quick Reference

**Portfolio Site - Design Tokens & Component Guide**

---

## 🎨 Colors

### Core Palette

```
Neutral (Backgrounds & Text)
  50:   #f9fafb  (lightest - not used in dark mode)
  100:  #f3f4f6  (lightest - not used in dark mode)
  400:  #9ca3af  (secondary text)
  500:  #6b7280  (muted text)
  800:  #1f2937  (card hover)
  900:  #111827  (cards)
  950:  #030712  (page background - #0a0a0a with new system)

Primary (Blue) - Main accent
  400:  #38bdf8  (sky-400)
  500:  #0ea5e9  (sky-500)
  600:  #0284c7  (sky-600)

Secondary (Purple) - Complementary
  400:  #a78bfa  (purple-400)
  500:  #8b5cf6  (purple-500)
  600:  #7c3aed  (purple-600)

Tertiary (Teal) - Supporting
  400:  #2dd4bf  (teal-400)
  500:  #14b8a6  (teal-500)
  600:  #0d9488  (teal-600)

Warm (Orange) - Energy
  400:  #f59e0b  (orange-400)
  500:  #f97316  (orange-500)
  600:  #ea580c  (orange-600)

Semantic Colors
  Success: #22c55e   (confirmations)
  Warning: #f97316   (alerts)
  Error:   #ef4444   (errors)
```

### Usage

```tsx
// Text colors
className="text-neutral-50"      // primary text (lightest)
className="text-neutral-100"     // secondary text
className="text-neutral-400"     // muted text
className="text-neutral-500"     // disabled text

// Backgrounds
className="bg-neutral-950"       // page background
className="bg-neutral-900"       // cards/surfaces
className="bg-neutral-800"       // elevated surfaces

// Accents
className="text-primary-400"     // links, highlights
className="text-secondary-500"   // secondary emphasis
className="text-tertiary-400"    // supporting color

// Semantic
className="text-success-400"     // success
className="text-warning-400"     // warning
className="text-error-400"       // error

// Borders
className="border-neutral-800"   // subtle border
className="border-primary-500/30" // accent border (with opacity)
```

---

## 🔤 Typography

### Font Stack

```
Sans: Inter, system-ui, sans-serif
Mono: 'JetBrains Mono', monospace
```

### Heading Hierarchy

```tsx
import { Heading } from "@/components/Heading";

// h1 - Page title
<Heading level="h1">Portfolio</Heading>
// 3.5rem / 56px, font-bold, line-height 1.2

// h2 - Section heading
<Heading level="h2">Featured Work</Heading>
// 2.25rem / 36px, font-bold, line-height 1.3

// h3 - Subsection
<Heading level="h3">Capability</Heading>
// 1.875rem / 30px, font-semibold, line-height 1.4

// h4 - Small heading
<Heading level="h4">Label</Heading>
// 1.5rem / 24px, font-semibold, line-height 1.4

// With gradient
<Heading level="h1" gradient>Ernesto Monge</Heading>
```

### Text Styles

```tsx
// Body paragraphs
className="text-base text-neutral-300 leading-relaxed"

// Large body
className="text-lg text-neutral-400"

// Small text
className="text-sm text-neutral-500"

// Labels/captions
className="text-xs text-neutral-600 font-mono uppercase"
```

---

## 🎯 Buttons

### Component Usage

```tsx
import { Button, LinkButton } from "@/components/Button";

// Primary button (default)
<Button>Send Message</Button>
<Button variant="primary" size="lg">Get Started</Button>

// Secondary button
<Button variant="secondary" size="md">Learn More</Button>

// Ghost button (subtle)
<Button variant="ghost">Skip</Button>

// Outline button (accent border)
<Button variant="outline" size="lg">View Details</Button>

// Link button
<LinkButton href="/work" variant="primary">
  View My Work
</LinkButton>

// Loading state
<Button isLoading>Processing...</Button>

// Full width
<Button fullWidth>Submit</Button>

// Disabled
<Button disabled>Unavailable</Button>
```

### Sizes

```
sm:  px-4 py-2 text-sm
md:  px-6 py-3 text-base (default)
lg:  px-8 py-4 text-lg
```

### Variants

```
primary:    bg-primary-500 hover:bg-primary-600
secondary:  border border-neutral-700 hover:border-primary-400
ghost:      text-neutral-300 hover:text-primary-400
outline:    border border-primary-500/30 text-primary-400
```

---

## 🃏 Cards

### Component Usage

```tsx
import { Card } from "@/components/Card";

// Standard card
<Card variant="glass">
  <h3>Title</h3>
  <p>Content</p>
</Card>

// Interactive card (hover effects)
<Card variant="glass" interactive>
  Clickable card
</Card>

// Elevated card (with shadow)
<Card variant="elevated">
  Prominent card
</Card>

// Default variant (no glass effect)
<Card variant="default">
  Simple card
</Card>
```

### Variants

```
glass:    Glass morphism + hover effects
default:  Subtle background with border
elevated: Card with shadow
```

---

## 📝 Forms

### Input Fields

```tsx
import { Input, Textarea } from "@/components/Input";

// Text input
<Input
  label="Name"
  type="text"
  placeholder="Your name"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

// Email input
<Input
  label="Email"
  type="email"
  placeholder="your@email.com"
  required
/>

// With error
<Input
  label="Username"
  error="Username already taken"
/>

// With helper text
<Input
  label="Password"
  type="password"
  helperText="At least 8 characters"
/>

// Textarea
<Textarea
  label="Message"
  rows={6}
  placeholder="Tell me more..."
/>
```

---

## 🏷️ Badges

### Component Usage

```tsx
import { Badge } from "@/components/Badge";

// Primary badge
<Badge variant="primary">Active</Badge>

// Success badge
<Badge variant="success">Completed</Badge>

// Warning badge
<Badge variant="warning">In Progress</Badge>

// Error badge
<Badge variant="error">Failed</Badge>

// Secondary badge
<Badge variant="secondary">Beta</Badge>
```

### Variants

```
primary:   bg-primary-500/20 text-primary-400
secondary: bg-secondary-500/20 text-secondary-400
success:   bg-success-500/20 text-success-400
warning:   bg-warning-500/20 text-warning-400
error:     bg-error-500/20 text-error-400
```

---

## 🎨 Effects

### Gradient Text

```tsx
// Rainbow gradient
<h1 className="text-gradient">Ernesto Monge</h1>

// Warm gradient (orange → red → pink)
<h2 className="text-gradient-warm">Powered Up</h2>
```

### Glow Effects

```tsx
// Subtle glow
<div className="glow-sm">Content</div>

// Medium glow
<div className="glow-md">Content</div>

// Hover glow
<div className="glow-hover">Hover me</div>
```

### Animations

```tsx
// Fade up animation
<div className="animate-fade-up">Animated in</div>

// Stagger children
<div className="stagger">
  <div>First item (0ms delay)</div>
  <div>Second item (80ms delay)</div>
  <div>Third item (160ms delay)</div>
</div>
```

---

## 📏 Spacing Scale

```
xs:   4px   (0.25rem)
sm:   8px   (0.5rem)
md:   16px  (1rem)
lg:   24px  (1.5rem)
xl:   32px  (2rem)
2xl:  48px  (3rem)
3xl:  64px  (4rem)
```

### Usage

```tsx
className="p-6"        // padding: 24px
className="px-6"       // padding-left/right: 24px
className="py-8"       // padding-top/bottom: 32px
className="mb-4"       // margin-bottom: 16px
className="gap-6"      // flex gap: 24px
```

---

## 🔘 Border Radius

```
xs:   4px   (0.25rem)
sm:   8px   (0.5rem)
md:   8px   (0.5rem) - default for most elements
lg:   12px  (0.75rem)
xl:   16px  (1rem)
full: 9999px - for circular elements
```

### Usage

```tsx
className="rounded-sm"      // 4px
className="rounded-md"      // 8px (buttons, cards)
className="rounded-lg"      // 12px (larger cards)
className="rounded-full"    // pill shape
```

---

## 🎯 Common Patterns

### Page Container

```tsx
<div className="container-max px-6 pt-32 pb-24">
  {/* Page content */}
</div>
```

### Section with Label

```tsx
<section className="container-max px-6 py-28">
  <p className="text-xs text-neutral-500 font-mono uppercase tracking-[0.3em] mb-12">
    Section Label
  </p>
  {/* Content */}
</section>
```

### Card Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item) => (
    <Card key={item.id} variant="glass">
      {/* Card content */}
    </Card>
  ))}
</div>
```

### Form Layout

```tsx
<form className="space-y-6 max-w-2xl">
  <Input label="Field" />
  <Textarea label="Message" />
  <Button fullWidth>Submit</Button>
</form>
```

---

## ♿ Accessibility

### Focus Visible (Automatic)

All focusable elements have:
```css
ring-2 ring-primary-500 ring-offset-2 ring-offset-neutral-950
```

### Keyboard Navigation

- Tab: Move forward through elements
- Shift+Tab: Move backward
- Enter: Activate buttons/links
- Space: Activate buttons
- Escape: Close modals

### Reduced Motion

Users who prefer reduced motion will not see staggered animations:

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

---

## 📱 Responsive Breakpoints

```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Usage

```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
className="text-lg md:text-2xl lg:text-3xl"
className="hidden md:block"
```

---

## 🚀 Quick Start Example

```tsx
import { Button, LinkButton } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input, Textarea } from "@/components/Input";
import { Badge } from "@/components/Badge";
import { Heading } from "@/components/Heading";

export default function Example() {
  return (
    <div className="container-max px-6 py-28">
      {/* Heading */}
      <Heading level="h2" gradient className="mb-8">
        Featured Work
      </Heading>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card variant="glass">
          <Badge variant="primary">Active</Badge>
          <h3 className="text-lg font-semibold text-neutral-50 mt-4">
            Project Title
          </h3>
          <p className="text-sm text-neutral-400 mt-2">
            Project description goes here.
          </p>
        </Card>
      </div>

      {/* Form */}
      <Card variant="elevated" className="max-w-2xl">
        <form className="space-y-6">
          <Input label="Name" placeholder="Your name" />
          <Textarea label="Message" placeholder="Tell me..." />
          <Button fullWidth variant="primary">
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
}
```

---

## 📚 More Info

See `/Docs/ARCHITECTURE.md` for:
- Complete data structures
- Component hierarchy
- Design philosophy
- Firestore schema
- Refactoring roadmap

---

**Last Updated:** June 9, 2026  
**Status:** Complete & Ready for Use
