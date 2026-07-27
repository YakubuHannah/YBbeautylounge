import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  const invite = await prisma.review.findFirst({
    where: { invite_token: params.token, status: 'invite' },
    include: {
      product: { select: { id: true, name: true, slug: true } },
    },
  })
  if (!invite) {
    return NextResponse.json({ error: 'Invalid or used link' }, { status: 404 })
  }
  return NextResponse.json({
    product: invite.product,
    token: params.token,
  })
}

export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  const body = (await req.json()) as {
    rating?: number
    title?: string
    body?: string
    display_name?: string
  }

  const rating = Number(body.rating)
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating 1–5 required' }, { status: 400 })
  }
  if (!body.display_name?.trim()) {
    return NextResponse.json({ error: 'Display name required' }, { status: 400 })
  }

  const invite = await prisma.review.findFirst({
    where: { invite_token: params.token, status: 'invite' },
  })
  if (!invite) {
    return NextResponse.json({ error: 'Invalid or used link' }, { status: 404 })
  }

  const review = await prisma.review.update({
    where: { id: invite.id },
    data: {
      rating,
      title: body.title?.trim() || null,
      body: body.body?.trim() || null,
      display_name: body.display_name.trim(),
      status: 'pending',
      invite_token: null, // single use
    },
  })

  return NextResponse.json({ ok: true, review_id: review.id })
}
