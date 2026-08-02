import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/auth/admin-session'

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Admin product list — Cost prices only for admin response */
export async function GET() {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const products = await prisma.product.findMany({
    where: { deleted_at: null },
    orderBy: { updatedAt: 'desc' },
    include: {
      variants: { orderBy: { length_inches: 'asc' } },
      images: { orderBy: { sort_order: 'asc' }, include: { media_asset: true } },
    },
  })
  return NextResponse.json({ products })
}

export async function POST(req: Request) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as {
    name?: string
    description?: string
    texture?: string
    hair_origin?: string
    care_instructions?: string
    status?: string
    featured?: boolean
    variants?: Array<{
      sku?: string
      length_inches?: number
      colorway?: string
      density_percent?: number
      draw_type?: string
      price?: number
      cost_price?: number
      stock_quantity?: number
      weight_grams?: number
    }>
    media_asset_ids?: string[]
    category_id?: string
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 })
  }
  if (!body.texture?.trim()) {
    return NextResponse.json({ error: 'Texture required' }, { status: 400 })
  }

  const variantInput = (body.variants || []).filter(
    (v) => v && (v.price != null || v.sku || v.length_inches)
  )
  if (!variantInput.length) {
    return NextResponse.json(
      { error: 'Add at least one size/price option with a sell price' },
      { status: 400 }
    )
  }

  let slug = slugify(body.name)
  const existing = await prisma.product.findUnique({ where: { slug } })
  if (existing) slug = `${slug}-${Date.now().toString(36)}`

  const product = await prisma.product.create({
    data: {
      name: body.name.trim(),
      slug,
      description: body.description || null,
      texture: body.texture.trim(),
      hair_origin: body.hair_origin || null,
      care_instructions: body.care_instructions || null,
      status: body.status === 'active' ? 'active' : 'draft',
      featured: Boolean(body.featured),
      published_at: body.status === 'active' ? new Date() : null,
      variants: {
        create: variantInput.map((v, i) => ({
          sku: (v.sku || `${slug}-${i + 1}`).slice(0, 40),
          length_inches: v.length_inches ?? null,
          colorway: v.colorway ?? null,
          density_percent: v.density_percent ?? null,
          draw_type: v.draw_type ?? null,
          price: Math.round(Number(v.price ?? 0) * 100),
          cost_price:
            v.cost_price != null && v.cost_price !== undefined
              ? Math.round(Number(v.cost_price) * 100)
              : null,
          stock_quantity: Number(v.stock_quantity ?? 0),
          weight_grams: v.weight_grams ?? null,
          is_active: true,
        })),
      },
      images: body.media_asset_ids?.length
        ? {
            create: body.media_asset_ids.map((id, i) => ({
              media_asset_id: id,
              sort_order: i,
            })),
          }
        : undefined,
    },
    include: {
      variants: true,
      images: { include: { media_asset: true } },
    },
  })

  if (body.category_id) {
    const category = await prisma.collection.findUnique({ where: { id: body.category_id } })
    if (category) {
      await prisma.collectionProduct.create({
        data: { collection_id: category.id, product_id: product.id },
      })
    }
  }

  return NextResponse.json({ product })
}
