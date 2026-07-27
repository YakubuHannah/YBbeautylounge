import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const [products, pendingReviews, media] = await Promise.all([
    prisma.product.count({ where: { deleted_at: null } }),
    prisma.review.count({ where: { status: 'pending' } }),
    prisma.mediaAsset.count(),
  ])

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Dashboard</h1>
      <p className="mt-2 text-ink-muted">Operate catalogue, media, and reviews without code.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="border border-vanilla-400 bg-vanilla-50 p-5">
          <p className="text-xs uppercase tracking-widest text-violet-800">Products</p>
          <p className="mt-2 font-display text-3xl">{products}</p>
          <Link href="/admin/products" className="mt-3 inline-block text-sm text-cherry-600">
            Manage
          </Link>
        </div>
        <div className="border border-vanilla-400 bg-vanilla-50 p-5">
          <p className="text-xs uppercase tracking-widest text-violet-800">Media</p>
          <p className="mt-2 font-display text-3xl">{media}</p>
          <Link href="/admin/media" className="mt-3 inline-block text-sm text-cherry-600">
            Upload
          </Link>
        </div>
        <div className="border border-vanilla-400 bg-vanilla-50 p-5">
          <p className="text-xs uppercase tracking-widest text-violet-800">Reviews pending</p>
          <p className="mt-2 font-display text-3xl">{pendingReviews}</p>
          <Link href="/admin/reviews" className="mt-3 inline-block text-sm text-cherry-600">
            Moderate
          </Link>
        </div>
      </div>
    </div>
  )
}
