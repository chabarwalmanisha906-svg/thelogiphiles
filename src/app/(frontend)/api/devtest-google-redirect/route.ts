import { NextResponse } from 'next/server'

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return NextResponse.json({
    NEXT_PUBLIC_SITE_URL: base,
    computedRedirectUri: `${base}/api/google/callback`,
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    clientIdPrefix: process.env.GOOGLE_CLIENT_ID?.slice(0, 20),
  })
}
