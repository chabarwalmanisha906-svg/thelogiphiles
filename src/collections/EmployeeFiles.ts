import type { CollectionConfig } from 'payload'

export const EmployeeFiles: CollectionConfig = {
  slug: 'employee-files',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'employee', 'folder', 'createdAt'],
  },
  defaultSort: '-createdAt',
  access: {
    // Any employee can VIEW/download all of their own files, including ones an
    // admin uploaded on their behalf (ID proof, joining letters, etc.) — but
    // update/delete is restricted below to whoever actually uploaded the file,
    // so an employee can't remove HR documents they didn't put there.
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.collection === 'users') return true
      return { employee: { equals: req.user.id } }
    },
    create: ({ req }) => !!req.user,
    update: async ({ req, id }) => {
      if (!req.user) return false
      if (req.user.collection === 'users') return true
      if (!id) return false
      const doc = await req.payload.findByID({ collection: 'employee-files', id: id as string, depth: 0 })
      return (
        doc?.uploadedBy?.relationTo === req.user.collection && String(doc.uploadedBy.value) === String(req.user.id)
      )
    },
    delete: async ({ req, id }) => {
      if (!req.user) return false
      if (req.user.collection === 'users') return true
      if (!id) return false
      const doc = await req.payload.findByID({ collection: 'employee-files', id: id as string, depth: 0 })
      return (
        doc?.uploadedBy?.relationTo === req.user.collection && String(doc.uploadedBy.value) === String(req.user.id)
      )
    },
  },
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        if (req.user && req.user.collection !== 'users') {
          data.employee = req.user.id
        }
        if (operation === 'create' && req.user) {
          data.uploadedBy = { relationTo: req.user.collection, value: req.user.id }
        }
        return data
      },
    ],
  },
  upload: {
    staticDir: 'employee-files',
    // These are sensitive HR documents (resumes, ID proof, joining letters). The
    // Vercel Blob storage adapter marks every successful file response
    // `Cache-Control: public, max-age=31536000` — Vercel's edge CDN then caches
    // that response and serves it to anyone with the URL for a year, bypassing
    // Payload's access control entirely on every request after the first
    // authenticated view. Force no-store so each request re-checks access.
    modifyResponseHeaders: ({ headers }) => {
      headers.set('Cache-Control', 'private, no-store')
      return headers
    },
  },
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'employee', type: 'relationship', relationTo: 'employees', required: true },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: ['users', 'employees'],
      admin: { readOnly: true, description: 'Who actually uploaded this file — set automatically.' },
    },
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
