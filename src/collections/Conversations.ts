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
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        // Notification pings send only the requester's own key so they never
        // clobber other members' unread counts with a stale snapshot.
        if (data.unreadCounts && originalDoc?.unreadCounts) {
          data.unreadCounts = { ...originalDoc.unreadCounts, ...data.unreadCounts }
        }
        return data
      },
    ],
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
    { name: 'lastMessageAt', type: 'date', admin: { position: 'sidebar' } },
    { name: 'lastMessagePreview', type: 'text', admin: { position: 'sidebar' } },
    { name: 'lastMessageSenderName', type: 'text', admin: { position: 'sidebar' } },
    {
      name: 'unreadCounts',
      type: 'json',
      defaultValue: {},
      admin: { position: 'sidebar', description: "Map of 'users:1' / 'employees:3' -> unread count" },
    },
  ],
}
