import OpenAI, { toFile } from 'openai'
import { NextResponse } from 'next/server'

import { firstPhoto, getProductBySlug } from '@/lib/products'

export const dynamic = 'force-dynamic'
// Image generation is slow — give the function room beyond the default.
export const maxDuration = 60

const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'] as const

const PROMPT =
  'The FIRST image is a real person. The SECOND image shows a wig on a mannequin. ' +
  'Produce a photorealistic photo of the SAME person from the first image now wearing the exact ' +
  'wig from the second image. Keep the person\'s face, skin tone, complexion, features, expression ' +
  'and identity EXACTLY the same and unchanged — do not lighten or change the skin, and do not add ' +
  'or remove glasses. Replace ONLY the hair with the wig, matching the wig\'s exact colour, texture, ' +
  'length and style, with a natural hairline and lighting that matches the person\'s photo.'

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'Preview not available.' }, { status: 503 })
  }

  const form = await req.formData()
  const photo = form.get('photo')
  const slug = String(form.get('slug') || '')

  if (!(photo instanceof File) || photo.size === 0) {
    return NextResponse.json({ error: 'Photo required.' }, { status: 400 })
  }
  if (photo.size > MAX_PHOTO_BYTES) {
    return NextResponse.json({ error: 'Photo must be under 5MB.' }, { status: 400 })
  }
  const mediaType = photo.type as (typeof ALLOWED_MIME)[number]
  if (!ALLOWED_MIME.includes(mediaType)) {
    return NextResponse.json({ error: 'Use a JPG, PNG, or WebP photo.' }, { status: 400 })
  }

  // Look up the recommended wig server-side — never fetch a client-supplied URL.
  const product = await getProductBySlug(slug)
  const wigImage = product ? firstPhoto(product.images) : undefined
  if (!product || !wigImage) {
    return NextResponse.json({ error: 'Wig not found.' }, { status: 404 })
  }

  try {
    const wigRes = await fetch(wigImage.url)
    if (!wigRes.ok) {
      return NextResponse.json({ error: 'Could not load the wig image.' }, { status: 502 })
    }
    const wigBuffer = Buffer.from(await wigRes.arrayBuffer())

    const openai = new OpenAI()
    const face = await toFile(Buffer.from(await photo.arrayBuffer()), 'face.jpg', { type: mediaType })
    const wig = await toFile(wigBuffer, 'wig.jpg', { type: 'image/jpeg' })

    const rsp = await openai.images.edit({
      model: process.env.OPENAI_TRYON_MODEL || 'gpt-image-1',
      image: [face, wig],
      prompt: PROMPT,
      size: '1024x1536',
      quality: 'medium',
      input_fidelity: 'high',
    })

    const b64 = rsp.data?.[0]?.b64_json
    if (!b64) {
      return NextResponse.json({ error: 'Preview failed.' }, { status: 502 })
    }
    return NextResponse.json({
      image: `data:image/png;base64,${b64}`,
      name: product.name,
    })
  } catch (e) {
    // Safety rejections and other failures must not break the page — the caller
    // falls back to the recommendation cards.
    const message = e instanceof Error ? e.message : 'Preview failed'
    const status = /safety|rejected/i.test(message) ? 422 : 502
    return NextResponse.json({ error: message }, { status })
  }
}
