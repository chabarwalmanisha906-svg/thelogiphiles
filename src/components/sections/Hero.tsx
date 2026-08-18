'use client'

import Link from 'next/link'
import Image from 'next/image'
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
        <div className="lg:col-span-6">
          <motion.h1
            initial="hidden"
            animate="show"
            className="font-heading font-extrabold leading-[0.94] tracking-tight text-[clamp(2.75rem,7.5vw,6.5rem)]"
          >
            <motion.span variants={reveal} custom={0.05} className="block text-navy">
              {settings.heroLineOne}
            </motion.span>
            <motion.span variants={reveal} custom={0.2} className="block text-mint">
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
              className="inline-flex items-center gap-2 bg-navy px-7 py-4 font-heading text-sm font-semibold tracking-[0.08em] text-white transition-colors hover:bg-mint"
            >
              SEE OUR WORK →
            </Link>
            <Link
              href="/#contact"
              data-cursor="LET'S TALK →"
              className="inline-flex items-center gap-2 border-b-2 border-mint font-heading text-sm font-semibold tracking-[0.08em] text-mint"
            >
              LET&apos;S TALK →
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 -rotate-2 font-hand text-xl text-mint"
          >
            no boring briefs, promise.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex aspect-square max-w-sm items-center justify-center lg:col-span-6 lg:max-w-none"
        >
          <Image
            src="/hero-visual.png"
            alt="The Logiphiles mascot: if you're serious about your brand, you need us for sure."
            fill
            priority
            unoptimized
            sizes="(min-width: 1024px) 46vw, 90vw"
            className="object-contain"
          />
          <span
            id="hero-cup-anchor"
            aria-hidden="true"
            className="pointer-events-none absolute h-px w-px"
            style={{ left: '29.5%', top: '42.7%' }}
          />
        </motion.div>
      </div>
    </section>
  )
}
