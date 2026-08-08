import { NextResponse } from 'next/server'

import { requireAdminSession } from '@/lib/auth/admin-session'
import {
  MAX_DELIVERY_FEE,
  MAX_FREE_DELIVERY_THRESHOLD,
  getDeliveryZones,
  getFreeDeliveryThreshold,
} from '@/lib/delivery'
import { koboFromNaira } from '@/lib/money'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function currentState() {
  const [zones, free_delivery_threshold] = await Promise.all([
    getDeliveryZones(),
    getFreeDeliveryThreshold(),
  ])
  return { zones, free_delivery_threshold }
}

// A whole naira amount within [0, maxKobo]. Money is kept in kobo (rule 6) and
// every money-affecting change is range-checked server-side (rule 9).
function koboFromNairaInput(value: unknown, maxKobo: number): number | null {
  const naira = Number(value)
  if (!Number.isInteger(naira) || naira < 0) return null
  const kobo = koboFromNaira(naira)
  return kobo > maxKobo ? null : kobo
}

function cleanName(value: unknown): string {
  return String(value ?? '').trim()
}

export async function GET() {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json(await currentState())
}

export async function POST(req: Request) {
  let admin
  try {
    admin = await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as {
    action?: string
    id?: string
    name?: string
    fee_naira?: number
    estimated_days?: string
    threshold_naira?: number
  }

  switch (body.action) {
    case 'create_zone': {
      const name = cleanName(body.name)
      const fee = koboFromNairaInput(body.fee_naira, MAX_DELIVERY_FEE)
      if (!name || name.length > 60) {
        return NextResponse.json({ error: 'Enter a location name (under 60 characters).' }, { status: 400 })
      }
      if (fee === null) {
        return NextResponse.json({ error: 'Enter a delivery price in whole naira up to ₦100,000.' }, { status: 400 })
      }
      const estimated_days = String(body.estimated_days ?? '').trim().slice(0, 30)
      const zone = await prisma.deliveryZone.create({ data: { name, fee, estimated_days, states: [] } })
      await prisma.auditLog.create({
        data: {
          actor_id: admin.adminId,
          actor_type: 'admin',
          action: 'delivery_zone.create',
          entity_type: 'delivery_zone',
          entity_id: zone.id,
          after_value: { name, fee, estimated_days },
        },
      })
      break
    }

    case 'update_zone': {
      const id = String(body.id ?? '')
      const before = await prisma.deliveryZone.findUnique({ where: { id } })
      if (!before) return NextResponse.json({ error: 'Location not found.' }, { status: 404 })
      const name = cleanName(body.name)
      const fee = koboFromNairaInput(body.fee_naira, MAX_DELIVERY_FEE)
      if (!name || name.length > 60) {
        return NextResponse.json({ error: 'Enter a location name (under 60 characters).' }, { status: 400 })
      }
      if (fee === null) {
        return NextResponse.json({ error: 'Enter a delivery price in whole naira up to ₦100,000.' }, { status: 400 })
      }
      const estimated_days = String(body.estimated_days ?? '').trim().slice(0, 30)
      await prisma.deliveryZone.update({ where: { id }, data: { name, fee, estimated_days } })
      await prisma.auditLog.create({
        data: {
          actor_id: admin.adminId,
          actor_type: 'admin',
          action: 'delivery_zone.update',
          entity_type: 'delivery_zone',
          entity_id: id,
          before_value: { name: before.name, fee: before.fee, estimated_days: before.estimated_days },
          after_value: { name, fee, estimated_days },
        },
      })
      break
    }

    case 'delete_zone': {
      const id = String(body.id ?? '')
      const before = await prisma.deliveryZone.findUnique({ where: { id } })
      if (!before) return NextResponse.json({ error: 'Location not found.' }, { status: 404 })
      await prisma.deliveryZone.delete({ where: { id } })
      await prisma.auditLog.create({
        data: {
          actor_id: admin.adminId,
          actor_type: 'admin',
          action: 'delivery_zone.delete',
          entity_type: 'delivery_zone',
          entity_id: id,
          before_value: { name: before.name, fee: before.fee, estimated_days: before.estimated_days },
        },
      })
      break
    }

    case 'set_threshold': {
      const kobo = koboFromNairaInput(body.threshold_naira, MAX_FREE_DELIVERY_THRESHOLD)
      if (kobo === null) {
        return NextResponse.json({ error: 'Enter the threshold in whole naira up to ₦1,000,000.' }, { status: 400 })
      }
      const before = await prisma.setting.findUnique({ where: { key: 'free_delivery_threshold' } })
      const value = String(kobo)
      await prisma.setting.upsert({
        where: { key: 'free_delivery_threshold' },
        create: { key: 'free_delivery_threshold', value, value_type: 'number', updated_by: admin.adminId },
        update: { value, updated_by: admin.adminId },
      })
      await prisma.auditLog.create({
        data: {
          actor_id: admin.adminId,
          actor_type: 'admin',
          action: 'setting.update',
          entity_type: 'setting',
          entity_id: 'free_delivery_threshold',
          before_value: before?.value ?? undefined,
          after_value: value,
        },
      })
      break
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }

  return NextResponse.json(await currentState())
}
