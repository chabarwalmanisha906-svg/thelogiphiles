'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { WorkItem } from '@/lib/data'
import { mediaAlt, mediaUrl } from '@/lib/media'

const AUTOPLAY_MS = 6000

export function WorkCarousel({ items }: { items: WorkItem[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const touchStartX = useRef(0)

  const [index, setIndex] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const [paused, setPaused] = useState(false)

  const goTo = (i: number) => {
    const next = (i + items.length) % items.length
    setIndex(next)
  }

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current
    const track = trackRef.current
    const card = cardRefs.current[index]
    if (!wrapper || !track || !card) return

    const wrapperWidth = wrapper.offsetWidth
    const cardCenter = card.offsetLeft + card.offsetWidth / 2
    let next = wrapperWidth / 2 - cardCenter

    const totalWidth = track.scrollWidth
    const maxTranslate = 0
    const minTranslate = wrapperWidth - totalWidth
    next = Math.min(maxTranslate, Math.max(minTranslate, next))

    setTranslateX(next)
  }, [index, items.length])

  useEffect(() => {
    const onResize = () => setIndex((i) => i)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (paused || items.length <= 1) return
    const timer = setInterval(() => goTo(index + 1), AUTOPLAY_MS)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused, items.length])

  if (items.length === 0) {
    return (
      <p className="font-body text-navy/50">
        Case studies are managed in the CMS and will appear here once published.
      </p>
    )
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative" ref={wrapperRef}>
        <button
          type="button"
          aria-label="Previous project"
          onClick={() => goTo(index - 1)}
          className="absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy shadow-[0_8px_25px_rgba(14,50,108,0.15)] transition-transform duration-300 hover:scale-105 hover:bg-mint md:left-4"
        >
          ←
        </button>

        <div
          className="no-scrollbar overflow-hidden"
          onTouchStart={(e) => {
            touchStartX.current = e.changedTouches[0].screenX
          }}
          onTouchEnd={(e) => {
            const delta = e.changedTouches[0].screenX - touchStartX.current
            if (Math.abs(delta) < 50) return
            goTo(delta < 0 ? index + 1 : index - 1)
          }}
        >
          <div
            ref={trackRef}
            className="flex w-max items-stretch gap-4 transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.18,1)]"
            style={{ transform: `translateX(${translateX}px)` }}
          >
            {items.map((item, i) => {
              const imageUrl = mediaUrl(item.coverImage)
              const active = i === index

              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    cardRefs.current[i] = el
                  }}
                  onClick={() => !active && goTo(i)}
                  className={`grid shrink-0 items-stretch overflow-hidden bg-navy transition-[width,opacity,filter] duration-700 ${
                    active
                      ? 'h-[430px] w-[min(920px,68vw)] grid-cols-[42%_58%] cursor-default opacity-100 saturate-100'
                      : 'h-[430px] w-[min(420px,32vw)] grid-cols-1 cursor-pointer opacity-70 saturate-[0.7]'
                  }`}
                >
                  <div
                    className={`flex flex-col justify-between text-white ${
                      active ? 'p-8 md:p-11' : 'p-7 md:p-9'
                    }`}
                  >
                    <span className="font-heading text-sm font-bold text-mint">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <div className="mt-auto">
                      <h3
                        className={`font-heading font-extrabold leading-none ${
                          active ? 'text-[clamp(1.75rem,3vw,2.9rem)]' : 'text-2xl'
                        }`}
                      >
                        {item.title}
                      </h3>

                      {active && (
                        <>
                          <div className="mt-3 font-heading text-xs font-bold text-mint">
                            {item.category}
                          </div>
                          <p className="mt-5 max-w-[280px] font-body text-sm leading-[1.7] text-white/75">
                            {item.description}
                          </p>
                          <Link
                            href={`/work/${item.slug}`}
                            data-cursor="VIEW CASE →"
                            className="mt-7 inline-block font-heading text-[11px] font-bold text-mint transition-transform duration-300 hover:translate-x-1.5"
                          >
                            VIEW CASE →
                          </Link>
                        </>
                      )}
                    </div>
                  </div>

                  {active && (
                    <div className="relative overflow-hidden bg-navy/70">
                      {imageUrl && (
                        <Image
                          src={imageUrl}
                          alt={mediaAlt(item.coverImage, item.title)}
                          fill
                          unoptimized
                          sizes="(min-width: 768px) 40vw, 60vw"
                          className="object-cover transition-transform duration-[800ms] ease-out hover:scale-[1.04]"
                        />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <button
          type="button"
          aria-label="Next project"
          onClick={() => goTo(index + 1)}
          className="absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy shadow-[0_8px_25px_rgba(14,50,108,0.15)] transition-transform duration-300 hover:scale-105 hover:bg-mint md:right-4"
        >
          →
        </button>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Go to project ${i + 1}`}
            onClick={() => goTo(i)}
            className={`h-[7px] rounded-full transition-all duration-300 ${
              i === index ? 'w-7 bg-mint' : 'w-[7px] bg-navy/15'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
