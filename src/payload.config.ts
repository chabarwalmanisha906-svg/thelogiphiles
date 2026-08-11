import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Work } from './collections/Work'
import { Categories } from './collections/Categories'
import { Posts } from './collections/Posts'
import { Clients } from './collections/Clients'
import { Enquiries } from './collections/Enquiries'
import { TeamMembers } from './collections/TeamMembers'
import { Employees } from './collections/Employees'
import { Attendance } from './collections/Attendance'
import { Tasks } from './collections/Tasks'
import { PitchProspects } from './collections/PitchProspects'
import { Invoices } from './collections/Invoices'
import { Leaves } from './collections/Leaves'
import { EmployeeFiles } from './collections/EmployeeFiles'
import { Conversations } from './collections/Conversations'
import { Messages } from './collections/Messages'
import { ChatAttachments } from './collections/ChatAttachments'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- The Logiphiles CMS',
    },
    components: {
      graphics: {
        Logo: '/src/components/admin/AdminLogo#AdminLogo',
        Icon: '/src/components/admin/AdminIcon#AdminIcon',
      },
    },
  },
  collections: [
    Users,
    Media,
    Work,
    Categories,
    Posts,
    Clients,
    Enquiries,
    TeamMembers,
    Employees,
    Attendance,
    Tasks,
    PitchProspects,
    Invoices,
    Leaves,
    EmployeeFiles,
    Conversations,
    Messages,
    ChatAttachments,
  ],
  globals: [SiteSettings],
  routes: {
    admin: '/cms',
  },
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  cors: [process.env.NEXT_PUBLIC_SITE_URL || ''].filter(Boolean),
  plugins: [
    // Local disk storage doesn't persist on Vercel's serverless filesystem — route
    // uploads to Vercel Blob instead. Falls back to local disk if the token isn't
    // set yet (e.g. in local dev without a linked Blob store).
    vercelBlobStorage({
      enabled: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      collections: {
        media: true,
        'employee-files': true,
        'chat-attachments': true,
      },
    }),
  ],
})
