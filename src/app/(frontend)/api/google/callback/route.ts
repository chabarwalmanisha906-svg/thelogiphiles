import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { exchangeCodeForTokens } from '@/lib/googleDrive'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  if (error || !code) {
    return NextResponse.redirect(`${base}/admin/home?google=error`)
  }

  try {
    const tokens = await exchangeCodeForTokens(code)
    if (!tokens.refresh_token) {
      // Google only returns a refresh_token on the first-ever consent grant.
      // If the admin already connected before, they must revoke access at
      // https://myaccount.google.com/permissions and reconnect to get a new one.
      return NextResponse.redirect(`${base}/admin/home?google=no-refresh-token`)
    }

    const meRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const me = await meRes.json().catch(() => null)

    const payload = await getPayloadClient()
    await payload.updateGlobal({
      slug: 'google-integration',
      data: {
        connected: true,
        connectedEmail: me?.email || '',
        refreshToken: tokens.refresh_token,
      },
    })

    return NextResponse.redirect(`${base}/admin/home?google=connected`)
  } catch (err) {
    console.error('Google OAuth callback failed:', err)
    return NextResponse.redirect(`${base}/admin/home?google=error`)
  }
}
