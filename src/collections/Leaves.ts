import type { CollectionConfig } from 'payload'

export const Leaves: CollectionConfig = {
  slug: 'leaves',
  admin: {
    useAsTitle: 'employee',
    defaultColumns: ['employee', 'type', 'fromDate', 'toDate', 'status'],
  },
  defaultSort: '-createdAt',
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.collection === 'users') return true
      return { employee: { equals: req.user.id } }
    },
    create: ({ req }) => !!req.user,
    update: ({ req }) => req.user?.collection === 'users',
    delete: ({ req }) => req.user?.collection === 'users',
  },
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (req.user && req.user.collection !== 'users') {
          data.employee = req.user.id
          data.status = 'pending'
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'employee', type: 'relationship', relationTo: 'employees', required: true },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Casual Leave', value: 'casual' },
        { label: 'Sick Leave', value: 'sick' },
        { label: 'Work From Home', value: 'wfh' },
      ],
    },
    { name: 'fromDate', type: 'date', required: true },
    { name: 'toDate', type: 'date', required: true },
    { name: 'reason', type: 'textarea' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
  ],
}
