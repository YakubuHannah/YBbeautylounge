'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

type EditablePage = { slug: string; label: string; content: string }

export default function AdminPagesPage() {
  const [pages, setPages] = useState<EditablePage[]>([])
  const [selected, setSelected] = useState('')
  const [content, setContent] = useState('')
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
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  function choose(slug: string) {
    setSelected(slug)
    setContent(pages.find((p) => p.slug === slug)?.content || '')
    setMessage('')
    setError('')
  }

  async function save() {
    setSaving(true)
    setMessage('')
    setError('')
    const res = await fetch('/api/admin/pages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: selected, content }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      setError(data.error || 'Save failed')
      return
    }
    setPages((prev) => prev.map((p) => (p.slug === selected ? { ...p, content } : p)))
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
        <textarea
          className="min-h-[320px] w-full rounded-[2px] border border-vanilla-400 bg-vanilla-100 p-4 text-ink"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write the page content here. This replaces the built-in copy once saved."
        />
        {message && <p className="text-sm text-ink">{message}</p>}
        {error && <p className="text-sm text-cherry-700">{error}</p>}
        <Button type="button" variant="primary" loading={saving} onClick={save}>
          Save page
        </Button>
      </section>
    </div>
  )
}
