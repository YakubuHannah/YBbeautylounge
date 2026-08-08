import { NextResponse } from 'next/server'

import { requireAdminSession } from '@/lib/auth/admin-session'
import { getSettingValue } from '@/lib/settings'
import { notifyFounder } from '@/lib/notify'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const to = (await getSettingValue('notification_email')).trim().toLowerCase()
  const result = await notifyFounder(
    'Test — YBBeautylounge order alerts',
    'This is a test from your Settings page. If you can read this, new-order alerts will arrive at this address.'
  )

  if (result.ok) {
    return NextResponse.json({ ok: true, to })
  }
  return NextResponse.json({ ok: false, to, error: result.reason }, { status: 400 })
}
