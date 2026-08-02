'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

type Category = {
  id: string
  name: string
  slug: string
  sort_order: number
  is_active: boolean
  product_count: number
}

const inputClass =
  'h-11 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-100 px-3 text-sm text-ink'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [draftName, setDraftName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const res = await fetch('/api/admin/categories')
    const data = await res.json()
    if (res.ok) setCategories(data.categories)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function save(payload: {
    id?: string
    name: string
    sort_order?: number
    is_active?: boolean
  }) {
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save', ...payload }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      setError(data.error || 'Save failed')
      return
    }
    setDraftName('')
    load()
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this category?')) return
    setError('')
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Delete failed')
      return
    }
    load()
  }

  function update(id: string, patch: Partial<Category>) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }

  if (loading) return <p className="text-ink-muted">Loading categories…</p>

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink">Categories</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Group products — hair, accessories, anything you sell. Assign each product to a
          category on its edit screen. Customers filter the shop by these, and checkout
          recommendations come from other categories.
        </p>
      </div>

      {error && <p className="text-sm text-cherry-700">{error}</p>}

      <section className="flex gap-3 border border-vanilla-400 bg-vanilla-50 p-6">
        <input
          className={inputClass}
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          placeholder="New category name — e.g. Edges & glue"
        />
        <Button
          type="button"
          variant="primary"
          loading={saving}
          onClick={() => save({ name: draftName })}
        >
          Add
        </Button>
      </section>

      <section className="space-y-4">
        {categories.map((c) => (
          <div key={c.id} className="space-y-3 border border-vanilla-400 bg-vanilla-50 p-5">
            <div className="grid gap-3 sm:grid-cols-[1fr_100px]">
              <input
                className={inputClass}
                value={c.name}
                onChange={(e) => update(c.id, { name: e.target.value })}
                aria-label="Category name"
              />
              <input
                className={inputClass}
                type="number"
                value={c.sort_order}
                onChange={(e) => update(c.id, { sort_order: Number(e.target.value) })}
                aria-label="Order"
              />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="text-xs text-ink-muted">
                {c.product_count} product{c.product_count === 1 ? '' : 's'}
              </span>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={c.is_active}
                  onChange={(e) => update(c.id, { is_active: e.target.checked })}
                />
                Visible on the site
              </label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={saving}
                onClick={() =>
                  save({ id: c.id, name: c.name, sort_order: c.sort_order, is_active: c.is_active })
                }
              >
                Save
              </Button>
              <Button type="button" variant="destructive" size="sm" onClick={() => remove(c.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
