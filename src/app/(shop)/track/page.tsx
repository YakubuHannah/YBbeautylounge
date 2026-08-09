'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ReviewCta } from '@/components/reviews/review-cta'
import { formatNaira } from '@/lib/money'

type Item = { name: string; detail: string | null; quantity: number }
type Tracked = {
  order_id: string
  order_number: string
  payment_status: string
  fulfillment_status: string
  total: number
  amount_paid: number
  balance: number
  due_now: number
  bank: { bank_name: string; account_name: string; account_number: string }
  courier_name: string | null
  tracking_number: string | null
  items: Item[]
}

const STEPS: { key: string; label: string; note: string }[] = [
  { key: 'placed', label: 'Order placed', note: 'We have your order.' },
  { key: 'paid', label: 'Payment confirmed', note: 'Your payment is confirmed.' },
  { key: 'processing', label: 'Processing', note: 'Your unit is being prepared.' },
  { key: 'shipped', label: 'Shipped', note: 'On its way to you.' },
  { key: 'delivered', label: 'Delivered', note: 'Enjoy your hair.' },
]

function isDone(key: string, o: Tracked): boolean {
  switch (key) {
    case 'placed':
      return true
    case 'paid':
      return ['partially_paid', 'paid'].includes(o.payment_status)
    case 'processing':
      return ['processing', 'shipped', 'delivered'].includes(o.fulfillment_status)
    case 'shipped':
      return ['shipped', 'delivered'].includes(o.fulfillment_status)
    case 'delivered':
      return o.fulfillment_status === 'delivered'
    default:
      return false
  }
}

export default function TrackPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [order, setOrder] = useState<Tracked | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [receipt, setReceipt] = useState<File | null>(null)
  const [paying, setPaying] = useState(false)
  const [sent, setSent] = useState(false)

  async function track(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOrder(null)
    setReceipt(null)
    setSent(false)
    try {
      const res = await fetch(
        `/api/track?order=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`
      )
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not find your order.')
        return
      }
      setOrder(data)
    } catch {
      setError('Something went wrong — please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function pay() {
    if (!order || !receipt) {
      setError('Attach a screenshot of your transfer receipt first.')
      return
    }
    setPaying(true)
    setError('')
    try {
      const form = new FormData()
      form.append('screenshot', receipt)
      const res = await fetch(`/api/orders/${order.order_id}/payment`, {
        method: 'POST',
        body: form,
      })
      const d = await res.json()
      if (!res.ok) {
        setError(d.error || 'Could not send your receipt — please try again.')
        return
      }
      setSent(true)
    } catch {
      setError('Something went wrong — please try again.')
    } finally {
      setPaying(false)
    }
  }

  const cancelled = order?.fulfillment_status === 'cancelled'
  const nextIndex = order ? STEPS.findIndex((s) => !isDone(s.key, order)) : -1
  const bankReady = order?.bank.account_number && order?.bank.account_name

  return (
    <main className="mx-auto max-w-md px-5 py-16 md:px-12">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">Orders</p>
      <h1 className="mt-2 font-display text-4xl text-ink">Track your order</h1>
      <p className="mt-3 text-ink-muted">
        Order number plus the phone you used at checkout. No account required.
      </p>

      <form className="mt-8 space-y-4" onSubmit={track}>
        <input
          required
          placeholder="Order number e.g. YB-2026-0142"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          className="h-12 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-3"
        />
        <input
          required
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-12 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-3"
        />
        <Button type="submit" variant="primary" className="h-12 w-full" loading={loading}>
          Track
        </Button>
      </form>

      {error && <p className="mt-6 text-sm text-cherry-700">{error}</p>}

      {order && (
        <div className="mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
            Order {order.order_number}
          </p>
          <ul className="mt-2 space-y-1 text-sm text-ink">
            {order.items.map((it, i) => (
              <li key={i}>
                {it.name}
                {it.detail ? ` · ${it.detail}` : ''}
                {it.quantity > 1 ? ` ×${it.quantity}` : ''}
              </li>
            ))}
          </ul>

          {cancelled ? (
            <p className="mt-6 rounded-[2px] border border-cherry-200 bg-cherry-50 px-4 py-3 text-sm text-cherry-700">
              This order was cancelled. If this is a mistake, message us on WhatsApp.
            </p>
          ) : (
            <ol className="mt-6 space-y-4">
              {STEPS.map((s, i) => {
                const done = isDone(s.key, order)
                const isNext = i === nextIndex
                return (
                  <li key={s.key} className="flex gap-3">
                    <span
                      aria-hidden
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                        done
                          ? 'border-violet-800 bg-violet-800 text-vanilla-50'
                          : isNext
                            ? 'border-violet-800 text-violet-800'
                            : 'border-vanilla-400 text-vanilla-400'
                      }`}
                    >
                      {done ? '✓' : i + 1}
                    </span>
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          done || isNext ? 'text-ink' : 'text-ink-muted'
                        }`}
                      >
                        {s.label}
                        {isNext && <span className="ml-2 text-xs font-normal text-violet-800">Next</span>}
                      </p>
                      <p className="text-xs text-ink-muted">{s.note}</p>
                      {s.key === 'paid' && order.payment_status === 'partially_paid' && (
                        <p className="text-xs text-ink-muted">
                          Balance {formatNaira(order.balance)} before dispatch.
                        </p>
                      )}
                      {s.key === 'shipped' && done && order.tracking_number && (
                        <p className="text-xs text-ink-muted">
                          {order.courier_name ? `${order.courier_name} · ` : ''}
                          {order.tracking_number}
                        </p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          )}

          {!cancelled && order.payment_status === 'pending' && (
            <div className="mt-6 border border-vanilla-400 bg-vanilla-50 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-cherry-600">
                Awaiting payment
              </p>
              {sent ? (
                <p className="mt-2 text-sm text-ink">
                  Payment sent. We’ll confirm it and move your order forward — usually within
                  5–10 minutes.
                </p>
              ) : (
                <>
                  <p className="mt-2 text-sm text-ink">
                    Pay{' '}
                    <span className="font-semibold tabular-nums text-cherry-600">
                      {formatNaira(order.due_now)}
                    </span>{' '}
                    to move your order forward.
                  </p>
                  {bankReady ? (
                    <p className="mt-2 text-sm text-ink-muted">
                      Transfer to{' '}
                      <span className="font-semibold text-ink">{order.bank.account_number}</span> ·{' '}
                      {order.bank.account_name} · {order.bank.bank_name}. Include{' '}
                      <span className="font-semibold text-ink">{order.order_number}</span> in the
                      narration.
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-ink-muted">
                      Message us on WhatsApp for the account details.
                    </p>
                  )}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                    className="mt-3 block w-full text-sm"
                    aria-label="Transfer receipt"
                  />
                  <Button
                    type="button"
                    variant="primary"
                    className="mt-3 h-12 w-full"
                    loading={paying}
                    onClick={pay}
                  >
                    I have made the payment
                  </Button>
                </>
              )}
            </div>
          )}

          {!cancelled && order.payment_status === 'confirmation_pending' && (
            <p className="mt-6 rounded-[2px] bg-vanilla-200 px-4 py-3 text-sm text-ink">
              Payment sent — we’re confirming it, usually within 5–10 minutes.
            </p>
          )}

          <ReviewCta />
        </div>
      )}
    </main>
  )
}
