'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

type Asset = {
  id: string
  url: string
  filename: string
  alt_text: string | null
  mime_type: string
  focal_x: number
  focal_y: number
}

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [url, setUrl] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  async function load() {
    const res = await fetch('/api/admin/media')
    const data = await res.json()
    if (res.ok) setAssets(data.assets || [])
  }

  useEffect(() => {
    load()
  }, [])

  function onFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingFile(file)
    setPreview(URL.createObjectURL(file))
    setError('')
    setMessage('')
  }

  async function uploadFile() {
    if (!pendingFile) {
      setError('Choose a file first.')
      return
    }
    setUploading(true)
    setError('')
    setMessage('')
    const form = new FormData()
    form.append('file', pendingFile)
    form.append('alt_text', pendingFile.name)
    const res = await fetch('/api/admin/media', { method: 'POST', body: form })
    const data = await res.json()
    setUploading(false)
    if (!res.ok) {
      setError(
        data.error ||
          'Upload failed. If it mentions Supabase keys, add them in Vercel (see steps below on this page).'
      )
      return
    }
    setMessage('Media uploaded and saved.')
    setPendingFile(null)
    setPreview(null)
    load()
  }

  function updateAlt(id: string, alt: string) {
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, alt_text: alt } : a)))
  }

  function setFocalFromPointer(id: string, e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (v: number) => Math.min(100, Math.max(0, Math.round(v * 100)))
    const x = pct((e.clientX - rect.left) / rect.width)
    const y = pct((e.clientY - rect.top) / rect.height)
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, focal_x: x, focal_y: y } : a)))
  }

  async function saveFocal(id: string) {
    const a = assets.find((x) => x.id === id)
    if (!a) return
    await fetch('/api/admin/media', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, focal_x: a.focal_x, focal_y: a.focal_y }),
    })
  }

  async function deleteAsset(id: string) {
    if (!window.confirm('Delete this file? This cannot be undone.')) return
    setError('')
    setMessage('')
    const res = await fetch('/api/admin/media', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Delete failed')
      return
    }
    setMessage('Deleted.')
    setAssets((prev) => prev.filter((a) => a.id !== id))
  }

  async function saveAlt(id: string, alt: string) {
    await fetch('/api/admin/media', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, alt_text: alt }),
    })
  }

  async function addUrl() {
    if (!url.trim()) return
    setUploading(true)
    setError('')
    const res = await fetch('/api/admin/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url.trim(), alt_text: 'Product media' }),
    })
    const data = await res.json()
    setUploading(false)
    if (!res.ok) {
      setError(data.error || 'Failed to add URL')
      return
    }
    setUrl('')
    setMessage('Media URL saved. You can attach it on a product.')
    load()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink">Media library</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Upload product photos or videos here, preview them, then attach on the product edit screen.
        </p>
      </div>

      <section className="space-y-4 border border-vanilla-400 bg-vanilla-50 p-6">
        <h2 className="font-display text-xl">Upload media</h2>
        <input type="file" accept="image/*,.heic,.heif,video/mp4,video/quicktime,video/webm" onChange={onFilePick} className="block w-full text-sm" />

        {preview && (
          <div className="max-w-xs border border-vanilla-400 bg-vanilla-100 p-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-800">
              Preview before upload
            </p>
            {pendingFile?.type.startsWith('video/') ? (
              <video src={preview} className="aspect-[4/5] w-full object-cover" controls />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={preview} alt="Preview" className="aspect-[4/5] w-full object-cover" />
            )}
            <Button
              type="button"
              variant="primary"
              className="mt-3 w-full"
              loading={uploading}
              onClick={uploadFile}
            >
              Save this media
            </Button>
          </div>
        )}

        <div className="border-t border-vanilla-400 pt-4">
          <p className="text-sm font-semibold text-ink">Or paste a media link</p>
          <p className="text-xs text-ink-muted">
            Works without Supabase upload setup (Instagram export link, Drive public link, etc.).
          </p>
          {url && (
            <div className="mt-3 max-w-xs border border-vanilla-400 p-2">
              <p className="mb-2 text-xs text-violet-800">URL preview</p>
              {url.match(/\.(mp4|webm|mov|avi)$/i) ? (
                <video src={url} className="aspect-[4/5] w-full object-cover" controls />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={url} alt="URL preview" className="aspect-[4/5] w-full object-cover" />
              )}
            </div>
          )}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              className="h-12 flex-1 border border-vanilla-400 bg-vanilla-50 px-3"
              placeholder="https://…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button type="button" variant="primary" loading={uploading} onClick={addUrl}>
              Save URL
            </Button>
          </div>
        </div>

        {message && <p className="text-sm text-ink">{message}</p>}
        {error && <p className="text-sm text-cherry-700">{error}</p>}
      </section>

      <section>
        <h2 className="font-display text-xl text-ink">Your library</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Drag on a photo to set how it sits inside frames — the point you hold stays in view.
          Saves when you let go, and applies everywhere the photo appears.
        </p>
        {assets.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">No media saved yet.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {assets.map((a) => (
              <div key={a.id} className="border border-vanilla-400 bg-vanilla-50 p-2">
                {a.mime_type.startsWith('video/') ? (
                  <video src={a.url} className="aspect-[4/5] w-full object-cover" controls />
                ) : (
                  <div
                    className="cursor-move touch-none select-none"
                    onPointerDown={(e) => {
                      e.currentTarget.setPointerCapture(e.pointerId)
                      setDraggingId(a.id)
                      setFocalFromPointer(a.id, e)
                    }}
                    onPointerMove={(e) => draggingId === a.id && setFocalFromPointer(a.id, e)}
                    onPointerUp={() => {
                      setDraggingId(null)
                      saveFocal(a.id)
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.url}
                      alt={a.alt_text || a.filename}
                      className="pointer-events-none aspect-[4/5] w-full object-cover"
                      style={{ objectPosition: `${a.focal_x}% ${a.focal_y}%` }}
                      draggable={false}
                    />
                  </div>
                )}
                <p className="mt-2 truncate text-xs text-ink-muted">{a.filename}</p>
                <input
                  className="mt-2 h-9 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-100 px-2 text-xs text-ink"
                  value={a.alt_text || ''}
                  onChange={(e) => updateAlt(a.id, e.target.value)}
                  onBlur={(e) => saveAlt(a.id, e.target.value)}
                  placeholder="Alt text (optional)"
                  aria-label="Alt text"
                />
                <div className="mt-2 flex items-center gap-3 text-xs">
                  <a
                    href={a.url}
                    download={a.filename}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-ink underline"
                  >
                    Download
                  </a>
                  <button
                    type="button"
                    onClick={() => deleteAsset(a.id)}
                    className="font-semibold text-cherry-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}