import type { CollectionConfig } from 'payload'

export const Tasks: CollectionConfig = {
  slug: 'tasks',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'employee', 'status', 'accepted'],
  },
  defaultSort: '-createdAt',
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.collection === 'users') return true
      return { employee: { equals: req.user.id } }
    },
    create: ({ req }) => req.user?.collection === 'users',
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.collection === 'users') return true
      return { employee: { equals: req.user.id } }
    },
    delete: ({ req }) => req.user?.collection === 'users',
  },
  hooks: {
    beforeChange: [
      ({ req, data, originalDoc, operation }) => {
        if (operation === 'update' && req.user && req.user.collection !== 'users' && originalDoc) {
          data.employee = originalDoc.employee
          data.title = originalDoc.title
          data.description = originalDoc.description
          data.deadline = originalDoc.deadline
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'employee', type: 'relationship', relationTo: 'employees', required: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'todo',
      options: [
        { label: 'To Do', value: 'todo' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Review Requested', value: 'review' },
        { label: 'Completed', value: 'completed' },
      ],
    },
    { name: 'accepted', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'deadline', type: 'date', admin: { position: 'sidebar' } },
  ],
}
