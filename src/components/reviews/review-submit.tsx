'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'

const inputClass =
  'h-12 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-3 text-ink'

export function ReviewSubmit({ products }: { products: { id: string; name: string }[] }) {
  const [productId, setProductId] = useState('')
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  function onFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files || []).slice(0, 3)
    setFiles(picked)
    setError('')
  }

  async function submit() {
    if (!productId) {
      setError('Choose the product you bought.')
      return
    }
    setSending(true)
    setError('')
    const form = new FormData()
    form.append('product_id', productId)
    form.append('rating', String(rating))
    form.append('title', title)
    form.append('body', body)
    form.append('display_name', displayName)
    files.forEach((f) => form.append('media', f))
    const res = await fetch('/api/reviews', { method: 'POST', body: form })
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
      <p className="border border-vanilla-400 bg-vanilla-50 p-4 text-sm text-ink">
        Thank you — your review has been sent and will appear once approved.
      </p>
    )
  }

  return (
    <div className="max-w-xl space-y-4">
      <select
        className={inputClass}
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
      >
        <option value="">Which piece are you reviewing?</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
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
        placeholder="How is the unit holding up? Fit, feel, styling…"
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
      <div>
        <p className="text-sm font-semibold text-ink">Photos or videos</p>
        <p className="text-xs text-ink-muted">
          Up to 3 files — show how the unit looks on you, even months in.
        </p>
        <input
          type="file"
          accept="image/*,video/mp4,video/quicktime,video/webm"
          multiple
          onChange={onFilePick}
          className="mt-2 block w-full text-sm"
        />
        {files.length > 0 && (
          <p className="mt-1 text-xs text-ink-muted">
            {files.length} file{files.length > 1 ? 's' : ''} attached
          </p>
        )}
      </div>
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
