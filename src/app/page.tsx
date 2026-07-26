import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

async function getProduct() {
  const product = await prisma.product.findFirst({
    where: { status: 'active' },
    include: {
      variants: {
        where: { is_active: true },
        take: 3
      },
      images: {
        take: 3
      }
    }
  })
  return product
}

export default async function HomePage() {
  const product = await getProduct()

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-ink-muted">Loading product...</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="max-w-2xl">
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold text-ink">{product.name}</h1>
            <p className="text-base text-ink-muted">{product.description}</p>
          </div>

          <div className="space-y-3">
            {product.variants.length > 0 ? (
              product.variants.map((variant) => (
                <div key={variant.id} className="flex items-center justify-between rounded-[2px] border border-vanilla-400 bg-vanilla-50 p-3">
                  <div>
                    <h3 className="text-sm font-semibold text-ink">
                      {variant.length_inches}" {variant.colorway}
                    </h3>
                    <p className="text-xs text-ink-muted">
                      {variant.density_percent}% density, {variant.draw_type} draw
                    </p>
                    {variant.stock_quantity > 0 ? (
                      <Badge variant="success">In stock</Badge>
                    ) : (
                      <Badge variant="error">Out of stock</Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-cherry-600">
                      ₦{variant.price.toLocaleString()}
                    </p>
                    <Link href={`/shop/${product.slug}?variant=${variant.sku}`}>
                      <Button variant="primary" size="sm">
                        Select
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-ink-muted">No variants available</p>
            )}
          </div>

          <div className="pt-4 border-t border-vanilla-400">
            <p className="text-sm text-ink-muted">
              Price: ₦{product.variants[0]?.price.toLocaleString() ?? 0}
            </p>
            <Button variant="primary" className="mt-2 w-full">
              Add to Cart
            </Button>
          </div>
        </div>
      </Card>
    </main>
  )
}