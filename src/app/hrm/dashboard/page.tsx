'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Employee = {
  id: string
  name: string
  email: string
  role?: string | null
  department?: string | null
  paidLeaveBalance?: number | null
  sickLeaveBalance?: number | null
}

type AttendanceRecord = {
  id: string
  day: string
  checkInTime?: string | null
  checkOutTime?: string | null
  status: string
}

function todayStr() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatTime(iso?: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function formatDay(day: string) {
  return new Date(`${day}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function HrmDashboardPage() {
  const router = useRouter()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [today, setToday] = useState<AttendanceRecord | null>(null)
  const [history, setHistory] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    const meRes = await fetch('/api/employees/me', { credentials: 'include' })
    const meData = await meRes.json().catch(() => null)

    if (!meRes.ok || !meData?.user) {
      router.push('/hrm/login')
      return
    }

    setEmployee(meData.user)

    const day = todayStr()
    const [todayRes, historyRes] = await Promise.all([
      fetch(
        `/api/attendance?where[employee][equals]=${meData.user.id}&where[day][equals]=${day}&limit=1`,
        { credentials: 'include' },
      ),
      fetch(
        `/api/attendance?where[employee][equals]=${meData.user.id}&sort=-day&limit=14`,
        { credentials: 'include' },
      ),
    ])

    const todayData = await todayRes.json()
    const historyData = await historyRes.json()

    setToday(todayData?.docs?.[0] ?? null)
    setHistory(historyData?.docs ?? [])
    setLoading(false)
  }, [router])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleCheckIn() {
    setActionLoading(true)
    setError('')
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          day: todayStr(),
          checkInTime: new Date().toISOString(),
          status: 'present',
        }),
      })
      if (!res.ok) throw new Error('Could not check in')
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCheckOut() {
    if (!today) return
    setActionLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/attendance/${today.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ checkOutTime: new Date().toISOString() }),
      })
      if (!res.ok) throw new Error('Could not check out')
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/employees/logout', { method: 'POST', credentials: 'include' })
    router.push('/hrm/login')
  }

  if (loading || !employee) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="font-body text-sm text-navy/50">Loading…</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 md:py-16">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-navy">
            {employee.name}
          </h1>
          <p className="mt-1 font-body text-sm text-navy/60">
            {employee.role || 'Employee'}
            {employee.department ? ` · ${employee.department}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="font-heading text-xs font-bold tracking-[0.08em] text-navy/60 hover:text-mint"
        >
          LOG OUT
        </button>
      </div>

      <div className="mt-10 border border-navy/10 bg-white p-7">
        <p className="font-heading text-xs font-bold tracking-[0.1em] text-mint">TODAY</p>
        <p className="mt-1 font-body text-sm text-navy/60">{formatDay(todayStr())}</p>

        <div className="mt-6 flex flex-wrap items-center gap-6">
          <div>
            <p className="font-body text-[11px] uppercase tracking-wide text-navy/40">Check in</p>
            <p className="font-heading text-lg font-bold text-navy">{formatTime(today?.checkInTime)}</p>
          </div>
          <div>
            <p className="font-body text-[11px] uppercase tracking-wide text-navy/40">Check out</p>
            <p className="font-heading text-lg font-bold text-navy">{formatTime(today?.checkOutTime)}</p>
          </div>

          <div className="ml-auto">
            {!today && (
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="bg-mint px-6 py-3 font-heading text-xs font-bold tracking-[0.08em] text-navy transition-colors hover:bg-navy hover:text-white disabled:opacity-60"
              >
                CHECK IN
              </button>
            )}
            {today && !today.checkOutTime && (
              <button
                type="button"
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="bg-navy px-6 py-3 font-heading text-xs font-bold tracking-[0.08em] text-white transition-colors hover:bg-mint disabled:opacity-60"
              >
                CHECK OUT
              </button>
            )}
            {today && today.checkOutTime && (
              <span className="font-body text-xs font-semibold text-navy/50">Day complete</span>
            )}
          </div>
        </div>

        {error && <p className="mt-4 font-body text-xs text-red-600">{error}</p>}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="border border-navy/10 bg-white p-6">
          <p className="font-body text-[11px] uppercase tracking-wide text-navy/40">Paid leave</p>
          <p className="mt-1 font-heading text-2xl font-extrabold text-navy">
            {employee.paidLeaveBalance ?? 0}
          </p>
        </div>
        <div className="border border-navy/10 bg-white p-6">
          <p className="font-body text-[11px] uppercase tracking-wide text-navy/40">Sick leave</p>
          <p className="mt-1 font-heading text-2xl font-extrabold text-navy">
            {employee.sickLeaveBalance ?? 0}
          </p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-heading text-sm font-bold tracking-[0.08em] text-navy">
          RECENT ATTENDANCE
        </h2>

        <div className="mt-4 divide-y divide-navy/10 border-t border-navy/10">
          {history.length === 0 && (
            <p className="py-6 font-body text-sm text-navy/50">No attendance records yet.</p>
          )}
          {history.map((record) => (
            <div key={record.id} className="flex items-center justify-between py-3.5 font-body text-sm">
              <span className="text-navy">{formatDay(record.day)}</span>
              <span className="text-navy/60">
                {formatTime(record.checkInTime)} – {formatTime(record.checkOutTime)}
              </span>
              <span className="font-heading text-[11px] font-bold uppercase tracking-wide text-mint">
                {record.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
