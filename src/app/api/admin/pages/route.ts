import { NextResponse } from 'next/server'

import { requireAdminSession } from '@/lib/auth/admin-session'
import {
  DEFAULT_LENGTH_ROWS,
  DEFAULT_PAGE_COPY,
  EDITABLE_PAGES,
  type LengthRow,
} from '@/lib/pages'
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
    const textBlock = row?.blocks.find((b) => b.block_type === 'text')
    const saved =
      textBlock && typeof textBlock.content === 'object' && textBlock.content !== null
        ? String((textBlock.content as { text?: unknown }).text ?? '')
        : ''
    const result: {
      slug: string
      label: string
      content: string
      rows?: LengthRow[]
    } = {
      slug: def.slug,
      label: def.label,
      content: saved.trim() ? saved : (DEFAULT_PAGE_COPY[def.slug] ?? ''),
    }
    if (def.slug === 'length-guide') {
      const tableBlock = row?.blocks.find((b) => b.block_type === 'length_table')
      const savedRows =
        tableBlock && typeof tableBlock.content === 'object' && tableBlock.content !== null
          ? (tableBlock.content as { rows?: LengthRow[] }).rows
          : null
      result.rows =
        Array.isArray(savedRows) && savedRows.length ? savedRows : DEFAULT_LENGTH_ROWS
    }
    return result
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

  const body = (await req.json()) as {
    slug?: string
    content?: string
    rows?: { inches?: string; sits?: string; best?: string }[]
  }
  const def = EDITABLE_PAGES.find((p) => p.slug === body.slug)
  if (!def) {
    return NextResponse.json({ error: 'Unknown page' }, { status: 400 })
  }
  const content = String(body.content ?? '')
  if (content.length > 20000) {
    return NextResponse.json({ error: 'Content is too long' }, { status: 400 })
  }

  let tableRows: LengthRow[] | null = null
  if (def.slug === 'length-guide' && Array.isArray(body.rows)) {
    if (body.rows.length > 30) {
      return NextResponse.json({ error: 'Up to 30 rows' }, { status: 400 })
    }
    tableRows = body.rows
      .map((r) => ({
        inches: String(r.inches ?? '').slice(0, 40),
        sits: String(r.sits ?? '').slice(0, 120),
        best: String(r.best ?? '').slice(0, 120),
      }))
      .filter((r) => r.inches.trim())
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
    if (tableRows) {
      await tx.pageBlock.create({
        data: {
          page_id: page.id,
          block_type: 'length_table',
          content: { rows: tableRows },
          sort_order: 1,
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
        after_value: { text: content, rows: tableRows ?? undefined },
      },
    })
  })

  return NextResponse.json({ ok: true })
}
