type MediaLike = { url?: string | null; alt?: string | null } | string | null | undefined

export function mediaUrl(media: MediaLike): string {
  if (!media) return ''
  if (typeof media === 'string') return ''
  return media.url ?? ''
}

export function mediaAlt(media: MediaLike, fallback = ''): string {
  if (!media || typeof media === 'string') return fallback
  return media.alt ?? fallback
}
