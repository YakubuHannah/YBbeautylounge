'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

import { Button } from '@/components/ui/button'

export default function ReviewSubmitPage() {
  const { token } = useParams<{ token: string }>()
  const [productName, setProductName] = useState('')
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetch(`/api/reviews/submit/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error)
        else setProductName(d.product?.name || '')
      })
  }, [token])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await fetch(`/api/reviews/submit/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating,
        title,
        body,
        display_name: displayName,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Failed')
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <main className="mx-auto max-w-md px-5 py-16 text-center">
        <h1 className="font-display text-3xl text-ink">Thank you</h1>
        <p className="mt-3 text-ink-muted">
          Your review is with us for approval and will appear once moderated.
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-md px-5 py-16">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">Review</p>
      <h1 className="mt-2 font-display text-3xl text-ink">{productName || 'Your purchase'}</h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block text-sm">
          Rating
          <select
            className="mt-1 h-12 w-full border border-vanilla-400 bg-vanilla-50 px-3"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} stars
              </option>
            ))}
          </select>
        </label>
        <input
          required
          className="h-12 w-full border border-vanilla-400 bg-vanilla-50 px-3"
          placeholder="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <input
          className="h-12 w-full border border-vanilla-400 bg-vanilla-50 px-3"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full border border-vanilla-400 bg-vanilla-50 px-3 py-3"
          rows={4}
          placeholder="Your experience"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        {error && <p className="text-sm text-cherry-700">{error}</p>}
        <Button type="submit" variant="primary" className="h-12 w-full">
          Submit review
        </Button>
      </form>
    </main>
  )
}
