import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/prisma'

const COOKIE = 'ybb_admin_session'
const MAX_AGE = 60 * 60 * 24 * 7

function secretKey() {
  const s = process.env.SESSION_SECRET
  if (!s || s.length < 16) {
    throw new Error('SESSION_SECRET must be set (min 16 chars)')
  }
  return new TextEncoder().encode(s)
}

export type AdminSession = {
  adminId: string
  email: string
  name: string
  role: string
}

export async function createAdminSession(admin: AdminSession) {
  const token = await new SignJWT({
    adminId: admin.adminId,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey())

  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export async function destroyAdminSession() {
  cookies().set(COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const token = cookies().get(COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secretKey())
    if (!payload.adminId || typeof payload.adminId !== 'string') return null
    return {
      adminId: payload.adminId,
      email: String(payload.email ?? ''),
      name: String(payload.name ?? ''),
      role: String(payload.role ?? 'admin'),
    }
  } catch {
    return null
  }
}

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession()
  if (!session) throw new Error('UNAUTHORIZED')
  return session
}

export async function verifyAdminCredentials(email: string, password: string) {
  const admin = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } })
  if (!admin || !admin.is_active) return null
  const ok = await bcrypt.compare(password, admin.password_hash)
  if (!ok) return null
  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { last_login_at: new Date() },
  })
  return {
    adminId: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  } satisfies AdminSession
}
