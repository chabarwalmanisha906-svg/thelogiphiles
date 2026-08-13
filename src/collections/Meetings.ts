import type { CollectionConfig } from 'payload'
import { Resend } from 'resend'

export const Meetings: CollectionConfig = {
  slug: 'meetings',
  labels: { singular: 'Meeting', plural: 'Meetings' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'scheduledAt', 'attendees', 'createdAt'],
    description: 'Meeting invites sent to employees, with automatic email notifications.',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.collection === 'users') return true
      return { attendees: { equals: req.user.id } }
    },
    create: ({ req }) => req.user?.collection === 'users',
    update: ({ req }) => req.user?.collection === 'users',
    delete: ({ req }) => req.user?.collection === 'users',
  },
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        if (operation === 'create' && req.user) {
          data.createdBy = req.user.id
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return

        const attendeeIds: (number | string)[] = (doc.attendees || []).map((a: any) =>
          typeof a === 'object' ? a.id : a,
        )
        if (attendeeIds.length === 0) return

        const employees = await req.payload.find({
          collection: 'employees',
          where: { id: { in: attendeeIds } },
          limit: attendeeIds.length,
          req,
        })

        const emailResults: Record<string, 'sent' | 'failed' | 'skipped'> = {}
        const when = doc.scheduledAt
          ? new Date(doc.scheduledAt).toLocaleString('en-IN', {
              dateStyle: 'full',
              timeStyle: 'short',
              timeZone: 'Asia/Kolkata',
            })
          : 'To be confirmed'

        if (!process.env.RESEND_API_KEY) {
          for (const emp of employees.docs) emailResults[String(emp.id)] = 'skipped'
        } else {
          const resend = new Resend(process.env.RESEND_API_KEY)
          for (const emp of employees.docs) {
            try {
              await resend.emails.send({
                from: process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev',
                to: emp.email,
                subject: `Meeting Invite: ${doc.title}`,
                text: [
                  `Hi ${emp.name},`,
                  '',
                  `You've been invited to a meeting: ${doc.title}`,
                  `Date/Time: ${when}`,
                  `Meeting Link: ${doc.link}`,
                  '',
                  doc.message || '',
                  '',
                  '— The Logiphiles',
                ]
                  .filter((line) => line !== undefined)
                  .join('\n'),
                html: [
                  `<p>Hi ${emp.name},</p>`,
                  `<p>You've been invited to a meeting: <strong>${doc.title}</strong></p>`,
                  `<p><strong>Date/Time:</strong> ${when}</p>`,
                  `<p><strong>Meeting Link:</strong> <a href="${doc.link}">${doc.link}</a></p>`,
                  doc.message ? `<p>${String(doc.message).replace(/\n/g, '<br/>')}</p>` : '',
                  `<p>— The Logiphiles</p>`,
                ].join(''),
              })
              emailResults[String(emp.id)] = 'sent'
            } catch (err) {
              console.error(`Failed to send meeting email to employee ${emp.id}:`, err)
              emailResults[String(emp.id)] = 'failed'
            }
          }
        }

        await req.payload.update({
          collection: 'meetings',
          id: doc.id,
          data: { emailResults },
          req,
        })
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Meeting Title' },
    { name: 'link', type: 'text', required: true, label: 'Meeting Link' },
    { name: 'scheduledAt', type: 'date', required: true, label: 'Date & Time', admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'message', type: 'textarea', label: 'Message / Instructions' },
    { name: 'attendees', type: 'relationship', relationTo: 'employees', hasMany: true, required: true },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', admin: { position: 'sidebar', readOnly: true } },
    { name: 'conversation', type: 'relationship', relationTo: 'conversations', admin: { position: 'sidebar' } },
    {
      name: 'emailResults',
      type: 'json',
      admin: { position: 'sidebar', description: "Map of employee id -> 'sent' | 'failed' | 'skipped'" },
    },
  ],
}
