import Image from 'next/image'
import { Languages, Lightbulb, PenLine, Zap, type LucideIcon } from 'lucide-react'
import type { TeamMemberItem } from '@/lib/data'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { ScrollReveal } from '@/components/ScrollReveal'

const ICONS: Record<NonNullable<TeamMemberItem['icon']>, LucideIcon> = {
  pen: PenLine,
  lightbulb: Lightbulb,
  language: Languages,
  zap: Zap,
}

export function TeamGrid({ items }: { items: TeamMemberItem[] }) {
  if (items.length === 0) {
    return (
      <p className="font-body text-navy/50">
        Team profiles are managed in the CMS and will appear here once added.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((member, i) => {
        const photoUrl = mediaUrl(member.photo)
        const Icon = member.icon ? ICONS[member.icon] : null

        const card = (
          <div className="h-full rounded-lg border border-navy/5 bg-white px-6 py-9 text-center shadow-[0_5px_15px_rgba(14,50,108,0.03)] transition-all duration-300 group-hover:-translate-y-2.5 group-hover:shadow-[0_15px_30px_rgba(14,50,108,0.08)]">
            {photoUrl ? (
              <div className="relative mx-auto mb-5 h-[100px] w-[100px] overflow-hidden rounded-full border-2 border-mint">
                <Image
                  src={photoUrl}
                  alt={mediaAlt(member.photo, member.name)}
                  fill
                  sizes="100px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="mx-auto mb-5 flex h-[100px] w-[100px] items-center justify-center rounded-full border-2 border-dashed border-mint/30 bg-navy/[0.03] text-mint">
                {Icon && <Icon size={32} strokeWidth={1.75} />}
              </div>
            )}

            <h3 className="font-heading text-xl font-extrabold text-navy">{member.name}</h3>
            <p className="mb-4 mt-1 font-heading text-[11px] font-bold uppercase tracking-[0.1em] text-mint">
              {member.role}
            </p>
            {member.bio && (
              <p className="font-body text-[13px] leading-relaxed text-navy/60">{member.bio}</p>
            )}
          </div>
        )

        return (
          <ScrollReveal key={member.id} delay={(i % 4) * 0.05}>
            {member.linkedinUrl ? (
              <a
                href={member.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="LINKEDIN →"
                className="group block h-full"
              >
                {card}
              </a>
            ) : (
              <div className="group h-full">{card}</div>
            )}
          </ScrollReveal>
        )
      })}
    </div>
  )
}
