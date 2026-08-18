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

        const conversionNote = `[${new Date().toLocaleDateString('en-IN')}] Converted from Pitch CRM (Won).${
          doc.notes ? ` Notes: ${doc.notes}` : ''
        }`

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
              // Fill in only what's missing so we never overwrite anything an
              // admin has since edited directly on the client record.
              contactPerson: client.contactPerson || doc.decisionMaker || undefined,
              contactEmail: client.contactEmail || doc.email || undefined,
              pitchDetails: client.pitchDetails || doc.need || undefined,
              owner: client.owner || doc.owner || undefined,
              communicationHistory: client.communicationHistory
                ? `${client.communicationHistory}\n${conversionNote}`
                : conversionNote,
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
              contactPerson: doc.decisionMaker || undefined,
              contactEmail: doc.email || undefined,
              pitchDetails: doc.need || undefined,
              communicationHistory: conversionNote,
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
      label: 'Status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Pitch Sent', value: 'pitch-sent' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Follow-up', value: 'follow-up' },
        { label: 'Won', value: 'won' },
        { label: 'Lost', value: 'lost' },
        { label: 'Onboarded', value: 'onboarded' },
      ],
    },
    { name: 'notes', type: 'textarea' },
    { name: 'owner', type: 'relationship', relationTo: 'users', admin: { position: 'sidebar' } },
  ],
}
