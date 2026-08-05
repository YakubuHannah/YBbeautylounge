import { NextResponse } from 'next/server'

import { firstPhoto, getActiveProducts, minPrice } from '@/lib/products'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/** Cross-category recommendations for the cart: things from other categories first. */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const exclude = (url.searchParams.get('exclude') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30)

  let cartProductIds: string[] = []
  const cartCategorySlugs = new Set<string>()
  if (exclude.length) {
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: exclude } },
      select: {
        product_id: true,
        product: {
          select: {
            collections: { select: { collection: { select: { slug: true } } } },
          },
        },
      },
    })
    cartProductIds = variants.map((v) => v.product_id)
    for (const v of variants) {
      for (const c of v.product.collections) cartCategorySlugs.add(c.collection.slug)
    }
  }

  const all = await getActiveProducts()
  const inStock = all.filter(
    (p) =>
      !cartProductIds.includes(p.id) &&
      p.variants.some((v) => v.is_active && v.stock_quantity > 0)
  )

  // Prefer products from categories the cart doesn't already contain.
  const otherCategory = inStock.filter(
    (p) => p.category && !cartCategorySlugs.has(p.category.slug)
  )
  const rest = inStock.filter((p) => !otherCategory.includes(p))
  const picks = [...otherCategory, ...rest].slice(0, 4)

  return NextResponse.json({
    recommendations: picks.map((p) => {
      const photo = firstPhoto(p.images)
      return {
        name: p.name,
        slug: p.slug,
        category: p.category?.name ?? null,
        price: minPrice(p),
        image: photo
          ? {
              url: photo.url,
              alt_text: photo.alt_text,
              focal_x: photo.focal_x,
              focal_y: photo.focal_y,
            }
          : null,
      }
    }),
  })
}
