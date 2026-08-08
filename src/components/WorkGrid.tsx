import Image from 'next/image'
import Link from 'next/link'
import type { WorkItem } from '@/lib/data'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { ScrollReveal } from '@/components/ScrollReveal'

const LAYOUT_PATTERN = [
  'md:col-span-7 aspect-[4/3]',
  'md:col-span-5 aspect-[3/4]',
  'md:col-span-5 aspect-[3/4]',
  'md:col-span-7 aspect-[4/3]',
  'md:col-span-12 aspect-[16/8]',
]

export function WorkGrid({ items }: { items: WorkItem[] }) {
  if (items.length === 0) {
    return (
      <p className="font-body text-navy/50">
        Case studies are managed in the CMS and will appear here once published.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-10">
      {items.map((item, i) => {
        const layout = LAYOUT_PATTERN[i % LAYOUT_PATTERN.length]
        const imageUrl = mediaUrl(item.coverImage)

        return (
          <ScrollReveal key={item.id} className={`col-span-1 ${layout}`}>
            <Link
              href={`/work/${item.slug}`}
              data-cursor="VIEW CASE →"
              className="group relative block h-full w-full overflow-hidden bg-navy"
            >
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={mediaAlt(item.coverImage, item.title)}
                  fill
                  sizes="(min-width: 768px) 60vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              )}
              <div className="absolute inset-0 bg-navy/20 transition-colors duration-500 group-hover:bg-navy/70" />

              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <span className="font-heading text-xs font-semibold tracking-[0.15em] text-teal opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  {item.category}
                </span>
                <h3 className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-md font-body text-sm text-white/0 transition-colors duration-500 group-hover:text-white/80">
                  {item.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 font-heading text-xs font-semibold tracking-[0.1em] text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  VIEW CASE →
                </span>
              </div>
            </Link>
          </ScrollReveal>
        )
      })}
    </div>
  )
}
