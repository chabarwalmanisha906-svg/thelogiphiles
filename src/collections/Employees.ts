import type { CollectionConfig, Access, FieldAccess } from 'payload'

const selfOrAdmin: Access = ({ req }) => {
  if (!req.user) return false
  if (req.user.collection === 'users') return true
  return { id: { equals: req.user.id } }
}

const fieldSelfOrAdmin: FieldAccess = ({ req, doc }) => {
  if (!req.user) return false
  if (req.user.collection === 'users') return true
  return String(doc?.id) === String(req.user.id)
}

export const Employees: CollectionConfig = {
  slug: 'employees',
  auth: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'department', 'role', 'joiningDate'],
  },
  access: {
    // Any authenticated user/employee can read the basic directory (needed for team lists and chat contacts).
    // Sensitive fields below are further restricted via field-level access.
    read: ({ req }) => !!req.user,
    update: selfOrAdmin,
    create: ({ req }) => req.user?.collection === 'users',
    delete: ({ req }) => req.user?.collection === 'users',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', label: 'Designation' },
    { name: 'department', type: 'text' },
    { name: 'phone', type: 'text', access: { read: fieldSelfOrAdmin } },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'joiningDate', type: 'date' },
    {
      name: 'paidLeaveBalance',
      type: 'number',
      defaultValue: 12,
      admin: { position: 'sidebar' },
      access: { read: fieldSelfOrAdmin },
    },
    {
      name: 'sickLeaveBalance',
      type: 'number',
      defaultValue: 6,
      admin: { position: 'sidebar' },
      access: { read: fieldSelfOrAdmin },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
