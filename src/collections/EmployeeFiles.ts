import type { CollectionConfig } from 'payload'

export const EmployeeFiles: CollectionConfig = {
  slug: 'employee-files',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'employee', 'folder', 'createdAt'],
  },
  defaultSort: '-createdAt',
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.collection === 'users') return true
      return { employee: { equals: req.user.id } }
    },
    create: ({ req }) => !!req.user,
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.collection === 'users') return true
      return { employee: { equals: req.user.id } }
    },
    delete: ({ req }) => {
      if (!req.user) return false
      if (req.user.collection === 'users') return true
      return { employee: { equals: req.user.id } }
    },
  },
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (req.user && req.user.collection !== 'users') {
          data.employee = req.user.id
        }
        return data
      },
    ],
  },
  upload: {
    staticDir: 'employee-files',
  },
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'employee', type: 'relationship', relationTo: 'employees', required: true },
    {
      name: 'folder',
      type: 'select',
      defaultValue: 'other',
      options: [
        { label: 'Resume', value: 'resume' },
        { label: 'ID Proof', value: 'id-proof' },
        { label: 'Joining Documents', value: 'joining-documents' },
        { label: 'Certificates', value: 'certificates' },
        { label: 'Brand Logos', value: 'brand-logos' },
        { label: 'Canva Templates', value: 'canva-templates' },
        { label: 'Video Assets', value: 'video-assets' },
        { label: 'Documents', value: 'documents' },
        { label: 'Other', value: 'other' },
      ],
    },
  ],
}
