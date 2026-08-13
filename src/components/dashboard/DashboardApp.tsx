'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  LayoutDashboard,
  Building2,
  Handshake,
  RefreshCw,
  Inbox,
  MailOpen,
  IndianRupee,
  FileText,
  Users,
  Clock,
  CalendarMinus,
  ListChecks,
  LogIn as LogInIcon,
  Database,
  ExternalLink,
  Search,
  LogOut,
  MessageCircle,
  PenLine,
  Briefcase,
} from 'lucide-react'
const ChatPanel = dynamic(() => import('@/components/chat/ChatPanel').then((m) => m.ChatPanel), {
  loading: () => <p className="font-body text-sm text-navy/40">Loading messages…</p>,
})
import {
  api,
  formatINR,
  relId,
  relLabel,
  useToast,
  ToastProvider,
  StatCard,
  Badge,
  Card,
  Modal,
  Field,
  inputClass,
  Progress,
  SectionHead,
  compressImage,
  ImagePickerField,
  useUnreadMessages,
  ScheduleMeetingModal,
} from './ui'

type Doc = Record<string, any>

const NAV = [
  {
    group: 'Overview',
    items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    group: 'Content Management',
    items: [
      { id: 'insights', label: 'Insights (Blogs)', icon: PenLine },
      { id: 'casestudies', label: 'Case Studies', icon: Briefcase },
      { id: 'team', label: 'Manage Team', icon: Users },
    ],
  },
  {
    group: 'Business',
    items: [
      { id: 'business', label: 'Command Center', icon: Building2 },
      { id: 'clients', label: 'Clients', icon: Handshake },
      { id: 'client360', label: 'Client 360°', icon: RefreshCw },
      { id: 'enquiries', label: 'New Enquiries', icon: Inbox },
      { id: 'pitch', label: 'Pitch CRM', icon: MailOpen },
    ],
  },
  {
    group: 'Finance',
    items: [
      { id: 'sales', label: 'Sales & Revenue', icon: IndianRupee },
      { id: 'payments', label: 'Payments', icon: FileText },
    ],
  },
  {
    group: 'HR Management',
    items: [
      { id: 'messages', label: 'Messages', icon: MessageCircle },
      { id: 'attendance', label: 'Attendance', icon: Clock },
      { id: 'leaves', label: 'Leaves', icon: CalendarMinus },
      { id: 'tasks', label: 'Tasks & Progress', icon: ListChecks },
      { id: 'activity', label: 'Logs', icon: LogInIcon },
    ],
  },
]

const WORK_CATEGORIES = ['ADVERTISING', 'BRAND', 'CONTENT', 'EDITORIAL', 'LANGUAGE']

function lexicalFromText(text: string) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: text
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => ({
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: [{ mode: 'normal', text: line, type: 'text', style: '', detail: 0, format: 0, version: 1 }],
        })),
    },
  }
}

function lexicalToText(content: any): string {
  try {
    const children = content?.root?.children || []
    return children
      .map((node: any) => (node.children || []).map((c: any) => c.text || '').join(''))
      .join('\n')
  } catch {
    return ''
  }
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function uploadMedia(file: File, alt: string): Promise<string> {
  const compressed = await compressImage(file)
  const form = new FormData()
  form.append('file', compressed)
  form.append('_payload', JSON.stringify({ alt }))
  const res = await fetch('/api/media', { method: 'POST', credentials: 'include', body: form })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.errors?.[0]?.message || 'Image upload failed — try a smaller image')
  }
  const data = await res.json()
  return String(data.doc.id)
}

function formatDate(v?: string | null) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function initials(name?: string) {
  if (!name) return '?'
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')
}

export default function DashboardApp() {
  return (
    <ToastProvider>
      <Shell />
    </ToastProvider>
  )
}

function Shell() {
  const router = useRouter()
  const toast = useToast()
  const [me, setMe] = useState<Doc | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('dashboard')
  const [search, setSearch] = useState('')
  const [employees, setEmployees] = useState<Doc[]>([])
  const [clients, setClients] = useState<Doc[]>([])
  const unreadMessages = useUnreadMessages(me ? `users:${me.id}` : null)

  useEffect(() => {
    ;(async () => {
      try {
        // Fire the auth check alongside the data fetches instead of waiting for
        // it first — if it turns out we're not authenticated we redirect away
        // and discard the rest, but on the happy path this saves a full
        // round-trip of latency.
        const [meRes, empData, clientData] = await Promise.all([
          fetch('/api/users/me', { credentials: 'include' }).then(async (r) => ({
            ok: r.ok,
            data: await r.json().catch(() => null),
          })),
          api('/employees?limit=200&sort=name').catch(() => ({ docs: [] })),
          api('/clients?limit=200&sort=name').catch(() => ({ docs: [] })),
        ])
        if (!meRes.ok || !meRes.data?.user) {
          router.push('/admin/login')
          return
        }
        setMe(meRes.data.user)
        setEmployees(empData.docs || [])
        setClients(clientData.docs || [])
      } catch {
        router.push('/admin/login')
        return
      } finally {
        setLoading(false)
      }
    })()
  }, [router])

  const refreshEmployees = useCallback(async () => {
    const data = await api('/employees?limit=200&sort=name')
    setEmployees(data.docs || [])
  }, [])

  const refreshClients = useCallback(async () => {
    const data = await api('/clients?limit=200&sort=name')
    setClients(data.docs || [])
  }, [])

  async function handleLogout() {
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' })
    router.push('/admin/login')
  }

  if (loading || !me) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="font-body text-sm text-navy/50">Loading…</p>
      </main>
    )
  }

  return (
    <div className="grid min-h-screen grid-cols-[260px_1fr] bg-offwhite text-navy">
      <aside className="flex flex-col overflow-y-auto bg-navy px-5 py-6 text-white">
        <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint font-heading text-lg font-black text-white">
            L
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-heading text-[15px] font-extrabold">The Logiphiles</span>
            <span className="font-heading text-[9px] font-bold uppercase tracking-[0.15em] text-mint">
              Super Admin
            </span>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((group) => (
            <div key={group.group}>
              <p className="mb-1.5 mt-4 px-2.5 font-heading text-[10px] font-extrabold uppercase tracking-[0.12em] text-white/40 first:mt-0">
                {group.group}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon
                const active = page === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPage(item.id)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 font-heading text-[12px] font-semibold transition-colors ${
                      active
                        ? 'border-l-4 border-mint bg-white/10 pl-2 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon size={16} /> {item.label}
                    {item.id === 'messages' && unreadMessages > 0 && (
                      <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 font-heading text-[10px] font-bold text-white">
                        {unreadMessages > 99 ? '99+' : unreadMessages}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}

          <p className="mb-1.5 mt-4 px-2.5 font-heading text-[10px] font-extrabold uppercase tracking-[0.12em] text-white/40">
            Database &amp; System
          </p>
          <a
            href="/cms"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 font-heading text-[12px] font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Database size={16} className="text-mint" /> CMS Admin
            <ExternalLink size={11} className="ml-auto" />
          </a>
        </nav>
      </aside>

      <main
        className="overflow-y-auto"
        style={{
          backgroundImage: 'radial-gradient(rgba(14,50,108,0.06) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        <header className="sticky top-0 z-10 flex h-[70px] items-center justify-between border-b border-navy/10 bg-white px-8">
          <div className="flex w-[350px] items-center gap-2 rounded-md border border-navy/10 bg-offwhite px-3.5 py-2.5">
            <Search size={15} className="text-navy/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team, client, task…"
              className="w-full bg-transparent font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="font-heading text-[13px] font-bold text-navy">{me.name || me.email}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-mint bg-navy font-heading text-xs font-bold text-white">
              {initials(me.name || me.email)}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              className="text-navy/40 transition-colors hover:text-red-600"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <div className="p-9">
          {page === 'dashboard' && <DashboardPage me={me} employees={employees} clients={clients} toast={toast} setPage={setPage} />}
          {page === 'insights' && <InsightsAdminPage search={search} toast={toast} />}
          {page === 'casestudies' && <CaseStudiesAdminPage search={search} toast={toast} />}
          {page === 'business' && <BusinessPage clients={clients} toast={toast} />}
          {page === 'clients' && (
            <ClientsPage clients={clients} search={search} toast={toast} refresh={refreshClients} />
          )}
          {page === 'client360' && <Client360Page clients={clients} />}
          {page === 'enquiries' && <EnquiriesPage search={search} toast={toast} />}
          {page === 'pitch' && <PitchPage search={search} toast={toast} refreshClients={refreshClients} />}
          {page === 'sales' && <SalesPage />}
          {page === 'payments' && <PaymentsPage clients={clients} search={search} toast={toast} />}
          {page === 'team' && (
            <TeamPage employees={employees} search={search} toast={toast} refresh={refreshEmployees} />
          )}
          {page === 'messages' && (
            <div>
              <SectionHead title="Team Messages & Meets" subtitle="Communicate directly with your team, create groups, or start video calls." />
              <ChatPanel me={{ id: String(me.id), collection: 'users', name: me.name || me.email }} />
            </div>
          )}
          {page === 'attendance' && <AttendancePage search={search} />}
          {page === 'leaves' && <LeavesPage employees={employees} toast={toast} />}
          {page === 'tasks' && (
            <TasksPage employees={employees} clients={clients} search={search} toast={toast} />
          )}
          {page === 'activity' && <ActivityPage employees={employees} />}
        </div>
      </main>
    </div>
  )
}

/* ============================== DASHBOARD ============================== */

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function DashboardPage({
  me,
  employees,
  clients,
  toast,
  setPage,
}: {
  me: Doc
  employees: Doc[]
  clients: Doc[]
  toast: (m: string) => void
  setPage: (p: string) => void
}) {
  const [tasks, setTasks] = useState<Doc[]>([])
  const [leaves, setLeaves] = useState<Doc[]>([])
  const [attendanceToday, setAttendanceToday] = useState<Doc[]>([])
  const [enquiries, setEnquiries] = useState<Doc[]>([])

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    ;(async () => {
      const [t, l, a, e] = await Promise.all([
        api('/tasks?limit=200'),
        api('/leaves?where[status][equals]=pending&limit=50'),
        api(`/attendance?where[day][equals]=${today}&limit=200`),
        api('/enquiries?limit=200&sort=-createdAt'),
      ])
      setTasks(t.docs || [])
      setLeaves(l.docs || [])
      setAttendanceToday(a.docs || [])
      setEnquiries(e.docs || [])
    })()
  }, [])

  const openTasks = tasks.filter((t) => t.status !== 'completed').length
  const activeClients = clients.filter((c) => c.status === 'active').length
  const pipeline = enquiries
    .filter((e) => !['converted', 'closed'].includes(e.stage))
    .reduce((sum, e) => sum + (e.value || 0), 0)

  const statusCounts = ['todo', 'in-progress', 'review', 'completed'].map((s) => ({
    label: { todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', completed: 'Completed' }[s],
    count: tasks.filter((t) => t.status === s).length,
  }))
  const totalTasks = tasks.length || 1

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const newThisWeek = enquiries.filter((e) => new Date(e.createdAt).getTime() > weekAgo).length
  const hotLeads = enquiries.filter((e) => e.stage === 'in-progress').length

  const firstName = (me.name || me.email || '').split(' ')[0]

  return (
    <div>
      <SectionHead
        title={`${greeting()}, ${firstName}.`}
        subtitle="Everything happening across The Logiphiles, in one place."
        action={
          <button
            onClick={() => setPage('tasks')}
            className="rounded-md bg-mint px-5 py-3 font-heading text-xs font-bold uppercase text-white hover:bg-navy"
          >
            + Assign Task
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Team Members" value={employees.length} trend={`${employees.filter((e) => e.active).length} active`} />
        <StatCard label="Present Today" value={attendanceToday.length} />
        <StatCard label="Open Tasks" value={openTasks} />
        <StatCard label="Active Clients" value={activeClients} />
        <StatCard label="Sales Pipeline" value={formatINR(pipeline)} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Card title="Task Workload">
          <div className="grid gap-3">
            {statusCounts.map((s) => (
              <div key={s.label}>
                <div className="mb-1 flex justify-between font-body text-xs font-semibold text-navy/70">
                  <span>{s.label}</span>
                  <span>{s.count}</span>
                </div>
                <Progress pct={(s.count / totalTasks) * 100} />
              </div>
            ))}
          </div>
        </Card>
        <Card title={`Pending Approvals (${leaves.length})`}>
          {leaves.length === 0 ? (
            <p className="font-body text-sm text-navy/50">No pending leave requests.</p>
          ) : (
            <div className="grid gap-3">
              {leaves.slice(0, 5).map((l) => (
                <div key={l.id} className="flex items-center justify-between border-b border-navy/10 pb-2.5 font-body text-sm">
                  <span>
                    {relLabel(l.employee)} · {l.type}
                  </span>
                  <button
                    onClick={() => setPage('leaves')}
                    className="rounded-md bg-mint/10 px-3 py-1.5 font-heading text-[10px] font-bold uppercase text-mint"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card title="New Enquiries">
          <div className="flex gap-3">
            <MiniKpi value={newThisWeek} label="This week" />
            <MiniKpi value={hotLeads} label="Hot leads" />
          </div>
        </Card>
        <Card title="Team Today">
          <div className="flex gap-3">
            <MiniKpi value={attendanceToday.length} label="Checked in" />
            <MiniKpi value={attendanceToday.filter((a) => !a.checkOutTime).length} label="Active now" />
          </div>
        </Card>
        <Card title="Pipeline">
          <div className="flex gap-3">
            <MiniKpi value={formatINR(pipeline)} label="Open value" />
            <MiniKpi value={enquiries.filter((e) => e.stage === 'converted').length} label="Converted" />
          </div>
        </Card>
      </div>
    </div>
  )
}

function MiniKpi({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="flex-1 rounded-md border border-navy/10 bg-offwhite/60 p-4">
      <b className="block font-heading text-xl font-black text-navy">{value}</b>
      <small className="font-body text-[10px] font-bold uppercase tracking-wide text-navy/40">{label}</small>
    </div>
  )
}

/* ============================== BUSINESS COMMAND CENTER ============================== */

function BusinessPage({ clients, toast }: { clients: Doc[]; toast: (m: string) => void }) {
  const [enquiries, setEnquiries] = useState<Doc[]>([])
  const [invoices, setInvoices] = useState<Doc[]>([])
  const [tasks, setTasks] = useState<Doc[]>([])
  const [leaves, setLeaves] = useState<Doc[]>([])

  useEffect(() => {
    ;(async () => {
      const [e, i, t, l] = await Promise.all([
        api('/enquiries?limit=200'),
        api('/invoices?limit=200'),
        api('/tasks?limit=200'),
        api('/leaves?where[status][equals]=pending&limit=50'),
      ])
      setEnquiries(e.docs || [])
      setInvoices(i.docs || [])
      setTasks(t.docs || [])
      setLeaves(l.docs || [])
    })()
  }, [])

  const funnel = ['new', 'contacted', 'in-progress', 'converted', 'closed'].map((stage) => ({
    stage,
    count: enquiries.filter((e) => e.stage === stage).length,
  }))
  const receivables = invoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.amount, 0)
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue')
  const overdueTasks = tasks.filter((t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'completed')
  const hotEnquiries = enquiries.filter((e) => e.stage === 'in-progress')
  const revenueMTD = invoices
    .filter((i) => i.status === 'paid' && new Date(i.issuedDate).getMonth() === new Date().getMonth())
    .reduce((s, i) => s + i.amount, 0)
  const pipeline = enquiries.filter((e) => !['converted', 'closed'].includes(e.stage)).reduce((s, e) => s + (e.value || 0), 0)
  const collectionRate = invoices.length
    ? Math.round((invoices.filter((i) => i.status === 'paid').length / invoices.length) * 100)
    : 0
  const completedTasks = tasks.length ? Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100) : 0
  const healthy = clients.filter((c) => c.status === 'active').length
  const atRisk = clients.filter((c) => c.status === 'at-risk').length

  return (
    <div>
      <SectionHead title="Business Command Center" subtitle="One view of revenue, pipeline, delivery, clients and cash." />

      <div className="mb-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Revenue MTD" value={formatINR(revenueMTD)} />
        <StatCard label="Receivables" value={formatINR(receivables)} trend={`${invoices.filter((i) => i.status !== 'paid').length} invoices`} />
        <StatCard label="Sales Pipeline" value={formatINR(pipeline)} />
        <StatCard label="Active Clients" value={clients.filter((c) => c.status === 'active').length} />
        <StatCard label="Task Completion" value={`${completedTasks}%`} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card title="Company Funnel">
          <div className="grid gap-2.5">
            {funnel.map((f) => (
              <div key={f.stage} className="flex justify-between border-b border-navy/10 pb-2.5 font-body text-sm capitalize">
                <span>{f.stage}</span>
                <b>{f.count}</b>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Management Alerts">
          <div className="grid gap-2.5 font-body text-sm">
            <div className="flex items-center justify-between border-b border-navy/10 pb-2.5">
              <span>{overdueInvoices.length} invoices overdue</span>
            </div>
            <div className="flex items-center justify-between border-b border-navy/10 pb-2.5">
              <span>{leaves.length} leave requests pending</span>
            </div>
            <div className="flex items-center justify-between border-b border-navy/10 pb-2.5">
              <span>{overdueTasks.length} tasks overdue</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{hotEnquiries.length} hot enquiries</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card title="Delivery Health">
          <MiniKpi value={`${completedTasks}%`} label="Tasks complete" />
        </Card>
        <Card title="Client Health">
          <div className="flex gap-3">
            <MiniKpi value={healthy} label="Healthy" />
            <MiniKpi value={atRisk} label="At risk" />
          </div>
        </Card>
        <Card title="Cash Health">
          <div className="flex gap-3">
            <MiniKpi value={`${collectionRate}%`} label="Collection rate" />
            <MiniKpi value={formatINR(overdueInvoices.reduce((s, i) => s + i.amount, 0))} label="Overdue" />
          </div>
        </Card>
      </div>
    </div>
  )
}

/* ============================== CLIENTS ============================== */

function ClientsPage({
  clients,
  search,
  toast,
  refresh,
}: {
  clients: Doc[]
  search: string
  toast: (m: string) => void
  refresh: () => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [localClients, setLocalClients] = useState<Doc[]>(clients)

  useEffect(() => {
    setLocalClients(clients)
  }, [clients])

  const filtered = localClients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))

  async function updateStatus(id: string, status: string) {
    setLocalClients((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))
    try {
      await api(`/clients/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to update status')
      await refresh()
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const form = new FormData(e.currentTarget)
    try {
      await api('/clients', {
        method: 'POST',
        body: JSON.stringify({
          name: form.get('name'),
          industry: form.get('industry'),
          value: Number(form.get('value')) || 0,
          status: form.get('status'),
          onboardedDate: new Date().toISOString(),
          visible: false,
        }),
      })
      toast('Client added')
      setOpen(false)
      await refresh()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to add client')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <SectionHead
        title="Clients"
        subtitle="Onboarded clients, industries and account value."
        action={
          <button onClick={() => setOpen(true)} className="rounded-md bg-mint px-5 py-3 font-heading text-xs font-bold uppercase text-white hover:bg-navy">
            + Onboard Client
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-5 md:grid-cols-4">
        <StatCard label="Total" value={localClients.length} />
        <StatCard label="Active" value={localClients.filter((c) => c.status === 'active').length} />
        <StatCard label="Onboarding" value={localClients.filter((c) => c.status === 'onboarding').length} />
        <StatCard label="At Risk" value={localClients.filter((c) => c.status === 'at-risk').length} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-navy/10 bg-white">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-navy/10 bg-offwhite/60 text-left">
              {['Client', 'Industry', 'Onboarded', 'Value', 'Status'].map((h) => (
                <th key={h} className="px-4 py-3 font-body text-[11px] font-extrabold uppercase tracking-wide text-navy/40">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-navy/10 font-body text-sm last:border-0">
                <td className="px-4 py-3.5 font-bold text-navy">{c.name}</td>
                <td className="px-4 py-3.5 text-navy/70">{c.industry || '—'}</td>
                <td className="px-4 py-3.5 text-navy/70">{formatDate(c.onboardedDate)}</td>
                <td className="px-4 py-3.5 text-navy/70">{formatINR(c.value)}</td>
                <td className="px-4 py-3.5">
                  <select
                    value={c.status || 'active'}
                    onChange={(ev) => updateStatus(c.id, ev.target.value)}
                    className="rounded-md border border-navy/15 bg-white px-2 py-1.5 font-body text-xs font-semibold text-navy"
                  >
                    <option value="active">Active</option>
                    <option value="onboarding">Onboarding</option>
                    <option value="at-risk">At Risk</option>
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center font-body text-sm text-navy/40">
                  No clients yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Onboard Client">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field label="Client name">
            <input name="name" required className={inputClass} />
          </Field>
          <Field label="Industry">
            <input name="industry" className={inputClass} />
          </Field>
          <Field label="Monthly value (₹)">
            <input name="value" type="number" className={inputClass} />
          </Field>
          <Field label="Status">
            <select name="status" defaultValue="onboarding" className={inputClass}>
              <option value="active">Active</option>
              <option value="onboarding">Onboarding</option>
              <option value="at-risk">At Risk</option>
            </select>
          </Field>
          <button disabled={saving} className="mt-2 rounded-md bg-mint py-3 font-heading text-xs font-bold uppercase text-white hover:bg-navy disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Client'}
          </button>
        </form>
      </Modal>
    </div>
  )
}

/* ============================== CLIENT 360 ============================== */

function Client360Page({ clients }: { clients: Doc[] }) {
  const [selected, setSelected] = useState<string>('')
  const [tasks, setTasks] = useState<Doc[]>([])
  const [invoices, setInvoices] = useState<Doc[]>([])

  useEffect(() => {
    if (clients.length && !selected) setSelected(String(clients[0].id))
  }, [clients, selected])

  useEffect(() => {
    if (!selected) return
    ;(async () => {
      const [t, i] = await Promise.all([
        api(`/tasks?where[client][equals]=${selected}&limit=100`),
        api(`/invoices?where[client][equals]=${selected}&limit=100`),
      ])
      setTasks(t.docs || [])
      setInvoices(i.docs || [])
    })()
  }, [selected])

  const client = clients.find((c) => String(c.id) === selected)
  const progressMap: Record<string, number> = { todo: 10, 'in-progress': 55, review: 80, completed: 100 }
  const outstanding = invoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.amount, 0)
  const timeline = [
    ...tasks.map((t) => ({ date: t.createdAt, type: 'Task', activity: t.title, status: t.status })),
    ...invoices.map((i) => ({ date: i.issuedDate, type: 'Invoice', activity: i.invoiceNumber, status: i.status })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div>
      <SectionHead
        title="Client 360°"
        subtitle="Complete client dashboard: projects, tasks and payments."
        action={
          <select value={selected} onChange={(e) => setSelected(e.target.value)} className={`${inputClass} w-64`}>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        }
      />

      {client && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-5 md:grid-cols-4">
            <StatCard label="Client Value" value={formatINR(client.value)} />
            <StatCard label="Tasks" value={tasks.length} trend={`${tasks.filter((t) => t.status === 'completed').length} completed`} />
            <StatCard label="Outstanding" value={formatINR(outstanding)} />
            <StatCard label="Client Health" value={client.status || 'active'} />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card title="Project Progress">
              {tasks.length === 0 ? (
                <p className="font-body text-sm text-navy/50">No tasks linked to this client yet.</p>
              ) : (
                <div className="grid gap-3">
                  {tasks.map((t) => (
                    <div key={t.id}>
                      <div className="mb-1 flex justify-between font-body text-xs font-semibold text-navy/70">
                        <span>{t.title}</span>
                        <span>{progressMap[t.status]}%</span>
                      </div>
                      <Progress pct={progressMap[t.status]} />
                    </div>
                  ))}
                </div>
              )}
            </Card>
            <Card title="Client Snapshot">
              <div className="grid gap-2.5 font-body text-sm">
                <div className="flex justify-between border-b border-navy/10 pb-2.5">
                  <span className="text-navy/50">Industry</span>
                  <b>{client.industry || '—'}</b>
                </div>
                <div className="flex justify-between border-b border-navy/10 pb-2.5">
                  <span className="text-navy/50">Onboarded</span>
                  <b>{formatDate(client.onboardedDate)}</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy/50">Status</span>
                  <b className="capitalize">{client.status}</b>
                </div>
              </div>
            </Card>
          </div>

          <Card title="Client Timeline">
            <div className="grid gap-2.5">
              {timeline.length === 0 && <p className="font-body text-sm text-navy/50">No activity yet.</p>}
              {timeline.map((row, i) => (
                <div key={i} className="flex items-center justify-between border-b border-navy/10 pb-2.5 font-body text-sm last:border-0">
                  <span className="text-navy/50">{formatDate(row.date)}</span>
                  <span>{row.type}</span>
                  <span className="flex-1 px-3">{row.activity}</span>
                  <Badge color="blue">{row.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

/* ============================== ENQUIRIES ============================== */

const STAGE_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'converted', label: 'Converted' },
  { value: 'closed', label: 'Closed' },
]

function EnquiriesPage({ search, toast }: { search: string; toast: (m: string) => void }) {
  const [enquiries, setEnquiries] = useState<Doc[]>([])
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const data = await api('/enquiries?limit=200&sort=-createdAt')
    setEnquiries(data.docs || [])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = enquiries.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()) || (e.company || '').toLowerCase().includes(search.toLowerCase()))

  async function updateStage(id: string, stage: string) {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, stage } : e)))
    await api(`/enquiries/${id}`, { method: 'PATCH', body: JSON.stringify({ stage }) })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const form = new FormData(e.currentTarget)
    try {
      await api('/enquiries', {
        method: 'POST',
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          company: form.get('company'),
          service: form.get('service'),
          message: form.get('message') || 'Added manually via dashboard.',
          value: Number(form.get('value')) || 0,
        }),
      })
      toast('Enquiry added to pipeline')
      setOpen(false)
      await load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to add enquiry')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <SectionHead
        title="New Enquiries"
        subtitle="Capture, qualify and convert every incoming lead."
        action={
          <button onClick={() => setOpen(true)} className="rounded-md bg-mint px-5 py-3 font-heading text-xs font-bold uppercase text-white hover:bg-navy">
            + Add Enquiry
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-5 md:grid-cols-4">
        <StatCard label="New" value={enquiries.filter((e) => e.stage === 'new').length} />
        <StatCard label="Contacted" value={enquiries.filter((e) => e.stage === 'contacted').length} />
        <StatCard label="In Progress" value={enquiries.filter((e) => e.stage === 'in-progress').length} />
        <StatCard label="Converted" value={enquiries.filter((e) => e.stage === 'converted').length} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-navy/10 bg-white">
        <table className="w-full min-w-[1080px]">
          <thead>
            <tr className="border-b border-navy/10 bg-offwhite/60 text-left">
              {['Lead', 'Email', 'Phone', 'Message', 'Date/Time', 'Source', 'Status'].map((h) => (
                <th key={h} className="px-4 py-3 font-body text-[11px] font-extrabold uppercase tracking-wide text-navy/40">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-b border-navy/10 font-body text-sm last:border-0">
                <td className="px-4 py-3.5 font-bold text-navy">
                  {e.name}
                  {e.company && <span className="block font-normal text-navy/40">{e.company}</span>}
                </td>
                <td className="px-4 py-3.5 text-navy/70">{e.email || '—'}</td>
                <td className="px-4 py-3.5 text-navy/70">{e.phone || '—'}</td>
                <td className="max-w-[220px] px-4 py-3.5 text-navy/70">
                  <span className="line-clamp-2">{e.message || '—'}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-navy/70">
                  {e.createdAt ? new Date(e.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                </td>
                <td className="px-4 py-3.5 text-navy/70">{e.source || '—'}</td>
                <td className="px-4 py-3.5">
                  <select
                    value={e.stage}
                    onChange={(ev) => updateStage(e.id, ev.target.value)}
                    className="rounded-md border border-navy/15 bg-white px-2 py-1.5 font-body text-xs font-semibold text-navy"
                  >
                    {STAGE_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center font-body text-sm text-navy/40">
                  No enquiries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Enquiry">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field label="Lead name">
            <input name="name" required className={inputClass} />
          </Field>
          <Field label="Email">
            <input name="email" type="email" required className={inputClass} />
          </Field>
          <Field label="Company">
            <input name="company" className={inputClass} />
          </Field>
          <Field label="Service">
            <input name="service" className={inputClass} />
          </Field>
          <Field label="Estimated value (₹)">
            <input name="value" type="number" className={inputClass} />
          </Field>
          <button disabled={saving} className="mt-2 rounded-md bg-mint py-3 font-heading text-xs font-bold uppercase text-white hover:bg-navy disabled:opacity-60">
            {saving ? 'Saving…' : 'Add to Pipeline'}
          </button>
        </form>
      </Modal>
    </div>
  )
}

/* ============================== PITCH CRM ============================== */

function PitchPage({
  search,
  toast,
  refreshClients,
}: {
  search: string
  toast: (m: string) => void
  refreshClients: () => Promise<void>
}) {
  const [prospects, setProspects] = useState<Doc[]>([])
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const data = await api('/pitch-prospects?limit=200')
    setProspects(data.docs || [])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = prospects.filter((p) => p.company.toLowerCase().includes(search.toLowerCase()))

  async function updateStage(id: string, stage: string) {
    setProspects((prev) => prev.map((p) => (p.id === id ? { ...p, stage } : p)))
    await api(`/pitch-prospects/${id}`, { method: 'PATCH', body: JSON.stringify({ stage }) })
    // "won" fires a backend hook that creates/updates a Client — pull the
    // fresh client list so the Clients page reflects it without a reload.
    if (stage === 'won') {
      await refreshClients()
      toast('Prospect marked won — client value updated')
    }
  }

  function composePitch(p: Doc) {
    const email = p.email || prompt(`Email for ${p.decisionMaker} at ${p.company}:`, '')
    if (!email) return
    const subject = `A proposal for ${p.company} | The Logiphiles`
    const body = `Hi ${p.decisionMaker},\n\nWe'd love to share a focused proposal for ${p.need || 'your project'}, tailored to ${p.company}.\n\nWould you be open to a short conversation this week?\n\nRegards,\nThe Logiphiles`
    location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const form = new FormData(e.currentTarget)
    try {
      await api('/pitch-prospects', {
        method: 'POST',
        body: JSON.stringify({
          company: form.get('company'),
          decisionMaker: form.get('decisionMaker'),
          email: form.get('email'),
          need: form.get('need'),
          value: Number(form.get('value')) || 0,
        }),
      })
      toast('Prospect added to Pitch CRM')
      setOpen(false)
      await load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to add prospect')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <SectionHead
        title="Pitch CRM"
        subtitle="Prospects, follow-ups and pitch intelligence."
        action={
          <button onClick={() => setOpen(true)} className="rounded-md bg-mint px-5 py-3 font-heading text-xs font-bold uppercase text-white hover:bg-navy">
            + Add Prospect
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-5 md:grid-cols-4">
        <StatCard label="Prospects" value={prospects.length} />
        <StatCard label="Hot" value={prospects.filter((p) => p.stage === 'hot').length} />
        <StatCard label="Proposals" value={prospects.filter((p) => p.stage === 'proposal').length} />
        <StatCard label="Potential Value" value={formatINR(prospects.reduce((s, p) => s + (p.value || 0), 0))} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-navy/10 bg-white">
        <table className="w-full min-w-[820px]">
          <thead>
            <tr className="border-b border-navy/10 bg-offwhite/60 text-left">
              {['Prospect', 'Decision Maker', 'Need', 'Value', 'Follow-up', 'Stage', ''].map((h) => (
                <th key={h} className="px-4 py-3 font-body text-[11px] font-extrabold uppercase tracking-wide text-navy/40">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-navy/10 font-body text-sm last:border-0">
                <td className="px-4 py-3.5 font-bold text-navy">{p.company}</td>
                <td className="px-4 py-3.5 text-navy/70">{p.decisionMaker}</td>
                <td className="px-4 py-3.5 text-navy/70">{p.need || '—'}</td>
                <td className="px-4 py-3.5 text-navy/70">{formatINR(p.value)}</td>
                <td className="px-4 py-3.5 text-navy/70">{formatDate(p.nextFollowUp)}</td>
                <td className="px-4 py-3.5">
                  <select
                    value={p.stage}
                    onChange={(ev) => updateStage(p.id, ev.target.value)}
                    className="rounded-md border border-navy/15 bg-white px-2 py-1.5 font-body text-xs font-semibold text-navy"
                  >
                    {['to-pitch', 'hot', 'follow-up', 'proposal', 'won', 'lost'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3.5">
                  <button onClick={() => composePitch(p)} className="rounded-md border border-navy/15 px-3 py-1.5 font-heading text-[10px] font-bold uppercase text-navy hover:bg-navy/5">
                    Email
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center font-body text-sm text-navy/40">
                  No prospects yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Pitch Prospect">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field label="Company">
            <input name="company" required className={inputClass} />
          </Field>
          <Field label="Decision maker">
            <input name="decisionMaker" required className={inputClass} />
          </Field>
          <Field label="Email">
            <input name="email" type="email" className={inputClass} />
          </Field>
          <Field label="Business need">
            <input name="need" className={inputClass} />
          </Field>
          <Field label="Estimated value (₹)">
            <input name="value" type="number" className={inputClass} />
          </Field>
          <button disabled={saving} className="mt-2 rounded-md bg-mint py-3 font-heading text-xs font-bold uppercase text-white hover:bg-navy disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Prospect'}
          </button>
        </form>
      </Modal>
    </div>
  )
}

/* ============================== SALES & REVENUE ============================== */

function SalesPage() {
  const [invoices, setInvoices] = useState<Doc[]>([])
  const [enquiries, setEnquiries] = useState<Doc[]>([])

  useEffect(() => {
    ;(async () => {
      const [i, e] = await Promise.all([api('/invoices?limit=500'), api('/enquiries?limit=500')])
      setInvoices(i.docs || [])
      setEnquiries(e.docs || [])
    })()
  }, [])

  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-IN', { month: 'short' }) }
  })
  const monthlyRevenue = months.map((m) => ({
    ...m,
    total: invoices
      .filter((i) => i.status === 'paid' && `${new Date(i.issuedDate).getFullYear()}-${new Date(i.issuedDate).getMonth()}` === m.key)
      .reduce((s, i) => s + i.amount, 0),
  }))
  const maxRevenue = Math.max(1, ...monthlyRevenue.map((m) => m.total))

  const won = enquiries.filter((e) => e.stage === 'converted').length
  const total = enquiries.length || 1
  const conversion = Math.round((won / total) * 100)
  const pipeline = enquiries.filter((e) => !['converted', 'closed'].includes(e.stage)).reduce((s, e) => s + (e.value || 0), 0)
  const revenueMTD = invoices
    .filter((i) => i.status === 'paid' && new Date(i.issuedDate).getMonth() === new Date().getMonth())
    .reduce((s, i) => s + i.amount, 0)
  const avgDeal = won ? Math.round(enquiries.filter((e) => e.stage === 'converted').reduce((s, e) => s + (e.value || 0), 0) / won) : 0

  const funnelValue = STAGE_OPTIONS.filter((s) => !['converted', 'closed'].includes(s.value)).map((s) => ({
    label: s.label,
    value: enquiries.filter((e) => e.stage === s.value).reduce((sum, e) => sum + (e.value || 0), 0),
  }))

  return (
    <div>
      <SectionHead title="Sales & Revenue" subtitle="Pipeline, won deals, monthly revenue and conversion." />

      <div className="mb-6 grid grid-cols-2 gap-5 md:grid-cols-5">
        <StatCard label="This Month" value={formatINR(revenueMTD)} />
        <StatCard label="Won Deals" value={won} />
        <StatCard label="Pipeline" value={formatINR(pipeline)} />
        <StatCard label="Conversion" value={`${conversion}%`} />
        <StatCard label="Avg Deal" value={formatINR(avgDeal)} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card title="Monthly Revenue (Paid)">
          <div className="flex h-52 items-end gap-4 pt-5">
            {monthlyRevenue.map((m) => (
              <div key={m.key} className="relative flex-1 rounded-t-md bg-mint transition-opacity hover:opacity-80" style={{ height: `${(m.total / maxRevenue) * 100}%`, minHeight: 4 }}>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-body text-[11px] font-semibold text-navy/50">{m.label}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Pipeline by Stage">
          <div className="grid gap-2.5">
            {funnelValue.map((f) => (
              <div key={f.label} className="flex justify-between border-b border-navy/10 pb-2.5 font-body text-sm">
                <span>{f.label}</span>
                <b>{formatINR(f.value)}</b>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

/* ============================== PAYMENTS ============================== */

function PaymentsPage({ clients, search, toast }: { clients: Doc[]; search: string; toast: (m: string) => void }) {
  const [invoices, setInvoices] = useState<Doc[]>([])
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const data = await api('/invoices?limit=200')
    setInvoices(data.docs || [])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = invoices.filter((i) => i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || relLabel(i.client).toLowerCase().includes(search.toLowerCase()))

  function sendReminder(inv: Doc) {
    const email = prompt('Client email for payment reminder:', '')
    if (!email) return
    const client = relLabel(inv.client)
    location.href = `mailto:${email}?subject=${encodeURIComponent('Payment reminder - ' + client)}&body=${encodeURIComponent(`Dear Client,\n\nThis is a gentle reminder regarding invoice ${inv.invoiceNumber} for ${client}.\n\nRegards,\nThe Logiphiles`)}`
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const form = new FormData(e.currentTarget)
    try {
      await api('/invoices', {
        method: 'POST',
        body: JSON.stringify({
          invoiceNumber: form.get('invoiceNumber'),
          client: Number(form.get('client')),
          amount: Number(form.get('amount')),
          issuedDate: new Date().toISOString(),
          dueDate: new Date(String(form.get('dueDate'))).toISOString(),
          status: form.get('status'),
        }),
      })
      toast('Invoice saved')
      setOpen(false)
      await load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save invoice')
    } finally {
      setSaving(false)
    }
  }

  const collected = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const pending = invoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.amount, 0)
  const overdue = invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.amount, 0)

  return (
    <div>
      <SectionHead
        title="Payments & Collections"
        subtitle="Invoices, payments received and outstanding dues."
        action={
          <button onClick={() => setOpen(true)} className="rounded-md bg-mint px-5 py-3 font-heading text-xs font-bold uppercase text-white hover:bg-navy">
            + Add Invoice
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-5 md:grid-cols-4">
        <StatCard label="Collected" value={formatINR(collected)} />
        <StatCard label="Pending" value={formatINR(pending)} />
        <StatCard label="Overdue" value={formatINR(overdue)} />
        <StatCard label="Total Invoices" value={invoices.length} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-navy/10 bg-white">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-navy/10 bg-offwhite/60 text-left">
              {['Invoice', 'Client', 'Amount', 'Due', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-3 font-body text-[11px] font-extrabold uppercase tracking-wide text-navy/40">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.id} className="border-b border-navy/10 font-body text-sm last:border-0">
                <td className="px-4 py-3.5 font-bold text-navy">{inv.invoiceNumber}</td>
                <td className="px-4 py-3.5 text-navy/70">{relLabel(inv.client)}</td>
                <td className="px-4 py-3.5 text-navy/70">{formatINR(inv.amount)}</td>
                <td className="px-4 py-3.5 text-navy/70">{formatDate(inv.dueDate)}</td>
                <td className="px-4 py-3.5">
                  <Badge color={inv.status === 'paid' ? 'green' : inv.status === 'overdue' ? 'red' : 'yellow'}>{inv.status}</Badge>
                </td>
                <td className="px-4 py-3.5">
                  {inv.status !== 'paid' && (
                    <button onClick={() => sendReminder(inv)} className="rounded-md border border-navy/15 px-3 py-1.5 font-heading text-[10px] font-bold uppercase text-navy hover:bg-navy/5">
                      Reminder
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center font-body text-sm text-navy/40">
                  No invoices yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Invoice">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field label="Invoice number">
            <input name="invoiceNumber" required className={inputClass} />
          </Field>
          <Field label="Client">
            <select name="client" required className={inputClass}>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Amount (₹)">
            <input name="amount" type="number" required className={inputClass} />
          </Field>
          <Field label="Due date">
            <input name="dueDate" type="date" required className={inputClass} />
          </Field>
          <Field label="Status">
            <select name="status" defaultValue="due" className={inputClass}>
              <option value="due">Due</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </Field>
          <button disabled={saving} className="mt-2 rounded-md bg-mint py-3 font-heading text-xs font-bold uppercase text-white hover:bg-navy disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Invoice'}
          </button>
        </form>
      </Modal>
    </div>
  )
}

/* ============================== TEAM ============================== */

function TeamPage({
  employees,
  search,
  toast,
  refresh,
}: {
  employees: Doc[]
  search: string
  toast: (m: string) => void
  refresh: () => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({})
  const [createdCreds, setCreatedCreds] = useState<{ name: string; email: string; password: string } | null>(null)
  const [passwordField, setPasswordField] = useState('')
  const [selected, setSelected] = useState<Doc | null>(null)

  useEffect(() => {
    ;(async () => {
      const data = await api('/tasks?limit=500')
      const counts: Record<string, number> = {}
      for (const t of data.docs || []) {
        const id = relId(t.employee)
        counts[id] = (counts[id] || 0) + 1
      }
      setTaskCounts(counts)
    })()
  }, [employees])

  const filtered = employees.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))

  function randomPassword() {
    return Math.random().toString(36).slice(-6) + Math.floor(Math.random() * 90 + 10)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const form = new FormData(e.currentTarget)
    const password = passwordField.trim() || randomPassword()
    const name = String(form.get('name') || '')
    const email = String(form.get('email') || '')
    try {
      const photoFile = form.get('photo') as File | null
      const payload: Record<string, unknown> = {
        name,
        email,
        password,
        department: form.get('department'),
        role: form.get('role'),
      }
      if (photoFile && photoFile.size > 0) {
        payload.photo = Number(await uploadMedia(photoFile, name))
      }
      await api('/employees', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      toast('Team member added')
      setOpen(false)
      setPasswordField('')
      setCreatedCreds({ name, email, password })
      await refresh()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to add team member')
    } finally {
      setSaving(false)
    }
  }

  function copy(text: string) {
    navigator.clipboard?.writeText(text)
    toast('Copied to clipboard')
  }

  return (
    <div>
      <SectionHead
        title="Team Management"
        subtitle="Add and onboard employees, roles and departments."
        action={
          <button onClick={() => setOpen(true)} className="rounded-md bg-mint px-5 py-3 font-heading text-xs font-bold uppercase text-white hover:bg-navy">
            + Add Team Member
          </button>
        }
      />

      <div className="overflow-x-auto rounded-lg border border-navy/10 bg-white">
        <table className="w-full min-w-[880px]">
          <thead>
            <tr className="border-b border-navy/10 bg-offwhite/60 text-left">
              {['Member', 'Employee ID', 'Department', 'Role', 'Status', 'Tasks', ''].map((h) => (
                <th key={h} className="px-4 py-3 font-body text-[11px] font-extrabold uppercase tracking-wide text-navy/40">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => (
              <tr key={emp.id} className="border-b border-navy/10 font-body text-sm last:border-0">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3 font-bold text-navy">
                    {emp.photo?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={emp.photo.url} alt="" className="h-8 w-8 shrink-0 rounded-md object-cover" />
                    ) : (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-mint/10 font-heading text-xs font-extrabold text-mint">
                        {initials(emp.name)}
                      </span>
                    )}
                    {emp.name}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-navy/50">{emp.employeeId || '—'}</td>
                <td className="px-4 py-3.5 text-navy/70">{emp.department || '—'}</td>
                <td className="px-4 py-3.5 text-navy/70">{emp.role || '—'}</td>
                <td className="px-4 py-3.5">
                  <Badge color={emp.active ? 'green' : 'gray'}>{emp.active ? 'Active' : 'Inactive'}</Badge>
                </td>
                <td className="px-4 py-3.5 text-navy/70">{taskCounts[String(emp.id)] || 0}</td>
                <td className="px-4 py-3.5">
                  <button
                    onClick={() => setSelected(emp)}
                    className="rounded-md border border-navy/15 px-3 py-1.5 font-heading text-[10px] font-bold uppercase text-navy hover:bg-navy/5"
                  >
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center font-body text-sm text-navy/40">
                  No team members yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Team Member">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field label="Profile Photo (optional)">
            <ImagePickerField name="photo" required={false} />
          </Field>
          <Field label="Name">
            <input name="name" required className={inputClass} />
          </Field>
          <Field label="Email">
            <input name="email" type="email" required className={inputClass} />
          </Field>
          <Field label="Department">
            <input name="department" className={inputClass} />
          </Field>
          <Field label="Role / Designation">
            <input name="role" required className={inputClass} />
          </Field>
          <Field label="Login Password">
            <div className="flex gap-2">
              <input
                name="password"
                value={passwordField}
                onChange={(e) => setPasswordField(e.target.value)}
                placeholder="Leave blank to auto-generate"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setPasswordField(randomPassword())}
                className="shrink-0 rounded-md border border-navy/15 px-3 font-heading text-[10px] font-bold uppercase text-navy hover:bg-navy/5"
              >
                Generate
              </button>
            </div>
          </Field>
          <p className="font-body text-xs text-navy/50">
            Set this employee&apos;s password now, or leave it blank and one will be generated for you — either
            way you&apos;ll see it again right after saving so you can share it with them.
          </p>
          <button disabled={saving} className="mt-2 rounded-md bg-mint py-3 font-heading text-xs font-bold uppercase text-white hover:bg-navy disabled:opacity-60">
            {saving ? 'Creating…' : 'Create Member'}
          </button>
        </form>
      </Modal>

      <Modal open={!!createdCreds} onClose={() => setCreatedCreds(null)} title="Team Member Created">
        {createdCreds && (
          <div className="grid gap-4">
            <p className="font-body text-sm text-navy/70">
              Share these login details with <strong className="text-navy">{createdCreds.name}</strong>. For
              security, this password cannot be shown again once you close this window — the employee should
              change it after first login.
            </p>
            <div className="grid gap-3 rounded-lg border border-navy/10 bg-offwhite/60 p-4">
              <div>
                <span className="font-body text-[11px] font-extrabold uppercase tracking-wide text-navy/40">Login Email</span>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <span className="font-body text-sm font-semibold text-navy">{createdCreds.email}</span>
                  <button
                    type="button"
                    onClick={() => copy(createdCreds.email)}
                    className="rounded-md border border-navy/15 px-3 py-1.5 font-heading text-[10px] font-bold uppercase text-navy hover:bg-white"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div>
                <span className="font-body text-[11px] font-extrabold uppercase tracking-wide text-navy/40">Temporary Password</span>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <span className="font-mono text-sm font-semibold text-navy">{createdCreds.password}</span>
                  <button
                    type="button"
                    onClick={() => copy(createdCreds.password)}
                    className="rounded-md border border-navy/15 px-3 py-1.5 font-heading text-[10px] font-bold uppercase text-navy hover:bg-white"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setCreatedCreds(null)}
              className="rounded-md bg-mint py-3 font-heading text-xs font-bold uppercase text-white hover:bg-navy"
            >
              Done
            </button>
          </div>
        )}
      </Modal>

      {selected && (
        <EmployeeProfileModal
          employee={selected}
          onClose={() => setSelected(null)}
          toast={toast}
          onSaved={async (updated) => {
            setSelected(updated)
            await refresh()
          }}
          onDeleted={async () => {
            setSelected(null)
            await refresh()
          }}
        />
      )}
    </div>
  )
}

/* ============================== EMPLOYEE PROFILE ============================== */

const DOC_FOLDERS = [
  { value: 'documents', label: 'Documents' },
  { value: 'brand-logos', label: 'Brand Logos' },
  { value: 'canva-templates', label: 'Canva Templates' },
  { value: 'video-assets', label: 'Video Assets' },
  { value: 'other', label: 'Other' },
]

function EmployeeProfileModal({
  employee,
  onClose,
  toast,
  onSaved,
  onDeleted,
}: {
  employee: Doc
  onClose: () => void
  toast: (m: string) => void
  onSaved: (updated: Doc) => Promise<void>
  onDeleted: () => Promise<void>
}) {
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [files, setFiles] = useState<Doc[]>([])
  const [uploading, setUploading] = useState(false)
  const [docLabel, setDocLabel] = useState('')
  const [docFolder, setDocFolder] = useState('documents')
  const [meetingOpen, setMeetingOpen] = useState(false)

  const loadFiles = useCallback(async () => {
    const data = await api(`/employee-files?where[employee][equals]=${employee.id}&limit=200&sort=-createdAt`)
    setFiles(data.docs || [])
  }, [employee.id])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const form = new FormData(e.currentTarget)
    try {
      const photoFile = form.get('photo') as File | null
      const payload: Record<string, unknown> = {
        name: form.get('name'),
        role: form.get('role'),
        department: form.get('department'),
        phone: form.get('phone'),
        active: form.get('active') === 'on',
      }
      if (photoFile && photoFile.size > 0) {
        payload.photo = Number(await uploadMedia(photoFile, form.get('name') as string))
      }
      const updated = await api(`/employees/${employee.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
      toast('Profile updated')
      await onSaved(updated.doc)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Remove ${employee.name} from the team? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await api(`/employees/${employee.id}`, { method: 'DELETE' })
      toast('Team member removed')
      await onDeleted()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to remove team member')
      setDeleting(false)
    }
  }

  async function handleDocUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const compressed = await compressImage(file)
      const form = new FormData()
      form.append('file', compressed)
      form.append(
        '_payload',
        JSON.stringify({ label: docLabel.trim() || file.name, folder: docFolder, employee: Number(employee.id) }),
      )
      const res = await fetch('/api/employee-files', { method: 'POST', credentials: 'include', body: form })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.errors?.[0]?.message || 'Upload failed — try a smaller file')
      }
      toast('Document uploaded')
      setDocLabel('')
      await loadFiles()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleDocDelete(id: string) {
    if (!confirm('Remove this document?')) return
    try {
      await api(`/employee-files/${id}`, { method: 'DELETE' })
      setFiles((prev) => prev.filter((f) => f.id !== id))
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to remove document')
    }
  }

  function copy(text: string) {
    navigator.clipboard?.writeText(text)
    toast('Copied to clipboard')
  }

  return (
    <Modal open onClose={onClose} title="Employee Profile">
      <div className="grid gap-6">
        <form onSubmit={handleSubmit} className="grid gap-4" key={employee.id}>
          <div className="flex items-center gap-4">
            <ImagePickerField name="photo" required={false} existingUrl={employee.photo?.url} />
          </div>

          <button
            type="button"
            onClick={() => setMeetingOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-mint bg-mint/5 py-2.5 font-heading text-xs font-bold uppercase text-mint hover:bg-mint hover:text-white"
          >
            Schedule Meeting with {employee.name?.split(' ')[0]}
          </button>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Employee ID">
              <input value={employee.employeeId || '—'} disabled className={`${inputClass} bg-offwhite/60 text-navy/50`} />
            </Field>
            <Field label="Login Email">
              <div className="flex gap-2">
                <input value={employee.email || ''} disabled className={`${inputClass} bg-offwhite/60 text-navy/50`} />
                <button
                  type="button"
                  onClick={() => copy(employee.email || '')}
                  className="shrink-0 rounded-md border border-navy/15 px-3 font-heading text-[10px] font-bold uppercase text-navy hover:bg-navy/5"
                >
                  Copy
                </button>
              </div>
            </Field>
          </div>

          <Field label="Name">
            <input name="name" defaultValue={employee.name} required className={inputClass} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Designation">
              <input name="role" defaultValue={employee.role} className={inputClass} />
            </Field>
            <Field label="Department">
              <input name="department" defaultValue={employee.department} className={inputClass} />
            </Field>
          </div>

          <Field label="Phone">
            <input name="phone" defaultValue={employee.phone} className={inputClass} />
          </Field>

          <label className="flex items-center gap-2 font-body text-sm font-semibold text-navy">
            <input type="checkbox" name="active" defaultChecked={employee.active} className="h-4 w-4" />
            Active — can log in and access the workspace
          </label>

          <button disabled={saving} className="rounded-md bg-mint py-3 font-heading text-xs font-bold uppercase text-white hover:bg-navy disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>

        <div className="border-t border-navy/10 pt-5">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="w-full rounded-md border border-red-200 py-3 font-heading text-xs font-bold uppercase text-red-500 hover:bg-red-50 disabled:opacity-60"
          >
            {deleting ? 'Removing…' : 'Remove Team Member'}
          </button>
        </div>

        <div className="border-t border-navy/10 pt-5">
          <h4 className="mb-3 font-heading text-sm font-extrabold text-navy">Documents</h4>

          <div className="mb-4 grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_160px_auto]">
            <input
              value={docLabel}
              onChange={(e) => setDocLabel(e.target.value)}
              placeholder="Document label (optional)"
              className={inputClass}
            />
            <select value={docFolder} onChange={(e) => setDocFolder(e.target.value)} className={inputClass}>
              {DOC_FOLDERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-mint px-4 py-2.5 font-heading text-[11px] font-bold uppercase text-white hover:bg-navy">
              {uploading ? 'Uploading…' : 'Upload'}
              <input type="file" className="hidden" onChange={handleDocUpload} disabled={uploading} />
            </label>
          </div>

          <div className="rounded-lg border border-navy/10">
            {files.length === 0 && <p className="px-4 py-6 text-center font-body text-sm text-navy/40">No documents yet.</p>}
            {files.map((f) => (
              <div key={f.id} className="flex items-center justify-between border-b border-navy/10 px-4 py-3 last:border-0">
                <div className="min-w-0">
                  <span className="block truncate font-body text-[13px] font-semibold text-navy">{f.label || f.filename}</span>
                  <span className="font-body text-[11px] text-navy/40">{DOC_FOLDERS.find((d) => d.value === f.folder)?.label || f.folder}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-navy/15 px-3 py-1.5 font-heading text-[10px] font-bold uppercase text-navy hover:bg-navy/5"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => handleDocDelete(f.id)}
                    className="rounded-md border border-red-200 px-3 py-1.5 font-heading text-[10px] font-bold uppercase text-red-500 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ScheduleMeetingModal
        open={meetingOpen}
        onClose={() => setMeetingOpen(false)}
        toast={toast}
        candidates={[{ id: String(employee.id), name: employee.name, email: employee.email }]}
        defaultSelectedIds={[String(employee.id)]}
      />
    </Modal>
  )
}

/* ============================== ATTENDANCE ============================== */

function AttendancePage({ search }: { search: string }) {
  const [records, setRecords] = useState<Doc[]>([])

  useEffect(() => {
    ;(async () => {
      const data = await api('/attendance?limit=100&sort=-day')
      setRecords(data.docs || [])
    })()
  }, [])

  const filtered = records.filter((r) => relLabel(r.employee).toLowerCase().includes(search.toLowerCase()))
  const today = new Date().toISOString().slice(0, 10)
  const todayRecords = records.filter((r) => r.day === today)

  function hours(r: Doc) {
    if (!r.checkInTime) return '—'
    const end = r.checkOutTime ? new Date(r.checkOutTime) : new Date()
    const ms = end.getTime() - new Date(r.checkInTime).getTime()
    const h = Math.floor(ms / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    return `${h}h ${m}m`
  }

  return (
    <div>
      <SectionHead title="Attendance" subtitle="Daily check-ins, hours and status." />

      <div className="mb-6 grid grid-cols-2 gap-5 md:grid-cols-4">
        <StatCard label="Present Today" value={todayRecords.filter((r) => r.status === 'present').length} />
        <StatCard label="Absent Today" value={todayRecords.filter((r) => r.status === 'absent').length} />
        <StatCard label="On Leave" value={todayRecords.filter((r) => r.status === 'leave').length} />
        <StatCard label="Half Day" value={todayRecords.filter((r) => r.status === 'half-day').length} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-navy/10 bg-white">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-navy/10 bg-offwhite/60 text-left">
              {['Employee', 'Date', 'Check In', 'Check Out', 'Hours', 'Status'].map((h) => (
                <th key={h} className="px-4 py-3 font-body text-[11px] font-extrabold uppercase tracking-wide text-navy/40">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 50).map((r) => (
              <tr key={r.id} className="border-b border-navy/10 font-body text-sm last:border-0">
                <td className="px-4 py-3.5 font-bold text-navy">{relLabel(r.employee)}</td>
                <td className="px-4 py-3.5 text-navy/70">{formatDate(r.day)}</td>
                <td className="px-4 py-3.5 text-navy/70">{r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                <td className="px-4 py-3.5 text-navy/70">{r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                <td className="px-4 py-3.5 text-navy/70">{hours(r)}</td>
                <td className="px-4 py-3.5">
                  <Badge color={r.status === 'present' ? 'green' : r.status === 'absent' ? 'red' : 'yellow'}>{r.status}</Badge>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center font-body text-sm text-navy/40">
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

/* ============================== LEAVES ============================== */

function LeavesPage({ employees, toast }: { employees: Doc[]; toast: (m: string) => void }) {
  const [leaves, setLeaves] = useState<Doc[]>([])

  const load = useCallback(async () => {
    const data = await api('/leaves?limit=200')
    setLeaves(data.docs || [])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function act(id: string, status: 'approved' | 'rejected') {
    setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
    await api(`/leaves/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
    toast(`Leave ${status}`)
  }

  const pending = leaves.filter((l) => l.status === 'pending')

  return (
    <div>
      <SectionHead title="Leave Management" subtitle="Approve or reject employee leave and WFH requests." />

      <div className="mb-6 grid grid-cols-2 gap-5 md:grid-cols-4">
        <StatCard label="Pending" value={pending.length} />
        <StatCard label="Approved" value={leaves.filter((l) => l.status === 'approved').length} />
        <StatCard label="Rejected" value={leaves.filter((l) => l.status === 'rejected').length} />
        <StatCard label="Total" value={leaves.length} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-navy/10 bg-white">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-navy/10 bg-offwhite/60 text-left">
              {['Employee', 'Type', 'From', 'To', 'Reason', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-3 font-body text-[11px] font-extrabold uppercase tracking-wide text-navy/40">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leaves.map((l) => (
              <tr key={l.id} className="border-b border-navy/10 font-body text-sm last:border-0">
                <td className="px-4 py-3.5 font-bold text-navy">{relLabel(l.employee)}</td>
                <td className="px-4 py-3.5 capitalize text-navy/70">{l.type}</td>
                <td className="px-4 py-3.5 text-navy/70">{formatDate(l.fromDate)}</td>
                <td className="px-4 py-3.5 text-navy/70">{formatDate(l.toDate)}</td>
                <td className="px-4 py-3.5 text-navy/70">{l.reason || '—'}</td>
                <td className="px-4 py-3.5">
                  {l.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button onClick={() => act(l.id, 'approved')} className="rounded-md bg-mint/10 px-3 py-1.5 font-heading text-[10px] font-bold uppercase text-mint">
                        Approve
                      </button>
                      <button onClick={() => act(l.id, 'rejected')} className="rounded-md bg-red-500/10 px-3 py-1.5 font-heading text-[10px] font-bold uppercase text-red-600">
                        Reject
                      </button>
                    </div>
                  ) : (
                    <Badge color={l.status === 'approved' ? 'green' : 'red'}>{l.status}</Badge>
                  )}
                </td>
              </tr>
            ))}
            {leaves.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center font-body text-sm text-navy/40">
                  No leave requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ============================== TASKS ============================== */

function TasksPage({
  employees,
  clients,
  search,
  toast,
}: {
  employees: Doc[]
  clients: Doc[]
  search: string
  toast: (m: string) => void
}) {
  const [tasks, setTasks] = useState<Doc[]>([])
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const data = await api('/tasks?limit=300&sort=-createdAt')
    setTasks(data.docs || [])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = tasks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const form = new FormData(e.currentTarget)
    try {
      await api('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: form.get('title'),
          employee: Number(form.get('employee')),
          client: form.get('client') ? Number(form.get('client')) : undefined,
          deadline: new Date(String(form.get('deadline'))).toISOString(),
          priority: form.get('priority'),
          description: form.get('description'),
        }),
      })
      toast('Task assigned successfully')
      setOpen(false)
      await load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to assign task')
    } finally {
      setSaving(false)
    }
  }

  const progressMap: Record<string, number> = { todo: 10, 'in-progress': 55, review: 80, completed: 100 }

  return (
    <div>
      <SectionHead
        title="Tasks & Work Progress"
        subtitle="Assign work, deadlines, priorities and monitor delivery."
        action={
          <button onClick={() => setOpen(true)} className="rounded-md bg-mint px-5 py-3 font-heading text-xs font-bold uppercase text-white hover:bg-navy">
            + Assign Task
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-5 md:grid-cols-4">
        <StatCard label="Total" value={tasks.length} />
        <StatCard label="In Progress" value={tasks.filter((t) => t.status === 'in-progress').length} />
        <StatCard label="Completed" value={tasks.filter((t) => t.status === 'completed').length} />
        <StatCard label="Overdue" value={tasks.filter((t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'completed').length} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-navy/10 bg-white">
        <table className="w-full min-w-[820px]">
          <thead>
            <tr className="border-b border-navy/10 bg-offwhite/60 text-left">
              {['Task', 'Assigned To', 'Client', 'Deadline', 'Progress', 'Status', 'Priority'].map((h) => (
                <th key={h} className="px-4 py-3 font-body text-[11px] font-extrabold uppercase tracking-wide text-navy/40">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-b border-navy/10 font-body text-sm last:border-0">
                <td className="px-4 py-3.5 font-bold text-navy">{t.title}</td>
                <td className="px-4 py-3.5 text-navy/70">{relLabel(t.employee)}</td>
                <td className="px-4 py-3.5 text-navy/70">{t.client ? relLabel(t.client) : '—'}</td>
                <td className="px-4 py-3.5 text-navy/70">{formatDate(t.deadline)}</td>
                <td className="min-w-[140px] px-4 py-3.5">
                  <Progress pct={progressMap[t.status]} />
                </td>
                <td className="px-4 py-3.5">
                  <Badge color={t.status === 'completed' ? 'green' : t.deadline && new Date(t.deadline) < new Date() ? 'red' : 'blue'}>{t.status}</Badge>
                </td>
                <td className="px-4 py-3.5">
                  <Badge color={t.priority === 'high' ? 'red' : t.priority === 'medium' ? 'yellow' : 'gray'}>{t.priority}</Badge>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center font-body text-sm text-navy/40">
                  No tasks yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Assign Task">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field label="Task">
            <input name="title" required className={inputClass} />
          </Field>
          <Field label="Assign to">
            <select name="employee" required className={inputClass}>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Client (optional)">
            <select name="client" className={inputClass}>
              <option value="">—</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Deadline">
            <input name="deadline" type="date" required className={inputClass} />
          </Field>
          <Field label="Priority">
            <select name="priority" defaultValue="medium" className={inputClass}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </Field>
          <Field label="Brief">
            <textarea name="description" rows={3} className={inputClass} />
          </Field>
          <button disabled={saving} className="mt-2 rounded-md bg-mint py-3 font-heading text-xs font-bold uppercase text-white hover:bg-navy disabled:opacity-60">
            {saving ? 'Assigning…' : 'Assign Task'}
          </button>
        </form>
      </Modal>
    </div>
  )
}

/* ============================== ACTIVITY LOGS ============================== */

function ActivityPage({ employees }: { employees: Doc[] }) {
  const rows = employees
    .map((e) => {
      const sessions: Doc[] = e.sessions || []
      const latest = sessions.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      if (!latest) return null
      const online = new Date(latest.expiresAt).getTime() > Date.now()
      return { name: e.name, login: latest.createdAt, expires: latest.expiresAt, online }
    })
    .filter(Boolean) as { name: string; login: string; expires: string; online: boolean }[]

  rows.sort((a, b) => new Date(b.login).getTime() - new Date(a.login).getTime())

  return (
    <div>
      <SectionHead title="Login Activity" subtitle="Most recent session per team member." />

      <div className="overflow-x-auto rounded-lg border border-navy/10 bg-white">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-navy/10 bg-offwhite/60 text-left">
              {['Employee', 'Last Login', 'Session Expires', 'Status'].map((h) => (
                <th key={h} className="px-4 py-3 font-body text-[11px] font-extrabold uppercase tracking-wide text-navy/40">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-navy/10 font-body text-sm last:border-0">
                <td className="px-4 py-3.5 font-bold text-navy">{r.name}</td>
                <td className="px-4 py-3.5 text-navy/70">{new Date(r.login).toLocaleString('en-IN')}</td>
                <td className="px-4 py-3.5 text-navy/70">{new Date(r.expires).toLocaleString('en-IN')}</td>
                <td className="px-4 py-3.5">
                  <Badge color={r.online ? 'green' : 'gray'}>{r.online ? 'Online' : 'Offline'}</Badge>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center font-body text-sm text-navy/40">
                  No login activity yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ============================== INSIGHTS (BLOGS) ============================== */

function FilterTabs({ options, active, onChange }: { options: string[]; active: string; onChange: (v: string) => void }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`rounded-full px-5 py-2.5 font-heading text-[11px] font-extrabold uppercase tracking-wide transition-colors ${
            active === opt ? 'bg-mint text-white' : 'text-navy hover:text-mint'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function InsightsAdminPage({ search, toast }: { search: string; toast: (m: string) => void }) {
  const [posts, setPosts] = useState<Doc[]>([])
  const [categories, setCategories] = useState<Doc[]>([])
  const [filter, setFilter] = useState('ALL')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Doc | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const [p, c] = await Promise.all([api('/posts?limit=200&sort=-publishedDate&depth=1'), api('/categories?limit=100')])
    setPosts(p.docs || [])
    setCategories(c.docs || [])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const categoryNames = categories.map((c) => c.name.toUpperCase())
  const filtered = posts.filter((p) => {
    const matchesFilter = filter === 'ALL' || relLabel(p.category).toUpperCase() === filter
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  function openCreate() {
    setEditing(null)
    setOpen(true)
  }

  function openEdit(p: Doc) {
    setEditing(p)
    setOpen(true)
  }

  async function handleDelete(p: Doc) {
    if (!confirm(`Delete "${p.title}"? This can't be undone.`)) return
    try {
      await api(`/posts/${p.id}`, { method: 'DELETE' })
      toast('Insight deleted')
      await load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to delete insight')
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const form = new FormData(e.currentTarget)
    try {
      const file = (form.get('featuredImage') as File) || null
      const title = String(form.get('title'))
      const payload: Doc = {
        title,
        slug: slugify(title),
        category: Number(form.get('category')),
        excerpt: form.get('excerpt'),
        content: lexicalFromText(String(form.get('content') || '')),
        _status: form.get('status'),
      }
      if (file && file.size > 0) {
        payload.featuredImage = Number(await uploadMedia(file, title))
      } else if (!editing) {
        throw new Error('Please choose a featured image')
      }
      if (editing) {
        await api(`/posts/${editing.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
        toast('Insight updated successfully!')
      } else {
        payload.publishedDate = new Date().toISOString()
        await api('/posts', { method: 'POST', body: JSON.stringify(payload) })
        toast('Insight published successfully!')
      }
      setOpen(false)
      await load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save insight')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <SectionHead
        title="Insights & Blog Posts"
        subtitle="Manage, write, and publish thought leadership articles for the website."
        action={
          <button onClick={openCreate} className="rounded-md bg-mint px-5 py-3 font-heading text-xs font-bold uppercase text-white hover:bg-navy">
            + Write New Insight
          </button>
        }
      />

      <FilterTabs options={['ALL', ...categoryNames]} active={filter} onChange={setFilter} />

      <div className="mb-6 grid grid-cols-2 gap-5 md:grid-cols-3">
        <StatCard label="Total Published" value={posts.filter((p) => p._status === 'published').length} />
        <StatCard label="Drafts" value={posts.filter((p) => p._status === 'draft').length} />
        <StatCard label="Total Insights" value={posts.length} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-navy/10 bg-white">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-navy/10 bg-offwhite/60 text-left">
              {['Title', 'Category', 'Author', 'Date', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-3 font-body text-[11px] font-extrabold uppercase tracking-wide text-navy/40">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-navy/10 font-body text-sm last:border-0">
                <td className="px-4 py-3.5 font-bold text-navy">{p.title}</td>
                <td className="px-4 py-3.5 uppercase text-navy/70">{relLabel(p.category)}</td>
                <td className="px-4 py-3.5 text-navy/70">{p.author}</td>
                <td className="px-4 py-3.5 text-navy/70">{formatDate(p.publishedDate)}</td>
                <td className="px-4 py-3.5">
                  <Badge color={p._status === 'published' ? 'green' : 'yellow'}>{p._status}</Badge>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="rounded-md border border-navy/15 px-3 py-1.5 font-heading text-[10px] font-bold uppercase text-navy hover:bg-navy/5"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="rounded-md border border-red-200 px-3 py-1.5 font-heading text-[10px] font-bold uppercase text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center font-body text-sm text-navy/40">
                  No insights yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Insight' : 'Write New Insight (Blog)'}>
        {categories.length === 0 ? (
          <p className="font-body text-sm text-navy/60">
            No categories exist yet — create one first in{' '}
            <a href="/cms/collections/categories/create" target="_blank" rel="noopener noreferrer" className="font-bold text-mint underline">
              CMS Admin
            </a>
            , then come back here.
          </p>
        ) : (
          <form key={editing?.id || 'new'} onSubmit={handleSubmit} className="grid gap-4">
            <Field label="Article title">
              <input name="title" required defaultValue={editing?.title} placeholder="E.g., The Future of AI in Copywriting" className={inputClass} />
            </Field>
            <Field label="Category">
              <select name="category" required defaultValue={relId(editing?.category)} className={inputClass}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={editing ? 'Featured image (leave blank to keep current)' : 'Featured image'}>
              <ImagePickerField name="featuredImage" required={!editing} existingUrl={editing?.featuredImage?.url} />
            </Field>
            <Field label="Excerpt">
              <textarea name="excerpt" rows={2} required defaultValue={editing?.excerpt} className={inputClass} />
            </Field>
            <Field label="Content body">
              <textarea
                name="content"
                rows={6}
                required
                defaultValue={editing ? lexicalToText(editing.content) : ''}
                placeholder="Write your blog post content here…"
                className={inputClass}
              />
            </Field>
            <Field label="Status">
              <select name="status" defaultValue={editing?._status || 'published'} className={inputClass}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </Field>
            <button disabled={saving} className="mt-1 rounded-md bg-mint py-3 font-heading text-xs font-bold uppercase text-white hover:bg-navy disabled:opacity-60">
              {saving ? 'Saving…' : editing ? 'Update Insight' : 'Publish Insight'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  )
}

/* ============================== CASE STUDIES (WORK) ============================== */

function CaseStudiesAdminPage({ search, toast }: { search: string; toast: (m: string) => void }) {
  const [items, setItems] = useState<Doc[]>([])
  const [filter, setFilter] = useState('ALL')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Doc | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const data = await api('/work?limit=200&sort=order')
    setItems(data.docs || [])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = items.filter((w) => {
    const matchesFilter = filter === 'ALL' || w.category.toUpperCase().includes(filter)
    const matchesSearch = w.title.toLowerCase().includes(search.toLowerCase()) || (w.client || '').toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  function openCreate() {
    setEditing(null)
    setOpen(true)
  }

  function openEdit(w: Doc) {
    setEditing(w)
    setOpen(true)
  }

  async function handleDelete(w: Doc) {
    if (!confirm(`Delete "${w.title}"? This can't be undone.`)) return
    try {
      await api(`/work/${w.id}`, { method: 'DELETE' })
      toast('Case study deleted')
      await load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to delete case study')
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const form = new FormData(e.currentTarget)
    try {
      const file = (form.get('coverImage') as File) || null
      const title = String(form.get('title'))
      const payload: Doc = {
        title,
        slug: slugify(title),
        client: form.get('client'),
        category: form.get('category'),
        description: form.get('description'),
        challenge: lexicalFromText(String(form.get('challenge') || '')),
      }
      if (file && file.size > 0) {
        payload.coverImage = Number(await uploadMedia(file, title))
      } else if (!editing) {
        throw new Error('Please choose a cover image')
      }
      if (editing) {
        await api(`/work/${editing.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
        toast('Case study updated successfully!')
      } else {
        await api('/work', { method: 'POST', body: JSON.stringify(payload) })
        toast('Case study added successfully!')
      }
      setOpen(false)
      await load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save case study')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <SectionHead
        title="Case Studies"
        subtitle="Showcase your best work, problems solved, and the impact created for clients."
        action={
          <button onClick={openCreate} className="rounded-md bg-mint px-5 py-3 font-heading text-xs font-bold uppercase text-white hover:bg-navy">
            + Add Case Study
          </button>
        }
      />

      <FilterTabs options={['ALL', ...WORK_CATEGORIES]} active={filter} onChange={setFilter} />

      <div className="mb-6 grid grid-cols-2 gap-5 md:grid-cols-3">
        <StatCard label="Live Case Studies" value={items.length} />
        <StatCard label="Featured" value={items.filter((w) => w.featured).length} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-navy/10 bg-white">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-navy/10 bg-offwhite/60 text-left">
              {['Client', 'Project Title', 'Category', 'Featured', ''].map((h) => (
                <th key={h} className="px-4 py-3 font-body text-[11px] font-extrabold uppercase tracking-wide text-navy/40">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((w) => (
              <tr key={w.id} className="border-b border-navy/10 font-body text-sm last:border-0">
                <td className="px-4 py-3.5 font-bold text-navy">{w.client || '—'}</td>
                <td className="px-4 py-3.5 text-navy/70">{w.title}</td>
                <td className="px-4 py-3.5 uppercase text-navy/70">{w.category}</td>
                <td className="px-4 py-3.5">
                  {w.featured ? <Badge color="green">Featured</Badge> : <span className="text-navy/30">—</span>}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(w)}
                      className="rounded-md border border-navy/15 px-3 py-1.5 font-heading text-[10px] font-bold uppercase text-navy hover:bg-navy/5"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(w)}
                      className="rounded-md border border-red-200 px-3 py-1.5 font-heading text-[10px] font-bold uppercase text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center font-body text-sm text-navy/40">
                  No case studies yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Case Study' : 'Add New Case Study'}>
        <form key={editing?.id || 'new'} onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Client name">
              <input name="client" required defaultValue={editing?.client} placeholder="E.g., HealthKeyz" className={inputClass} />
            </Field>
            <Field label="Project title">
              <input name="title" required defaultValue={editing?.title} placeholder="E.g., Scaling digital presence" className={inputClass} />
            </Field>
          </div>
          <Field label="Category tag">
            <select name="category" required defaultValue={editing?.category} className={inputClass}>
              {WORK_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label={editing ? 'Cover image (leave blank to keep current)' : 'Cover image'}>
            <ImagePickerField name="coverImage" required={!editing} existingUrl={editing?.coverImage?.url} />
          </Field>
          <Field label="Short description (shown on Work grid)">
            <textarea name="description" rows={2} required defaultValue={editing?.description} className={inputClass} />
          </Field>
          <Field label="The Challenge">
            <textarea
              name="challenge"
              rows={4}
              defaultValue={editing ? lexicalToText(editing.challenge) : ''}
              placeholder="Describe the problem…"
              className={inputClass}
            />
          </Field>
          <button disabled={saving} className="mt-1 rounded-md bg-mint py-3 font-heading text-xs font-bold uppercase text-white hover:bg-navy disabled:opacity-60">
            {saving ? 'Saving…' : editing ? 'Update Case Study' : 'Save Case Study'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
