import type { CollectionConfig } from 'payload'

export const Attendance: CollectionConfig = {
  slug: 'attendance',
  admin: {
    useAsTitle: 'day',
    defaultColumns: ['employee', 'day', 'checkInTime', 'checkOutTime', 'status'],
  },
  defaultSort: '-day',
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
    delete: ({ req }) => req.user?.collection === 'users',
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
  fields: [
    { name: 'employee', type: 'relationship', relationTo: 'employees', required: true },
    { name: 'day', type: 'text', required: true, label: 'Date (YYYY-MM-DD)' },
    { name: 'checkInTime', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'checkOutTime', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'present',
      options: [
        { label: 'Present', value: 'present' },
        { label: 'Absent', value: 'absent' },
        { label: 'Leave', value: 'leave' },
        { label: 'Half Day', value: 'half-day' },
      ],
    },
    { name: 'notes', type: 'text' },
  ],
}
