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
  },
  fields: [],
}
