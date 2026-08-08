import { getPayloadClient } from './payload'

export type WorkItem = {
  id: string
  title: string
  slug: string
  category: string
  client?: string | null
  description: string
  coverImage: { url?: string | null; alt?: string | null } | string
  featured?: boolean | null
  order?: number | null
  challenge?: unknown
  approach?: unknown
  workImages?: { image: { url?: string | null; alt?: string | null } | string; caption?: string | null }[]
  writingSamples?: { heading?: string | null; copy?: string | null }[]
  outcome?: unknown
  gallery?: { image: { url?: string | null; alt?: string | null } | string }[]
  seoTitle?: string | null
  seoDescription?: string | null
}

export type PostItem = {
  id: string
  title: string
  slug: string
  category: { name: string; slug: string } | string
  author?: string | null
  publishedDate: string
  featuredImage: { url?: string | null; alt?: string | null } | string
  excerpt: string
  content?: unknown
  seoTitle?: string | null
  seoDescription?: string | null
}

export type ClientItem = {
  id: string
  name: string
  logo: { url?: string | null; alt?: string | null } | string
  visible?: boolean | null
  order?: number | null
}

export type SiteSettings = {
  heroLineOne?: string | null
  heroLineTwo?: string | null
  heroSupportLine?: string | null
  heroParagraph?: string | null
  stats?: { value: string; label: string }[]
  contactEmail?: string | null
  instagramUrl?: string | null
  linkedinUrl?: string | null
  youtubeUrl?: string | null
  twitterUrl?: string | null
  facebookUrl?: string | null
  defaultSeoTitle?: string | null
  defaultSeoDescription?: string | null
}

const FALLBACK_SETTINGS: SiteSettings = {
  heroLineOne: 'YES, YOU ARE RIGHT.',
  heroLineTwo: 'WE WRITE.',
  heroSupportLine: 'Advertising writing. Brand copy. Content. Language. Ideas.',
  heroParagraph:
    'We turn ideas into words people remember, brands people notice and campaigns people talk about.',
  stats: [
    { value: '36+', label: 'Languages' },
    { value: '100+', label: 'Projects' },
    { value: '', label: 'Brands' },
    { value: '', label: 'Industries' },
  ],
  contactEmail: 'hello@thelogiphiles.com',
  instagramUrl: '',
  linkedinUrl: '',
  youtubeUrl: '',
  twitterUrl: '',
  facebookUrl: '',
  defaultSeoTitle: 'The Logiphiles | Advertising Writing & Brand Communication',
  defaultSeoDescription:
    'The Logiphiles is an advertising writing and communication agency creating brand copy, campaigns, content and multilingual communication.',
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({ slug: 'site-settings' })
    return { ...FALLBACK_SETTINGS, ...settings }
  } catch {
    return FALLBACK_SETTINGS
  }
}

export async function getWork(): Promise<WorkItem[]> {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'work',
      sort: 'order',
      limit: 50,
      depth: 1,
    })
    return result.docs as unknown as WorkItem[]
  } catch {
    return []
  }
}

export async function getWorkBySlug(slug: string): Promise<WorkItem | null> {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'work',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 2,
    })
    return (result.docs[0] as unknown as WorkItem) ?? null
  } catch {
    return null
  }
}

export async function getPosts(): Promise<PostItem[]> {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'posts',
      sort: '-publishedDate',
      limit: 50,
      depth: 1,
    })
    return result.docs as unknown as PostItem[]
  } catch {
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<PostItem | null> {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'posts',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 2,
    })
    return (result.docs[0] as unknown as PostItem) ?? null
  } catch {
    return null
  }
}

export async function getClients(): Promise<ClientItem[]> {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'clients',
      where: { visible: { equals: true } },
      sort: 'order',
      limit: 50,
      depth: 1,
    })
    return result.docs as unknown as ClientItem[]
  } catch {
    return []
  }
}
