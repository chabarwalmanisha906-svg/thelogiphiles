import type { CollectionConfig } from 'payload'

export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  labels: { singular: 'Enquiry', plural: 'Enquiries' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'service', 'createdAt'],
    description: 'Contact form submissions from the website.',
  },
  access: {
    create: () => true,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'company', type: 'text' },
    { name: 'phone', type: 'text' },
    {
      name: 'service',
      type: 'select',
      options: [
        'Advertising Writing',
        'Brand Copy',
        'Content',
        'Editorial',
        'Translation',
        'Transcreation',
        'Multilingual Communication',
        'Digital Communication',
        'Pitch Decks & Business Communication',
        'Other',
      ],
    },
    { name: 'message', type: 'textarea', required: true },
    { name: 'value', type: 'number', label: 'Estimated value (₹)', admin: { position: 'sidebar' } },
    { name: 'owner', type: 'relationship', relationTo: 'users', admin: { position: 'sidebar' } },
    {
      name: 'stage',
      type: 'select',
      defaultValue: 'new',
      admin: { position: 'sidebar' },
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Discovery / Meeting', value: 'discovery' },
        { label: 'Proposal Sent', value: 'proposal' },
        { label: 'Negotiation', value: 'negotiation' },
        { label: 'Won', value: 'won' },
        { label: 'Lost', value: 'lost' },
      ],
    },
    { name: 'emailSent', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
  ],
}
