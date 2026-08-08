import type { Metadata } from 'next'

import config from '@payload-config'
import '@payloadcms/next/css'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

type PayloadSearchParams = Promise<{ [key: string]: string | string[] }>

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams: searchParams as PayloadSearchParams })

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config, params, searchParams: searchParams as PayloadSearchParams, importMap })

export default Page
