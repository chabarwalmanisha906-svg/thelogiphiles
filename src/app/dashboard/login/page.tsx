'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.errors?.[0]?.message || 'Invalid email or password')
      }

      router.push('/dashboard/home')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy px-6 py-16">
      <div className="w-full max-w-sm rounded-xl bg-white p-10 shadow-2xl">
        <h1 className="font-heading text-2xl font-black tracking-tight text-navy">
          THE LOGIPHILES
        </h1>
        <p className="mt-1 font-body text-xs font-bold uppercase tracking-[0.1em] text-navy/50">
          Business Command Center
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block font-body text-xs font-semibold text-navy/70">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-navy/15 bg-offwhite px-4 py-3 font-body text-sm text-navy focus:border-mint focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block font-body text-xs font-semibold text-navy/70">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-navy/15 bg-offwhite px-4 py-3 font-body text-sm text-navy focus:border-mint focus:outline-none"
            />
          </div>

          {error && <p className="font-body text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-mint py-3.5 font-heading text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-navy disabled:opacity-60"
          >
            {loading ? 'SIGNING IN…' : 'SECURE SIGN IN'}
          </button>
        </form>
      </div>
    </main>
  )
}
