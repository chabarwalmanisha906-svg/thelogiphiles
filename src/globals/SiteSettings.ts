import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    description: 'Editable homepage copy, stats, and site-wide contact/social details.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            { name: 'heroLineOne', type: 'text', defaultValue: 'YES, YOU ARE RIGHT.' },
            { name: 'heroLineTwo', type: 'text', defaultValue: 'WE WRITE.' },
            {
              name: 'heroSupportLine',
              type: 'text',
              defaultValue: 'Advertising writing. Brand copy. Content. Language. Ideas.',
            },
            {
              name: 'heroParagraph',
              type: 'textarea',
              defaultValue:
                'We turn ideas into words people remember, brands people notice and campaigns people talk about.',
            },
          ],
        },
        {
          label: 'Credentials',
          fields: [
            {
              name: 'stats',
              type: 'array',
              maxRows: 4,
              defaultValue: [
                { value: '36+', label: 'Languages' },
                { value: '100+', label: 'Projects' },
                { value: '', label: 'Brands' },
                { value: '', label: 'Industries' },
              ],
              fields: [
                { name: 'value', type: 'text', required: true },
                { name: 'label', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          label: 'Contact & Social',
          fields: [
            { name: 'contactEmail', type: 'email', defaultValue: 'hello@thelogiphiles.com' },
            { name: 'instagramUrl', type: 'text' },
            { name: 'linkedinUrl', type: 'text' },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'defaultSeoTitle',
              type: 'text',
              defaultValue: 'The Logiphiles | Advertising Writing & Brand Communication',
            },
            {
              name: 'defaultSeoDescription',
              type: 'textarea',
              defaultValue:
                'The Logiphiles is an advertising writing and communication agency creating brand copy, campaigns, content and multilingual communication.',
            },
          ],
        },
      ],
    },
  ],
}
