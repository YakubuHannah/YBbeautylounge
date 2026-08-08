import { NextResponse } from 'next/server'

import { firstPhoto, getProductBySlug } from '@/lib/products'

export const dynamic = 'force-dynamic'

// Resolves product photos for the cart by slug — for older cart lines saved
// before images were stored. Named fields only (rule 4): returns slug -> url.
export async function GET(req: Request) {
  const slugs = (new URL(req.url).searchParams.get('slugs') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20)

  const entries = await Promise.all(
    slugs.map(async (slug) => {
      const product = await getProductBySlug(slug)
      const url = product ? firstPhoto(product.images)?.url ?? null : null
      return [slug, url] as const
    })
  )
  return NextResponse.json(Object.fromEntries(entries.filter(([, url]) => url)))
}
