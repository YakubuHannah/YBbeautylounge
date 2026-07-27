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

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/products')
    const data = await res.json()
    if (!res.ok) setError(data.error || 'Failed')
    else setProducts(data.products || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function createQuick() {
    const name = window.prompt('Product name')
    if (!name) return
    const price = window.prompt('Starting price in naira (e.g. 185000)', '185000')
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        status: 'draft',
        texture: 'bone_straight',
        variants: [
          {
            sku: `${name.slice(0, 8)}-16`.replace(/\s/g, ''),
            length_inches: 16,
            colorway: 'Natural black',
            density_percent: 150,
            price: Number(price || 185000),
            cost_price: 85000,
            stock_quantity: 5,
          },
        ],
      }),
    })
    if (res.ok) load()
    else {
      const d = await res.json()
      alert(d.error || 'Create failed')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Products</h1>
          <p className="mt-1 text-sm text-ink-muted">Set names, prices (naira), stock, and images.</p>
        </div>
        <Button type="button" variant="primary" onClick={createQuick}>
          New product
        </Button>
      </div>

      {error && <p className="mt-4 text-cherry-700">{error}</p>}
      {loading ? (
        <p className="mt-8 text-ink-muted">Loading…</p>
      ) : (
        <div className="mt-8 overflow-x-auto border border-vanilla-400">
          <table className="w-full text-left text-sm">
            <thead className="bg-vanilla-200 text-[11px] uppercase tracking-widest text-violet-800">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Status</th>
                <th className="p-3">From</th>
                <th className="p-3">Stock</th>
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
                  <tr key={p.id} className="border-t border-vanilla-400">
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3">{p.status}</td>
                    <td className="p-3 tabular-nums">{formatNaira(min)}</td>
                    <td className="p-3">{stock}</td>
                    <td className="p-3 text-right">
                      <Link href={`/admin/products/${p.id}`} className="text-cherry-600">
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
