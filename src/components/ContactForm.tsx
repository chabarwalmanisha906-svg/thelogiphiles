'use client'

import { useState, type FormEvent } from 'react'

const SERVICES = [
  'Advertising Writing',
  'Brand Copy',
  'Content',
  'Editorial',
  'Translation',
  'Transcreation',
  'Multilingual Communication',
  'Digital Communication',
  'Pitch Decks & Business Communication',
  'Other',
]

type Status = 'idle' | 'submitting' | 'success' | 'error'

const inputClasses =
  'w-full border-b border-navy/25 bg-transparent py-3 font-body text-navy placeholder:text-navy/40 focus:border-teal-dark outline-none transition-colors'

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || 'Something went wrong. Please try again.')
      }

      setStatus('success')
      form.reset()
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  if (status === 'success') {
    return (
      <div className="border-t border-navy/15 pt-8">
        <p className="font-heading text-2xl font-extrabold tracking-tight text-mint">
          MESSAGE SENT.
        </p>
        <p className="mt-3 font-body text-navy/70">
          Thanks for reaching out — we&apos;ll get back to you shortly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7">
      {/* Honeypot field to deter simple bots; hidden from real users. */}
      <input
        type="text"
        name="companyWebsite"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
        <input name="name" type="text" required placeholder="Name" className={inputClasses} />
        <input name="email" type="email" required placeholder="Email" className={inputClasses} />
        <input name="company" type="text" placeholder="Company" className={inputClasses} />
        <input name="phone" type="tel" placeholder="Phone (optional)" className={inputClasses} />
      </div>

      <select name="service" defaultValue="" className={inputClasses}>
        <option value="" disabled>
          Service
        </option>
        {SERVICES.map((service) => (
          <option key={service} value={service}>
            {service}
          </option>
        ))}
      </select>

      <textarea
        name="message"
        required
        rows={4}
        placeholder="Message"
        className={`${inputClasses} resize-none`}
      />

      {status === 'error' && (
        <p className="font-body text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        data-cursor="LET'S TALK →"
        className="mt-2 inline-flex w-fit items-center gap-2 bg-navy px-7 py-4 font-heading text-sm font-semibold tracking-[0.08em] text-white transition-colors hover:bg-teal-dark disabled:opacity-50"
      >
        {status === 'submitting' ? 'SENDING…' : 'SEND IT OUR WAY →'}
      </button>
    </form>
  )
}
