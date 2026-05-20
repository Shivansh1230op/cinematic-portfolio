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

    return () => {
      observer.disconnect()
      tl.kill()
    }
  }, [])

  const nameStyle = {
    fontFamily: 'var(--font-baloo), sans-serif',
    fontSize: 'var(--hero-name-size)',
    fontWeight: 800,
    color: '#1E1E1E',
    lineHeight: 0.9,
    letterSpacing: '-0.02em',
    position: 'absolute',
    left: '1.5rem',
    zIndex: 0,
    whiteSpace: 'nowrap',
  }

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

      {/* Photo — right side, sits above text names */}
      <div
        ref={photoRef}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          height: '100%',
          width: '55%',
          zIndex: 1,
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

      {/* Greeting — top left, below navbar */}
      <div
        style={{
          position: 'absolute',
          top: '7rem',
          left: '1.5rem',
          zIndex: 2,
        }}
      >
        <p
          ref={greetRef}
          style={{
            fontFamily: 'var(--font-baloo), sans-serif',
            fontSize: '0.9rem',
            fontWeight: 400,
            color: '#1E1E1E',
            lineHeight: 1.3,
            letterSpacing: '0.01em',
          }}
        >
          {"Hi, I'm"}
        </p>
        <p
          ref={roleRef}
          style={{
            fontFamily: 'var(--font-baloo), sans-serif',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#1E1E1E',
            lineHeight: 1.3,
            letterSpacing: '0.01em',
          }}
        >
          Software Developer
        </p>
      </div>

      {/* First name — large, positioned upper half */}
      <p ref={firstName} style={{ ...nameStyle, top: '32vh' }}>
        Vaibhav
      </p>

      {/* Location — between names, center-right of viewport */}
      <div
        ref={locationRef}
        style={{
          position: 'absolute',
          top: '60vh',
          left: '42%',
          zIndex: 2,
        }}
      >
        <p
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#1E1E1E',
            letterSpacing: '0.05em',
            lineHeight: 1.5,
          }}
        >
          Based on India*
        </p>
        <p
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#1E1E1E',
            letterSpacing: '0.05em',
            lineHeight: 1.5,
          }}
        >
          Available worldwide
        </p>
      </div>

      {/* Last name — large, positioned lower half, bleeds bottom */}
      <p ref={lastName} style={{ ...nameStyle, top: '60vh' }}>
        Khushalani
      </p>
    </section>
  )
})

export default HeroSection
