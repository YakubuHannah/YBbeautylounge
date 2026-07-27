import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const body = (await req.json()) as {
    product_id?: string
    rating?: number
    title?: string
    body?: string
    display_name?: string
  }

  if (!body.product_id) {
    return NextResponse.json({ error: 'product_id required' }, { status: 400 })
  }
  const rating = Number(body.rating)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating 1–5 required' }, { status: 400 })
  }
  if (!body.display_name?.trim()) {
    return NextResponse.json({ error: 'Display name required' }, { status: 400 })
  }
  if (
    body.display_name.length > 60 ||
    (body.title?.length ?? 0) > 120 ||
    (body.body?.length ?? 0) > 2000
  ) {
    return NextResponse.json({ error: 'Review is too long' }, { status: 400 })
  }

  const product = await prisma.product.findFirst({
    where: { id: body.product_id, status: 'active', deleted_at: null },
    select: { id: true },
  })
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  await prisma.review.create({
    data: {
      product_id: product.id,
      rating,
      title: body.title?.trim() || null,
      body: body.body?.trim() || null,
      display_name: body.display_name.trim(),
      status: 'pending',
    },
  })

  return NextResponse.json({ ok: true })
}
