import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function GET() {
  const payload = await getPayloadClient()

  const client = await payload.create({
    collection: 'clients',
    data: { name: 'Test Drive Client ' + Date.now(), status: 'onboarding', visible: false },
  })

  await new Promise((r) => setTimeout(r, 3000))

  const refetched = await payload.findByID({ collection: 'clients', id: client.id })

  await payload.delete({ collection: 'clients', id: client.id })

  return NextResponse.json({
    driveFolderId: refetched.driveFolderId,
    driveDocumentsFolderId: refetched.driveDocumentsFolderId,
    driveProjectsFolderId: refetched.driveProjectsFolderId,
  })
}
