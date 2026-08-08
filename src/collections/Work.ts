import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Work: CollectionConfig = {
  slug: 'work',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'featured', 'order'],
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, admin: { position: 'sidebar' } },
    { name: 'category', type: 'text', required: true },
    { name: 'client', type: 'text' },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: { description: 'Short description shown on the Work grid card.' },
    },
    { name: 'coverImage', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Case Study',
          fields: [
            { name: 'challenge', type: 'richText', editor: lexicalEditor({}) },
            { name: 'approach', type: 'richText', editor: lexicalEditor({}) },
            {
              name: 'workImages',
              type: 'array',
              label: 'Work / Campaign Material',
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media', required: true },
                { name: 'caption', type: 'text' },
              ],
            },
            {
              name: 'writingSamples',
              type: 'array',
              label: 'Selected Writing',
              fields: [
                { name: 'heading', type: 'text' },
                { name: 'copy', type: 'textarea' },
              ],
            },
            { name: 'outcome', type: 'richText', editor: lexicalEditor({}) },
            {
              name: 'gallery',
              type: 'array',
              fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'seoTitle', type: 'text' },
            { name: 'seoDescription', type: 'textarea' },
          ],
        },
      ],
    },
  ],
}
