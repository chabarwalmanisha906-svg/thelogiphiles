import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getWork, getWorkBySlug } from '@/lib/data'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { ScrollReveal } from '@/components/ScrollReveal'

export async function generateStaticParams() {
  const work = await getWork()
  return work.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const item = await getWorkBySlug(slug)
  if (!item) return {}

  return {
    title: item.seoTitle || item.title,
    description: item.seoDescription || item.description,
  }
}

export default async function WorkCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [item, allWork] = await Promise.all([getWorkBySlug(slug), getWork()])

  if (!item) notFound()

  const currentIndex = allWork.findIndex((w) => w.slug === slug)
  const nextProject =
    currentIndex >= 0 ? allWork[(currentIndex + 1) % allWork.length] : undefined

  const coverUrl = mediaUrl(item.coverImage)

  return (
    <article>
      <header className="px-6 pb-16 pt-40 md:px-10 md:pb-20 md:pt-48">
        <div className="mx-auto max-w-[1600px]">
          <ScrollReveal>
            <span className="font-heading text-sm font-semibold tracking-[0.2em] text-mint">
              {item.category}
              {item.client ? ` · ${item.client}` : ''}
            </span>
            <h1 className="mt-4 max-w-4xl font-heading text-[clamp(2.25rem,6vw,5.5rem)] font-extrabold leading-[0.98] tracking-tight text-navy">
              {item.title}
            </h1>
            <p className="mt-6 max-w-2xl font-body text-lg leading-relaxed text-navy/70">
              {item.description}
            </p>
          </ScrollReveal>
        </div>
      </header>

      {coverUrl && (
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={coverUrl}
            alt={mediaAlt(item.coverImage, item.title)}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="mx-auto max-w-[1600px] px-6 py-20 md:px-10 md:py-28">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-20">
          {item.challenge != null && (
            <ScrollReveal>
              <h2 className="font-heading text-sm font-semibold tracking-[0.2em] text-navy/50">
                CHALLENGE
              </h2>
              <RichTextRenderer data={item.challenge as never} className="mt-4" />
            </ScrollReveal>
          )}

          {item.approach != null && (
            <ScrollReveal delay={0.05}>
              <h2 className="font-heading text-sm font-semibold tracking-[0.2em] text-navy/50">
                APPROACH
              </h2>
              <RichTextRenderer data={item.approach as never} className="mt-4" />
            </ScrollReveal>
          )}
        </div>

        {item.workImages && item.workImages.length > 0 && (
          <div className="mt-24 flex flex-col gap-10">
            {item.workImages.map((work, i) => {
              const url = mediaUrl(work.image)
              if (!url) return null
              return (
                <ScrollReveal key={i}>
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-navy/5">
                    <Image
                      src={url}
                      alt={mediaAlt(work.image, work.caption || item.title)}
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                  {work.caption && (
                    <p className="mt-3 font-body text-sm text-navy/50">{work.caption}</p>
                  )}
                </ScrollReveal>
              )
            })}
          </div>
        )}

        {item.writingSamples && item.writingSamples.length > 0 && (
          <ScrollReveal className="mt-24 max-w-3xl">
            <h2 className="font-heading text-sm font-semibold tracking-[0.2em] text-navy/50">
              SELECTED WRITING
            </h2>
            <div className="mt-6 flex flex-col gap-8">
              {item.writingSamples.map((sample, i) => (
                <div key={i}>
                  {sample.heading && (
                    <p className="font-heading text-lg font-bold text-navy">{sample.heading}</p>
                  )}
                  {sample.copy && (
                    <p className="mt-2 font-body text-lg leading-relaxed text-navy/70">
                      {sample.copy}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </ScrollReveal>
        )}

        {item.outcome != null && (
          <ScrollReveal className="mt-24 max-w-3xl">
            <h2 className="font-heading text-sm font-semibold tracking-[0.2em] text-navy/50">
              OUTCOME
            </h2>
            <RichTextRenderer data={item.outcome as never} className="mt-4" />
          </ScrollReveal>
        )}

        {item.gallery && item.gallery.length > 0 && (
          <div className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {item.gallery.map((g, i) => {
              const url = mediaUrl(g.image)
              if (!url) return null
              return (
                <div key={i} className="relative aspect-[4/3] overflow-hidden bg-navy/5">
                  <Image
                    src={url}
                    alt={mediaAlt(g.image, item.title)}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {nextProject && (
        <Link
          href={`/work/${nextProject.slug}`}
          data-cursor="VIEW CASE →"
          className="group block border-t border-navy/10 bg-navy px-6 py-20 md:px-10 md:py-28"
        >
          <div className="mx-auto max-w-[1600px]">
            <span className="font-heading text-sm font-semibold tracking-[0.2em] text-mint">
              NEXT PROJECT
            </span>
            <h2 className="mt-4 flex items-center gap-4 font-heading text-[clamp(2rem,5.5vw,4.5rem)] font-extrabold leading-[0.98] tracking-tight text-white transition-transform duration-300 group-hover:translate-x-3">
              {nextProject.title}
              <span className="text-mint">→</span>
            </h2>
          </div>
        </Link>
      )}
    </article>
  )
}
