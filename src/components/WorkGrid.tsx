'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { WorkItem } from '@/lib/data'
import { mediaAlt, mediaUrl } from '@/lib/media'

export function WorkGrid({ items }: { items: WorkItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    const track = trackRef.current
    if (!track || items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = cardRefs.current.findIndex((el) => el === entry.target)
            if (index !== -1) setActive(index)
          }
        })
      },
      { root: track, threshold: 0.6 },
    )

    cardRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [items.length])

  function scrollToIndex(index: number) {
    const card = cardRefs.current[index]
    if (!card || !trackRef.current) return
    trackRef.current.scrollTo({ left: card.offsetLeft - 24, behavior: 'smooth' })
  }

  if (items.length === 0) {
    return (
      <p className="font-body text-navy/50">
        Case studies are managed in the CMS and will appear here once published.
      </p>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-6">
        <span className="font-heading text-sm font-semibold tracking-[0.15em] text-navy/50">
          <span className="text-mint">{String(active + 1).padStart(2, '0')}</span> /{' '}
          {String(items.length).padStart(2, '0')}
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Previous project"
            onClick={() => scrollToIndex(Math.max(active - 1, 0))}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-navy/20 font-heading text-navy transition-colors hover:border-mint hover:text-mint"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next project"
            onClick={() => scrollToIndex(Math.min(active + 1, items.length - 1))}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-navy/20 font-heading text-navy transition-colors hover:border-mint hover:text-mint"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4 md:gap-10"
      >
        {items.map((item, i) => {
          const imageUrl = mediaUrl(item.coverImage)

          return (
            <div
              key={item.id}
              ref={(el) => {
                cardRefs.current[i] = el
              }}
              className="w-[82vw] shrink-0 snap-start sm:w-[58vw] md:w-[42vw] lg:w-[34vw]"
            >
              <Link href={`/work/${item.slug}`} data-cursor="VIEW CASE →" className="group block">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-navy">
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={mediaAlt(item.coverImage, item.title)}
                      fill
                      sizes="(min-width: 1024px) 34vw, (min-width: 768px) 42vw, 82vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  )}
                  <div className="absolute inset-0 bg-navy/10 transition-colors duration-500 group-hover:bg-navy/50" />

                  <span className="absolute right-5 top-5 inline-flex items-center gap-2 font-heading text-xs font-semibold tracking-[0.1em] text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    VIEW CASE →
                  </span>
                </div>

                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <span className="font-heading text-xs font-semibold tracking-[0.15em] text-mint">
                      {item.category}
                    </span>
                    <h3 className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-navy transition-colors duration-300 group-hover:text-mint md:text-3xl">
                      {item.title}
                    </h3>
                  </div>
                  <span className="mt-2 shrink-0 font-heading text-xl text-navy/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-mint">
                    →
                  </span>
                </div>
                <p className="mt-2 max-w-md font-body text-sm leading-relaxed text-navy/60">
                  {item.description}
                </p>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
