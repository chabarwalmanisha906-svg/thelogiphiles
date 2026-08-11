import type { CollectionConfig } from 'payload'

export const Conversations: CollectionConfig = {
  slug: 'conversations',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'isGroup', 'memberKeys'],
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      return { memberKeys: { equals: `${req.user.collection}:${req.user.id}` } }
    },
    create: ({ req }) => !!req.user,
    update: ({ req }) => {
      if (!req.user) return false
      return { memberKeys: { equals: `${req.user.collection}:${req.user.id}` } }
    },
    delete: ({ req }) => req.user?.collection === 'users',
  },
  fields: [
    { name: 'title', type: 'text' },
    { name: 'isGroup', type: 'checkbox', defaultValue: false },
    {
      name: 'memberKeys',
      type: 'text',
      hasMany: true,
      required: true,
      admin: { description: "Format: 'users:1' or 'employees:3'" },
    },
  ],
}
