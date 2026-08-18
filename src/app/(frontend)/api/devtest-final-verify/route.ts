import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function GET() {
  const payload = await getPayloadClient()
  const cleanup: { collection: string; id: number | string }[] = []

  try {
    // 1. Data persistence: create + immediately re-fetch (simulates refresh)
    const client = await payload.create({
      collection: 'clients',
      data: { name: 'Final Verify Client ' + Date.now(), status: 'onboarding', visible: false },
    })
    cleanup.push({ collection: 'clients', id: client.id })
    const refetched = await payload.findByID({ collection: 'clients', id: client.id })

    return NextResponse.json({
      dataSurvivesRefetch: refetched.name === client.name,
      driveWorking: !!refetched.driveFolderId,
      driveFolderId: refetched.driveFolderId,
    })
  } finally {
    for (const c of cleanup.reverse()) {
      await payload.delete({ collection: c.collection, id: c.id }).catch(() => {})
    }
  }
}
