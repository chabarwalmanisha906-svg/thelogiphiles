'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { PostItem } from '@/lib/data'
import { mediaAlt, mediaUrl } from '@/lib/media'

const FILTERS = ['ALL', 'ADVERTISING', 'BRANDING', 'CONTENT', 'LANGUAGE', 'AI', 'EDITORIAL']

const PAGE_SIZE = 6

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function InsightsArchive({ items }: { items: PostItem[] }) {
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    return items.filter((post) => {
      const categoryMatch =
        filter === 'ALL' || (post.tags ?? []).some((tag) => tag.toUpperCase() === filter)

      const searchMatch =
        query === '' ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query)

      return categoryMatch && searchMatch
    })
  }, [items, filter, search])

  const visible = filtered.slice(0, visibleCount)

  if (items.length === 0) {
    return (
      <p className="font-body text-navy/50">
        Articles are managed in the CMS and will appear here once published.
      </p>
    )
  }

  return (
    <div>
      <div className="mb-16 flex flex-col gap-5 border-y border-navy/10 py-5 md:flex-row md:items-center md:justify-between">
        <nav className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFilter(f)
                setVisibleCount(PAGE_SIZE)
              }}
              className={`rounded-full px-[16px] py-2.5 font-heading text-[10px] font-bold tracking-[0.05em] transition-colors duration-300 ${
                filter === f ? 'bg-mint text-navy' : 'text-navy hover:bg-mint/40'
              }`}
            >
              {f}
            </button>
          ))}
        </nav>

        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setVisibleCount(PAGE_SIZE)
          }}
          placeholder="Search insights..."
          className="w-full rounded-full border border-navy/15 bg-white px-4 py-2.5 font-body text-xs text-navy placeholder:text-navy/40 focus:border-mint focus:outline-none md:w-52"
        />
      </div>

      {visible.length === 0 ? (
        <p className="font-body text-navy/50">No insights match that search yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-y-16 md:grid-cols-3 md:gap-x-6 md:gap-y-20">
          {visible.map((post, i) => {
            const imageUrl = mediaUrl(post.featuredImage)
            const categoryName = typeof post.category === 'string' ? post.category : post.category?.name
            const offset = i % 3 === 1

            return (
              <Link
                key={post.id}
                href={`/insights/${post.slug}`}
                data-cursor="READ ARTICLE →"
                className={`group block ${offset ? 'md:translate-y-16' : ''}`}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-navy/10">
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={mediaAlt(post.featuredImage, post.title)}
                      fill
                      unoptimized
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.06]"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-navy/80 font-heading text-[11px] font-bold text-mint opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    READ ARTICLE →
                  </div>
                </div>

                <div className="pt-5">
                  {categoryName && (
                    <div className="mb-3 font-heading text-[9px] font-bold tracking-[0.08em] text-mint">
                      {categoryName.toUpperCase()} · {formatDate(post.publishedDate)}
                    </div>
                  )}
                  <h3 className="font-heading text-2xl font-extrabold leading-[1.05] tracking-tight text-navy transition-colors duration-300 group-hover:text-mint">
                    {post.title}
                  </h3>
                  <p className="mt-3 font-body text-[13px] leading-relaxed text-navy/60">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {visibleCount < filtered.length && (
        <div className="mt-24 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="rounded-full border border-navy px-7 py-4 font-heading text-[11px] font-bold text-navy transition-colors duration-300 hover:bg-navy hover:text-white"
          >
            LOAD MORE INSIGHTS →
          </button>
        </div>
      )}
    </div>
  )
}
