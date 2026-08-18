import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { createEmployeeDriveFolder, syncEmployeesFromDrive } from '@/lib/googleDrive'

export async function GET(request: Request) {
  const payload = await getPayloadClient()
  const base = new URL(request.url).origin
  const cleanup: { collection: string; id: number | string }[] = []
  const results: Record<string, unknown> = {}

  try {
    const admin = await payload.find({ collection: 'users', limit: 1 })
    const adminUser = admin.docs[0]

    // ===== Test 1: Inquiry submit -> DB -> Admin/CRM =====
    const contactRes = await fetch(`${base}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test11 Inquiry', email: 'test11@example.com', message: 'End to end test.' }),
    })
    const enquiryCheck = await payload.find({ collection: 'enquiries', where: { email: { equals: 'test11@example.com' } }, limit: 1 })
    if (enquiryCheck.docs[0]) cleanup.push({ collection: 'enquiries', id: enquiryCheck.docs[0].id })
    results.test1_InquirySubmitToDB = { httpOk: contactRes.ok, savedInDB: !!enquiryCheck.docs[0], hasTimestamp: !!enquiryCheck.docs[0]?.createdAt }

    // ===== Test 2: Employee create -> Photo upload -> Team section shows photo =====
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64',
    )
    const media = await payload.create({
      collection: 'media',
      data: { alt: 'Test photo' },
      file: { data: pngBuffer, mimetype: 'image/png', name: 'test-photo.png', size: pngBuffer.length },
    })
    cleanup.push({ collection: 'media', id: media.id })
    const emp1Email = `test11-emp-${Date.now()}@example.com`
    const emp1Password = 'testpass123'
    const emp1 = await payload.create({
      collection: 'employees',
      data: { name: 'Test11 Employee', email: emp1Email, password: emp1Password, photo: media.id },
    })
    cleanup.push({ collection: 'employees', id: emp1.id })
    const emp1Refetched = await payload.findByID({ collection: 'employees', id: emp1.id, depth: 1 })
    results.test2_EmployeePhotoInTeamSection = { photoUrl: emp1Refetched.photo?.url || 'MISSING' }

    // ===== Test 3: Group create -> Employee add -> Message send -> Notification receive =====
    const emp2 = await payload.create({
      collection: 'employees',
      data: { name: 'Test11 Employee 2', email: `test11-emp2-${Date.now()}@example.com`, password: 'testpass123' },
    })
    cleanup.push({ collection: 'employees', id: emp2.id })
    const key1 = `employees:${emp1.id}`
    const key2 = `employees:${emp2.id}`
    const group = await payload.create({
      collection: 'conversations',
      data: { isGroup: true, title: 'Test11 Group', memberKeys: [key1, key2] },
    })
    cleanup.push({ collection: 'conversations', id: group.id })
    const msg = await payload.create({
      collection: 'messages',
      data: { conversation: group.id, text: 'Hello group!' },
      overrideAccess: true,
      req: { user: { ...emp1, collection: 'employees' } } as any,
    })
    cleanup.push({ collection: 'messages', id: msg.id })
    const groupAfter = await payload.findByID({ collection: 'conversations', id: group.id })
    results.test3_GroupMessageNotification = {
      unreadCountForEmp2: groupAfter.unreadCounts?.[key2] ?? 'MISSING',
      lastMessagePreview: groupAfter.lastMessagePreview,
    }

    // ===== Test 4: Start Meeting -> link -> automatic email =====
    const meeting = await payload.create({
      collection: 'meetings',
      data: {
        title: 'Test11 Meeting',
        link: 'https://meet.google.com/test11',
        scheduledAt: new Date(Date.now() + 3600_000).toISOString(),
        attendees: [emp1.id],
      },
      overrideAccess: false,
      user: adminUser ? { ...adminUser, collection: 'users' } : undefined,
    })
    cleanup.push({ collection: 'meetings', id: meeting.id })
    await new Promise((r) => setTimeout(r, 1500))
    const meetingRefetched = await payload.findByID({ collection: 'meetings', id: meeting.id })
    results.test4_MeetingEmail = { emailResults: meetingRefetched.emailResults }

    // ===== Test 5: Website folder create -> Google Drive folder =====
    const client5 = await payload.create({
      collection: 'clients',
      data: { name: 'Test11 Client ' + Date.now(), status: 'onboarding', visible: false },
    })
    cleanup.push({ collection: 'clients', id: client5.id })
    const client5Refetched = await payload.findByID({ collection: 'clients', id: client5.id })
    results.test5_WebsiteToDrive = { driveFolderId: client5Refetched.driveFolderId || 'MISSING' }

    // ===== Test 6: Drive folder create -> Website Workspace (reverse sync) =====
    const manualFolderName = 'Test11 Manual Employee ' + Date.now()
    const emp6 = await payload.create({
      collection: 'employees',
      data: { name: manualFolderName, email: `test11-emp6-${Date.now()}@example.com`, password: 'testpass123' },
    })
    cleanup.push({ collection: 'employees', id: emp6.id })
    await payload.update({ collection: 'employees', id: emp6.id, data: { driveFolderId: null } })
    const manualFolderId = await createEmployeeDriveFolder(payload, manualFolderName)
    const syncResult = await syncEmployeesFromDrive(payload)
    const emp6Refetched = await payload.findByID({ collection: 'employees', id: emp6.id })
    results.test6_DriveToWebsiteReverseSync = {
      manualFolderCreated: !!manualFolderId,
      linkedBackToEmployee: emp6Refetched.driveFolderId === manualFolderId,
      syncResult,
    }

    // ===== Test 7: CRM -> Pitch -> Won -> Client 360 =====
    const prospect = await payload.create({
      collection: 'pitch-prospects',
      data: { company: 'Test11 Pitch Co ' + Date.now(), decisionMaker: 'Test DM', value: 30000, stage: 'in-progress' },
    })
    cleanup.push({ collection: 'pitch-prospects', id: prospect.id })
    await payload.update({ collection: 'pitch-prospects', id: prospect.id, data: { stage: 'won' } })
    const clientFromPitch = await payload.find({ collection: 'clients', where: { name: { equals: prospect.company } }, limit: 1 })
    if (clientFromPitch.docs[0]) cleanup.push({ collection: 'clients', id: clientFromPitch.docs[0].id })
    results.test7_PitchWonToClient360 = { clientCreated: !!clientFromPitch.docs[0], status: clientFromPitch.docs[0]?.status }

    // ===== Test 8: Client 360 status change -> DB save =====
    if (clientFromPitch.docs[0]) {
      await payload.update({ collection: 'clients', id: clientFromPitch.docs[0].id, data: { status: 'at-risk' } })
      const afterStatusChange = await payload.findByID({ collection: 'clients', id: clientFromPitch.docs[0].id })
      results.test8_StatusChangeSaves = { newStatus: afterStatusChange.status }
    }

    // ===== Test 9 & 10: Login -> log created; Logout -> log updated with duration =====
    const emp9Email = `test11-login-${Date.now()}@example.com`
    const emp9 = await payload.create({
      collection: 'employees',
      data: { name: 'Test11 Login Employee', email: emp9Email, password: 'testpass123' },
    })
    cleanup.push({ collection: 'employees', id: emp9.id })
    const loginRes = await fetch(`${base}/api/employees/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emp9Email, password: 'testpass123' }),
    })
    const cookie = (loginRes.headers.get('set-cookie') || '').split(';')[0]
    await new Promise((r) => setTimeout(r, 1200))
    const logAfterLogin = await payload.find({ collection: 'login-logs', where: { employee: { equals: emp9.id } }, limit: 1 })
    results.test9_LoginLogCreated = { created: !!logAfterLogin.docs[0], loginAt: logAfterLogin.docs[0]?.loginAt }

    await fetch(`${base}/api/employees/logout`, { method: 'POST', headers: { Cookie: cookie } })
    await new Promise((r) => setTimeout(r, 1200))
    const logAfterLogout = await payload.find({ collection: 'login-logs', where: { employee: { equals: emp9.id } }, limit: 1 })
    for (const l of logAfterLogout.docs) cleanup.push({ collection: 'login-logs', id: l.id })
    const durationMs = logAfterLogout.docs[0]?.logoutAt
      ? new Date(logAfterLogout.docs[0].logoutAt).getTime() - new Date(logAfterLogout.docs[0].loginAt).getTime()
      : null
    results.test10_LogoutLogWithDuration = { logoutAt: logAfterLogout.docs[0]?.logoutAt, durationMs }

    // ===== Test 11: Resume upload -> accessible =====
    const resumeDoc = await payload.create({
      collection: 'employee-files',
      data: { label: 'Test11 Resume.png', folder: 'resume', employee: emp1.id },
      file: { data: pngBuffer, mimetype: 'image/png', name: 'resume.png', size: pngBuffer.length },
    })
    cleanup.push({ collection: 'employee-files', id: resumeDoc.id })
    const unauthCheck = await fetch(`${base}${resumeDoc.url}`)
    const emp1LoginRes = await fetch(`${base}/api/employees/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emp1Email, password: emp1Password }),
    })
    const emp1LoginBody = await emp1LoginRes.json().catch(() => null)
    const emp1Cookie = (emp1LoginRes.headers.get('set-cookie') || '').split(';')[0]
    const authedCheck = emp1Cookie
      ? await fetch(`${base}${resumeDoc.url}`, { headers: { Cookie: emp1Cookie } })
      : null
    results.test11_ResumeAccessible = {
      url: resumeDoc.url,
      unauthStatus: unauthCheck.status,
      loginGotCookie: !!emp1Cookie,
      loginGotToken: !!emp1LoginBody?.token,
      authedStatus: authedCheck?.status ?? 'no-cookie',
      correctlyBlockedWhenUnauthenticated: unauthCheck.status === 401 || unauthCheck.status === 403,
      accessibleToOwningEmployee: authedCheck?.status === 200,
    }

    return NextResponse.json(results)
  } finally {
    for (const c of cleanup.reverse()) {
      await payload.delete({ collection: c.collection, id: c.id }).catch(() => {})
    }
  }
}
