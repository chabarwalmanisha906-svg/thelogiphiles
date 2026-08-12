import type { Metadata } from 'next'
import Link from 'next/link'
import { getTeamMembers } from '@/lib/data'
import { TeamGrid } from '@/components/TeamGrid'
import { ScrollReveal } from '@/components/ScrollReveal'
import { GhostHeading } from '@/components/GhostHeading'

export const metadata: Metadata = {
  title: 'Our Team',
  description: 'The people behind The Logiphiles — writers, strategists and linguists obsessed with words.',
}

export const revalidate = 60

export default async function TeamPage() {
  const team = await getTeamMembers()

  return (
    <div className="px-6 pb-28 pt-40 md:px-10 md:pb-36 md:pt-48">
      <div className="relative mx-auto max-w-[1600px]">
        <GhostHeading className="pointer-events-none absolute -top-8 right-0 hidden lg:block">
          OUR TEAM
        </GhostHeading>

        <div className="relative mb-20 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <ScrollReveal className="lg:max-w-xl">
            <span className="font-heading text-sm font-semibold tracking-[0.2em] text-mint">
              OUR TEAM
            </span>
            <h1 className="mt-4 font-heading text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-tight text-navy">
              MEET THE
              <br />
              LOGIPHILES
            </h1>

            <div className="my-6 h-1 w-11 bg-mint" />

            <h2 className="font-heading text-[clamp(1.5rem,3vw,2.25rem)] font-extrabold leading-[1.1] tracking-tight text-navy">
              THE MINDS BEHIND <span className="text-mint">THE WORDS.</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1} className="lg:max-w-sm lg:text-right">
            <p className="-rotate-2 font-hand text-2xl text-navy lg:text-right">
              We&apos;re a bunch of word nerds.
            </p>
            <p className="mt-5 font-body text-sm leading-relaxed text-navy/60">
              From seasoned strategists to creative mavericks, our team is united by one simple
              obsession: <strong className="font-bold text-navy">crafting copy that actually connects.</strong>
            </p>
          </ScrollReveal>
        </div>

        <TeamGrid items={team} />

        <ScrollReveal delay={0.1}>
          <Link
            href="/#who-we-are"
            data-cursor="EXPLORE →"
            className="group mt-20 inline-flex items-center gap-2 font-heading text-[11px] font-bold uppercase tracking-[0.1em] text-mint"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1.5">
              ←
            </span>
            Back to who we are
          </Link>
        </ScrollReveal>
      </div>
    </div>
  )
}
