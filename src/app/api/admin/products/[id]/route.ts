import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/auth/admin-session'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      variants: { orderBy: { length_inches: 'asc' } },
      images: { orderBy: { sort_order: 'asc' }, include: { media_asset: true } },
      collections: true,
    },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ product })
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
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
      id?: string
      sku: string
      length_inches?: number | null
      colorway?: string | null
      density_percent?: number | null
      draw_type?: string | null
      price_naira: number
      cost_price_naira?: number | null
      stock_quantity: number
      weight_grams?: number | null
      is_active?: boolean
    }>
    media_asset_ids?: string[]
    images?: Array<{ media_asset_id: string; display_name?: string; alt_text?: string }>
    category_id?: string | null
  }

  const existing = await prisma.product.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Incoming images always get alt text (provided or auto-generated below), so
  // this publish guard only applies when the request does not replace them.
  if (body.status === 'active' && !body.images && !body.media_asset_ids) {
    const images = await prisma.productImage.findMany({ where: { product_id: params.id } })
    if (images.length > 0) {
      const hasEmptyAlt = images.some(img => !img.alt_text?.trim())
      if (hasEmptyAlt) {
        return NextResponse.json({ error: 'All product images must have alt text before publishing.' }, { status: 400 })
      }
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: params.id },
      data: {
        name: body.name?.trim() ?? undefined,
        description: body.description !== undefined ? body.description : undefined,
        texture: body.texture ?? undefined,
        hair_origin: body.hair_origin !== undefined ? body.hair_origin : undefined,
        care_instructions:
          body.care_instructions !== undefined ? body.care_instructions : undefined,
        status: body.status ?? undefined,
        featured: body.featured ?? undefined,
        published_at:
          body.status === 'active' && !existing.published_at
            ? new Date()
            : body.status === 'draft'
              ? null
              : undefined,
      },
    })

    if (body.variants) {
      for (const v of body.variants) {
        const data = {
          sku: v.sku,
          length_inches: v.length_inches ?? null,
          colorway: v.colorway ?? null,
          density_percent: v.density_percent ?? null,
          draw_type: v.draw_type ?? null,
          price: Math.round(Number(v.price_naira) * 100),
          cost_price:
            v.cost_price_naira != null && v.cost_price_naira !== undefined
              ? Math.round(Number(v.cost_price_naira) * 100)
              : null,
          stock_quantity: Number(v.stock_quantity ?? 0),
          weight_grams: v.weight_grams ?? null,
          is_active: v.is_active !== false,
        }
        if (v.id) {
          await tx.productVariant.update({ where: { id: v.id }, data })
        } else {
          await tx.productVariant.create({
            data: { ...data, product_id: params.id },
          })
        }
      }
    }

    const incoming =
      body.images ??
      body.media_asset_ids?.map((media_asset_id) => ({
        media_asset_id,
        display_name: undefined,
        alt_text: undefined,
      }))
    if (incoming) {
      await tx.productImage.deleteMany({ where: { product_id: params.id } })
      if (incoming.length) {
        const productName = body.name || existing.name
        const count = incoming.length
        const imageData = incoming.map((img, idx) => {
          const position = idx + 1
          return {
            product_id: params.id,
            media_asset_id: img.media_asset_id,
            sort_order: idx,
            display_name:
              img.display_name?.trim() ||
              `${productName.toLowerCase().replace(/\s+/g, '-')}-${position}`,
            alt_text: img.alt_text?.trim() || `${productName}, image ${position} of ${count}`,
          }
        })
        await tx.productImage.createMany({ data: imageData })
      }
    }

    if (body.category_id !== undefined) {
      await tx.collectionProduct.deleteMany({ where: { product_id: params.id } })
      if (body.category_id) {
        const category = await tx.collection.findUnique({ where: { id: body.category_id } })
        if (category) {
          await tx.collectionProduct.create({
            data: { collection_id: category.id, product_id: params.id },
          })
        }
      }
    }
  })

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      variants: { orderBy: { length_inches: 'asc' } },
      images: { orderBy: { sort_order: 'asc' }, include: { media_asset: true } },
      collections: true,
    },
  })

  return NextResponse.json({ product })
}
