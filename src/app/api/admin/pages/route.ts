import { NextResponse } from 'next/server'

import { requireAdminSession } from '@/lib/auth/admin-session'
import { EDITABLE_PAGES } from '@/lib/pages'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await prisma.page.findMany({
    where: { slug: { in: EDITABLE_PAGES.map((p) => p.slug) } },
    include: { blocks: { orderBy: { sort_order: 'asc' } } },
  })
  const pages = EDITABLE_PAGES.map((def) => {
    const row = rows.find((r) => r.slug === def.slug)
    const block = row?.blocks.find((b) => b.block_type === 'text')
    const content =
      block && typeof block.content === 'object' && block.content !== null
        ? String((block.content as { text?: unknown }).text ?? '')
        : ''
    return { slug: def.slug, label: def.label, content }
  })
  return NextResponse.json({ pages })
}

export async function PATCH(req: Request) {
  let admin
  try {
    admin = await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as { slug?: string; content?: string }
  const def = EDITABLE_PAGES.find((p) => p.slug === body.slug)
  if (!def) {
    return NextResponse.json({ error: 'Unknown page' }, { status: 400 })
  }
  const content = String(body.content ?? '')
  if (content.length > 20000) {
    return NextResponse.json({ error: 'Content is too long' }, { status: 400 })
  }

  await prisma.$transaction(async (tx) => {
    const page = await tx.page.upsert({
      where: { slug: def.slug },
      create: {
        slug: def.slug,
        title: def.label,
        status: 'published',
        published_at: new Date(),
      },
      update: { status: 'published' },
    })
    await tx.pageBlock.deleteMany({ where: { page_id: page.id } })
    if (content.trim()) {
      await tx.pageBlock.create({
        data: {
          page_id: page.id,
          block_type: 'text',
          content: { text: content },
          sort_order: 0,
        },
      })
    }
    await tx.auditLog.create({
      data: {
        actor_id: admin.adminId,
        actor_type: 'admin',
        action: 'page.update',
        entity_type: 'page',
        entity_id: def.slug,
        after_value: { text: content },
      },
    })
  })

  return NextResponse.json({ ok: true })
}
