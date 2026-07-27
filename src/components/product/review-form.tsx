'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'

const inputClass =
  'h-12 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-3 text-ink'

export function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    setSending(true)
    setError('')
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: productId,
        rating,
        title,
        body,
        display_name: displayName,
      }),
    })
    const data = await res.json()
    setSending(false)
    if (!res.ok) {
      setError(data.error || 'Could not send your review. Please try again.')
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <p className="mt-8 border border-vanilla-400 bg-vanilla-50 p-4 text-sm text-ink">
        Thank you — your review has been sent and will appear once approved.
      </p>
    )
  }

  return (
    <div className="mt-10 max-w-xl space-y-4">
      <h3 className="font-display text-xl text-ink">Share your experience</h3>
      <div>
        <p className="text-sm font-semibold text-ink">Rating</p>
        <div className="mt-2 flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              className={`h-10 w-10 rounded-[2px] border text-sm font-semibold ${
                n <= rating
                  ? 'border-cherry-600 bg-cherry-50 text-ink'
                  : 'border-vanilla-400 bg-vanilla-50 text-ink-muted'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <input
        className={inputClass}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        maxLength={120}
      />
      <textarea
        className="min-h-28 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 p-3 text-ink"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="How was the unit? Fit, feel, delivery…"
        maxLength={2000}
        rows={4}
      />
      <input
        className={inputClass}
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Your name (shown with the review)"
        maxLength={60}
      />
      {error && <p className="text-sm text-cherry-700">{error}</p>}
      <Button
        type="button"
        variant="secondary"
        className="h-12 px-8"
        loading={sending}
        onClick={submit}
      >
        Send review
      </Button>
    </div>
  )
}
