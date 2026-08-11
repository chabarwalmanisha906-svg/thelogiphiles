'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Armchair,
  Home,
  ListChecks,
  MessageCircle,
  FolderOpen,
  CalendarMinus,
  History,
  LogOut,
  LogIn as LogInIcon,
  Bell,
  Check,
  UploadCloud,
  Download,
  FileText,
  FileVideo,
  FileImage,
  File as FileIcon,
  Send,
} from 'lucide-react'
import {
  api,
  useToast,
  ToastProvider,
  Card,
  Badge,
  Field,
  inputClass,
} from '@/components/dashboard/ui'
import { ChatPanel } from '@/components/chat/ChatPanel'

type Doc = Record<string, any>

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'tasks', label: 'My Tasks', icon: ListChecks },
  { id: 'messages', label: 'Messages', icon: MessageCircle },
  { id: 'files', label: 'My Files', icon: FolderOpen },
  { id: 'leaves', label: 'Leave & WFH', icon: CalendarMinus },
  { id: 'attendance', label: 'Attendance Log', icon: History },
]

const FOLDERS = [
  { value: 'brand-logos', label: 'Brand Logos' },
  { value: 'canva-templates', label: 'Canva Templates' },
  { value: 'video-assets', label: 'Video Assets' },
  { value: 'documents', label: 'Documents' },
]

function todayStr() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function formatTime(iso?: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function formatDay(day: string) {
  return new Date(`${day}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function initials(name?: string) {
  if (!name) return '?'
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')
}

export default function EmployeePortal() {
  return (
    <ToastProvider>
      <Shell />
    </ToastProvider>
  )
}

function Shell() {
  const router = useRouter()
  const toast = useToast()
  const [employee, setEmployee] = useState<Doc | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('dashboard')
  const [now, setNow] = useState(new Date())
  const [today, setToday] = useState<Doc | null>(null)
  const [history, setHistory] = useState<Doc[]>([])
  const [tasks, setTasks] = useState<Doc[]>([])
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const loadAll = useCallback(async () => {
    const meRes = await fetch('/api/employees/me', { credentials: 'include' })
    const meData = await meRes.json().catch(() => null)
    if (!meRes.ok || !meData?.user) {
      router.push('/hrm/login')
      return
    }
    setEmployee(meData.user)

    const day = todayStr()
    const [todayData, historyData, tasksData] = await Promise.all([
      api(`/attendance?where[employee][equals]=${meData.user.id}&where[day][equals]=${day}&limit=1`),
      api(`/attendance?where[employee][equals]=${meData.user.id}&sort=-day&limit=60`),
      api(`/tasks?where[employee][equals]=${meData.user.id}&sort=-createdAt&limit=100`),
    ])
    setToday(todayData.docs?.[0] ?? null)
    setHistory(historyData.docs ?? [])
    setTasks(tasksData.docs ?? [])
    setLoading(false)
  }, [router])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  async function handlePunch() {
    setActionLoading(true)
    try {
      if (!today) {
        await api('/attendance', {
          method: 'POST',
          body: JSON.stringify({ day: todayStr(), checkInTime: new Date().toISOString(), status: 'present' }),
        })
        toast('Punched In! Your working hours have started.')
      } else if (!today.checkOutTime) {
        await api(`/attendance/${today.id}`, { method: 'PATCH', body: JSON.stringify({ checkOutTime: new Date().toISOString() }) })
        toast('Punched Out! Great job today.')
      }
      await loadAll()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Something went wrong')
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

  const thisMonth = now.getMonth()
  const monthRecords = history.filter((r) => new Date(r.day).getMonth() === thisMonth)
  const presentMTD = monthRecords.filter((r) => r.status === 'present').length
  const attendancePct = monthRecords.length ? Math.round((presentMTD / monthRecords.length) * 100) : 100
  const activeProjects = tasks.filter((t) => t.accepted && t.status !== 'completed').length
  const priorityTask = tasks.find((t) => t.accepted && t.status !== 'completed')

  return (
    <div className="grid min-h-screen grid-cols-[260px_1fr] bg-offwhite text-navy">
      <aside className="flex flex-col bg-navy px-5 py-6 text-white">
        <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint">
            <Armchair size={20} className="text-white" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-heading text-[15px] font-extrabold">The Logiphiles</span>
            <span className="font-heading text-[9px] font-bold uppercase tracking-[0.15em] text-mint">Employee Portal</span>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-mint bg-white/10 font-heading text-xs font-bold">
            {initials(employee.name)}
          </span>
          <div className="min-w-0">
            <h4 className="truncate font-heading text-[13px] font-bold text-white">{employee.name}</h4>
            <p className="truncate font-heading text-[10px] font-semibold uppercase tracking-wide text-mint">{employee.role || 'Employee'}</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = view === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 font-heading text-[12px] font-semibold transition-colors ${
                  active ? 'border-l-4 border-mint bg-white/10 pl-2 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={16} /> {item.label}
              </button>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 flex items-center gap-3 rounded-md px-3 py-2.5 font-heading text-[12px] font-bold text-red-400 hover:bg-white/10"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      <main
        className="overflow-y-auto"
        style={{ backgroundImage: 'radial-gradient(rgba(14,50,108,0.06) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      >
        <header className="sticky top-0 z-10 flex h-[70px] items-center justify-between border-b border-navy/10 bg-white px-8">
          <span className="font-body text-sm text-navy/40">Workspace Search…</span>
          <span className="font-heading text-[13px] font-bold text-navy">{employee.name}</span>
        </header>

        <div className="p-9">
          {view === 'dashboard' && (
            <div>
              <h1 className="font-heading text-3xl font-black tracking-tight text-navy">Hello, {employee.name.split(' ')[0]}!</h1>
              <p className="mt-1 font-hand text-xl text-mint">Ready to create something amazing today?</p>

              <div className="my-6 flex flex-col items-start justify-between gap-6 rounded-lg border border-navy/10 bg-white p-8 shadow-[0_4px_15px_rgba(0,0,0,0.02)] sm:flex-row sm:items-center">
                <div>
                  <div className="font-heading text-4xl font-black text-navy">
                    {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </div>
                  <div className="mt-1 font-body text-[13px] font-semibold uppercase tracking-wide text-navy/50">
                    {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  {(!today || !today.checkOutTime) && (
                    <button
                      type="button"
                      onClick={handlePunch}
                      disabled={actionLoading}
                      className={`flex items-center gap-2.5 rounded-lg px-7 py-4 font-heading text-xs font-bold uppercase tracking-wide text-white transition-all hover:-translate-y-0.5 disabled:opacity-60 ${
                        !today ? 'bg-mint hover:bg-[#009e6f]' : 'bg-navy hover:bg-mint'
                      }`}
                    >
                      {!today ? <LogInIcon size={16} /> : <LogOut size={16} />} {!today ? 'Punch In' : 'Punch Out'}
                    </button>
                  )}
                  {today?.checkOutTime && (
                    <span className="font-body text-xs font-semibold text-navy/50">
                      Day complete · {formatTime(today.checkInTime)} – {formatTime(today.checkOutTime)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="rounded-lg border border-navy/10 bg-white p-5">
                  <p className="font-heading text-2xl font-black text-mint">{activeProjects}</p>
                  <p className="mt-1 font-body text-[11px] font-bold uppercase text-navy/40">Active Projects</p>
                </div>
                <div className="rounded-lg border border-navy/10 bg-white p-5">
                  <p className="font-heading text-2xl font-black text-navy">{employee.paidLeaveBalance ?? 0}</p>
                  <p className="mt-1 font-body text-[11px] font-bold uppercase text-navy/40">Leave Balance</p>
                </div>
                <div className="rounded-lg border border-navy/10 bg-white p-5">
                  <p className="font-heading text-2xl font-black text-navy">{attendancePct}%</p>
                  <p className="mt-1 font-body text-[11px] font-bold uppercase text-navy/40">Attendance MTD</p>
                </div>
              </div>

              <Card title="Today's Priority Focus">
                {priorityTask ? (
                  <div className="rounded-lg border-l-4 border-red-400 bg-offwhite/60 p-5">
                    <h4 className="font-heading text-base font-extrabold text-navy">{priorityTask.title}</h4>
                    {priorityTask.description && <p className="mt-1.5 font-body text-sm text-navy/60">{priorityTask.description}</p>}
                    <button
                      onClick={() => setView('tasks')}
                      className="mt-4 rounded-md bg-mint px-4 py-2 font-heading text-[11px] font-bold uppercase text-white hover:bg-navy"
                    >
                      Go to Task
                    </button>
                  </div>
                ) : (
                  <p className="font-body text-sm text-navy/50">No active projects right now — check My Tasks for new assignments.</p>
                )}
              </Card>
            </div>
          )}

          {view === 'tasks' && (
            <TasksView tasks={tasks} toast={toast} reload={loadAll} setView={setView} />
          )}

          {view === 'messages' && (
            <div>
              <h1 className="mb-1 font-heading text-3xl font-black tracking-tight text-navy">Team Messages &amp; Meets</h1>
              <p className="mb-6 font-body text-sm text-navy/50">Communicate directly with your team, or start a video call.</p>
              <ChatPanel me={{ id: String(employee.id), collection: 'employees', name: employee.name }} />
            </div>
          )}

          {view === 'files' && <FilesView employeeId={employee.id} toast={toast} />}

          {view === 'leaves' && <LeavesView toast={toast} />}

          {view === 'attendance' && <AttendanceLogView history={history} />}
        </div>
      </main>
    </div>
  )
}

/* ============================== TASKS ============================== */

function TasksView({ tasks, toast, reload, setView }: { tasks: Doc[]; toast: (m: string) => void; reload: () => Promise<void>; setView: (v: string) => void }) {
  const newTasks = tasks.filter((t) => !t.accepted)
  const ongoing = tasks.filter((t) => t.accepted)

  async function accept(id: string) {
    await api(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ accepted: true }) })
    toast('Task accepted and added to your workflow.')
    await reload()
  }

  async function updateStatus(id: string, status: string) {
    await api(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
    toast('Status updated successfully')
    await reload()
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-black tracking-tight text-navy">My Tasks &amp; Projects</h1>
      <p className="mb-6 mt-1 font-body text-sm text-navy/50">Manage your assigned deliverables and update progress.</p>

      {newTasks.map((t) => (
        <div key={t.id} className="mb-5 flex flex-col gap-4 rounded-lg border-2 border-amber-400 bg-amber-50 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="flex items-center gap-2 font-heading text-base font-black text-navy">
              <Bell size={16} className="text-amber-500" /> New Assignment: {t.title}
            </h3>
            {t.description && <p className="mt-2 max-w-xl font-body text-sm text-navy/60">{t.description}</p>}
          </div>
          <div className="flex shrink-0 gap-2.5">
            <button onClick={() => setView('messages')} className="flex items-center gap-2 rounded-md border-2 border-navy px-4 py-2.5 font-heading text-xs font-bold uppercase text-navy hover:bg-navy/10">
              <MessageCircle size={14} /> Discuss
            </button>
            <button onClick={() => accept(t.id)} className="flex items-center gap-2 rounded-md bg-mint px-4 py-2.5 font-heading text-xs font-bold uppercase text-white hover:bg-navy">
              <Check size={14} /> Accept Task
            </button>
          </div>
        </div>
      ))}

      <Card title="Ongoing Deliverables">
        {ongoing.length === 0 ? (
          <p className="font-body text-sm text-navy/50">No ongoing projects yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {ongoing.map((t) => (
              <div key={t.id} className="rounded-lg border border-navy/10 bg-offwhite/60 p-5">
                <h4 className="font-heading text-base font-extrabold text-navy">{t.title}</h4>
                {t.description && <p className="mt-2 font-body text-[13px] leading-relaxed text-navy/60">{t.description}</p>}
                <div className="mt-4 flex items-center gap-2.5 border-t border-dashed border-navy/15 pt-4">
                  <label className="font-body text-[11px] font-bold uppercase text-navy/40">Status:</label>
                  <select
                    value={t.status}
                    onChange={(e) => updateStatus(t.id, e.target.value)}
                    className="flex-1 rounded border border-navy/15 bg-white px-2 py-1.5 font-body text-xs font-semibold text-navy focus:border-mint focus:outline-none"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Sent for Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

/* ============================== FILES ============================== */

const FILE_ICONS: Record<string, typeof FileText> = {
  pdf: FileText,
  video: FileVideo,
  image: FileImage,
}

function fileIconFor(mimeType?: string) {
  if (!mimeType) return FileIcon
  if (mimeType.includes('pdf')) return FILE_ICONS.pdf
  if (mimeType.startsWith('video/')) return FILE_ICONS.video
  if (mimeType.startsWith('image/')) return FILE_ICONS.image
  return FileIcon
}

function FilesView({ employeeId, toast }: { employeeId: string; toast: (m: string) => void }) {
  const [files, setFiles] = useState<Doc[]>([])
  const [activeFolder, setActiveFolder] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const load = useCallback(async () => {
    const data = await api(`/employee-files?where[employee][equals]=${employeeId}&limit=200&sort=-createdAt`)
    setFiles(data.docs || [])
  }, [employeeId])

  useEffect(() => {
    load()
  }, [load])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('_payload', JSON.stringify({ label: file.name, folder: activeFolder || 'other' }))
      const res = await fetch('/api/employee-files', { method: 'POST', credentials: 'include', body: form })
      if (!res.ok) throw new Error('Upload failed')
      toast('File uploaded securely to workspace')
      await load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const visible = activeFolder ? files.filter((f) => f.folder === activeFolder) : files
  const counts = Object.fromEntries(FOLDERS.map((f) => [f.value, files.filter((x) => x.folder === f.value).length]))

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-black tracking-tight text-navy">My Drive &amp; Files</h1>
          <p className="mt-1 font-body text-sm text-navy/50">Securely store and organize your project assets, templates and documents.</p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-md bg-mint px-5 py-3 font-heading text-xs font-bold uppercase text-white hover:bg-navy">
          <UploadCloud size={15} /> {uploading ? 'Uploading…' : 'Upload File'}
          <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} />
        </label>
      </div>

      <h3 className="mb-3 font-heading text-sm font-extrabold text-navy">Quick Folders</h3>
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {FOLDERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFolder(activeFolder === f.value ? null : f.value)}
            className={`flex flex-col items-center gap-2 rounded-lg border p-5 text-center transition-colors ${
              activeFolder === f.value ? 'border-mint bg-mint/5' : 'border-navy/10 bg-white hover:border-mint hover:bg-mint/5'
            }`}
          >
            <FolderOpen size={32} className="text-navy" />
            <b className="font-body text-[13px] text-navy">{f.label}</b>
            <small className="font-body text-[11px] text-navy/40">{counts[f.value] || 0} Files</small>
          </button>
        ))}
      </div>

      <h3 className="mb-3 font-heading text-sm font-extrabold text-navy">{activeFolder ? FOLDERS.find((f) => f.value === activeFolder)?.label : 'All Files'}</h3>
      <div className="rounded-lg border border-navy/10 bg-white">
        {visible.length === 0 && <p className="px-5 py-8 text-center font-body text-sm text-navy/40">No files here yet.</p>}
        {visible.map((f) => {
          const Icon = fileIconFor(f.mimeType)
          return (
            <div key={f.id} className="flex items-center justify-between border-b border-navy/10 px-5 py-4 last:border-0">
              <div className="flex items-center gap-4">
                <Icon size={22} className="text-navy/40" />
                <div>
                  <b className="block font-body text-[13px] text-navy">{f.label || f.filename}</b>
                  <small className="font-body text-[11px] text-navy/40">
                    {f.mimeType} · {f.filesize ? `${(f.filesize / 1024 / 1024).toFixed(1)} MB` : ''}
                  </small>
                </div>
              </div>
              <a href={f.url} target="_blank" rel="noopener noreferrer" className="rounded-md border border-navy/15 p-2 text-navy/50 hover:bg-navy/5">
                <Download size={14} />
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ============================== LEAVES ============================== */

function LeavesView({ toast }: { toast: (m: string) => void }) {
  const [leaves, setLeaves] = useState<Doc[]>([])
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    const data = await api('/leaves?limit=100&sort=-createdAt')
    setLeaves(data.docs || [])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    const form = new FormData(e.currentTarget)
    try {
      await api('/leaves', {
        method: 'POST',
        body: JSON.stringify({
          type: form.get('type'),
          fromDate: new Date(String(form.get('fromDate'))).toISOString(),
          toDate: new Date(String(form.get('toDate'))).toISOString(),
          reason: form.get('reason'),
        }),
      })
      toast('Request submitted for approval.')
      ;(e.target as HTMLFormElement).reset()
      await load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-black tracking-tight text-navy">Leave &amp; WFH Requests</h1>
      <p className="mb-6 mt-1 font-body text-sm text-navy/50">Apply for time off or Work From Home.</p>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card title="Apply for Leave / WFH">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <Field label="Request type">
              <select name="type" required className={inputClass}>
                <option value="">Select type…</option>
                <option value="casual">Casual Leave (CL)</option>
                <option value="sick">Sick Leave (SL)</option>
                <option value="wfh">Work From Home (WFH)</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="From date">
                <input name="fromDate" type="date" required className={inputClass} />
              </Field>
              <Field label="To date">
                <input name="toDate" type="date" required className={inputClass} />
              </Field>
            </div>
            <Field label="Reason / remarks">
              <textarea name="reason" rows={3} required className={inputClass} />
            </Field>
            <button disabled={submitting} className="mt-1 flex items-center justify-center gap-2 rounded-md bg-mint py-3 font-heading text-xs font-bold uppercase text-white hover:bg-navy disabled:opacity-60">
              <Send size={13} /> {submitting ? 'Submitting…' : 'Submit Request'}
            </button>
          </form>
        </Card>

        <Card title="My Request History">
          {leaves.length === 0 ? (
            <p className="font-body text-sm text-navy/50">No requests yet.</p>
          ) : (
            <div className="grid gap-2.5">
              {leaves.map((l) => (
                <div key={l.id} className="flex items-center justify-between rounded-md border border-navy/10 px-4 py-3">
                  <div>
                    <b className="block font-body text-sm capitalize text-navy">{l.type} leave</b>
                    <small className="font-body text-[11px] text-navy/40">{formatDay(l.fromDate)}</small>
                  </div>
                  <Badge color={l.status === 'approved' ? 'green' : l.status === 'rejected' ? 'red' : 'yellow'}>{l.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

/* ============================== ATTENDANCE LOG ============================== */

function AttendanceLogView({ history }: { history: Doc[] }) {
  function hours(r: Doc) {
    if (!r.checkInTime) return '—'
    const end = r.checkOutTime ? new Date(r.checkOutTime) : new Date()
    const ms = end.getTime() - new Date(r.checkInTime).getTime()
    return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-black tracking-tight text-navy">My Attendance Log</h1>
      <p className="mb-6 mt-1 font-body text-sm text-navy/50">Track your daily working hours and punch history.</p>

      <div className="overflow-x-auto rounded-lg border border-navy/10 bg-white">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-navy/10 bg-offwhite/60 text-left">
              {['Date', 'Punch In', 'Punch Out', 'Total Hours', 'Status'].map((h) => (
                <th key={h} className="px-4 py-3 font-body text-[11px] font-extrabold uppercase tracking-wide text-navy/40">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((r) => (
              <tr key={r.id} className="border-b border-navy/10 font-body text-sm last:border-0">
                <td className="px-4 py-3.5 text-navy">{formatDay(r.day)}</td>
                <td className="px-4 py-3.5 text-navy/70">{formatTime(r.checkInTime)}</td>
                <td className="px-4 py-3.5 text-navy/70">{formatTime(r.checkOutTime)}</td>
                <td className="px-4 py-3.5 text-navy/70">{hours(r)}</td>
                <td className="px-4 py-3.5">
                  <Badge color={r.status === 'present' ? 'green' : r.status === 'absent' ? 'red' : 'yellow'}>{r.status}</Badge>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center font-body text-sm text-navy/40">
                  No attendance records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
