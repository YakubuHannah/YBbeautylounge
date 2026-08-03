'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

import { TierEditor } from '../../_components/tier-editor'

type LengthRow = { inches: string; sits: string; best: string }
type EditablePage = {
  slug: string
  label: string
  content: string
  rows?: LengthRow[]
  gallery_media_ids?: string[]
}
type MediaAsset = {
  id: string
  url: string
  filename: string
  mime_type: string
  alt_text: string | null
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<EditablePage[]>([])
  const [selected, setSelected] = useState('')
  const [content, setContent] = useState('')
  const [rows, setRows] = useState<LengthRow[]>([])
  const [galleryIds, setGalleryIds] = useState<string[]>([])
  const [media, setMedia] = useState<MediaAsset[]>([])
  const [beforeId, setBeforeId] = useState('')
  const [afterId, setAfterId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const [pagesRes, mediaRes, settingsRes] = await Promise.all([
        fetch('/api/admin/pages'),
        fetch('/api/admin/media'),
        fetch('/api/admin/settings'),
      ])
      const data = await pagesRes.json()
      const mediaData = await mediaRes.json()
      const settingsData = await settingsRes.json()
      if (pagesRes.ok) {
        setPages(data.pages)
        if (data.pages.length) {
          setSelected(data.pages[0].slug)
          setContent(data.pages[0].content)
          setRows(data.pages[0].rows || [])
          setGalleryIds(data.pages[0].gallery_media_ids || [])
        }
      }
      if (mediaRes.ok) setMedia(mediaData.assets || [])
      if (settingsRes.ok) {
        setBeforeId(settingsData.settings.restoration_before_media_id || '')
        setAfterId(settingsData.settings.restoration_after_media_id || '')
      }
      setLoading(false)
    }
    load()
  }, [])

  function choose(slug: string) {
    const page = pages.find((p) => p.slug === slug)
    setSelected(slug)
    setContent(page?.content || '')
    setRows(page?.rows || [])
    setGalleryIds(page?.gallery_media_ids || [])
    setMessage('')
    setError('')
  }

  async function saveBeforeAfter(key: 'restoration_before_media_id' | 'restoration_after_media_id', id: string) {
    setError('')
    const current = key === 'restoration_before_media_id' ? beforeId : afterId
    const value = current === id ? '' : id
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Save failed')
      return
    }
    if (key === 'restoration_before_media_id') setBeforeId(value)
    else setAfterId(value)
    setMessage('Before/after updated — live on the homepage now.')
  }

  function toggleGallery(id: string) {
    setGalleryIds((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]))
  }

  function updateRow(index: number, patch: Partial<LengthRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  async function save() {
    setSaving(true)
    setMessage('')
    setError('')
    const payload: {
      slug: string
      content: string
      rows?: LengthRow[]
      gallery_media_ids?: string[]
    } = {
      slug: selected,
      content,
    }
    if (selected === 'length-guide') payload.rows = rows
    if (selected === 'restoration') payload.gallery_media_ids = galleryIds
    const res = await fetch('/api/admin/pages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      setError(data.error || 'Save failed')
      return
    }
    setPages((prev) =>
      prev.map((p) =>
        p.slug === selected
          ? { ...p, content, rows: payload.rows, gallery_media_ids: payload.gallery_media_ids }
          : p
      )
    )
    setMessage('Saved — live on the site now.')
  }

  if (loading) return <p className="text-ink-muted">Loading pages…</p>

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink">Pages</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Edit the writing on the site. Leave a blank line between paragraphs. Clearing the
          text restores the built-in copy.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {pages.map((p) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => choose(p.slug)}
            className={`rounded-[2px] border px-4 py-2 text-sm ${
              selected === p.slug
                ? 'border-cherry-600 bg-cherry-50 text-ink'
                : 'border-vanilla-400 bg-vanilla-50 text-ink-muted'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <section className="space-y-4 border border-vanilla-400 bg-vanilla-50 p-6">
        <div>
          <p className="text-sm font-semibold text-ink">
            {selected === 'length-guide' ? 'Intro text' : 'Page text'}
          </p>
          <textarea
            className="mt-2 min-h-[200px] w-full rounded-[2px] border border-vanilla-400 bg-vanilla-100 p-4 text-ink"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write the page content here."
          />
        </div>

        {selected === 'length-guide' && (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-ink">Length table</p>
              <p className="text-xs text-ink-muted">
                These rows render as the styled table on the page — Length, where it sits, and
                what it’s best for.
              </p>
            </div>
            <div className="hidden gap-2 text-[11px] font-semibold uppercase tracking-widest text-violet-800 sm:grid sm:grid-cols-[90px_1fr_1fr_60px]">
              <span>Length</span>
              <span>Where it sits</span>
              <span>Best for</span>
              <span />
            </div>
            {rows.map((row, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[90px_1fr_1fr_60px]">
                <input
                  className="h-11 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-100 px-2 text-sm text-ink"
                  value={row.inches}
                  onChange={(e) => updateRow(i, { inches: e.target.value })}
                  aria-label="Length"
                />
                <input
                  className="h-11 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-100 px-2 text-sm text-ink"
                  value={row.sits}
                  onChange={(e) => updateRow(i, { sits: e.target.value })}
                  aria-label="Where it sits"
                />
                <input
                  className="h-11 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-100 px-2 text-sm text-ink"
                  value={row.best}
                  onChange={(e) => updateRow(i, { best: e.target.value })}
                  aria-label="Best for"
                />
                <button
                  type="button"
                  onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-sm font-semibold text-cherry-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setRows((prev) => [...prev, { inches: '', sits: '', best: '' }])}
            >
              Add row
            </Button>
          </div>
        )}

        {selected === 'restoration' && (
          <>
            <TierEditor />

            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-ink">
                  Before &amp; after (homepage card)
                </p>
                <p className="text-xs text-ink-muted">
                  Tap “Before” or “After” under a photo — it saves instantly and shows on the
                  homepage card. Tap again to unset. Upload new photos in Admin → Media.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {media
                  .filter((m) => m.mime_type.startsWith('image/'))
                  .map((m) => (
                    <div key={m.id} className="space-y-1">
                      <div
                        className={`aspect-square overflow-hidden border-2 bg-vanilla-100 ${
                          beforeId === m.id || afterId === m.id
                            ? 'border-cherry-600'
                            : 'border-vanilla-400'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.url}
                          alt={m.alt_text || m.filename}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex gap-2 text-[10px] font-semibold uppercase tracking-wider">
                        <button
                          type="button"
                          onClick={() => saveBeforeAfter('restoration_before_media_id', m.id)}
                          className={beforeId === m.id ? 'text-cherry-700 underline' : 'text-ink-muted'}
                        >
                          Before
                        </button>
                        <button
                          type="button"
                          onClick={() => saveBeforeAfter('restoration_after_media_id', m.id)}
                          className={afterId === m.id ? 'text-cherry-700 underline' : 'text-ink-muted'}
                        >
                          After
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-ink">
                  Transformation gallery (this page)
                </p>
                <p className="text-xs text-ink-muted">
                  Tap to add or remove — photos and videos both work, shown in the order you
                  tap. Hit Save page when done.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {media.map((m) => {
                  const idx = galleryIds.indexOf(m.id)
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleGallery(m.id)}
                      className={`relative border-2 bg-vanilla-100 text-left ${
                        idx >= 0 ? 'border-cherry-600' : 'border-vanilla-400'
                      }`}
                    >
                      {m.mime_type.startsWith('video/') ? (
                        <video
                          src={m.url}
                          className="aspect-square w-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.url}
                          alt={m.alt_text || m.filename}
                          className="aspect-square w-full object-cover"
                        />
                      )}
                      {idx >= 0 && (
                        <span className="absolute right-1 top-1 bg-cherry-600 px-1.5 text-[10px] font-bold text-vanilla-50">
                          #{idx + 1}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {message && <p className="text-sm text-ink">{message}</p>}
        {error && <p className="text-sm text-cherry-700">{error}</p>}
        <Button type="button" variant="primary" loading={saving} onClick={save}>
          Save page
        </Button>
      </section>
    </div>
  )
}
