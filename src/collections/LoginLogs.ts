import type { CollectionConfig } from 'payload'

export const LoginLogs: CollectionConfig = {
  slug: 'login-logs',
  labels: { singular: 'Login Log', plural: 'Login Logs' },
  admin: {
    useAsTitle: 'employee',
    defaultColumns: ['employee', 'loginAt', 'logoutAt'],
    description: 'Automatic record of employee logins/logouts — created and updated only by the system.',
  },
  access: {
    // Only admins can read these — an employee's session history isn't
    // something other employees (or the employee themselves, really) need
    // to browse via the API.
    read: ({ req }) => req.user?.collection === 'users',
    create: () => false,
    update: () => false,
    delete: ({ req }) => req.user?.collection === 'users',
  },
  fields: [
    { name: 'employee', type: 'relationship', relationTo: 'employees', required: true },
    { name: 'loginAt', type: 'date', required: true },
    { name: 'logoutAt', type: 'date' },
  ],
}
