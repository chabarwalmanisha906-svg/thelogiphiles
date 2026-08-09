import type { Metadata } from 'next'
import { getWork } from '@/lib/data'
import { WorkGrid } from '@/components/WorkGrid'
import { ScrollReveal } from '@/components/ScrollReveal'

export const metadata: Metadata = {
  title: 'Work',
  description: "Words we've put to work — advertising, brand and content case studies from The Logiphiles.",
}

export default async function WorkPage() {
  const work = await getWork()

  return (
    <div className="px-6 pb-28 pt-40 md:px-10 md:pb-36 md:pt-48">
      <div className="mx-auto max-w-[1600px]">
        <ScrollReveal className="mb-16 max-w-3xl">
          <span className="font-heading text-sm font-semibold tracking-[0.2em] text-mint">
            WORK
          </span>
          <h1 className="mt-4 font-heading text-[clamp(2.75rem,8vw,7rem)] font-extrabold leading-[0.98] tracking-tight text-navy">
            WORDS WE&apos;VE PUT TO WORK.
          </h1>
        </ScrollReveal>

        <WorkGrid items={work} />
      </div>
    </div>
  )
}
