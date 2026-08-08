import Image from 'next/image'
import type { ClientItem } from '@/lib/data'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { ScrollReveal } from '@/components/ScrollReveal'

export function ClientsSection({ clients }: { clients: ClientItem[] }) {
  return (
    <section className="border-t border-navy/10 bg-offwhite px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1600px]">
        <ScrollReveal>
          <h2 className="font-heading text-sm font-semibold tracking-[0.2em] text-navy/50">
            TRUSTED TO WRITE
          </h2>
        </ScrollReveal>

        {clients.length === 0 ? (
          <p className="mt-8 font-body text-navy/40">
            Client logos are managed in the CMS and will appear here once added.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-2 border-l border-t border-navy/10 sm:grid-cols-3 md:grid-cols-6">
            {clients.map((client) => {
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
            })}
          </div>
        )}
      </div>
    </section>
  )
}
