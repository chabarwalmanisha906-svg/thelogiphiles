import Image from 'next/image'
import type { ClientItem } from '@/lib/data'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { ScrollReveal } from '@/components/ScrollReveal'

const FALLBACK_CLIENTS = [
  { id: 'archer', name: 'Archer Public Relations', src: '/clients/archer.png' },
  { id: 'healthkeyz', name: 'Health+Keyz', src: '/clients/healthkeyz.png' },
  { id: 'unbiased', name: 'Unbiased Stingers', src: '/clients/unbiased.png' },
  { id: 'laughing-colours', name: 'Laughing Colours', src: '/clients/laughing-colours.png' },
  { id: 'pr24x7', name: 'PR 24x7', src: '/clients/pr24x7.png' },
]

type LogoEntry = { key: string; alt: string; src: string; unoptimized?: boolean }

function MarqueeRow({ logos, direction }: { logos: LogoEntry[]; direction: 'left' | 'right' }) {
  const doubled = [...logos, ...logos]

  return (
    <div className="no-scrollbar overflow-hidden border-y border-navy/10">
      <div
        className={`flex w-max shrink-0 items-stretch ${
          direction === 'left' ? 'marquee-left' : 'marquee-right'
        }`}
      >
        {doubled.map((logo, i) => (
          <div
            key={`${logo.key}-${i}`}
            className="flex aspect-[3/2] w-[220px] shrink-0 items-center justify-center border-r border-navy/10 p-4 grayscale transition-all duration-300 hover:grayscale-0 sm:w-[280px]"
          >
            {logo.src && (
              <Image
                src={logo.src}
                alt={logo.alt}
                width={220}
                height={90}
                unoptimized={logo.unoptimized}
                className="max-h-24 w-auto object-contain"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ClientsSection({ clients }: { clients: ClientItem[] }) {
  const logos: LogoEntry[] =
    clients.length > 0
      ? clients.map((client) => ({
          key: client.id,
          alt: mediaAlt(client.logo, client.name),
          src: mediaUrl(client.logo) || '',
        }))
      : FALLBACK_CLIENTS.map((client) => ({
          key: client.id,
          alt: client.name,
          src: client.src,
          unoptimized: true,
        }))

  return (
    <section className="border-t border-navy/10 bg-offwhite py-24 md:py-32">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <ScrollReveal>
          <h2 className="font-heading text-sm font-semibold tracking-[0.2em] text-navy/50">
            TRUSTED TO WRITE
          </h2>
        </ScrollReveal>
      </div>

      <div className="mt-10 flex flex-col gap-4">
        <MarqueeRow logos={logos} direction="left" />
        <MarqueeRow logos={logos} direction="right" />
      </div>
    </section>
  )
}
