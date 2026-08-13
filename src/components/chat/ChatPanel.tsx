'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Users as UsersIcon, SquarePen, Video, Paperclip, Send, X, FileText, Download, Info, UserPlus, UserMinus, Pencil, Check } from 'lucide-react'
import { api, Modal, Field, inputClass, useToast, compressImage, ScheduleMeetingModal } from '@/components/dashboard/ui'

type Doc = Record<string, any>
type Me = { id: string; collection: 'users' | 'employees'; name: string }
type Contact = { key: string; id: string; collection: 'users' | 'employees'; name: string; email?: string }

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
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [meetingOpen, setMeetingOpen] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [sending, setSending] = useState(false)
  const historyRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadDirectory = useCallback(async () => {
    const [emp, users] = await Promise.all([api('/employees?limit=200'), api('/users?limit=50')])
    const list: Contact[] = [
      ...(emp.docs || []).map((e: Doc) => ({ key: `employees:${e.id}`, id: String(e.id), collection: 'employees' as const, name: e.name, email: e.email })),
      ...(users.docs || []).map((u: Doc) => ({ key: `users:${u.id}`, id: String(u.id), collection: 'users' as const, name: u.name || u.email })),
    ].filter((c) => c.key !== meKey)
    setContacts(list)
  }, [meKey])

  const loadConversations = useCallback(async () => {
    const data = await api(`/conversations?where[memberKeys][equals]=${encodeURIComponent(meKey)}&limit=100`)
    const docs: Doc[] = data.docs || []
    docs.sort((a, b) => new Date(b.lastMessageAt || b.createdAt).getTime() - new Date(a.lastMessageAt || a.createdAt).getTime())
    setConversations(docs)
  }, [meKey])

  useEffect(() => {
    loadDirectory()
    loadConversations()
    const interval = setInterval(loadConversations, 8000)
    return () => clearInterval(interval)
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

  // Mark the opened conversation as read — merged server-side so this never
  // clobbers another member's own unread count.
  useEffect(() => {
    if (!activeId) return
    setConversations((prev) =>
      prev.map((c) => (String(c.id) === activeId ? { ...c, unreadCounts: { ...c.unreadCounts, [meKey]: 0 } } : c)),
    )
    api(`/conversations/${activeId}`, { method: 'PATCH', body: JSON.stringify({ unreadCounts: { [meKey]: 0 } }) }).catch(() => {})
  }, [activeId, meKey])

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

  async function handleAddMember(conv: Doc, key: string) {
    const memberKeys = [...(conv.memberKeys || []), key]
    const updated = await api(`/conversations/${conv.id}`, { method: 'PATCH', body: JSON.stringify({ memberKeys }) })
    setConversations((prev) => prev.map((c) => (c.id === conv.id ? updated.doc : c)))
    toast('Member added to group')
  }

  async function handleRemoveMember(conv: Doc, key: string) {
    const memberKeys = (conv.memberKeys || []).filter((k: string) => k !== key)
    if (memberKeys.length === 0) {
      toast('A group needs at least one member')
      return
    }
    const updated = await api(`/conversations/${conv.id}`, { method: 'PATCH', body: JSON.stringify({ memberKeys }) })
    setConversations((prev) => prev.map((c) => (c.id === conv.id ? updated.doc : c)))
    toast('Member removed from group')
  }

  async function handleRenameGroup(conv: Doc, title: string) {
    if (!title.trim() || title === conv.title) return
    const updated = await api(`/conversations/${conv.id}`, { method: 'PATCH', body: JSON.stringify({ title: title.trim() }) })
    setConversations((prev) => prev.map((c) => (c.id === conv.id ? updated.doc : c)))
    toast('Group renamed')
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
          {conversations.map((c) => {
            const unread = c.unreadCounts?.[meKey] || 0
            return (
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
                <span className="min-w-0 flex-1">
                  <span className={`block truncate font-body text-[13px] text-navy ${unread > 0 ? 'font-extrabold' : 'font-bold'}`}>
                    {conversationLabel(c)}
                  </span>
                  {c.lastMessagePreview && (
                    <span className={`block truncate font-body text-[11px] ${unread > 0 ? 'font-semibold text-navy/70' : 'text-navy/40'}`}>
                      {c.isGroup && c.lastMessageSenderName ? `${c.lastMessageSenderName}: ` : ''}
                      {c.lastMessagePreview}
                    </span>
                  )}
                </span>
                {unread > 0 && (
                  <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 font-heading text-[10px] font-bold text-white">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </button>
            )
          })}
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
              <div className="flex items-center gap-2">
                {activeConv.isGroup && (
                  <button
                    type="button"
                    title="Group details"
                    onClick={() => setDetailsOpen(true)}
                    className="flex items-center gap-1.5 rounded-md border border-navy/15 px-3 py-2 font-heading text-[11px] font-bold uppercase text-navy hover:bg-navy/5"
                  >
                    <Info size={13} /> Group Info
                  </button>
                )}
                {me.collection === 'users' ? (
                  <button
                    type="button"
                    onClick={() => setMeetingOpen(true)}
                    className="flex items-center gap-1.5 rounded-md bg-mint px-3 py-2 font-heading text-[11px] font-bold uppercase text-white hover:bg-navy"
                  >
                    <Video size={13} /> Start Meeting
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => window.open('https://meet.google.com/new', '_blank')}
                    className="flex items-center gap-1.5 rounded-md bg-mint px-3 py-2 font-heading text-[11px] font-bold uppercase text-white hover:bg-navy"
                  >
                    <Video size={13} /> Start Meet
                  </button>
                )}
              </div>
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

      {activeConv && me.collection === 'users' && (
        <ScheduleMeetingModal
          open={meetingOpen}
          onClose={() => setMeetingOpen(false)}
          toast={toast}
          conversationId={activeId}
          candidates={contacts
            .filter((c) => c.collection === 'employees' && (activeConv.memberKeys || []).includes(c.key))
            .map((c) => ({ id: c.id, name: c.name, email: c.email }))}
          defaultSelectedIds={contacts
            .filter((c) => c.collection === 'employees' && (activeConv.memberKeys || []).includes(c.key))
            .map((c) => c.id)}
        />
      )}

      {activeConv?.isGroup && (
        <GroupDetailsModal
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          conv={activeConv}
          messageCount={messages.length}
          contacts={contacts}
          contactName={contactName}
          onRename={(title) => handleRenameGroup(activeConv, title)}
          onAddMember={(key) => handleAddMember(activeConv, key)}
          onRemoveMember={(key) => handleRemoveMember(activeConv, key)}
        />
      )}
    </div>
  )
}

function GroupDetailsModal({
  open,
  onClose,
  conv,
  messageCount,
  contacts,
  contactName,
  onRename,
  onAddMember,
  onRemoveMember,
}: {
  open: boolean
  onClose: () => void
  conv: Doc
  messageCount: number
  contacts: Contact[]
  contactName: (key: string) => string
  onRename: (title: string) => void | Promise<void>
  onAddMember: (key: string) => void | Promise<void>
  onRemoveMember: (key: string) => void | Promise<void>
}) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(conv.title || '')
  const [addOpen, setAddOpen] = useState(false)

  useEffect(() => {
    setTitleValue(conv.title || '')
    setEditingTitle(false)
    setAddOpen(false)
  }, [conv.id, conv.title])

  const members: string[] = conv.memberKeys || []
  const addable = contacts.filter((c) => !members.includes(c.key))

  return (
    <Modal open={open} onClose={onClose} title="Group Details">
      <div className="grid gap-5">
        <div>
          <span className="font-body text-[11px] font-extrabold uppercase tracking-wide text-navy/40">Group Name</span>
          {editingTitle ? (
            <div className="mt-1 flex gap-2">
              <input value={titleValue} onChange={(e) => setTitleValue(e.target.value)} className={inputClass} autoFocus />
              <button
                type="button"
                onClick={() => {
                  onRename(titleValue)
                  setEditingTitle(false)
                }}
                className="shrink-0 rounded-md bg-mint px-3 text-white hover:bg-navy"
              >
                <Check size={16} />
              </button>
            </div>
          ) : (
            <div className="mt-1 flex items-center justify-between">
              <span className="font-heading text-base font-extrabold text-navy">{conv.title || 'Group'}</span>
              <button type="button" onClick={() => setEditingTitle(true)} className="text-navy/40 hover:text-mint">
                <Pencil size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-lg border border-navy/10 bg-offwhite/60 p-4">
          <div>
            <span className="block font-body text-[11px] font-extrabold uppercase tracking-wide text-navy/40">Created</span>
            <span className="font-body text-sm font-semibold text-navy">
              {new Date(conv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div>
            <span className="block font-body text-[11px] font-extrabold uppercase tracking-wide text-navy/40">Recent Activity</span>
            <span className="font-body text-sm font-semibold text-navy">{messageCount} messages</span>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="font-body text-[11px] font-extrabold uppercase tracking-wide text-navy/40">
              Members ({members.length})
            </span>
            <button
              type="button"
              onClick={() => setAddOpen((v) => !v)}
              className="flex items-center gap-1 font-heading text-[11px] font-bold uppercase text-mint hover:text-navy"
            >
              <UserPlus size={13} /> Add
            </button>
          </div>

          {addOpen && (
            <div className="mb-3 grid max-h-32 gap-1 overflow-y-auto rounded-md border border-navy/10 p-2">
              {addable.length === 0 && <p className="px-2 py-1 font-body text-xs text-navy/40">Everyone is already in this group.</p>}
              {addable.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => onAddMember(c.key)}
                  className="flex items-center justify-between rounded px-2 py-1.5 text-left font-body text-sm text-navy hover:bg-mint/10"
                >
                  {c.name}
                  <UserPlus size={13} className="text-mint" />
                </button>
              ))}
            </div>
          )}

          <div className="grid max-h-56 gap-1 overflow-y-auto">
            {members.map((key) => (
              <div key={key} className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-offwhite/60">
                <span className="flex items-center gap-2.5 font-body text-sm text-navy">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy font-heading text-[10px] font-bold text-white">
                    {initials(contactName(key))}
                  </span>
                  {contactName(key)}
                </span>
                <button type="button" onClick={() => onRemoveMember(key)} className="text-navy/30 hover:text-red-500" title="Remove from group">
                  <UserMinus size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
