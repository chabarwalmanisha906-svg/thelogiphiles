'use client'

import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import type { SiteSettings } from '@/lib/data'

const EASE = [0.16, 1, 0.3, 1] as const

const reveal: Variants = {
  hidden: { opacity: 0, y: 34 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay, ease: EASE },
  }),
}

export function Hero({ settings }: { settings: SiteSettings }) {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-24 md:pt-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[10%] top-1/2 h-[70vmin] w-[70vmin] -translate-y-1/2 rounded-full opacity-40 blur-3xl md:opacity-60"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, rgba(40,187,158,0.55), rgba(14,50,108,0.35) 55%, transparent 75%)',
        }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[5%] top-1/3 h-[40vmin] w-[40vmin] rounded-full opacity-30 blur-2xl"
        style={{
          background: 'radial-gradient(circle, rgba(20,90,82,0.6), transparent 70%)',
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative mx-auto w-full max-w-[1600px] px-6 md:px-10">
        <div className="max-w-4xl">
          <motion.h1
            initial="hidden"
            animate="show"
            className="font-heading font-extrabold leading-[0.98] tracking-tight text-[clamp(2.75rem,8vw,7rem)]"
          >
            <motion.span variants={reveal} custom={0.05} className="block text-navy">
              {settings.heroLineOne}
            </motion.span>
            <motion.span variants={reveal} custom={0.2} className="block text-teal">
              {settings.heroLineTwo}
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 font-heading text-lg font-semibold tracking-tight text-navy/80 sm:text-xl md:text-2xl"
          >
            {settings.heroSupportLine}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 max-w-xl font-body text-base leading-relaxed text-navy/70 sm:text-lg"
          >
            {settings.heroParagraph}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-11 flex flex-wrap items-center gap-x-10 gap-y-4"
          >
            <Link
              href="/work"
              data-cursor="EXPLORE →"
              className="group inline-flex items-center gap-2 font-heading text-sm font-semibold tracking-[0.08em] text-navy"
            >
              SEE OUR WORK
              <span className="transition-transform duration-300 group-hover:translate-x-1.5">
                →
              </span>
            </Link>
            <Link
              href="/#contact"
              data-cursor="LET'S TALK →"
              className="group inline-flex items-center gap-2 font-heading text-sm font-semibold tracking-[0.08em] text-teal-dark"
            >
              LET&apos;S TALK
              <span className="transition-transform duration-300 group-hover:translate-x-1.5">
                →
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
