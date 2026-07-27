'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart/cart-provider'
import { formatNaira } from '@/lib/money'
import { whatsAppUrl } from '@/lib/whatsapp'

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
]

export default function CheckoutPage() {
  const { lines, subtotal, clear } = useCart()
  const [done, setDone] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [state, setState] = useState('Lagos')
  const [address, setAddress] = useState('')
  const [plan, setPlan] = useState<'full' | 'deposit_50'>('full')
  const [marketing, setMarketing] = useState(false)

  if (lines.length === 0 && !done) {
    return (
      <main className="mx-auto max-w-lg px-5 py-16 text-center">
        <h1 className="font-display text-3xl text-ink">Nothing to check out</h1>
        <Link href="/shop" className="mt-6 inline-block text-cherry-600">
          Return to shop
        </Link>
      </main>
    )
  }

  if (done) {
    const msg = `Order enquiry%0AName: ${name}%0APhone: ${phone}%0ATotal: ${formatNaira(subtotal)}`
    return (
      <main className="mx-auto max-w-lg px-5 py-16 text-center md:px-12">
        <h1 className="font-display text-3xl text-ink">Thank you, {name.split(' ')[0]}</h1>
        <p className="mt-4 text-ink-muted">
          Your details are ready. Full Paystack checkout is next on the build plan — for now,
          send this bag on WhatsApp to complete with us, or track later once self-serve payments
          go live.
        </p>
        <div className="mt-8 space-y-3">
          <a
            href={whatsAppUrl(
              `Hi YBBeautylounge, I'd like to complete my order.\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nState: ${state}\nPlan: ${plan}\nItems: ${lines.map((l) => `${l.productName} (${l.variantLabel}) x${l.quantity}`).join('; ')}\nSubtotal: ${formatNaira(subtotal)}`
            )}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 w-full items-center justify-center rounded-[2px] bg-cherry-600 text-sm font-semibold text-vanilla-50 no-underline hover:bg-cherry-700 hover:no-underline"
          >
            Send order on WhatsApp
          </a>
          <Link href="/shop" className="block text-sm font-semibold text-cherry-600">
            Keep shopping
          </Link>
        </div>
        <p className="mt-6 text-xs text-ink-muted">{decodeURIComponent(msg).slice(0, 0)}</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-xl px-5 py-10 md:px-12 md:py-16">
      <h1 className="font-display text-3xl text-ink">Checkout</h1>
      <p className="mt-2 text-sm text-ink-muted">Guest checkout · under five steps</p>

      <form
        className="mt-8 space-y-6"
        onSubmit={(e) => {
          e.preventDefault()
          setDone(true)
          clear()
        }}
      >
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
            placeholder="Email (for receipt)"
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
            className="h-12 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-3"
          >
            {states.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
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
            Pay in full · {formatNaira(subtotal)}
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="radio"
              name="plan"
              checked={plan === 'deposit_50'}
              onChange={() => setPlan('deposit_50')}
            />
            50% deposit · {formatNaira(Math.round(subtotal / 2))} today
          </label>
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
          <p className="mt-2 text-xs text-ink-muted">
            Server-side pricing and Paystack confirmation land in the next build milestone.
          </p>
        </div>

        <Button type="submit" variant="primary" className="h-12 w-full">
          Continue
        </Button>
      </form>
    </main>
  )
}
