import type { CollectionConfig } from 'payload'

export const Messages: CollectionConfig = {
  slug: 'messages',
  admin: {
    useAsTitle: 'text',
    defaultColumns: ['conversation', 'sender', 'text', 'createdAt'],
  },
  defaultSort: 'createdAt',
  access: {
    // Dot-notation traversal into a hasMany text field (conversation.memberKeys)
    // produces a broken join in the Postgres adapter, so resolve membership to a
    // concrete list of conversation IDs first instead.
    read: async ({ req }) => {
      if (!req.user) return false
      const key = `${req.user.collection}:${req.user.id}`
      const convos = await req.payload.find({
        collection: 'conversations',
        where: { memberKeys: { equals: key } },
        limit: 1000,
        depth: 0,
        req,
      })
      const ids = convos.docs.map((c) => c.id)
      if (ids.length === 0) return false
      return { conversation: { in: ids } }
    },
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
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return
        const conversation = await req.payload.findByID({
          collection: 'conversations',
          id: typeof doc.conversation === 'object' ? doc.conversation.id : doc.conversation,
          req,
        })
        if (!conversation) return

        const senderKey = req.user ? `${req.user.collection}:${req.user.id}` : ''
        const senderName = req.user?.collection === 'users' ? req.user.name || req.user.email : req.user?.name
        const preview = doc.text ? String(doc.text).slice(0, 80) : doc.attachment ? '📎 Attachment' : ''

        const unreadCounts: Record<string, number> = { ...(conversation.unreadCounts || {}) }
        for (const memberKey of conversation.memberKeys || []) {
          if (memberKey === senderKey) continue
          unreadCounts[memberKey] = (unreadCounts[memberKey] || 0) + 1
        }

        await req.payload.update({
          collection: 'conversations',
          id: conversation.id,
          data: {
            lastMessageAt: doc.createdAt,
            lastMessagePreview: preview,
            lastMessageSenderName: senderName || 'Someone',
            unreadCounts,
          },
          req,
        })
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
