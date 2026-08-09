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
    // Set OPENAI_FIT_MODEL in Vercel to use a different model without a deploy.
    // Whatever you choose must support image input and json_schema output.
    model: process.env.OPENAI_FIT_MODEL || 'gpt-4o',
    max_tokens: 2048,
    messages: [
      {
        role: 'system',
        content:
          'You are the in-house stylist for YBBeautylounge, a premium Nigerian wig brand. ' +
          'A customer shares a photo of their face. Assess the face shape, the complexion and ' +
          'skin tone, and the features that matter for choosing a wig (face length-to-width, ' +
          'jawline, forehead, cheekbones, and which lengths, textures and colours flatter this ' +
          'skin tone), then RANK EVERY piece in the catalogue from the best genuine match for ' +
          'THIS person to the least. Include ALL pieces — do not leave any out — strongest match ' +
          'first, each with a short warm reason. Only use slugs that appear in the catalogue. ' +
          'Write warmly and specifically — this is styling advice, not a verdict. Never comment ' +
          'negatively on appearance.',
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

  const ranked = result.recommendations
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
    .filter((r): r is NonNullable<typeof r> => r !== null)

  // Show 3: the genuine top match, plus 2 rotated from the next strong matches
  // (Math.random per request) so different customers see different pieces and
  // no unit is left idle. The #1 stays the true best fit.
  const shuffle = <T>(a: T[]): T[] => {
    const arr = [...a]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }
  const [top, ...restRanked] = ranked
  const rotated = shuffle(restRanked.slice(0, 6)).slice(0, 2)
  const recommendations = (top ? [top, ...rotated] : []).slice(0, 3)

  return NextResponse.json({
    face_shape: result.face_shape,
    summary: result.summary,
    recommendations,
  })
}
