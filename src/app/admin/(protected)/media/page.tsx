'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

type Asset = { id: string; url: string; filename: string; alt_text: string | null }

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [url, setUrl] = useState('')
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)

  async function load() {
    const res = await fetch('/api/admin/media')
    const data = await res.json()
    if (res.ok) setAssets(data.assets || [])
  }

  useEffect(() => {
    load()
  }, [])

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setMessage('')
    const form = new FormData()
    form.append('file', file)
    form.append('alt_text', file.name)
    const res = await fetch('/api/admin/media', { method: 'POST', body: form })
    const data = await res.json()
    setUploading(false)
    if (!res.ok) {
      setMessage(data.error || 'Upload failed')
      return
    }
    setMessage('Uploaded')
    load()
  }

  async function addUrl() {
    if (!url.trim()) return
    setUploading(true)
    const res = await fetch('/api/admin/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url.trim(), alt_text: 'Product image' }),
    })
    const data = await res.json()
    setUploading(false)
    if (!res.ok) {
      setMessage(data.error || 'Failed')
      return
    }
    setUrl('')
    setMessage('URL added')
    load()
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Media library</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Upload files (needs Supabase Storage) or paste an image URL. Then attach on a product.
      </p>

      <div className="mt-8 space-y-4 border border-vanilla-400 bg-vanilla-50 p-5">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
            Upload file
          </label>
          <input
            type="file"
            accept="image/*,.heic,.heif"
            onChange={onUpload}
            disabled={uploading}
            className="mt-2 block w-full text-sm"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="h-12 flex-1 border border-vanilla-400 bg-vanilla-50 px-3"
            placeholder="Or paste image URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button type="button" variant="primary" loading={uploading} onClick={addUrl}>
            Add URL
          </Button>
        </div>
        {message && <p className="text-sm text-ink-muted">{message}</p>}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {assets.map((a) => (
          <div key={a.id} className="border border-vanilla-400 bg-vanilla-50 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.url} alt={a.alt_text || a.filename} className="aspect-square w-full object-cover" />
            <p className="mt-2 truncate text-xs text-ink-muted">{a.filename}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
