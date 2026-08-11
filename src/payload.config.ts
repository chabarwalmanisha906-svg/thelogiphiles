import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
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
  ],
  globals: [SiteSettings],
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
})
