import { NextResponse } from 'next/server'

// Temporary: checks Resend's domain verification status via their API.
export async function GET() {
  const key = process.env.RESEND_API_KEY
  if (!key) return NextResponse.json({ error: 'no key' }, { status: 400 })

  const res = await fetch('https://api.resend.com/domains', {
    headers: { Authorization: `Bearer ${key}` },
  })
  const data = await res.json()
  const domain = data.data?.find((d: any) => d.name === 'thelogiphiles.com')

  return NextResponse.json({ domain })
}
