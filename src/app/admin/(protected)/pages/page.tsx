'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

type LengthRow = { inches: string; sits: string; best: string }
type EditablePage = { slug: string; label: string; content: string; rows?: LengthRow[] }

export default function AdminPagesPage() {
  const [pages, setPages] = useState<EditablePage[]>([])
  const [selected, setSelected] = useState('')
  const [content, setContent] = useState('')
  const [rows, setRows] = useState<LengthRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/pages')
      const data = await res.json()
      if (res.ok) {
        setPages(data.pages)
        if (data.pages.length) {
          setSelected(data.pages[0].slug)
          setContent(data.pages[0].content)
          setRows(data.pages[0].rows || [])
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  function choose(slug: string) {
    const page = pages.find((p) => p.slug === slug)
    setSelected(slug)
    setContent(page?.content || '')
    setRows(page?.rows || [])
    setMessage('')
    setError('')
  }

  function updateRow(index: number, patch: Partial<LengthRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  async function save() {
    setSaving(true)
    setMessage('')
    setError('')
    const payload: { slug: string; content: string; rows?: LengthRow[] } = {
      slug: selected,
      content,
    }
    if (selected === 'length-guide') payload.rows = rows
    const res = await fetch('/api/admin/pages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      setError(data.error || 'Save failed')
      return
    }
    setPages((prev) =>
      prev.map((p) => (p.slug === selected ? { ...p, content, rows: payload.rows } : p))
    )
    setMessage('Saved — live on the site now.')
  }

  if (loading) return <p className="text-ink-muted">Loading pages…</p>

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink">Pages</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Edit the writing on the site. Leave a blank line between paragraphs. Clearing the
          text restores the built-in copy.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {pages.map((p) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => choose(p.slug)}
            className={`rounded-[2px] border px-4 py-2 text-sm ${
              selected === p.slug
                ? 'border-cherry-600 bg-cherry-50 text-ink'
                : 'border-vanilla-400 bg-vanilla-50 text-ink-muted'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <section className="space-y-4 border border-vanilla-400 bg-vanilla-50 p-6">
        <div>
          <p className="text-sm font-semibold text-ink">
            {selected === 'length-guide' ? 'Intro text' : 'Page text'}
          </p>
          <textarea
            className="mt-2 min-h-[200px] w-full rounded-[2px] border border-vanilla-400 bg-vanilla-100 p-4 text-ink"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write the page content here."
          />
        </div>

        {selected === 'length-guide' && (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-ink">Length table</p>
              <p className="text-xs text-ink-muted">
                These rows render as the styled table on the page — Length, where it sits, and
                what it’s best for.
              </p>
            </div>
            <div className="hidden gap-2 text-[11px] font-semibold uppercase tracking-widest text-violet-800 sm:grid sm:grid-cols-[90px_1fr_1fr_60px]">
              <span>Length</span>
              <span>Where it sits</span>
              <span>Best for</span>
              <span />
            </div>
            {rows.map((row, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[90px_1fr_1fr_60px]">
                <input
                  className="h-11 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-100 px-2 text-sm text-ink"
                  value={row.inches}
                  onChange={(e) => updateRow(i, { inches: e.target.value })}
                  aria-label="Length"
                />
                <input
                  className="h-11 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-100 px-2 text-sm text-ink"
                  value={row.sits}
                  onChange={(e) => updateRow(i, { sits: e.target.value })}
                  aria-label="Where it sits"
                />
                <input
                  className="h-11 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-100 px-2 text-sm text-ink"
                  value={row.best}
                  onChange={(e) => updateRow(i, { best: e.target.value })}
                  aria-label="Best for"
                />
                <button
                  type="button"
                  onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-sm font-semibold text-cherry-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setRows((prev) => [...prev, { inches: '', sits: '', best: '' }])}
            >
              Add row
            </Button>
          </div>
        )}

        {message && <p className="text-sm text-ink">{message}</p>}
        {error && <p className="text-sm text-cherry-700">{error}</p>}
        <Button type="button" variant="primary" loading={saving} onClick={save}>
          Save page
        </Button>
      </section>
    </div>
  )
}
