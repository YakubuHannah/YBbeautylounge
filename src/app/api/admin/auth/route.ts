import { NextResponse } from 'next/server'
import {
  createAdminSession,
  destroyAdminSession,
  getAdminSession,
  verifyAdminCredentials,
} from '@/lib/auth/admin-session'

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string; password?: string; action?: string }

  if (body.action === 'logout') {
    await destroyAdminSession()
    return NextResponse.json({ ok: true })
  }

  if (body.action === 'me') {
    const session = await getAdminSession()
    return NextResponse.json({ session })
  }

  const email = body.email?.trim().toLowerCase()
  const password = body.password ?? ''
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  try {
    const admin = await verifyAdminCredentials(email, password)
    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    await createAdminSession(admin)
    return NextResponse.json({ ok: true, admin: { email: admin.email, name: admin.name } })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Login failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
