import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/auth/admin-session'
import { getSupabaseAdmin, uploadMediaFile } from '@/lib/storage'

export async function GET() {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const assets = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return NextResponse.json({ assets })
}

export async function POST(req: Request) {
  let admin
  try {
    admin = await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const contentType = req.headers.get('content-type') || ''

  // URL attach path
  if (contentType.includes('application/json')) {
    const body = (await req.json()) as {
      url?: string
      alt_text?: string
      filename?: string
    }
    if (!body.url) {
      return NextResponse.json({ error: 'url required' }, { status: 400 })
    }
    const asset = await prisma.mediaAsset.create({
      data: {
        filename: body.filename || body.url.split('/').pop() || 'image',
        url: body.url,
        thumbnail_url: body.url,
        mime_type: 'image/jpeg',
        file_size: 0,
        alt_text: body.alt_text || null,
        uploaded_by_admin_id: admin.adminId,
      },
    })
    return NextResponse.json({ asset })
  }

  // Multipart upload
  try {
    const form = await req.formData()
    const file = form.get('file')
    const alt = String(form.get('alt_text') || '')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'file required' }, { status: 400 })
    }
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'Max 50MB' }, { status: 400 })
    }

    const uploaded = await uploadMediaFile(file)
    const asset = await prisma.mediaAsset.create({
      data: {
        filename: file.name,
        url: uploaded.url,
        thumbnail_url: uploaded.url,
        mime_type: uploaded.mime_type,
        file_size: uploaded.file_size,
        alt_text: alt || file.name,
        uploaded_by_admin_id: admin.adminId,
      },
    })
    return NextResponse.json({ asset })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as { id?: string }
  if (!body.id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const asset = await prisma.mediaAsset.findUnique({ where: { id: body.id } })
  if (!asset) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const [productUses, reviewUses, intakeUses] = await Promise.all([
    prisma.productImage.count({ where: { media_asset_id: body.id } }),
    prisma.reviewImage.count({ where: { media_asset_id: body.id } }),
    prisma.restorationIntakeImage.count({ where: { media_asset_id: body.id } }),
  ])
  if (productUses + reviewUses + intakeUses > 0) {
    const uses = [
      productUses ? `${productUses} product photo${productUses > 1 ? 's' : ''}` : null,
      reviewUses ? `${reviewUses} review` : null,
      intakeUses ? `${intakeUses} restoration intake` : null,
    ]
      .filter(Boolean)
      .join(', ')
    return NextResponse.json(
      { error: `Still in use (${uses}). Detach it there first, then delete.` },
      { status: 400 }
    )
  }

  await prisma.mediaAsset.delete({ where: { id: body.id } })

  // Best-effort removal from storage — the database row is the source of truth.
  try {
    const supabase = getSupabaseAdmin()
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'media'
    const marker = `/object/public/${bucket}/`
    const idx = asset.url.indexOf(marker)
    if (supabase && idx !== -1) {
      const path = decodeURIComponent(asset.url.slice(idx + marker.length))
      await supabase.storage.from(bucket).remove([path])
    }
  } catch {
    // storage cleanup failure is non-fatal
  }

  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as {
    id?: string
    alt_text?: string
    focal_x?: number
    focal_y?: number
  }
  if (!body.id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const clampPct = (n: number) => Math.min(100, Math.max(0, Math.round(n)))
  const asset = await prisma.mediaAsset.update({
    where: { id: body.id },
    data: {
      ...(body.alt_text !== undefined ? { alt_text: body.alt_text.trim() || null } : {}),
      ...(typeof body.focal_x === 'number' ? { focal_x: clampPct(body.focal_x) } : {}),
      ...(typeof body.focal_y === 'number' ? { focal_y: clampPct(body.focal_y) } : {}),
    },
  })
  return NextResponse.json({ asset })
}
