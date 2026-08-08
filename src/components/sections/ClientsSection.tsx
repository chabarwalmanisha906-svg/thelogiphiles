import Image from 'next/image'
import type { ClientItem } from '@/lib/data'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { ScrollReveal } from '@/components/ScrollReveal'
import { GhostHeading } from '@/components/GhostHeading'

export function ClientsSection({ clients }: { clients: ClientItem[] }) {
  return (
    <section className="relative overflow-hidden bg-navy px-6 py-28 md:px-10 md:py-36">
      <GhostHeading variant="onDark" className="absolute -top-4 left-6 md:left-10">
        CLIENTS
      </GhostHeading>

      <div className="relative mx-auto max-w-[1600px]">
        <ScrollReveal>
          <span className="font-heading text-sm font-semibold tracking-[0.2em] text-teal">
            09 — CLIENTS
          </span>
          <h2 className="mt-4 font-heading text-[clamp(2.25rem,5vw,4rem)] font-extrabold leading-[0.98] tracking-tight text-white">
            TRUSTED TO WRITE
          </h2>
        </ScrollReveal>

        {clients.length === 0 ? (
          <p className="mt-10 font-body text-white/40">
            Client logos are managed in the CMS and will appear here once added.
          </p>
        ) : (
          <div className="mt-14 grid grid-cols-2 border-l border-t border-white/15 sm:grid-cols-3 md:grid-cols-5">
            {clients.map((client) => {
              const logoUrl = mediaUrl(client.logo)
              return (
                <div
                  key={client.id}
                  className="flex aspect-[3/2] items-center justify-center border-b border-r border-white/15 p-8 opacity-70 [filter:brightness(0)_invert(1)] transition-all duration-300 hover:opacity-100 hover:[filter:none]"
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
            })}
          </div>
        )}
      </div>
    </section>
  )
}
