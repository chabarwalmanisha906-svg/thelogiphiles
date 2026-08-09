import Image from 'next/image'
import Link from 'next/link'
import type { PostItem } from '@/lib/data'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { ScrollReveal } from '@/components/ScrollReveal'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function InsightsGrid({ items }: { items: PostItem[] }) {
  if (items.length === 0) {
    return (
      <p className="font-body text-navy/50">
        Articles are managed in the CMS and will appear here once published.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-3">
      {items.map((post, i) => {
        const imageUrl = mediaUrl(post.featuredImage)
        const categoryName = typeof post.category === 'string' ? post.category : post.category?.name

        return (
          <ScrollReveal key={post.id} delay={(i % 3) * 0.06}>
            <Link href={`/insights/${post.slug}`} data-cursor="EXPLORE →" className="group block">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-navy/10">
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={mediaAlt(post.featuredImage, post.title)}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                )}
              </div>

              <div className="mt-5 flex items-center gap-3 font-heading text-xs font-semibold tracking-[0.15em] text-mint">
                {categoryName && <span>{categoryName.toUpperCase()}</span>}
                {categoryName && <span className="text-navy/30">/</span>}
                <span className="text-navy/50">{formatDate(post.publishedDate)}</span>
              </div>

              <h3 className="mt-3 font-heading text-xl font-extrabold leading-tight tracking-tight text-navy transition-colors duration-300 group-hover:text-mint sm:text-2xl">
                {post.title}
              </h3>

              <p className="mt-3 font-body text-sm leading-relaxed text-navy/60">{post.excerpt}</p>

              <span className="mt-4 inline-flex items-center gap-2 font-heading text-xs font-semibold tracking-[0.1em] text-navy">
                READ ARTICLE
                <span className="transition-transform duration-300 group-hover:translate-x-1.5">
                  →
                </span>
              </span>
            </Link>
          </ScrollReveal>
        )
      })}
    </div>
  )
}
