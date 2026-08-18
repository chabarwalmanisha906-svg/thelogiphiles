import type { CollectionConfig } from 'payload'

export const ChatAttachments: CollectionConfig = {
  slug: 'chat-attachments',
  admin: {
    useAsTitle: 'filename',
  },
  access: {
    read: ({ req }) => !!req.user,
    create: ({ req }) => !!req.user,
    update: () => false,
    delete: ({ req }) => req.user?.collection === 'users',
  },
  upload: {
    staticDir: 'chat-attachments',
    // Chat attachments are access-controlled per-request above, but the Vercel Blob
    // storage adapter marks every successful file response `Cache-Control: public,
    // max-age=31536000` — Vercel's edge CDN then caches that response and serves it
    // to anyone with the URL for a year, bypassing access control entirely on every
    // request after the first. Force no-store so each request re-checks access.
    modifyResponseHeaders: ({ headers }) => {
      headers.set('Cache-Control', 'private, no-store')
      return headers
    },
  },
  fields: [],
}
