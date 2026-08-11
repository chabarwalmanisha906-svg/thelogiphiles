import type { CollectionConfig } from 'payload'

export const Messages: CollectionConfig = {
  slug: 'messages',
  admin: {
    useAsTitle: 'text',
    defaultColumns: ['conversation', 'sender', 'text', 'createdAt'],
  },
  defaultSort: 'createdAt',
  access: {
    read: ({ req }) => !!req.user,
    create: ({ req }) => !!req.user,
    update: () => false,
    delete: ({ req }) => req.user?.collection === 'users',
  },
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        if (operation === 'create' && req.user) {
          data.sender = { relationTo: req.user.collection, value: req.user.id }
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'conversation', type: 'relationship', relationTo: 'conversations', required: true },
    { name: 'sender', type: 'relationship', relationTo: ['users', 'employees'], required: true },
    { name: 'text', type: 'textarea' },
    { name: 'attachment', type: 'relationship', relationTo: 'chat-attachments' },
  ],
}
