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
  if (exclude.length) {
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: exclude } },
      select: { product_id: true },
    })
    cartProductIds = variants.map((v) => v.product_id)
  }

  const all = await getActiveProducts()
  const isWholesale = (p: (typeof all)[number]) => {
    const c = `${p.category?.name ?? ''} ${p.category?.slug ?? ''}`.toLowerCase()
    return c.includes('wholesale') || c.includes('whole sale') || c.includes('whole-sale')
  }
  const isCareKit = (p: (typeof all)[number]) => {
    const s = `${p.name} ${p.slug}`.toLowerCase()
    return s.includes('care kit') || s.includes('care-kit') || s.includes('maintenance')
  }

  // Recommend add-ons the cart doesn't already have. Never the wholesale deal
  // (not a retail add-on); always lead with the Wig Care Kit when in stock.
  const inStock = all.filter(
    (p) =>
      !cartProductIds.includes(p.id) &&
      !isWholesale(p) &&
      p.variants.some((v) => v.is_active && v.stock_quantity > 0)
  )

  const isAccessory = (p: (typeof all)[number]) => {
    const c = `${p.category?.name ?? ''} ${p.category?.slug ?? ''}`.toLowerCase()
    return c.includes('accessor') || isCareKit(p)
  }
  const shuffle = <T>(arr: T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  // Two accessories (the Wig Care Kit lives here) + two best-seller hair pieces.
  // Shuffled per request, so different shoppers see different picks.
  const accessories = shuffle(inStock.filter(isAccessory))
  const hair = inStock.filter((p) => !isAccessory(p))
  const featuredHair = hair.filter((p) => p.featured)
  const bestSellers = shuffle(featuredHair.length ? featuredHair : hair)

  let picks = [...accessories.slice(0, 2)]
  picks.push(...bestSellers.filter((p) => !picks.includes(p)).slice(0, 2))
  if (picks.length < 4) {
    const filler = shuffle(inStock.filter((p) => !picks.includes(p)))
    picks = [...picks, ...filler].slice(0, 4)
  }
  picks = picks.slice(0, 4)

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
