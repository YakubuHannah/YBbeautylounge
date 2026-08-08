import { NextResponse } from 'next/server'

import { requireAdminSession } from '@/lib/auth/admin-session'
import {
  MAX_DELIVERY_FEE,
  MAX_FREE_DELIVERY_THRESHOLD,
  getDeliveryPricing,
  type DeliverySettingKey,
} from '@/lib/delivery'
import { koboFromNaira } from '@/lib/money'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const MAX_KOBO: Record<DeliverySettingKey, number> = {
  delivery_lagos_mainland: MAX_DELIVERY_FEE,
  delivery_lagos_island: MAX_DELIVERY_FEE,
  delivery_other_states: MAX_DELIVERY_FEE,
  free_delivery_threshold: MAX_FREE_DELIVERY_THRESHOLD,
}

export async function GET() {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json(await getDeliveryPricing())
}

export async function POST(req: Request) {
  let admin
  try {
    admin = await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as { key?: string; value_naira?: number }
  const key = body.key as DeliverySettingKey
  if (!key || !(key in MAX_KOBO)) {
    return NextResponse.json({ error: 'Unknown delivery setting' }, { status: 400 })
  }

  // Whole naira within range → kobo (rule 6, rule 9).
  const naira = Number(body.value_naira)
  if (!Number.isInteger(naira) || naira < 0) {
    return NextResponse.json({ error: 'Enter a whole number in naira.' }, { status: 400 })
  }
  const kobo = koboFromNaira(naira)
  if (kobo > MAX_KOBO[key]) {
    return NextResponse.json(
      { error: `That amount is too high (max ₦${Math.round(MAX_KOBO[key] / 100).toLocaleString()}).` },
      { status: 400 }
    )
  }

  const value = String(kobo)
  const before = await prisma.setting.findUnique({ where: { key } })
  await prisma.setting.upsert({
    where: { key },
    create: { key, value, value_type: 'number', updated_by: admin.adminId },
    update: { value, updated_by: admin.adminId },
  })
  await prisma.auditLog.create({
    data: {
      actor_id: admin.adminId,
      actor_type: 'admin',
      action: 'setting.update',
      entity_type: 'setting',
      entity_id: key,
      before_value: before?.value ?? undefined,
      after_value: value,
    },
  })

  return NextResponse.json(await getDeliveryPricing())
}
