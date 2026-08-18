import Link from 'next/link'
import type { WorkItem } from '@/lib/data'
import { WorkCarousel } from '@/components/WorkCarousel'
import { ScrollReveal } from '@/components/ScrollReveal'
import { GhostHeading } from '@/components/GhostHeading'

export function WorkPreview({ items }: { items: WorkItem[] }) {
  const preview = items.slice(0, 5)

  return (
    <section className="relative overflow-hidden bg-offwhite px-6 py-28 md:px-10 md:py-36">
      <GhostHeading className="absolute -top-4 left-6 hidden md:left-10 lg:block">WORK</GhostHeading>

      <div className="relative mx-auto max-w-[1600px]">
        <ScrollReveal className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="font-heading text-sm font-semibold tracking-[0.2em] text-mint">
              04 — WORK
            </span>
            <h2 className="mt-4 font-heading text-[clamp(2.5rem,7vw,6rem)] font-extrabold leading-[0.98] tracking-tight text-navy">
              WORK
            </h2>
            <p className="mt-4 font-heading text-lg font-semibold tracking-tight text-navy/60">
              WORDS WE&apos;VE PUT TO WORK.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 md:items-end">
            <Link
              href="/work"
              data-cursor="EXPLORE →"
              className="group inline-flex items-center gap-2 font-heading text-sm font-semibold tracking-[0.08em] text-navy"
            >
              VIEW ALL WORK
              <span className="transition-transform duration-300 group-hover:translate-x-1.5">
                →
              </span>
            </Link>
            <span className="rotate-2 font-hand text-xl text-mint">our favourites, ranked shamelessly</span>
          </div>
        </ScrollReveal>

        <WorkCarousel items={preview} />
      </div>
    </section>
  )
}
