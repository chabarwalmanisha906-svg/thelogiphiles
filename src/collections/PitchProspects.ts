import type { CollectionConfig } from 'payload'

export const PitchProspects: CollectionConfig = {
  slug: 'pitch-prospects',
  labels: { singular: 'Pitch Prospect', plural: 'Pitch CRM' },
  admin: {
    useAsTitle: 'company',
    defaultColumns: ['company', 'decisionMaker', 'value', 'stage', 'nextFollowUp'],
  },
  access: {
    read: ({ req }) => req.user?.collection === 'users',
    create: ({ req }) => req.user?.collection === 'users',
    update: ({ req }) => req.user?.collection === 'users',
    delete: ({ req }) => req.user?.collection === 'users',
  },
  fields: [
    { name: 'company', type: 'text', required: true },
    { name: 'decisionMaker', type: 'text', required: true },
    { name: 'email', type: 'email' },
    { name: 'need', type: 'text' },
    { name: 'value', type: 'number', label: 'Estimated value (₹)' },
    { name: 'nextFollowUp', type: 'date' },
    {
      name: 'stage',
      type: 'select',
      defaultValue: 'to-pitch',
      options: [
        { label: 'To Pitch', value: 'to-pitch' },
        { label: 'Hot', value: 'hot' },
        { label: 'Follow-up', value: 'follow-up' },
        { label: 'Proposal', value: 'proposal' },
        { label: 'Won', value: 'won' },
        { label: 'Lost', value: 'lost' },
      ],
    },
    { name: 'notes', type: 'textarea' },
    { name: 'owner', type: 'relationship', relationTo: 'users', admin: { position: 'sidebar' } },
  ],
}
