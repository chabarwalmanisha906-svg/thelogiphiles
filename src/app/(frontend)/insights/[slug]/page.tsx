import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPostBySlug, getPosts } from '@/lib/data'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { ScrollReveal } from '@/components/ScrollReveal'

export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const imageUrl = mediaUrl(post.featuredImage)
  const categoryName = typeof post.category === 'string' ? post.category : post.category?.name

  return (
    <article className="px-6 pb-28 pt-40 md:px-10 md:pb-36 md:pt-48">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          <div className="flex items-center gap-3 font-heading text-xs font-semibold tracking-[0.15em] text-teal-dark">
            {categoryName && <span>{categoryName.toUpperCase()}</span>}
            {categoryName && <span className="text-navy/30">/</span>}
            <span className="text-navy/50">{formatDate(post.publishedDate)}</span>
          </div>
          <h1 className="mt-5 font-heading text-[clamp(2rem,5.5vw,3.75rem)] font-extrabold leading-[1.02] tracking-tight text-navy">
            {post.title}
          </h1>
          {post.author && (
            <p className="mt-4 font-body text-sm text-navy/50">By {post.author}</p>
          )}
        </ScrollReveal>

        {imageUrl && (
          <ScrollReveal delay={0.1} className="relative mt-12 aspect-[16/9] w-full overflow-hidden bg-navy/5">
            <Image
              src={imageUrl}
              alt={mediaAlt(post.featuredImage, post.title)}
              fill
              priority
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          </ScrollReveal>
        )}

        <ScrollReveal delay={0.15} className="mt-12">
          <RichTextRenderer data={post.content as never} />
        </ScrollReveal>
      </div>
    </article>
  )
}
