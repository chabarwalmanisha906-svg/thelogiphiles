'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Logo } from './Logo'

const NAV_LINKS = [
  { label: 'WHO WE ARE', href: '/#who-we-are' },
  { label: 'WHAT WE DO', href: '/#what-we-do' },
  { label: 'WORK', href: '/work' },
  { label: 'INSIGHTS', href: '/insights' },
  { label: 'CONTACT', href: '/#contact' },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-offwhite/95 backdrop-blur-sm transition-shadow duration-300 ${
        scrolled || menuOpen ? 'shadow-[0_1px_0_0_rgba(14,50,108,0.08)]' : ''
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6 md:h-20 md:px-10">
        <Logo className="relative z-[60]" tagline="Copywriting agency" />

        <nav className="hidden items-center gap-9 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="group relative font-heading text-[13px] font-semibold tracking-[0.08em] text-navy"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-teal transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/#contact"
            className="hidden items-center gap-2 bg-navy px-5 py-2.5 font-heading text-[13px] font-semibold tracking-[0.08em] text-white transition-colors hover:bg-teal-dark lg:inline-flex"
          >
            LET&apos;S TALK →
          </Link>

          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="relative z-[60] flex h-9 w-9 flex-col items-center justify-center gap-[5px] lg:hidden"
          >
            <span
              className={`h-px w-6 bg-navy transition-transform duration-300 ${menuOpen ? 'translate-y-[3px] rotate-45' : ''}`}
            />
            <span
              className={`h-px w-6 bg-navy transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`}
            />
            <span
              className={`h-px w-6 bg-navy transition-transform duration-300 ${menuOpen ? '-translate-y-[3px] -rotate-45' : ''}`}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1] }}
            className="fixed inset-0 z-50 flex flex-col justify-center bg-navy px-8 lg:hidden"
          >
            <nav className="flex flex-col gap-6">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="font-heading text-4xl font-extrabold tracking-tight text-white"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + NAV_LINKS.length * 0.06 }}
              >
                <Link
                  href="/#contact"
                  onClick={() => setMenuOpen(false)}
                  className="mt-4 inline-flex items-center gap-2 font-heading text-lg font-semibold text-teal-dark"
                >
                  LET&apos;S TALK →
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
