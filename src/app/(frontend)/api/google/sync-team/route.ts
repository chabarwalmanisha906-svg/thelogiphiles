import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { syncEmployeesFromDrive } from '@/lib/googleDrive'

export async function POST(request: Request) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })

  if (!user || user.collection !== 'users') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }

  try {
    const result = await syncEmployeesFromDrive(payload)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Sync failed' },
      { status: 500 },
    )
  }
}
