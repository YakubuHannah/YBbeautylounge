'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

const inputClass =
  'h-12 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-3 text-ink'

type Pricing = {
  delivery_lagos_mainland: number
  delivery_lagos_island: number
  delivery_other_states: number
  free_delivery_threshold: number
}

const FIELDS: { key: keyof Pricing; label: string; help: string }[] = [
  { key: 'delivery_lagos_mainland', label: 'Lagos Mainland (₦)', help: 'Delivery price for Lagos Mainland.' },
  { key: 'delivery_lagos_island', label: 'Lagos Island (₦)', help: 'Delivery price for Lagos Island.' },
  {
    key: 'delivery_other_states',
    label: 'Other states (₦)',
    help: 'One price for every Nigerian state outside Lagos.',
  },
  {
    key: 'free_delivery_threshold',
    label: 'Free delivery from (₦)',
    help: 'Orders at or above this amount pay no delivery fee.',
  },
]

export default function AdminDeliveryPage() {
  // Whole-naira strings while editing; the server stores kobo.
  const [values, setValues] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyKey, setBusyKey] = useState('')

  function apply(p: Pricing) {
    setValues({
      delivery_lagos_mainland: Math.round(p.delivery_lagos_mainland / 100).toString(),
      delivery_lagos_island: Math.round(p.delivery_lagos_island / 100).toString(),
      delivery_other_states: Math.round(p.delivery_other_states / 100).toString(),
      free_delivery_threshold: Math.round(p.free_delivery_threshold / 100).toString(),
    })
  }

  useEffect(() => {
    fetch('/api/admin/delivery')
      .then((r) => r.json())
      .then((p) => {
        if (p && typeof p.delivery_other_states === 'number') apply(p)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function save(key: string) {
    setBusyKey(key)
    setMessage('')
    setError('')
    try {
      const res = await fetch('/api/admin/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value_naira: Number(values[key]) }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Save failed')
        return
      }
      apply(data)
      setMessage('Saved.')
    } finally {
      setBusyKey('')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl">Delivery</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Set the delivery prices. At checkout the customer picks Lagos (Mainland or Island), any
          other state, or International.
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
        <section className="space-y-4 border border-vanilla-400 bg-vanilla-50 p-6">
          {FIELDS.map((f) => (
            <div key={f.key} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <label className="block space-y-1">
                <span className="text-sm font-semibold text-ink">{f.label}</span>
                <span className="block text-xs text-ink-muted">{f.help}</span>
                <input
                  type="number"
                  className={`${inputClass} mt-1`}
                  value={values[f.key] ?? ''}
                  onChange={(e) => setValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
                />
              </label>
              <Button
                type="button"
                variant="secondary"
                loading={busyKey === f.key}
                onClick={() => save(f.key)}
              >
                Save
              </Button>
            </div>
          ))}
          <p className="border-t border-vanilla-400 pt-4 text-sm text-ink-muted">
            <span className="font-semibold text-ink">International:</span> no fixed price. The customer
            is told the price depends on the shipment and is paid directly to the courier.
          </p>
        </section>
      )}
    </div>
  )
}
