import type { Payload } from 'payload'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const DRIVE_API = 'https://www.googleapis.com/drive/v3/files'

function redirectUri() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return `${base}/api/google/callback`
}

export function getGoogleAuthUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    redirect_uri: redirectUri(),
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope: 'https://www.googleapis.com/auth/drive.file',
    state,
  })
  return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

export async function exchangeCodeForTokens(code: string) {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirect_uri: redirectUri(),
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error_description || 'Failed to exchange Google auth code')
  }
  return res.json() as Promise<{ access_token: string; refresh_token?: string; expires_in: number }>
}

async function getAccessToken(payload: Payload): Promise<string | null> {
  const settings = await payload.findGlobal({ slug: 'google-integration' })
  if (!settings?.refreshToken) return null

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      refresh_token: settings.refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.access_token as string
}

async function createFolder(name: string, parentId: string | null, accessToken: string): Promise<string> {
  const res = await fetch(DRIVE_API, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined,
    }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error?.message || `Failed to create Drive folder "${name}"`)
  }
  const data = await res.json()
  return data.id as string
}

async function ensureWorkspaceRoot(payload: Payload, accessToken: string): Promise<string> {
  const settings = await payload.findGlobal({ slug: 'google-integration' })
  if (settings?.workspaceRootFolderId) return settings.workspaceRootFolderId

  const rootId = await createFolder('Workspace', null, accessToken)
  await payload.updateGlobal({ slug: 'google-integration', data: { workspaceRootFolderId: rootId } })
  return rootId
}

async function ensureTeamRoot(payload: Payload, accessToken: string): Promise<string> {
  const settings = await payload.findGlobal({ slug: 'google-integration' })
  if (settings?.teamRootFolderId) return settings.teamRootFolderId

  const workspaceRootId = await ensureWorkspaceRoot(payload, accessToken)
  const teamRootId = await findOrCreateChildFolder('Team', workspaceRootId, accessToken)
  await payload.updateGlobal({ slug: 'google-integration', data: { teamRootFolderId: teamRootId } })
  return teamRootId
}

// Creates <Workspace>/Team/<Employee Name>, returning the folder ID. Same
// best-effort contract as createClientDriveFolders: null when Drive isn't
// connected rather than throwing, so it never blocks creating the employee.
export async function createEmployeeDriveFolder(payload: Payload, employeeName: string): Promise<string | null> {
  const accessToken = await getAccessToken(payload)
  if (!accessToken) return null

  const teamRootId = await ensureTeamRoot(payload, accessToken)
  return findOrCreateChildFolder(employeeName, teamRootId, accessToken)
}

// Creates <Workspace>/<Client Name>/Documents and /Projects, returning the three folder IDs.
// Returns null (rather than throwing) when Drive isn't connected, so callers can treat this
// as an optional enhancement instead of a hard requirement for creating a client.
export async function createClientDriveFolders(
  payload: Payload,
  clientName: string,
): Promise<{ folderId: string; documentsFolderId: string; projectsFolderId: string } | null> {
  const accessToken = await getAccessToken(payload)
  if (!accessToken) return null

  const rootId = await ensureWorkspaceRoot(payload, accessToken)
  const folderId = await createFolder(clientName, rootId, accessToken)
  const [documentsFolderId, projectsFolderId] = await Promise.all([
    createFolder('Documents', folderId, accessToken),
    createFolder('Projects', folderId, accessToken),
  ])

  return { folderId, documentsFolderId, projectsFolderId }
}

export async function isGoogleDriveConnected(payload: Payload): Promise<boolean> {
  const settings = await payload.findGlobal({ slug: 'google-integration' })
  return !!settings?.connected && !!settings?.refreshToken
}

async function listChildFolders(parentId: string, accessToken: string): Promise<{ id: string; name: string }[]> {
  const q = encodeURIComponent(
    `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
  )
  const res = await fetch(`${DRIVE_API}?q=${q}&fields=files(id,name)&pageSize=1000`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error?.message || 'Failed to list Drive folders')
  }
  const data = await res.json()
  return data.files || []
}

async function findOrCreateChildFolder(name: string, parentId: string, accessToken: string): Promise<string> {
  const children = await listChildFolders(parentId, accessToken)
  const existing = children.find((c) => c.name === name)
  if (existing) return existing.id
  return createFolder(name, parentId, accessToken)
}

// Reverse sync: finds folders under the Workspace root in Drive that don't yet have a
// matching Client record (e.g. someone made a folder by hand directly in Drive), and
// creates the corresponding client so the Workspace stays a mirror of Drive both ways.
// Manual/on-demand rather than a background job — Vercel's Hobby plan only allows
// once-a-day Cron Jobs, and Drive's push-notification webhooks need a renewed watch
// channel every <=7 days plus separate Search Console domain verification, which is a
// lot of fragile infrastructure for a small team's folder list. A refresh button that
// runs this on click is simpler and just as effective for this scale.
export async function syncClientsFromDrive(payload: Payload): Promise<{ created: string[] }> {
  const accessToken = await getAccessToken(payload)
  if (!accessToken) throw new Error('Google Drive is not connected')

  const rootId = await ensureWorkspaceRoot(payload, accessToken)
  const driveFolders = await listChildFolders(rootId, accessToken)

  const existing = await payload.find({
    collection: 'clients',
    where: { driveFolderId: { exists: true } },
    limit: 1000,
    depth: 0,
  })
  const knownFolderIds = new Set(existing.docs.map((c) => c.driveFolderId))

  const created: string[] = []
  for (const folder of driveFolders) {
    if (knownFolderIds.has(folder.id)) continue

    const [documentsFolderId, projectsFolderId] = await Promise.all([
      findOrCreateChildFolder('Documents', folder.id, accessToken),
      findOrCreateChildFolder('Projects', folder.id, accessToken),
    ])

    await payload.create({
      collection: 'clients',
      data: {
        name: folder.name,
        status: 'onboarding',
        visible: false,
        driveFolderId: folder.id,
        driveDocumentsFolderId: documentsFolderId,
        driveProjectsFolderId: projectsFolderId,
      },
    })
    created.push(folder.name)
  }

  return { created }
}

// Reverse sync for Team folders: links a Drive folder under Workspace/Team to an
// EXISTING employee whose name matches exactly. Unlike clients, employees can't be
// auto-created from a folder name alone — they're login accounts and need an email
// and password, which a folder has no way of supplying — so an unmatched folder is
// left alone and reported back rather than silently ignored.
export async function syncEmployeesFromDrive(payload: Payload): Promise<{ linked: string[]; unmatched: string[] }> {
  const accessToken = await getAccessToken(payload)
  if (!accessToken) throw new Error('Google Drive is not connected')

  const teamRootId = await ensureTeamRoot(payload, accessToken)
  const driveFolders = await listChildFolders(teamRootId, accessToken)

  const employees = await payload.find({ collection: 'employees', limit: 1000, depth: 0 })

  const linked: string[] = []
  const unmatched: string[] = []

  for (const folder of driveFolders) {
    const alreadyLinked = employees.docs.some((e) => e.driveFolderId === folder.id)
    if (alreadyLinked) continue

    const match = employees.docs.find((e) => e.name === folder.name && !e.driveFolderId)
    if (match) {
      await payload.update({ collection: 'employees', id: match.id, data: { driveFolderId: folder.id } })
      linked.push(folder.name)
    } else {
      unmatched.push(folder.name)
    }
  }

  return { linked, unmatched }
}
