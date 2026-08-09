'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ReviewCta } from '@/components/reviews/review-cta'
import { formatNaira } from '@/lib/money'

type Item = { name: string; detail: string | null; quantity: number; slug: string | null }
type Installment = {
  order_id: string
  order_number: string
  total: number
  amount_paid: number
  balance: number
  next_payment: number
  payment_status: string
  items: Item[]
}
type Data = {
  bank: { bank_name: string; account_name: string; account_number: string }
  installments: Installment[]
}

export default function MyInstallmentsPage() {
  const [phone, setPhone] = useState('')
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [receipts, setReceipts] = useState<Record<string, File | null>>({})
  const [sentIds, setSentIds] = useState<string[]>([])
  const [payingId, setPayingId] = useState('')

  async function lookup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setData(null)
    try {
      const res = await fetch(`/api/my-installments?phone=${encodeURIComponent(phone)}`)
      const d = await res.json()
      if (!res.ok) {
        setError(d.error || 'Could not find your installments.')
        return
      }
      setData(d)
    } catch {
      setError('Something went wrong — please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function payInstallment(orderId: string) {
    const file = receipts[orderId]
    if (!file) {
      setError('Attach a screenshot of your transfer receipt first.')
      return
    }
    setPayingId(orderId)
    setError('')
    try {
      const form = new FormData()
      form.append('screenshot', file)
      const res = await fetch(`/api/orders/${orderId}/payment`, { method: 'POST', body: form })
      const d = await res.json()
      if (!res.ok) {
        setError(d.error || 'Could not send your receipt — please try again.')
        return
      }
      setSentIds((s) => [...s, orderId])
    } catch {
      setError('Something went wrong — please try again.')
    } finally {
      setPayingId('')
    }
  }

  const bankReady = data?.bank.account_number && data?.bank.account_name

  return (
    <main className="mx-auto max-w-2xl px-5 py-16 md:px-12">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">Payments</p>
      <h1 className="mt-2 font-display text-4xl text-ink">My installments</h1>
      <p className="mt-3 text-ink-muted">
        Enter the phone number you used at checkout to see the pieces you are still paying for and
        pay your next installment.
      </p>

      <form className="mt-8 flex flex-col gap-3 sm:flex-row" onSubmit={lookup}>
        <input
          required
          type="tel"
          placeholder="WhatsApp phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-12 flex-1 rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-3"
        />
        <Button type="submit" variant="primary" className="h-12 px-8" loading={loading}>
          Find
        </Button>
      </form>
      <p className="mt-2 text-xs text-ink-muted">
        Use the same phone number you entered at checkout when you placed the order.
      </p>

      {error && <p className="mt-4 text-sm text-cherry-700">{error}</p>}

      {data && data.installments.length === 0 && (
        <p className="mt-10 text-ink-muted">
          No open installments for this number. If you checked out with a different phone, try that
          number.
        </p>
      )}

      {data && data.installments.length > 0 && (
        <div className="mt-10 space-y-6">
          {data.installments.map((it) => {
            const paidPct = Math.min(100, Math.round((it.amount_paid / it.total) * 100))
            const sent = sentIds.includes(it.order_id)
            return (
              <div key={it.order_id} className="border border-vanilla-400 bg-vanilla-50 p-6">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
                  Order {it.order_number}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-ink">
                  {it.items.map((line, i) => {
                    const label = `${line.name}${line.detail ? ` · ${line.detail}` : ''}${
                      line.quantity > 1 ? ` ×${line.quantity}` : ''
                    }`
                    return (
                      <li key={i}>
                        {line.slug ? (
                          <Link
                            href={`/shop/${line.slug}`}
                            className="text-ink underline decoration-vanilla-400 underline-offset-2 hover:text-cherry-700"
                          >
                            {label}
                          </Link>
                        ) : (
                          label
                        )}
                      </li>
                    )
                  })}
                </ul>

                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-vanilla-200">
                  <div className="h-full bg-violet-800" style={{ width: `${paidPct}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-ink-muted">Paid {formatNaira(it.amount_paid)}</span>
                  <span className="font-semibold text-ink">Balance {formatNaira(it.balance)}</span>
                </div>

                {sent ? (
                  <p className="mt-5 rounded-[2px] bg-vanilla-200 px-4 py-3 text-sm text-ink">
                    Payment sent. We’ll confirm it and update your balance — usually within
                    5–10 minutes.
                  </p>
                ) : (
                  <div className="mt-5 border-t border-vanilla-400 pt-5">
                    <p className="text-sm">
                      Next installment:{' '}
                      <span className="font-semibold tabular-nums text-cherry-600">
                        {formatNaira(it.next_payment)}
                      </span>
                    </p>
                    {bankReady ? (
                      <div className="mt-3 text-sm text-ink-muted">
                        Transfer to{' '}
                        <span className="font-semibold text-ink">{data.bank.account_number}</span> ·{' '}
                        {data.bank.account_name} · {data.bank.bank_name}. Include{' '}
                        <span className="font-semibold text-ink">{it.order_number}</span> in the
                        narration.
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-ink-muted">
                        Message us on WhatsApp for the account details.
                      </p>
                    )}
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) =>
                        setReceipts((r) => ({ ...r, [it.order_id]: e.target.files?.[0] || null }))
                      }
                      className="mt-3 block w-full text-sm"
                      aria-label={`Receipt for ${it.order_number}`}
                    />
                    <Button
                      type="button"
                      variant="primary"
                      className="mt-3 h-12 w-full"
                      loading={payingId === it.order_id}
                      onClick={() => payInstallment(it.order_id)}
                    >
                      I have paid this installment
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {data && <ReviewCta />}
    </main>
  )
}
