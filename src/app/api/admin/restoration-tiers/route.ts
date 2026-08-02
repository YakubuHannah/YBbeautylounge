import { NextResponse } from 'next/server'

import { requireAdminSession } from '@/lib/auth/admin-session'
import { prisma } from '@/lib/prisma'
import { DEFAULT_TIERS } from '@/lib/restoration'

export const dynamic = 'force-dynamic'

const MAX_PRICE_KOBO = 1_000_000_000 // ₦10,000,000

export async function GET() {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // First visit: seed the current cards so the founder edits instead of retyping.
  const count = await prisma.restorationServiceTier.count()
  if (count === 0) {
    await prisma.restorationServiceTier.createMany({ data: DEFAULT_TIERS })
  }
  const tiers = await prisma.restorationServiceTier.findMany({
    orderBy: { starting_price: 'asc' },
  })
  return NextResponse.json({ tiers })
}

export async function POST(req: Request) {
  let admin
  try {
    admin = await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as {
    action?: 'save' | 'delete'
    id?: string
    name?: string
    description?: string
    price_naira?: number
    is_active?: boolean
  }

  if (body.action === 'delete') {
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const jobs = await prisma.restorationJob.count({ where: { service_tier_id: body.id } })
    if (jobs > 0) {
      return NextResponse.json(
        { error: 'This tier has restoration jobs attached — hide it instead of deleting.' },
        { status: 400 }
      )
    }
    await prisma.restorationServiceTier.delete({ where: { id: body.id } })
    return NextResponse.json({ ok: true })
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 })
  }
  const priceNaira = Number(body.price_naira ?? 0)
  if (!Number.isFinite(priceNaira) || priceNaira < 0 || priceNaira * 100 > MAX_PRICE_KOBO) {
    return NextResponse.json(
      { error: 'Price must be between ₦0 (quote on review) and ₦10,000,000.' },
      { status: 400 }
    )
  }
  const data = {
    name: body.name.trim(),
    description: body.description?.trim() || null,
    starting_price: Math.round(priceNaira * 100),
    typical_turnaround_days: 7,
    is_active: body.is_active !== false,
  }

  const before = body.id
    ? await prisma.restorationServiceTier.findUnique({ where: { id: body.id } })
    : null
  const tier = body.id
    ? await prisma.restorationServiceTier.update({
        where: { id: body.id },
        data: {
          name: data.name,
          description: data.description,
          starting_price: data.starting_price,
          is_active: data.is_active,
        },
      })
    : await prisma.restorationServiceTier.create({ data })

  await prisma.auditLog.create({
    data: {
      actor_id: admin.adminId,
      actor_type: 'admin',
      action: 'restoration_tier.save',
      entity_type: 'restoration_service_tier',
      entity_id: tier.id,
      before_value: before
        ? { name: before.name, starting_price: before.starting_price, is_active: before.is_active }
        : undefined,
      after_value: {
        name: tier.name,
        starting_price: tier.starting_price,
        is_active: tier.is_active,
      },
    },
  })

  return NextResponse.json({ tier })
}
