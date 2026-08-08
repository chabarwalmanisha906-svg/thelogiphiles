import Image from 'next/image'
import type { TeamMemberItem } from '@/lib/data'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { ScrollReveal } from '@/components/ScrollReveal'

export function TeamGrid({ items }: { items: TeamMemberItem[] }) {
  if (items.length === 0) {
    return (
      <p className="font-body text-navy/50">
        Team profiles are managed in the CMS and will appear here once added.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-14 sm:grid-cols-3 md:grid-cols-4">
      {items.map((member, i) => {
        const photoUrl = mediaUrl(member.photo)
        const card = (
          <>
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-navy/5 grayscale transition-all duration-500 group-hover:grayscale-0">
              {photoUrl && (
                <Image
                  src={photoUrl}
                  alt={mediaAlt(member.photo, member.name)}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover"
                />
              )}
            </div>
            <h3 className="mt-4 font-heading text-lg font-extrabold tracking-tight text-navy">
              {member.name}
            </h3>
            <p className="mt-1 font-body text-sm text-teal-dark">{member.role}</p>
          </>
        )

        return (
          <ScrollReveal key={member.id} delay={(i % 4) * 0.05}>
            {member.linkedinUrl ? (
              <a
                href={member.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="EXPLORE →"
                className="group block"
              >
                {card}
              </a>
            ) : (
              <div className="group">{card}</div>
            )}
          </ScrollReveal>
        )
      })}
    </div>
  )
}
