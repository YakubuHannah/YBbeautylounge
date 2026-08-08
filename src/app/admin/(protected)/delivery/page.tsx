'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

const inputClass =
  'h-12 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-3 text-ink'

type Zone = { id: string; name: string; fee: number; estimated_days: string }
// Editable rows use whole-naira strings; the server converts to kobo.
type ZoneDraft = { id: string; name: string; fee_naira: string; estimated_days: string }

function toDraft(z: Zone): ZoneDraft {
  return { id: z.id, name: z.name, fee_naira: Math.round(z.fee / 100).toString(), estimated_days: z.estimated_days }
}

export default function AdminDeliveryPage() {
  const [zones, setZones] = useState<ZoneDraft[]>([])
  const [threshold, setThreshold] = useState('')
  const [newZone, setNewZone] = useState({ name: '', fee_naira: '', estimated_days: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  function apply(data: { zones: Zone[]; free_delivery_threshold: number }) {
    setZones((data.zones || []).map(toDraft))
    setThreshold(Math.round((data.free_delivery_threshold || 0) / 100).toString())
  }

  useEffect(() => {
    fetch('/api/admin/delivery')
      .then((r) => r.json())
      .then((d) => {
        if (d.zones) apply(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function send(payload: Record<string, unknown>) {
    setBusy(true)
    setMessage('')
    setError('')
    try {
      const res = await fetch('/api/admin/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Save failed')
        return false
      }
      apply(data)
      setMessage('Saved.')
      return true
    } finally {
      setBusy(false)
    }
  }

  function updateZone(i: number, patch: Partial<ZoneDraft>) {
    setZones((prev) => prev.map((z, idx) => (idx === i ? { ...z, ...patch } : z)))
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl">Delivery</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Set the delivery price for each location and the order value that earns free delivery.
          Customers pick their location at checkout.
        </p>
      </div>

      {message && (
        <p className="rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-4 py-3 text-sm text-ink">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-[2px] border border-cherry-200 bg-cherry-50 px-4 py-3 text-sm text-cherry-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : (
        <>
          <section className="space-y-4 border border-vanilla-400 bg-vanilla-50 p-6">
            <h2 className="font-display text-xl">Free delivery</h2>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-ink">Free delivery from (₦)</span>
              <span className="block text-xs text-ink-muted">
                Orders at or above this amount pay no delivery fee. Whole naira.
              </span>
              <input
                type="number"
                className={`${inputClass} mt-1`}
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </label>
            <Button
              type="button"
              variant="secondary"
              loading={busy}
              onClick={() => send({ action: 'set_threshold', threshold_naira: Number(threshold) })}
            >
              Save threshold
            </Button>
          </section>

          <section className="space-y-4 border border-vanilla-400 bg-vanilla-50 p-6">
            <h2 className="font-display text-xl">Locations</h2>
            {zones.length === 0 && (
              <p className="text-sm text-ink-muted">No locations yet. Add one below.</p>
            )}
            {zones.map((z, i) => (
              <div key={z.id} className="grid gap-3 border border-vanilla-400 p-4 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-ink">Location</span>
                  <input className={inputClass} value={z.name} onChange={(e) => updateZone(i, { name: e.target.value })} />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-ink">Price (₦)</span>
                  <input
                    type="number"
                    className={inputClass}
                    value={z.fee_naira}
                    onChange={(e) => updateZone(i, { fee_naira: e.target.value })}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-ink">Est. days</span>
                  <input
                    className={inputClass}
                    value={z.estimated_days}
                    onChange={(e) => updateZone(i, { estimated_days: e.target.value })}
                    placeholder="e.g. 1-2"
                  />
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    loading={busy}
                    onClick={() =>
                      send({
                        action: 'update_zone',
                        id: z.id,
                        name: z.name,
                        fee_naira: Number(z.fee_naira),
                        estimated_days: z.estimated_days,
                      })
                    }
                  >
                    Save
                  </Button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => send({ action: 'delete_zone', id: z.id })}
                    className="text-sm font-semibold text-cherry-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="grid gap-3 border border-dashed border-vanilla-400 p-4 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
              <label className="block space-y-1">
                <span className="text-sm font-semibold text-ink">New location</span>
                <input
                  className={inputClass}
                  value={newZone.name}
                  onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                  placeholder="e.g. Lagos Island"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-semibold text-ink">Price (₦)</span>
                <input
                  type="number"
                  className={inputClass}
                  value={newZone.fee_naira}
                  onChange={(e) => setNewZone({ ...newZone, fee_naira: e.target.value })}
                  placeholder="e.g. 4500"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-semibold text-ink">Est. days</span>
                <input
                  className={inputClass}
                  value={newZone.estimated_days}
                  onChange={(e) => setNewZone({ ...newZone, estimated_days: e.target.value })}
                  placeholder="e.g. 1-2"
                />
              </label>
              <Button
                type="button"
                variant="secondary"
                loading={busy}
                onClick={async () => {
                  const ok = await send({
                    action: 'create_zone',
                    name: newZone.name,
                    fee_naira: Number(newZone.fee_naira),
                    estimated_days: newZone.estimated_days,
                  })
                  if (ok) setNewZone({ name: '', fee_naira: '', estimated_days: '' })
                }}
              >
                Add
              </Button>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
