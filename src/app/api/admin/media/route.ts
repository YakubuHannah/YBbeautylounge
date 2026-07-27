import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/auth/admin-session'
import { uploadMediaFile } from '@/lib/storage'

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
