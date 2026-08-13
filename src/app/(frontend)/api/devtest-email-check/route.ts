import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getPayloadClient } from '@/lib/payload'

// Temporary one-shot check: confirms RESEND_API_KEY is now set and can
// actually send an email. Removed immediately after use.
export async function GET() {
  const payload = await getPayloadClient()
  const cleanup: { collection: string; id: number | string }[] = []

  const hasKey = !!process.env.RESEND_API_KEY
  const toEmail = (process.env.CONTACT_TO_EMAIL || '').trim()

  if (!hasKey) {
    return NextResponse.json({ hasKey, sent: false, reason: 'RESEND_API_KEY still empty' })
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const result = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL?.trim() || 'onboarding@resend.dev',
      to: 'chabarwalmanisha906@gmail.com',
      subject: 'Test: The Logiphiles email system is now live',
      text: 'This confirms RESEND_API_KEY is correctly configured and emails are sending from the meeting-invite and contact-form workflows.',
    })

    return NextResponse.json({ hasKey, toEmail, sent: !result.error, result })
  } catch (err) {
    return NextResponse.json({ hasKey, toEmail, sent: false, error: err instanceof Error ? err.message : String(err) })
  } finally {
    for (const c of cleanup.reverse()) {
      await payload.delete({ collection: c.collection, id: c.id }).catch(() => {})
    }
  }
}
