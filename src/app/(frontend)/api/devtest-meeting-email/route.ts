import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

// Temporary, one-shot verification route for the meeting-invite email flow.
// Sends a real email (via the production RESEND_API_KEY) to the business's
// own configured CONTACT_TO_EMAIL address, then cleans up all test records.
// Removed immediately after use.
export async function GET() {
  const payload = await getPayloadClient()
  const cleanup: { collection: string; id: number | string }[] = []

  try {
    const admin = await payload.find({ collection: 'users', limit: 1 })
    const adminUser = admin.docs[0]

    const testEmail = process.env.CONTACT_TO_EMAIL || ''
    if (!testEmail) {
      return NextResponse.json({ error: 'CONTACT_TO_EMAIL not set' }, { status: 400 })
    }

    const emp = await payload.create({
      collection: 'employees',
      data: { name: 'Production Email Test', email: testEmail, password: 'testpass12345' },
    })
    cleanup.push({ collection: 'employees', id: emp.id })

    const meeting = await payload.create({
      collection: 'meetings',
      data: {
        title: 'Live Email Delivery Test',
        link: 'https://meet.google.com/test-verification-link',
        scheduledAt: new Date(Date.now() + 3600_000).toISOString(),
        message: 'This is an automated end-to-end test of the meeting-invite email workflow.',
        attendees: [emp.id],
      },
      overrideAccess: false,
      user: adminUser ? { ...adminUser, collection: 'users' } : undefined,
    })
    cleanup.push({ collection: 'meetings', id: meeting.id })

    await new Promise((r) => setTimeout(r, 1500))

    const refetched = await payload.findByID({ collection: 'meetings', id: meeting.id })

    return NextResponse.json({
      sentTo: testEmail,
      emailResults: refetched.emailResults,
      hasResendKey: !!process.env.RESEND_API_KEY,
    })
  } finally {
    for (const c of cleanup.reverse()) {
      await payload.delete({ collection: c.collection, id: c.id }).catch(() => {})
    }
  }
}
