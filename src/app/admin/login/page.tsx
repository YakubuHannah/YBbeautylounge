'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('admin@ybbeautylounge.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }
      router.push('/admin')
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-vanilla-100 px-5">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-4 border border-vanilla-400 bg-vanilla-50 p-8"
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
            Admin
          </p>
          <h1 className="mt-2 font-display text-3xl text-ink">Sign in</h1>
          <p className="mt-2 text-sm text-ink-muted">Server-side session. No client-only auth.</p>
        </div>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="h-12 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-3"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="h-12 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-3"
        />
        {error && <p className="text-sm text-cherry-700">{error}</p>}
        <Button type="submit" variant="primary" className="h-12 w-full" loading={loading}>
          Sign in
        </Button>
      </form>
    </main>
  )
}
