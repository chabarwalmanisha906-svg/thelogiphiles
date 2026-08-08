import type { MetadataRoute } from 'next'
import { getPosts, getWork } from '@/lib/data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const [work, posts] = await Promise.all([getWork(), getPosts()])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/work`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/insights`, changeFrequency: 'weekly', priority: 0.8 },
  ]

  const workRoutes: MetadataRoute.Sitemap = work.map((item) => ({
    url: `${siteUrl}/work/${item.slug}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/insights/${post.slug}`,
    lastModified: post.publishedDate,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...workRoutes, ...postRoutes]
}
