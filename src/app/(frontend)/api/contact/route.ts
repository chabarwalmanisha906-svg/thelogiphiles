import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getPayloadClient } from '@/lib/payload'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const name = String(body.name ?? '').trim()
  const email = String(body.email ?? '').trim()
  const company = String(body.company ?? '').trim()
  const phone = String(body.phone ?? '').trim()
  const service = String(body.service ?? '').trim()
  const message = String(body.message ?? '').trim()
  const honeypot = String(body.companyWebsite ?? '').trim()

  // Honeypot: real users never fill this hidden field.
  if (honeypot) {
    return NextResponse.json({ ok: true })
  }

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Name, email and message are required.' }, { status: 400 })
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  let emailSent = false

  try {
    const payload = await getPayloadClient()
    await payload.create({
      collection: 'enquiries',
      data: {
        name,
        email,
        company: company || undefined,
        phone: phone || undefined,
        service: service || undefined,
        message,
        emailSent: false,
      },
    })
  } catch (err) {
    console.error('Failed to store enquiry in Payload:', err)
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev',
        to: process.env.CONTACT_TO_EMAIL || 'hello@thelogiphiles.com',
        replyTo: email,
        subject: `New enquiry from ${name}${company ? ` (${company})` : ''}`,
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          company && `Company: ${company}`,
          phone && `Phone: ${phone}`,
          service && `Service: ${service}`,
          '',
          message,
        ]
          .filter(Boolean)
          .join('\n'),
      })
      emailSent = true
    } catch (err) {
      console.error('Failed to send enquiry email via Resend:', err)
    }
  }

  return NextResponse.json({ ok: true, emailSent })
}
