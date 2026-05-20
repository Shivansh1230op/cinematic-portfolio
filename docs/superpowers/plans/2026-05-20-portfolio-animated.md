# Animated Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a two-section scroll-snap portfolio: fullscreen video intro that auto-advances to an animated hero section matching the reference design.

**Architecture:** Single Next.js page with CSS scroll-snap (100vh per section). Video `onEnded` fires smooth scroll to hero. GSAP timeline (triggered via IntersectionObserver) stagger-animates hero elements on enter. shadcn/ui for all interactive components. Full CSS token theming in globals.css.

**Tech Stack:** Next.js 16 (App Router), React 19, GSAP 3, shadcn/ui, Tailwind v4 (CSS-first, no tailwind.config.js)

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Modify | `app/globals.css` | All CSS tokens + shadcn var bridge + Tailwind v4 theme |
| Modify | `app/layout.js` | Metadata update (title, description) |
| Modify | `app/page.js` | Scroll container (snap mandatory), wires sections |
| Create | `lib/gsap.js` | GSAP import + plugin registration, SSR-safe |
| Create | `components/ui/Navbar.jsx` | Live IST clock, shadcn NavigationMenu + Button |
| Create | `components/sections/VideoIntro.jsx` | Fullscreen video, onEnded → scroll |
| Create | `components/sections/HeroSection.jsx` | Gradient hero, photo, GSAP stagger |
| Create | `jest.config.js` | Next.js jest config |
| Create | `jest.setup.js` | @testing-library/jest-dom setup |
| Create | `__tests__/Navbar.test.jsx` | Clock renders, email link |
| Create | `__tests__/VideoIntro.test.jsx` | Video attrs, onEnded callback |
| Create | `__tests__/HeroSection.test.jsx` | Name text, role text renders |

---

## Task 1: Install GSAP

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install GSAP**

```bash
cd "/run/media/vk-kali/File Storage/E/Web_dev/vaibhav-portfolio"
npm install gsap
```

Expected: `gsap` appears in `package.json` dependencies, no errors.

- [ ] **Step 2: Verify install**

```bash
node -e "require('gsap'); console.log('gsap ok')"
```

Expected output: `gsap ok`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install gsap"
```

---

## Task 2: Initialize shadcn/ui

**Files:**
- Create: `components.json`
- Modify: `app/globals.css` (shadcn injects CSS vars)
- Create: `lib/utils.js`

- [ ] **Step 1: Run shadcn init**

```bash
npx shadcn@latest init
```

When prompted:
- Which style? → **Default**
- Which color? → **Neutral**
- CSS variables? → **Yes**

> **Note:** shadcn@latest detects Tailwind v4 and uses CSS-first config. It will NOT create `tailwind.config.js`.

- [ ] **Step 2: Verify components.json exists**

```bash
cat components.json
```

Expected: JSON with `tailwind.cssVariables: true`, `rsc: true`, `tsx: false` (or confirm JS mode was detected).

- [ ] **Step 3: Add required components**

```bash
npx shadcn@latest add button navigation-menu
```

Expected: Creates `components/ui/button.jsx` and `components/ui/navigation-menu.jsx`.

- [ ] **Step 4: Commit**

```bash
git add components.json lib/utils.js components/ui/button.jsx components/ui/navigation-menu.jsx app/globals.css
git commit -m "chore: init shadcn, add button and navigation-menu components"
```

---

## Task 3: Set up theming system in globals.css

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Replace globals.css with full theming system**

Open `app/globals.css`. Replace its entire contents with:

```css
@import "tailwindcss";

/* ─── Brand tokens ─────────────────────────────────────── */
:root {
  /* Hero gradient — exact reference image */
  --hero-start: #f8d5b0;
  --hero-mid:   #f5954a;
  --hero-end:   #e85500;

  /* Accent */
  --accent:       #f7931e;
  --accent-hover: #e07b10;

  /* Text */
  --text-primary: #1a0800;
  --text-muted:   #4a2800;
  --text-on-dark: #f5f5f5;

  /* Surfaces */
  --surface-white: #ffffff;
  --surface-black: #0a0a0a;
  --surface-amber: #fff7ed;

  /* Navbar */
  --navbar-text:    #1a0800;
  --email-btn-bg:   #ffffff;
  --email-btn-text: #1a0800;

  /* Type scale */
  --hero-name-size: clamp(3.5rem, 9vw, 7.5rem);
  --hero-role-size: clamp(0.75rem, 1.2vw, 0.875rem);

  /* ─── shadcn var bridge (maps to brand tokens) ── */
  --background:   var(--surface-white);
  --foreground:   var(--text-primary);
  --primary:      var(--text-primary);
  --primary-foreground: var(--surface-white);
  --ring:         var(--accent);
  --radius:       9999px;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

/* ─── Base ──────────────────────────────────────────────── */
html, body {
  height: 100%;
  overflow: hidden;
}

body {
  background: var(--background);
  color:      var(--foreground);
  font-family: var(--font-geist-sans), Arial, sans-serif;
}
```

- [ ] **Step 2: Verify dev server still compiles**

```bash
npm run dev &
sleep 4
curl -s http://localhost:3000 | grep -q "html" && echo "ok" || echo "fail"
kill %1
```

Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add full CSS theming system with brand tokens"
```

---

## Task 4: Create GSAP lib file

**Files:**
- Create: `lib/gsap.js`

- [ ] **Step 1: Create lib/gsap.js**

```bash
mkdir -p "/run/media/vk-kali/File Storage/E/Web_dev/vaibhav-portfolio/lib"
```

Create `lib/gsap.js`:

```js
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export { gsap, ScrollTrigger }
```

- [ ] **Step 2: Commit**

```bash
git add lib/gsap.js
git commit -m "feat: add GSAP lib with ScrollTrigger registration"
```

---

## Task 5: Set up Jest + React Testing Library

**Files:**
- Create: `jest.config.js`
- Create: `jest.setup.js`
- Modify: `package.json` (test script)

- [ ] **Step 1: Install test dependencies**

```bash
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Create jest.config.js**

```js
const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

module.exports = createJestConfig({
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^gsap$': '<rootDir>/__mocks__/gsap.js',
    '^gsap/ScrollTrigger$': '<rootDir>/__mocks__/gsap.js',
  },
})
```

- [ ] **Step 3: Create jest.setup.js**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Create GSAP mock (prevents SSR/import errors in tests)**

```bash
mkdir -p __mocks__
```

Create `__mocks__/gsap.js`:

```js
const gsap = {
  registerPlugin: jest.fn(),
  fromTo: jest.fn(),
  timeline: jest.fn(() => ({
    fromTo: jest.fn().mockReturnThis(),
    play: jest.fn(),
    paused: jest.fn().mockReturnThis(),
  })),
  set: jest.fn(),
}
const ScrollTrigger = { create: jest.fn(), refresh: jest.fn() }
module.exports = { gsap, ScrollTrigger }
```

- [ ] **Step 5: Add test script to package.json**

Open `package.json`. In the `"scripts"` block, add:

```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 6: Verify jest runs**

```bash
npx jest --passWithNoTests
```

Expected: `Test Suites: 0 skipped` or similar, exit 0.

- [ ] **Step 7: Commit**

```bash
git add jest.config.js jest.setup.js __mocks__/gsap.js package.json package-lock.json
git commit -m "chore: set up Jest and React Testing Library"
```

---

## Task 6: Create Navbar component

**Files:**
- Create: `components/ui/Navbar.jsx`
- Create: `__tests__/Navbar.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `__tests__/Navbar.test.jsx`:

```jsx
import { render, screen, act } from '@testing-library/react'
import Navbar from '@/components/ui/Navbar'

jest.useFakeTimers()

const NAV_ITEMS = ['HOME', 'ABOUT', 'WORKS', 'SERVICES', 'EXPERIENCE']

describe('Navbar', () => {
  it('renders all nav items', () => {
    render(<Navbar />)
    NAV_ITEMS.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument()
    })
  })

  it('renders Email me button with mailto link', () => {
    render(<Navbar />)
    const btn = screen.getByRole('link', { name: /email me/i })
    expect(btn).toHaveAttribute('href', 'mailto:vaibhavkhush124@gmail.com')
  })

  it('renders INDIA TIME label', () => {
    render(<Navbar />)
    expect(screen.getByText(/INDIA TIME/i)).toBeInTheDocument()
  })

  it('updates clock every second', () => {
    render(<Navbar />)
    const before = screen.getByText(/INDIA TIME/i).textContent
    act(() => jest.advanceTimersByTime(1000))
    const after = screen.getByText(/INDIA TIME/i).textContent
    // Both should contain INDIA TIME; they may or may not differ depending on second boundary
    expect(after).toMatch(/INDIA TIME/)
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx jest __tests__/Navbar.test.jsx
```

Expected: FAIL — `Cannot find module '@/components/ui/Navbar'`

- [ ] **Step 3: Create Navbar.jsx**

Create `components/ui/Navbar.jsx`:

```jsx
'use client'

import { useEffect, useState } from 'react'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = ['HOME', 'ABOUT', 'WORKS', 'SERVICES', 'EXPERIENCE']

function getIST() {
  return new Date().toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).toUpperCase()
}

export default function Navbar() {
  const [time, setTime] = useState(getIST())

  useEffect(() => {
    const id = setInterval(() => setTime(getIST()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header
      className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4"
      style={{ color: 'var(--navbar-text)' }}
    >
      <span className="text-xs font-semibold tracking-widest uppercase">
        INDIA TIME – {time}
      </span>

      <NavigationMenu>
        <NavigationMenuList className="flex gap-6">
          {NAV_ITEMS.map(item => (
            <NavigationMenuItem key={item}>
              <NavigationMenuLink
                className="text-xs font-semibold tracking-widest uppercase cursor-pointer hover:opacity-60 transition-opacity"
                style={{ color: 'var(--navbar-text)' }}
              >
                {item}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      <Button
        asChild
        variant="outline"
        className="rounded-full text-xs font-semibold px-5 h-8"
        style={{
          background: 'var(--email-btn-bg)',
          color: 'var(--email-btn-text)',
          borderColor: 'transparent',
        }}
      >
        <a href="mailto:vaibhavkhush124@gmail.com">Email me</a>
      </Button>
    </header>
  )
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx jest __tests__/Navbar.test.jsx
```

Expected: PASS — 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add components/ui/Navbar.jsx __tests__/Navbar.test.jsx
git commit -m "feat: add Navbar with live IST clock and shadcn nav components"
```

---

## Task 7: Create VideoIntro section

**Files:**
- Create: `components/sections/VideoIntro.jsx`
- Create: `__tests__/VideoIntro.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `__tests__/VideoIntro.test.jsx`:

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import VideoIntro from '@/components/sections/VideoIntro'

describe('VideoIntro', () => {
  it('renders a video element', () => {
    render(<VideoIntro heroRef={{ current: null }} />)
    expect(screen.getByTestId('intro-video')).toBeInTheDocument()
  })

  it('video has autoPlay, muted, playsInline attrs', () => {
    render(<VideoIntro heroRef={{ current: null }} />)
    const video = screen.getByTestId('intro-video')
    expect(video).toHaveAttribute('autoPlay')
    expect(video).toHaveAttribute('muted')
    expect(video).toHaveAttribute('playsInline')
  })

  it('calls scrollIntoView on heroRef when video ends', () => {
    const scrollIntoView = jest.fn()
    const heroRef = { current: { scrollIntoView } }
    render(<VideoIntro heroRef={heroRef} />)
    fireEvent.ended(screen.getByTestId('intro-video'))
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx jest __tests__/VideoIntro.test.jsx
```

Expected: FAIL — `Cannot find module '@/components/sections/VideoIntro'`

- [ ] **Step 3: Create VideoIntro.jsx**

```bash
mkdir -p "/run/media/vk-kali/File Storage/E/Web_dev/vaibhav-portfolio/components/sections"
```

Create `components/sections/VideoIntro.jsx`:

```jsx
'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

export default function VideoIntro({ heroRef }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (!videoRef.current) return
    gsap.fromTo(videoRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' })
  }, [])

  function handleEnded() {
    heroRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      className="relative flex-shrink-0"
      style={{
        height: '100vh',
        scrollSnapAlign: 'start',
        background: '#000',
        overflow: 'hidden',
      }}
    >
      <video
        ref={videoRef}
        data-testid="intro-video"
        src="/assets/about-me.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleEnded}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </section>
  )
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx jest __tests__/VideoIntro.test.jsx
```

Expected: PASS — 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add components/sections/VideoIntro.jsx __tests__/VideoIntro.test.jsx
git commit -m "feat: add VideoIntro section with GSAP fade-in and onEnded scroll"
```

---

## Task 8: Create HeroSection

**Files:**
- Create: `components/sections/HeroSection.jsx`
- Create: `__tests__/HeroSection.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `__tests__/HeroSection.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { forwardRef } from 'react'
import HeroSection from '@/components/sections/HeroSection'

// next/image mock
jest.mock('next/image', () =>
  function MockImage({ alt, ...props }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} {...props} />
  }
)

describe('HeroSection', () => {
  it('renders first name', () => {
    render(<HeroSection />)
    expect(screen.getByText('Vaibhav')).toBeInTheDocument()
  })

  it('renders last name', () => {
    render(<HeroSection />)
    expect(screen.getByText('Khushalani')).toBeInTheDocument()
  })

  it('renders role text', () => {
    render(<HeroSection />)
    expect(screen.getByText('Software Developer')).toBeInTheDocument()
  })

  it('renders greeting', () => {
    render(<HeroSection />)
    expect(screen.getByText("Hi, I'm")).toBeInTheDocument()
  })

  it('renders location text', () => {
    render(<HeroSection />)
    expect(screen.getByText(/Based on India/)).toBeInTheDocument()
    expect(screen.getByText(/Available worldwide/)).toBeInTheDocument()
  })

  it('renders hero image', () => {
    render(<HeroSection />)
    expect(screen.getByAltText('Vaibhav Khushalani')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx jest __tests__/HeroSection.test.jsx
```

Expected: FAIL — `Cannot find module '@/components/sections/HeroSection'`

- [ ] **Step 3: Create HeroSection.jsx**

Create `components/sections/HeroSection.jsx`:

```jsx
'use client'

import { useEffect, useRef, forwardRef } from 'react'
import Image from 'next/image'
import Navbar from '@/components/ui/Navbar'
import { gsap } from '@/lib/gsap'

const HeroSection = forwardRef(function HeroSection(props, ref) {
  const sectionRef = useRef(null)
  const greetRef = useRef(null)
  const roleRef = useRef(null)
  const firstName = useRef(null)
  const lastName = useRef(null)
  const photoRef = useRef(null)
  const locationRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const targets = [
      greetRef.current,
      roleRef.current,
      firstName.current,
      lastName.current,
      locationRef.current,
    ].filter(Boolean)

    gsap.set(targets, { opacity: 0, y: 30 })
    if (photoRef.current) gsap.set(photoRef.current, { opacity: 0, x: 80 })

    const tl = gsap.timeline({ paused: true })
    tl.to(greetRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
      .to(roleRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
      .to(firstName.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.2')
      .to(lastName.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
      .to(photoRef.current, { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out' }, '-=0.5')
      .to(locationRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          tl.play()
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(section)

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={node => {
        sectionRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      style={{
        height: '100vh',
        scrollSnapAlign: 'start',
        background: 'linear-gradient(to bottom, var(--hero-start) 0%, var(--hero-mid) 55%, var(--hero-end) 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Navbar />

      {/* Photo — absolute right, full height */}
      <div
        ref={photoRef}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          height: '100%',
          width: '55%',
        }}
      >
        <Image
          src="/assets/hero.png"
          alt="Vaibhav Khushalani"
          fill
          priority
          style={{ objectFit: 'cover', objectPosition: 'center top' }}
        />
      </div>

      {/* Text content — left side */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingLeft: '3rem',
          paddingBottom: '4rem',
        }}
      >
        <p
          ref={greetRef}
          style={{
            fontSize: 'var(--hero-role-size)',
            fontWeight: 400,
            color: 'var(--text-primary)',
            marginBottom: '0.15rem',
            letterSpacing: '0.02em',
          }}
        >
          Hi, I&apos;m
        </p>
        <p
          ref={roleRef}
          style={{
            fontSize: 'var(--hero-role-size)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '0.75rem',
            letterSpacing: '0.02em',
          }}
        >
          Software Developer
        </p>

        <p
          ref={firstName}
          style={{
            fontSize: 'var(--hero-name-size)',
            fontWeight: 900,
            color: 'var(--text-primary)',
            lineHeight: 0.95,
            letterSpacing: '-0.03em',
          }}
        >
          Vaibhav
        </p>
        <p
          ref={lastName}
          style={{
            fontSize: 'var(--hero-name-size)',
            fontWeight: 900,
            color: 'var(--text-primary)',
            lineHeight: 0.95,
            letterSpacing: '-0.03em',
          }}
        >
          Khushalani
        </p>
      </div>

      {/* Location — bottom right */}
      <div
        ref={locationRef}
        style={{
          position: 'absolute',
          bottom: '2.5rem',
          right: '2rem',
          zIndex: 2,
          textAlign: 'right',
        }}
      >
        <p
          style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '0.05em',
          }}
        >
          Based on India*
        </p>
        <p
          style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '0.05em',
          }}
        >
          Available worldwide
        </p>
      </div>
    </section>
  )
})

export default HeroSection
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx jest __tests__/HeroSection.test.jsx
```

Expected: PASS — 6 tests passing.

- [ ] **Step 5: Commit**

```bash
git add components/sections/HeroSection.jsx __tests__/HeroSection.test.jsx
git commit -m "feat: add HeroSection with gradient, GSAP stagger, and photo layout"
```

---

## Task 9: Wire up page.js

**Files:**
- Modify: `app/page.js`
- Modify: `app/layout.js`

- [ ] **Step 1: Update layout.js metadata**

Open `app/layout.js`. Replace the `metadata` export:

```js
export const metadata = {
  title: 'Vaibhav Khushalani — Software Developer',
  description: 'Portfolio of Vaibhav Khushalani, Software Developer based in India, available worldwide.',
}
```

- [ ] **Step 2: Replace page.js with scroll container**

Open `app/page.js`. Replace its entire contents with:

```jsx
'use client'

import { useRef } from 'react'
import VideoIntro from '@/components/sections/VideoIntro'
import HeroSection from '@/components/sections/HeroSection'

export default function Home() {
  const heroRef = useRef(null)

  return (
    <main
      style={{
        height: '100vh',
        overflowY: 'scroll',
        scrollSnapType: 'y mandatory',
        scrollBehavior: 'smooth',
      }}
    >
      <VideoIntro heroRef={heroRef} />
      <HeroSection ref={heroRef} />
    </main>
  )
}
```

- [ ] **Step 3: Verify body/html don't double-scroll**

Open `app/layout.js`. Confirm `<body>` does NOT have `min-h-full flex flex-col` or any overflow — it should be plain:

```jsx
<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
  {children}
</body>
```

If it has `min-h-full` or `flex flex-col`, remove those classes.

Also confirm `globals.css` has:
```css
html, body {
  height: 100%;
  overflow: hidden;
}
```

This prevents double scrollbars — only the `<main>` scrolls.

- [ ] **Step 4: Commit**

```bash
git add app/page.js app/layout.js
git commit -m "feat: wire scroll-snap page with VideoIntro and HeroSection"
```

---

## Task 10: Update README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace README with project docs**

Open `README.md`. Replace its contents with:

```markdown
# Vaibhav Khushalani — Portfolio

Animated portfolio built with Next.js 16, GSAP, and shadcn/ui.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Animations:** GSAP 3
- **UI Components:** shadcn/ui (Tailwind v4)
- **Styling:** Tailwind CSS v4 (CSS-first, all tokens in `app/globals.css`)

## Structure

- `app/page.js` — scroll-snap container (100vh per section)
- `components/sections/VideoIntro.jsx` — fullscreen video intro
- `components/sections/HeroSection.jsx` — hero with GSAP stagger animations
- `components/ui/Navbar.jsx` — live IST clock + navigation
- `lib/gsap.js` — GSAP + ScrollTrigger registration
- `app/globals.css` — all CSS tokens (edit here to retheme)

## Assets

Place in `public/assets/`:
- `about-me.mp4` — intro video (autoplays, advances to hero on end)
- `hero.png` — portrait photo (right side of hero section)

## Dev

```bash
npm install
npm run dev
```

## Test

```bash
npm test
```

## Theming

All brand colors live in `:root` in `app/globals.css`. Change `--hero-start`, `--hero-mid`, `--hero-end` to retheme the gradient.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update README with portfolio project info"
```

---

## Task 11: Smoke test in browser

- [ ] **Step 1: Run dev server**

```bash
npm run dev
```

- [ ] **Step 2: Open http://localhost:3000**

Verify:
1. `about-me.mp4` autoplays fullscreen, muted
2. When video ends → smooth scroll to hero section fires
3. Hero section shows: gradient (peach → orange), Navbar with IST clock, "Hi, I'm / Software Developer", "Vaibhav / Khushalani", hero photo right side, "Based on India* / Available worldwide" bottom right
4. GSAP animations stagger in when hero section enters viewport
5. Manual scroll between sections snaps to 100vh boundaries

- [ ] **Step 3: Run full test suite**

```bash
npm test
```

Expected: All tests pass, 0 failures.

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: browser smoke test adjustments"
```

---

## Self-Review

**Spec coverage check:**
- ✅ CSS scroll-snap 100vh per section — Task 9
- ✅ Video intro fullscreen autoplay — Task 7
- ✅ Video `onEnded` → scroll to hero — Task 7
- ✅ GSAP element animations on hero enter — Task 8
- ✅ Exact reference gradient — Task 3 (`--hero-start/mid/end`)
- ✅ Navbar: IST clock, nav items, Email me button — Task 6
- ✅ shadcn Button + NavigationMenu — Tasks 2, 6
- ✅ No native `<button>`/`<nav>` — all shadcn
- ✅ Theming system in globals.css — Task 3
- ✅ GSAP client-only (useEffect) — Tasks 4, 7, 8
- ✅ `"use client"` on all interactive components — Tasks 6, 7, 8, 9
- ✅ `next/image` with `fill` for hero photo — Task 8
- ✅ README updated — Task 10
- ✅ Tests for all 3 components — Tasks 6, 7, 8

**No placeholders, no TBDs.**

**Type consistency:** `heroRef` prop name used consistently in Tasks 7 and 9. `forwardRef` in Task 8 matches usage in Task 9 (`ref={heroRef}`). GSAP mock in Task 5 matches import pattern in Tasks 4, 7, 8.
