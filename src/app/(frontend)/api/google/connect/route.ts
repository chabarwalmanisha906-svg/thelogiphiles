import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getGoogleAuthUrl } from '@/lib/googleDrive'

export async function GET(request: Request) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })

  if (!user || user.collection !== 'users') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }

  return NextResponse.redirect(getGoogleAuthUrl(String(user.id)))
}
