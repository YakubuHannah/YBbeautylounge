'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

const inputClass =
  'h-12 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-3 text-ink'

const SECTIONS: {
  title: string
  fields: { key: string; label: string; help: string; placeholder: string }[]
}[] = [
  {
    title: 'Announcement bar',
    fields: [
      {
        key: 'announcement_text',
        label: 'Message',
        help: 'The strip at the very top of the site. A "Shop the collection" link always follows it.',
        placeholder: 'Free delivery on orders from ₦200,000',
      },
    ],
  },
  {
    title: 'WhatsApp',
    fields: [
      {
        key: 'whatsapp_number',
        label: 'Business WhatsApp number',
        help: 'International format, digits only. Used by every WhatsApp button on the site.',
        placeholder: '2349037844700',
      },
    ],
  },
  {
    title: 'Payments',
    fields: [
      {
        key: 'bank_name',
        label: 'Bank',
        help: 'Shown to customers at checkout.',
        placeholder: 'e.g. GTBank',
      },
      {
        key: 'bank_account_name',
        label: 'Account name',
        help: 'Exactly as it appears on the account.',
        placeholder: 'e.g. YB Beauty Lounge',
      },
      {
        key: 'bank_account_number',
        label: 'Account number',
        help: '10 digits. Customers transfer to this account.',
        placeholder: '0123456789',
      },
    ],
  },
  {
    title: 'Notifications',
    fields: [
      {
        key: 'notification_email',
        label: 'Order alerts email',
        help: 'New orders and payment claims are emailed here (requires the email key on Vercel).',
        placeholder: 'you@example.com',
      },
    ],
  },
]

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      if (res.ok) setValues(data.settings)
      setLoading(false)
    }
    load()
  }, [])

  async function save(key: string) {
    setSavingKey(key)
    setMessage('')
    setError('')
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: values[key] ?? '' }),
    })
    const data = await res.json()
    setSavingKey('')
    if (!res.ok) {
      setError(data.error || 'Save failed')
      return
    }
    setValues((prev) => ({ ...prev, [key]: data.setting.value }))
    setMessage('Saved — live across the site now.')
  }

  async function sendTestEmail() {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/admin/settings/test-email', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setTestResult({ ok: true, text: `Sent to ${data.to}. Check the inbox — and the spam/Promotions tabs.` })
      } else {
        setTestResult({ ok: false, text: data.error || 'Test failed.' })
      }
    } catch {
      setTestResult({ ok: false, text: 'Could not reach the server. Try again.' })
    } finally {
      setTesting(false)
    }
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

      {message && <p className="text-sm text-ink">{message}</p>}
      {error && <p className="text-sm text-cherry-700">{error}</p>}

      {SECTIONS.map((section) => (
        <section key={section.title} className="space-y-5 border border-vanilla-400 bg-vanilla-50 p-6">
          <h2 className="font-display text-xl">{section.title}</h2>
          {section.fields.map((field) => (
            <div key={field.key} className="space-y-1">
              <label className="block">
                <span className="text-sm font-semibold text-ink">{field.label}</span>
                <span className="block text-xs text-ink-muted">{field.help}</span>
                <input
                  className={`${inputClass} mt-1`}
                  value={values[field.key] ?? ''}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                  placeholder={field.placeholder}
                />
              </label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={savingKey === field.key}
                onClick={() => save(field.key)}
              >
                Save
              </Button>
            </div>
          ))}
        </section>
      ))}

      <section className="space-y-4 border border-vanilla-400 bg-vanilla-50 p-6">
        <div>
          <h2 className="font-display text-xl">Test order alerts</h2>
          <p className="text-xs text-ink-muted">
            Sends a test email to the notification address above using the exact code that runs when
            an order is placed. Save the email first, then test — no need to place a real order.
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" loading={testing} onClick={sendTestEmail}>
          Send test email
        </Button>
        {testResult && (
          <p className={`text-sm ${testResult.ok ? 'text-ink' : 'text-cherry-700'}`}>
            {testResult.text}
          </p>
        )}
      </section>
    </div>
  )
}
