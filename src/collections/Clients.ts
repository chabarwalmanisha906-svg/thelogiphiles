import type { CollectionConfig } from 'payload'

export const Clients: CollectionConfig = {
  slug: 'clients',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'visible', 'order'],
  },
  access: {
    read: ({ req }) => {
      if (req.user?.collection === 'users') return true
      return { visible: { equals: true } }
    },
    create: ({ req }) => req.user?.collection === 'users',
    update: ({ req }) => req.user?.collection === 'users',
    delete: ({ req }) => req.user?.collection === 'users',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'industry', type: 'text' },
    { name: 'owner', type: 'relationship', relationTo: 'users' },
    { name: 'value', type: 'number', label: 'Monthly value (₹)' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Onboarding', value: 'onboarding' },
        { label: 'At Risk', value: 'at-risk' },
      ],
    },
    { name: 'onboardedDate', type: 'date' },
    { name: 'visible', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
