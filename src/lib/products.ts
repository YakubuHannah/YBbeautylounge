import { prisma } from '@/lib/prisma'

/** Public product shape — never includes cost_price (§19.2) */
export type PublicVariant = {
  id: string
  sku: string
  length_inches: number | null
  colorway: string | null
  density_percent: number | null
  draw_type: string | null
  lace_type: string | null
  lace_size: string | null
  cap_size: string | null
  price: number
  compare_at_price: number | null
  stock_quantity: number
  weight_grams: number | null
  is_active: boolean
}

export type PublicProduct = {
  id: string
  name: string
  slug: string
  description: string | null
  texture: string
  hair_origin: string | null
  care_instructions: string | null
  avg_rating: number
  review_count: number
  featured: boolean
  variants: PublicVariant[]
}

function serialiseVariant(v: {
  id: string
  sku: string
  length_inches: number | null
  colorway: string | null
  density_percent: number | null
  draw_type: string | null
  lace_type: string | null
  lace_size: string | null
  cap_size: string | null
  price: number
  compare_at_price: number | null
  stock_quantity: number
  weight_grams: number | null
  is_active: boolean
}): PublicVariant {
  return {
    id: v.id,
    sku: v.sku,
    length_inches: v.length_inches,
    colorway: v.colorway,
    density_percent: v.density_percent,
    draw_type: v.draw_type,
    lace_type: v.lace_type,
    lace_size: v.lace_size,
    cap_size: v.cap_size,
    price: v.price,
    compare_at_price: v.compare_at_price,
    stock_quantity: v.stock_quantity,
    weight_grams: v.weight_grams,
    is_active: v.is_active,
  }
}

export async function getActiveProducts(): Promise<PublicProduct[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { status: 'active', deleted_at: null },
      orderBy: { createdAt: 'desc' },
      include: {
        variants: {
          where: { is_active: true },
          orderBy: { length_inches: 'asc' },
        },
      },
    })
    return rows.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      texture: p.texture,
      hair_origin: p.hair_origin,
      care_instructions: p.care_instructions,
      avg_rating: p.avg_rating,
      review_count: p.review_count,
      featured: p.featured,
      variants: p.variants.map(serialiseVariant),
    }))
  } catch {
    return []
  }
}

export async function getProductBySlug(slug: string): Promise<PublicProduct | null> {
  try {
    const p = await prisma.product.findFirst({
      where: { slug, status: 'active', deleted_at: null },
      include: {
        variants: {
          where: { is_active: true },
          orderBy: { length_inches: 'asc' },
        },
      },
    })
    if (!p) return null
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      texture: p.texture,
      hair_origin: p.hair_origin,
      care_instructions: p.care_instructions,
      avg_rating: p.avg_rating,
      review_count: p.review_count,
      featured: p.featured,
      variants: p.variants.map(serialiseVariant),
    }
  } catch {
    return null
  }
}

export function minPrice(product: PublicProduct): number | null {
  if (!product.variants.length) return null
  return Math.min(...product.variants.map((v) => v.price))
}

export function textureLabel(texture: string): string {
  return texture.replace(/_/g, ' ')
}
