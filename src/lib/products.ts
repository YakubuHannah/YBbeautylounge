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

export type PublicImage = {
  id: string
  url: string
  alt_text: string | null
  sort_order: number
  focal_x: number
  focal_y: number
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
  images: PublicImage[]
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

const productInclude = {
  variants: {
    where: { is_active: true },
    orderBy: { length_inches: 'asc' as const },
  },
  images: {
    orderBy: { sort_order: 'asc' as const },
    include: { media_asset: true },
  },
}

function mapProduct(p: {
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
  variants: Parameters<typeof serialiseVariant>[0][]
  images: {
    id: string
    sort_order: number
    alt_text: string | null
    media_asset: { url: string; alt_text: string | null; focal_x: number; focal_y: number }
  }[]
}): PublicProduct {
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
    images: p.images.map((img) => ({
      id: img.id,
      url: img.media_asset.url,
      alt_text: img.alt_text ?? img.media_asset.alt_text,
      sort_order: img.sort_order,
      focal_x: img.media_asset.focal_x,
      focal_y: img.media_asset.focal_y,
    })),
  }
}

export async function getActiveProducts(): Promise<PublicProduct[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { status: 'active', deleted_at: null },
      orderBy: { createdAt: 'desc' },
      include: productInclude,
    })
    return rows.map(mapProduct)
  } catch {
    return []
  }
}

export async function getProductBySlug(slug: string): Promise<PublicProduct | null> {
  try {
    const p = await prisma.product.findFirst({
      where: { slug, status: 'active', deleted_at: null },
      include: productInclude,
    })
    if (!p) return null
    return mapProduct(p)
  } catch {
    return null
  }
}

export async function getApprovedReviews(productId: string) {
  try {
    return await prisma.review.findMany({
      where: { product_id: productId, status: 'approved', rating: { gt: 0 } },
      orderBy: [{ is_featured: 'desc' }, { createdAt: 'desc' }],
      take: 20,
      select: {
        id: true,
        rating: true,
        title: true,
        body: true,
        display_name: true,
        createdAt: true,
      },
    })
  } catch {
    return []
  }
}

export async function getAllApprovedReviews() {
  try {
    return await prisma.review.findMany({
      where: { status: 'approved', rating: { gt: 0 } },
      orderBy: [{ is_featured: 'desc' }, { createdAt: 'desc' }],
      take: 50,
      select: {
        id: true,
        rating: true,
        title: true,
        body: true,
        display_name: true,
        createdAt: true,
        product: { select: { name: true, slug: true } },
        images: {
          select: {
            id: true,
            media_asset: {
              select: { url: true, mime_type: true, alt_text: true, focal_x: true, focal_y: true },
            },
          },
        },
      },
    })
  } catch {
    return []
  }
}

export function minPrice(product: PublicProduct): number | null {
  if (!product.variants.length) return null
  return Math.min(...product.variants.map((v) => v.price))
}

export function textureLabel(texture: string): string {
  return texture.replace(/_/g, ' ')
}
