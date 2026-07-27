import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

function formatNaira(kobo: number) {
  return `₦${Math.round(kobo / 100).toLocaleString('en-NG')}`
}

async function getProduct() {
  try {
    return await prisma.product.findFirst({
      where: { status: 'active' },
      include: {
        variants: {
          where: { is_active: true },
          take: 3,
          orderBy: { length_inches: 'asc' },
        },
      },
    })
  } catch {
    return null
  }
}

export default async function HomePage() {
  const product = await getProduct()

  if (!product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-vanilla-100 p-6">
        <h1 className="font-display text-3xl text-ink">YBBeautylounge</h1>
        <p className="max-w-md text-center text-ink-muted">
          Store is connecting. Run database migrations and seed, then refresh.
        </p>
        <p className="text-sm text-ink-muted">Premium wigs · Revamp & restoration</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-vanilla-100 p-4">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-violet-800">
        YBBeautylounge
      </p>
      <Card className="w-full max-w-2xl">
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="font-display text-3xl text-ink">{product.name}</h1>
            <p className="text-base text-ink-muted">{product.description}</p>
          </div>

          <div className="space-y-3">
            {product.variants.map((variant) => (
              <div
                key={variant.id}
                className="flex items-center justify-between rounded-[2px] border border-vanilla-400 bg-vanilla-50 p-3"
              >
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-ink">
                    {variant.length_inches}&quot; · {variant.colorway}
                  </h3>
                  <p className="text-xs text-ink-muted">
                    {variant.density_percent}% density · {variant.draw_type}
                  </p>
                  {variant.stock_quantity > 0 ? (
                    <Badge variant="success">In stock</Badge>
                  ) : (
                    <Badge variant="error">Out of stock</Badge>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-cherry-600">
                    {formatNaira(variant.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-vanilla-400 pt-4">
            <Button variant="primary" className="mt-2 w-full" type="button">
              Add to cart
            </Button>
          </div>
        </div>
      </Card>
    </main>
  )
}
