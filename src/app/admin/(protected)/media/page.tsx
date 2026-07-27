'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

type Asset = { id: string; url: string; filename: string; alt_text: string | null; mime_type: string }

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [url, setUrl] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

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

      <section className="border border-vanilla-400 bg-vanilla-50 p-6 text-sm text-ink-muted">
        <h2 className="font-display text-xl text-ink">Enable direct file uploads (Supabase)</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>
            Open your Supabase project → <strong className="text-ink">Project Settings</strong> →{' '}
            <strong className="text-ink">API</strong>
          </li>
          <li>
            Copy <strong className="text-ink">Project URL</strong> → paste in Vercel as{' '}
            <code className="text-ink">NEXT_PUBLIC_SUPABASE_URL</code>
          </li>
          <li>
            Copy <strong className="text-ink">service_role</strong> key (secret) → Vercel as{' '}
            <code className="text-ink">SUPABASE_SERVICE_ROLE_KEY</code>
          </li>
          <li>
            Supabase → <strong className="text-ink">Storage</strong> → New bucket named{' '}
            <code className="text-ink">media</code> → set <strong className="text-ink">Public</strong>
          </li>
          <li>
            Optional Vercel env: <code className="text-ink">SUPABASE_STORAGE_BUCKET=media</code>
          </li>
          <li>Redeploy on Vercel, then try Choose file → Save this media again.</li>
        </ol>
        <p className="mt-3">Until that is set, use "paste media URL" — photos and videos still attach to products.</p>
      </section>

      <section>
        <h2 className="font-display text-xl text-ink">Your library</h2>
        {assets.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">No media saved yet.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {assets.map((a) => (
              <div key={a.id} className="border border-vanilla-400 bg-vanilla-50 p-2">
                {a.mime_type.startsWith('video/') ? (
                  <video src={a.url} className="aspect-[4/5] w-full object-cover" controls />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={a.url}
                    alt={a.alt_text || a.filename}
                    className="aspect-[4/5] w-full object-cover"
                  />
                )}
                <p className="mt-2 truncate text-xs text-ink-muted">{a.filename}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}