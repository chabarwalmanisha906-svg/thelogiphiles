import { NextResponse } from 'next/server'

// Temporary: fetch the exact DNS records Resend needs for thelogiphiles.com
export async function GET() {
  const key = process.env.RESEND_API_KEY
  if (!key) return NextResponse.json({ error: 'no key' }, { status: 400 })

  const res = await fetch('https://api.resend.com/domains', {
    headers: { Authorization: `Bearer ${key}` },
  })
  const data = await res.json()
  const domain = data.data?.find((d: any) => d.name === 'thelogiphiles.com')
  if (!domain) return NextResponse.json({ error: 'domain not found in resend' })

  const verifyRes = await fetch(`https://api.resend.com/domains/${domain.id}/verify`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}` },
  })
  const verifyData = await verifyRes.json()

  const detailRes = await fetch(`https://api.resend.com/domains/${domain.id}`, {
    headers: { Authorization: `Bearer ${key}` },
  })
  const detail = await detailRes.json()

  return NextResponse.json({ verifyResult: verifyData, detail })
}
