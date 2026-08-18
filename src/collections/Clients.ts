import type { CollectionConfig } from 'payload'
import { createClientDriveFolders } from '../lib/googleDrive'

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
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create' || doc.driveFolderId) return
        try {
          const folders = await createClientDriveFolders(req.payload, doc.name)
          if (!folders) return // Drive not connected — skip silently, this is a best-effort enhancement
          await req.payload.update({
            collection: 'clients',
            id: doc.id,
            data: {
              driveFolderId: folders.folderId,
              driveDocumentsFolderId: folders.documentsFolderId,
              driveProjectsFolderId: folders.projectsFolderId,
            },
            req,
          })
        } catch (err) {
          console.error(`Failed to create Drive folders for client "${doc.name}":`, err)
        }
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'industry', type: 'text' },
    { name: 'contactPerson', type: 'text', label: 'Contact Person' },
    { name: 'contactEmail', type: 'email', label: 'Contact Email' },
    { name: 'contactPhone', type: 'text', label: 'Contact Phone' },
    { name: 'owner', type: 'relationship', relationTo: 'users', label: 'Assigned Team Member' },
    { name: 'value', type: 'number', label: 'Monthly value (₹)' },
    {
      name: 'pitchDetails',
      type: 'textarea',
      label: 'Pitch Details',
      admin: { description: 'What was pitched — carried over automatically when converted from Pitch CRM.' },
    },
    {
      name: 'communicationHistory',
      type: 'textarea',
      label: 'Communication History',
      admin: { description: 'Running notes/log — seeded from Pitch CRM notes when a prospect converts.' },
    },
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
    {
      name: 'driveFolderId',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true, description: 'Google Drive client folder ID.' },
    },
    { name: 'driveDocumentsFolderId', type: 'text', admin: { position: 'sidebar', readOnly: true } },
    { name: 'driveProjectsFolderId', type: 'text', admin: { position: 'sidebar', readOnly: true } },
  ],
}
