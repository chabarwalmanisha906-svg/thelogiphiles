import type { CollectionConfig } from 'payload'

export const Invoices: CollectionConfig = {
  slug: 'invoices',
  admin: {
    useAsTitle: 'invoiceNumber',
    defaultColumns: ['invoiceNumber', 'client', 'amount', 'dueDate', 'status'],
  },
  defaultSort: '-issuedDate',
  access: {
    read: ({ req }) => req.user?.collection === 'users',
    create: ({ req }) => req.user?.collection === 'users',
    update: ({ req }) => req.user?.collection === 'users',
    delete: ({ req }) => req.user?.collection === 'users',
  },
  fields: [
    { name: 'invoiceNumber', type: 'text', required: true },
    { name: 'client', type: 'relationship', relationTo: 'clients', required: true },
    { name: 'amount', type: 'number', required: true, label: 'Amount (₹)' },
    { name: 'issuedDate', type: 'date', required: true },
    { name: 'dueDate', type: 'date', required: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'due',
      options: [
        { label: 'Due', value: 'due' },
        { label: 'Paid', value: 'paid' },
        { label: 'Overdue', value: 'overdue' },
      ],
    },
  ],
}
