import { NextResponse } from 'next/server'

import { requireAdminSession } from '@/lib/auth/admin-session'
import { STARTER_FAQS } from '@/lib/faqs'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // First visit: seed the starter set so the founder edits rows instead of retyping them.
  const count = await prisma.faq.count()
  if (count === 0) {
    await prisma.faq.createMany({ data: STARTER_FAQS })
  }
  const faqs = await prisma.faq.findMany({
    orderBy: [{ category: 'asc' }, { sort_order: 'asc' }],
  })
  return NextResponse.json({ faqs })
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
    question?: string
    answer?: string
    category?: string
    sort_order?: number
    is_active?: boolean
  }

  if (body.action === 'delete') {
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await prisma.faq.delete({ where: { id: body.id } })
    return NextResponse.json({ ok: true })
  }

  if (!body.question?.trim() || !body.answer?.trim() || !body.category?.trim()) {
    return NextResponse.json(
      { error: 'Question, answer, and category are required' },
      { status: 400 }
    )
  }
  const data = {
    question: body.question.trim(),
    answer: body.answer.trim(),
    category: body.category.trim(),
    sort_order: Number(body.sort_order ?? 0),
    is_active: body.is_active !== false,
  }
  const faq = body.id
    ? await prisma.faq.update({ where: { id: body.id }, data })
    : await prisma.faq.create({ data })
  return NextResponse.json({ faq })
}
