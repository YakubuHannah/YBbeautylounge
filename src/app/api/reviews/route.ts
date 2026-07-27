import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { uploadMediaFile } from '@/lib/storage'

export const dynamic = 'force-dynamic'

const MAX_FILES = 3
const MAX_FILE_BYTES = 25 * 1024 * 1024
const ALLOWED_MIME = /^(image\/|video\/(mp4|quicktime|webm))/

type ReviewFields = {
  product_id: string
  rating: number
  title: string
  body: string
  display_name: string
}

export async function POST(req: Request) {
  let fields: ReviewFields
  let files: File[] = []

  const contentType = req.headers.get('content-type') || ''
  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData()
    fields = {
      product_id: String(form.get('product_id') || ''),
      rating: Number(form.get('rating')),
      title: String(form.get('title') || ''),
      body: String(form.get('body') || ''),
      display_name: String(form.get('display_name') || ''),
    }
    files = form.getAll('media').filter((f): f is File => f instanceof File && f.size > 0)
  } else {
    const body = (await req.json()) as Partial<ReviewFields>
    fields = {
      product_id: body.product_id || '',
      rating: Number(body.rating),
      title: body.title || '',
      body: body.body || '',
      display_name: body.display_name || '',
    }
  }

  if (!fields.product_id) {
    return NextResponse.json({ error: 'product_id required' }, { status: 400 })
  }
  if (!Number.isInteger(fields.rating) || fields.rating < 1 || fields.rating > 5) {
    return NextResponse.json({ error: 'Rating 1–5 required' }, { status: 400 })
  }
  if (!fields.display_name.trim()) {
    return NextResponse.json({ error: 'Display name required' }, { status: 400 })
  }
  if (
    fields.display_name.length > 60 ||
    fields.title.length > 120 ||
    fields.body.length > 2000
  ) {
    return NextResponse.json({ error: 'Review is too long' }, { status: 400 })
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `Up to ${MAX_FILES} photos or videos` }, { status: 400 })
  }
  for (const f of files) {
    if (f.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'Each file must be under 25MB' }, { status: 400 })
    }
    if (!ALLOWED_MIME.test(f.type)) {
      return NextResponse.json({ error: 'Only photos and MP4/MOV/WebM videos' }, { status: 400 })
    }
  }

  const product = await prisma.product.findFirst({
    where: { id: fields.product_id, status: 'active', deleted_at: null },
    select: { id: true, name: true },
  })
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  let uploads: { url: string; mime_type: string; file_size: number; filename: string }[] = []
  try {
    uploads = await Promise.all(
      files.map(async (f) => ({ filename: f.name, ...(await uploadMediaFile(f, 'reviews')) }))
    )
  } catch {
    return NextResponse.json(
      { error: 'Media upload failed — try again or send without files.' },
      { status: 500 }
    )
  }

  await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        product_id: product.id,
        rating: fields.rating,
        title: fields.title.trim() || null,
        body: fields.body.trim() || null,
        display_name: fields.display_name.trim(),
        status: 'pending',
      },
    })
    for (const u of uploads) {
      const asset = await tx.mediaAsset.create({
        data: {
          filename: u.filename,
          url: u.url,
          thumbnail_url: u.url,
          mime_type: u.mime_type,
          file_size: u.file_size,
          alt_text: `${product.name} — customer review media`,
        },
      })
      await tx.reviewImage.create({
        data: { review_id: review.id, media_asset_id: asset.id },
      })
    }
  })

  return NextResponse.json({ ok: true })
}
