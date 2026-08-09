'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { formatNaira } from '@/lib/money'

type Payment = {
  id: string
  amount: number
  method: string
  status: string
  createdAt: string
  raw_webhook_payload: { screenshot_url?: string } | null
}

type OrderItem = {
  id: string
  product_name_snapshot: string
  variant_description_snapshot: string
  quantity: number
  line_total: number
}

type Order = {
  id: string
  order_number: string
  customer_name_snapshot: string
  customer_phone_snapshot: string
  customer_email_snapshot: string | null
  delivery_address: string
  state: string
  subtotal: number
  total: number
  amount_paid: number
  payment_plan: string
  payment_status: string
  fulfillment_status: string
  createdAt: string
  items: OrderItem[]
  payments: Payment[]
}

const NEXT_FULFILLMENT: Record<string, string[]> = {
  unfulfilled: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

const PAYMENT_LABELS: Record<string, string> = {
  pending: 'Awaiting payment',
  confirmation_pending: 'Says paid — confirm',
  partially_paid: 'Deposit received',
  paid: 'Paid',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  async function load() {
    const res = await fetch('/api/admin/orders')
    const data = await res.json()
    if (res.ok) setOrders(data.orders)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function act(orderId: string, payload: Record<string, string>) {
    setBusy(orderId)
    setError('')
    const res = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, ...payload }),
    })
    const data = await res.json()
    setBusy('')
    if (!res.ok) {
      setError(data.error || 'Action failed')
      return
    }
    load()
  }

  if (loading) return <p className="text-ink-muted">Loading orders…</p>

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink">Orders</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Every order and its payment state. “Awaiting payment” orders are your follow-up list —
          the customer reached checkout but has not transferred yet.
        </p>
      </div>

      {error && <p className="text-sm text-cherry-700">{error}</p>}

      {orders.length === 0 ? (
        <p className="text-ink-muted">No orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((o) => {
            const pendingPayment = o.payments.find((p) => p.status === 'pending')
            const screenshot = pendingPayment?.raw_webhook_payload?.screenshot_url
            return (
              <section key={o.id} className="border border-vanilla-400 bg-vanilla-50 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xl text-ink">{o.order_number}</p>
                    <p className="text-xs text-ink-muted">
                      {new Date(o.createdAt).toLocaleString('en-NG', {
                        timeZone: 'Africa/Lagos',
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums text-cherry-600">
                      {formatNaira(o.total)}
                    </p>
                    <p className="text-xs text-ink-muted">
                      Paid {formatNaira(o.amount_paid)}
                      {o.payment_plan === 'installment'
                        ? ' · installment plan'
                        : o.payment_plan === 'deposit_50'
                          ? ' · 50% deposit plan'
                          : ''}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
                      Customer
                    </p>
                    <p className="mt-1 font-semibold text-ink">{o.customer_name_snapshot}</p>
                    <p className="text-ink-muted">{o.customer_phone_snapshot}</p>
                    {o.customer_email_snapshot && (
                      <p className="text-ink-muted">{o.customer_email_snapshot}</p>
                    )}
                    <p className="mt-1 text-ink-muted">
                      {o.delivery_address}, {o.state}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
                      Items
                    </p>
                    <ul className="mt-1 space-y-1 text-ink-muted">
                      {o.items.map((i) => (
                        <li key={i.id}>
                          {i.product_name_snapshot} ({i.variant_description_snapshot}) ×
                          {i.quantity} — {formatNaira(i.line_total)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-vanilla-400 pt-4 text-sm">
                  <span className="rounded-[2px] border border-vanilla-400 bg-vanilla-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink">
                    {PAYMENT_LABELS[o.payment_status] || o.payment_status}
                  </span>
                  <span className="rounded-[2px] border border-vanilla-400 bg-vanilla-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink">
                    {o.fulfillment_status}
                  </span>
                  {screenshot && (
                    <a
                      href={screenshot}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-cherry-600 underline"
                    >
                      View payment receipt
                    </a>
                  )}
                  {pendingPayment && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      loading={busy === o.id}
                      onClick={() =>
                        act(o.id, { action: 'confirm_payment', payment_id: pendingPayment.id })
                      }
                    >
                      Confirm {formatNaira(pendingPayment.amount)} received
                    </Button>
                  )}
                  {(NEXT_FULFILLMENT[o.fulfillment_status] || []).map((next) => (
                    <Button
                      key={next}
                      type="button"
                      variant="secondary"
                      size="sm"
                      loading={busy === o.id}
                      onClick={() =>
                        act(o.id, { action: 'update_fulfillment', fulfillment_status: next })
                      }
                    >
                      Mark {next}
                    </Button>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
