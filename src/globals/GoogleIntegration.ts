import type { GlobalConfig } from 'payload'

export const GoogleIntegration: GlobalConfig = {
  slug: 'google-integration',
  admin: {
    description: 'Google Drive connection for automatic Workspace folder syncing.',
  },
  access: {
    read: ({ req }) => req.user?.collection === 'users',
    update: ({ req }) => req.user?.collection === 'users',
  },
  fields: [
    { name: 'connected', type: 'checkbox', defaultValue: false, admin: { readOnly: true } },
    { name: 'connectedEmail', type: 'text', admin: { readOnly: true } },
    {
      name: 'refreshToken',
      type: 'text',
      admin: { readOnly: true, description: 'Stored securely — never exposed outside the admin dashboard.' },
    },
    {
      name: 'workspaceRootFolderId',
      type: 'text',
      admin: { readOnly: true, description: 'The "Workspace" root folder in Google Drive.' },
    },
    {
      name: 'teamRootFolderId',
      type: 'text',
      admin: { readOnly: true, description: 'The "Workspace/Team" folder in Google Drive.' },
    },
  ],
}
