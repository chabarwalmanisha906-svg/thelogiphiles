import type { Metadata } from 'next'
import Link from 'next/link'
import { getWork } from '@/lib/data'
import { WorkArchive } from '@/components/WorkArchive'
import { ScrollReveal } from '@/components/ScrollReveal'

export const metadata: Metadata = {
  title: 'Work',
  description: "Words we've put to work — advertising, brand and content case studies from The Logiphiles.",
}

export const revalidate = 60

export default async function WorkPage() {
  const work = await getWork()

  return (
    <div className="px-6 pb-0 pt-40 md:px-10 md:pt-48">
      <div className="mx-auto max-w-[1600px]">
        <ScrollReveal className="mb-16 max-w-3xl">
          <span className="font-heading text-sm font-semibold tracking-[0.2em] text-mint">
            04 — WORK
          </span>
          <h1 className="mt-4 font-heading text-[clamp(2.75rem,8vw,7rem)] font-extrabold leading-[0.98] tracking-tight text-navy">
            WORDS WE&apos;VE PUT TO WORK.
          </h1>
          <p className="mt-8 max-w-xl font-body text-base leading-relaxed text-navy/60 sm:text-lg">
            Ideas, campaigns, brands and stories we&apos;ve helped put into words.
          </p>
        </ScrollReveal>

        <WorkArchive items={work} />
      </div>

      <section className="mt-32 bg-navy px-6 py-24 text-center md:px-10 md:py-28">
        <h2 className="font-heading text-[clamp(2.5rem,6vw,5rem)] font-extrabold leading-[0.9] tracking-tight text-white">
          HAVE SOMETHING
          <br />
          <span className="text-mint">WORTH WRITING?</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl font-body text-white/70">
          Tell us what you&apos;re building, selling, launching or trying to say.
        </p>
        <Link
          href="/#contact"
          className="mt-8 inline-block rounded-full bg-mint px-7 py-4 font-heading text-[11px] font-bold text-navy transition-colors duration-300 hover:bg-white"
        >
          LET&apos;S WRITE IT →
        </Link>
      </section>
    </div>
  )
}
