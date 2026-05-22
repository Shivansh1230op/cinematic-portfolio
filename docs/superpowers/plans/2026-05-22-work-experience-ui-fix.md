# Work Experience UI Fix + Smooth Animation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the Work Experience section visibility bug and add smooth GSAP scroll-scrub animations with particle bursts on slide transitions.

**Architecture:** Replace ScrollTrigger `pin:true` with CSS `position:sticky` inside a `n×100vh` wrapper div. Fix canvas z-index so particles render behind slide content. Replace the inline Three.js code with the existing `WorkExpParticles` component (after fixing its O(n²) line geometry bug). Enhance the GSAP timeline with clip-path reveals, staggered bullets, and blur exits.

**Tech Stack:** Next.js 15, React 18, GSAP 3 (ScrollTrigger), Three.js, CSS Modules

---

## File Map

| File | Change |
|------|--------|
| `components/three/WorkExpParticles.jsx` | Fix O(n²): replace per-frame `new THREE.Line` creation with pre-allocated `LineSegments` geometry |
| `app/page.js` | Remove explicit `height:'600vh'` from wrapper div (children sum to 600vh naturally) |
| `styles/sections/WorkExperienceSection.module.css` | `.section` → `position:sticky; top:0`, `.canvas` → `z-index:0` |
| `components/sections/WorkExperienceSection.jsx` | Sticky wrapper div, remove `pin`/`pinSpacing`, `scrub:1`, enhanced timeline, `WorkExpParticles` integration, `slideIdx` state |

---

## Task 1: Fix WorkExpParticles O(n²) line geometry

**Files:**
- Modify: `components/three/WorkExpParticles.jsx`

**What's wrong:** In the `animate()` loop, for every pair of close particles, it calls `new THREE.BufferGeometry()` and `scene.add(new THREE.Line(...))`. On a 140-particle system that can be thousands of allocations per frame at 60fps. It also removes and disposes lines each frame, causing GC pressure.

**Fix:** Pre-allocate a single `THREE.LineSegments` with a `MAX_LINES * 6` float buffer, update positions in-place each frame, set `drawRange` to the actual connection count.

- [ ] **Step 1: Replace line geometry setup in WorkExpParticles.jsx**

Replace the `lineMat` declaration and the `scene.children.filter(c => c.isLine)...` block in `animate()` with the following. Make these changes inside the `useEffect` boot block:

```jsx
// After `scene.add(points)`, add:
const MAX_LINES = 60
const linePositions = new Float32Array(MAX_LINES * 6)
const lineGeo = new THREE.BufferGeometry()
lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
lineGeo.setDrawRange(0, 0)
const lineMat = new THREE.LineBasicMaterial({
  color:       ACCENT,
  transparent: true,
  opacity:     0.07,
})
const lineSegs = new THREE.LineSegments(lineGeo, lineMat)
scene.add(lineSegs)
```

- [ ] **Step 2: Replace per-frame line creation inside `animate()`**

Remove this block from `animate()`:
```js
scene.children
  .filter(c => c.isLine)
  .forEach(l => { scene.remove(l); l.geometry.dispose() })

const LINK_DIST = 80
for (let i = 0; i < COUNT; i++) {
  for (let j = i + 1; j < COUNT; j++) {
    const dx = pos[i * 3] - pos[j * 3]
    const dy = pos[i * 3 + 1] - pos[j * 3 + 1]
    if (dx * dx + dy * dy < LINK_DIST * LINK_DIST) {
      const lg = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(pos[i * 3], pos[i * 3 + 1], 0),
        new THREE.Vector3(pos[j * 3], pos[j * 3 + 1], 0),
      ])
      scene.add(new THREE.Line(lg, lineMat))
    }
  }
}
```

Replace with:
```js
const LINK_DIST = 80
let lc = 0
outer: for (let i = 0; i < COUNT; i++) {
  for (let j = i + 1; j < COUNT; j++) {
    const dx = pos[i * 3] - pos[j * 3]
    const dy = pos[i * 3 + 1] - pos[j * 3 + 1]
    if (dx * dx + dy * dy < LINK_DIST * LINK_DIST) {
      linePositions[lc * 6]     = pos[i * 3]
      linePositions[lc * 6 + 1] = pos[i * 3 + 1]
      linePositions[lc * 6 + 2] = 0
      linePositions[lc * 6 + 3] = pos[j * 3]
      linePositions[lc * 6 + 4] = pos[j * 3 + 1]
      linePositions[lc * 6 + 5] = 0
      if (++lc >= MAX_LINES) break outer
    }
  }
}
lineGeo.attributes.position.needsUpdate = true
lineGeo.setDrawRange(0, lc * 2)
```

- [ ] **Step 3: Change WorkExpParticles div zIndex from 1 to 2**

In the `return` JSX of `WorkExpParticles.jsx`, find:
```jsx
<div
  ref={mountRef}
  style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}
/>
```

Change to:
```jsx
<div
  ref={mountRef}
  style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}
/>
```

**Why:** WorkExpParticles div and track both start at z-index:1. When two elements share z-index, DOM order wins — WorkExpParticles renders first, so it is BEHIND track and invisible. z-index:2 puts it in front of track (z-index:1). Since the Three.js canvas inside is transparent (alpha:true, clearColor alpha=0), slide text shows through. Particles appear as a floating ambient layer above backgrounds.

- [ ] **Step 4: Update cleanup in return block**

In the `useEffect` return (cleanup), add `lineGeo.dispose()` alongside the existing `lineMat.dispose()`:

```js
return () => {
  cancelAnimationFrame(animId)
  window.removeEventListener('resize', onResize)
  geometry.dispose()
  material.dispose()
  lineGeo.dispose()
  lineMat.dispose()
  renderer.dispose()
  if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
}
```

- [ ] **Step 4: Commit**

```bash
git add components/three/WorkExpParticles.jsx
git commit -m "perf: fix O(n²) line geometry allocation and z-index in WorkExpParticles"
```

---

## Task 2: Remove explicit wrapper height from page.js

**Files:**
- Modify: `app/page.js`

The 600vh wrapper height was needed when WorkExperienceSection was 100vh. After Task 3, WorkExperienceSection will render its own 300vh wrapper (3 companies × 100vh), so the explicit `height:'600vh'` must be removed — otherwise total height becomes 900vh and scroll indices break.

- [ ] **Step 1: Verify current child heights**

VideoIntro = 100vh, HeroSection = 100vh, AboutSection = 100vh, WorkExperienceSection wrapper (after Task 3) = 300vh → sum = 600vh. No explicit height needed.

- [ ] **Step 2: Remove height from wrapper div in page.js**

Find this in `app/page.js`:
```jsx
<div style={{ height: '600vh' }}>
  <VideoIntro />
  <HeroSection />
  <AboutSection />
  <WorkExperienceSection />
</div>
```

Change to:
```jsx
<div>
  <VideoIntro />
  <HeroSection />
  <AboutSection />
  <WorkExperienceSection />
</div>
```

- [ ] **Step 3: Commit**

```bash
git add app/page.js
git commit -m "fix: remove explicit 600vh height from page wrapper"
```

---

## Task 3: Fix WorkExperienceSection CSS

**Files:**
- Modify: `styles/sections/WorkExperienceSection.module.css`

Two CSS fixes:
1. `.section` → `position: sticky; top: 0` (CSS sticky replaces ScrollTrigger pin)
2. `.canvas` → `z-index: 0` (particles render behind slide content)

- [ ] **Step 1: Change .section positioning**

Find:
```css
.section {
  position: relative;
  height: 100vh;
  background: #0d0d0d;
  overflow: hidden;
}
```

Replace with:
```css
.section {
  position: sticky;
  top: 0;
  height: 100vh;
  background: #0d0d0d;
  overflow: hidden;
}
```

- [ ] **Step 2: Remove dead .canvas rule**

Task 4 removes `<canvas ref={canvasRef} className={styles.canvas} />` from the JSX — no element uses `.canvas` after that. Delete the entire rule:

```css
/* DELETE this entire block */
.canvas {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  display: block;
  width: 100%;
  height: 100%;
}
```

- [ ] **Step 3: Commit**

```bash
git add styles/sections/WorkExperienceSection.module.css
git commit -m "fix: sticky section positioning and canvas z-index in WorkExperienceSection"
```

---

## Task 4: Rewrite WorkExperienceSection.jsx

**Files:**
- Modify: `components/sections/WorkExperienceSection.jsx`

This is the main task. Replace the inline Three.js canvas with `WorkExpParticles`, wrap section in a sticky container, remove `pin`/`pinSpacing` from ScrollTrigger, add `scrub:1`, and build the enhanced animation timeline.

- [ ] **Step 1: Update imports — add useState, remove Three.js, add WorkExpParticles**

Replace the current import block:
```jsx
'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import * as THREE from 'three'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import profile from '@/data/profile.json'
import styles from '@/styles/sections/WorkExperienceSection.module.css'
```

With:
```jsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import WorkExpParticles from '@/components/three/WorkExpParticles'
import profile from '@/data/profile.json'
import styles from '@/styles/sections/WorkExperienceSection.module.css'
```

- [ ] **Step 2: Update constants and refs — remove MAX_LINES, add bgRefs and slideIdx state**

Replace the constants and ref declarations block (lines 10–26 in original):
```jsx
const EXPS   = profile.experience
const IMAGES = [
  '/assets/work-experience.png',
  '/assets/work-experience-2.png',
  '/assets/work-experience-3.png',
]
const MAX_LINES = 50
```

And inside `WorkExperienceSection()`, replace:
```jsx
const sectionRef  = useRef(null)
const trackRef    = useRef(null)
const canvasRef   = useRef(null)
const contentRefs = useRef([])
const counterRef  = useRef(null)
const progressRef = useRef(null)
const dotRefs     = useRef([])
```

With:
```jsx
const EXPS   = profile.experience
const IMAGES = [
  '/assets/work-experience.png',
  '/assets/work-experience-2.png',
  '/assets/work-experience-3.png',
]
```

And inside `WorkExperienceSection()`:
```jsx
const sectionRef  = useRef(null)
const trackRef    = useRef(null)
const contentRefs = useRef([])
const bgRefs      = useRef([])
const counterRef  = useRef(null)
const progressRef = useRef(null)
const dotRefs     = useRef([])
const [slideIdx, setSlideIdx] = useState(0)
```

- [ ] **Step 3: Delete the Three.js useEffect entirely**

Remove the entire first `useEffect` block (lines 28–126 in original) — the one containing scene/camera/renderer setup, tick loop, and window resize handler. `WorkExpParticles` replaces all of this.

- [ ] **Step 4: Replace the ScrollTrigger useEffect with the enhanced version**

Replace the existing ScrollTrigger `useEffect` (lines 129–191 in original) with:

```jsx
useEffect(() => {
  const section = sectionRef.current
  const track   = trackRef.current
  if (!section || !track) return

  const scroller = document.querySelector('main')
  const n = EXPS.length

  // Initial state for slides 2+
  contentRefs.current.forEach((el, i) => {
    if (el && i > 0) gsap.set(el, { opacity: 0, y: 30 })
  })

  const tl = gsap.timeline()

  // Horizontal track slide — ease:none for 1:1 scrub feel
  tl.to(track, {
    x: () => -(n - 1) * window.innerWidth,
    ease: 'none',
    duration: n - 1,
  }, 0)

  for (let i = 0; i < n - 1; i++) {
    const curr    = contentRefs.current[i]
    const next    = contentRefs.current[i + 1]
    const nextBg  = bgRefs.current[i + 1]

    // Exit: blur + fade current slide content
    if (curr) {
      tl.to(curr, {
        opacity: 0, y: -40, filter: 'blur(6px)',
        duration: 0.2, ease: 'power2.in',
      }, i + 0.30)
    }

    // Background image scale on entry
    if (nextBg) {
      tl.fromTo(nextBg,
        { scale: 1.04 },
        { scale: 1.0, duration: 1.0, ease: 'power2.out' },
        i
      )
    }

    if (next) {
      const period  = next.querySelector(`.${styles.meta}`)
      const company = next.querySelector(`.${styles.company}`)
      const role    = next.querySelector(`.${styles.role}`)
      const bullets = next.querySelectorAll(`.${styles.bullet}`)
      const tags    = next.querySelectorAll(`.${styles.tag}`)

      // Period + type tag slide in from left
      if (period) {
        tl.fromTo(period,
          { x: -10, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.25, ease: 'power2.out' },
          i + 0.45
        )
      }

      // Company name clip-path reveal
      if (company) {
        tl.fromTo(company,
          { clipPath: 'inset(0 100% 0 0)', x: -8 },
          { clipPath: 'inset(0 0% 0 0)', x: 0, duration: 0.45, ease: 'expo.out' },
          i + 0.48
        )
      }

      // Role text fade up
      if (role) {
        tl.fromTo(role,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.30, ease: 'power2.out' },
          i + 0.56
        )
      }

      // Bullets stagger
      if (bullets.length) {
        tl.fromTo(bullets,
          { x: -15, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out', stagger: 0.04 },
          i + 0.60
        )
      }

      // Tech tags stagger
      if (tags.length) {
        tl.fromTo(tags,
          { y: 6, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.25, ease: 'power2.out', stagger: 0.03 },
          i + 0.72
        )
      }
    }
  }

  const st = ScrollTrigger.create({
    animation: tl,
    trigger:   section,
    scroller,
    start:     'top top',
    end:       () => `+=${(n - 1) * window.innerHeight}`,
    scrub:     1,
    onUpdate: (self) => {
      const activeIdx = Math.round(self.progress * (n - 1))
      setSlideIdx(prev => prev !== activeIdx ? activeIdx : prev)

      if (progressRef.current) {
        gsap.set(progressRef.current, {
          scaleX: self.progress, transformOrigin: 'left center', overwrite: true,
        })
      }

      if (counterRef.current) counterRef.current.textContent = `0${activeIdx + 1}`

      dotRefs.current.forEach((dot, i) => {
        if (!dot) return
        dot.style.width      = i === activeIdx ? '36px' : '14px'
        dot.style.background = i === activeIdx ? 'var(--accent)' : 'rgba(255,255,255,0.2)'
      })
    },
  })

  return () => st.kill()
}, [])
```

- [ ] **Step 5: Update the JSX return — sticky wrapper + WorkExpParticles + bgRefs**

Replace the entire `return (...)` block with:

```jsx
return (
  <div style={{ height: `${EXPS.length * 100}vh` }}>
    <section ref={sectionRef} className={styles.section}>

      {/* Particle canvas */}
      <WorkExpParticles slideIdx={slideIdx} />

      {/* Top bar */}
      <div className={styles.topBar}>
        <span className={styles.sectionLabel}>Work Experience</span>
        <div className={styles.counter}>
          <span ref={counterRef} className={styles.cCur}>01</span>
          <span className={styles.cSep}> / </span>
          <span className={styles.cTot}>0{EXPS.length}</span>
        </div>
      </div>

      {/* Horizontal track */}
      <div
        ref={trackRef}
        className={styles.track}
        style={{ width: `${EXPS.length * 100}vw` }}
      >
        {EXPS.map((exp, i) => (
          <div key={exp.id} className={styles.slide}>

            <div
              ref={el => { bgRefs.current[i] = el }}
              className={styles.slideBg}
            >
              <Image
                src={IMAGES[i % IMAGES.length]}
                alt="" fill quality={100} sizes="100vw"
                className={styles.slideImg}
                priority={i === 0}
              />
              <div className={styles.slideOverlayLeft}   aria-hidden />
              <div className={styles.slideOverlayBottom} aria-hidden />
              <div className={styles.slideVignette}      aria-hidden />
            </div>

            <span className={styles.slideNum} aria-hidden>0{i + 1}</span>

            <div
              ref={el => { contentRefs.current[i] = el }}
              className={styles.slideContent}
            >
              <div className={styles.slideLeft}>
                <div className={styles.meta}>
                  <span className={styles.period}>{exp.period} – {exp.periodEnd}</span>
                  <span className={styles.typeTag}>{exp.type}</span>
                  <span className={styles.location}>{exp.location}</span>
                </div>
                <h2 className={styles.company}>{exp.company}</h2>
                <p  className={styles.role}>{exp.role}</p>
              </div>

              <div className={styles.slideRight}>
                <ul className={styles.bullets}>
                  {exp.bullets.map((b, bi) => (
                    <li key={bi} className={styles.bullet}>{b}</li>
                  ))}
                </ul>
                <div className={styles.stack}>
                  {exp.tech.map(t => (
                    <span key={t} className={styles.tag}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Bottom UI */}
      <div className={styles.bottomUI}>
        <div className={styles.progressTrack}>
          <div ref={progressRef} className={styles.progressBar} />
        </div>
        <div className={styles.dots}>
          {EXPS.map((_, i) => (
            <div
              key={i}
              ref={el => { dotRefs.current[i] = el }}
              className={styles.dot}
              style={{
                width:      i === 0 ? '36px' : '14px',
                background: i === 0 ? 'var(--accent)' : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>
      </div>

    </section>
  </div>
)
```

- [ ] **Step 6: Run dev server and verify**

```bash
npm run dev
```

Open `http://localhost:3000`. Scroll through the page:

1. Sections 1–3 (VideoIntro, Hero, About) snap normally ✓
2. Scroll to snap index 3 → Work Experience section appears, slide 1 (Hestabit) visible with content ✓
3. Scroll to snap index 4 → slide 1 content blurs out, slide 2 (SellersCommerce) clips in, bullets stagger, tags stagger ✓
4. Scroll to snap index 5 → slide 2 exits, slide 3 (Kylo Apps) enters ✓
5. Scroll back → animations reverse correctly ✓
6. Orange particles visible in background, burst on slide change ✓
7. Progress bar and dots update ✓
8. Counter shows 01/03, 02/03, 03/03 ✓

- [ ] **Step 7: Check browser console for errors**

No Three.js warnings, no React hydration errors, no GSAP warnings.

- [ ] **Step 8: Commit**

```bash
git add components/sections/WorkExperienceSection.jsx
git commit -m "feat: fix work experience visibility and add smooth GSAP scroll-scrub animations"
```

---

## Task 5: Verify mobile layout

**Files:** No changes — verify only.

- [ ] **Step 1: Open DevTools → mobile viewport (375×812)**

DevTools → Toggle device toolbar → iPhone 12 Pro (375×812).

- [ ] **Step 2: Scroll to Work Experience section**

Verify:
- Section visible at snap index 3 ✓
- `slideRight` hidden on mobile (existing `.slideRight { display: none }` CSS) ✓
- Company name, role, period visible ✓
- No horizontal overflow ✓
- Particles visible ✓

- [ ] **Step 3: Commit (only if hotfixes needed)**

```bash
git add styles/sections/WorkExperienceSection.module.css
git commit -m "fix: work experience mobile layout adjustment"
```

---

## Summary

| Task | Change | Commit |
|------|--------|--------|
| 1 | WorkExpParticles O(n²) fix | `perf: fix O(n²) line geometry allocation` |
| 2 | page.js wrapper height removal | `fix: remove explicit 600vh height` |
| 3 | CSS sticky + z-index fix | `fix: sticky section and canvas z-index` |
| 4 | Full JSX rewrite with enhanced animations | `feat: fix visibility and smooth animations` |
| 5 | Mobile verification | only if fix needed |
