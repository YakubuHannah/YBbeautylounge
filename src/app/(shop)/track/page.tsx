'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'

export default function TrackPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [msg, setMsg] = useState('')

  return (
    <main className="mx-auto max-w-md px-5 py-16 md:px-12">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">Orders</p>
      <h1 className="mt-2 font-display text-4xl text-ink">Track your order</h1>
      <p className="mt-3 text-ink-muted">
        Order number plus the phone used at checkout. No account required.
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          setMsg(
            'Live tracking connects when order events ship. You will look up by order number + phone — both required, never number alone.'
          )
        }}
      >
        <input
          required
          placeholder="Order number e.g. YBB-2026-0142"
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
        <Button type="submit" variant="primary" className="h-12 w-full">
          Track
        </Button>
      </form>
      {msg && <p className="mt-6 text-sm text-ink-muted">{msg}</p>}
    </main>
  )
}
