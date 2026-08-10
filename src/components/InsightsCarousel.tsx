'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { PostItem } from '@/lib/data'
import { mediaAlt, mediaUrl } from '@/lib/media'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function InsightsCarousel({ items }: { items: PostItem[] }) {
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
        Articles are managed in the CMS and will appear here once published.
      </p>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Previous article"
        onClick={() => scrollToIndex(Math.max(active - 1, 0))}
        className="absolute -left-2 top-[42%] z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy shadow-[0_10px_30px_rgba(14,50,108,0.14)] transition-transform duration-300 hover:scale-105 hover:bg-mint sm:flex md:-left-4"
      >
        ←
      </button>

      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2"
      >
        {items.map((post, i) => {
          const imageUrl = mediaUrl(post.featuredImage)
          const categoryName = typeof post.category === 'string' ? post.category : post.category?.name

          return (
            <div
              key={post.id}
              ref={(el) => {
                cardRefs.current[i] = el
              }}
              className="w-[86vw] shrink-0 snap-start border border-navy/10 bg-white sm:w-[65vw] md:w-[min(650px,55vw)]"
            >
              <Link href={`/insights/${post.slug}`} data-cursor="READ ARTICLE →" className="group block">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-navy/10">
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={mediaAlt(post.featuredImage, post.title)}
                      fill
                      unoptimized
                      sizes="(min-width: 768px) 55vw, 86vw"
                      className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.045]"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-navy/80 font-heading text-xs font-bold tracking-[0.02em] text-mint opacity-0 transition-opacity duration-[350ms] group-hover:opacity-100">
                    READ ARTICLE →
                  </div>
                </div>

                <div className="p-8">
                  <div className="mb-4 flex items-center gap-2 font-heading text-[10px] font-bold tracking-[0.08em] text-mint">
                    {categoryName && <span>{categoryName.toUpperCase()}</span>}
                    <span className="text-navy/25">·</span>
                    <span>{formatDate(post.publishedDate)}</span>
                  </div>

                  <h3 className="max-w-[560px] font-heading text-[clamp(1.6rem,3vw,2.5rem)] font-extrabold leading-[1.02] tracking-tight text-navy">
                    {post.title}
                  </h3>

                  <p className="mt-4 max-w-[540px] font-body text-sm leading-relaxed text-navy/60">
                    {post.excerpt}
                  </p>

                  <span className="mt-6 inline-block font-heading text-[11px] font-bold text-navy transition-transform duration-300 group-hover:translate-x-1.5 group-hover:text-mint">
                    READ ARTICLE →
                  </span>
                </div>
              </Link>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        aria-label="Next article"
        onClick={() => scrollToIndex(Math.min(active + 1, items.length - 1))}
        className="absolute -right-2 top-[42%] z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy shadow-[0_10px_30px_rgba(14,50,108,0.14)] transition-transform duration-300 hover:scale-105 hover:bg-mint sm:flex md:-right-4"
      >
        →
      </button>

      <div className="mt-6 flex items-center justify-center gap-2">
        {items.map((post, i) => (
          <button
            key={post.id}
            type="button"
            aria-label={`Go to article ${i + 1}`}
            onClick={() => scrollToIndex(i)}
            className={`h-[7px] rounded-full transition-all duration-300 ${
              i === active ? 'w-7 bg-mint' : 'w-[7px] bg-navy/15'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
