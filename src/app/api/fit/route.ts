import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

import { getActiveProducts, textureLabel } from '@/lib/products'

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
  if (!process.env.ANTHROPIC_API_KEY) {
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

  const anthropic = new Anthropic()
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 2048,
    system:
      'You are the in-house stylist for YBBeautylounge, a premium Nigerian wig brand. ' +
      'A customer shares a photo of their face. Assess the face shape and the features ' +
      'that matter for choosing a wig (face length-to-width, jawline, forehead, cheekbones), ' +
      'then recommend the 2–3 pieces from the catalogue that would frame their face best. ' +
      'Only recommend slugs that appear in the catalogue. Write warmly and specifically — ' +
      'this is styling advice, not a verdict. Never comment negatively on appearance.',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: photoBase64 },
          },
          {
            type: 'text',
            text: `Catalogue of available pieces:\n${JSON.stringify(catalogue)}`,
          },
        ],
      },
    ],
    output_config: { format: { type: 'json_schema', schema: RESULT_SCHEMA } },
  })

  if (response.stop_reason === 'refusal') {
    return NextResponse.json(
      { error: 'That photo could not be analysed. Try a clear, front-facing photo.' },
      { status: 422 }
    )
  }

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    return NextResponse.json({ error: 'Analysis failed — please try again.' }, { status: 502 })
  }

  const result = JSON.parse(textBlock.text) as {
    face_shape: string
    summary: string
    recommendations: { slug: string; reason: string }[]
  }

  const recommendations = result.recommendations
    .map((rec) => {
      const product = pool.find((p) => p.slug === rec.slug)
      if (!product) return null
      return {
        slug: product.slug,
        name: product.name,
        texture: textureLabel(product.texture),
        image: product.images[0]
          ? {
              url: product.images[0].url,
              alt_text: product.images[0].alt_text,
              focal_x: product.images[0].focal_x,
              focal_y: product.images[0].focal_y,
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
