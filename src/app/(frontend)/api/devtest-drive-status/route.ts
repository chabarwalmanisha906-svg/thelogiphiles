import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function GET() {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'google-integration' })
  return NextResponse.json({
    connected: settings?.connected || false,
    connectedEmail: settings?.connectedEmail || null,
    hasRefreshToken: !!settings?.refreshToken,
  })
}
