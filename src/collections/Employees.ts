import type { CollectionConfig } from 'payload'

export const Employees: CollectionConfig = {
  slug: 'employees',
  auth: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'department', 'role', 'joiningDate'],
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.collection === 'users') return true
      return { id: { equals: req.user.id } }
    },
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.collection === 'users') return true
      return { id: { equals: req.user.id } }
    },
    create: ({ req }) => req.user?.collection === 'users',
    delete: ({ req }) => req.user?.collection === 'users',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', label: 'Designation' },
    { name: 'department', type: 'text' },
    { name: 'phone', type: 'text' },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'joiningDate', type: 'date' },
    {
      name: 'paidLeaveBalance',
      type: 'number',
      defaultValue: 12,
      admin: { position: 'sidebar' },
    },
    {
      name: 'sickLeaveBalance',
      type: 'number',
      defaultValue: 6,
      admin: { position: 'sidebar' },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
