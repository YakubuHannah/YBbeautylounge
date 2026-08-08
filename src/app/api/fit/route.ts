import OpenAI from 'openai'
import { NextResponse } from 'next/server'

import { firstPhoto, getActiveProducts, textureLabel } from '@/lib/products'

export const dynamic = 'force-dynamic'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const

const RESULT_SCHEMA = {
  type: 'object',
  properties: {
    face_shape: { type: 'string' },
    summary: { type: 'string' },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
          reason: { type: 'string' },
        },
        required: ['slug', 'reason'],
        additionalProperties: false,
      },
    },
  },
  required: ['face_shape', 'summary', 'recommendations'],
  additionalProperties: false,
} as const

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'The stylist is not available yet — check back soon.' },
      { status: 503 }
    )
  }

  const form = await req.formData()
  const photo = form.get('photo')
  if (!(photo instanceof File) || photo.size === 0) {
    return NextResponse.json({ error: 'Add a photo of your face first.' }, { status: 400 })
  }
  if (photo.size > MAX_PHOTO_BYTES) {
    return NextResponse.json({ error: 'Photo must be under 5MB.' }, { status: 400 })
  }
  const mediaType = photo.type as (typeof ALLOWED_MIME)[number]
  if (!ALLOWED_MIME.includes(mediaType)) {
    return NextResponse.json({ error: 'Use a JPG, PNG, or WebP photo.' }, { status: 400 })
  }

  const products = await getActiveProducts()
  const inStock = products.filter((p) =>
    p.variants.some((v) => v.is_active && v.stock_quantity > 0)
  )
  const pool = inStock.length ? inStock : products
  if (!pool.length) {
    return NextResponse.json(
      { error: 'No pieces are available to match right now.' },
      { status: 503 }
    )
  }

  const catalogue = pool.map((p) => ({
    slug: p.slug,
    name: p.name,
    texture: textureLabel(p.texture),
    description: p.description,
    lengths_inches: p.variants.map((v) => v.length_inches).filter(Boolean),
  }))

  // The photo is analysed in memory and never written to storage.
  const photoBase64 = Buffer.from(await photo.arrayBuffer()).toString('base64')

  const openai = new OpenAI()
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 2048,
    messages: [
      {
        role: 'system',
        content:
          'You are the in-house stylist for YBBeautylounge, a premium Nigerian wig brand. ' +
          'A customer shares a photo of their face. Assess the face shape and the features ' +
          'that matter for choosing a wig (face length-to-width, jawline, forehead, cheekbones), ' +
          'then recommend the 2–3 pieces from the catalogue that would frame their face best. ' +
          'Only recommend slugs that appear in the catalogue. Write warmly and specifically — ' +
          'this is styling advice, not a verdict. Never comment negatively on appearance.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mediaType};base64,${photoBase64}` },
          },
          {
            type: 'text',
            text: `Catalogue of available pieces:\n${JSON.stringify(catalogue)}`,
          },
        ],
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: { name: 'fit_result', strict: true, schema: RESULT_SCHEMA },
    },
  })

  const message = completion.choices[0]?.message
  if (message?.refusal) {
    return NextResponse.json(
      { error: 'That photo could not be analysed. Try a clear, front-facing photo.' },
      { status: 422 }
    )
  }

  if (!message?.content) {
    return NextResponse.json({ error: 'Analysis failed — please try again.' }, { status: 502 })
  }

  const result = JSON.parse(message.content) as {
    face_shape: string
    summary: string
    recommendations: { slug: string; reason: string }[]
  }

  const recommendations = result.recommendations
    .map((rec) => {
      const product = pool.find((p) => p.slug === rec.slug)
      if (!product) return null
      const photo = firstPhoto(product.images)
      return {
        slug: product.slug,
        name: product.name,
        texture: textureLabel(product.texture),
        image: photo
          ? {
              url: photo.url,
              alt_text: photo.alt_text,
              focal_x: photo.focal_x,
              focal_y: photo.focal_y,
            }
          : null,
        reason: rec.reason,
      }
    })
    .filter(Boolean)
    .slice(0, 3)

  return NextResponse.json({
    face_shape: result.face_shape,
    summary: result.summary,
    recommendations,
  })
}
