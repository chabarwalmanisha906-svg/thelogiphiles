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
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-offwhite pt-24 md:pt-28">
      <div className="relative mx-auto grid w-full max-w-[1600px] grid-cols-1 items-center gap-16 px-6 md:px-10 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <motion.h1
            initial="hidden"
            animate="show"
            className="font-heading font-extrabold leading-[0.94] tracking-tight text-[clamp(2.75rem,7.5vw,6.5rem)]"
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
            className="mt-8 font-heading text-lg font-semibold tracking-tight text-navy/80 sm:text-xl"
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
            className="mt-11 flex flex-wrap items-center gap-x-8 gap-y-4"
          >
            <Link
              href="/work"
              data-cursor="EXPLORE →"
              className="inline-flex items-center gap-2 bg-navy px-7 py-4 font-heading text-sm font-semibold tracking-[0.08em] text-white transition-colors hover:bg-teal-dark"
            >
              SEE OUR WORK →
            </Link>
            <Link
              href="/#contact"
              data-cursor="LET'S TALK →"
              className="inline-flex items-center gap-2 border-b-2 border-teal-dark font-heading text-sm font-semibold tracking-[0.08em] text-teal-dark"
            >
              LET&apos;S TALK →
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative hidden aspect-[4/5] items-center justify-center overflow-hidden bg-[#f0ede6] lg:col-span-5 lg:flex"
        >
          <div
            aria-hidden="true"
            className="brand-gradient h-[130%] w-[70%] rotate-[18deg] rounded-[45%] blur-[2px]"
          />
          <motion.div
            aria-hidden="true"
            className="absolute h-[90%] w-[45%] -rotate-[12deg] rounded-[45%] bg-teal/70 mix-blend-multiply blur-[1px]"
            animate={{ rotate: [-12, -8, -12] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
        <span className="font-heading text-xs font-semibold tracking-[0.2em] text-navy/40">
          SCROLL
        </span>
      </div>
    </section>
  )
}
