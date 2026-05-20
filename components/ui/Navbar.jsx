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
        variant="outline"
        render={<a href="mailto:vaibhavkhush124@gmail.com">Email me</a>}
        className="rounded-full text-xs font-semibold px-5 h-8"
        style={{
          background: 'var(--email-btn-bg)',
          color: 'var(--email-btn-text)',
          borderColor: 'transparent',
        }}
      />
    </header>
  )
}
