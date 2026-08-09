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

export function ClientsSection({ clients }: { clients: ClientItem[] }) {
  const hasCmsClients = clients.length > 0

  return (
    <section className="border-t border-navy/10 bg-offwhite px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1600px]">
        <ScrollReveal>
          <h2 className="font-heading text-sm font-semibold tracking-[0.2em] text-navy/50">
            TRUSTED TO WRITE
          </h2>
        </ScrollReveal>

        <div className="mt-10 grid grid-cols-2 border-l border-t border-navy/10 sm:grid-cols-3 md:grid-cols-5">
          {hasCmsClients
            ? clients.map((client) => {
                const logoUrl = mediaUrl(client.logo)
                return (
                  <div
                    key={client.id}
                    className="flex aspect-[3/2] items-center justify-center border-b border-r border-navy/10 p-6 grayscale transition-all duration-300 hover:grayscale-0"
                  >
                    {logoUrl && (
                      <Image
                        src={logoUrl}
                        alt={mediaAlt(client.logo, client.name)}
                        width={160}
                        height={56}
                        className="max-h-12 w-auto object-contain"
                      />
                    )}
                  </div>
                )
              })
            : FALLBACK_CLIENTS.map((client) => (
                <div
                  key={client.id}
                  className="flex aspect-[3/2] items-center justify-center border-b border-r border-navy/10 p-6 grayscale transition-all duration-300 hover:grayscale-0"
                >
                  <Image
                    src={client.src}
                    alt={client.name}
                    width={160}
                    height={56}
                    unoptimized
                    className="max-h-12 w-auto object-contain"
                  />
                </div>
              ))}
        </div>
      </div>
    </section>
  )
}
