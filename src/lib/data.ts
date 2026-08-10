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
  tags?: string[]
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

export type TeamMemberItem = {
  id: string
  name: string
  role: string
  photo: { url?: string | null; alt?: string | null } | string
  linkedinUrl?: string | null
  bio?: string | null
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
  heroLineOne: 'YES, YOU ARE RIGHT;',
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

export const FALLBACK_WORK: WorkItem[] = [
  {
    id: 'health-keyz',
    title: 'HEALTH KEYZ',
    slug: 'health-keyz',
    category: 'Healthcare · Advertising · Brand Communication',
    description: 'Making healthcare easier to find, understand and access.',
    coverImage: {
      url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=85',
      alt: 'Health Keyz',
    },
    order: 1,
  },
  {
    id: 'archer',
    title: 'ARCHER',
    slug: 'archer',
    category: 'Education · Brand · Communication',
    description: 'Building a sharper voice for the next generation of sales leaders.',
    coverImage: {
      url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=85',
      alt: 'Archer',
    },
    order: 2,
  },
  {
    id: 'indorenama',
    title: 'INDORENAMA',
    slug: 'indorenama',
    category: 'Culture · Content · Storytelling',
    description: 'A city has a lot to say. We just give it the words.',
    coverImage: {
      url: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=85',
      alt: 'IndoreNama',
    },
    order: 3,
  },
  {
    id: 'unbiased-stringers',
    title: 'UNBIASED STRINGERS',
    slug: 'unbiased-stringers',
    category: 'Media · Editorial · Brand Identity',
    description: 'Independent stories need an independent voice.',
    coverImage: {
      url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1600&q=85',
      alt: 'Unbiased Stringers',
    },
    order: 4,
  },
  {
    id: 'the-logiphiles',
    title: 'THE LOGIPHILES',
    slug: 'the-logiphiles',
    category: 'Brand · Advertising · Communication',
    description: 'Yes, you are right. We write.',
    coverImage: {
      url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=85',
      alt: 'The Logiphiles',
    },
    order: 5,
  },
]

export async function getWork(): Promise<WorkItem[]> {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'work',
      sort: 'order',
      limit: 50,
      depth: 1,
    })
    return result.docs.length > 0 ? (result.docs as unknown as WorkItem[]) : FALLBACK_WORK
  } catch {
    return FALLBACK_WORK
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
    if (result.docs[0]) return result.docs[0] as unknown as WorkItem
    return FALLBACK_WORK.find((item) => item.slug === slug) ?? null
  } catch {
    return FALLBACK_WORK.find((item) => item.slug === slug) ?? null
  }
}

export const FALLBACK_POSTS: PostItem[] = [
  {
    id: 'why-the-right-word-can-change-a-campaign',
    title: 'WHY THE RIGHT WORD CAN CHANGE A CAMPAIGN',
    slug: 'why-the-right-word-can-change-a-campaign',
    category: 'ADVERTISING',
    publishedDate: '2026-08-08',
    excerpt:
      "A good campaign doesn't always need more. Sometimes it simply needs better words. Here's why the smallest line in an idea can sometimes carry the biggest weight.",
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1600&q=85',
      alt: 'Writing and advertising',
    },
    tags: ['advertising'],
  },
  {
    id: 'translation-is-not-enough',
    title: 'TRANSLATION IS NOT ENOUGH',
    slug: 'translation-is-not-enough',
    category: 'LANGUAGE',
    publishedDate: '2026-08-04',
    excerpt: "Because language isn't just about changing words. It's about carrying the idea with them.",
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1400&q=85',
      alt: 'Books and language',
    },
    tags: ['language'],
  },
  {
    id: 'what-ai-can-write',
    title: "WHAT AI CAN WRITE. AND WHAT IT CAN'T.",
    slug: 'what-ai-can-write',
    category: 'AI · WRITING',
    publishedDate: '2026-07-30',
    excerpt: 'AI can generate words at astonishing speed. But writing is more than generating words.',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=85',
      alt: 'Artificial intelligence and writing',
    },
    tags: ['ai', 'content'],
  },
  {
    id: 'good-copy-doesnt-shout',
    title: "GOOD COPY DOESN'T HAVE TO SHOUT",
    slug: 'good-copy-doesnt-shout',
    category: 'COPYWRITING',
    publishedDate: '2026-07-26',
    excerpt: 'Sometimes the smartest line in the room is the one that knows when to stay quiet.',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1400&q=85',
      alt: 'Creative writing',
    },
    tags: ['advertising', 'content'],
  },
  {
    id: 'brands-need-a-voice',
    title: 'YOUR BRAND NEEDS A VOICE',
    slug: 'brands-need-a-voice',
    category: 'BRANDING',
    publishedDate: '2026-07-22',
    excerpt: "A brand isn't only what it looks like. It's also what it sounds like.",
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=85',
      alt: 'Brand strategy',
    },
    tags: ['branding'],
  },
  {
    id: 'content-is-not-a-strategy',
    title: 'CONTENT IS NOT A STRATEGY',
    slug: 'content-is-not-a-strategy',
    category: 'CONTENT',
    publishedDate: '2026-07-18',
    excerpt: "Publishing more doesn't automatically mean communicating better.",
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=85',
      alt: 'Content strategy',
    },
    tags: ['content'],
  },
  {
    id: 'editorial-still-matters',
    title: 'WHY EDITORIAL STILL MATTERS',
    slug: 'editorial-still-matters',
    category: 'EDITORIAL',
    publishedDate: '2026-07-14',
    excerpt: 'In a world full of instant opinions, context has become a competitive advantage.',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=85',
      alt: 'Editorial',
    },
    tags: ['editorial'],
  },
  {
    id: 'transcreation-is-not-translation',
    title: 'TRANSCREATION: WHEN WORDS NEED TO TRAVEL',
    slug: 'transcreation-is-not-translation',
    category: 'LANGUAGE',
    publishedDate: '2026-07-10',
    excerpt: 'Taking an idea from one culture to another requires more than a dictionary.',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1455885666463-2a50f8a1d5a5?auto=format&fit=crop&w=1200&q=85',
      alt: 'Language',
    },
    tags: ['language', 'advertising'],
  },
  {
    id: 'the-headline-is-not-the-campaign',
    title: 'THE HEADLINE IS NOT THE CAMPAIGN',
    slug: 'the-headline-is-not-the-campaign',
    category: 'ADVERTISING',
    publishedDate: '2026-07-06',
    excerpt: 'A great line matters. But a great idea has to carry the line.',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=85',
      alt: 'Advertising',
    },
    tags: ['advertising'],
  },
  {
    id: 'writing-for-humans',
    title: 'WRITE FOR HUMANS FIRST',
    slug: 'writing-for-humans',
    category: 'CONTENT',
    publishedDate: '2026-07-02',
    excerpt: 'Algorithms can distribute content. Only people can decide whether it matters.',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=1200&q=85',
      alt: 'Writing',
    },
    tags: ['content', 'ai'],
  },
]

export async function getPosts(): Promise<PostItem[]> {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'posts',
      sort: '-publishedDate',
      limit: 50,
      depth: 1,
    })
    return result.docs.length > 0 ? (result.docs as unknown as PostItem[]) : FALLBACK_POSTS
  } catch {
    return FALLBACK_POSTS
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
    if (result.docs[0]) return result.docs[0] as unknown as PostItem
    return FALLBACK_POSTS.find((post) => post.slug === slug) ?? null
  } catch {
    return FALLBACK_POSTS.find((post) => post.slug === slug) ?? null
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

export async function getTeamMembers(): Promise<TeamMemberItem[]> {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'team-members',
      where: { visible: { equals: true } },
      sort: 'order',
      limit: 50,
      depth: 1,
    })
    return result.docs as unknown as TeamMemberItem[]
  } catch {
    return []
  }
}
