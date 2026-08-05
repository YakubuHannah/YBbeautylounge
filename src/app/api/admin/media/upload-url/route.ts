import { NextResponse } from 'next/server'

import { requireAdminSession } from '@/lib/auth/admin-session'
import { createSignedMediaUpload } from '@/lib/storage'

export async function POST(req: Request) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as { filename?: string; size?: number }
  if (!body.filename) {
    return NextResponse.json({ error: 'filename required' }, { status: 400 })
  }
  if (typeof body.size !== 'number' || body.size <= 0) {
    return NextResponse.json({ error: 'size required' }, { status: 400 })
  }
  if (body.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: 'Max 50MB' }, { status: 400 })
  }

  try {
    const upload = await createSignedMediaUpload(body.filename)
    return NextResponse.json(upload)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Could not prepare upload'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
