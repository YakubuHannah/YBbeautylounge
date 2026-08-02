'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

const inputClass =
  'h-12 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-3 text-ink'

export default function AdminSettingsPage() {
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      if (res.ok) setWhatsapp(data.settings.whatsapp_number || '')
      setLoading(false)
    }
    load()
  }, [])

  async function save() {
    setSaving(true)
    setMessage('')
    setError('')
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'whatsapp_number', value: whatsapp }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      setError(data.error || 'Save failed')
      return
    }
    setWhatsapp(data.setting.value)
    setMessage('Saved. Every WhatsApp button on the site now uses this number.')
  }

  if (loading) return <p className="text-ink-muted">Loading settings…</p>

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink">Settings</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Values here apply across the whole site as soon as you save.
        </p>
      </div>

      <section className="space-y-4 border border-vanilla-400 bg-vanilla-50 p-6">
        <h2 className="font-display text-xl">WhatsApp</h2>
        <label className="block space-y-1">
          <span className="text-sm font-semibold text-ink">Business WhatsApp number</span>
          <span className="block text-xs text-ink-muted">
            International format, digits only — e.g. 2349037844700. Used by the floating
            button, footer, product pages, checkout, and contact page.
          </span>
          <input
            className={`${inputClass} mt-1`}
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="2349037844700"
            inputMode="numeric"
          />
        </label>
        {message && <p className="text-sm text-ink">{message}</p>}
        {error && <p className="text-sm text-cherry-700">{error}</p>}
        <Button type="button" variant="primary" loading={saving} onClick={save}>
          Save settings
        </Button>
      </section>
    </div>
  )
}
