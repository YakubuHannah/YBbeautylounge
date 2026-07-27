'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

type Review = {
  id: string
  rating: number
  title: string | null
  body: string | null
  display_name: string
  status: string
  product: { id: string; name: string; slug: string }
}

type Product = { id: string; name: string }

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [productId, setProductId] = useState('')
  const [inviteUrl, setInviteUrl] = useState('')
  const [message, setMessage] = useState('')

  async function load() {
    const [r, p] = await Promise.all([
      fetch('/api/admin/reviews'),
      fetch('/api/admin/products'),
    ])
    const rd = await r.json()
    const pd = await p.json()
    if (r.ok) setReviews(rd.reviews || [])
    if (p.ok) {
      setProducts((pd.products || []).map((x: { id: string; name: string }) => ({ id: x.id, name: x.name })))
      if (!productId && pd.products?.[0]) setProductId(pd.products[0].id)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function createInvite() {
    setMessage('')
    const res = await fetch('/api/admin/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'invite', product_id: productId }),
    })
    const data = await res.json()
    if (!res.ok) {
      setMessage(data.error || 'Failed')
      return
    }
    setInviteUrl(data.submit_url)
    load()
  }

  async function moderate(id: string, status: 'approved' | 'rejected') {
    await fetch('/api/admin/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'moderate', review_id: id, status }),
    })
    load()
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Reviews</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Create an invite link, customer submits, you approve. Approved reviews update product ratings.
      </p>

      <div className="mt-8 flex flex-col gap-3 border border-vanilla-400 bg-vanilla-50 p-5 sm:flex-row">
        <select
          className="h-12 flex-1 border border-vanilla-400 bg-vanilla-50 px-3"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <Button type="button" variant="primary" onClick={createInvite}>
          Create invite link
        </Button>
      </div>
      {inviteUrl && (
        <p className="mt-3 break-all text-sm text-cherry-600">
          Share this link: {inviteUrl}
        </p>
      )}
      {message && <p className="mt-2 text-sm text-cherry-700">{message}</p>}

      <ul className="mt-10 space-y-4">
        {reviews.map((r) => (
          <li key={r.id} className="border border-vanilla-400 bg-vanilla-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-violet-800">{r.status}</p>
                <p className="font-medium text-ink">{r.product.name}</p>
                {r.status !== 'invite' && (
                  <>
                    <p className="mt-1 text-sm">
                      {r.rating}/5 · {r.display_name || '—'}
                    </p>
                    {r.title && <p className="mt-1 font-semibold">{r.title}</p>}
                    {r.body && <p className="mt-1 text-sm text-ink-muted">{r.body}</p>}
                  </>
                )}
                {r.status === 'invite' && (
                  <p className="mt-1 text-sm text-ink-muted">Invite waiting for customer</p>
                )}
              </div>
              {r.status === 'pending' && (
                <div className="flex gap-2">
                  <Button type="button" variant="primary" onClick={() => moderate(r.id, 'approved')}>
                    Approve
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => moderate(r.id, 'rejected')}>
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
