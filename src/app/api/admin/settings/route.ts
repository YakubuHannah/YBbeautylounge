import { NextResponse } from 'next/server'

import { requireAdminSession } from '@/lib/auth/admin-session'
import { prisma } from '@/lib/prisma'
import { SETTING_DEFAULTS } from '@/lib/settings'

export const dynamic = 'force-dynamic'

const VALIDATORS: Record<string, (value: string) => string | null> = {
  whatsapp_number: (value) => {
    const digits = value.replace(/\D/g, '')
    if (!/^234\d{10}$/.test(digits)) {
      return 'Enter a Nigerian number in international format, e.g. 234 903 784 4700.'
    }
    return null
  },
}

export async function GET() {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await prisma.setting.findMany({
    where: { key: { in: Object.keys(SETTING_DEFAULTS) } },
  })
  const settings = Object.fromEntries(
    Object.keys(SETTING_DEFAULTS).map((key) => {
      const row = rows.find((r) => r.key === key)
      const value =
        row && typeof row.value === 'string' && row.value ? row.value : SETTING_DEFAULTS[key]
      return [key, value]
    })
  )
  return NextResponse.json({ settings })
}

export async function PATCH(req: Request) {
  let admin
  try {
    admin = await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as { key?: string; value?: string }
  if (!body.key || !(body.key in SETTING_DEFAULTS)) {
    return NextResponse.json({ error: 'Unknown setting' }, { status: 400 })
  }
  const raw = String(body.value ?? '')
  const validationError = VALIDATORS[body.key]?.(raw)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }
  const value = body.key === 'whatsapp_number' ? raw.replace(/\D/g, '') : raw.trim()

  const before = await prisma.setting.findUnique({ where: { key: body.key } })
  const setting = await prisma.setting.upsert({
    where: { key: body.key },
    create: { key: body.key, value, value_type: 'string', updated_by: admin.adminId },
    update: { value, updated_by: admin.adminId },
  })
  await prisma.auditLog.create({
    data: {
      actor_id: admin.adminId,
      actor_type: 'admin',
      action: 'setting.update',
      entity_type: 'setting',
      entity_id: body.key,
      before_value: before?.value ?? undefined,
      after_value: value,
    },
  })

  return NextResponse.json({ setting: { key: setting.key, value } })
}
