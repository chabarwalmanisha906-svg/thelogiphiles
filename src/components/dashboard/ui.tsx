'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { UploadCloud } from 'lucide-react'

export async function api(path: string, options?: RequestInit) {
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.errors?.[0]?.message || `Request failed (${res.status})`)
  }
  return res.json()
}

// Vercel's serverless functions reject request bodies over ~4.5MB, which real
// phone photos routinely exceed. Downscale/re-encode images client-side before
// upload so they reliably fit, instead of failing with an opaque server error.
export async function compressImage(file: File, maxDimension = 1600, quality = 0.82): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file
  }
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, width, height)
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (!blob || blob.size >= file.size) return file
    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], newName, { type: 'image/jpeg' })
  } catch {
    return file
  }
}

export function formatINR(n?: number | null) {
  if (!n) return '₹0'
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
  return `₹${n}`
}

export function relId(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'object' && 'id' in (v as Record<string, unknown>)) {
    return String((v as { id: unknown }).id)
  }
  return String(v)
}

export function relLabel(v: unknown, field = 'name'): string {
  if (v == null) return '—'
  if (typeof v === 'object') {
    const obj = v as Record<string, unknown>
    return (obj[field] as string) || (obj.email as string) || '—'
  }
  return String(v)
}

type ToastContextValue = (message: string) => void
const ToastContext = createContext<ToastContextValue>(() => {})
export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const [show, setShow] = useState(false)

  const toast = useCallback((msg: string) => {
    setMessage(msg)
    setShow(true)
    setTimeout(() => setShow(false), 2800)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className={`fixed bottom-8 right-8 z-[200] rounded-lg bg-navy px-6 py-4 font-body text-sm font-semibold text-white shadow-2xl transition-all duration-300 ${
          show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
        }`}
      >
        {message}
      </div>
    </ToastContext.Provider>
  )
}

// Polls unread message counts (denormalized on each Conversation) so a nav
// badge + toast can surface new messages even when the Messages tab isn't
// open — a notification only visible inside an already-open chat panel
// doesn't count as one.
export function useUnreadMessages(meKey: string | null) {
  const toast = useToast()
  const [unreadTotal, setUnreadTotal] = useState(0)
  // Starts at 0 (not the current total) so that any unread messages already
  // waiting the moment the app loads/logs in still get announced once —
  // otherwise a login right after someone messages you shows the badge but
  // silently skips the popup, which reads as "no notification at all".
  const prevTotalRef = useRef(0)

  useEffect(() => {
    if (!meKey) return
    let cancelled = false

    async function poll() {
      try {
        const data = await api(`/conversations?where[memberKeys][equals]=${encodeURIComponent(meKey!)}&limit=100`)
        if (cancelled) return
        const convos: Record<string, any>[] = data.docs || []
        const total = convos.reduce((sum, c) => sum + (c.unreadCounts?.[meKey!] || 0), 0)

        if (total > prevTotalRef.current) {
          const withNew = convos.find((c) => (c.unreadCounts?.[meKey!] || 0) > 0)
          if (withNew) {
            const who = withNew.lastMessageSenderName || 'Someone'
            const where = withNew.isGroup ? ` in ${withNew.title || 'a group'}` : ''
            const preview = withNew.lastMessagePreview ? `: ${withNew.lastMessagePreview}` : ''
            toast(`New message from ${who}${where}${preview}`)
          } else {
            toast('You have a new message')
          }
        }
        prevTotalRef.current = total
        setUnreadTotal(total)
      } catch {
        // transient poll failure — try again next tick
      }
    }

    poll()
    const interval = setInterval(poll, 10000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [meKey, toast])

  return unreadTotal
}

export function StatCard({
  label,
  value,
  trend,
}: {
  label: string
  value: ReactNode
  trend?: string
}) {
  return (
    <div className="rounded-lg border border-navy/10 bg-white p-5 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
      <p className="font-body text-[11px] font-bold uppercase tracking-wide text-navy/40">{label}</p>
      <p className="my-2 font-heading text-2xl font-black text-navy">{value}</p>
      {trend && <span className="font-body text-[11px] font-semibold text-mint">{trend}</span>}
    </div>
  )
}

const BADGE_COLORS: Record<string, string> = {
  green: 'bg-mint/10 text-mint',
  red: 'bg-red-500/10 text-red-600',
  yellow: 'bg-amber-500/10 text-amber-600',
  blue: 'bg-blue-500/10 text-blue-700',
  gray: 'bg-navy/10 text-navy/60',
}

export function Badge({ color = 'gray', children }: { color?: keyof typeof BADGE_COLORS; children: ReactNode }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 font-heading text-[10px] font-extrabold uppercase tracking-wide ${BADGE_COLORS[color]}`}
    >
      {children}
    </span>
  )
}

export function Card({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-navy/10 bg-white p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] ${className}`}>
      {title && <h3 className="mb-5 font-heading text-base font-extrabold text-navy">{title}</h3>}
      {children}
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/60 p-5 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-8 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-heading text-lg font-extrabold text-navy">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="font-heading text-2xl leading-none text-navy/40 hover:text-navy"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-body text-[11px] font-bold uppercase tracking-wide text-navy/50">
        {label}
      </span>
      {children}
    </label>
  )
}

export const inputClass =
  'w-full rounded-md border border-navy/15 bg-offwhite px-3.5 py-2.5 font-body text-sm text-navy focus:border-mint focus:outline-none'

export function Progress({ pct }: { pct: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-navy/10">
      <div className="h-full rounded-full bg-mint" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  )
}

export function SectionHead({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-heading text-[28px] font-black tracking-tight text-navy">{title}</h1>
        {subtitle && <p className="mt-1.5 font-body text-sm text-navy/50">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// Plain <input type="file"> gives no feedback once a file is chosen — the box
// looks identical before and after, so a real selection can look like nothing
// happened. This shows a thumbnail + filename once something is picked.
export function ImagePickerField({
  name,
  required = true,
  existingUrl,
}: {
  name: string
  required?: boolean
  existingUrl?: string | null
}) {
  const [preview, setPreview] = useState<string | null>(existingUrl || null)
  const [fileName, setFileName] = useState<string | null>(existingUrl ? 'Current image' : null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) {
      setPreview(existingUrl || null)
      setFileName(existingUrl ? 'Current image' : null)
      return
    }
    setFileName(file.name)
    setPreview(URL.createObjectURL(file))
  }

  return (
    <label className="flex cursor-pointer flex-col items-center gap-2 overflow-hidden rounded-md border-2 border-dashed border-navy/15 bg-offwhite/60 p-6 text-center hover:border-mint">
      {preview ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="max-h-32 rounded-md object-contain" />
          <span className="max-w-full truncate font-body text-[12px] font-semibold text-navy">{fileName}</span>
          <span className="font-body text-[11px] font-bold uppercase tracking-wide text-mint">Click to change</span>
        </>
      ) : (
        <>
          <UploadCloud size={24} className="text-mint" />
          <span className="font-body text-[13px] font-bold text-navy">Click to upload image</span>
          <span className="font-body text-[11px] text-navy/40">JPG, PNG, WEBP</span>
        </>
      )}
      <input type="file" name={name} accept="image/*" required={required} className="hidden" onChange={handleChange} />
    </label>
  )
}
