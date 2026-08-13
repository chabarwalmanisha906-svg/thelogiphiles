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
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        const justWon = doc.stage === 'won' && (operation === 'create' || previousDoc?.stage !== 'won')
        if (!justWon) return

        const existing = await req.payload.find({
          collection: 'clients',
          where: { name: { equals: doc.company } },
          limit: 1,
          req,
        })

        if (existing.docs[0]) {
          const client = existing.docs[0]
          await req.payload.update({
            collection: 'clients',
            id: client.id,
            data: {
              value: (client.value || 0) + (doc.value || 0),
              status: client.status === 'at-risk' ? client.status : 'active',
            },
            req,
          })
        } else {
          await req.payload.create({
            collection: 'clients',
            data: {
              name: doc.company,
              value: doc.value || 0,
              status: 'active',
              onboardedDate: new Date().toISOString(),
              owner: doc.owner || undefined,
              visible: false,
            },
            req,
          })
        }
      },
    ],
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
