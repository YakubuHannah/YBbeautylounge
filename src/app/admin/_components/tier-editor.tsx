'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

type Tier = {
  id?: string
  name: string
  description: string | null
  starting_price: number
  is_active: boolean
}

const inputClass =
  'h-11 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-100 px-3 text-sm text-ink'

export function TierEditor() {
  const [tiers, setTiers] = useState<Tier[]>([])
  const [draft, setDraft] = useState({ name: '', description: '', price_naira: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const res = await fetch('/api/admin/restoration-tiers')
    const data = await res.json()
    if (res.ok) setTiers(data.tiers)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function save(payload: {
    id?: string
    name: string
    description: string | null
    price_naira: number
    is_active?: boolean
  }) {
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/restoration-tiers', {
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
    setDraft({ name: '', description: '', price_naira: '' })
    load()
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this tier?')) return
    setError('')
    const res = await fetch('/api/admin/restoration-tiers', {
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

  function updateTier(id: string, patch: Partial<Tier>) {
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  if (loading) return <p className="text-sm text-ink-muted">Loading service tiers…</p>

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-ink">Service tiers</p>
        <p className="text-xs text-ink-muted">
          The cards on the wig revamp page. Price is in naira — leave it at 0 to show “Quote on
          review”. Saved changes go live immediately.
        </p>
      </div>

      {error && <p className="text-sm text-cherry-700">{error}</p>}

      {tiers.map((t) => (
        <div key={t.id} className="space-y-3 border border-vanilla-400 bg-vanilla-100 p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
            <input
              className={inputClass}
              value={t.name}
              onChange={(e) => updateTier(t.id!, { name: e.target.value })}
              aria-label="Tier name"
            />
            <input
              className={inputClass}
              type="number"
              min={0}
              value={Math.round(t.starting_price / 100)}
              onChange={(e) =>
                updateTier(t.id!, { starting_price: Number(e.target.value || 0) * 100 })
              }
              aria-label="Starting price in naira"
            />
          </div>
          <textarea
            className="min-h-16 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 p-3 text-sm text-ink"
            value={t.description || ''}
            onChange={(e) => updateTier(t.id!, { description: e.target.value })}
            aria-label="Tier description"
          />
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={t.is_active}
                onChange={(e) => updateTier(t.id!, { is_active: e.target.checked })}
              />
              Visible on the site
            </label>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={saving}
              onClick={() =>
                save({
                  id: t.id,
                  name: t.name,
                  description: t.description,
                  price_naira: Math.round(t.starting_price / 100),
                  is_active: t.is_active,
                })
              }
            >
              Save tier
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={() => remove(t.id!)}>
              Delete
            </Button>
          </div>
        </div>
      ))}

      <div className="space-y-3 border border-dashed border-vanilla-400 p-4">
        <p className="text-sm font-semibold text-ink">Add a tier</p>
        <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
          <input
            className={inputClass}
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Name — e.g. Basic revamp"
          />
          <input
            className={inputClass}
            type="number"
            min={0}
            value={draft.price_naira}
            onChange={(e) => setDraft({ ...draft, price_naira: e.target.value })}
            placeholder="From ₦ (0 = quote)"
            aria-label="Starting price in naira"
          />
        </div>
        <textarea
          className="min-h-16 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 p-3 text-sm text-ink"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          placeholder="Short description shown on the card"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={saving}
          onClick={() =>
            save({
              name: draft.name,
              description: draft.description || null,
              price_naira: Number(draft.price_naira || 0),
            })
          }
        >
          Add tier
        </Button>
      </div>
    </div>
  )
}
