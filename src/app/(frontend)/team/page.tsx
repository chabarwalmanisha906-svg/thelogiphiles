import type { Metadata } from 'next'
import { getTeamMembers } from '@/lib/data'
import { TeamGrid } from '@/components/TeamGrid'
import { ScrollReveal } from '@/components/ScrollReveal'

export const metadata: Metadata = {
  title: 'Our Team',
  description: 'The people behind The Logiphiles — writers, strategists and linguists obsessed with words.',
}

export default async function TeamPage() {
  const team = await getTeamMembers()

  return (
    <div className="px-6 pb-28 pt-40 md:px-10 md:pb-36 md:pt-48">
      <div className="mx-auto max-w-[1600px]">
        <ScrollReveal className="mb-16 max-w-3xl">
          <span className="font-heading text-sm font-semibold tracking-[0.2em] text-mint">
            OUR TEAM
          </span>
          <h1 className="mt-4 font-heading text-[clamp(2.75rem,8vw,7rem)] font-extrabold leading-[0.98] tracking-tight text-navy">
            PEOPLE OBSESSED WITH WORDS.
          </h1>
          <p className="mt-6 max-w-xl font-body text-lg leading-relaxed text-navy/70">
            Writers, strategists, linguists and storytellers — the people who turn ideas into
            words that get noticed.
          </p>
        </ScrollReveal>

        <TeamGrid items={team} />
      </div>
    </div>
  )
}
