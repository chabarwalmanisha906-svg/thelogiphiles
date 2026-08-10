'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { WorkItem } from '@/lib/data'
import { mediaAlt, mediaUrl } from '@/lib/media'

const FILTERS = ['ALL', 'ADVERTISING', 'BRAND', 'CONTENT', 'EDITORIAL', 'LANGUAGE']

const LAYOUTS = ['large', 'left', 'right'] as const

export function WorkArchive({ items }: { items: WorkItem[] }) {
  const [filter, setFilter] = useState('ALL')

  const filtered = useMemo(() => {
    if (filter === 'ALL') return items
    return items.filter((item) => item.category.toUpperCase().includes(filter))
  }, [items, filter])

  if (items.length === 0) {
    return (
      <p className="font-body text-navy/50">
        Case studies are managed in the CMS and will appear here once published.
      </p>
    )
  }

  return (
    <div>
      <nav className="mb-16 flex flex-wrap gap-2 border-y border-navy/10 py-5">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-[18px] py-2.5 font-heading text-[11px] font-bold tracking-[0.02em] transition-colors duration-300 ${
              filter === f ? 'bg-mint text-navy' : 'text-navy hover:bg-mint/40'
            }`}
          >
            {f}
          </button>
        ))}
      </nav>

      <div className="grid grid-cols-1 gap-y-16 md:grid-cols-12 md:gap-x-6 md:gap-y-24">
        {filtered.map((item, i) => {
          const imageUrl = mediaUrl(item.coverImage)
          const layout = LAYOUTS[i % LAYOUTS.length]

          return (
            <Link
              key={item.id}
              href={`/work/${item.slug}`}
              data-cursor="VIEW CASE →"
              className={`group block ${
                layout === 'large'
                  ? 'md:col-span-10 md:col-start-2'
                  : layout === 'left'
                    ? 'md:col-span-6 md:col-start-1'
                    : 'md:col-span-6 md:col-start-7'
              }`}
            >
              <div
                className={`relative w-full overflow-hidden bg-navy/70 ${
                  layout === 'large' ? 'aspect-[16/9]' : 'aspect-[4/3]'
                }`}
              >
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={mediaAlt(item.coverImage, item.title)}
                    fill
                    unoptimized
                    sizes={layout === 'large' ? '(min-width: 768px) 80vw, 100vw' : '(min-width: 768px) 40vw, 100vw'}
                    className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.05]"
                  />
                )}

                <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-navy/85 via-navy/0 to-navy/0 p-7 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <span className="font-heading text-2xl font-extrabold text-white">
                    {item.title}
                  </span>
                  <span className="font-heading text-2xl text-mint">→</span>
                </div>
              </div>

              <div className="pt-5">
                <span className="font-heading text-[11px] font-bold tracking-[0.1em] text-mint">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2 font-heading text-2xl font-extrabold text-navy transition-colors duration-300 group-hover:text-mint">
                  {item.title}
                </h3>
                <p className="mt-1.5 font-body text-xs text-navy/50">{item.category}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
