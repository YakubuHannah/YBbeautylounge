import { NextResponse } from 'next/server'

import { requireAdminSession } from '@/lib/auth/admin-session'
import { ensureDefaultCategories } from '@/lib/categories'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function GET() {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await ensureDefaultCategories()
  const categories = await prisma.collection.findMany({
    orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { products: true } } },
  })
  return NextResponse.json({
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      sort_order: c.sort_order,
      is_active: c.is_active,
      product_count: c._count.products,
    })),
  })
}

export async function POST(req: Request) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as {
    action?: 'save' | 'delete'
    id?: string
    name?: string
    sort_order?: number
    is_active?: boolean
  }

  if (body.action === 'delete') {
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const attached = await prisma.collectionProduct.count({
      where: { collection_id: body.id },
    })
    if (attached > 0) {
      return NextResponse.json(
        { error: `${attached} product(s) are in this category — move them first, or hide it.` },
        { status: 400 }
      )
    }
    await prisma.collection.delete({ where: { id: body.id } })
    return NextResponse.json({ ok: true })
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 })
  }
  const name = body.name.trim().slice(0, 60)
  const data = {
    name,
    sort_order: Number(body.sort_order ?? 0),
    is_active: body.is_active !== false,
  }

  if (body.id) {
    const category = await prisma.collection.update({ where: { id: body.id }, data })
    return NextResponse.json({ category })
  }

  let slug = slugify(name)
  const existing = await prisma.collection.findUnique({ where: { slug } })
  if (existing) slug = `${slug}-${Date.now().toString(36)}`
  const category = await prisma.collection.create({
    data: { ...data, slug, published_at: new Date() },
  })
  return NextResponse.json({ category })
}
