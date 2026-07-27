import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/auth/admin-session'

export async function GET() {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      product: { select: { id: true, name: true, slug: true } },
    },
    take: 100,
  })
  return NextResponse.json({ reviews })
}

/** Create review invite OR moderate */
export async function POST(req: Request) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as {
    action?: 'invite' | 'moderate'
    product_id?: string
    review_id?: string
    status?: 'approved' | 'rejected' | 'pending'
    rejection_reason?: string
    admin_reply?: string
    is_featured?: boolean
  }

  if (body.action === 'invite') {
    if (!body.product_id) {
      return NextResponse.json({ error: 'product_id required' }, { status: 400 })
    }
    const token = randomBytes(24).toString('hex')
    const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    // pending invite row without rating yet — store as pending placeholder? Better separate.
    // Use invite_token on a special pending invite without rating: use status pending_invite
    const review = await prisma.review.create({
      data: {
        product_id: body.product_id,
        rating: 0,
        display_name: '',
        status: 'invite',
        invite_token: token,
        body: null,
        title: null,
      },
    })
    return NextResponse.json({
      review,
      submit_url: `${site}/reviews/submit/${token}`,
    })
  }

  if (body.action === 'moderate') {
    if (!body.review_id || !body.status) {
      return NextResponse.json({ error: 'review_id and status required' }, { status: 400 })
    }
    const updated = await prisma.review.update({
      where: { id: body.review_id },
      data: {
        status: body.status,
        rejection_reason: body.rejection_reason ?? null,
        admin_reply: body.admin_reply ?? undefined,
        is_featured: body.is_featured ?? undefined,
      },
    })

    // Recalculate aggregates when approving/rejecting
    const productId = updated.product_id
    const approved = await prisma.review.aggregate({
      where: { product_id: productId, status: 'approved', rating: { gt: 0 } },
      _avg: { rating: true },
      _count: { id: true },
    })
    await prisma.product.update({
      where: { id: productId },
      data: {
        avg_rating: approved._avg.rating ?? 0,
        review_count: approved._count.id,
      },
    })

    return NextResponse.json({ review: updated })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
