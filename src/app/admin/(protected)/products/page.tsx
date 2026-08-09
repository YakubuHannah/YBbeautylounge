'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { formatNaira } from '@/lib/money'

type Product = {
  id: string
  name: string
  slug: string
  status: string
  variants: { price: number; stock_quantity: number }[]
}

function ProductsList() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState('')
  const showSaved = searchParams.get('saved') === '1'

  useEffect(() => {
    fetch('/api/admin/products')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setProducts(data.products || [])
      })
      .finally(() => setLoading(false))
  }, [])

  async function remove(id: string, name: string) {
    const typed = prompt(
      `Type DELETE to remove "${name}". It leaves the shop (blocked if a customer is still paying for it on installment).`
    )
    if (typed !== 'DELETE') return
    setDeletingId(id)
    setError('')
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    const data = await res.json()
    setDeletingId('')
    if (!res.ok) {
      setError(data.error || 'Could not delete this product.')
      return
    }
    setProducts((ps) => ps.filter((p) => p.id !== id))
  }

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

      {showSaved && (
        <p className="mt-4 rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-4 py-3 text-sm font-medium text-ink">
          Product saved successfully.
        </p>
      )}

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
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="font-semibold text-cherry-600"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => remove(p.id, p.name)}
                          disabled={deletingId === p.id}
                          aria-label={`Delete ${p.name}`}
                          title="Delete product"
                          className="text-ink-muted hover:text-cherry-600 disabled:opacity-50"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            aria-hidden="true"
                            className="h-4 w-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4 7h16M9 7V5h6v2m-8 0v12a1 1 0 001 1h8a1 1 0 001-1V7M10 11v6M14 11v6"
                            />
                          </svg>
                        </button>
                      </div>
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

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<p className="text-ink-muted">Loading…</p>}>
      <ProductsList />
    </Suspense>
  )
}
