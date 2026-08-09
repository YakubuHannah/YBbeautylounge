'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart/cart-provider'
import { installmentAmounts, INSTALLMENT_WINDOW_MONTHS } from '@/lib/installment-math'
import { formatNaira } from '@/lib/money'
import { whatsAppUrl } from '@/lib/whatsapp'
import { usePublicSettings } from '@/components/settings/settings-provider'

const states = [
  'Lagos',
  'Ogun',
  'Oyo',
  'Osun',
  'Ondo',
  'Ekiti',
  'Abuja',
  'Rivers',
  'Other',
  'International',
]

type PlacedOrder = {
  order_id: string
  order_number: string
  subtotal: number
  delivery_fee: number
  total: number
  due_now: number
  bank: { bank_name: string; account_name: string; account_number: string }
}

export default function CheckoutPage() {
  const { lines, subtotal, clear } = useCart()
  const { whatsapp_number } = usePublicSettings()
  const [step, setStep] = useState<'details' | 'pay' | 'done'>('details')
  const [order, setOrder] = useState<PlacedOrder | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [state, setState] = useState('Lagos')
  const [address, setAddress] = useState('')
  const [lagosArea, setLagosArea] = useState<'mainland' | 'island'>('mainland')
  const [otherState, setOtherState] = useState('')
  const [pricing, setPricing] = useState({
    delivery_lagos_mainland: 0,
    delivery_lagos_island: 0,
    delivery_other_states: 0,
    free_delivery_threshold: 0,
    installment_count: 4,
  })
  const [plan, setPlan] = useState<'full' | 'installment'>('full')
  const [installmentN, setInstallmentN] = useState(4)
  const [marketing, setMarketing] = useState(false)
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/delivery')
      .then((r) => r.json())
      .then((d) => {
        if (d && typeof d.delivery_other_states === 'number') {
          setPricing(d)
          if (d.installment_count) setInstallmentN(Number(d.installment_count))
        }
      })
      .catch(() => {})
  }, [])

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError('')
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        phone,
        email,
        state: stateForRecord,
        address,
        delivery_zone: zoneKey,
        plan,
        installment_count: chosenInstallments,
        marketing,
        items: lines.map((l) => ({ variant_id: l.variantId, quantity: l.quantity })),
      }),
    })
    const data = await res.json()
    setSending(false)
    if (!res.ok) {
      setError(data.error || 'Could not place the order — please try again.')
      return
    }
    setOrder(data)
    clear()
    setStep('pay')
  }

  async function claimPayment() {
    if (!order) return
    if (!screenshot) {
      setError('Attach a screenshot of your transfer receipt first.')
      return
    }
    setSending(true)
    setError('')
    const form = new FormData()
    form.append('screenshot', screenshot)
    const res = await fetch(`/api/orders/${order.order_id}/payment`, {
      method: 'POST',
      body: form,
    })
    const data = await res.json()
    setSending(false)
    if (!res.ok) {
      setError(data.error || 'Could not send your receipt — please try again.')
      return
    }
    setStep('done')
  }

  if (step === 'details' && lines.length === 0) {
    return (
      <main className="mx-auto max-w-lg px-5 py-16 text-center">
        <h1 className="font-display text-3xl text-ink">Nothing to check out</h1>
        <Link href="/shop" className="mt-6 inline-block text-cherry-600">
          Return to shop
        </Link>
      </main>
    )
  }

  if (step === 'pay' && order) {
    const bankReady = order.bank.account_number && order.bank.account_name
    return (
      <main className="mx-auto max-w-lg px-5 py-16 md:px-12">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
          Order {order.order_number}
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink">Pay by bank transfer</h1>
        <p className="mt-3 text-ink-muted">
          Transfer{' '}
          <span className="font-semibold tabular-nums text-cherry-600">
            {formatNaira(order.due_now)}
          </span>{' '}
          {order.due_now < order.total ? '(your part-payment) ' : ''}to the account below, then
          attach your receipt so we can confirm it.
        </p>

        <div className="mt-6 space-y-2 border border-vanilla-400 bg-vanilla-50 p-6 text-sm">
          <div className="flex justify-between">
            <span>Goods</span>
            <span className="tabular-nums">{formatNaira(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span className="tabular-nums">
              {order.delivery_fee > 0 ? formatNaira(order.delivery_fee) : 'Free'}
            </span>
          </div>
          <div className="flex justify-between border-t border-vanilla-400 pt-2 font-semibold">
            <span>Order total</span>
            <span className="tabular-nums">{formatNaira(order.total)}</span>
          </div>
          <div className="flex justify-between">
            <span>Paying now</span>
            <span className="tabular-nums font-semibold text-cherry-600">
              {formatNaira(order.due_now)}
            </span>
          </div>
          {order.due_now < order.total && (
            <div className="flex justify-between text-ink-muted">
              <span>Balance before dispatch</span>
              <span className="tabular-nums">{formatNaira(order.total - order.due_now)}</span>
            </div>
          )}
        </div>

        {bankReady ? (
          <div className="mt-6 space-y-2 border border-vanilla-400 bg-vanilla-50 p-6">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
              Bank details
            </p>
            <p className="font-display text-2xl tabular-nums text-ink">
              {order.bank.account_number}
            </p>
            <p className="text-ink">{order.bank.account_name}</p>
            <p className="text-ink-muted">{order.bank.bank_name}</p>
            <p className="pt-2 text-xs text-ink-muted">
              If your bank allows a narration, include your order number{' '}
              <span className="font-semibold text-ink">{order.order_number}</span>.
            </p>
          </div>
        ) : (
          <div className="mt-6 border border-vanilla-400 bg-vanilla-50 p-6 text-sm text-ink-muted">
            Our account details are being updated — message us on WhatsApp and we’ll send them
            right away with your order number.
          </div>
        )}

        <div className="mt-8 space-y-3">
          <p className="text-sm font-semibold text-ink">Made the transfer?</p>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
            className="block w-full text-sm"
            aria-label="Transfer receipt screenshot"
          />
          {error && <p className="text-sm text-cherry-700">{error}</p>}
          <Button
            type="button"
            variant="primary"
            className="h-12 w-full"
            loading={sending}
            onClick={claimPayment}
          >
            I have made the payment
          </Button>
          <a
            href={whatsAppUrl(
              `Hi YBBeautylounge, I placed order ${order.order_number} and I have a question about payment.`,
              whatsapp_number
            )}
            target="_blank"
            rel="noreferrer"
            className="block text-center text-sm font-semibold text-cherry-600 no-underline hover:underline"
          >
            Questions? Chat with us on WhatsApp
          </a>
        </div>
      </main>
    )
  }

  if (step === 'done' && order) {
    return (
      <main className="mx-auto max-w-lg px-5 py-16 text-center md:px-12">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
          Order {order.order_number}
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink">
          Thank you, {name.split(' ')[0] || 'love'}
        </h1>
        <p className="mt-4 text-ink-muted">
          We’re confirming your payment (usually within 5–10 minutes). Once it’s confirmed,
          you’ll get an email from us letting you know your order is officially in motion —
          keep an eye on <span className="font-semibold text-ink">{email}</span>.
        </p>

        <div className="mt-10 border border-vanilla-400 bg-vanilla-50 p-6 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
            While you wait, discover:
          </p>
          <ul className="mt-4 space-y-3 text-ink">
            <li>
              <a
                href="https://instagram.com/ybbeautylounge"
                target="_blank"
                rel="noreferrer"
                className="no-underline hover:underline"
              >
                💎 Install tutorials
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com/ybbeautylounge"
                target="_blank"
                rel="noreferrer"
                className="no-underline hover:underline"
              >
                💎 Wig care &amp; revival tips
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com/ybbeautylounge"
                target="_blank"
                rel="noreferrer"
                className="no-underline hover:underline"
              >
                💎 Curl refresh guides
              </a>
            </li>
            <li>
              <Link href="/length-guide" className="no-underline hover:underline">
                💎 Your perfect hair length guide
              </Link>
            </li>
          </ul>
          <a
            href="https://instagram.com/ybbeautylounge"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex h-12 items-center rounded-[2px] border border-ink px-6 text-sm font-semibold text-ink no-underline hover:bg-ink hover:text-vanilla-50 hover:no-underline"
          >
            Follow @ybbeautylounge on Instagram
          </a>
        </div>
      </main>
    )
  }

  const isInternational = state === 'International'
  const zoneKey =
    state === 'Lagos'
      ? lagosArea === 'island'
        ? 'lagos_island'
        : 'lagos_mainland'
      : isInternational
        ? 'international'
        : 'other_states'
  const stateForRecord = state === 'Other' ? otherState : state
  const baseFee =
    zoneKey === 'lagos_mainland'
      ? pricing.delivery_lagos_mainland
      : zoneKey === 'lagos_island'
        ? pricing.delivery_lagos_island
        : zoneKey === 'other_states'
          ? pricing.delivery_other_states
          : 0
  const threshold = pricing.free_delivery_threshold
  const deliveryDue = isInternational ? 0 : threshold > 0 && subtotal >= threshold ? 0 : baseFee
  const orderTotal = subtotal + deliveryDue
  const maxInstallments = Math.max(2, pricing.installment_count || 4)
  const chosenInstallments = Math.min(Math.max(2, installmentN), maxInstallments)
  const installments = installmentAmounts(subtotal, chosenInstallments)
  const firstInstallment = installments[0] ?? subtotal
  // Full pays everything now; installment pays the first (goods-only) part now.
  const dueToday = plan === 'installment' ? firstInstallment : orderTotal

  return (
    <main className="mx-auto max-w-xl px-5 py-10 md:px-12 md:py-16">
      <h1 className="font-display text-3xl text-ink">Checkout</h1>
      <p className="mt-2 text-sm text-ink-muted">Guest checkout · pay by bank transfer</p>

      <form className="mt-8 space-y-6" onSubmit={placeOrder}>
        <fieldset className="space-y-4">
          <legend className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
            Contact
          </legend>
          <input
            required
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-3"
          />
          <input
            required
            type="tel"
            placeholder="WhatsApp phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-3"
          />
          <input
            required
            type="email"
            placeholder="Email (for order updates)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-3"
          />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
            Delivery
          </legend>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            aria-label="Delivery location"
            className="h-12 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-3"
          >
            {states.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          {state === 'Lagos' && (
            <select
              value={lagosArea}
              onChange={(e) => setLagosArea(e.target.value as 'mainland' | 'island')}
              aria-label="Lagos area"
              className="h-12 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-3"
            >
              <option value="mainland">
                Lagos Mainland — {formatNaira(pricing.delivery_lagos_mainland)}
              </option>
              <option value="island">
                Lagos Island — {formatNaira(pricing.delivery_lagos_island)}
              </option>
            </select>
          )}

          {state === 'Other' && (
            <input
              required
              placeholder="Type your state"
              value={otherState}
              onChange={(e) => setOtherState(e.target.value)}
              className="h-12 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-3"
            />
          )}

          {isInternational && (
            <p className="rounded-[2px] bg-vanilla-200 px-4 py-3 text-sm text-ink">
              International delivery price depends on the shipment and is paid directly to the
              courier. We’ll reach out to arrange it after your order.
            </p>
          )}

          {!isInternational && (
            <p className="text-sm text-ink-muted">
              Delivery:{' '}
              <span className="font-semibold text-ink">
                {deliveryDue === 0 ? 'Free' : formatNaira(deliveryDue)}
              </span>
              {threshold > 0 && subtotal < threshold && deliveryDue > 0
                ? ` · free on orders from ${formatNaira(threshold)}`
                : ''}
            </p>
          )}

          <textarea
            required
            placeholder="Delivery address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-3 py-3"
          />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
            Payment plan
          </legend>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="radio"
              name="plan"
              checked={plan === 'full'}
              onChange={() => setPlan('full')}
            />
            Pay in full · {formatNaira(orderTotal)}
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="radio"
              name="plan"
              checked={plan === 'installment'}
              onChange={() => setPlan('installment')}
            />
            Installment · pay in parts
          </label>

          {plan === 'installment' && (
            <div className="rounded-[2px] border border-vanilla-400 bg-vanilla-50 p-4 text-sm">
              <label className="block space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
                  Choose your plan
                </span>
                <select
                  value={chosenInstallments}
                  onChange={(e) => setInstallmentN(Number(e.target.value))}
                  aria-label="Number of installments"
                  className="mt-1 h-11 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-3"
                >
                  {Array.from({ length: Math.max(0, maxInstallments - 1) }, (_, i) => i + 2).map(
                    (n) => (
                      <option key={n} value={n}>
                        {n} installments
                      </option>
                    )
                  )}
                </select>
              </label>
              <ul className="mt-3 space-y-1">
                {installments.map((amt, i) => (
                  <li key={i} className="flex justify-between">
                    <span>
                      Payment {i + 1}
                      {i === 0 ? ' (today)' : ''}
                    </span>
                    <span className="tabular-nums">{formatNaira(amt)}</span>
                  </li>
                ))}
                {!isInternational && deliveryDue > 0 && (
                  <li className="flex justify-between text-ink-muted">
                    <span>Delivery (with your balance)</span>
                    <span className="tabular-nums">{formatNaira(deliveryDue)}</span>
                  </li>
                )}
              </ul>
              <p className="mt-3 text-xs text-ink-muted">
                Pay the first installment today. Your wig ships once the full balance is paid, and
                delivery is paid with the balance. Please complete within {INSTALLMENT_WINDOW_MONTHS}{' '}
                months — need longer? Message us and we’ll arrange it.
              </p>
            </div>
          )}
        </fieldset>

        <label className="flex items-start gap-3 text-sm text-ink-muted">
          <input
            type="checkbox"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            className="mt-1"
          />
          <span>
            I agree to receive marketing emails about new drops and care tips. Unticked by
            default — order updates still send.
          </span>
        </label>

        <div className="bg-vanilla-200 p-5">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-semibold tabular-nums">{formatNaira(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span>Delivery</span>
            <span className="font-semibold tabular-nums">
              {isInternational ? 'Paid on delivery' : deliveryDue === 0 ? 'Free' : formatNaira(deliveryDue)}
            </span>
          </div>
          <div className="mt-2 flex justify-between border-t border-vanilla-400 pt-2 text-sm">
            <span>Total</span>
            <span className="font-semibold tabular-nums">{formatNaira(orderTotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span>Due today</span>
            <span className="font-semibold tabular-nums text-cherry-600">{formatNaira(dueToday)}</span>
          </div>
          {plan === 'installment' && (
            <p className="mt-2 text-xs text-ink-muted">
              You pay the first installment today. Delivery is paid with your balance, and your wig
              ships once the balance is fully paid.
            </p>
          )}
          <p className="mt-2 text-xs text-ink-muted">
            The exact amount is confirmed on the next step, priced from our records — never from
            your browser.
          </p>
        </div>

        {error && <p className="text-sm text-cherry-700">{error}</p>}

        <Button type="submit" variant="primary" className="h-12 w-full" loading={sending}>
          Continue to payment
        </Button>
      </form>
    </main>
  )
}
