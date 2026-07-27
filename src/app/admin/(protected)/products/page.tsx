'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatNaira } from '@/lib/money'

type Product = {
  id: string
  name: string
  slug: string
  status: string
  variants: { price: number; stock_quantity: number }[]
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/products')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setProducts(data.products || [])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Products</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Create a product, set prices and stock, then attach photos.
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button type="button" variant="primary">
            New product
          </Button>
        </Link>
      </div>

      {error && <p className="mt-4 text-cherry-700">{error}</p>}
      {loading ? (
        <p className="mt-8 text-ink-muted">Loading…</p>
      ) : products.length === 0 ? (
        <p className="mt-8 text-ink-muted">No products yet. Create your first one.</p>
      ) : (
        <div className="mt-8 overflow-x-auto border border-vanilla-400">
          <table className="w-full text-left text-sm">
            <thead className="bg-vanilla-200 text-[11px] uppercase tracking-widest text-violet-800">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Status</th>
                <th className="p-3">From price</th>
                <th className="p-3">Total stock</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const min = p.variants.length
                  ? Math.min(...p.variants.map((v) => v.price))
                  : 0
                const stock = p.variants.reduce((n, v) => n + v.stock_quantity, 0)
                return (
                  <tr key={p.id} className="border-t border-vanilla-400 bg-vanilla-50">
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3 capitalize">{p.status}</td>
                    <td className="p-3 tabular-nums">{formatNaira(min)}</td>
                    <td className="p-3">{stock}</td>
                    <td className="p-3 text-right">
                      <Link href={`/admin/products/${p.id}`} className="font-semibold text-cherry-600">
                        Edit
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
