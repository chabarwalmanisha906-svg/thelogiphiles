'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Users as UsersIcon, SquarePen, Video, Paperclip, Send, X, FileText, Download } from 'lucide-react'
import { api, Modal, Field, inputClass, useToast, compressImage } from '@/components/dashboard/ui'

type Doc = Record<string, any>
type Me = { id: string; collection: 'users' | 'employees'; name: string }
type Contact = { key: string; id: string; collection: 'users' | 'employees'; name: string }

function initials(name?: string) {
  if (!name) return '?'
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')
}

export function ChatPanel({ me }: { me: Me }) {
  const toast = useToast()
  const meKey = `${me.collection}:${me.id}`
  const [contacts, setContacts] = useState<Contact[]>([])
  const [conversations, setConversations] = useState<Doc[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [messages, setMessages] = useState<Doc[]>([])
  const [text, setText] = useState('')
  const [groupOpen, setGroupOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [sending, setSending] = useState(false)
  const historyRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadDirectory = useCallback(async () => {
    const [emp, users] = await Promise.all([api('/employees?limit=200'), api('/users?limit=50')])
    const list: Contact[] = [
      ...(emp.docs || []).map((e: Doc) => ({ key: `employees:${e.id}`, id: String(e.id), collection: 'employees' as const, name: e.name })),
      ...(users.docs || []).map((u: Doc) => ({ key: `users:${u.id}`, id: String(u.id), collection: 'users' as const, name: u.name || u.email })),
    ].filter((c) => c.key !== meKey)
    setContacts(list)
  }, [meKey])

  const loadConversations = useCallback(async () => {
    const data = await api(`/conversations?where[memberKeys][equals]=${encodeURIComponent(meKey)}&limit=100&sort=-createdAt`)
    setConversations(data.docs || [])
  }, [meKey])

  useEffect(() => {
    loadDirectory()
    loadConversations()
  }, [loadDirectory, loadConversations])

  const loadMessages = useCallback(async (conversationId: string) => {
    const data = await api(`/messages?where[conversation][equals]=${conversationId}&sort=createdAt&limit=200`)
    setMessages(data.docs || [])
  }, [])

  useEffect(() => {
    if (!activeId) return
    loadMessages(activeId)
    const interval = setInterval(() => loadMessages(activeId), 5000)
    return () => clearInterval(interval)
  }, [activeId, loadMessages])

  useEffect(() => {
    if (historyRef.current) historyRef.current.scrollTop = historyRef.current.scrollHeight
  }, [messages])

  function contactName(key: string) {
    if (key === meKey) return me.name
    return contacts.find((c) => c.key === key)?.name || 'Unknown'
  }

  function conversationLabel(conv: Doc) {
    if (conv.isGroup) return conv.title || 'Group'
    const other = (conv.memberKeys || []).find((k: string) => k !== meKey)
    return other ? contactName(other) : conv.title || 'Conversation'
  }

  async function openContact(contact: Contact) {
    setPickerOpen(false)
    // Always re-check against the server (not local state, which may still be loading)
    // to avoid creating duplicate conversations on a fast double-click.
    const fresh = await api(`/conversations?where[memberKeys][equals]=${encodeURIComponent(meKey)}&limit=100&sort=-createdAt`)
    const freshList: Doc[] = fresh.docs || []
    const existing = freshList.find(
      (c) => !c.isGroup && (c.memberKeys || []).length === 2 && (c.memberKeys || []).includes(contact.key),
    )
    let target: Doc
    if (existing) {
      target = existing
    } else {
      const created = await api('/conversations', {
        method: 'POST',
        body: JSON.stringify({ isGroup: false, memberKeys: [meKey, contact.key] }),
      })
      target = created.doc
      freshList.unshift(target)
    }
    setConversations(freshList)
    setActiveId(String(target.id))
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if ((!text.trim() && !pendingFile) || !activeId) return
    const body = text
    const file = pendingFile
    setText('')
    setPendingFile(null)
    setSending(true)
    try {
      let attachmentId: number | undefined
      if (file) {
        const compressed = await compressImage(file)
        const form = new FormData()
        form.append('file', compressed)
        form.append('_payload', JSON.stringify({}))
        const res = await fetch('/api/chat-attachments', { method: 'POST', credentials: 'include', body: form })
        if (!res.ok) {
          const data = await res.json().catch(() => null)
          throw new Error(data?.errors?.[0]?.message || 'File upload failed — try a smaller file')
        }
        const data = await res.json()
        attachmentId = data.doc.id
      }
      await api('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversation: Number(activeId),
          text: body || undefined,
          attachment: attachmentId,
        }),
      })
      await loadMessages(activeId)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPendingFile(file)
    e.target.value = ''
  }

  async function handleCreateGroup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const title = String(form.get('title') || '')
    const selected = contacts.filter((c) => form.get(`member_${c.key}`))
    if (!title || selected.length === 0) return
    const created = await api('/conversations', {
      method: 'POST',
      body: JSON.stringify({ isGroup: true, title, memberKeys: [meKey, ...selected.map((c) => c.key)] }),
    })
    toast('Group created successfully!')
    setGroupOpen(false)
    setConversations((prev) => [created.doc, ...prev])
    setActiveId(String(created.doc.id))
  }

  const activeConv = conversations.find((c) => String(c.id) === activeId)

  return (
    <div className="flex h-[calc(100vh-220px)] overflow-hidden rounded-lg border border-navy/10 bg-white shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
      <div className="flex w-[270px] shrink-0 flex-col border-r border-navy/10 bg-offwhite/60">
        <div className="flex items-center justify-between border-b border-navy/10 px-5 py-4">
          <span className="font-heading text-sm font-extrabold text-navy">Recent Chats</span>
          <div className="flex items-center gap-3 text-navy/40">
            <button type="button" title="Create group" onClick={() => setGroupOpen(true)} className="hover:text-mint">
              <UsersIcon size={16} />
            </button>
            <button type="button" title="New message" onClick={() => setPickerOpen(true)} className="hover:text-mint">
              <SquarePen size={16} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveId(String(c.id))}
              className={`flex w-full items-center gap-3 border-b border-navy/10 px-5 py-3.5 text-left transition-colors ${
                String(c.id) === activeId ? 'border-l-[3px] border-l-mint bg-mint/10' : 'hover:bg-navy/5'
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy font-heading text-[11px] font-bold text-white">
                {c.isGroup ? <UsersIcon size={14} /> : initials(conversationLabel(c))}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-body text-[13px] font-bold text-navy">{conversationLabel(c)}</span>
              </span>
            </button>
          ))}
          {conversations.length === 0 && (
            <p className="px-5 py-6 font-body text-xs text-navy/40">No conversations yet. Start one with the pencil icon.</p>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        {activeConv ? (
          <>
            <div className="flex items-center justify-between border-b border-navy/10 px-5 py-4">
              <span className="flex items-center gap-2 font-heading text-[15px] font-extrabold text-navy">
                <span className="h-2.5 w-2.5 rounded-full bg-mint" /> {conversationLabel(activeConv)}
              </span>
              <button
                type="button"
                onClick={() => window.open('https://meet.google.com/new', '_blank')}
                className="flex items-center gap-1.5 rounded-md bg-mint px-3 py-2 font-heading text-[11px] font-bold uppercase text-white hover:bg-navy"
              >
                <Video size={13} /> Start Meet
              </button>
            </div>

            <div ref={historyRef} className="flex flex-1 flex-col gap-3 overflow-y-auto bg-offwhite/40 p-5">
              {messages.map((m) => {
                const mine = m.sender?.relationTo === me.collection && String(m.sender?.value?.id) === String(me.id)
                const attachment = m.attachment && typeof m.attachment === 'object' ? m.attachment : null
                const isImage = attachment?.mimeType?.startsWith('image/')
                return (
                  <div
                    key={m.id}
                    className={`max-w-[65%] rounded-lg px-4 py-2.5 font-body text-[13px] leading-relaxed shadow-sm ${
                      mine ? 'self-end rounded-br-none bg-mint text-white' : 'self-start rounded-bl-none border border-navy/10 bg-white text-navy'
                    }`}
                  >
                    {attachment && isImage && (
                      <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="mb-2 block">
                        <img src={attachment.url} alt={attachment.filename} className="max-h-52 w-full rounded-md object-cover" />
                      </a>
                    )}
                    {attachment && !isImage && (
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mb-2 flex items-center gap-2.5 rounded-md border px-3 py-2.5 ${
                          mine ? 'border-white/30 bg-white/10' : 'border-navy/10 bg-offwhite'
                        }`}
                      >
                        <FileText size={18} className="shrink-0" />
                        <span className="min-w-0 flex-1 truncate font-semibold">{attachment.filename}</span>
                        <Download size={14} className="shrink-0" />
                      </a>
                    )}
                    {m.text}
                    <span className={`mt-1 block text-[9px] ${mine ? 'text-white/70' : 'text-navy/40'}`}>
                      {new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )
              })}
              {messages.length === 0 && <p className="text-center font-body text-xs text-navy/40">Say hello 👋</p>}
            </div>

            {pendingFile && (
              <div className="flex items-center gap-2.5 border-t border-navy/10 bg-offwhite/60 px-5 py-2.5">
                <FileText size={15} className="shrink-0 text-navy/50" />
                <span className="min-w-0 flex-1 truncate font-body text-xs font-semibold text-navy">{pendingFile.name}</span>
                <button type="button" onClick={() => setPendingFile(null)} className="text-navy/40 hover:text-red-600">
                  <X size={15} />
                </button>
              </div>
            )}

            <form onSubmit={handleSend} className="flex items-center gap-3 border-t border-navy/10 px-5 py-4">
              <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 text-navy/30 hover:text-mint"
                title="Attach a file"
              >
                <Paperclip size={18} />
              </button>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`Type a message to ${conversationLabel(activeConv)}...`}
                className="flex-1 rounded-full border border-navy/15 bg-offwhite px-4 py-3 font-body text-sm text-navy focus:border-mint focus:outline-none"
              />
              <button
                type="submit"
                disabled={sending}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy text-white hover:bg-mint disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="font-body text-sm text-navy/40">Select a conversation or start a new one.</p>
          </div>
        )}
      </div>

      <Modal open={pickerOpen} onClose={() => setPickerOpen(false)} title="New Message">
        <div className="grid max-h-80 gap-1 overflow-y-auto">
          {contacts.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => openContact(c)}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left font-body text-sm text-navy hover:bg-mint/10"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy font-heading text-[10px] font-bold text-white">
                {initials(c.name)}
              </span>
              {c.name}
              <span className="ml-auto font-body text-[10px] uppercase text-navy/30">{c.collection === 'users' ? 'admin' : 'staff'}</span>
            </button>
          ))}
        </div>
      </Modal>

      <Modal open={groupOpen} onClose={() => setGroupOpen(false)} title="Create New Group">
        <form onSubmit={handleCreateGroup} className="grid gap-4">
          <Field label="Group name">
            <input name="title" required placeholder="e.g. Design Team" className={inputClass} />
          </Field>
          <Field label="Select members">
            <div className="grid max-h-52 gap-1.5 overflow-y-auto rounded-md border border-navy/10 p-2">
              {contacts.map((c) => (
                <label key={c.key} className="flex items-center gap-2.5 rounded px-2 py-1.5 font-body text-sm text-navy hover:bg-offwhite">
                  <input type="checkbox" name={`member_${c.key}`} className="h-4 w-4 accent-mint" />
                  {c.name}
                </label>
              ))}
            </div>
          </Field>
          <button className="mt-1 rounded-md bg-mint py-3 font-heading text-xs font-bold uppercase text-white hover:bg-navy">
            Create Group Chat
          </button>
        </form>
      </Modal>
    </div>
  )
}
