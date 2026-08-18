import type { CollectionConfig, Access, FieldAccess } from 'payload'
import { createEmployeeDriveFolder } from '../lib/googleDrive'

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
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return

        const update: Record<string, unknown> = {}
        if (!doc.employeeId) update.employeeId = `TL-${String(doc.id).padStart(4, '0')}`

        if (!doc.driveFolderId) {
          try {
            const folderId = await createEmployeeDriveFolder(req.payload, doc.name)
            if (folderId) update.driveFolderId = folderId
          } catch (err) {
            console.error(`Failed to create Drive folder for employee "${doc.name}":`, err)
          }
        }

        if (Object.keys(update).length > 0) {
          await req.payload.update({ collection: 'employees', id: doc.id, data: update, req })
        }
      },
    ],
    afterLogin: [
      async ({ user, req }) => {
        try {
          // Must pass `req` so this runs inside the same transaction as the
          // login operation itself — without it, this opens a separate
          // connection that tries to lock the same employees row the still-
          // uncommitted login transaction already holds, deadlocking both.
          await req.payload.create({
            collection: 'login-logs',
            data: { employee: user.id, loginAt: new Date().toISOString() },
            overrideAccess: true,
            req,
          })
        } catch (err) {
          console.error(`Failed to record login for employee ${user.id}:`, err)
        }
      },
    ],
    afterLogout: [
      async ({ req }) => {
        if (!req.user) return
        try {
          const open = await req.payload.find({
            collection: 'login-logs',
            where: { employee: { equals: req.user.id }, logoutAt: { exists: false } },
            sort: '-loginAt',
            limit: 1,
            overrideAccess: true,
            req,
          })
          if (open.docs[0]) {
            await req.payload.update({
              collection: 'login-logs',
              id: open.docs[0].id,
              data: { logoutAt: new Date().toISOString() },
              overrideAccess: true,
              req,
            })
          }
        } catch (err) {
          console.error(`Failed to record logout for employee ${req.user.id}:`, err)
        }
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'employeeId',
      type: 'text',
      unique: true,
      admin: { position: 'sidebar', description: 'Auto-generated on creation.', readOnly: true },
    },
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
    {
      name: 'driveFolderId',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true, description: 'Google Drive Workspace/Team folder ID.' },
    },
  ],
}
