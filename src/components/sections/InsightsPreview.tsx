import Link from 'next/link'
import type { PostItem } from '@/lib/data'
import { InsightsCarousel } from '@/components/InsightsCarousel'
import { ScrollReveal } from '@/components/ScrollReveal'
import { GhostHeading } from '@/components/GhostHeading'

export function InsightsPreview({ items }: { items: PostItem[] }) {
  const preview = items.slice(0, 4)

  return (
    <section className="relative overflow-hidden bg-offwhite px-6 py-28 md:px-10 md:py-36">
      <GhostHeading className="absolute -top-4 right-6 md:right-10">INSIGHTS</GhostHeading>

      <div className="relative mx-auto max-w-[1600px]">
        <ScrollReveal className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="font-heading text-sm font-semibold tracking-[0.2em] text-mint">
              06 — INSIGHTS
            </span>
            <h2 className="mt-4 font-heading text-[clamp(2.5rem,7vw,6rem)] font-extrabold leading-[0.98] tracking-tight text-navy">
              INSIGHTS
            </h2>
            <p className="mt-4 font-heading text-lg font-semibold tracking-tight text-navy/60">
              WORDS ON OUR MIND.
            </p>
            <span className="mt-3 inline-block -rotate-2 font-hand text-xl text-mint">fresh thoughts, weekly-ish</span>
          </div>

          <Link
            href="/insights"
            data-cursor="EXPLORE →"
            className="group inline-flex items-center gap-2 font-heading text-sm font-semibold tracking-[0.08em] text-navy"
          >
            VIEW ALL INSIGHTS
            <span className="transition-transform duration-300 group-hover:translate-x-1.5">
              →
            </span>
          </Link>
        </ScrollReveal>

        <InsightsCarousel items={preview} />
      </div>
    </section>
  )
}
