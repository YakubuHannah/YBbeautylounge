'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

type Faq = {
  id?: string
  question: string
  answer: string
  category: string
  sort_order: number
  is_active: boolean
}

const inputClass =
  'h-11 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-100 px-3 text-sm text-ink'

const EMPTY: Faq = { question: '', answer: '', category: '', sort_order: 0, is_active: true }

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [draft, setDraft] = useState<Faq>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const res = await fetch('/api/admin/faqs')
    const data = await res.json()
    if (res.ok) setFaqs(data.faqs)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function save(faq: Faq) {
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/faqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save', ...faq }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      setError(data.error || 'Save failed')
      return
    }
    setDraft(EMPTY)
    load()
  }

  async function remove(id: string) {
    setError('')
    const res = await fetch('/api/admin/faqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    })
    if (res.ok) load()
  }

  function updateRow(id: string, patch: Partial<Faq>) {
    setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }

  if (loading) return <p className="text-ink-muted">Loading FAQ…</p>

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink">FAQ</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Questions appear on the FAQ page grouped by category, ordered by the order number.
        </p>
      </div>

      <section className="space-y-3 border border-vanilla-400 bg-vanilla-50 p-6">
        <h2 className="font-display text-xl">Add a question</h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
          <input
            className={inputClass}
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            placeholder="Category — e.g. Delivery"
          />
          <input
            className={inputClass}
            type="number"
            value={draft.sort_order}
            onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
            aria-label="Order"
          />
        </div>
        <input
          className={inputClass}
          value={draft.question}
          onChange={(e) => setDraft({ ...draft, question: e.target.value })}
          placeholder="Question"
        />
        <textarea
          className="min-h-24 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-100 p-3 text-sm text-ink"
          value={draft.answer}
          onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
          placeholder="Answer"
        />
        {error && <p className="text-sm text-cherry-700">{error}</p>}
        <Button type="button" variant="primary" loading={saving} onClick={() => save(draft)}>
          Add question
        </Button>
      </section>

      <section className="space-y-6">
        {faqs.map((f) => (
          <div key={f.id} className="space-y-3 border border-vanilla-400 bg-vanilla-50 p-6">
            <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
              <input
                className={inputClass}
                value={f.category}
                onChange={(e) => updateRow(f.id!, { category: e.target.value })}
              />
              <input
                className={inputClass}
                type="number"
                value={f.sort_order}
                onChange={(e) => updateRow(f.id!, { sort_order: Number(e.target.value) })}
                aria-label="Order"
              />
            </div>
            <input
              className={inputClass}
              value={f.question}
              onChange={(e) => updateRow(f.id!, { question: e.target.value })}
            />
            <textarea
              className="min-h-20 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-100 p-3 text-sm text-ink"
              value={f.answer}
              onChange={(e) => updateRow(f.id!, { answer: e.target.value })}
            />
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={f.is_active}
                  onChange={(e) => updateRow(f.id!, { is_active: e.target.checked })}
                />
                Visible on the site
              </label>
              <Button type="button" variant="secondary" size="sm" onClick={() => save(f)}>
                Save
              </Button>
              <Button type="button" variant="destructive" size="sm" onClick={() => remove(f.id!)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
