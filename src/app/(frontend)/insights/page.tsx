import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getPosts } from '@/lib/data'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { InsightsArchive } from '@/components/InsightsArchive'
import { ScrollReveal } from '@/components/ScrollReveal'
import { GhostHeading } from '@/components/GhostHeading'

export const metadata: Metadata = {
  title: 'Insights',
  description: 'Words on our mind — perspectives on advertising, language and communication from The Logiphiles.',
}

export const revalidate = 60

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function InsightsPage() {
  const posts = await getPosts()
  const [featured, ...rest] = posts

  return (
    <div className="px-6 pt-40 md:px-10 md:pt-48">
      <div className="relative mx-auto max-w-[1600px]">
        <GhostHeading className="pointer-events-none absolute -top-6 right-0 hidden lg:block">
          INSIGHTS
        </GhostHeading>

        <ScrollReveal className="relative mb-16 max-w-3xl">
          <span className="font-heading text-sm font-semibold tracking-[0.2em] text-mint">
            06 — INSIGHTS
          </span>
          <h1 className="mt-4 font-heading text-[clamp(2.75rem,8vw,7rem)] font-extrabold leading-[0.98] tracking-tight text-navy">
            WORDS ON OUR
            <br />
            <span className="text-mint">MIND.</span>
          </h1>
          <p className="mt-8 max-w-xl font-body text-base leading-relaxed text-navy/60 sm:text-lg">
            Ideas, observations, opinions and stories from people who spend a little too much
            time thinking about words, brands, culture and communication.
          </p>
        </ScrollReveal>

        {featured && (
          <ScrollReveal delay={0.1}>
            <Link
              href={`/insights/${featured.slug}`}
              data-cursor="READ FEATURED →"
              className="group mb-24 grid overflow-hidden bg-navy md:grid-cols-[1.25fr_0.75fr]"
            >
              <div className="relative aspect-[16/9] overflow-hidden md:aspect-auto">
                {mediaUrl(featured.featuredImage) && (
                  <Image
                    src={mediaUrl(featured.featuredImage)}
                    alt={mediaAlt(featured.featuredImage, featured.title)}
                    fill
                    unoptimized
                    sizes="(min-width: 768px) 62vw, 100vw"
                    className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.045]"
                  />
                )}
                <span className="absolute left-6 top-6 bg-mint px-3 py-2 font-heading text-[9px] font-bold tracking-[0.05em] text-navy">
                  FEATURED
                </span>
              </div>

              <div className="flex flex-col justify-center p-9 md:p-14">
                <div className="mb-5 font-heading text-[10px] font-bold tracking-[0.08em] text-mint">
                  {(typeof featured.category === 'string' ? featured.category : featured.category?.name)?.toUpperCase()}
                  {' · '}
                  {formatDate(featured.publishedDate)}
                </div>
                <h2 className="font-heading text-[clamp(2rem,4vw,3.6rem)] font-extrabold leading-[0.98] tracking-tight text-white">
                  {featured.title}
                </h2>
                <p className="mt-6 font-body text-sm leading-relaxed text-white/70">
                  {featured.excerpt}
                </p>
                <span className="mt-8 inline-block font-heading text-[11px] font-bold text-mint transition-transform duration-300 group-hover:translate-x-1.5">
                  READ FEATURED ARTICLE →
                </span>
              </div>
            </Link>
          </ScrollReveal>
        )}

        <ScrollReveal className="mb-10 flex items-end justify-between gap-6">
          <h2 className="font-heading text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-[0.9] tracking-tight text-navy">
            LATEST
            <br />
            THINKING.
          </h2>
          <p className="hidden font-body text-sm text-navy/50 sm:block">
            Fresh words from The Logiphiles.
          </p>
        </ScrollReveal>

        <InsightsArchive items={rest} />
      </div>

      <section className="mt-32 bg-navy px-6 py-24 text-center md:px-10 md:py-28">
        <h2 className="font-heading text-[clamp(2.5rem,6vw,5rem)] font-extrabold leading-[0.9] tracking-tight text-white">
          GOT AN IDEA
          <br />
          <span className="text-mint">WORTH WRITING?</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl font-body text-white/70">
          Tell us what you&apos;re building, launching, changing or trying to say.
        </p>
        <Link
          href="/#contact"
          className="mt-8 inline-block rounded-full bg-mint px-7 py-4 font-heading text-[11px] font-bold text-navy transition-colors duration-300 hover:bg-white"
        >
          LET&apos;S WRITE IT →
        </Link>
      </section>
    </div>
  )
}
