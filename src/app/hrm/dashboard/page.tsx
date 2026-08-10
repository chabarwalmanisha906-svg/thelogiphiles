'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Armchair,
  Bell,
  Check,
  Clock,
  ListChecks,
  LogIn,
  LogOut,
  MessageCircle,
  Timer,
} from 'lucide-react'
import { mediaUrl } from '@/lib/media'

type Employee = {
  id: string
  name: string
  email: string
  role?: string | null
  department?: string | null
  paidLeaveBalance?: number | null
  sickLeaveBalance?: number | null
  photo?: { url?: string | null; alt?: string | null } | string | null
}

type AttendanceRecord = {
  id: string
  day: string
  checkInTime?: string | null
  checkOutTime?: string | null
  status: string
}

type TaskStatus = 'todo' | 'in-progress' | 'review' | 'completed'

type Task = {
  id: string
  title: string
  description?: string | null
  status: TaskStatus
  accepted: boolean
  deadline?: string | null
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'Review Requested' },
  { value: 'completed', label: 'Completed' },
]

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

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}

export default function HrmDashboardPage() {
  const router = useRouter()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [today, setToday] = useState<AttendanceRecord | null>(null)
  const [history, setHistory] = useState<AttendanceRecord[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [view, setView] = useState<'tasks' | 'attendance'>('tasks')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const loadData = useCallback(async () => {
    const meRes = await fetch('/api/employees/me', { credentials: 'include' })
    const meData = await meRes.json().catch(() => null)

    if (!meRes.ok || !meData?.user) {
      router.push('/hrm/login')
      return
    }

    setEmployee(meData.user)

    const day = todayStr()
    const [todayRes, historyRes, tasksRes] = await Promise.all([
      fetch(
        `/api/attendance?where[employee][equals]=${meData.user.id}&where[day][equals]=${day}&limit=1`,
        { credentials: 'include' },
      ),
      fetch(
        `/api/attendance?where[employee][equals]=${meData.user.id}&sort=-day&limit=14`,
        { credentials: 'include' },
      ),
      fetch(
        `/api/tasks?where[employee][equals]=${meData.user.id}&sort=-createdAt&limit=50`,
        { credentials: 'include' },
      ),
    ])

    const todayData = await todayRes.json()
    const historyData = await historyRes.json()
    const tasksData = await tasksRes.json()

    setToday(todayData?.docs?.[0] ?? null)
    setHistory(historyData?.docs ?? [])
    setTasks(tasksData?.docs ?? [])
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

  async function handleAcceptTask(taskId: string) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ accepted: true }),
    })
    if (res.ok) {
      const data = await res.json()
      setTasks((prev) => prev.map((t) => (t.id === taskId ? data.doc : t)))
    }
  }

  async function handleStatusChange(taskId: string, status: TaskStatus) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)))
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    })
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

  const newTasks = tasks.filter((t) => !t.accepted)
  const ongoingTasks = tasks.filter((t) => t.accepted)
  const photoUrl = mediaUrl(employee.photo)

  return (
    <div className="flex h-screen overflow-hidden bg-offwhite text-navy">
      <aside className="flex w-64 shrink-0 flex-col bg-navy px-5 py-8 text-white">
        <div className="mb-8 flex items-center gap-3 border-b border-white/10 pb-5">
          <Armchair size={24} className="text-mint" />
          <div className="flex flex-col leading-tight">
            <span className="font-heading text-sm font-black tracking-wide">LOGIPHILES</span>
            <span className="font-heading text-[8px] font-bold uppercase tracking-[0.15em] text-mint">
              Workspace
            </span>
          </div>
        </div>

        <div className="mb-8 flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={employee.name}
              className="h-10 w-10 shrink-0 rounded-full border-2 border-mint object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-mint bg-white/10 font-heading text-xs font-bold">
              {initials(employee.name)}
            </div>
          )}
          <div className="min-w-0">
            <h4 className="truncate font-heading text-[13px] font-bold text-white">{employee.name}</h4>
            <p className="truncate font-heading text-[10px] font-semibold uppercase tracking-wide text-mint">
              {employee.role || 'Employee'}
            </p>
          </div>
        </div>

        <ul className="flex flex-1 flex-col gap-2">
          <li>
            <button
              type="button"
              onClick={() => setView('tasks')}
              className={`flex w-full items-center gap-3 rounded-md px-4 py-3 font-heading text-[13px] font-semibold transition-colors ${
                view === 'tasks'
                  ? 'border-l-4 border-mint bg-white/10 pl-3 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <ListChecks size={16} /> My Tasks &amp; Projects
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => setView('attendance')}
              className={`flex w-full items-center gap-3 rounded-md px-4 py-3 font-heading text-[13px] font-semibold transition-colors ${
                view === 'attendance'
                  ? 'border-l-4 border-mint bg-white/10 pl-3 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Clock size={16} /> Punch Clock
            </button>
          </li>
        </ul>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 flex items-center gap-3 rounded-md px-4 py-3 font-heading text-[13px] font-bold text-red-400 transition-colors hover:bg-white/10"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      <main
        className="flex-1 overflow-y-auto p-10"
        style={{
          backgroundImage: 'radial-gradient(rgba(14,50,108,0.08) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        <header className="mb-10">
          {view === 'tasks' ? (
            <>
              <h1 className="font-heading text-3xl font-black tracking-tight text-navy">MY TASKS</h1>
              <p className="mt-1 font-hand text-xl text-mint">
                Welcome back, {employee.name.split(' ')[0]}! Let&apos;s get creative today.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-heading text-3xl font-black tracking-tight text-navy">ATTENDANCE</h1>
              <p className="mt-1 font-hand text-xl text-mint">Track your time and punches.</p>
            </>
          )}
        </header>

        {view === 'tasks' && (
          <div>
            {newTasks.map((task) => (
              <div
                key={task.id}
                className="mb-6 flex flex-col gap-5 rounded-lg border-2 border-amber-400 bg-amber-50 p-6 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h3 className="flex items-center gap-2 font-heading text-lg font-black text-navy">
                    <Bell size={18} className="text-amber-500" /> New Assignment: {task.title}
                  </h3>
                  {task.description && (
                    <p className="mt-2 max-w-xl font-body text-sm text-navy/60">{task.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2.5">
                  <button
                    type="button"
                    onClick={() => alert('Discuss feature coming soon — please reach out directly for now.')}
                    className="flex items-center gap-2 rounded-md border-2 border-navy px-5 py-2.5 font-heading text-xs font-bold uppercase tracking-wide text-navy transition-colors hover:bg-navy/10"
                  >
                    <MessageCircle size={14} /> Discuss
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAcceptTask(task.id)}
                    className="flex items-center gap-2 rounded-md bg-mint px-5 py-2.5 font-heading text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-navy"
                  >
                    <Check size={14} /> Accept Project
                  </button>
                </div>
              </div>
            ))}

            <section className="rounded-lg border border-navy/10 bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="mb-6 border-b border-navy/10 pb-4">
                <h2 className="font-heading text-lg font-extrabold text-navy">Ongoing Projects</h2>
              </div>

              {ongoingTasks.length === 0 ? (
                <p className="font-body text-sm text-navy/50">
                  No ongoing projects yet — new assignments will show up above.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {ongoingTasks.map((task) => (
                    <div key={task.id} className="rounded-lg border border-navy/10 bg-offwhite/60 p-5">
                      <h3 className="font-heading text-base font-extrabold text-navy">{task.title}</h3>
                      {task.description && (
                        <p className="mt-2 font-body text-[13px] leading-relaxed text-navy/60">
                          {task.description}
                        </p>
                      )}
                      <div className="mt-4 flex items-center gap-2.5 border-t border-dashed border-navy/15 pt-4">
                        <label className="font-body text-[11px] font-bold uppercase tracking-wide text-navy/40">
                          Status:
                        </label>
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                          className="flex-1 rounded border border-navy/15 bg-white px-2 py-1.5 font-body text-xs font-semibold text-navy focus:border-mint focus:outline-none"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {view === 'attendance' && (
          <div>
            <section className="rounded-lg border border-navy/10 bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="mb-6 flex items-center gap-2 border-b border-navy/10 pb-4">
                <Timer size={18} className="text-mint" />
                <h2 className="font-heading text-lg font-extrabold text-navy">Time &amp; Attendance</h2>
              </div>

              <div className="flex flex-col items-start justify-between gap-6 rounded-lg border border-navy/10 bg-offwhite/60 p-8 sm:flex-row sm:items-center">
                <div>
                  <div className="font-heading text-4xl font-black text-navy">
                    {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </div>
                  <div className="mt-1 font-body text-[13px] font-semibold uppercase tracking-wide text-navy/50">
                    {now.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>

                <div className="flex flex-col items-start gap-2 sm:items-end">
                  {!today && (
                    <button
                      type="button"
                      onClick={handleCheckIn}
                      disabled={actionLoading}
                      className="flex items-center gap-2.5 rounded-lg bg-mint px-7 py-4 font-heading text-xs font-bold uppercase tracking-wide text-white transition-all hover:-translate-y-0.5 hover:bg-[#009e6f] disabled:opacity-60"
                    >
                      <LogIn size={16} /> Punch In
                    </button>
                  )}
                  {today && !today.checkOutTime && (
                    <>
                      <button
                        type="button"
                        onClick={handleCheckOut}
                        disabled={actionLoading}
                        className="flex items-center gap-2.5 rounded-lg bg-navy px-7 py-4 font-heading text-xs font-bold uppercase tracking-wide text-white transition-all hover:-translate-y-0.5 hover:bg-mint disabled:opacity-60"
                      >
                        <LogOut size={16} /> Punch Out
                      </button>
                      <span className="font-body text-xs text-navy/50">
                        Checked in at {formatTime(today.checkInTime)}
                      </span>
                    </>
                  )}
                  {today && today.checkOutTime && (
                    <span className="font-body text-xs font-semibold text-navy/50">
                      Day complete · {formatTime(today.checkInTime)} – {formatTime(today.checkOutTime)}
                    </span>
                  )}
                </div>
              </div>

              {error && <p className="mt-4 font-body text-xs text-red-600">{error}</p>}
            </section>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-navy/10 bg-white p-6">
                <p className="font-body text-[11px] uppercase tracking-wide text-navy/40">Paid leave</p>
                <p className="mt-1 font-heading text-2xl font-extrabold text-navy">
                  {employee.paidLeaveBalance ?? 0}
                </p>
              </div>
              <div className="rounded-lg border border-navy/10 bg-white p-6">
                <p className="font-body text-[11px] uppercase tracking-wide text-navy/40">Sick leave</p>
                <p className="mt-1 font-heading text-2xl font-extrabold text-navy">
                  {employee.sickLeaveBalance ?? 0}
                </p>
              </div>
            </div>

            <section className="mt-6 rounded-lg border border-navy/10 bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
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
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
